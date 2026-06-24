'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Users, ShieldCheck, Mail, Calendar, Phone } from 'lucide-react';

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCitizens(data.users || []);
        }
      }
    } catch (err) {
      console.error('Error fetching citizens list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = citizens.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 text-text-body">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border/50 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-title flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            Citizen Directory
          </h2>
          <p className="text-xs text-text-body">Review, manage, and dispatch communications to registered citizens.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search citizens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-card-border bg-card-bg text-text-title text-xs rounded-xl outline-none focus:border-primary-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Directory Content */}
      <div className="bg-card-bg border border-card-border/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-base border-b border-card-border text-text-body font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Mobile Number</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-card-border/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-title flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                        {c.name?.charAt(0)}
                      </div>
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-text-body font-medium">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.email}</span>
                    </td>
                    <td className="px-6 py-4 text-text-body font-bold">
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.phone || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-primary-100 uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        {c.role || 'citizen'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-body/60 font-semibold">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-xs text-text-body/60 italic font-semibold">
                      No citizens matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
