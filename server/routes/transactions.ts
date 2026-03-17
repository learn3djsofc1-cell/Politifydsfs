import { Router, Response } from 'express';
import {
  Connection, PublicKey, Keypair, Transaction,
  SystemProgram, LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import bs58 from 'bs58';
import pool from '../db.js';
import { decryptPrivateKey, verifyPassword } from '../auth.js';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const USDC_MINT_DEVNET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DECIMALS = 6;

function getHeliusRpcUrl(networkMode: string): string {
  if (HELIUS_API_KEY) {
    if (networkMode === 'mainnet-beta') {
      return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    }
    return `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }
  if (networkMode === 'mainnet-beta') {
    return 'https://api.mainnet-beta.solana.com';
  }
  return 'https://api.devnet.solana.com';
}

function getUsdcMint(networkMode: string): string {
  return networkMode === 'mainnet-beta' ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
}

async function confirmTransactionAsync(transactionId: number, signature: string, networkMode: string) {
  const rpcUrl = getHeliusRpcUrl(networkMode);
  const connection = new Connection(rpcUrl, 'confirmed');
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const status = await connection.getSignatureStatus(signature);
      if (status?.value) {
        if (status.value.err) {
          await pool.query("UPDATE transactions SET status = 'failed' WHERE id = $1", [transactionId]);
          console.log(`Transaction ${transactionId} failed on-chain`);
          return;
        }
        if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
          await pool.query("UPDATE transactions SET status = 'confirmed' WHERE id = $1", [transactionId]);
          console.log(`Transaction ${transactionId} confirmed`);
          return;
        }
      }
    } catch (err) {
      console.error(`Confirmation poll error for tx ${transactionId}:`, err);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  await pool.query("UPDATE transactions SET status = 'failed' WHERE id = $1", [transactionId]);
  console.log(`Transaction ${transactionId} timed out waiting for confirmation`);
}

router.post('/send', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { receiverId, amount, token, password, conversationId } = req.body;

    if (!receiverId || typeof receiverId !== 'number') {
      res.status(400).json({ error: 'Receiver is required' });
      return;
    }
    if (receiverId === userId) {
      res.status(400).json({ error: 'Cannot send to yourself' });
      return;
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    if (!token || !['SOL', 'USDC'].includes(token)) {
      res.status(400).json({ error: 'Token must be SOL or USDC' });
      return;
    }
    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required to sign transaction' });
      return;
    }

    const userResult = await pool.query(
      'SELECT id, password_hash, network_mode FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const validPassword = await verifyPassword(password, userResult.rows[0].password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const networkMode = userResult.rows[0].network_mode;

    const senderWallet = await pool.query(
      'SELECT public_key, encrypted_private_key FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (senderWallet.rows.length === 0) {
      res.status(400).json({ error: 'Sender has no wallet' });
      return;
    }

    const receiverWallet = await pool.query(
      'SELECT public_key FROM wallets WHERE user_id = $1',
      [receiverId]
    );
    if (receiverWallet.rows.length === 0) {
      res.status(400).json({ error: 'Receiver has no wallet' });
      return;
    }

    let secretKey: string;
    try {
      secretKey = decryptPrivateKey(senderWallet.rows[0].encrypted_private_key, password);
    } catch {
      res.status(400).json({ error: 'Failed to decrypt wallet key' });
      return;
    }

    const senderKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    const receiverPubkey = new PublicKey(receiverWallet.rows[0].public_key);
    const rpcUrl = getHeliusRpcUrl(networkMode);
    const connection = new Connection(rpcUrl, 'confirmed');

    if (conversationId) {
      const convCheck = await pool.query(
        'SELECT user1_id, user2_id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
        [conversationId, userId]
      );
      if (convCheck.rows.length === 0) {
        res.status(403).json({ error: 'Not authorized to send in this conversation' });
        return;
      }
      const conv = convCheck.rows[0];
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      if (otherUserId !== receiverId) {
        res.status(400).json({ error: 'Receiver must be the other participant in this conversation' });
        return;
      }
    }

    const txRecord = await pool.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, token, network, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id`,
      [userId, receiverId, amount, token, networkMode]
    );
    const transactionId = txRecord.rows[0].id;

    if (conversationId) {
      const messageContent = `Sent ${amount} ${token}`;
      await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content, message_type, transaction_id)
         VALUES ($1, $2, $3, 'payment', $4)`,
        [conversationId, userId, messageContent, transactionId]
      );
      await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
    }

    try {
      let signature: string;

      if (token === 'SOL') {
        const lamports = Math.round(amount * LAMPORTS_PER_SOL);

        const balance = await connection.getBalance(senderKeypair.publicKey);
        if (balance < lamports + 5000) {
          await pool.query(
            "UPDATE transactions SET status = 'failed' WHERE id = $1",
            [transactionId]
          );
          res.status(400).json({ error: 'Insufficient SOL balance', transactionId });
          return;
        }

        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: receiverPubkey,
            lamports,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.feePayer = senderKeypair.publicKey;
        tx.sign(senderKeypair);
        signature = await connection.sendRawTransaction(tx.serialize());
      } else {
        const usdcMint = new PublicKey(getUsdcMint(networkMode));
        const rawAmount = BigInt(Math.round(amount * Math.pow(10, USDC_DECIMALS)));

        const senderATA = await getAssociatedTokenAddress(usdcMint, senderKeypair.publicKey);
        let senderTokenBalance = BigInt(0);
        try {
          const accountInfo = await connection.getTokenAccountBalance(senderATA);
          senderTokenBalance = BigInt(accountInfo.value.amount);
        } catch {
          await pool.query("UPDATE transactions SET status = 'failed' WHERE id = $1", [transactionId]);
          res.status(400).json({ error: 'No USDC token account found', transactionId });
          return;
        }

        if (senderTokenBalance < rawAmount) {
          await pool.query("UPDATE transactions SET status = 'failed' WHERE id = $1", [transactionId]);
          res.status(400).json({ error: 'Insufficient USDC balance', transactionId });
          return;
        }

        const receiverATA = await getOrCreateAssociatedTokenAccount(
          connection,
          senderKeypair,
          usdcMint,
          receiverPubkey
        );

        const tx = new Transaction().add(
          createTransferInstruction(
            senderATA,
            receiverATA.address,
            senderKeypair.publicKey,
            rawAmount,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.feePayer = senderKeypair.publicKey;
        tx.sign(senderKeypair);
        signature = await connection.sendRawTransaction(tx.serialize());
      }

      await pool.query(
        "UPDATE transactions SET tx_signature = $1 WHERE id = $2",
        [signature, transactionId]
      );

      confirmTransactionAsync(transactionId, signature, networkMode);

      res.json({
        transactionId,
        signature,
        status: 'pending',
        amount,
        token,
        network: networkMode,
      });
    } catch (txErr: unknown) {
      console.error('Transaction error:', txErr);
      await pool.query(
        "UPDATE transactions SET status = 'failed' WHERE id = $1",
        [transactionId]
      );
      const errMessage = txErr instanceof Error ? txErr.message : 'Transaction failed';
      res.status(500).json({
        error: errMessage,
        transactionId,
      });
    }
  } catch (err) {
    console.error('Send money error:', err);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const txId = parseInt(req.params.id);

    if (isNaN(txId)) {
      res.status(400).json({ error: 'Invalid transaction ID' });
      return;
    }

    const result = await pool.query(
      `SELECT t.*, su.username AS sender_username, ru.username AS receiver_username
       FROM transactions t
       JOIN users su ON t.sender_id = su.id
       JOIN users ru ON t.receiver_id = ru.id
       WHERE t.id = $1 AND (t.sender_id = $2 OR t.receiver_id = $2)`,
      [txId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get transaction error:', err);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

router.post('/airdrop', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const userResult = await pool.query(
      'SELECT network_mode FROM users WHERE id = $1',
      [userId]
    );
    const networkMode = userResult.rows[0]?.network_mode || 'devnet';

    if (networkMode !== 'devnet') {
      res.status(400).json({ error: 'Airdrop is only available on devnet' });
      return;
    }

    const walletResult = await pool.query(
      'SELECT public_key FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (walletResult.rows.length === 0) {
      res.status(400).json({ error: 'No wallet found' });
      return;
    }

    const pubkey = new PublicKey(walletResult.rows[0].public_key);
    const connection = new Connection(getHeliusRpcUrl('devnet'), 'confirmed');

    const signature = await connection.requestAirdrop(pubkey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, 'confirmed');

    res.json({ signature, amount: 1, token: 'SOL' });
  } catch (err: unknown) {
    console.error('Airdrop error:', err);
    const errMessage = err instanceof Error ? err.message : 'Airdrop failed';
    res.status(500).json({ error: errMessage });
  }
});

export default router;
