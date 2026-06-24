'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Database, Save, Layout, User, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminCms() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'member' | 'office'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' | 'error'

  const [formData, setFormData] = useState({
    heroTitleEn: '',
    heroTitleMl: '',
    heroDescriptionEn: '',
    heroDescriptionMl: '',
    heroImage: '',
    wardMemberPhoto: '',
    wardMemberName: '',
    wardMemberRoleEn: '',
    wardMemberRoleMl: '',
    wardMemberQuoteEn: '',
    wardMemberQuoteMl: '',
    wardMemberPhone: '',
    wardMemberEmail: '',
    wardNumber: 4,
    locationNameEn: '',
    locationNameMl: '',
    officeAddressEn: '',
    officeAddressMl: '',
    officePhone: '',
    officeEmail: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms');
      const data = await res.json();
      if (data.success && data.settings) {
        setFormData(data.settings);
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Failed to load CMS settings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ text: 'CMS content updated successfully!', type: 'success' });
        setFormData(data.settings);
      } else {
        throw new Error(data.error || 'Failed to update CMS');
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-2 text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-xs text-slate-400 font-semibold">Loading CMS content model...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-text-body pb-12">
      <div className="border-b border-card-border/50 pb-4">
        <h2 className="font-display font-extrabold text-2xl text-text-title flex items-center gap-2">
          <Database className="w-6 h-6 text-primary-500" />
          Content Management System
        </h2>
        <p className="text-xs text-text-body">Customize public pages, hero copies, language text blocks, and ward profiles.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border flex items-start gap-2 text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-success/10 border-success/20 text-success' 
            : 'bg-danger/10 border-danger/20 text-danger'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-card-border/60 pb-1.5 gap-4">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'hero' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <Layout className="w-4 h-4" />
          Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('member')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'member' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <User className="w-4 h-4" />
          Ward Member Profile
        </button>
        <button
          onClick={() => setActiveTab('office')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'office' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Office & Location
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-card-bg border border-card-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-text-title uppercase tracking-wider border-b border-card-border pb-2">Hero Welcome Content</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Hero Title (English)</label>
                <input
                  type="text"
                  name="heroTitleEn"
                  value={formData.heroTitleEn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Hero Title (Malayalam)</label>
                <input
                  type="text"
                  name="heroTitleMl"
                  value={formData.heroTitleMl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Hero Description (English)</label>
              <textarea
                name="heroDescriptionEn"
                value={formData.heroDescriptionEn}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Hero Description (Malayalam)</label>
              <textarea
                name="heroDescriptionMl"
                value={formData.heroDescriptionMl}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Hero Image URL</label>
              <input
                type="text"
                name="heroImage"
                value={formData.heroImage}
                onChange={handleChange}
                placeholder="https://unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-text-title uppercase tracking-wider border-b border-card-border pb-2">Ward Member Info</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Member Full Name</label>
                <input
                  type="text"
                  name="wardMemberName"
                  value={formData.wardMemberName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Photo URL</label>
                <input
                  type="text"
                  name="wardMemberPhoto"
                  value={formData.wardMemberPhoto}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Role Designation (English)</label>
                <input
                  type="text"
                  name="wardMemberRoleEn"
                  value={formData.wardMemberRoleEn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Role Designation (Malayalam)</label>
                <input
                  type="text"
                  name="wardMemberRoleMl"
                  value={formData.wardMemberRoleMl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Contact Mobile</label>
                <input
                  type="text"
                  name="wardMemberPhone"
                  value={formData.wardMemberPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Contact Email</label>
                <input
                  type="email"
                  name="wardMemberEmail"
                  value={formData.wardMemberEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Member Message (English)</label>
              <textarea
                name="wardMemberQuoteEn"
                value={formData.wardMemberQuoteEn}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Member Message (Malayalam)</label>
              <textarea
                name="wardMemberQuoteMl"
                value={formData.wardMemberQuoteMl}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'office' && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-text-title uppercase tracking-wider border-b border-card-border pb-2">Ward Office & Address</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Ward Number</label>
                <input
                  type="number"
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Location Name (English)</label>
                <input
                  type="text"
                  name="locationNameEn"
                  value={formData.locationNameEn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Location Name (Malayalam)</label>
                <input
                  type="text"
                  name="locationNameMl"
                  value={formData.locationNameMl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Office Phone</label>
                <input
                  type="text"
                  name="officePhone"
                  value={formData.officePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-title">Office Email</label>
                <input
                  type="email"
                  name="officeEmail"
                  value={formData.officeEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Office Address (English)</label>
              <input
                type="text"
                name="officeAddressEn"
                value={formData.officeAddressEn}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-title">Office Address (Malayalam)</label>
              <input
                type="text"
                name="officeAddressMl"
                value={formData.officeAddressMl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-card-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 py-3 px-6 text-xs font-bold uppercase tracking-wider text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}
