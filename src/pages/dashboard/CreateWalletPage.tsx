import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, Copy, Check, ArrowRight, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const CreateWalletPage = () => {
  const { token, refreshUser } = useAuth();
  const navigate = useNavigate();
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
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0B0B1A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B1A] via-[#1A1035] to-[#0B0B1A]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#14F195]/15 blur-[150px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/15 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#14F195]/30 via-white/5 to-white/0 pointer-events-none" />
            <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl p-8 border border-white/[0.08] shadow-[0_8px_60px_-12px_rgba(20,241,149,0.2)]">
              <div className="text-center mb-6">
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#14F195]/20 to-[#0DAA6D]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-4px_rgba(20,241,149,0.3)] border border-[#14F195]/20">
                  <Wallet className="w-9 h-9 text-[#14F195]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Wallet Created</h1>
                <p className="text-white/50 text-sm">Your Solana wallet is ready</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Public Key</label>
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 flex items-center gap-2 hover:bg-white/[0.06] transition-colors">
                    <code className="text-xs text-white/70 font-mono flex-1 break-all">{walletData.publicKey}</code>
                    <button
                      onClick={() => handleCopy(walletData.publicKey, 'public')}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white/30 hover:text-white/60"
                    >
                      {copied === 'public' ? <Check className="w-4 h-4 text-[#14F195]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Private Key (Secret)</label>
                  <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3.5 flex items-center gap-2 hover:bg-red-500/[0.08] transition-colors">
                    <code className="text-xs text-red-400/80 font-mono flex-1 break-all">{walletData.secretKey}</code>
                    <button
                      onClick={() => handleCopy(walletData.secretKey, 'secret')}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-500/[0.08] transition-colors text-red-400/40 hover:text-red-400/70"
                    >
                      {copied === 'secret' ? <Check className="w-4 h-4 text-[#14F195]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-amber-400 text-sm font-medium mb-2">Save your private key now</p>
                <ul className="text-amber-400/60 text-xs space-y-1">
                  <li>This key will only be shown once and cannot be retrieved later</li>
                  <li>Store it securely in a password manager</li>
                  <li>You can import this key into Phantom wallet to access your funds</li>
                  <li>Never share your private key with anyone</li>
                </ul>
              </div>

              <div className="bg-[#9945FF]/[0.06] border border-[#9945FF]/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#9945FF]" />
                  <p className="text-[#9945FF] text-sm font-medium">Phantom Compatible</p>
                </div>
                <p className="text-white/40 text-xs">
                  Open Phantom &rarr; Add/Connect Wallet &rarr; Import Private Key &rarr; Paste your secret key above.
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white font-semibold hover:shadow-[0_0_30px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0B0B1A]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B1A] via-[#1A1035] to-[#0B0B1A]" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#9945FF]/20 blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#14F195]/15 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/0 pointer-events-none" />
          <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl p-8 border border-white/[0.08] shadow-[0_8px_60px_-12px_rgba(153,69,255,0.25)]">
            <div className="text-center mb-6">
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#9945FF]/20 to-[#9945FF]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-4px_rgba(153,69,255,0.3)] border border-[#9945FF]/20">
                <Wallet className="w-9 h-9 text-[#9945FF]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Create Your Wallet</h1>
              <p className="text-white/50 text-sm">
                Generate a Solana wallet to start using SendlyFi. Enter your password to encrypt and secure your wallet.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Account Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#9945FF] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#9945FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_-4px_rgba(153,69,255,0.3)] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-1.5">Your password encrypts the wallet's private key for secure storage</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white font-semibold hover:shadow-[0_0_30px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
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
        </div>
      </motion.div>
    </div>
  );
};
