'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/posts/user/${id}`).catch(() => null),
      api.get(`/comments/${id}`),
    ]).then(([, commentsRes]) => {
      setComments(commentsRes.data);
    }).finally(() => setLoading(false));

    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token }, transports: ['websocket'],
      });
      socketRef.current.on('newComment', (comment: any) => {
        if (comment.postId === id) setComments(prev => [comment, ...prev]);
      });
      socketRef.current.on('deleteComment', ({ commentId }: any) => {
        setComments(prev => prev.filter(c => c._id !== commentId));
      });
    };
    connect();

    return () => { socketRef.current?.disconnect(); };
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.post(`/comments/${id}`, { text: commentText });
    setCommentText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    await api.delete(`/comments/${commentId}`);
  };

  if (loading || !post) return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', backgroundColor: 'white', border: '1px solid #dbdbdb', maxWidth: '935px', width: '100%', maxHeight: '85vh' }}>

          {/* Image */}
          <div style={{ width: '600px', flexShrink: 0, backgroundColor: '#000', display: 'flex', alignItems: 'center' }}>
            <img src={post.imageUrl} style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href={`/profile/${post.uid}`}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
                  {post.username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{post.username}</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
                  <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                </svg>
              </button>
            </div>

            {/* Comments */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* Caption */}
              {post.caption && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
                    {post.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{post.username} </span>
                    <span style={{ fontSize: '14px' }}>{post.caption}</span>
                    <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}

              {comments.map((c: any) => (
                <div key={c._id} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', color: '#8e8e8e' }}>
                    {c.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{c.username} </span>
                    <span style={{ fontSize: '14px' }}>{c.text}</span>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#8e8e8e' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                      {c.uid === user?.uid && (
                        <button onClick={() => handleDeleteComment(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#8e8e8e' }}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ borderTop: '1px solid #efefef', padding: '8px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => { setLiked(l => !l); setLikesCount(c => liked ? c - 1 : c + 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#ed4956' : 'none'} stroke={liked ? '#ed4956' : '#262626'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>
                  <button onClick={() => inputRef.current?.focus()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </button>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </button>
              </div>
              {likesCount > 0 && <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{likesCount} likes</p>}
              <p style={{ fontSize: '10px', color: '#8e8e8e', textTransform: 'uppercase', marginBottom: '8px' }}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Comment input */}
            <form onSubmit={handleComment} style={{ borderTop: '1px solid #efefef', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', cursor: 'pointer' }}>😊</span>
              <input
                ref={inputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent' }}
              />
              {commentText.trim() && (
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px' }}>Post</button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
