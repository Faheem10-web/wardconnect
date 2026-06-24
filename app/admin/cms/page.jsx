'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Database, Save, Layout, User, Phone, MapPin, CheckCircle, AlertCircle, UploadCloud, Trash2 } from 'lucide-react';

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
    heroUploadedImage: '',
    heroBanners: [],
    autoSlideDuration: 5,
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

  const handleUploadFile = async (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: 'Uploading image to local server...', type: 'info' });

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setFormData(prev => ({ ...prev, heroUploadedImage: resData.url }));
        setMessage({ text: 'Image uploaded successfully! Remember to Save Settings to persist changes.', type: 'success' });
      } else {
        throw new Error(resData.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Image upload failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBannerFile = async (bannerId, file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: 'Uploading image to local server...', type: 'info' });

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        updateBannerField(bannerId, 'uploadedImage', resData.url);
        setMessage({ text: 'Banner image uploaded successfully! Save Settings to apply.', type: 'success' });
      } else {
        throw new Error(resData.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Image upload failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateBannerField = (bannerId, fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      heroBanners: (prev.heroBanners || []).map(b => b.id === bannerId ? { ...b, [fieldName]: value } : b)
    }));
  };

  const addBanner = () => {
    const banners = formData.heroBanners || [];
    if (banners.length >= 5) {
      setMessage({ text: 'You can only configure up to 5 slider banners.', type: 'error' });
      return;
    }

    const newBanner = {
      id: `banner-${Date.now()}`,
      titleEn: '',
      titleMl: '',
      descriptionEn: '',
      descriptionMl: '',
      image: '',
      uploadedImage: '',
      order: banners.length,
      isActive: true
    };

    setFormData(prev => ({
      ...prev,
      heroBanners: [...banners, newBanner]
    }));
  };

  const removeBanner = (bannerId) => {
    if (!confirm('Are you sure you want to remove this banner?')) return;
    setFormData(prev => ({
      ...prev,
      heroBanners: (prev.heroBanners || []).filter(b => b.id !== bannerId)
    }));
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
            : message.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
              : 'bg-danger/10 border-danger/20 text-danger'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-card-border/60 pb-1.5 gap-4 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'hero' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <Layout className="w-4 h-4 shrink-0" />
          Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('member')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'member' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          Ward Member Profile
        </button>
        <button
          onClick={() => setActiveTab('office')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'office' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-text-body/60 hover:text-text-title'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          Office & Location
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-card-bg border border-card-border/80 rounded-2xl p-4 sm:p-8 shadow-sm space-y-6">
        
        {activeTab === 'hero' && (
          <div className="space-y-6">
            {/* 1. Auto Slide Duration Control */}
            <div className="bg-bg-base p-4 border border-card-border rounded-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-text-title">Auto Slide Duration</h4>
                <p className="text-[10px] text-text-body/65 mt-0.5">Control how fast the homepage slider switches active banners.</p>
              </div>
              <select
                name="autoSlideDuration"
                value={formData.autoSlideDuration || 5}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-card-border bg-white text-xs font-bold text-text-title cursor-pointer outline-none focus:border-primary-500"
              >
                <option value={3}>3 Seconds</option>
                <option value={5}>5 Seconds</option>
                <option value={8}>8 Seconds</option>
                <option value={10}>10 Seconds</option>
              </select>
            </div>

            {/* 2. Fallback configuration details */}
            <details className="bg-bg-base/20 border border-card-border rounded-xl overflow-hidden group">
              <summary className="p-4 cursor-pointer font-bold text-xs text-text-title flex justify-between items-center hover:bg-bg-base/40">
                <span>Static Fallback Banner Configuration</span>
                <span className="text-[10px] font-semibold text-primary-600 group-open:hidden">Show fallback details</span>
                <span className="text-[10px] font-semibold text-primary-600 hidden group-open:inline">Hide fallback details</span>
              </summary>
              <div className="p-4 border-t border-card-border space-y-4 bg-white">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-card-border pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-title block">Option A: Hero Image URL</label>
                    <input
                      type="text"
                      name="heroImage"
                      value={formData.heroImage}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-title block">Option B: Upload Custom Hero Image</label>
                    {formData.heroUploadedImage ? (
                      <div className="border border-card-border rounded-xl p-3 bg-bg-base space-y-3">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-card-border relative group bg-white">
                          <img src={formData.heroUploadedImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Upload active</span>
                          <button type="button" onClick={() => setFormData(p => ({ ...p, heroUploadedImage: '' }))} className="text-[10px] font-bold text-rose-600">Remove Image</button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-card-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-bg-base min-h-[140px] relative">
                        <input type="file" onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData(p => ({ ...p, heroUploadedImage: reader.result }));
                            reader.readAsDataURL(file);
                          }
                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <UploadCloud className="w-6 h-6 text-text-body/50 mb-1" />
                        <p className="text-xs font-bold text-text-title">Click to upload image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </details>

            {/* 3. Hero Banners Management System */}
            <div className="space-y-4 pt-4 border-t border-card-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-extrabold text-base text-text-title">Slider Banners Configuration</h3>
                  <p className="text-[10px] text-text-body/60 mt-0.5">Manage up to 5 slider banners for the dynamic homepage showcase.</p>
                </div>
                <button
                  type="button"
                  onClick={addBanner}
                  disabled={(formData.heroBanners || []).length >= 5}
                  className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition-all cursor-pointer"
                >
                  + Add Slider Banner ({(formData.heroBanners || []).length}/5)
                </button>
              </div>

              <div className="space-y-4">
                {(formData.heroBanners || [])
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((banner, index) => (
                    <div key={banner.id} className="border border-card-border rounded-2xl bg-white p-4 sm:p-5 space-y-4 shadow-sm">
                      {/* Banner Header Controls */}
                      <div className="flex flex-wrap items-center justify-between border-b border-card-border pb-3 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-text-title">
                            {banner.titleEn || `Untitled Banner ${index + 1}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Active state toggle */}
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={banner.isActive}
                              onChange={(e) => updateBannerField(banner.id, 'isActive', e.target.checked)}
                              className="w-3.5 h-3.5 accent-primary-600 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold uppercase text-text-body">Active</span>
                          </label>

                          {/* Display Order */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-body font-bold uppercase">Order:</span>
                            <input 
                              type="number"
                              value={banner.order || 0}
                              onChange={(e) => updateBannerField(banner.id, 'order', parseInt(e.target.value) || 0)}
                              className="w-12 px-1.5 py-0.5 border border-card-border rounded bg-white text-xs font-bold text-center outline-none"
                            />
                          </div>

                          {/* Delete Trigger */}
                          <button
                            type="button"
                            onClick={() => removeBanner(banner.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Banner Forms */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-title">Banner Title (English)</label>
                          <input
                            type="text"
                            value={banner.titleEn || ''}
                            onChange={(e) => updateBannerField(banner.id, 'titleEn', e.target.value)}
                            placeholder="Welcome message title..."
                            className="w-full px-3 py-2 rounded-lg border border-card-border bg-bg-base text-text-title text-xs outline-none focus:border-primary-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-title">Banner Title (Malayalam)</label>
                          <input
                            type="text"
                            value={banner.titleMl || ''}
                            onChange={(e) => updateBannerField(banner.id, 'titleMl', e.target.value)}
                            placeholder="സ്വാഗതം സന്ദേശം..."
                            className="w-full px-3 py-2 rounded-lg border border-card-border bg-bg-base text-text-title text-xs outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-title">Description (English)</label>
                          <textarea
                            value={banner.descriptionEn || ''}
                            onChange={(e) => updateBannerField(banner.id, 'descriptionEn', e.target.value)}
                            placeholder="English description paragraph..."
                            rows={2.5}
                            className="w-full px-3 py-2 rounded-lg border border-card-border bg-bg-base text-text-title text-xs outline-none focus:border-primary-500 resize-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-title">Description (Malayalam)</label>
                          <textarea
                            value={banner.descriptionMl || ''}
                            onChange={(e) => updateBannerField(banner.id, 'descriptionMl', e.target.value)}
                            placeholder="മലയാളം വിവരണം..."
                            rows={2.5}
                            className="w-full px-3 py-2 rounded-lg border border-card-border bg-bg-base text-text-title text-xs outline-none focus:border-primary-500 resize-none"
                          />
                        </div>
                      </div>

                      {/* Banner Image Handlers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-card-border/40 pt-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-title uppercase tracking-wider block">Image URL fallback</label>
                          <input
                            type="text"
                            value={banner.image || ''}
                            onChange={(e) => updateBannerField(banner.id, 'image', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 rounded-lg border border-card-border bg-bg-base text-text-title text-xs outline-none focus:border-primary-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-title uppercase tracking-wider block">Local Upload</label>
                          {banner.uploadedImage ? (
                            <div className="border border-card-border rounded-xl p-2.5 bg-bg-base space-y-2 relative">
                              <div className="aspect-video w-full max-h-32 rounded-lg overflow-hidden border border-card-border relative group bg-white">
                                <img src={banner.uploadedImage} alt="Banner Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`banner-upload-${banner.id}`).click()}
                                    className="px-2.5 py-1 bg-white text-text-title rounded text-[10px] font-bold shadow-sm"
                                  >
                                    Replace
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Upload Active</span>
                                <button type="button" onClick={() => updateBannerField(banner.id, 'uploadedImage', '')} className="text-rose-600 font-bold">Remove Image</button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-primary-500');
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary-500');
                              }}
                              onDrop={async (e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary-500');
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                  await handleUploadBannerFile(banner.id, file);
                                }
                              }}
                              className="border-2 border-dashed border-card-border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-bg-base hover:bg-card-border/30 transition-all relative min-h-[90px] cursor-pointer"
                            >
                              <input 
                                type="file"
                                id={`banner-upload-${banner.id}`}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    await handleUploadBannerFile(banner.id, file);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <UploadCloud className="w-5 h-5 text-text-body/50" />
                              <span className="text-[10px] font-bold text-text-title mt-1">Drag & Drop or Click to Upload</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}

                {(formData.heroBanners || []).length === 0 && (
                  <div className="border border-dashed border-card-border rounded-2xl p-12 text-center text-text-body/60 flex flex-col items-center justify-center gap-2 bg-bg-base/40">
                    <Layout className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-xs uppercase tracking-wider">No dynamic slider banners defined.</p>
                    <p className="text-[10px] text-text-body/75">Add a banner using the button above to enable the dynamic homepage slider.</p>
                  </div>
                )}
              </div>
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
