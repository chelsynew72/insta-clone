'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

export default function SearchPage() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setFollowing(new Set()); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        if (data.length > 0) {
          Promise.all(data.map((u: any) =>
            api.get(`/follows/${u.uid}/is-following`).then(({ data }) => ({ uid: u.uid, isFollowing: data.isFollowing })).catch(() => ({ uid: u.uid, isFollowing: false }))
          )).then(checks => {
            setFollowing(new Set(checks.filter((r: any) => r.isFollowing).map((r: any) => r.uid)));
          });
        }
      } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleFollow = async (uid: string) => {
    const was = following.has(uid);
    setFollowing(prev => { const s = new Set(prev); was ? s.delete(uid) : s.add(uid); return s; });
    try {
      was ? await api.delete(`/follows/${uid}`) : await api.post(`/follows/${uid}`);
    } catch {
      setFollowing(prev => { const s = new Set(prev); was ? s.add(uid) : s.delete(uid); return s; });
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: isMobile ? '0' : '245px', padding: isMobile ? '12px 16px 80px' : '30px 16px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              style={{ width: '100%', backgroundColor: '#efefef', border: 'none', borderRadius: '8px', padding: '10px 40px', fontSize: '14px', outline: 'none', color: '#262626' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#8e8e8e"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/></svg>
              </button>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p style={{ textAlign: 'center', color: '#8e8e8e', fontSize: '14px', padding: '40px 0' }}>No accounts found for "{query}"</p>
          )}

          {!query && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8e8e8e' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '8px' }}>Search Instagram</p>
              <p style={{ fontSize: '14px' }}>Search for people by username</p>
            </div>
          )}

          {results.map(u => (
            <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #efefef' }}>
              <Link href={`/profile/${u.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#8e8e8e' }}>{u.username[0].toUpperCase()}</div>
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                  <p style={{ fontSize: '12px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.followersCount > 0 ? `${u.followersCount} followers` : 'Instagram user'}
                  </p>
                </div>
              </Link>
              {u.uid !== user?.uid && (
                <button onClick={() => handleFollow(u.uid)} style={{ padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', flexShrink: 0, marginLeft: '12px', backgroundColor: following.has(u.uid) ? 'transparent' : '#0095f6', color: following.has(u.uid) ? '#262626' : 'white', outline: following.has(u.uid) ? '1px solid #dbdbdb' : 'none' }}>
                  {following.has(u.uid) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}