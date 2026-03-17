import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware.js';

const router = Router();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const IS_DEMO_KEY = COINGECKO_API_KEY.startsWith('CG-');
const COINGECKO_BASE_URL = COINGECKO_API_KEY && !IS_DEMO_KEY
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

interface PriceCache {
  sol: number;
  usdc: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
const CACHE_TTL_MS = 30_000;

async function fetchPricesFromCoinGecko(): Promise<{ sol: number; usdc: number }> {
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL_MS) {
    return { sol: priceCache.sol, usdc: priceCache.usdc };
  }

  const url = `${COINGECKO_BASE_URL}/simple/price?ids=solana,usd-coin&vs_currencies=usd`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (COINGECKO_API_KEY) {
    if (IS_DEMO_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
    } else {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const sol = data?.solana?.usd ?? 0;
  const usdc = data?.['usd-coin']?.usd ?? 1;

  priceCache = { sol, usdc, timestamp: Date.now() };

  return { sol, usdc };
}

router.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const prices = await fetchPricesFromCoinGecko();

    res.json({
      sol: prices.sol,
      usdc: prices.usdc,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Price fetch error:', err);

    if (priceCache) {
      res.json({
        sol: priceCache.sol,
        usdc: priceCache.usdc,
        updatedAt: new Date(priceCache.timestamp).toISOString(),
        stale: true,
      });
      return;
    }

    res.status(502).json({ error: 'Failed to fetch prices' });
  }
});

export default router;
