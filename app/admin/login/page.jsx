'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push('/admin/dashboard');
            return;
          }
        }
      } catch (e) {
        console.error('Session check failed', e);
      } finally {
        setCheckingSession(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-text-body">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-text-body font-semibold">Verifying secure admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12 text-text-body">
      <div className="max-w-md w-full space-y-8 bg-white border border-card-border p-8 sm:p-10 rounded-2xl shadow-lg">
        
        <div className="text-center space-y-4">
          <div className="inline-flex p-3.5 bg-primary-50 rounded-2xl text-primary-600 mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display font-extrabold text-2xl text-text-title tracking-tight">
              Control Panel Entrance
            </h2>
            <p className="text-sm text-text-body">
              Enter your official credentials to access the administrative dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-2.5 text-xs font-semibold text-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-text-body/50" />
                <input
                  type="email"
                  placeholder="admin@wardconnect.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-card-border bg-white text-text-title text-sm outline-none transition-all focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-text-body/50" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-card-border bg-white text-text-title text-sm outline-none transition-all focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-xl transition-all shadow-md shadow-primary-600/10 cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Session...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-text-body/70 leading-normal">
            For Demo: <strong>admin@wardconnect.gov</strong> with password <strong>Admin@WardConnect2026</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
