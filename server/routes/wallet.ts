import { Router, Response } from 'express';
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import pool from '../db.js';
import { encryptPrivateKey, verifyPassword } from '../auth.js';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const USDC_MINT_DEVNET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user!.userId;

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required to encrypt wallet' });
      return;
    }

    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
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

    const existing = await pool.query(
      'SELECT id FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Wallet already exists' });
      return;
    }

    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKeyBase58 = bs58.encode(keypair.secretKey);

    const encryptedKey = encryptPrivateKey(secretKeyBase58, password);

    await pool.query(
      'INSERT INTO wallets (user_id, public_key, encrypted_private_key, network) VALUES ($1, $2, $3, $4)',
      [userId, publicKey, encryptedKey, 'solana']
    );

    res.status(201).json({
      publicKey,
      secretKey: secretKeyBase58,
    });
  } catch (err) {
    console.error('Wallet creation error:', err);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      'SELECT public_key, network, created_at FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ hasWallet: false });
      return;
    }

    const wallet = result.rows[0];
    let solBalance = 0;
    let usdcBalance = 0;

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      const pubkey = new PublicKey(wallet.public_key);

      const lamports = await connection.getBalance(pubkey);
      solBalance = lamports / LAMPORTS_PER_SOL;

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
          mint: new PublicKey(USDC_MINT_DEVNET),
        });
        if (tokenAccounts.value.length > 0) {
          usdcBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
        }
      } catch {
        usdcBalance = 0;
      }
    } catch {
      solBalance = 0;
      usdcBalance = 0;
    }

    res.json({
      hasWallet: true,
      publicKey: wallet.public_key,
      network: wallet.network,
      createdAt: wallet.created_at,
      balances: {
        sol: solBalance,
        usdc: usdcBalance,
      },
    });
  } catch (err) {
    console.error('Get wallet error:', err);
    res.status(500).json({ error: 'Failed to get wallet info' });
  }
});

export default router;
