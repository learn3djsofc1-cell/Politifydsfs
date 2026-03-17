import { Router, Response } from 'express';
import pool from '../db.js';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

router.get('/search', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      res.status(400).json({ error: 'Search query is required (min 1 character)' });
      return;
    }

    const query = q.trim().toLowerCase();

    if (query.length > 20) {
      res.status(400).json({ error: 'Search query too long' });
      return;
    }

    const result = await pool.query(
      `SELECT u.id, u.username, w.public_key
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id
       WHERE u.username LIKE $1 AND u.id != $2
       ORDER BY u.username ASC
       LIMIT 20`,
      [`${query}%`, req.user!.userId]
    );

    res.json({
      users: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        publicKey: row.public_key || null,
      })),
    });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/network-mode', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT network_mode FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ networkMode: result.rows[0].network_mode });
  } catch (err) {
    console.error('Get network mode error:', err);
    res.status(500).json({ error: 'Failed to get network mode' });
  }
});

router.put('/network-mode', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { networkMode } = req.body;

    if (!networkMode || !['devnet', 'mainnet-beta'].includes(networkMode)) {
      res.status(400).json({ error: 'networkMode must be "devnet" or "mainnet-beta"' });
      return;
    }

    await pool.query(
      'UPDATE users SET network_mode = $1 WHERE id = $2',
      [networkMode, req.user!.userId]
    );

    res.json({ networkMode });
  } catch (err) {
    console.error('Update network mode error:', err);
    res.status(500).json({ error: 'Failed to update network mode' });
  }
});

router.put('/username', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const trimmed = username.trim();

    if (trimmed.length < 2 || trimmed.length > 20) {
      res.status(400).json({ error: 'Username must be 2-20 characters' });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
      return;
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [trimmed, req.user!.userId]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }

    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, zkid, username, network_mode, created_at',
      [trimmed, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      zkid: user.zkid,
      username: user.username,
      networkMode: user.network_mode,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Update username error:', err);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

export default router;
