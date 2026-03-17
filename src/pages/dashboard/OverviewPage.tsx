import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownLeft,
  Clock, Coins, Copy, Check, RefreshCw, AlertCircle,
  Send, Download, CheckCircle2, XCircle, Loader2
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

interface TransactionSummary {
  sent: { sol: number; usdc: number };
  received: { sol: number; usdc: number };
}

interface RecentTransaction {
  id: number;
  direction: 'sent' | 'received';
  counterparty: string;
  amount: number;
  token: string;
  status: string;
  txSignature: string | null;
  network: string;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const OverviewPage = () => {
  const { token, user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTxs, setRecentTxs] = useState<RecentTransaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [walletRes, pricesRes, summaryRes, recentRes] = await Promise.all([
        fetch('/api/wallet', { headers }),
        fetch('/api/prices', { headers }),
        fetch('/api/transactions/summary', { headers }),
        fetch('/api/transactions/recent', { headers }),
      ]);
      if (!walletRes.ok) throw new Error('Failed to fetch wallet');
      const walletData = await walletRes.json();
      if (walletData.hasWallet) setWallet(walletData);
      if (pricesRes.ok) {
        const pricesData = await pricesRes.json();
        if (pricesData.sol !== undefined) setPrices(pricesData);
      }
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      } else {
        console.error('Failed to fetch transaction summary:', summaryRes.status);
      }
      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentTxs(recentData.transactions || []);
      } else {
        console.error('Failed to fetch recent transactions:', recentRes.status);
      }
      if (!summaryRes.ok && !recentRes.ok) {
        setError('Failed to load transaction data. Please try again.');
      }
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoadingWallet(false);
      setLoadingActivity(false);
    }
  }, [token, user?.networkMode]);

  useEffect(() => {
    setLoadingWallet(true);
    setLoadingActivity(true);
    setWallet(null);
    setPrices(null);
    setSummary(null);
    setRecentTxs([]);
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

  const sentUsd = summary && prices
    ? summary.sent.sol * prices.sol + summary.sent.usdc * prices.usdc
    : 0;
  const receivedUsd = summary && prices
    ? summary.received.sol * prices.sol + summary.received.usdc * prices.usdc
    : 0;

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Total Balance</span>
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
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  ${totalUsd.toFixed(2)}
                </span>
                <span className="text-white/50 text-lg">USD</span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Coins className="w-4 h-4 shrink-0" />
              <span>{solBalance.toFixed(4)} SOL</span>
              {prices && <span className="text-white/40">(${solUsd.toFixed(2)})</span>}
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>{usdcBalance.toFixed(2)} USDC</span>
              {prices && <span className="text-white/40">(${usdcUsd.toFixed(2)})</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Send className="w-4 h-4 text-[#FF6B6B]" />
              Sent
            </div>
            <span className="text-xs text-gray-500">This month</span>
          </div>
          {loadingActivity ? (
            <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900">${sentUsd.toFixed(2)}</span>
              {summary && (summary.sent.sol > 0 || summary.sent.usdc > 0) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {summary.sent.sol > 0 && <span>{summary.sent.sol.toFixed(4)} SOL</span>}
                  {summary.sent.usdc > 0 && <span>{summary.sent.usdc.toFixed(2)} USDC</span>}
                </div>
              )}
            </>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Download className="w-4 h-4 text-[#14F195]" />
              Received
            </div>
            <span className="text-xs text-gray-500">This month</span>
          </div>
          {loadingActivity ? (
            <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900">${receivedUsd.toFixed(2)}</span>
              {summary && (summary.received.sol > 0 || summary.received.usdc > 0) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {summary.received.sol > 0 && <span>{summary.received.sol.toFixed(4)} SOL</span>}
                  {summary.received.usdc > 0 && <span>{summary.received.usdc.toFixed(2)} USDC</span>}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Recent Activity</h2>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          {loadingActivity ? (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No transactions yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Your recent activity will appear here once you start using SendlyFi.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTxs.map(tx => {
                const isSent = tx.direction === 'sent';
                return (
                  <div key={tx.id} className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSent ? 'bg-red-50' : 'bg-green-50'
                    }`}>
                      {isSent ? (
                        <ArrowUpRight className="w-5 h-5 text-[#FF6B6B]" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-[#14F195]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {isSent ? 'Sent to' : 'Received from'} @{tx.counterparty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{formatRelativeTime(tx.createdAt)}</span>
                        {tx.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmed
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Pending
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-600">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-semibold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                        {isSent ? '-' : '+'}{tx.amount} {tx.token}
                      </span>
                      {prices && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          ${(tx.amount * (tx.token === 'SOL' ? prices.sol : prices.usdc)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
