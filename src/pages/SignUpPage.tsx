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
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0B0B1A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B1A] via-[#1A1035] to-[#0B0B1A]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#14F195]/20 blur-[150px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#9945FF]/15 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#14F195]/30 via-white/5 to-white/0 pointer-events-none" />
            <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl p-8 border border-white/[0.08] shadow-[0_8px_60px_-12px_rgba(20,241,149,0.2)] text-center">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#14F195]/20 to-[#0DAA6D]/10 flex items-center justify-center mx-auto mb-6 w-[72px] h-[72px] shadow-[0_0_30px_-4px_rgba(20,241,149,0.3)]">
                <Shield className="w-9 h-9 text-[#14F195]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Your ZKID</h1>
              <p className="text-white/50 text-sm mb-6">
                This is your unique identity. Save it somewhere safe. You will need it to log in.
              </p>

              <div className="bg-white/[0.06] border border-white/10 rounded-xl p-5 mb-4">
                <div className="text-3xl font-mono font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195] mb-3">
                  {zkid}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#14F195]" />
                      <span className="text-[#14F195]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to clipboard
                    </>
                  )}
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left backdrop-blur-sm">
                <p className="text-amber-400 text-sm font-medium mb-1">Important</p>
                <p className="text-amber-400/70 text-xs">
                  Your ZKID cannot be recovered if lost. Write it down or store it in a password manager.
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
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
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#9945FF]/20 blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#14F195]/15 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#00C2FF]/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl tracking-tight text-white">SendlyFi</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/50 text-sm">Set a password to receive your unique ZKID</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/0 pointer-events-none" />
          <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl p-8 border border-white/[0.08] shadow-[0_8px_60px_-12px_rgba(153,69,255,0.25)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#9945FF] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#9945FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_-4px_rgba(153,69,255,0.3)] transition-all duration-300"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#9945FF] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#9945FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_-4px_rgba(153,69,255,0.3)] transition-all duration-300"
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
                          passed
                            ? 'bg-[#14F195]/20 shadow-[0_0_12px_-2px_rgba(20,241,149,0.4)]'
                            : 'bg-white/5'
                        }`}
                      >
                        <Check className={`w-3 h-3 transition-colors ${passed ? 'text-[#14F195]' : 'text-white/20'}`} />
                      </div>
                      <span className={`transition-colors ${passed ? 'text-white/80' : 'text-white/30'}`}>
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
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!allValid || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white font-semibold hover:shadow-[0_0_30px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
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
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have a ZKID?{' '}
          <Link to="/login" className="text-[#9945FF] font-medium hover:text-[#B47AFF] transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
