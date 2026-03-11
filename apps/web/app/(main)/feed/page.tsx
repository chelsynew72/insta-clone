'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import PostCard from '@/components/post/PostCard';
import StoriesBar from '@/components/stories/StoriesBar';
import SuggestedUsers from '@/components/layout/SuggestedUsers';
import { useInView } from 'react-intersection-observer';

export default function FeedPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
  if (!user) router.push('/login');
}, [user]);


useEffect(() => {
 
  
  const timer = setTimeout(() => {
    if (!user) router.push('/login');
  }, 500);
  return () => clearTimeout(timer);
}, [user]);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/feed?page=${page}`);
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      setPosts(prev => {
        // avoid duplicates
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

  // Initial load
  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (inView && !loading) fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const handlePostCreated = (post: any) => {
    setPosts(prev => [post, ...prev]);
  };

  const handlePostDeleted = (id: string) => {
    setPosts(prev => prev.filter((p: any) => p._id !== id));
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar onPostCreated={handlePostCreated} />

      <div style={{
        marginLeft: '245px',
        paddingTop: '30px',
        display: 'flex',
        justifyContent: 'center',
        gap: '28px',
        paddingBottom: '40px',
      }}>

        {/* Feed column */}
        <div style={{ width: '470px', flexShrink: 0 }}>
          <StoriesBar />

          {/* Empty state */}
          {posts.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8e8e8e', backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px' }}>
              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1" style={{ margin: '0 auto 16px' }}>
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626', marginBottom: '8px' }}>
                Share Photos
              </p>
              <p style={{ fontSize: '14px', lineHeight: '20px' }}>
                When you share photos, they will appear on your profile.
              </p>
            </div>
          )}

          {/* Posts */}
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

          {/* Loading spinner */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '32px', height: '32px',
                border: '2px solid #dbdbdb',
                borderTopColor: '#262626',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 0.8s linear infinite'
              }} />
            </div>
          )}

          {/* No more posts */}
          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#8e8e8e', fontSize: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              You're all caught up
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={ref} style={{ height: '1px' }} />
        </div>

        {/* Right sidebar */}
        <div style={{ width: '320px', flexShrink: 0, paddingTop: '8px' }}>
          <SuggestedUsers />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}