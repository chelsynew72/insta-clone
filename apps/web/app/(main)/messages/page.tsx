'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import VideoCall from '@/components/call/VideoCall';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [inCall, setInCall] = useState<any | null>(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(async ({ data }) => {
        setConversations(data);
        // Fetch profiles for all conversation partners
        const otherUids = data.map((c: any) =>
          c.fromUid === user?.uid ? c.toUid : c.fromUid
        );
        const unique = [...new Set(otherUids)] as string[];
        const profiles = await Promise.all(
          unique.map((uid: string) =>
            api.get(`/users/${uid}`).then(r => ({ uid, ...r.data.user })).catch(() => ({ uid }))
          )
        );
        const map: Record<string, any> = {};
        profiles.forEach(p => { map[p.uid] = p; });
        setUserProfiles(map);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
        <div style={{ width: '100%', maxWidth: '935px', backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px', minHeight: '80vh', display: 'flex' }}>

          {/* Left panel — conversation list */}
          <div style={{ width: '350px', borderRight: '1px solid #dbdbdb', flexShrink: 0 }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #dbdbdb' }}>
              <h2 style={{ fontWeight: 600, fontSize: '16px' }}>{user?.username}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>

            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '8px 24px', marginBottom: '4px' }}>
                <p style={{ fontWeight: 600, fontSize: '16px' }}>Messages</p>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}

              {!loading && conversations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 24px', color: '#8e8e8e', fontSize: '14px' }}>
                  No messages yet
                </div>
              )}

              {conversations.map((conv: any) => {
                const otherUid = conv.fromUid === user?.uid ? conv.toUid : conv.fromUid;
                const profile = userProfiles[otherUid];
                return (
                  <Link key={conv._id} href={`/messages/${otherUid}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 24px', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Avatar */}
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbdbdb', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '20px', color: '#8e8e8e' }}>
                        {profile?.avatarUrl
                          ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (profile?.username || otherUid)[0]?.toUpperCase()
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626', marginBottom: '2px' }}>
                          {profile?.username || otherUid}
                        </p>
                        <p style={{ fontSize: '14px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.text} · {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Video call button */}
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInCall({ uid: otherUid, username: profile?.username || otherUid });
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0, opacity: 0.6 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                        title="Video call"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right panel — empty state */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '2px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 300, fontSize: '22px', color: '#262626', marginBottom: '8px' }}>Your messages</p>
              <p style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '16px' }}>Send private photos and messages to a friend or group.</p>
              <button style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 600, fontSize: '14px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                Send message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call overlay */}
      {inCall && (
        <VideoCall
          channelName={`call-${[user?.uid, inCall.uid].sort().join('-')}`}
          role="host"
          remoteUsername={inCall.username}
          onEnd={() => setInCall(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
