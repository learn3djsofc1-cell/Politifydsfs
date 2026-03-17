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
      <div className="sf-auth-bg">
        <div className="absolute top-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#14F195]/[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/[0.06] blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="sf-auth-card">
            <div className="text-center mb-6">
              <div className="w-[72px] h-[72px] rounded-2xl sf-icon-chip-green mx-auto mb-4" style={{ width: 72, height: 72 }}>
                <Wallet className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Wallet Created</h1>
              <p className="text-gray-500 text-sm">Your Solana wallet is ready</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Public Key</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <code className="text-xs text-gray-700 font-mono flex-1 break-all">{walletData.publicKey}</code>
                  <button
                    onClick={() => handleCopy(walletData.publicKey, 'public')}
                    aria-label="Copy public key"
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    {copied === 'public' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Private Key (Secret)</label>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2 hover:bg-red-100 transition-colors">
                  <code className="text-xs text-red-700 font-mono flex-1 break-all">{walletData.secretKey}</code>
                  <button
                    onClick={() => handleCopy(walletData.secretKey, 'secret')}
                    aria-label="Copy private key"
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-200 transition-colors text-red-400 hover:text-red-600"
                  >
                    {copied === 'secret' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-700 text-sm font-medium mb-2">Save your private key now</p>
              <ul className="text-amber-600 text-xs space-y-1">
                <li>This key will only be shown once and cannot be retrieved later</li>
                <li>Store it securely in a password manager</li>
                <li>You can import this key into Phantom wallet to access your funds</li>
                <li>Never share your private key with anyone</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#9945FF]" />
                <p className="text-[#9945FF] text-sm font-medium">Phantom Compatible</p>
              </div>
              <p className="text-gray-500 text-xs">
                Open Phantom &rarr; Add/Connect Wallet &rarr; Import Private Key &rarr; Paste your secret key above.
              </p>
            </div>

            <button onClick={handleContinue} className="sf-btn-primary w-full">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="sf-auth-bg">
      <div className="absolute top-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#14F195]/[0.06] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="sf-auth-card">
          <div className="text-center mb-6">
            <div className="w-[72px] h-[72px] rounded-2xl sf-icon-chip-purple mx-auto mb-4" style={{ width: 72, height: 72 }}>
              <Wallet className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Wallet</h1>
            <p className="text-gray-500 text-sm">
              Generate a Solana wallet to start using SendlyFi. Enter your password to encrypt and secure your wallet.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="wallet-password" className="block text-sm font-medium text-gray-700 mb-2">Account Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
                <input
                  id="wallet-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="sf-input pl-11 pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Your password encrypts the wallet's private key for secure storage</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="sf-btn-primary w-full"
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
