import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, Copy, Check, ArrowRight, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const CreateWalletPage = () => {
  const { token, refreshUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && user.wallets.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletData, setWalletData] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [copied, setCopied] = useState<'public' | 'secret' | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create wallet');
      setWalletData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'public' | 'secret') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleContinue = async () => {
    await refreshUser();
    navigate('/dashboard');
  };

  if (walletData) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#14F195]/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-[#0DAA6D]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Wallet Created</h1>
              <p className="text-gray-500 text-sm">Your Solana wallet is ready</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Public Key</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                  <code className="text-xs text-gray-700 font-mono flex-1 break-all">{walletData.publicKey}</code>
                  <button
                    onClick={() => handleCopy(walletData.publicKey, 'public')}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    {copied === 'public' ? <Check className="w-4 h-4 text-[#14F195]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Private Key (Secret)</label>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <code className="text-xs text-red-700 font-mono flex-1 break-all">{walletData.secretKey}</code>
                  <button
                    onClick={() => handleCopy(walletData.secretKey, 'secret')}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 transition-colors text-red-400 hover:text-red-600"
                  >
                    {copied === 'secret' ? <Check className="w-4 h-4 text-[#14F195]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm font-medium mb-2">Save your private key now</p>
              <ul className="text-amber-700 text-xs space-y-1">
                <li>This key will only be shown once and cannot be retrieved later</li>
                <li>Store it securely in a password manager</li>
                <li>You can import this key into Phantom wallet to access your funds</li>
                <li>Never share your private key with anyone</li>
              </ul>
            </div>

            <div className="bg-[#9945FF]/5 border border-[#9945FF]/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#9945FF]" />
                <p className="text-[#9945FF] text-sm font-medium">Phantom Compatible</p>
              </div>
              <p className="text-gray-600 text-xs">
                Open Phantom &rarr; Add/Connect Wallet &rarr; Import Private Key &rarr; Paste your secret key above.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl bg-[#9945FF] text-white font-medium hover:bg-[#8030E0] transition-colors flex items-center justify-center gap-2"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (authLoading || (user && user.wallets.length > 0)) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#9945FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#9945FF]/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#9945FF]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Wallet</h1>
            <p className="text-gray-500 text-sm">
              Generate a Solana wallet to start using SendlyFi. Enter your password to encrypt and secure your wallet.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Your password encrypts the wallet's private key for secure storage</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 rounded-xl bg-[#9945FF] text-white font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Wallet...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Create Solana Wallet
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
