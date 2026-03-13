'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Link from 'next/link';

export default function SuggestedUsers() {
  const { user } = useAuthStore();
  const [suggested, setSuggested] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/users/suggested')
      .then(({ data }) => {
        setSuggested(data);
        // Populate initial following state
        if (data.length > 0) {
          Promise.all(
            data.map((s: any) =>
              api.get(`/follows/${s.uid}/is-following`)
                .then(({ data }) => ({ uid: s.uid, isFollowing: data.isFollowing }))
                .catch(() => ({ uid: s.uid, isFollowing: false }))
            )
          ).then((results) => {
            const followingUids = results
              .filter((r: any) => r.isFollowing)
              .map((r: any) => r.uid);
            setFollowing(new Set(followingUids));
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleFollow = async (uid: string) => {
    const wasFollowing = following.has(uid);
    // Optimistic update
    if (wasFollowing) {
      setFollowing((prev) => {
        const s = new Set(prev);
        s.delete(uid);
        return s;
      });
    } else {
      setFollowing((prev) => new Set([...prev, uid]));
    }
    try {
      if (wasFollowing) {
        await api.delete(`/follows/${uid}`);
      } else {
        await api.post(`/follows/${uid}`);
      }
      // Sync after API success
      const { data } = await api.get(`/follows/${uid}/is-following`);
      if (data.isFollowing) {
        setFollowing((prev) => new Set([...prev, uid]));
      } else {
        setFollowing((prev) => {
          const s = new Set(prev);
          s.delete(uid);
          return s;
        });
      }
    } catch (error) {
      // Revert on error
      if (wasFollowing) {
        setFollowing((prev) => new Set([...prev, uid]));
      } else {
        setFollowing((prev) => {
          const s = new Set(prev);
          s.delete(uid);
          return s;
        });
      }
    }
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
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#8e8e8e' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{user.username}</p>
            <p style={{ fontSize: '12px', color: '#8e8e8e' }}>{user.email}</p>
          </div>
        </Link>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '12px' }}>
          Switch
        </button>
      </div>

      {/* Suggested header */}
      {suggested.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#8e8e8e' }}>Suggested for you</span>
          <Link href="/explore" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#262626' }}>
              See All
            </button>
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#efefef' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '10px', backgroundColor: '#efefef', borderRadius: '4px', marginBottom: '4px', width: '60%' }} />
                <div style={{ height: '10px', backgroundColor: '#efefef', borderRadius: '4px', width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested users */}
      {!loading && suggested.map(s => (
        <div key={s.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Link href={`/profile/${s.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
              {s.avatarUrl
                ? <img src={s.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
                    {s.username[0].toUpperCase()}
                  </div>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '12px', color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.username}</p>
              <p style={{ fontSize: '11px', color: '#8e8e8e' }}>
                {s.followersCount > 0 ? `${s.followersCount} followers` : 'Suggested for you'}
              </p>
            </div>
          </Link>
          <button
            onClick={() => handleFollow(s.uid)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: following.has(s.uid) ? '#8e8e8e' : '#0095f6', fontWeight: 600, fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}
          >
            {following.has(s.uid) ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}

      {/* No suggestions */}
      {!loading && suggested.length === 0 && (
        <p style={{ fontSize: '14px', color: '#8e8e8e', textAlign: 'center', padding: '20px 0' }}>
          No suggestions yet
        </p>
      )}

      {/* Footer */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginBottom: '8px' }}>
          {['About','Help','Press','API','Jobs','Privacy','Terms'].map(l => (
            <span key={l} style={{ fontSize: '11px', color: '#c7c7c7', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#c7c7c7' }}>© 2026 INSTAGRAM FROM META</p>
      </div>
    </div>
  );
}
