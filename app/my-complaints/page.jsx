'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Clock, MapPin, Info, CheckCircle2, ChevronRight, User, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const WORKFLOW_STEPS = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

function MyComplaintsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState(false);
  const [reopenText, setReopenText] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const fetchComplaints = async (email) => {
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
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!selectedId || !reopenText) return;
    setReopening(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`/api/complaints/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reopen', message: reopenText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Complaint reopened successfully!', type: 'success' });
        setShowReopenForm(false);
        setReopenText('');
        // Refresh local details
        if (session?.user?.email) {
          await fetchComplaints(session.user.email);
        }
      } else {
        throw new Error(data.error || 'Failed to reopen complaint');
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setReopening(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const selectedComplaint = selectedId ? complaints.find(c => c._id === selectedId) : null;

  if (selectedComplaint) {
    // Map database state to workflow index
    let currentStepVal = selectedComplaint.detailedStatus || 'Submitted';
    if (!selectedComplaint.detailedStatus) {
      if (selectedComplaint.status === 'In Progress') {
        currentStepVal = 'In Progress';
      } else if (selectedComplaint.status === 'Completed') {
        currentStepVal = 'Resolved';
      } else {
        currentStepVal = selectedComplaint.assignee ? 'Assigned' : 'Submitted';
      }
    }

    const currentIdx = WORKFLOW_STEPS.indexOf(currentStepVal);

    // Get color for priority
    const priorityColors = {
      Low: 'bg-slate-100 text-slate-700',
      Medium: 'bg-blue-50 text-blue-700',
      High: 'bg-amber-50 text-amber-700',
      Critical: 'bg-rose-50 text-rose-700 border-rose-200/50'
    };

    return (
      <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 space-y-6 pb-24 md:pb-8 text-text-body">
        <button 
          onClick={() => router.push('/my-complaints')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-body/60 hover:text-text-title transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Complaints
        </button>

        {message.text && (
          <div className={`p-4 rounded-xl border flex items-start gap-2 text-xs font-semibold ${
            message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-6 sm:p-8 shadow-xl space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-card-border/55 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200/30">
                  {selectedComplaint.category}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-transparent ${priorityColors[selectedComplaint.priority || 'Medium']}`}>
                  {(selectedComplaint.priority || 'Medium')} Priority
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-text-title leading-tight">{selectedComplaint.title}</h2>
              <span className="text-xs text-text-body/50 font-mono block">Complaint ID: {selectedComplaint._id}</span>
            </div>
            <StatusBadge status={selectedComplaint.status} />
          </div>

          {/* Timeline workflow mapping */}
          <div className="bg-bg-base border border-card-border/50 rounded-[20px] p-6 space-y-6">
            <span className="text-xs font-bold text-text-title uppercase tracking-widest block">Resolution Timeline</span>
            
            {/* Desktop Timeline */}
            <div className="hidden sm:flex justify-between items-center relative pt-2">
              <div className="absolute top-6 left-4 right-4 h-0.5 bg-card-border/60 -translate-y-1/2 z-0" />
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = idx === currentIdx;
                const isPassed = idx <= currentIdx;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2.5 w-1/6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive 
                        ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20 scale-110 font-bold' 
                        : isPassed 
                        ? 'bg-primary-500/10 border-primary-500 text-primary-500' 
                        : 'bg-card-bg border-card-border text-text-body/30'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-semibold">{idx+1}</span>}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${
                      isActive ? 'text-primary-500 font-black' : isPassed ? 'text-text-title' : 'text-text-body/40'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="flex sm:hidden flex-col gap-6 relative pl-4 border-l border-card-border/60 ml-2 py-2">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = idx === currentIdx;
                const isPassed = idx <= currentIdx;
                return (
                  <div key={step} className="flex items-center gap-4 relative">
                    <div className={`absolute -left-6.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-card-bg ${
                      isActive 
                        ? 'border-primary-500 bg-primary-500 text-white scale-110' 
                        : isPassed 
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500' 
                        : 'border-card-border text-text-body/30'
                    }`}>
                      {isPassed && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isActive ? 'text-primary-500 font-extrabold' : isPassed ? 'text-text-title' : 'text-text-body/40'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-text-title border-b border-card-border/40 pb-2">Case Details</h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-body/60 font-bold uppercase tracking-wider block">Location Address</span>
                  <span className="flex items-center gap-1.5 text-text-title font-semibold"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {selectedComplaint.location}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-body/60 font-bold uppercase tracking-wider block">Assigned Dispatch Staff</span>
                  <span className="flex items-center gap-1.5 text-text-title font-semibold">
                    <User className="w-4 h-4 text-slate-400 shrink-0" /> 
                    {selectedComplaint.assignee || 'Awaiting assignment'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-text-body/60 font-bold uppercase tracking-wider block">Description of Issue</span>
                <p className="text-text-body leading-relaxed bg-bg-base p-4 rounded-xl border border-card-border/45">{selectedComplaint.description}</p>
              </div>

              {/* Before and After Image Gallery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {selectedComplaint.image && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-body/60 font-bold uppercase tracking-wider block">Before (Citizens Upload)</span>
                    <div className="rounded-2xl overflow-hidden border border-card-border max-h-56">
                      <img src={selectedComplaint.image} alt="Reported problem visual" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {selectedComplaint.afterImage && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-body/60 font-bold uppercase tracking-wider block">After (Resolution Photo)</span>
                    <div className="rounded-2xl overflow-hidden border border-primary-500/20 max-h-56 relative">
                      <img src={selectedComplaint.afterImage} alt="Resolved problem visual" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-success text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-md">Resolved</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedComplaint.adminNotes && (
                <div className="space-y-1.5 bg-primary-50 border border-primary-500/15 rounded-xl p-4 mt-2">
                  <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">Official Remarks</span>
                  <p className="text-text-title font-medium leading-relaxed text-xs">{selectedComplaint.adminNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline logs */}
          <div className="space-y-4 pt-6 border-t border-card-border/55">
            <h3 className="font-display font-bold text-lg text-text-title">Public Updates Log</h3>
            <div className="space-y-4">
              {selectedComplaint.publicUpdates && selectedComplaint.publicUpdates.length > 0 ? (
                selectedComplaint.publicUpdates.map((update, i) => (
                  <div key={i} className="flex gap-3 items-start border-l-2 border-primary-500 pl-4 py-1">
                    <div className="space-y-1">
                      <p className="text-sm text-text-title font-semibold">{update.message}</p>
                      <span className="text-[10px] text-text-body/50 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(update.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-bg-base rounded-xl p-4 border border-card-border/30 text-center text-xs text-text-body/60 font-semibold italic">
                  No public progression updates have been logged for this complaint yet.
                </div>
              )}
            </div>
          </div>

          {/* Reopen Action controls */}
          {(selectedComplaint.status === 'Completed' || selectedComplaint.detailedStatus === 'Resolved' || selectedComplaint.detailedStatus === 'Closed') && (
            <div className="pt-6 border-t border-card-border/55 space-y-4">
              {!showReopenForm ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-text-title">Is the issue still unresolved?</h4>
                    <p className="text-xs text-text-body/80">You can reopen this complaint to alert the administration desk.</p>
                  </div>
                  <button
                    onClick={() => setShowReopenForm(true)}
                    className="px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Reopen Complaint
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReopen} className="space-y-3 bg-bg-base p-4 rounded-xl border border-card-border/40">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Why are you reopening this complaint?</label>
                    <textarea
                      required
                      value={reopenText}
                      onChange={e => setReopenText(e.target.value)}
                      placeholder="E.g. The garbage was only partially cleared, or the light went dark again..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowReopenForm(false)}
                      className="px-3.5 py-2 border border-card-border text-text-body hover:bg-card-border/30 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reopening}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {reopening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Reopen
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-24 md:pb-8 text-text-body">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-text-title">My Filed Complaints</h1>
          <p className="text-xs text-text-body">Track status progression on your submitted issues.</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="bg-card-bg border border-card-border/80 rounded-[20px] p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="p-4 bg-bg-base rounded-full text-text-body/40">
              <Info className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-text-title">No complaints submitted</p>
              <p className="text-xs text-text-body">Submit your first neighborhood issue in the report tab.</p>
            </div>
          </div>
        ) : (
          complaints.map(c => (
            <div 
              key={c._id}
              onClick={() => router.push(`/my-complaints?id=${c._id}`)}
              className="bg-card-bg border border-card-border/80 rounded-[20px] p-5 hover:border-primary-400 cursor-pointer transition-all shadow-sm flex items-center justify-between gap-4 group hover:-translate-y-0.5"
            >
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center gap-3 text-[10px] text-text-body font-medium">
                  <span className="font-bold text-[9px] uppercase bg-bg-base text-text-body px-2 py-0.5 rounded">{c.category}</span>
                  <span className="font-mono text-slate-450">ID: {c._id.substring(0, 10)}...</span>
                </div>
                <h3 className="font-bold text-text-title text-base truncate max-w-[200px] sm:max-w-md group-hover:text-primary-500 transition-colors">{c.title}</h3>
                <span className="text-xs text-text-body/60 font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={c.status} />
                <ChevronRight className="w-4.5 h-4.5 text-text-body/40 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MyComplaints() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <MyComplaintsContent />
    </Suspense>
  );
}
