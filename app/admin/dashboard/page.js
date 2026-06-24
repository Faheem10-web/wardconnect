'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, ClipboardList, CheckCircle2, AlertTriangle, 
  ArrowRight, Loader2, RefreshCw, Users, Shield, Calendar, Database, Sparkles, TrendingUp
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

function DashboardCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    warning: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm flex items-center gap-4 text-text-body">
      <div className={`p-4 rounded-xl border shrink-0 ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-text-title mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminRole, setAdminRole] = useState('admin');
  const [allUsers, setAllUsers] = useState([]);
  const [isSuperLoading, setIsSuperLoading] = useState(false);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resStats, resProfile, resUsers] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin'),
        fetch('/api/admin/users')
      ]);

      if (resStats.ok) {
        const statsData = await resStats.json();
        setData(statsData);
      }
      
      if (resProfile.ok) {
        const profileData = await resProfile.json();
        if (profileData.authenticated && profileData.user) {
          setAdminRole(profileData.user.role || 'admin');
        }
      }

      if (resUsers.ok) {
        const usersData = await resUsers.json();
        if (usersData.success) {
          setAllUsers(usersData.users || []);
        }
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setIsSuperLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuperLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats(true);
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-2 text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-xs text-slate-400 font-semibold">Loading stats workspace...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-danger/10 text-danger p-5 rounded-2xl text-center text-sm font-semibold max-w-md mx-auto mt-20">
        Failed to load stats details.
      </div>
    );
  }

  const { stats, recentComplaints, categoryStats = [] } = data;

  const totalUsersCount = allUsers.length;
  const citizenCount = allUsers.filter(u => u.role === 'citizen').length;
  const staffCount = allUsers.filter(u => u.role === 'staff' || u.role === 'ward_member').length;

  // Filter complaints for Ward Member (Mocking: showing only Category related to their assigned category "Road Damage")
  const filteredComplaints = adminRole === 'ward_member' 
    ? recentComplaints.filter(c => c.category === 'Road Damage')
    : recentComplaints;

  const getRoleLabel = () => {
    switch (adminRole) {
      case 'super_admin': return 'Super Admin Console';
      case 'ward_member': return 'Ward Member Board';
      case 'admin': return 'Admin Panel';
      default: return 'Control Center';
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 text-text-body">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-title flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            {getRoleLabel()}
          </h2>
          <p className="text-xs text-text-body">System metrics, active analytics, and neighborhood tracking.</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 border border-card-border rounded-xl bg-card-bg text-xs font-bold uppercase tracking-wider text-text-title hover:bg-card-border/30 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Console
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Inbound"
          value={stats.total}
          icon={ClipboardList}
          color="primary"
        />
        <DashboardCard
          title="Pending Queue"
          value={stats.pending}
          icon={AlertTriangle}
          color="danger"
        />
        <DashboardCard
          title="In Resolution"
          value={stats.inProgress}
          icon={Activity}
          color="warning"
        />
        <DashboardCard
          title="Resolved Cases"
          value={stats.completed}
          icon={CheckCircle2}
          color="success"
        />
      </div>

      {/* Secondary Meta KPI: Users Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card-bg/40 border border-card-border/40 p-4 rounded-[20px] shadow-inner text-xs font-bold uppercase tracking-wider">
        <div className="flex justify-between items-center px-4 py-2 bg-card-bg border border-card-border/50 rounded-xl">
          <span className="text-text-body/65">Total Citizens</span>
          <span className="text-text-title font-black text-sm">{citizenCount}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-2 bg-card-bg border border-card-border/50 rounded-xl">
          <span className="text-text-body/65">Dispatch Staff</span>
          <span className="text-text-title font-black text-sm">{staffCount}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-2 bg-card-bg border border-card-border/50 rounded-xl">
          <span className="text-text-body/65">Total Registry</span>
          <span className="text-text-title font-black text-sm">{totalUsersCount}</span>
        </div>
      </div>

      {/* SVG Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Distribution chart */}
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            Inbound Inflow by Category
          </h3>
          
          <div className="relative pt-4 h-64 flex flex-col justify-between">
            <div className="w-full h-48 flex items-end justify-around border-b border-card-border/60 pb-1">
              {categoryStats.map((item, idx) => {
                const totalCount = stats.total || 1;
                const percentage = Math.round((item.count / totalCount) * 100);
                const heightVal = Math.max(10, Math.min(100, (item.count / totalCount) * 180));
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-12 group relative">
                    <span className="text-[9px] font-bold text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">
                      {percentage}%
                    </span>
                    <div 
                      className="w-7 bg-gradient-to-t from-primary-600 to-secondary-400 rounded-t-md transition-all duration-700 group-hover:from-primary-500 group-hover:to-secondary-300" 
                      style={{ height: `${heightVal}px` }} 
                    />
                    <span className="text-[9px] font-bold text-text-body truncate w-14 text-center">
                      {item.category.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-text-body/60 leading-normal text-center italic">Hover columns to view percentages. Statistics dynamically generated from real database logs.</p>
          </div>
        </div>

        {/* Status distribution Pie gauge */}
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-secondary-500" />
            Resolution Ratio
          </h3>
          
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--card-border)" strokeWidth="2.5" />
                <path 
                  className="text-success" 
                  strokeWidth="3" 
                  stroke="currentColor" 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  strokeDasharray={`${(stats.completed / (stats.total || 1)) * 100}, 100`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-text-title">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
                <span className="text-[8px] font-bold text-success uppercase tracking-widest mt-0.5">Resolved</span>
              </div>
            </div>

            <div className="flex justify-around w-full text-[9px] font-bold uppercase tracking-wider text-text-body/80">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger shrink-0 animate-ping" /> Pending ({stats.pending})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning shrink-0" /> Inflow ({stats.inProgress})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success shrink-0" /> Done ({stats.completed})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Role Dispatcher Console (Restrict to Admin and Super Admin) */}
      {(adminRole === 'super_admin' || adminRole === 'admin') && (
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-6">
          <div className="border-b border-card-border/50 pb-3 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-text-title flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              Administrator & Roles Dispatcher
            </h3>
            <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary-100">
              Control Panel
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-card-border/60 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Current Role</th>
                  <th className="pb-3 text-right">Dispatch New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {allUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-card-border/10 transition-colors">
                    <td className="py-3 font-bold text-text-title flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                        {user.name?.charAt(0)}
                      </div>
                      {user.name}
                    </td>
                    <td className="py-3 text-text-body font-medium">{user.email}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold uppercase bg-bg-base text-text-body px-2.5 py-0.5 rounded-full border border-card-border">
                        {user.role || 'citizen'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        disabled={isSuperLoading}
                        value={user.role || 'citizen'}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-card-border bg-white text-xs font-bold text-text-title outline-none focus:border-primary-500 cursor-pointer"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="ward_member">Ward Member</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ward Member: Category specific panel */}
      {adminRole === 'ward_member' && (
        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-4">
          <div className="border-b border-card-border/50 pb-3 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-text-title flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-warning" />
              Category Work Assigned: <span className="text-primary-600 font-bold">Road Damage</span>
            </h3>
            <span className="text-[10px] font-bold bg-warning/10 text-warning px-2.5 py-0.5 rounded-full uppercase tracking-wider">Action Queue</span>
          </div>

          <div className="divide-y divide-card-border/30">
            {filteredComplaints.length === 0 ? (
              <p className="text-center py-8 text-xs text-text-body/60 italic font-semibold">No complaints matched to your assigned category.</p>
            ) : (
              filteredComplaints.map(c => (
                <div key={c._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-bold text-text-title text-sm">{c.title}</p>
                    <p className="text-[10px] text-text-body flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Filed: {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link
                    href={`/admin/complaints?id=${c._id}`}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors"
                  >
                    Action
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-card-border/50 pb-3">
          <h3 className="font-display font-bold text-base text-text-title flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-500" />
            Recent Complaints Feed
          </h3>
          <Link
            href="/admin/complaints"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-650 hover:text-primary-700"
          >
            Manage Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-card-border/60 text-slate-400 font-bold uppercase tracking-wider text-xs">
                <th className="pb-3 pl-2">Title</th>
                <th className="pb-3">Reporter</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {filteredComplaints.map((c) => (
                <tr key={c._id} className="hover:bg-card-border/10 transition-colors">
                  <td className="py-3.5 pl-2 font-semibold text-text-title truncate max-w-[180px] sm:max-w-xs">{c.title}</td>
                  <td className="py-3.5 text-text-body">{c.name}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 bg-bg-base border border-card-border rounded text-[9px] font-bold text-text-body uppercase tracking-wider">{c.category}</span>
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-xs text-text-body/60 italic font-semibold">No complaints registered in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
