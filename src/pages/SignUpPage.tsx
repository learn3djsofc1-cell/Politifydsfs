import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Copy, Check, ArrowRight, Shield, Lock, User } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [zkid, setZkid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const usernameChecks = {
    length: username.length >= 3 && username.length <= 20,
    format: /^[a-z0-9_]*$/.test(username.toLowerCase()) && username.length > 0,
  };

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  const allValid = Object.values(usernameChecks).every(Boolean) && Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setError('');
    setLoading(true);
    try {
      const result = await signup(password, username.trim().toLowerCase());
      setZkid(result.zkid);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!zkid) return;
    await navigator.clipboard.writeText(zkid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (zkid) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#14F195]/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-[#0DAA6D]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your ZKID</h1>
            <p className="text-gray-500 text-sm mb-6">
              This is your unique identity. Save it somewhere safe. You will need it to log in.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <div className="text-3xl font-mono font-bold tracking-[0.2em] text-[#9945FF] mb-2">
                {zkid}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#14F195]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-800 text-sm font-medium mb-1">Important</p>
              <p className="text-amber-700 text-xs">
                Your ZKID cannot be recovered if lost. Write it down or store it in a password manager.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
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

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SendlyFi</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Choose a username and set a password to receive your unique ZKID</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Choose a username"
                  maxLength={20}
                  autoComplete="username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: 'u_length', label: 'Username: 3-20 characters', check: usernameChecks.length },
                { key: 'u_format', label: 'Username: letters, numbers, underscores only', check: usernameChecks.format },
                { key: 'length', label: 'At least 8 characters', check: passwordChecks.length },
                { key: 'uppercase', label: 'One uppercase letter', check: passwordChecks.uppercase },
                { key: 'number', label: 'One number', check: passwordChecks.number },
                { key: 'match', label: 'Passwords match', check: passwordChecks.match },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      item.check
                        ? 'bg-[#14F195]/20 text-[#0DAA6D]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <span
                    className={
                      item.check
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!allValid || loading}
              className="w-full py-3 rounded-xl bg-[#9945FF] text-white font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a ZKID?{' '}
          <Link to="/login" className="text-[#9945FF] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
