import { Router, Response } from 'express';
import pool from '../db.js';
import { requireAuth, AuthRequest } from '../middleware.js';
import crypto from 'crypto';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { JWT_SECRET } from '../auth.js';

const router = Router();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const CARD_ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY || JWT_SECRET;

function getHeliusRpcUrl(): string {
  if (HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }
  return 'https://api.mainnet-beta.solana.com';
}

function encryptCardData(data: string): string {
  const key = crypto.createHash('sha256').update(CARD_ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted].join(':');
}

function decryptCardData(encryptedData: string): string {
  if (!encryptedData || encryptedData === '') return '';
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const key = crypto.createHash('sha256').update(CARD_ENCRYPTION_KEY).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function luhnChecksum(partial: string): string {
  const digits = partial.split('').map(Number);
  let sum = 0;
  let isEven = true;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

function generateCardNumber(cardType: 'visa' | 'mastercard'): string {
  let prefix: string;
  if (cardType === 'visa') {
    prefix = '4';
  } else {
    const mcPrefixes = ['51', '52', '53', '54', '55'];
    prefix = mcPrefixes[crypto.randomInt(0, mcPrefixes.length)];
  }

  const totalLength = 16;
  const remainingLength = totalLength - prefix.length - 1;
  let body = prefix;
  for (let i = 0; i < remainingLength; i++) {
    body += crypto.randomInt(0, 10).toString();
  }
  const check = luhnChecksum(body);
  return body + check;
}

function generateCVV(): string {
  return crypto.randomInt(100, 1000).toString();
}

async function fetchWalletBalances(publicKey: string): Promise<{ sol: number; usdc: number }> {
  try {
    const rpcUrl = getHeliusRpcUrl();
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(publicKey);

    const lamports = await connection.getBalance(pubkey);
    const solBalance = lamports / LAMPORTS_PER_SOL;

    let usdcBalance = 0;
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        mint: new PublicKey(USDC_MINT_MAINNET),
      });
      for (const acct of tokenAccounts.value) {
        usdcBalance += acct.account.data.parsed.info.tokenAmount.uiAmount || 0;
      }
    } catch {
      usdcBalance = 0;
    }

    return { sol: solBalance, usdc: usdcBalance };
  } catch (err) {
    console.error('Balance fetch error:', err);
    return { sol: 0, usdc: 0 };
  }
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

    const userResult = await pool.query(
      'SELECT network_mode FROM users WHERE id = $1',
      [userId]
    );
    const networkMode = userResult.rows[0]?.network_mode || 'devnet';

    let balances = { sol: 0, usdc: 0 };
    if (networkMode === 'mainnet-beta' && result.rows.length > 0) {
      const walletResult = await pool.query(
        'SELECT public_key FROM wallets WHERE user_id = $1',
        [userId]
      );
      if (walletResult.rows.length > 0) {
        balances = await fetchWalletBalances(walletResult.rows[0].public_key);
      }
    }

    res.json({ cards: result.rows, networkMode, balances });
  } catch (err) {
    console.error('Get cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.get('/:id/details', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card ID' });
      return;
    }

    const result = await pool.query(
      `SELECT id, card_type, card_number_encrypted, cvv_encrypted,
              card_number_last4, cardholder_name, expiry_month, expiry_year, status
       FROM cards WHERE id = $1 AND user_id = $2`,
      [cardId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    const card = result.rows[0];

    if (card.status === 'frozen') {
      res.status(403).json({ error: 'Cannot view details of a frozen card' });
      return;
    }

    let fullNumber = '';
    let cvv = '';

    try {
      fullNumber = decryptCardData(card.card_number_encrypted);
      cvv = decryptCardData(card.cvv_encrypted);
    } catch {
      fullNumber = `****${card.card_number_last4}`;
      cvv = '***';
    }

    res.json({
      cardNumber: fullNumber,
      cvv,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cardholderName: card.cardholder_name,
    });
  } catch (err) {
    console.error('Get card details error:', err);
    res.status(500).json({ error: 'Failed to get card details' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { cardType, cardholderName } = req.body;

    if (!cardType || !['visa', 'mastercard'].includes(cardType)) {
      res.status(400).json({ error: 'Card type must be visa or mastercard' });
      return;
    }

    const userResult = await pool.query(
      'SELECT username, network_mode FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const networkMode = userResult.rows[0].network_mode;
    if (networkMode !== 'mainnet-beta') {
      res.status(403).json({ error: 'Card creation is only available on Mainnet. Please switch to Mainnet in Settings.' });
      return;
    }

    const walletResult = await pool.query(
      'SELECT id FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (walletResult.rows.length === 0) {
      res.status(400).json({ error: 'You need a wallet before creating a card' });
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

    let name = cardholderName?.trim();
    if (!name || name.length === 0) {
      name = userResult.rows[0].username;
    }
    if (name.length > 50) {
      name = name.substring(0, 50);
    }
    name = name.toUpperCase();

    const fullNumber = generateCardNumber(cardType as 'visa' | 'mastercard');
    const last4 = fullNumber.slice(-4);
    const cvv = generateCVV();

    const encryptedNumber = encryptCardData(fullNumber);
    const encryptedCVV = encryptCardData(cvv);

    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    const result = await pool.query(
      `INSERT INTO cards (user_id, card_type, card_number_last4, card_number_encrypted, cvv_encrypted, cardholder_name, expiry_month, expiry_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, card_type, card_number_last4, cardholder_name, expiry_month, expiry_year, status, created_at`,
      [userId, cardType, last4, encryptedNumber, encryptedCVV, name, expiryMonth, expiryYear]
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
