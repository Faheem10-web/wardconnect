'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }

        const data = await res.json();
        if (data.authenticated) {
          setAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Session check failed', err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-text-body font-semibold">Authorizing administrator session...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex bg-bg-base min-h-screen text-text-body">
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-card-border flex items-center justify-between px-8 shrink-0">
          <h1 className="font-display font-bold text-sm uppercase tracking-wider text-text-title">
            Control Panel
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-body uppercase tracking-wider bg-bg-base border border-card-border rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Connection
          </div>
        </header>
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
