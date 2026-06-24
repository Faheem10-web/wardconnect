'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Plus, Clock, MapPin, FileText, AlertTriangle } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
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
    if (!title || !description || !date || !location) {
      setError('Please provide all details (title, description, date, location).');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, location })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Event scheduled successfully!');
        setEvents(prev => [...prev, data.event].sort((a,b) => new Date(a.date) - new Date(b.date)));
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
      } else {
        throw new Error(data.error || 'Failed to schedule event');
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
          <Calendar className="w-6 h-6 text-primary-600" />
          Community Events
        </h2>
        <p className="text-xs text-text-body">Schedule public discussions, town hall sessions, and drives.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form column */}
        <div className="bg-card-bg border border-card-border/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-primary-500" /> Schedule Event
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
              <label className="text-xs font-bold text-text-title">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g. Block C Town Hall Meeting"
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="E.g. Community Center Hall 2"
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Event Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Details and purpose of the scheduled community event..."
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Event'}
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-title">Scheduled Registry</h3>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="bg-card-bg border border-card-border/80 rounded-2xl p-12 text-center text-text-body/60 flex flex-col items-center justify-center gap-2 shadow-sm">
                  <FileText className="w-8 h-8 text-slate-300" />
                  <p className="font-semibold text-xs uppercase tracking-wider">No scheduled events logged.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event._id} className="bg-card-bg border border-card-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-text-title text-sm leading-normal">{event.title}</h4>
                      <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Calendar className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="text-text-body text-xs leading-relaxed">{event.description}</p>
                    <div className="pt-2.5 border-t border-card-border/30 space-y-1 text-[10px] text-text-body font-medium">
                      <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
