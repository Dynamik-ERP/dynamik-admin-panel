'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/auth/session-store';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const API_URL = (() => {
  const url = RAW_URL.trim().replace(/\/+$/, '');
  if (url.endsWith('/api/v1')) return url;
  if (url.endsWith('/api')) return `${url}/v1`;
  return `${url}/api/v1`;
})();

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please wait a minute before trying again.');
        }
        throw new Error(data.message || 'Invalid credentials');
      }

      setSession({
        userId: data.user.id,
        fullName: data.user.full_name,
        role: data.user.role,
        accessToken: data.access_token,
      });

      // Use router.push (NOT window.location.href) to preserve the
      // in-memory Zustand session. A full page reload destroys it,
      // causing an infinite redirect loop back to /login.
      router.push('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center p-6">
      <div className="bg-[#12141C] border border-[#1F2330] p-8 w-full max-w-md rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to Dynamik Admin</h2>
        <p className="text-xs text-gray-500 font-mono mb-6">ADMIN PANEL</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-mono rounded">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-gray-400 mb-1.5">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@dynamik.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0B0C0E] border border-[#1F2330] rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs font-mono text-gray-400 mb-1.5">PASSWORD</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0B0C0E] border border-[#1F2330] rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6B00] text-[#0B0C0E] font-bold p-3 rounded-md hover:bg-[#E05E00] transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}