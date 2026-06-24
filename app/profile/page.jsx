'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, Mail, LogOut, Phone, ShieldCheck, Landmark } from 'lucide-react';

export default function CitizenProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect to home if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    }
  }, [status, router]);

  // Fetch citizen data for statistics calculations
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      async function getStats() {
        try {
          const res = await fetch(`/api/complaints?email=${encodeURIComponent(session.user.email)}`);
          const data = await res.json();
          if (data.success) {
            const list = data.complaints || [];
            setComplaintsCount(list.length);
          }
        } catch (e) {
          console.error('Failed to get stats', e);
        } finally {
          setLoadingStats(false);
        }
      }
      getStats();
    }
  }, [status, session]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto px-4 sm:px-6 space-y-6 pb-24 md:pb-8 text-text-body">
      
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-body/60 hover:text-text-title transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workspace
      </button>

      <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 sm:p-8 shadow-xl space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-card-border/55 pb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 border border-card-border flex items-center justify-center text-primary-700 font-extrabold text-3xl shrink-0 shadow-inner uppercase">
            {session.user.name?.charAt(0) || <User className="w-8 h-8" />}
          </div>
          
          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-text-title">
              {session.user.name}
            </h2>
            <span className="inline-flex bg-primary-50 text-primary-700 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-primary-200/40">
              Citizen Account
            </span>
          </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-6">
          <h3 className="font-display font-bold text-base text-text-title border-b border-card-border/45 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
            Citizen Profile Registry
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-bg-base border border-card-border/50 p-4 rounded-xl">
              <div className="text-text-body/60 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-text-body/65 font-bold uppercase tracking-widest block">Full Name</span>
                <span className="text-sm text-text-title font-semibold truncate block">{session.user.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-bg-base border border-card-border/50 p-4 rounded-xl">
              <div className="text-text-body/60 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-text-body/65 font-bold uppercase tracking-widest block">Email Address</span>
                <span className="text-sm text-text-title font-semibold truncate block">{session.user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-bg-base border border-card-border/50 p-4 rounded-xl">
              <div className="text-text-body/60 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-text-body/65 font-bold uppercase tracking-widest block">Mobile Contact</span>
                <span className="text-sm text-text-title font-semibold truncate block">{session.user.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-bg-base border border-card-border/50 p-4 rounded-xl">
              <div className="text-text-body/60 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-text-body/65 font-bold uppercase tracking-widest block">Ward Jurisdiction</span>
                <span className="text-sm text-text-title font-semibold truncate block">Ward 4 Administration Desk</span>
              </div>
            </div>
            
            <div className="bg-bg-base border border-card-border/50 p-6 rounded-xl text-center space-y-1.5">
              <span className="text-3xl font-black text-text-title block">
                {loadingStats ? '-' : complaintsCount}
              </span>
              <span className="text-[9px] text-text-body/60 font-bold uppercase tracking-widest block">Total Complaints Logged</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-card-border/50 pt-6">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3.5 bg-card-bg border border-danger/35 hover:bg-danger/5 text-danger rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out of Account
          </button>
        </div>

      </div>
    </div>
  );
}
