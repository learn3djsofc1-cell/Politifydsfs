import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import pool from '../db.js';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || '',
  httpOptions: {
    apiVersion: '',
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || '',
  },
});

router.post('/parse-intent', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user!.userId;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (message.length > 500) {
      res.json({ type: 'text' });
      return;
    }

    const prompt = `You are a production-grade payment intent parser for a crypto chat banking app (SendlyFi). Analyze the user's message and determine if they want to send/transfer/pay cryptocurrency.

SUPPORTED TOKENS: SOL (also "solana", "sol"), USDC (also "usdc", "usd coin")

PAYMENT KEYWORDS: send, transfer, pay, give, tip, forward, deposit, wire

LANGUAGE RULE: Only recognize English payment commands. If the message is not in English, treat it as plain text (type "text"). Do not parse non-English messages as payment intents.

RULES:
1. If the message contains a payment intent, extract ALL payment items. A single message can contain MULTIPLE tokens (e.g., "send 100 USDC and 1 SOL" = two items).
2. For each payment item, extract: amount (number) and token (SOL or USDC).
3. If a user says "send all", "send my balance", "send everything" for a token, set send_all=true for that item and amount=0.
4. If no specific token is mentioned with "send all/everything", assume BOTH SOL and USDC with send_all=true.
5. If no token is specified for a specific amount, default to USDC.
6. Extract @username mentions as the recipient (e.g., "@test12345" -> recipient="test12345"). Only extract the FIRST @mention.
7. Ignore conversational noise, politeness phrases, questions marks. Focus on intent.
8. If there is NO payment intent at all (casual conversation, greetings, questions about balance, etc.), return type "text".
9. If a payment keyword exists but no amount AND no "send all" intent, return type "text".

RESPOND WITH ONLY VALID JSON in one of these formats:

For payment intent (single or multiple items):
{"type":"payment","items":[{"amount":<number>,"token":"SOL|USDC","send_all":false}],"recipient":null}
{"type":"payment","items":[{"amount":100,"token":"USDC","send_all":false},{"amount":1,"token":"SOL","send_all":false}],"recipient":"username"}
{"type":"payment","items":[{"amount":0,"token":"SOL","send_all":true}],"recipient":null}

For non-payment:
{"type":"text"}

EXAMPLES:
"send 100 usdc" -> {"type":"payment","items":[{"amount":100,"token":"USDC","send_all":false}],"recipient":null}
"send 100 usdc and 1 sol to @alice" -> {"type":"payment","items":[{"amount":100,"token":"USDC","send_all":false},{"amount":1,"token":"SOL","send_all":false}],"recipient":"alice"}
"send all my sol" -> {"type":"payment","items":[{"amount":0,"token":"SOL","send_all":true}],"recipient":null}
"send everything" -> {"type":"payment","items":[{"amount":0,"token":"SOL","send_all":true},{"amount":0,"token":"USDC","send_all":true}],"recipient":null}
"please transfer 20 usdc" -> {"type":"payment","items":[{"amount":20,"token":"USDC","send_all":false}],"recipient":null}
"how are you?" -> {"type":"text"}
"what's my balance?" -> {"type":"text"}
"pay 10 usdc and 0.5 sol" -> {"type":"payment","items":[{"amount":10,"token":"USDC","send_all":false},{"amount":0.5,"token":"SOL","send_all":false}],"recipient":null}
"i need you sending my balance 100 usdc and 1 solana to @test12345" -> {"type":"payment","items":[{"amount":100,"token":"USDC","send_all":false},{"amount":1,"token":"SOL","send_all":false}],"recipient":"test12345"}
"wire 10 sol to @alice" -> {"type":"payment","items":[{"amount":10,"token":"SOL","send_all":false}],"recipient":"alice"}
"envoyer 50 usdc" -> {"type":"text"}
"senden 10 sol" -> {"type":"text"}

User message: "${message.replace(/"/g, '\\"')}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0,
      },
    });

    const text = (response.text || '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.type === 'payment' && Array.isArray(parsed.items) && parsed.items.length > 0) {
        const validItems: Array<{ amount: number; token: 'SOL' | 'USDC'; send_all: boolean }> = [];
        
        for (const item of parsed.items) {
          const tokenVal = (item.token || '').toUpperCase() === 'SOL' ? 'SOL' as const : 'USDC' as const;
          const sendAll = item.send_all === true;
          const amount = typeof item.amount === 'number' ? item.amount : 0;
          
          if (sendAll || amount > 0) {
            validItems.push({ amount, token: tokenVal, send_all: sendAll });
          }
        }

        if (validItems.length === 0) {
          res.json({ type: 'text' });
          return;
        }

        for (const paymentItem of validItems) {
          if (paymentItem.send_all) {
            try {
              const userResult = await pool.query(
                'SELECT network_mode FROM users WHERE id = $1',
                [userId]
              );
              const networkMode = userResult.rows[0]?.network_mode || 'devnet';

              if (networkMode === 'devnet') {
                const balResult = await pool.query(
                  'SELECT sol_balance, usdc_balance FROM testnet_balances WHERE user_id = $1',
                  [userId]
                );
                if (balResult.rows.length > 0) {
                  const row = balResult.rows[0];
                  if (paymentItem.token === 'SOL') {
                    const SOL_FEE_BUFFER = 0.01;
                    paymentItem.amount = Math.max(0, parseFloat(row.sol_balance) - SOL_FEE_BUFFER);
                  } else {
                    paymentItem.amount = parseFloat(row.usdc_balance);
                  }
                }
              } else {
                const walletResult = await pool.query(
                  'SELECT public_key FROM wallets WHERE user_id = $1',
                  [userId]
                );
                if (walletResult.rows.length > 0) {
                  const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
                  const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
                  const rpcUrl = HELIUS_API_KEY
                    ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
                    : 'https://api.mainnet-beta.solana.com';
                  const connection = new Connection(rpcUrl, 'confirmed');
                  const pubkey = new PublicKey(walletResult.rows[0].public_key);

                  if (paymentItem.token === 'SOL') {
                    const lamports = await connection.getBalance(pubkey);
                    const SOL_FEE_BUFFER = 0.01;
                    paymentItem.amount = Math.max(0, (lamports / LAMPORTS_PER_SOL) - SOL_FEE_BUFFER);
                  } else {
                    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
                    const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                    try {
                      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
                        mint: USDC_MINT,
                      });
                      let usdcBalance = 0;
                      for (const acct of tokenAccounts.value) {
                        usdcBalance += acct.account.data.parsed.info.tokenAmount.uiAmount || 0;
                      }
                      paymentItem.amount = usdcBalance;
                    } catch {
                      paymentItem.amount = 0;
                    }
                  }
                }
              }

              if (paymentItem.amount <= 0) {
                paymentItem.amount = 0;
              }
            } catch (balErr) {
              console.error('Balance fetch error for send_all:', balErr);
              paymentItem.amount = 0;
            }
          }
        }

        const finalItems = validItems.filter(i => i.amount > 0);
        if (finalItems.length === 0) {
          res.json({ type: 'payment_error', error: 'Your balance is zero for the requested token(s)' });
          return;
        }

        let recipient: { userId: number; username: string } | null = null;
        if (parsed.recipient && typeof parsed.recipient === 'string') {
          const username = parsed.recipient.replace(/^@/, '');
          try {
            const userLookup = await pool.query(
              'SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)',
              [username]
            );
            if (userLookup.rows.length > 0) {
              recipient = {
                userId: userLookup.rows[0].id,
                username: userLookup.rows[0].username,
              };
            } else {
              res.json({ type: 'payment_error', error: `User @${username} not found` });
              return;
            }
          } catch (lookupErr) {
            console.error('Username lookup error:', lookupErr);
            res.json({ type: 'payment_error', error: `Failed to look up user @${username}` });
            return;
          }
        }

        res.json({
          type: 'payment',
          items: finalItems.map(i => ({ amount: i.amount, token: i.token })),
          recipient,
        });
        return;
      }
    }
    
    res.json({ type: 'text' });
  } catch (err) {
    console.error('Parse intent error:', err);
    res.json({ type: 'text' });
  }
});

router.get('/conversations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT c.id, c.user1_id, c.user2_id, c.updated_at,
        CASE WHEN c.user1_id = $1 THEN u2.username ELSE u1.username END AS other_username,
        CASE WHEN c.user1_id = $1 THEN u2.id ELSE u1.id END AS other_user_id,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT message_type FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_type,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.updated_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

router.post('/conversations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { otherUserId } = req.body;

    if (!otherUserId || typeof otherUserId !== 'number') {
      res.status(400).json({ error: 'otherUserId is required' });
      return;
    }

    if (otherUserId === userId) {
      res.status(400).json({ error: 'Cannot create conversation with yourself' });
      return;
    }

    const otherUser = await pool.query('SELECT id FROM users WHERE id = $1', [otherUserId]);
    if (otherUser.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const u1 = Math.min(userId, otherUserId);
    const u2 = Math.max(userId, otherUserId);

    const existing = await pool.query(
      'SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2',
      [u1, u2]
    );

    if (existing.rows.length > 0) {
      res.json({ id: existing.rows[0].id, created: false });
      return;
    }

    const result = await pool.query(
      'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
      [u1, u2]
    );

    res.status(201).json({ id: result.rows[0].id, created: true });
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/conversations/:id/messages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    const conv = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [conversationId, userId]
    );
    if (conv.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const before = req.query.before ? parseInt(req.query.before as string) : null;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    let query: string;
    let params: (number | string)[];

    if (before) {
      query = `SELECT m.id, m.sender_id, m.content, m.message_type, m.transaction_id, m.created_at,
        u.username AS sender_username,
        t.amount, t.token, t.tx_signature, t.network, t.status AS tx_status, t.receiver_id AS tx_receiver_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN transactions t ON m.transaction_id = t.id
      WHERE m.conversation_id = $1 AND m.id < $2
      ORDER BY m.created_at DESC
      LIMIT $3`;
      params = [conversationId, before, limit];
    } else {
      query = `SELECT m.id, m.sender_id, m.content, m.message_type, m.transaction_id, m.created_at,
        u.username AS sender_username,
        t.amount, t.token, t.tx_signature, t.network, t.status AS tx_status, t.receiver_id AS tx_receiver_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN transactions t ON m.transaction_id = t.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2`;
      params = [conversationId, limit];
    }

    const result = await pool.query(query, params);
    res.json(result.rows.reverse());
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

router.post('/conversations/:id/messages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversationId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({ error: 'Message too long (max 2000 chars)' });
      return;
    }

    const conv = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [conversationId, userId]
    );
    if (conv.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, message_type)
       VALUES ($1, $2, $3, 'text')
       RETURNING id, sender_id, content, message_type, created_at`,
      [conversationId, userId, content.trim()]
    );

    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    const msg = result.rows[0];
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    res.status(201).json({
      ...msg,
      sender_username: userResult.rows[0].username,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
