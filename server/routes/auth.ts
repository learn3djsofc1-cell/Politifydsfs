import { Router, Response } from 'express';
import pool from '../db.js';
import {
  generateUniqueZKID,
  hashPassword,
  verifyPassword,
  generateToken,
} from '../auth.js';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

router.post('/signup', async (req, res: Response) => {
  try {
    const { password, username } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      res.status(400).json({ error: 'Username must be 3-20 characters' });
      return;
    }

    if (!/^[a-z0-9]+$/.test(trimmedUsername)) {
      res.status(400).json({ error: 'Username can only contain letters and numbers' });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
      return;
    }

    if (!/[0-9]/.test(password)) {
      res.status(400).json({ error: 'Password must contain at least one number' });
      return;
    }

    const existingUsername = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [trimmedUsername]
    );
    if (existingUsername.rows.length > 0) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }

    const zkid = await generateUniqueZKID();
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (zkid, username, password_hash) VALUES ($1, $2, $3) RETURNING id, zkid, username, created_at',
      [zkid, trimmedUsername, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id, zkid: user.zkid });

    res.status(201).json({
      zkid: user.zkid,
      username: user.username,
      token,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { zkid, password } = req.body;

    if (!zkid || !password) {
      res.status(400).json({ error: 'ZKID and password are required' });
      return;
    }

    const zkidUpper = zkid.toUpperCase().trim();

    if (!/^[A-Z2-9]{8}$/.test(zkidUpper)) {
      res.status(400).json({ error: 'Invalid ZKID format' });
      return;
    }

    const result = await pool.query(
      'SELECT id, zkid, username, password_hash, created_at FROM users WHERE zkid = $1',
      [zkidUpper]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid ZKID or password' });
      return;
    }

    const user = result.rows[0];
    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid ZKID or password' });
      return;
    }

    const token = generateToken({ userId: user.id, zkid: user.zkid });

    res.json({
      zkid: user.zkid,
      username: user.username,
      token,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, zkid, username, network_mode, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    const walletResult = await pool.query(
      'SELECT id, public_key, network, created_at FROM wallets WHERE user_id = $1',
      [user.id]
    );

    res.json({
      id: user.id,
      zkid: user.zkid,
      username: user.username,
      networkMode: user.network_mode,
      createdAt: user.created_at,
      wallets: walletResult.rows,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
