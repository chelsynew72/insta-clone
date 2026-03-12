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

  
const fetchPosts = async (pageNum: number) => {
  setLoading(true);
  try {
    const { data } = await api.get(`/posts/feed?page=${pageNum}`);
    if (data.length === 0) {
      setHasMore(false);
      return;
    }
    setPosts(prev => {
      const ids = new Set(prev.map((p: any) => p._id));
      return [...prev, ...data.filter((p: any) => !ids.has(p._id))];
    });
    setPage(pageNum + 1);
    if (data.length < 10) setHasMore(false);
  } catch {
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};

// Load when user is ready
useEffect(() => {
  if (user) fetchPosts(1);
}, [user]);

// Infinite scroll
useEffect(() => {
  if (inView && !loading && hasMore && posts.length > 0) {
    fetchPosts(page);
  }
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
      marginLeft: 'clamp(0px, 20vw, 245px)',
      paddingTop: '30px',
      display: 'flex',
      justifyContent: 'center',
      gap: '28px',
      paddingBottom: '80px', // space for mobile bottom nav
      paddingLeft: '16px',
      paddingRight: '16px',
    }}>
      {/* Feed column */}
      <div style={{ width: '100%', maxWidth: '470px', flexShrink: 0 }}>
        <StoriesBar />
        {/* ... rest unchanged ... */}
      </div>

      {/* Right sidebar — hidden on mobile */}
      <div style={{
        width: '320px', flexShrink: 0, paddingTop: '8px',
        display: 'clamp(none, block, block)', // hide on small screens
      }}>
        <div className="desktop-only">
          <SuggestedUsers />
        </div>
      </div>
    </div>
  </div>
);
}