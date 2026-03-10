'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

interface Props {
  post: any;
  onDelete: (id: string) => void;
}

export default function PostCard({ post, onDelete }: Props) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.likes?.includes(user?.uid));
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Real-time comments via socket
  useEffect(() => {
    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token }, transports: ['websocket'],
      });
      socketRef.current.on('newComment', (comment: any) => {
        if (comment.postId === post._id) {
          setComments(prev => [comment, ...prev]);
        }
      });
    };
    connect();
    return () => { socketRef.current?.disconnect(); };
  }, [post._id]);

  const fetchComments = async () => {
    const { data } = await api.get(`/comments/${post._id}`);
    setComments(data);
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(s => !s);
  };

  const handleLike = async () => {
    if (liked) {
      setLiked(false); setLikesCount((c: number) => c - 1);
      await api.delete(`/likes/${post._id}`);
    } else {
      setLiked(true); setLikesCount((c: number) => c + 1);
      await api.post(`/likes/${post._id}`);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await api.post(`/comments/${post._id}`, { text: commentText });
      setComments(prev => [data, ...prev]);
      setCommentText('');
    } finally { setLoadingComment(false); }
  };

  const handleDelete = async () => {
    await api.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px', marginBottom: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        <Link href={`/profile/${post.uid}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', border: '1px solid #dbdbdb' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
              {post.username?.[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{post.username}</p>
            <p style={{ fontSize: '12px', color: '#8e8e8e' }}>Original audio</p>
          </div>
        </Link>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowOptions(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#262626' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
          {showOptions && (
            <div style={{ position: 'absolute', right: 0, top: '30px', backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '200px', overflow: 'hidden' }}>
              {user?.uid === post.uid && (
                <button onClick={handleDelete} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ed4956', fontWeight: 700 }}>
                  Delete
                </button>
              )}
              <button onClick={() => setShowOptions(false)} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#262626' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div style={{ width: '100%', backgroundColor: '#000' }}>
        <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: '585px', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Action buttons */}
      <div style={{ padding: '8px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Like */}
            <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#ed4956' : 'none'} stroke={liked ? '#ed4956' : '#262626'} strokeWidth="2"
                style={{ transform: liked ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
            {/* Comment */}
            <button onClick={toggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </button>
            {/* Share */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          {/* Save */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, marginRight: '4px' }}>{post.username}</span>
            {post.caption}
          </p>
        )}

        {/* Comments */}
        {post.commentsCount > 0 && !showComments && (
          <button onClick={toggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e8e', fontSize: '14px', padding: 0, marginBottom: '4px' }}>
            View all {post.commentsCount} comments
          </button>
        )}

        {showComments && (
          <div style={{ marginTop: '8px' }}>
            {comments.map(c => (
              <div key={c._id} style={{ fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, marginRight: '4px' }}>{c.username}</span>
                {c.text}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p style={{ fontSize: '10px', color: '#8e8e8e', textTransform: 'uppercase', letterSpacing: '0.2px', marginTop: '8px', marginBottom: '4px' }}>
          {timeAgo}
        </p>
      </div>

      {/* Comment input */}
      <div style={{ borderTop: '1px solid #efefef', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>😊</button>
        <form onSubmit={handleComment} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', color: '#262626' }}
          />
          {commentText.trim() && (
            <button type="submit" disabled={loadingComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px' }}>
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
}