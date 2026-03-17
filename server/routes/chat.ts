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

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (message.length > 500) {
      res.json({ type: 'text' });
      return;
    }

    const prompt = `You are a payment intent parser for a crypto chat banking app. Analyze the user's message and determine if they want to send a payment.

RULES:
- If the message is a payment intent (send, transfer, pay, kirim, bayar, etc), extract the amount and token (SOL or USDC).
- If no token is specified, default to USDC.
- If no amount is specified, return type "text".
- Only return valid JSON, nothing else.

RESPOND WITH EXACTLY ONE OF:
{"type":"payment","amount":<number>,"token":"SOL"} 
{"type":"payment","amount":<number>,"token":"USDC"}
{"type":"text"}

User message: "${message.replace(/"/g, '\\"')}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0,
      },
    });

    const text = (response.text || '').trim();
    const jsonMatch = text.match(/\{[^}]+\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.type === 'payment' && typeof parsed.amount === 'number' && parsed.amount > 0) {
        const token = parsed.token === 'SOL' ? 'SOL' : 'USDC';
        res.json({ type: 'payment', amount: parsed.amount, token });
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
