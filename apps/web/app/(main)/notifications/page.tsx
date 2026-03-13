'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Load existing notifications
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .finally(() => setLoading(false));

    // Mark as read
    api.post('/notifications/read');

    // Real-time new notifications
    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token }, transports: ['websocket'],
      });
      socketRef.current.on('notification', (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
      });
    };
    connect();

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const getNotifText = (notif: any) => {
    switch (notif.type) {
      case 'like': return 'liked your photo.';
      case 'comment': return `commented: ${notif.text}`;
      case 'follow': return 'started following you.';
      default: return 'interacted with your post.';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like': return (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ed4956', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
      );
      case 'comment': return (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0095f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
      );
      case 'follow': return (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#8e8e8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          <h2 style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '24px', paddingLeft: '4px' }}>
            Notifications
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '32px', height: '32px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8e8e8e' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626', marginBottom: '8px' }}>Activity On Your Posts</p>
              <p style={{ fontSize: '14px', lineHeight: '20px' }}>
                When someone likes or comments on one of your posts, you'll see it here.
              </p>
            </div>
          )}

          {/* Notification groups */}
          {notifications.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626', marginBottom: '12px' }}>Today</p>
              {notifications.map((notif: any) => (
                <div key={notif._id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 12px', borderRadius: '8px',
                  backgroundColor: notif.read ? 'transparent' : '#eff7ff',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : '#eff7ff')}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#8e8e8e' }}>
                      {notif.fromUsername?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}>
                      {getNotifIcon(notif.type)}
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#262626', lineHeight: '18px' }}>
                      <span style={{ fontWeight: 600 }}>{notif.fromUsername}</span>{' '}
                      {getNotifText(notif)}{' '}
                      <span style={{ color: '#8e8e8e' }}>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                    </p>
                  </div>

                  {/* Post thumbnail */}
                  {notif.postId && (
                    <Link href={`/post/${notif.postId}`}>
                      <div style={{ width: '44px', height: '44px', backgroundColor: '#dbdbdb', flexShrink: 0, overflow: 'hidden', cursor: 'pointer' }}>
                      </div>
                    </Link>
                  )}

                  {/* Follow button */}
                  {notif.type === 'follow' && (
                    <button style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 600, fontSize: '14px', padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      Follow back
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}