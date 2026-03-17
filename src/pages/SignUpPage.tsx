import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Copy, Check, ArrowRight, Shield, Lock, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [zkid, setZkid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  const allValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setError('');
    setLoading(true);
    try {
      const result = await signup(password);
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
      <div className="sf-auth-bg">
        <div className="absolute top-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#14F195]/[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/[0.06] blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="sf-auth-card text-center">
            <div className="w-[72px] h-[72px] rounded-2xl sf-icon-chip-green mx-auto mb-6" style={{ width: 72, height: 72 }}>
              <Shield className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your ZKID</h1>
            <p className="text-gray-500 text-sm mb-6">
              This is your unique identity. Save it somewhere safe. You will need it to log in.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
              <div className="text-3xl font-mono font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195] mb-3">
                {zkid}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
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
              <p className="text-amber-700 text-sm font-medium mb-1">Important</p>
              <p className="text-amber-600 text-xs">
                Your ZKID cannot be recovered if lost. Write it down or store it in a password manager.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="sf-btn-primary w-full"
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
    <div className="sf-auth-bg">
      <div className="absolute top-[-30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#14F195]/[0.06] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SendlyFi</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm">Set a password to receive your unique ZKID</p>
        </div>

        <div className="sf-auth-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
                <input
                  id="signup-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="sf-input pl-11"
                />
              </div>
            </div>

            <div className="space-y-2.5 py-1">
              {[
                { key: 'length', label: 'At least 8 characters' },
                { key: 'uppercase', label: 'One uppercase letter' },
                { key: 'number', label: 'One number' },
                { key: 'match', label: 'Passwords match' },
              ].map((check) => {
                const passed = passwordChecks[check.key as keyof typeof passwordChecks];
                return (
                  <div key={check.key} className="flex items-center gap-2.5 text-xs">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                        passed ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <Check className={`w-3 h-3 transition-colors ${passed ? 'text-green-600' : 'text-gray-300'}`} />
                    </div>
                    <span className={`transition-colors ${passed ? 'text-gray-700' : 'text-gray-400'}`}>
                      {check.label}
                    </span>
                  </div>
                );
              })}
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
              disabled={!allValid || loading}
              className="sf-btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a ZKID?{' '}
          <Link to="/login" className="text-[#9945FF] font-medium hover:text-[#7B2FE0] transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
