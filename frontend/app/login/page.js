'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Layers, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExpiredMsg, setShowExpiredMsg] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('expired') === 'true') {
        setShowExpiredMsg(true);
      }
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowExpiredMsg(false);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  if (loading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12 bg-[#030303] bg-grid-pattern">
      <div className="absolute top-[20%] left-[30%] h-[350px] w-[350px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
              <Layers className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="text-base font-bold tracking-tight text-white uppercase">
              EliteForms
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Sign in to check forms and responses
          </p>
        </div>

        {/* Card Panel */}
        <div className="glow-card rounded-2xl p-7 shadow-xl">
          {error && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-500/5 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showExpiredMsg && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-amber-500/5 p-3 text-xs text-amber-400 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Your session expired. Please sign in.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modern-input w-full py-2.5 pl-10 pr-4 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="modern-input w-full py-2.5 pl-10 pr-4 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 text-xs mt-2"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
              {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
            </button>

          </form>
        </div>

        {/* Footer Redirect Link */}
        <p className="mt-5 text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300 hover:underline">
            Register free
          </Link>
        </p>

      </div>
    </div>
  );
}
