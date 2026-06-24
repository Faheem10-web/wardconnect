'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Plus, Bell, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide bottom navigation on administrative pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { name: 'Home', href: session ? '/dashboard' : '/', icon: Home },
    { name: 'Complaints', href: '/my-complaints', icon: ClipboardList },
    { name: 'Add', href: '/complaints', icon: Plus, isFab: true },
    { name: 'Alerts', href: '/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-card-border px-2 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(17,24,39,0.06)] rounded-t-2xl">
      {items.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
        const Icon = item.icon;
        
        if (item.isFab) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center -translate-y-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 text-white shadow-lg shadow-primary-500/25 active:scale-90 transition-transform duration-200 shrink-0"
              title="Add Complaint"
            >
              <Plus className="w-7 h-7" />
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-primary-600 font-bold scale-105' 
                : 'text-text-body/60 hover:text-text-title'
            }`}
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold tracking-wider uppercase">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
