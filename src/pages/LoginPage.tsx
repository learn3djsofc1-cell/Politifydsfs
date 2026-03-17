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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Log in with your ZKID and password</p>
        </div>

        <div className="sf-auth-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="zkid-input" className="block text-sm font-medium text-gray-700 mb-2">ZKID</label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
                <input
                  id="zkid-input"
                  type="text"
                  value={zkid}
                  onChange={(e) => setZkid(e.target.value.toUpperCase())}
                  placeholder="Enter your 8-character ZKID"
                  maxLength={8}
                  className="sf-input pl-11 font-mono tracking-wider uppercase"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              disabled={!zkid.trim() || !password || loading}
              className="sf-btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#9945FF] font-medium hover:text-[#7B2FE0] transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
