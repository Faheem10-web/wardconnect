'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, LogOut, Building2, User, Users, 
  Megaphone, Calendar, ShieldCheck, Database, X 
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [adminRole, setAdminRole] = useState('admin');

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminName(data.user.name || 'Ward Admin');
            setAdminRole(data.user.role || 'admin');
          }
        }
      } catch (e) {
        console.error('Failed to load admin profile', e);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    try {
      const res = await fetch('/api/admin', { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  };

  const getNavItems = () => {
    const commonItems = [
      { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Complaints Work', href: '/admin/complaints', icon: FileText },
    ];

    if (adminRole === 'super_admin') {
      return [
        ...commonItems,
        { name: 'Manage Directory', href: '/admin/citizens', icon: Users },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Community Events', href: '/admin/events', icon: Calendar },
        { name: 'Manage CMS', href: '/admin/cms', icon: Database },
      ];
    }

    if (adminRole === 'admin') {
      return [
        ...commonItems,
        { name: 'Manage Directory', href: '/admin/citizens', icon: Users },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Community Events', href: '/admin/events', icon: Calendar },
        { name: 'Manage CMS', href: '/admin/cms', icon: Database },
      ];
    }

    return [...commonItems];
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (adminRole) {
      case 'super_admin': return 'Super Admin';
      case 'ward_member': return 'Ward Member';
      default: return 'Administrator';
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 md:hidden transition-all duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-card-border text-text-body flex flex-col shrink-0 shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="h-16 flex items-center px-6 border-b border-card-border shrink-0 gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-text-title">
              Ward<span className="text-primary-600">Admin</span>
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-text-body hover:text-text-title md:hidden rounded-lg hover:bg-bg-base transition-colors"
            aria-label="Close sidebar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      <div className="p-6 border-b border-card-border flex items-center gap-3 shrink-0">
        <div className="p-2 bg-primary-50 text-primary-700 rounded-xl relative">
          <User className="w-5 h-5" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-text-body uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary-600" />
            {getRoleLabel()}
          </p>
          <p className="text-sm font-bold text-text-title truncate leading-relaxed mt-0.5">{adminName}</p>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/15'
                  : 'hover:bg-bg-base hover:text-text-title text-text-body'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-card-border shrink-0">
        <button
          onClick={() => {
            onClose?.();
            handleLogout();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-rose-50 hover:text-rose-600 text-text-body transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  </>
  );
}
