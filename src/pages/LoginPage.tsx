import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [zkid, setZkid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zkid.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(zkid.trim(), password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0B0B1A]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B1A] via-[#1A1035] to-[#0B0B1A]" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#9945FF]/20 blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#14F195]/15 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#00C2FF]/10 blur-[120px] pointer-events-none" />

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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm">Log in with your ZKID and password</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/0 pointer-events-none" />
          <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl p-8 border border-white/[0.08] shadow-[0_8px_60px_-12px_rgba(153,69,255,0.25)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">ZKID</label>
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#9945FF] transition-colors" />
                  <input
                    type="text"
                    value={zkid}
                    onChange={(e) => setZkid(e.target.value.toUpperCase())}
                    placeholder="Enter your 8-character ZKID"
                    maxLength={8}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#9945FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_-4px_rgba(153,69,255,0.3)] transition-all duration-300 font-mono tracking-wider uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#9945FF] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                disabled={!zkid.trim() || !password || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white font-semibold hover:shadow-[0_0_30px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#9945FF] font-medium hover:text-[#B47AFF] transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
