import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  zkid: string;
  username: string;
  networkMode: string;
  createdAt: string;
  wallets: Array<{ id: number; public_key: string; network: string; created_at: string }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (password: string, username: string) => Promise<{ zkid: string }>;
  login: (zkid: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sendlyfi_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        localStorage.removeItem('sendlyfi_token');
        setToken(null);
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch {
      localStorage.removeItem('sendlyfi_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token, fetchUser]);

  const signup = async (password: string, username: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    localStorage.setItem('sendlyfi_token', data.token);
    setToken(data.token);
    return { zkid: data.zkid };
  };

  const login = async (zkid: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zkid, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('sendlyfi_token', data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('sendlyfi_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
