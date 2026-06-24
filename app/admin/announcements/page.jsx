'use client';

import { useState, useEffect } from 'react';
import { Loader2, Megaphone, Plus, Clock, FileText, AlertTriangle } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !content) {
      setError('Please provide both title and content.');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Announcement published successfully!');
        setAnnouncements(prev => [data.announcement, ...prev]);
        setTitle('');
        setContent('');
        setType('general');
      } else {
        throw new Error(data.error || 'Failed to publish announcement');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 text-text-body">
      
      {/* Header */}
      <div className="border-b border-card-border/50 pb-4">
        <h2 className="font-display font-extrabold text-2xl text-text-title flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary-600" />
          Community Announcements
        </h2>
        <p className="text-xs text-text-body">Publish alerts and project declarations for citizens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form column */}
        <div className="bg-card-bg border border-card-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-primary-500" /> Publish Announcement
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs font-semibold text-danger flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-xs font-semibold text-success">
                {success}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g. Roadwork on Central Avenue"
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Broadcast Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              >
                <option value="general">General Advisory</option>
                <option value="project">Project Work</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Content Body</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                placeholder="Details of the announcement..."
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title">Active Broadcasts</h3>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
          ) : (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="bg-card-bg border border-card-border/80 rounded-2xl p-12 text-center text-text-body/60 flex flex-col items-center justify-center gap-2 shadow-sm">
                  <FileText className="w-8 h-8 text-slate-300" />
                  <p className="font-semibold text-xs uppercase tracking-wider">No active broadcasts logged.</p>
                </div>
              ) : (
                announcements.map((ann) => {
                  const badgeColors = {
                    emergency: 'bg-rose-50 text-rose-700 border-rose-100',
                    project: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    general: 'bg-gray-50 text-gray-700 border-gray-200'
                  };

                  return (
                    <div key={ann._id} className="bg-card-bg border border-card-border/80 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${badgeColors[ann.type] || badgeColors.general}`}>
                          {ann.type}
                        </span>
                        <span className="text-[10px] text-text-body/50 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-text-title text-sm">{ann.title}</h4>
                      <p className="text-text-body text-xs leading-relaxed">{ann.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
