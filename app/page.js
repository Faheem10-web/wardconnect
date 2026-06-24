'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ShieldCheck, Mail, Lock, Phone, User, Landmark, 
  Loader2, AlertTriangle, CheckCircle2, Activity, LogIn, X, Megaphone, Bell, Users, MapPin, Clock, Calendar,
  Globe, AlertCircle, Compass, HardHat, Droplet, Trash2, ShieldAlert, Sparkles
} from 'lucide-react';

const MOCK_ANNOUNCEMENTS = [
  {
    _id: 'mock-1',
    title: 'Water Main Maintenance Scheduled',
    content: 'Scheduled maintenance of the primary water pipeline in Ward 4 will occur on June 28, from 9:00 AM to 3:00 PM. Please store water in advance.',
    type: 'project',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-2',
    title: 'Traffic Diversion near Central Avenue',
    content: 'Urgent drainage pipeline repairs are being carried out near the Central Avenue junction. Please follow temporary route diversions.',
    type: 'emergency',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-3',
    title: 'New Streetlight Installation Approved',
    content: 'The municipal committee has approved the installation of 45 new LED streetlights across Block C and Main Avenue starting next week.',
    type: 'general',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_RESOLVED = [
  {
    _id: 'resolved-1',
    title: 'Damaged Drainage Cover on Park Road',
    category: 'Drainage',
    location: 'Near Block A Entrance',
    description: 'An open drainage manhole was posing a severe hazard to children and pedestrians. Resolved with a brand new concrete manhole cover.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'resolved-2',
    title: 'Streetlights Out for Entire Block B',
    category: 'Street Light',
    location: 'Block B Main Road',
    description: 'Three consecutive streetlights were completely dark, causing safety issues at night. The electrical department replaced the bulbs and wiring.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'resolved-3',
    title: 'Garbage Accumulation Near Community Center',
    category: 'Garbage',
    location: 'Sector 4 Playground Lane',
    description: 'Illegal waste dumping had accumulated for over a week, causing bad odor. Cleared fully and added a "No Dumping" warning sign.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_EVENTS = [
  {
    _id: 'event-1',
    title: 'Town Hall Meeting',
    description: 'Join Ward Member Marcus Vance to discuss neighborhood safety and upcoming infrastructure development.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Ward 4 Community Hall'
  },
  {
    _id: 'event-2',
    title: 'Cleanliness Drive',
    description: 'Help keep Block C clean and green. Garbage bags and gloves will be provided to all volunteers.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Sector 4 Playground'
  }
];

const QUICK_SERVICES_LIST = [
  { en: 'Road Damage', ml: 'റോഡ് പരാതി', category: 'Road Damage', icon: HardHat, bg: 'bg-teal-50 text-teal-600' },
  { en: 'Street Light', ml: 'തെരുവ് വിളക്ക്', category: 'Street Light', icon: Bell, bg: 'bg-amber-50 text-amber-600' },
  { en: 'Water Supply', ml: 'കുടിവെള്ളം', category: 'Water Supply', icon: Droplet, bg: 'bg-sky-50 text-sky-600' },
  { en: 'Garbage Dump', ml: 'മാലിന്യ പ്രശ്നം', category: 'Garbage', icon: Trash2, bg: 'bg-red-50 text-red-600' },
  { en: 'Drainage Issue', ml: 'ഡ്രെയിനേജ് പ്രശ്നം', category: 'Drainage', icon: Activity, bg: 'bg-purple-50 text-purple-600' },
  { en: 'Public Safety', ml: 'പൊതു സുരക്ഷ', category: 'Public Safety', icon: ShieldCheck, bg: 'bg-indigo-50 text-indigo-600' },
  { en: 'Ward Office', ml: 'ഓഫീസ് വിവരങ്ങൾ', category: 'Other', icon: Landmark, bg: 'bg-emerald-50 text-emerald-600' },
  { en: 'Other Queries', ml: 'മറ്റ് പരാതികൾ', category: 'Other', icon: Compass, bg: 'bg-gray-50 text-gray-600' }
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lang, setLang] = useState('en');
  const [stats, setStats] = useState({ total: 18, resolved: 12, pending: 2, progress: 4 });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  // Dynamic CMS state
  const [cms, setCms] = useState({
    heroTitleEn: 'Building a Safer, Greener Connected Neighborhood',
    heroTitleMl: 'നമ്മുടെ വാർഡ് നമ്മുടെ ഉത്തരവാദിത്വം - സുരക്ഷിതവും ഹരിതാഭവുമായ അയൽപക്കം',
    heroDescriptionEn: 'WardConnect brings modern SaaS-level issue tracking to civic governance. File complaints, follow resolution milestones in real-time, and attend community events.',
    heroDescriptionMl: 'വാർഡ് കണക്ട് നിങ്ങളുടെ വാർഡിലെ പ്രശ്നങ്ങൾ വേഗത്തിൽ പരിഹരിക്കാൻ സഹായിക്കുന്നു. പരാതികൾ സമർപ്പിക്കുക, അവയുടെ പുരോഗതി തത്സമയം നിരീക്ഷിക്കുക.',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
    wardMemberPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    wardMemberName: 'Marcus Vance',
    wardMemberRoleEn: 'Ward Member, Ward 4 Representative',
    wardMemberRoleMl: 'വാർഡ് മെമ്പർ, നാലാം വാർഡ് പ്രതിനിധി',
    wardMemberQuoteEn: 'Welcome to WardConnect. We believe that communication is the foundation of civic trust. By offering this transparent intake platform, my committee is committed to resolving infrastructure problems and keeping our neighborhood safe, illuminated, and clean.',
    wardMemberQuoteMl: 'വാർഡ് കണക്ടിലേക്ക് സ്വാഗതം. പരസ്പരവിശ്വാസമാണ് ഭരണത്തിന്റെ അടിസ്ഥാനം. സുരക്ഷിതവും ശുചിത്വമുള്ളതുമായ ഒരു വാർഡ് നിർമ്മിക്കാൻ നിങ്ങളുടെ പിന്തുണ ഞങ്ങൾ പ്രതീക്ഷിക്കുന്നു.',
    wardMemberPhone: '(555) 019-9020',
    wardMemberEmail: 'vance@ward4.gov',
    wardNumber: 4,
    locationNameEn: 'Metro City',
    locationNameMl: 'മെട്രോ സിറ്റി',
    officeAddressEn: '123 Municipal Road, Ward 4, Metro City',
    officeAddressMl: '123 മുനിസിപ്പൽ റോഡ്, നാലാം വാർഡ്, മെട്രോ സിറ്റി',
    officePhone: '+1 (555) 019-2834',
    officeEmail: 'support@wardconnect.gov'
  });

  // Auth modal controls
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Handle auto-login redirection
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Handle redirect from protected routes (automatic modal trigger)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setAuthTab('login');
        setShowAuthModal(true);
      }
      
      setLang(localStorage.getItem('lang') || 'en');
      const handleLangChange = () => {
        setLang(localStorage.getItem('lang') || 'en');
      };
      window.addEventListener('languageChange', handleLangChange);
      return () => window.removeEventListener('languageChange', handleLangChange);
    }
  }, []);

  // Fetch data for statistics, announcements, events, completed complaints, and CMS settings
  useEffect(() => {
    async function loadPageData() {
      try {
        const [resComplaints, resAnn, resEv, resCms] = await Promise.all([
          fetch('/api/complaints'),
          fetch('/api/admin/announcements'),
          fetch('/api/admin/events'),
          fetch('/api/cms')
        ]);
        
        if (resComplaints.ok) {
          const dataComp = await resComplaints.json();
          if (dataComp.success) {
            const list = dataComp.complaints || [];
            const total = list.length || 18;
            const resolved = list.filter((c) => c.status === 'Completed').length || 12;
            const pending = list.filter((c) => c.status === 'Pending').length || 2;
            const progress = list.filter((c) => c.status === 'In Progress').length || 4;
            setStats({ total, resolved, pending, progress });
            setResolvedComplaints(list.filter((c) => c.status === 'Completed'));
          }
        }

        if (resAnn.ok) {
          const dataAnn = await resAnn.json();
          if (dataAnn.success) setAnnouncements(dataAnn.announcements || []);
        }

        if (resEv.ok) {
          const dataEv = await resEv.json();
          if (dataEv.success) setEvents(dataEv.events || []);
        }

        if (resCms.ok) {
          const dataCms = await resCms.json();
          if (dataCms.success && dataCms.settings) setCms(dataCms.settings);
        }
      } catch (err) {
        console.error('Landing page loading error:', err);
      } finally {
        setLoadingFeeds(false);
      }
    }
    loadPageData();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all credentials fields.');
      return;
    }
    setAuthLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        email: loginEmail.toLowerCase(),
        password: loginPassword,
        redirect: false,
      });

      if (result.error) {
        setLoginError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setRegError('Please provide name, email, mobile number, and password.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        setAuthTab('login');
        setLoginEmail(regEmail);
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const currentAnnouncements = announcements.length > 0 ? announcements.slice(0, 3) : MOCK_ANNOUNCEMENTS;
  const currentResolved = resolvedComplaints.length > 0 ? resolvedComplaints.slice(0, 3) : MOCK_RESOLVED;
  const currentEvents = events.length > 0 ? events.slice(0, 2) : MOCK_EVENTS;

  return (
    <div className="min-h-screen bg-white text-text-body font-sans pb-12">

      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 text-center lg:text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-[10px] font-bold text-primary-700 uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>{lang === 'en' ? 'Civic Resolution Hub 2026' : 'സിവിക് റെസല്യൂഷൻ ഹബ് 2026'}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text-title tracking-tight leading-[1.1]"
            >
              {lang === 'en' ? cms.heroTitleEn : cms.heroTitleMl}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-text-body text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              {lang === 'en' ? cms.heroDescriptionEn : cms.heroDescriptionMl}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2"
            >
              <button
                onClick={() => {
                  if (session) router.push('/complaints');
                  else { setAuthTab('login'); setShowAuthModal(true); }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl shadow-md shadow-primary-600/15 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? 'Submit Complaint' : 'പരാതി സമർപ്പിക്കുക'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (session) router.push('/my-complaints');
                  else { setAuthTab('login'); setShowAuthModal(true); }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-text-title bg-white hover:bg-bg-base border border-card-border active:scale-95 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <span>{lang === 'en' ? 'My Complaints' : 'എന്റെ പരാതികൾ'}</span>
              </button>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden border border-card-border shadow-lg"
            >
              <img 
                src={cms.heroImage} 
                alt="Neighborhood improvement visual" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* Dynamic Community Statistics */}
      <section className="section-alt py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: stats.total, label: lang === 'en' ? 'Total Filed' : 'ആകെ പരാതികൾ', color: 'text-text-title' },
              { value: stats.pending, label: lang === 'en' ? 'Pending Review' : 'തീർപ്പുകൽപ്പിക്കാത്തവ', color: 'text-danger' },
              { value: stats.progress, label: lang === 'en' ? 'In Progress' : 'പുരോഗതിയിൽ', color: 'text-primary-600' },
              { value: stats.resolved, label: lang === 'en' ? 'Resolved' : 'പരിഹരിച്ചവ', color: 'text-success' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-card-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <span className={`text-3xl sm:text-4xl font-extrabold font-display block ${stat.color}`}>{stat.value}</span>
                <span className="text-[11px] text-text-body font-semibold uppercase tracking-wider mt-2 block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Services Grid */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-display font-extrabold text-3xl text-text-title tracking-tight">
              {lang === 'en' ? 'Quick Services' : 'ദ്രുത സേവനങ്ങൾ'}
            </h2>
            <p className="text-sm text-text-body leading-relaxed">
              {lang === 'en' ? 'Select a category to quickly register a concern with local dispatch.' : 'പരാതികൾ ഫയൽ ചെയ്യാൻ ഒരു കാറ്റഗറി തിരഞ്ഞെടുക്കുക.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_SERVICES_LIST.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (session) {
                      router.push(`/complaints?category=${encodeURIComponent(srv.category)}`);
                    } else {
                      setAuthTab('login');
                      setShowAuthModal(true);
                    }
                  }}
                  className="saas-card p-6 cursor-pointer flex flex-col justify-between items-start gap-4 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`p-3 rounded-xl ${srv.bg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-text-title">
                      {lang === 'en' ? srv.en : srv.ml}
                    </h4>
                    <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider block">
                      {lang === 'en' ? 'Report issue' : 'പരാതി നൽകുക'} &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Announcements & Community Events */}
      <section className="section-alt py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-text-title flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary-600" />
              {lang === 'en' ? 'Latest Announcements' : 'പുതിയ അറിയിപ്പുകൾ'}
            </h2>
            <p className="text-sm text-text-body">
              {lang === 'en' ? 'Official advisories, emergency updates, and public notices.' : 'ഔദ്യോഗിക അറിയിപ്പുകളും മറ്റ് നിർദ്ദേശങ്ങളും.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingFeeds ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
            ) : (
              currentAnnouncements.map((ann) => {
                const badgeColors = {
                  emergency: 'bg-rose-50 text-rose-700 border-rose-100',
                  project: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                  general: 'bg-gray-50 text-gray-700 border-gray-200'
                };

                return (
                  <div key={ann._id} className="bg-white border border-card-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeColors[ann.type] || badgeColors.general}`}>
                        {ann.type}
                      </span>
                      <h3 className="font-bold text-text-title text-base leading-snug">{ann.title}</h3>
                      <p className="text-text-body text-sm leading-relaxed line-clamp-3">{ann.content}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-body pt-4 border-t border-card-border mt-4">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Community Events */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-text-title flex items-center gap-2">
              <Calendar className="w-6 h-6 text-secondary-600" />
              {lang === 'en' ? 'Community Events' : 'കമ്മ്യൂണിറ്റി പരിപാടികൾ'}
            </h2>
            <p className="text-sm text-text-body">
              {lang === 'en' ? 'Local discussions, cleaning campaigns, and events.' : 'വാർഡിലെ വിവിധ പൊതുപരിപാടികൾ.'}
            </p>
          </div>

          <div className="space-y-4">
            {loadingFeeds ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
            ) : (
              currentEvents.map((event) => (
                <div key={event._id} className="bg-white border border-card-border rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-text-title text-base leading-snug">{event.title}</h3>
                    <span className="p-2 bg-secondary-50 text-secondary-600 rounded-lg shrink-0">
                      <Calendar className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-text-body text-sm leading-relaxed">{event.description}</p>
                  <div className="pt-3 border-t border-card-border space-y-2 text-xs text-text-body">
                    <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-text-body/60" /> {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-text-body/60" /> {event.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        </div>
      </section>

      {/* Resolved Milestone Showcase */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-text-title flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
              {lang === 'en' ? 'Recently Completed Resolutions' : 'അടുത്തിടെ പൂർത്തിയാക്കിയവ'}
            </h2>
            <p className="text-sm text-text-body">
              {lang === 'en' ? 'Public transparency log showing recently repaired neighborhood works.' : 'പൂർത്തിയാക്കിയ പ്രവർത്തനങ്ങളുടെ തത്സമയ വിവരങ്ങൾ.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {loadingFeeds ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
            ) : (
              currentResolved.map((resolved) => (
                <div key={resolved._id} className="bg-white border border-card-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-50 border border-card-border rounded-lg text-[10px] font-bold text-text-body uppercase">
                        {resolved.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        {lang === 'en' ? 'Completed' : 'പൂർത്തിയായി'}
                      </span>
                    </div>
                    <h3 className="font-bold text-text-title text-base leading-snug">{resolved.title}</h3>
                    <p className="text-text-body text-sm leading-relaxed line-clamp-3">{resolved.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-card-border mt-4">
                    <div className="flex items-center gap-2 text-xs text-text-body">
                      <MapPin className="w-3.5 h-3.5 text-text-body/60 shrink-0" />
                      <span className="truncate">{resolved.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Ward Member Quote Highlight */}
      <section className="section-alt py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-card-border rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row gap-10 items-center shadow-md">
            <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-card-border shadow-sm">
              <img 
                src={cms.wardMemberPhoto} 
                alt={cms.wardMemberName} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-5 text-center md:text-left flex-grow">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-primary-600 uppercase tracking-widest">
                  {lang === 'en' ? 'Ward Representative' : 'വാർഡ് പ്രതിനിധി'}
                </p>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-text-title">{cms.wardMemberName}</h3>
                <p className="text-text-body text-sm font-medium">
                  {lang === 'en' ? cms.wardMemberRoleEn : cms.wardMemberRoleMl}
                </p>
              </div>
              <p className="text-text-body text-sm sm:text-base leading-relaxed border-l-0 md:border-l-4 md:border-primary-200 md:pl-5">
                &quot;{lang === 'en' ? cms.wardMemberQuoteEn : cms.wardMemberQuoteMl}&quot;
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-1 text-sm text-text-body">
                <span className="flex items-center gap-2 justify-center md:justify-start"><Phone className="w-4 h-4 text-primary-600" /> {cms.wardMemberPhone}</span>
                <span className="flex items-center gap-2 justify-center md:justify-start"><Mail className="w-4 h-4 text-primary-600" /> {cms.wardMemberEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Dialog */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card-bg border border-card-border rounded-[20px] max-w-sm w-full p-6 shadow-2xl space-y-6 z-10"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-text-body/60 hover:text-text-title transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-primary-50 rounded-xl text-primary-600 mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-text-title animate-pulse">
                  {authTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-card-border pb-1 text-sm font-semibold text-text-body">
                <button 
                  onClick={() => { setAuthTab('login'); setLoginError(''); }}
                  className={`flex-grow py-2 text-center border-b-2 transition-colors cursor-pointer ${
                    authTab === 'login' ? 'border-primary-500 text-primary-500' : 'border-transparent hover:text-text-title'
                  }`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setAuthTab('register'); setRegError(''); }}
                  className={`flex-grow py-2 text-center border-b-2 transition-colors cursor-pointer ${
                    authTab === 'register' ? 'border-primary-500 text-primary-500' : 'border-transparent hover:text-text-title'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {authTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-danger/10 text-danger rounded-xl flex items-start gap-2 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="citizen@wardconnect.gov"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary-600/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Sign In
                  </button>
                </form>
              )}

              {/* Register Form */}
              {authTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 premium-scroll">
                  {regError && (
                    <div className="p-3 bg-danger/10 text-danger rounded-xl flex items-start gap-2 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}
                  {regSuccess && (
                    <div className="p-3 bg-success/10 text-success rounded-xl flex items-start gap-2 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Mobile Number</label>
                    <input 
                      type="tel"
                      required
                      placeholder="5550192834"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="john@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-title">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-bg-base text-text-title text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary-600/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
