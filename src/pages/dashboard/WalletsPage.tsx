import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, Copy, Check, RefreshCw, ExternalLink, Coins, DollarSign, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WalletData {
  hasWallet: boolean;
  publicKey: string;
  network: string;
  networkMode: string;
  createdAt: string;
  balances: {
    sol: number;
    usdc: number;
  };
}

interface Prices {
  sol: number;
  usdc: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const WalletsPage = () => {
  const { token, user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [walletRes, pricesRes] = await Promise.all([
        fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/prices', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!walletRes.ok) throw new Error('Failed to fetch wallet');
      const walletData = await walletRes.json();
      if (walletData.hasWallet) setWallet(walletData);
      if (pricesRes.ok) {
        const pricesData = await pricesRes.json();
        if (pricesData.sol !== undefined) setPrices(pricesData);
      }
    } catch {
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.networkMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const networkMode = user?.networkMode || 'devnet';
  const isTestnet = networkMode === 'devnet';
  const solBalance = wallet?.balances.sol ?? 0;
  const usdcBalance = wallet?.balances.usdc ?? 0;
  const solUsd = prices ? solBalance * prices.sol : 0;
  const usdcUsd = prices ? usdcBalance * prices.usdc : 0;
  const totalUsd = solUsd + usdcUsd;

  const explorerBase = 'https://explorer.solana.com/address/';
  const explorerSuffix = isTestnet ? '?cluster=devnet' : '';

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] mx-auto"
    >
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Wallets</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your Solana wallet and view balances</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={item} className="mb-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#9945FF]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Solana Wallet</h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isTestnet
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isTestnet ? 'Devnet (Testnet)' : 'Mainnet'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">Copy Address</span>
                </>
              )}
            </button>
            {wallet && (
              <a
                href={`${explorerBase}${wallet.publicKey}${explorerSuffix}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-sm text-gray-600"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Explorer
              </a>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <span className="text-xs text-gray-500 block mb-1">Wallet Address</span>
          <span className="font-mono text-sm text-gray-800 break-all">{wallet?.publicKey || '—'}</span>
        </div>

        <div className="text-center py-4">
          <span className="text-3xl font-bold text-gray-900">${totalUsd.toFixed(2)}</span>
          <span className="text-gray-500 text-sm ml-2">USD Total</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9945FF]/10 to-[#9945FF]/20 flex items-center justify-center">
              <Coins className="w-4.5 h-4.5 text-[#9945FF]" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">SOL</span>
              <span className="text-xs text-gray-400 ml-2">Solana</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{solBalance.toFixed(4)}</span>
            <span className="text-sm text-gray-500">${solUsd.toFixed(2)}</span>
          </div>
          {prices && (
            <span className="text-xs text-gray-400 mt-1 block">1 SOL = ${prices.sol.toFixed(2)}</span>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14F195]/10 to-[#14F195]/20 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 text-[#0DAA6D]" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">USDC</span>
              <span className="text-xs text-gray-400 ml-2">USD Coin</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{usdcBalance.toFixed(2)}</span>
            <span className="text-sm text-gray-500">${usdcUsd.toFixed(2)}</span>
          </div>
          {prices && (
            <span className="text-xs text-gray-400 mt-1 block">1 USDC = ${prices.usdc.toFixed(4)}</span>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Wallet Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Blockchain</span>
            <span className="text-gray-900 font-medium">Solana</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Network</span>
            <span className={`font-medium ${isTestnet ? 'text-amber-600' : 'text-green-600'}`}>
              {isTestnet ? 'Devnet (Testnet)' : 'Mainnet Beta'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span className="text-gray-900 font-medium">
              {wallet?.createdAt ? new Date(wallet.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
