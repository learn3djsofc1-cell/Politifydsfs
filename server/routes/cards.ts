import { Router, Response } from 'express';
import pool from '../db.js';
import { requireAuth, AuthRequest } from '../middleware.js';
import crypto from 'crypto';

const router = Router();

const DELETION_COOLDOWN_DAYS = 7;

function generateLast4(): string {
  return crypto.randomInt(1000, 10000).toString();
}

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await pool.query(
      `DELETE FROM cards
       WHERE user_id = $1
         AND status = 'pending_deletion'
         AND deletion_requested_at <= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const result = await pool.query(
      `SELECT id, card_type, card_number_last4, cardholder_name,
              expiry_month, expiry_year, status, previous_status,
              deletion_requested_at, created_at
       FROM cards
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );

    res.json({ cards: result.rows });
  } catch (err) {
    console.error('Get cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { cardType } = req.body;

    if (!cardType || !['visa', 'mastercard'].includes(cardType)) {
      res.status(400).json({ error: 'Card type must be visa or mastercard' });
      return;
    }

    const existing = await pool.query(
      `SELECT id FROM cards WHERE user_id = $1 AND card_type = $2`,
      [userId, cardType]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ error: `You already have a ${cardType === 'visa' ? 'Visa' : 'Mastercard'} card` });
      return;
    }

    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const cardholderName = userResult.rows[0].username.toUpperCase();
    const last4 = generateLast4();
    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    const result = await pool.query(
      `INSERT INTO cards (user_id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year, status, created_at`,
      [userId, cardType, last4, cardholderName, expiryMonth, expiryYear]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      res.status(409).json({ error: 'You already have this card type' });
      return;
    }
    console.error('Create card error:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

router.patch('/:id/freeze', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card ID' });
      return;
    }

    const card = await pool.query(
      'SELECT id, status FROM cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    const currentStatus = card.rows[0].status;
    if (currentStatus === 'pending_deletion') {
      res.status(400).json({ error: 'Cannot freeze a card pending deletion' });
      return;
    }

    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';

    const result = await pool.query(
      `UPDATE cards SET status = $1 WHERE id = $2 AND user_id = $3
       RETURNING id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year, status, previous_status, deletion_requested_at, created_at`,
      [newStatus, cardId, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Freeze card error:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card ID' });
      return;
    }

    const card = await pool.query(
      'SELECT id, status FROM cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.rows[0].status === 'pending_deletion') {
      res.status(400).json({ error: 'Card is already pending deletion' });
      return;
    }

    const result = await pool.query(
      `UPDATE cards
       SET status = 'pending_deletion',
           previous_status = status,
           deletion_requested_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year, status, previous_status, deletion_requested_at, created_at`,
      [cardId, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Delete card error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

router.patch('/:id/cancel-deletion', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card ID' });
      return;
    }

    const card = await pool.query(
      'SELECT id, status, previous_status FROM cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.rows[0].status !== 'pending_deletion') {
      res.status(400).json({ error: 'Card is not pending deletion' });
      return;
    }

    const restoreStatus = card.rows[0].previous_status || 'active';

    const result = await pool.query(
      `UPDATE cards
       SET status = $1,
           previous_status = NULL,
           deletion_requested_at = NULL
       WHERE id = $2 AND user_id = $3
       RETURNING id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year, status, previous_status, deletion_requested_at, created_at`,
      [restoreStatus, cardId, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Cancel deletion error:', err);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
});

export default router;
