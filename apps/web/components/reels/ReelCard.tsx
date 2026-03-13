'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import api from '@/lib/api';

interface Props {
  reel: any;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function ReelCard({ reel, isActive, isMuted, onToggleMute }: Props) {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(reel.likes?.includes(user?.uid));
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [saved, setSaved] = useState(reel.savedBy?.includes(user?.uid));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [paused, setPaused] = useState(false);

  // Play/pause based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  const handleLike = async () => {
    if (liked) {
      setLiked(false); setLikesCount((c: number) => c - 1);
      await api.delete(`/reels/${reel._id}/like`);
    } else {
      setLiked(true); setLikesCount((c: number) => c + 1);
      await api.post(`/reels/${reel._id}/like`);
    }
  };

  const handleSave = async () => {
    if (saved) {
      setSaved(false);
      await api.delete(`/reels/${reel._id}/save`);
    } else {
      setSaved(true);
      await api.post(`/reels/${reel._id}/save`);
    }
  };

  const handleShare = () => {
    navigator.share?.({
      title: `${reel.username}'s reel`,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  const fetchComments = async () => {
    const { data } = await api.get(`/comments/${reel._id}`);
    setComments(data);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { data } = await api.post(`/comments/${reel._id}`, { text: commentText });
    setComments(prev => [data, ...prev]);
    setCommentText('');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#000', flexShrink: 0, scrollSnapAlign: 'start' }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
      />

      {/* Pause indicator */}
      {paused && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>
      )}

      {/* Bottom left — user info + caption */}
      <div style={{ position: 'absolute', bottom: '80px', left: '16px', right: '80px', color: 'white' }}>
        <Link href={`/profile/${reel.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', border: '2px solid white', flexShrink: 0 }}>
            {reel.avatarUrl
              ? <img src={reel.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#8e8e8e' }}>{reel.username?.[0]?.toUpperCase()}</div>
            }
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{reel.username}</span>
          <div style={{ border: '1px solid white', borderRadius: '6px', padding: '2px 10px', fontSize: '13px', fontWeight: 600, color: 'white' }}>Follow</div>
        </Link>

        {reel.caption && (
          <p style={{ fontSize: '14px', lineHeight: '20px', textShadow: '0 1px 3px rgba(0,0,0,0.5)', marginBottom: '8px' }}>
            {reel.caption}
          </p>
        )}

        {/* Audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <span style={{ fontSize: '13px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{reel.audio || 'Original audio'}</span>
        </div>
      </div>

      {/* Right side actions */}
      <div style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Like */}
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={liked ? '#ed4956' : 'white'} stroke={liked ? '#ed4956' : 'white'} strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))', transform: liked ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.1s' }}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{likesCount}</span>
        </button>

        {/* Comment */}
        <button onClick={() => { setShowComments(true); fetchComments(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{reel.commentsCount}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Share</span>
        </button>

        {/* Save */}
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={saved ? 'white' : 'none'} stroke="white" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Save</span>
        </button>

        {/* Mute */}
        <button onClick={onToggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              {isMuted
                ? <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                : <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>
              }
            </svg>
          </div>
        </button>
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}
          onClick={e => { if (e.target === e.currentTarget) setShowComments(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px 16px 0 0', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Comments</h3>
              <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {comments.length === 0 && <p style={{ color: '#8e8e8e', textAlign: 'center', padding: '20px' }}>No comments yet</p>}
              {comments.map(c => (
                <div key={c._id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, marginRight: '6px' }}>{c.username}</span>{c.text}
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} style={{ padding: '12px 16px', borderTop: '1px solid #efefef', display: 'flex', gap: '8px' }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, border: '1px solid #dbdbdb', borderRadius: '20px', padding: '8px 14px', fontSize: '14px', outline: 'none' }}
              />
              <button type="submit" style={{ backgroundColor: '#0095f6', border: 'none', borderRadius: '20px', padding: '8px 16px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}