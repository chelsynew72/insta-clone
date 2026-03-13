'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) { 
      setResults([]); 
      setFollowing(new Set());
      return; 
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        // Populate initial following state for search results
        if (data.length > 0) {
          Promise.all(
            data.map((u: any) =>
              api.get(`/follows/${u.uid}/is-following`)
                .then(({ data }) => ({ uid: u.uid, isFollowing: data.isFollowing }))
                .catch(() => ({ uid: u.uid, isFollowing: false }))
            )
          ).then((resultsCheck) => {
            const followingUids = resultsCheck
              .filter((r: any) => r.isFollowing)
              .map((r: any) => r.uid);
            setFollowing(new Set(followingUids));
          });
        }
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

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

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 'clamp(0px, 245px, 245px)', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '80px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              style={{
                width: '100%', backgroundColor: '#efefef', border: 'none', borderRadius: '8px',
                padding: '10px 36px', fontSize: '14px', outline: 'none', color: '#262626',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#8e8e8e">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/>
                </svg>
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* No results */}
          {!loading && query && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626', marginBottom: '8px' }}>No results found</p>
              <p style={{ fontSize: '14px' }}>No accounts found for "{query}"</p>
            </div>
          )}

          {/* Empty state */}
          {!query && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8e8e8e' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '8px' }}>Search Instagram</p>
              <p style={{ fontSize: '14px' }}>Search for people by username</p>
            </div>
          )}

          {/* Results */}
          {results.map(u => (
            <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #efefef' }}>
              <Link href={`/profile/${u.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#8e8e8e' }}>
                        {u.username[0].toUpperCase()}
                      </div>
                  }
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{u.username}</p>
                  <p style={{ fontSize: '12px', color: '#8e8e8e' }}>
                    {u.followersCount > 0 ? `${u.followersCount} followers` : 'Instagram user'}
                    {u.bio ? ` · ${u.bio.slice(0, 30)}` : ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleFollow(u.uid)}
                style={{
                  padding: '6px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', border: 'none', flexShrink: 0, marginLeft: '12px',
                  backgroundColor: following.has(u.uid) ? 'transparent' : '#0095f6',
                  color: following.has(u.uid) ? '#262626' : 'white',
                  outline: following.has(u.uid) ? '1px solid #dbdbdb' : 'none',
                }}
              >
                {following.has(u.uid) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
