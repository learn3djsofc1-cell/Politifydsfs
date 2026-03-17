import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [usersResult, walletsResult, txResult, solVolumeResult, usdcVolumeResult, uptimeResult] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM wallets'),
      pool.query("SELECT COUNT(*) AS count FROM transactions WHERE status = 'confirmed'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE token = 'SOL' AND status = 'confirmed'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE token = 'USDC' AND status = 'confirmed'"),
      pool.query('SELECT MIN(created_at) AS earliest FROM users'),
    ]);

    const earliest = uptimeResult.rows[0].earliest;
    let uptimeDays = 0;
    if (earliest) {
      const diffMs = Date.now() - new Date(earliest).getTime();
      uptimeDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    res.json({
      totalAccounts: parseInt(usersResult.rows[0].count),
      totalWallets: parseInt(walletsResult.rows[0].count),
      totalTransactions: parseInt(txResult.rows[0].count),
      totalVolumeSol: parseFloat(solVolumeResult.rows[0].total),
      totalVolumeUsdc: parseFloat(usdcVolumeResult.rows[0].total),
      networkUptimeDays: uptimeDays,
    });
  } catch (err) {
    console.error('Network stats error:', err);
    res.status(500).json({ error: 'Failed to fetch network stats' });
  }
});

export default router;
