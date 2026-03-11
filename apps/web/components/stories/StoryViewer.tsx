'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  group: any;
  onClose: () => void;
}

export default function StoryViewer({ group, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const story = group.stories[currentIndex];
  const DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    // Mark as viewed
    api.post(`/stories/${story._id}/view`).catch(() => {});

    // Progress bar
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = (elapsed / DURATION) * 100;
      if (pct >= 100) {
        goNext();
      } else {
        setProgress(pct);
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex]);

  const goNext = () => {
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  // Time remaining
  const expiresAt = new Date(story.expiresAt);
  const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: false });

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 300 }} />

      {/* Story container */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', maxWidth: '95vw', height: '700px', maxHeight: '95vh', borderRadius: '12px', overflow: 'hidden', zIndex: 301, backgroundColor: '#000' }}>

        {/* Progress bars */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', gap: '4px', zIndex: 10 }}>
          {group.stories.map((_: any, i: number) => (
            <div key={i} style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', backgroundColor: 'white', borderRadius: '2px',
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                transition: i === currentIndex ? 'none' : undefined,
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: '24px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', backgroundColor: '#dbdbdb' }}>
              {group.avatarUrl
                ? <img src={group.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#8e8e8e' }}>
                    {group.username?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{group.username}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })} · {timeLeft} left
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Story image */}
        <img
          src={story.imageUrl}
          alt="story"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Caption */}
        {story.caption && (
          <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
            <p style={{ color: 'white', fontSize: '14px', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{story.caption}</p>
          </div>
        )}

        {/* Nav areas */}
        <div onClick={goPrev} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', cursor: 'pointer', zIndex: 5 }} />
        <div onClick={goNext} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', cursor: 'pointer', zIndex: 5 }} />

        {/* Reply input */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 10 }}>
          <div style={{ flex: 1, border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: '20px', padding: '8px 16px' }}>
            <input placeholder={`Reply to ${group.username}...`} style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '14px', width: '100%' }} />
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}