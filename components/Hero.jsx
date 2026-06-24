import Link from 'next/link';
import { ArrowRight, Landmark, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white text-text-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-700">
            <Landmark className="w-3.5 h-3.5" />
            Ward Administration Service Portal
          </div>
          
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-text-title leading-tight">
            Your Voice for a Better, Clean Neighborhood
          </h1>
          
          <p className="text-lg sm:text-xl text-text-body font-light max-w-2xl mx-auto leading-relaxed">
            Report local grievances directly to ward administrators. Street lights, road damages, water supply issues, or garbage collection – we track and resolve them.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/complaints"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Submit a Complaint
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/my-complaints"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold text-text-title bg-white hover:bg-bg-base border border-card-border rounded-xl transition-all shadow-sm"
            >
              Track Complaint
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-card-border max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-card-border shadow-sm">
              <Zap className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-2xl font-bold text-text-title">24/7</span>
              <span className="text-xs text-text-body mt-1 uppercase tracking-wider">Fast Filing</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-card-border shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-2xl font-bold text-text-title">100%</span>
              <span className="text-xs text-text-body mt-1 uppercase tracking-wider">Transparent Tracker</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-card-border shadow-sm">
              <Landmark className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-2xl font-bold text-text-title">Direct</span>
              <span className="text-xs text-text-body mt-1 uppercase tracking-wider">Ward Action</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
