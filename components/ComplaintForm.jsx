'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, UploadCloud, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Road Damage',
  'Street Light',
  'Water Supply',
  'Garbage',
  'Drainage',
  'Public Safety',
  'Other'
];

export default function ComplaintForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    }
  }, [status, router]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Road Damage',
    location: '',
    image: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!session?.user) {
      setError('You must be logged in to submit a complaint.');
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        image: formData.image,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setSuccess('Complaint submitted successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-card-bg border border-card-border/80 rounded-2xl shadow-xl overflow-hidden text-text-body">
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
        
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger font-semibold text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3 text-success font-semibold text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <div className="space-y-5">
          
          {/* Reporter Details (Auto-filled) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-bg-base p-4 rounded-xl border border-card-border mb-2 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-text-body uppercase tracking-widest block">Reporter Name</label>
              <input 
                type="text"
                disabled
                value={session?.user?.name || ''}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-card-border/40 bg-card-border/20 text-text-body/60 outline-none cursor-not-allowed font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-body uppercase tracking-widest block">Email Address</label>
              <input 
                type="email"
                disabled
                value={session?.user?.email || ''}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-card-border/40 bg-card-border/20 text-text-body/60 outline-none cursor-not-allowed font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-body uppercase tracking-widest block">Mobile Number</label>
              <input 
                type="tel"
                disabled
                value={session?.user?.phone || ''}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-card-border/40 bg-card-border/20 text-text-body/60 outline-none cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Complaint Title <span className="text-danger">*</span></label>
              <input 
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g. Damaged drainage cover on main road"
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Category <span className="text-danger">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-title">Location Details <span className="text-danger">*</span></label>
            <input 
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="E.g. Sector C, near community entrance"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-title">Detailed Description <span className="text-danger">*</span></label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the neighborhood issue..."
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-title">Upload Image (Optional)</label>
            <div className="border-2 border-dashed border-card-border rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-bg-base hover:bg-bg-base transition-colors relative">
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {formData.image ? (
                <div className="space-y-2 w-full">
                  <div className="h-44 w-full rounded-xl overflow-hidden border border-card-border">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-primary-600">Click or tap to replace image</p>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-text-body/50 mx-auto" />
                  <p className="text-sm font-semibold text-text-title">Choose image file</p>
                  <p className="text-xs text-text-body/60">PNG, JPG, or JPEG up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-card-border/55">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Issue...</>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
