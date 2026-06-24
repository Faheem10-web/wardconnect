'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, Search, X, CheckCircle2, Clock, MessageSquare, Send, 
  User, MapPin, AlertCircle, Calendar, RefreshCw, UploadCloud, ShieldAlert
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const WORKFLOW_STEPS = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [activeMobileTab, setActiveMobileTab] = useState('pending'); // 'pending' | 'progress' | 'completed'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newUpdateMessage, setNewUpdateMessage] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImage, setAfterImage] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle URL redirect query for detailed action from other dashboards
  useEffect(() => {
    if (typeof window !== 'undefined' && complaints.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        const found = complaints.find(c => c._id === targetId);
        if (found) {
          selectComplaintItem(found);
        }
      }
    }
  }, [complaints]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
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

  const selectComplaintItem = (c) => {
    setSelectedComplaint(c);
    setAssignee(c.assignee || '');
    setPriority(c.priority || 'Medium');
    setAdminNotes(c.adminNotes || '');
    setResolutionNotes(c.resolutionNotes || '');
    setAfterImage(c.afterImage || '');
  };

  const handleUpdateField = async (fieldName, val) => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: val }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setComplaints(prev => prev.map(item => item._id === data.complaint._id ? data.complaint : item));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newDetailedStatus) => {
    await handleUpdateField('detailedStatus', newDetailedStatus);
  };

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);
    await handleUpdateField('priority', newPriority);
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes, resolutionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setComplaints(prev => prev.map(item => item._id === data.complaint._id ? data.complaint : item));
        alert('Notes saved successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAfterImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setAfterImage(reader.result);
        await handleUpdateField('afterImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateMessage || !selectedComplaint) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_public_update', message: newUpdateMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setComplaints(prev => prev.map(item => item._id === data.complaint._id ? data.complaint : item));
        setNewUpdateMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    await handleUpdateField('assignee', assignee);
    alert('Assignee updated successfully!');
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c._id.includes(search);
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Kanban Grouping: Pending, In Progress, Completed
  const pendingQueue = filtered.filter(c => c.status === 'Pending');
  const progressQueue = filtered.filter(c => c.status === 'In Progress');
  const completedQueue = filtered.filter(c => c.status === 'Completed');

  const categoriesList = ['All', 'Road Damage', 'Street Light', 'Water Supply', 'Garbage', 'Drainage', 'Public Safety', 'Other'];

  const priorityColors = {
    Low: 'bg-slate-100 text-slate-700',
    Medium: 'bg-blue-50 text-blue-700',
    High: 'bg-amber-50 text-amber-700',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200/50 font-bold'
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 text-text-body">
      
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border/50 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-title">Complaints Dispatcher</h2>
          <p className="text-xs text-text-body">Manage priority status updates, assignee mapping, and timeline updates.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-card-border bg-card-bg text-text-title text-xs rounded-xl outline-none focus:border-primary-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="flex-grow sm:flex-grow-0 px-3 py-2 rounded-xl border border-card-border bg-card-bg text-xs font-bold text-text-title outline-none focus:border-primary-500 cursor-pointer"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat} Filter</option>
              ))}
            </select>

            <button
              onClick={fetchComplaints}
              className="p-2 border border-card-border bg-card-bg rounded-xl text-text-title hover:bg-card-border/40 cursor-pointer shrink-0"
              title="Refresh Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
          {/* Mobile Kanban Tab Controls */}
          <div className="flex md:hidden bg-bg-base border border-card-border p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveMobileTab('pending')}
              className={`flex-grow py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeMobileTab === 'pending'
                  ? 'bg-white text-text-title shadow-xs border border-card-border/60'
                  : 'text-text-body hover:text-text-title'
              }`}
            >
              Pending ({pendingQueue.length})
            </button>
            <button
              onClick={() => setActiveMobileTab('progress')}
              className={`flex-grow py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeMobileTab === 'progress'
                  ? 'bg-white text-text-title shadow-xs border border-card-border/60'
                  : 'text-text-body hover:text-text-title'
              }`}
            >
              In Progress ({progressQueue.length})
            </button>
            <button
              onClick={() => setActiveMobileTab('completed')}
              className={`flex-grow py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeMobileTab === 'completed'
                  ? 'bg-white text-text-title shadow-xs border border-card-border/60'
                  : 'text-text-body hover:text-text-title'
              }`}
            >
              Completed ({completedQueue.length})
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Intake queue */}
            <div className={`bg-bg-base border border-card-border/50 rounded-2xl p-4 space-y-4 ${activeMobileTab === 'pending' ? 'block' : 'hidden md:block'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-card-border/40">
              <span className="text-xs font-black text-text-title uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                Pending Intake
              </span>
              <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">{pendingQueue.length}</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto premium-scroll pr-1">
              {pendingQueue.map(c => (
                <div 
                  key={c._id}
                  onClick={() => selectComplaintItem(c)}
                  className="bg-white border border-card-border rounded-xl p-4 hover:border-primary-400 cursor-pointer shadow-sm transition-all duration-300 hover:-translate-y-0.5 space-y-2.5"
                >
                  <p className="font-bold text-xs text-text-title leading-normal line-clamp-2">{c.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 bg-bg-base rounded text-text-body text-[8px] font-bold uppercase tracking-wider">{c.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${priorityColors[c.priority || 'Medium']}`}>
                      {c.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="text-[9px] text-text-body font-semibold flex items-center justify-between pt-1.5 border-t border-card-border/30">
                    <span className="text-primary-500 font-bold">{c.detailedStatus || 'Submitted'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {pendingQueue.length === 0 && (
                <p className="text-center py-6 text-[10px] text-text-body/60 italic font-semibold">No complaints in queue.</p>
              )}
            </div>
          </div>

            {/* In Resolution Queue */}
            <div className={`bg-bg-base border border-card-border/50 rounded-2xl p-4 space-y-4 ${activeMobileTab === 'progress' ? 'block' : 'hidden md:block'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-card-border/40">
              <span className="text-xs font-black text-text-title uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
                In Resolution
              </span>
              <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">{progressQueue.length}</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto premium-scroll pr-1">
              {progressQueue.map(c => (
                <div 
                  key={c._id}
                  onClick={() => selectComplaintItem(c)}
                  className="bg-white border border-card-border rounded-xl p-4 hover:border-primary-400 cursor-pointer shadow-sm transition-all duration-300 hover:-translate-y-0.5 space-y-2.5"
                >
                  <p className="font-bold text-xs text-text-title leading-normal line-clamp-2">{c.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 bg-bg-base rounded text-text-body text-[8px] font-bold uppercase tracking-wider">{c.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${priorityColors[c.priority || 'Medium']}`}>
                      {c.priority || 'Medium'}
                    </span>
                  </div>
                  {c.assignee && (
                    <p className="text-[9px] font-bold text-primary-500 flex items-center gap-1 pt-0.5">
                      <User className="w-3 h-3" /> Assignee: {c.assignee}
                    </p>
                  )}
                  <div className="text-[9px] text-text-body font-semibold flex items-center justify-between pt-1.5 border-t border-card-border/30">
                    <span className="text-warning font-bold">{c.detailedStatus || 'In Progress'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {progressQueue.length === 0 && (
                <p className="text-center py-6 text-[10px] text-text-body/60 italic font-semibold">No complaints in progress.</p>
              )}
            </div>
          </div>

            {/* Resolved/Closed Queue */}
            <div className={`bg-bg-base border border-card-border/50 rounded-2xl p-4 space-y-4 ${activeMobileTab === 'completed' ? 'block' : 'hidden md:block'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-card-border/40">
              <span className="text-xs font-black text-text-title uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                Completed
              </span>
              <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">{completedQueue.length}</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto premium-scroll pr-1">
              {completedQueue.map(c => (
                <div 
                  key={c._id}
                  onClick={() => selectComplaintItem(c)}
                  className="bg-white border border-card-border rounded-xl p-4 hover:border-primary-400 cursor-pointer shadow-sm transition-all duration-300 hover:-translate-y-0.5 space-y-2.5"
                >
                  <p className="font-bold text-xs text-text-title leading-normal line-clamp-2">{c.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 bg-bg-base rounded text-text-body text-[8px] font-bold uppercase tracking-wider">{c.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${priorityColors[c.priority || 'Medium']}`}>
                      {c.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="text-[9px] text-text-body font-semibold flex items-center justify-between pt-1.5 border-t border-card-border/30">
                    <span className="text-success font-bold">{c.detailedStatus || 'Resolved'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {completedQueue.length === 0 && (
                <p className="text-center py-6 text-[10px] text-text-body/60 italic font-semibold">No resolved complaints.</p>
              )}
            </div>
          </div>

        </div>
        </>
      )}

      {/* Slide-out Drawer details panel */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedComplaint(null)} />
          
          <div className="relative bg-card-bg border-l border-card-border w-full max-w-lg h-full overflow-y-auto shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-350 pr-1">
            <div>
              {/* Header */}
              <div className="sticky top-0 bg-card-bg border-b border-card-border/50 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h3 className="font-display font-extrabold text-base text-text-title">Case Controller Drawer</h3>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{selectedComplaint._id}</span>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 text-text-body/60 hover:text-text-title rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content body */}
              <div className="p-4 sm:p-6 space-y-6">
                
                {/* Reporter / Category grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-base p-4 border border-card-border rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[9px] text-text-body/60 font-bold uppercase tracking-widest block">Reporter Details</span>
                    <p className="text-xs font-bold text-text-title">{selectedComplaint.name}</p>
                    <p className="text-[10px] text-text-body/80">{selectedComplaint.email}</p>
                    <p className="text-[10px] text-text-body/80">{selectedComplaint.phone}</p>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <span className="text-[9px] text-text-body/60 font-bold uppercase tracking-widest block">Location & Category</span>
                    <p className="text-xs font-bold text-text-title">{selectedComplaint.category}</p>
                    <p className="text-[10px] text-text-body/80 flex items-center sm:justify-end gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedComplaint.location}</p>
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-text-title">{selectedComplaint.title}</h4>
                  <p className="text-text-body text-xs leading-relaxed bg-bg-base p-4 rounded-xl border border-card-border/40">{selectedComplaint.description}</p>
                </div>

                {/* Citizen Photo attachment */}
                {selectedComplaint.image && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-text-body/60 font-bold uppercase tracking-widest block">Citizen Intake Attachment</span>
                    <div className="rounded-xl overflow-hidden border border-card-border max-h-52">
                      <img src={selectedComplaint.image} alt="Issue Visual" className="w-full object-cover" />
                    </div>
                  </div>
                )}

                 {/* Priority updates */}
                <div className="space-y-3 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Priority Level</h4>
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITY_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handlePriorityChange(opt)}
                        disabled={isUpdating}
                        className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          priority === opt
                            ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                            : 'bg-card-bg text-text-body border-card-border hover:bg-card-border/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Status Options */}
                <div className="space-y-3 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Update Detailed workflow Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {WORKFLOW_STEPS.map(step => {
                      const isActive = (selectedComplaint.detailedStatus || 'Submitted') === step;
                      return (
                        <button
                          key={step}
                          onClick={() => handleStatusChange(step)}
                          disabled={isUpdating}
                          className={`px-3 py-2 sm:px-3 sm:py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                              : 'bg-card-bg text-text-body border-card-border hover:bg-card-border/30'
                          }`}
                        >
                          {step}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assign to Representative */}
                <div className="space-y-3 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Assign Dispatch Staff / Ward Representative</h4>
                  <form onSubmit={handleAssignSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={assignee}
                      onChange={e => setAssignee(e.target.value)}
                      placeholder="E.g. Marcus Vance, John Staff..."
                      className="flex-grow px-3 py-2 border border-card-border bg-white text-text-title text-xs rounded-xl outline-none focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Assign
                    </button>
                  </form>
                </div>

                {/* Resolution Remarks & Official Notes */}
                <div className="space-y-4 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Notes Panel</h4>
                  
                  <form onSubmit={handleSaveNotes} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-title uppercase tracking-widest">Internal Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Log internal comments, dispatch actions..."
                        rows={2}
                        className="w-full px-3 py-2 border border-card-border bg-white text-text-title text-xs rounded-xl outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-title uppercase tracking-widest">Resolution Remarks (Visible to Citizen)</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        placeholder="Explain resolution details to the reporting citizen..."
                        rows={2}
                        className="w-full px-3 py-2 border border-card-border bg-white text-text-title text-xs rounded-xl outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Save Remarks & Notes
                    </button>
                  </form>
                </div>

                {/* Upload Resolution Images (After Image) */}
                <div className="space-y-3 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Upload Resolution Photo (After Image)</h4>
                  <div className="border-2 border-dashed border-card-border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-bg-base hover:bg-bg-base transition-all relative">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAfterImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {afterImage ? (
                      <div className="space-y-2 w-full">
                        <div className="h-32 w-full rounded-lg overflow-hidden border border-card-border">
                          <img src={afterImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-primary-500">Tap to replace resolution photo</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pointer-events-none">
                        <UploadCloud className="w-6 h-6 text-text-body/50 mx-auto" />
                        <p className="text-xs font-bold text-text-title">Choose image file</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Public Timeline Updates */}
                <div className="space-y-3 border-t border-card-border/50 pt-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-title">Public Updates Timeline</h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto premium-scroll pr-1">
                    {selectedComplaint.publicUpdates?.map((update, i) => (
                      <div key={i} className="bg-primary-50 p-3 rounded-xl border border-primary-100 text-xs text-text-body">
                        <p className="font-medium text-text-title">{update.message}</p>
                        <span className="text-[9px] text-text-body/70 mt-1 block">{new Date(update.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                    {(!selectedComplaint.publicUpdates || selectedComplaint.publicUpdates.length === 0) && (
                      <p className="text-[10px] text-text-body/60 italic font-semibold">No updates posted yet.</p>
                    )}
                  </div>
                  
                  <form onSubmit={handleAddUpdate} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newUpdateMessage}
                      onChange={e => setNewUpdateMessage(e.target.value)}
                      placeholder="Add public resolution logs for citizen..."
                      className="flex-grow px-3 py-2 border border-card-border bg-white text-text-title text-xs rounded-xl outline-none focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={isUpdating || !newUpdateMessage}
                      className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Post
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
