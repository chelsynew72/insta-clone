'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import Sidebar from '@/components/layout/Sidebar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ChatPage() {
  const { uid: otherUid } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history
    api.get(`/messages/${otherUid}`)
      .then(({ data }) => setMessages(data));

    // Load other user profile
    api.get(`/users/${otherUid}`)
      .then(({ data }) => setOtherUser(data.user));

    // Connect socket
    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token }, transports: ['websocket'],
      });

      // Receive incoming messages
      socketRef.current.on('message', (msg: any) => {
        if (msg.fromUid === otherUid || msg.toUid === otherUid) {
          setMessages(prev => [...prev, msg]);
        }
      });

      // Confirm sent messages
      socketRef.current.on('messageSent', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });
    };
    connect();

    return () => { socketRef.current?.disconnect(); };
  }, [otherUid]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { toUid: otherUid, text });
    setText('');
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
        <div style={{ width: '100%', maxWidth: '935px', backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px', height: '85vh', display: 'flex', flexDirection: 'column' }}>

          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/messages">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" style={{ cursor: 'pointer' }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
              {otherUser?.avatarUrl
                ? <img src={otherUser.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#8e8e8e' }}>
                    {otherUser?.username?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{otherUser?.username || otherUid}</p>
              <p style={{ fontSize: '12px', color: '#8e8e8e' }}>Active now</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#8e8e8e' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dbdbdb', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 300, color: '#8e8e8e' }}>
                  {otherUser?.username?.[0]?.toUpperCase()}
                </div>
                <p style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '4px' }}>{otherUser?.username}</p>
                <p style={{ fontSize: '14px' }}>Instagram · {otherUser?.followersCount || 0} followers</p>
              </div>
            )}

            {messages.map((msg: any, i: number) => {
              const isMine = msg.fromUid === user?.uid;
              return (
                <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '60%', padding: '10px 14px', borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    backgroundColor: isMine ? '#0095f6' : '#efefef',
                    color: isMine ? 'white' : '#262626', fontSize: '14px', lineHeight: '18px',
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>😊</button>
            <div style={{ flex: 1, border: '1px solid #dbdbdb', borderRadius: '22px', display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '8px' }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Message..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent' }}
              />
              {text.trim() && (
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px' }}>
                  Send
                </button>
              )}
            </div>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}