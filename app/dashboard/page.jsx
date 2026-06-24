'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Plus, LogOut, Settings, Clock, FileText, ChevronRight, User, 
  AlertCircle, CheckCircle2, RefreshCw, BarChart, Bell
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function CitizenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchComplaints(session.user.email);
    }
  }, [status, session]);

  const fetchComplaints = async (email, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/complaints?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (session?.user?.email) {
      setIsRefreshing(true);
      fetchComplaints(session.user.email, true);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || (loading && !isRefreshing)) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* elegant skeleton loader */}
        <div className="h-28 bg-slate-100 rounded-[20px] animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-100 rounded-[20px] animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-[20px] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-slate-100 rounded-[20px] animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-[20px] animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-[20px] animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 rounded-[20px] animate-pulse" />
      </div>
    );
  }

  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const completed = complaints.filter(c => c.status === 'Completed').length;

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-24 md:pb-8 text-text-body">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-title">Citizen Workspace</h2>
          <p className="text-xs text-text-body">Manage your profile and track active reports.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 text-text-body hover:text-text-title hover:bg-card-border/40 rounded-xl transition-colors border border-card-border/50 cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Profile Card */}
      <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center border border-card-border font-display font-bold text-xl uppercase shadow-inner">
            {session.user.name?.charAt(0) || <User />}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-display font-bold text-lg text-text-title leading-tight">{session.user.name}</h3>
            <p className="text-xs text-text-body font-medium mt-0.5">{session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/notifications')}
            className="p-2.5 text-text-body hover:text-primary-500 hover:bg-primary-500/10 rounded-xl border border-card-border/40 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2.5 text-text-body hover:text-danger hover:bg-danger/10 rounded-xl border border-card-border/40 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/complaints')}
          className="flex flex-col items-center justify-center p-6 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] shadow-lg shadow-primary-600/10 hover:shadow-primary-600/20 transition-all gap-2 cursor-pointer active:scale-95 group"
        >
          <div className="p-3 bg-white/10 rounded-xl group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider">New Complaint</span>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center justify-center p-6 bg-card-bg border border-card-border hover:bg-card-border/40 text-text-title rounded-[20px] shadow-sm transition-all gap-2 cursor-pointer active:scale-95 group"
        >
          <div className="p-3 bg-card-border/50 rounded-xl group-hover:scale-105 transition-transform">
            <Settings className="w-6 h-6 text-text-body" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider">Profile Settings</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-text-title">{pending}</span>
          <span className="text-[9px] font-bold text-text-body uppercase tracking-wider mt-1 block">Pending</span>
        </div>
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-primary-500">{inProgress}</span>
          <span className="text-[9px] font-bold text-text-body uppercase tracking-wider mt-1 block">In Progress</span>
        </div>
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-success">{completed}</span>
          <span className="text-[9px] font-bold text-text-body uppercase tracking-wider mt-1 block">Resolved</span>
        </div>
      </div>

      {/* Recent History Feed */}
      <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-card-border/50 pb-3">
          <h3 className="font-display font-bold text-base text-text-title flex items-center gap-2">
            <BarChart className="w-4 h-4 text-primary-500" />
            My Complaints History
          </h3>
          <button 
            onClick={() => router.push('/my-complaints')}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            View All <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-text-body flex flex-col items-center gap-3">
              <div className="p-4 bg-bg-base rounded-full text-text-body/40">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text-title">No complaints registered</p>
                <p className="text-xs text-text-body">Submit your first civic issue using the button above.</p>
              </div>
              <button 
                onClick={() => router.push('/complaints')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer animate-bounce"
              >
                File Complaint
              </button>
            </div>
          ) : (
            complaints.slice(0, 4).map((c) => (
              <div 
                key={c._id}
                onClick={() => router.push(`/my-complaints?id=${c._id}`)}
                className="p-4 border border-card-border rounded-2xl hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <h4 className="font-bold text-sm text-text-title truncate group-hover:text-primary-600 transition-colors">{c.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-text-body font-medium">
                    <span className="px-1.5 py-0.5 bg-bg-base rounded text-text-body font-bold uppercase">{c.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
