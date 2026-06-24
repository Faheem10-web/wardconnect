'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    return null;
  }

  return (
    <footer className="bg-white text-text-body border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-text-title">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="font-display font-bold text-xl tracking-tight">
                Ward<span className="text-primary-600">Connect</span>
              </span>
            </Link>
            <p className="text-sm max-w-md leading-relaxed">
              WardConnect is a citizen-centric platform designed to facilitate direct communication with ward administration, allowing quick resolutions for neighborhood concerns.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-text-title text-sm tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-text-title transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-text-title transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/my-complaints" className="hover:text-text-title transition-colors">My Complaints</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-text-title transition-colors">Admin Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-text-title text-sm tracking-wider uppercase mb-4">
              Contact Ward Office
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>123 Municipal Road, Ward 4, Metro City</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-600 shrink-0" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-600 shrink-0" />
                <span>support@wardconnect.gov</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-card-border text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} WardConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-title transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-title transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
