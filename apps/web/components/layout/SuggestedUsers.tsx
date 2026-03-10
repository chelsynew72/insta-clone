'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Link from 'next/link';

export default function SuggestedUsers() {
  const { user } = useAuthStore();
  const [suggested, setSuggested] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    // For now show placeholder suggested users
    setSuggested([
      { uid: '1', username: 'photography.daily', avatarUrl: '', subtitle: 'Suggested for you' },
      { uid: '2', username: 'travel_moments', avatarUrl: '', subtitle: 'Followed by john' },
      { uid: '3', username: 'food.vibes', avatarUrl: '', subtitle: 'Suggested for you' },
      { uid: '4', username: 'street.art.world', avatarUrl: '', subtitle: 'New to Instagram' },
      { uid: '5', username: 'nature_lens', avatarUrl: '', subtitle: 'Suggested for you' },
    ]);
  }, []);

  const handleFollow = async (uid: string) => {
    setFollowing(prev => new Set([...prev, uid]));
    try { await api.post(`/follows/${uid}`); } catch {}
  };

  if (!user) return null;

  return (
    <div>
      {/* Current user */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href={`/profile/${user.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#8e8e8e' }}>{user.username?.[0]?.toUpperCase()}</div>
            }
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{user.username}</p>
            <p style={{ fontSize: '14px', color: '#8e8e8e' }}>{user.email}</p>
          </div>
        </Link>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '12px' }}>
          Switch
        </button>
      </div>

      {/* Suggested */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#8e8e8e' }}>Suggested for you</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#262626' }}>
          See All
        </button>
      </div>

      {suggested.map(s => (
        <div key={s.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
                {s.username[0].toUpperCase()}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '12px', color: '#262626' }}>{s.username}</p>
              <p style={{ fontSize: '11px', color: '#8e8e8e' }}>{s.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => handleFollow(s.uid)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: following.has(s.uid) ? '#8e8e8e' : '#0095f6', fontWeight: 600, fontSize: '12px' }}
          >
            {following.has(s.uid) ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginBottom: '12px' }}>
          {['About','Help','Press','API','Jobs','Privacy','Terms'].map(l => (
            <span key={l} style={{ fontSize: '11px', color: '#c7c7c7', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#c7c7c7' }}>© 2026 INSTAGRAM FROM META</p>
      </div>
    </div>
  );
}