'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Bell, Clock, Info, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      loadNotifications(session.user.email);
    }
  }, [status, session]);

  const loadNotifications = async (email) => {
    try {
      setLoading(true);
      // Fetch complaints to generate progress notifications
      const res = await fetch(`/api/complaints?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      // Fetch general announcements to show as system broadcasts
      const resAnn = await fetch('/api/admin/announcements');
      const dataAnn = await resAnn.json();
      
      const list = [];

      if (data.success && data.complaints) {
        data.complaints.forEach((c) => {
          // 1. Complaint Created Notification
          list.push({
            id: `create-${c._id}`,
            title: 'Complaint Registered',
            desc: `Your complaint "${c.title}" was submitted successfully.`,
            type: 'info',
            time: new Date(c.createdAt),
            link: `/my-complaints?id=${c._id}`,
          });

          // 2. Status Changed Notifications
          if (c.status === 'In Progress') {
            list.push({
              id: `progress-${c._id}`,
              title: 'Resolution Started',
              desc: `Work has started on your complaint "${c.title}".`,
              type: 'warning',
              time: new Date(c.createdAt), // default to fallback if no exact time
              link: `/my-complaints?id=${c._id}`,
            });
          } else if (c.status === 'Completed') {
            list.push({
              id: `complete-${c._id}`,
              title: 'Issue Resolved',
              desc: `Your complaint "${c.title}" has been resolved.`,
              type: 'success',
              time: new Date(c.createdAt),
              link: `/my-complaints?id=${c._id}`,
            });
          }

          // 3. Admin updates timeline logs
          if (c.publicUpdates && c.publicUpdates.length > 0) {
            c.publicUpdates.forEach((up, i) => {
              list.push({
                id: `update-${c._id}-${i}`,
                title: 'Status Update Added',
                desc: `${up.message} (Complaint: ${c.title})`,
                type: 'message',
                time: new Date(up.createdAt),
                link: `/my-complaints?id=${c._id}`,
              });
            });
          }
        });
      }

      if (dataAnn.success && dataAnn.announcements) {
        dataAnn.announcements.forEach((ann) => {
          list.push({
            id: `ann-${ann._id}`,
            title: `Advisory: ${ann.title}`,
            desc: ann.content,
            type: 'announcement',
            time: new Date(ann.createdAt),
            link: '/',
          });
        });
      }

      // Sort notifications by time descending
      list.sort((a, b) => b.time - a.time);
      setNotifications(list);
    } catch (err) {
      console.error('Error generating notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4.5 h-4.5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4.5 h-4.5 text-warning" />;
      case 'message':
        return <MessageSquare className="w-4.5 h-4.5 text-primary-500" />;
      case 'announcement':
        return <Bell className="w-4.5 h-4.5 text-secondary-500" />;
      case 'info':
      default:
        return <Info className="w-4.5 h-4.5 text-text-body" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'message':
        return 'bg-primary-500/10 border-primary-500/20';
      case 'announcement':
        return 'bg-secondary-500/10 border-secondary-500/20';
      case 'info':
      default:
        return 'bg-bg-base border-card-border';
    }
  };

  return (
    <div className="py-8 max-w-2xl mx-auto px-4 sm:px-6 space-y-6 pb-24 md:pb-8 text-text-body">
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-body/60 hover:text-text-title transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workspace
      </button>

      <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-text-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-500" />
            Alerts & Notifications
          </h1>
          <p className="text-xs text-text-body">Progression milestone updates and ward announcements.</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white border border-card-border rounded-2xl p-12 text-center text-text-body flex flex-col items-center justify-center gap-2 shadow-sm">
            <Bell className="w-8 h-8 text-text-body/40" />
            <p className="font-semibold text-xs uppercase tracking-wider">No notifications logged.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => router.push(notif.link)}
              className="bg-white border border-card-border rounded-2xl p-5 hover:border-primary-400 cursor-pointer transition-colors shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl border shrink-0 ${getBg(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="min-w-0 flex-grow space-y-1">
                <h4 className="font-bold text-sm text-text-title leading-snug">{notif.title}</h4>
                <p className="text-xs text-text-body leading-relaxed">{notif.desc}</p>
                <span className="text-[10px] text-text-body/70 font-semibold flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {notif.time.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
