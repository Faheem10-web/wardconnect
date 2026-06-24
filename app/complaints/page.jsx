import ComplaintForm from '@/components/ComplaintForm';
import { Landmark } from 'lucide-react';

export const metadata = {
  title: 'Submit Complaint - WardConnect',
  description: 'Submit neighborhood complaints to the Ward 4 Administration.',
};

export default function ComplaintsPage() {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-24 md:pb-16 text-text-body">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700 uppercase tracking-widest">
          <Landmark className="w-3.5 h-3.5" />
          Official Intake Portal
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-text-title tracking-tight leading-tight">
          File a Neighborhood Report
        </h1>
        <p className="text-sm leading-relaxed max-w-lg mx-auto text-text-body">
          Complete the details below to log a civic issue. Our administration dispatch team will assign it to the respective Ward Member in real-time.
        </p>
      </div>

      <ComplaintForm />
    </div>
  );
}
