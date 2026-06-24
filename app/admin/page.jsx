'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.replace('/admin/dashboard');
            return;
          }
        }
        router.replace('/admin/login');
      } catch (e) {
        console.error('Admin session check failed, redirecting to login', e);
        router.replace('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Redirecting to administrator console...</p>
      </div>
    </div>
  );
}
