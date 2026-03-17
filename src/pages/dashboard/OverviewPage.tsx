import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, Send, Download, ArrowLeftRight, DollarSign,
  TrendingUp, Clock, ArrowUpRight, Coins, Copy, Check, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WalletInfo {
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

const quickActions = [
  { icon: Send, label: 'Send', color: '#9945FF' },
  { icon: Download, label: 'Receive', color: '#14F195' },
  { icon: ArrowLeftRight, label: 'Swap', color: '#00C2FF' },
  { icon: DollarSign, label: 'Off-ramp', color: '#FF6B6B' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const OverviewPage = () => {
  const { token, user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      setError('Failed to load data. Please try again.');
    } finally {
      setLoadingWallet(false);
    }
  }, [token, user?.networkMode]);

  useEffect(() => {
    setLoadingWallet(true);
    setWallet(null);
    setPrices(null);
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

  const handleCopyAddress = async () => {
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
  const truncatedAddress = wallet
    ? `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`
    : '';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Welcome back, @{user?.username || 'user'}
          {isTestnet && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Testnet
            </span>
          )}
        </p>
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

      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#7B2FE0] p-6 lg:p-8 mb-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#14F195] rounded-full blur-[100px] opacity-15 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Wallet className="w-4 h-4" />
              Total Balance
              {isTestnet && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-200 uppercase">
                  Testnet
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {wallet && (
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 transition-colors"
                >
                  <span className="text-white/80 text-xs font-mono">{truncatedAddress}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-[#14F195]" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/60" />
                  )}
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-white/70 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            {loadingWallet ? (
              <div className="h-12 w-48 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <>
                <span className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  ${totalUsd.toFixed(2)}
                </span>
                <span className="text-white/50 text-lg">USD</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Coins className="w-4 h-4" />
              {solBalance.toFixed(4)} SOL
              {prices && <span className="text-white/40">(${solUsd.toFixed(2)})</span>}
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <DollarSign className="w-4 h-4" />
              {usdcBalance.toFixed(2)} USDC
              {prices && <span className="text-white/40">(${usdcUsd.toFixed(2)})</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <TrendingUp className="w-4 h-4 text-[#14F195]" />
              Income
            </div>
            <span className="text-xs text-gray-500">This month</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">$0.00</span>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <ArrowUpRight className="w-4 h-4 text-[#FF6B6B]" />
              Spending
            </div>
            <span className="text-xs text-gray-500">This month</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">$0.00</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Recent Activity</h2>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">No transactions yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Your recent activity will appear here once you start using SendlyFi.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
