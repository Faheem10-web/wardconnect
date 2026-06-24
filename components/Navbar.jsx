'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Menu, X, ShieldAlert, Building2, User, LogOut, ChevronDown, 
  LayoutDashboard, Bell, CheckCircle2, AlertTriangle, Info 
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ml' : 'en';
    localStorage.setItem('lang', nextLang);
    setLanguage(nextLang);
    window.dispatchEvent(new Event('languageChange'));
  };
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/login') {
    return null;
  }

  const baseLinks = [
    { name: 'Home', href: '/' },
  ];

  const citizenLinks = session
    ? [...baseLinks, { name: 'Dashboard', href: '/dashboard' }]
    : baseLinks;

  const mockNotifications = [
    {
      id: 1,
      title: "Complaint Resolved",
      desc: "Manhole cover repair on Park Road is Completed.",
      type: "success",
      time: "2 hours ago",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50"
    },
    {
      id: 2,
      title: "Roadwork Schedule Update",
      desc: "Water Pipeline repairs scheduled near Sector 4.",
      type: "info",
      time: "5 hours ago",
      icon: Info,
      iconColor: "text-blue-600 bg-blue-50"
    },
    {
      id: 3,
      title: "Pending Complaint",
      desc: "Pothole on Main Avenue has been assigned to a Ward Member.",
      type: "warning",
      time: "1 day ago",
      icon: AlertTriangle,
      iconColor: "text-amber-600 bg-amber-50"
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-card-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary-600 rounded-xl group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-text-title">
                Ward<span className="text-primary-600">Connect</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {citizenLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary-600 ${
                    isActive ? 'text-primary-600' : 'text-text-body'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/complaints"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              Submit Complaint
            </Link>

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold border border-card-border rounded-xl bg-white text-text-title hover:bg-bg-base transition-all cursor-pointer"
              title="Toggle Language / ഭാഷ മാറ്റുക"
            >
              {language === 'en' ? 'ML' : 'EN'}
            </button>

            {session && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-text-body hover:text-text-title hover:bg-bg-base rounded-lg transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-card-border bg-white p-4 shadow-xl z-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-card-border">
                      <h4 className="font-bold text-sm text-text-title">Notifications</h4>
                      <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">3 New</span>
                    </div>

                    <div className="divide-y divide-card-border max-h-64 overflow-y-auto premium-scroll">
                      {mockNotifications.map((notif) => {
                        const IconComponent = notif.icon;
                        return (
                          <div key={notif.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 hover:bg-bg-base rounded-lg px-2 transition-colors">
                            <div className={`p-2 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${notif.iconColor}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-text-title truncate">{notif.title}</p>
                              <p className="text-[10px] text-text-body leading-normal mt-0.5 line-clamp-2">{notif.desc}</p>
                              <span className="text-[9px] text-text-body/70 font-medium block mt-1">{notif.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-card-border bg-white hover:bg-bg-base transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-body" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-card-border bg-white p-1.5 shadow-xl z-50 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/dashboard');
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold text-text-body hover:text-text-title hover:bg-bg-base rounded-xl transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/profile');
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold text-text-body hover:text-text-title hover:bg-bg-base rounded-xl transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <div className="border-t border-card-border my-1" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/?login=true')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-body hover:text-text-title border border-card-border rounded-lg bg-white hover:bg-bg-base transition-colors shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-body hover:text-text-title border border-card-border rounded-lg bg-white hover:bg-bg-base transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-primary-500" />
              Admin Panel
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="px-2 py-0.5 border border-card-border text-[10px] font-bold rounded-lg bg-white text-text-title cursor-pointer"
            >
              {language === 'en' ? 'ML' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-text-body hover:text-text-title hover:bg-bg-base transition-colors cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-card-border bg-white px-4 pt-2 pb-4 space-y-2">
          {citizenLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold transition-colors hover:bg-bg-base ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-text-body'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-2 space-y-2">
            <Link
              href="/complaints"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              Submit Complaint
            </Link>

            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 text-sm font-semibold text-text-body hover:bg-bg-base border border-card-border rounded-lg bg-white"
                >
                  <User className="w-4 h-4" /> Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10 border border-danger/20 rounded-lg bg-danger/5"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/?login=true');
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-text-body border border-card-border rounded-lg bg-white"
              >
                Sign In
              </button>
            )}

            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full text-center px-4 py-2 text-sm font-semibold text-text-body border border-card-border rounded-lg bg-white"
            >
              <ShieldAlert className="w-4 h-4 text-primary-500" /> Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
