import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Users, Wallet, ArrowRightLeft, Coins,
  DollarSign, Clock, RefreshCw, AlertCircle
} from 'lucide-react';

interface NetworkStats {
  totalAccounts: number;
  totalWallets: number;
  totalTransactions: number;
  totalVolumeSol: number;
  totalVolumeUsdc: number;
  networkUptimeDays: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatVolume(n: number, decimals: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export const NetworkPage = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/network/stats');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data);
      setError('');
    } catch {
      setError('Failed to load network stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statCards = stats ? [
    {
      icon: Users,
      label: 'Total Accounts',
      value: formatNumber(stats.totalAccounts),
      color: '#9945FF',
    },
    {
      icon: Wallet,
      label: 'Wallets Created',
      value: formatNumber(stats.totalWallets),
      color: '#14F195',
    },
    {
      icon: ArrowRightLeft,
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      color: '#00C2FF',
    },
    {
      icon: Coins,
      label: 'Volume (SOL)',
      value: `${formatVolume(stats.totalVolumeSol, 4)} SOL`,
      color: '#9945FF',
    },
    {
      icon: DollarSign,
      label: 'Volume (USDC)',
      value: `${formatVolume(stats.totalVolumeUsdc, 2)} USDC`,
      color: '#14F195',
    },
    {
      icon: Clock,
      label: 'Network Uptime',
      value: `${formatNumber(stats.networkUptimeDays)} days`,
      color: '#00C2FF',
    },
  ] : [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Network</h1>
          <p className="text-gray-600 text-sm mt-1">SendlyFi global network statistics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
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

      <motion.div variants={item} className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#7B2FE0] p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[120px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#14F195] rounded-full blur-[100px] opacity-15 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">SendlyFi Network</h2>
              <p className="text-white/60 text-sm">
                Aggregated platform statistics — privacy-first, numbers only
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={item} className="mt-6">
        <p className="text-center text-gray-400 text-xs">
          Stats refresh automatically every 60 seconds
        </p>
      </motion.div>
    </motion.div>
  );
};
