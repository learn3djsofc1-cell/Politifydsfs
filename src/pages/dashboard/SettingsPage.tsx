import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  User, Wallet, Globe, LogOut, Pencil, Check, X, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const SettingsPage = () => {
  const { user, token, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [networkSwitching, setNetworkSwitching] = useState(false);
  const [networkError, setNetworkError] = useState('');

  const networkMode = user?.networkMode || 'devnet';
  const isTestnet = networkMode === 'devnet';

  const walletAddress = user?.wallets?.[0]?.public_key || null;
  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const startEditingUsername = () => {
    setNewUsername(user?.username || '');
    setUsernameError('');
    setUsernameSuccess('');
    setEditingUsername(true);
  };

  const cancelEditingUsername = () => {
    setEditingUsername(false);
    setNewUsername('');
    setUsernameError('');
  };

  const saveUsername = useCallback(async () => {
    if (!token || !newUsername.trim()) return;

    const trimmed = newUsername.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setUsernameError('Username must be 2-20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
      return;
    }
    if (trimmed === user?.username) {
      setEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    setUsernameError('');
    try {
      const res = await fetch('/api/users/username', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsernameError(data.error || 'Failed to update username');
        return;
      }
      await refreshUser();
      setEditingUsername(false);
      setUsernameSuccess('Username updated');
      setTimeout(() => setUsernameSuccess(''), 3000);
    } catch {
      setUsernameError('Failed to update username');
    } finally {
      setSavingUsername(false);
    }
  }, [token, newUsername, user?.username, refreshUser]);

  const switchNetwork = useCallback(async (mode: 'devnet' | 'mainnet-beta') => {
    if (!token || networkSwitching || mode === networkMode) return;
    setNetworkSwitching(true);
    setNetworkError('');
    try {
      const res = await fetch('/api/user/network-mode', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ networkMode: mode }),
      });
      if (!res.ok) throw new Error('Network switch failed');
      await refreshUser();
    } catch {
      setNetworkError('Failed to switch network');
      setTimeout(() => setNetworkError(''), 3000);
    } finally {
      setNetworkSwitching(false);
    }
  }, [token, networkMode, networkSwitching, refreshUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[800px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your account</p>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-gray-800">@{user?.username || 'user'}</div>
            <div className="text-sm text-gray-500 mt-0.5">
              {truncatedWallet ? `Wallet: ${truncatedWallet}` : 'No wallet connected'}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Profile</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                {editingUsername ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                        setUsernameError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveUsername();
                        if (e.key === 'Escape') cancelEditingUsername();
                      }}
                      maxLength={20}
                      autoFocus
                      className="w-full sm:w-48 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-[#9945FF] focus:ring-2 focus:ring-[#9945FF]/10"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={saveUsername}
                        disabled={savingUsername}
                        className="p-1.5 rounded-lg bg-[#9945FF] text-white hover:bg-[#8030E0] transition-colors disabled:opacity-50"
                      >
                        {savingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={cancelEditingUsername}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800">Username</div>
                      <div className="text-xs text-gray-500 mt-0.5">@{user?.username || 'user'}</div>
                    </div>
                  </div>
                )}
                {usernameError && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600">{usernameError}</span>
                  </div>
                )}
                {usernameSuccess && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-green-600">{usernameSuccess}</span>
                  </div>
                )}
              </div>
              {!editingUsername && (
                <button
                  onClick={startEditingUsername}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#9945FF] hover:bg-[#9945FF]/10 transition-colors flex-shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">Wallet</div>
                <div className="text-xs text-gray-500 mt-0.5 break-all">
                  {walletAddress || 'No wallet connected'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Network</h2>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">Network Mode</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Currently on {isTestnet ? 'Testnet (Devnet)' : 'Mainnet'}
                </div>
                {networkError && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600">{networkError}</span>
                  </div>
                )}
              </div>
              <div className={`inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 flex-shrink-0 ${networkSwitching ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => switchNetwork('devnet')}
                  disabled={networkSwitching}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isTestnet
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-white' : 'bg-gray-400'}`} />
                  Testnet
                </button>
                <button
                  onClick={() => switchNetwork('mainnet-beta')}
                  disabled={networkSwitching}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    !isTestnet
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${!isTestnet ? 'bg-white' : 'bg-gray-400'}`} />
                  Mainnet
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </motion.div>
    </motion.div>
  );
};
