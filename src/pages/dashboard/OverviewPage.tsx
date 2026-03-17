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
  { icon: Send, label: 'Send', color: '#9945FF', gradient: 'from-[#9945FF]/15 to-[#7B2FE0]/10' },
  { icon: Download, label: 'Receive', color: '#14F195', gradient: 'from-[#14F195]/15 to-[#0DAA6D]/10' },
  { icon: ArrowLeftRight, label: 'Swap', color: '#00C2FF', gradient: 'from-[#00C2FF]/15 to-[#0090B8]/10' },
  { icon: DollarSign, label: 'Off-ramp', color: '#FF6B6B', gradient: 'from-[#FF6B6B]/15 to-[#E04545]/10' },
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
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Welcome to SendlyFi</p>
      </motion.div>

      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8 mb-8 border border-white/[0.08]"
        style={{
          background: 'linear-gradient(135deg, #9945FF 0%, #7B2FE0 40%, #5A1DB5 100%)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#14F195] rounded-full blur-[120px] opacity-[0.12] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-[#00C2FF] rounded-full blur-[100px] opacity-[0.08] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Wallet className="w-4 h-4" />
              Total Balance
            </div>
            <div className="flex items-center gap-2">
              {wallet && (
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm rounded-lg px-3 py-1.5 transition-all duration-200 border border-white/[0.08]"
                >
                  <span className="text-white/70 text-xs font-mono">{truncatedAddress}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-[#14F195]" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/50" />
                  )}
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/[0.08]"
              >
                <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            {loadingWallet ? (
              <div className="h-12 w-48 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <>
                <span className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.15)]">
                  ${usdcBalance.toFixed(2)}
                </span>
                <span className="text-white/40 text-lg">USD</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Coins className="w-4 h-4" />
              {solBalance.toFixed(4)} SOL
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <DollarSign className="w-4 h-4" />
              {usdcBalance.toFixed(2)} USDC
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(153,69,255,0.15)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border border-white/[0.06]`}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <div className="w-6 h-6 rounded-lg bg-[#14F195]/15 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#14F195]" />
              </div>
              Income
            </div>
            <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-md">This month</span>
          </div>
          <span className="text-2xl font-bold text-white">$0.00</span>
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <div className="w-6 h-6 rounded-lg bg-[#FF6B6B]/15 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </div>
              Spending
            </div>
            <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-md">This month</span>
          </div>
          <span className="text-2xl font-bold text-white">$0.00</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Activity</h2>
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-white/25" />
            </div>
            <h3 className="text-white/70 font-medium mb-1">No transactions yet</h3>
            <p className="text-white/35 text-sm max-w-xs">
              Your recent activity will appear here once you start using SendlyFi.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
