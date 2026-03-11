'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/explore?page=${page}`);
      if (data.length === 0) { setHasMore(false); return; }
      setPosts(prev => {
        const ids = new Set(prev.map((p: any) => p._id));
        return [...prev, ...data.filter((p: any) => !ids.has(p._id))];
      });
      setPage(p => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => { if (inView && !loading) fetchPosts(); }, [inView]);

  // Instagram explore uses a mosaic layout — col 1: normal, col 2: tall, col 3: normal
  const buildMosaic = (posts: any[]) => {
    const groups: any[][] = [];
    for (let i = 0; i < posts.length; i += 3) {
      groups.push(posts.slice(i, i + 3));
    }
    return groups;
  };

  const groups = buildMosaic(posts);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', paddingTop: '30px', maxWidth: '935px', margin: '0 auto', paddingLeft: '245px' }}>

        {/* Empty state */}
        {posts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8e8e8e' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626', marginBottom: '8px' }}>Explore</p>
            <p style={{ fontSize: '14px' }}>No posts to explore yet. Be the first to post!</p>
          </div>
        )}

        {/* Mosaic grid — Instagram style */}
        {groups.map((group, gi) => {
          // Alternate which column is tall
          const tallIndex = gi % 2 === 0 ? 1 : 1;
          return (
            <div key={gi} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '3px', marginBottom: '3px' }}>
              {group.map((post, pi) => (
                <Link key={post._id} href={`/post/${post._id}`}>
                  <div
                    style={{ position: 'relative', paddingBottom: pi === tallIndex ? '200%' : '100%', backgroundColor: '#dbdbdb', overflow: 'hidden', cursor: 'pointer' }}
                    onMouseEnter={e => { const o = e.currentTarget.querySelector('.overlay') as HTMLElement; if (o) o.style.opacity = '1'; }}
                    onMouseLeave={e => { const o = e.currentTarget.querySelector('.overlay') as HTMLElement; if (o) o.style.opacity = '0'; }}
                  >
                    <img
                      src={post.imageUrl}
                      alt="explore"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: 0, transition: 'opacity 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                        {post.likesCount || 0}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        {post.commentsCount || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        <div ref={ref} style={{ height: '1px' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
