import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, Send, Download, ArrowLeftRight, DollarSign,
  TrendingUp, Clock, ArrowUpRight, Coins, Copy, Check, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WalletInfo {
  hasWallet: boolean;
  publicKey: string;
  network: string;
  createdAt: string;
  balances: {
    sol: number;
    usdc: number;
  };
}

const quickActions = [
  { icon: Send, label: 'Send', chipClass: 'sf-icon-chip-purple' },
  { icon: Download, label: 'Receive', chipClass: 'sf-icon-chip-green' },
  { icon: ArrowLeftRight, label: 'Swap', chipClass: 'sf-icon-chip-blue' },
  { icon: DollarSign, label: 'Off-ramp', chipClass: 'sf-icon-chip-red' },
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
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.hasWallet) {
        setWallet(data);
      }
    } catch {
    } finally {
      setLoadingWallet(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  };

  const handleCopyAddress = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const solBalance = wallet?.balances.sol ?? 0;
  const usdcBalance = wallet?.balances.usdc ?? 0;
  const truncatedAddress = wallet
    ? `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`
    : '';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] mx-auto"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to SendlyFi</p>
      </motion.div>

      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, #9945FF 0%, #7B2FE0 40%, #5A1DB5 100%)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#14F195] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Wallet className="w-4 h-4" />
              Total Balance
            </div>
            <div className="flex items-center gap-2">
              {wallet && (
                <button
                  onClick={handleCopyAddress}
                  aria-label="Copy wallet address"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-all duration-200"
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
                aria-label="Refresh balance"
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
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
                  ${usdcBalance.toFixed(2)}
                </span>
                <span className="text-white/50 text-lg">USD</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Coins className="w-4 h-4" />
              {solBalance.toFixed(4)} SOL
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <DollarSign className="w-4 h-4" />
              {usdcBalance.toFixed(2)} USDC
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h2 className="sf-section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="sf-card flex flex-col items-center gap-3 p-5 hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className={`sf-icon-chip ${action.chipClass} group-hover:scale-110`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="sf-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="sf-icon-chip sf-icon-chip-green" style={{ width: 24, height: 24, borderRadius: 8 }}>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              Income
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">This month</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">$0.00</span>
        </div>
        <div className="sf-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="sf-icon-chip sf-icon-chip-red" style={{ width: 24, height: 24, borderRadius: 8 }}>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              Spending
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">This month</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">$0.00</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="sf-section-title mb-0">Recent Activity</h2>
        </div>
        <div className="sf-card overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">No transactions yet</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Your recent activity will appear here once you start using SendlyFi.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
