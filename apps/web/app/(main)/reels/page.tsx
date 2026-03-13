'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import ReelCard from '@/components/reels/ReelCard';
import CreateReelModal from '@/components/reels/CreateReelModal';

export default function ReelsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [reels, setReels] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  const fetchReels = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/reels?page=${pageNum}`);
      if (data.length === 0) { setHasMore(false); return; }
      setReels(prev => {
        const ids = new Set(prev.map((r: any) => r._id));
        return [...prev, ...data.filter((r: any) => !ids.has(r._id))];
      });
      setPage(pageNum + 1);
      if (data.length < 10) setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (user) fetchReels(1);
  }, [user]);

  // Intersection observer to track active reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
            // Load more when near end
            if (index >= reels.length - 3 && hasMore) {
              fetchReels(page);
            }
          }
        });
      },
      { root: container, threshold: 0.7 }
    );

    container.querySelectorAll('[data-index]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [reels, page, hasMore]);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <Sidebar onPostCreated={() => {}} />

      {/* Create Reel button */}
      <button
        onClick={() => setShowCreate(true)}
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 200, backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '8px 16px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(10px)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Reel
      </button>

      {/* Reels container */}
      <div
        ref={containerRef}
        style={{ marginLeft: 'clamp(0px, 20vw, 245px)', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {reels.length === 0 && !loading && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'white' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <p style={{ fontSize: '20px', fontWeight: 600 }}>No reels yet</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Be the first to share a reel!</p>
            <button onClick={() => setShowCreate(true)}
              style={{ backgroundColor: 'white', color: '#262626', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Create Reel
            </button>
          </div>
        )}

        {reels.map((reel, index) => (
          <div key={reel._id} data-index={index} style={{ height: '100vh' }}>
            <ReelCard
              reel={reel}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(m => !m)}
            />
          </div>
        ))}

        {loading && (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      {showCreate && (
        <CreateReelModal
          onClose={() => setShowCreate(false)}
          onCreated={(reel) => setReels(prev => [reel, ...prev])}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}