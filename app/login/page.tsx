'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ArrowRight, Loader2, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid password.');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Ambient gradient lighting */}
      <div className="ambient-glow pointer-events-none fixed inset-0 z-0" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 items-center justify-center shadow-xl shadow-blue-500/20 ring-1 ring-white/20 mb-1">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Agentic Chat Harness
            </h1>
            <p className="text-xs text-zinc-400">
              Protected AI Workspace • Vercel AI Gateway • Neon pgvector
            </p>
          </div>
        </div>

        {/* Login Glassmorphic Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-5">
          <div className="flex items-center gap-2 pb-1 border-b border-white/5">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Protected Access
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="access-password" className="text-xs font-medium text-zinc-300">
                Workspace Access Password
              </label>
              <div className="relative">
                <input
                  id="access-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password..."
                  required
                  autoFocus
                  className="w-full bg-zinc-900/90 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono"
                />
                <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick hint for initial setup */}
          <div className="pt-2 border-t border-white/5 space-y-2 text-[11px] text-zinc-400">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-300 font-medium">Default Passcode:</span>{' '}
                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">
                  agentic-2026
                </code>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Customize via <code className="text-zinc-400">APP_PASSWORD</code> in your environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vercel Deployment Protection Guide Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-[11px] text-zinc-400 space-y-1 text-center">
          <p className="font-medium text-zinc-300">Deploying to Vercel?</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            You can also toggle <strong>Vercel Authentication</strong> in your Vercel Project Dashboard (<code className="text-zinc-400">Settings &gt; Deployment Protection</code>) to require team Vercel SSO logins!
          </p>
        </div>
      </div>
    </div>
  );
}

