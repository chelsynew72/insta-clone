'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import VideoCall from '@/components/call/VideoCall';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const otherUid = Array.isArray(params.uid) ? params.uid[0] : params.uid as string;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [text, setText] = useState('');
  const [inCall, setInCall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    api.get(`/messages/${otherUid}`).then(({ data }) => setMessages(data));
    api.get(`/users/${otherUid}`).then(({ data }) => setOtherUser(data.user));

    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL!, { auth: { token }, transports: ['websocket'] });
      socketRef.current.on('message', (msg: any) => {
        if (msg.fromUid === otherUid || msg.toUid === otherUid) setMessages(prev => [...prev, msg]);
      });
      socketRef.current.on('messageSent', (msg: any) => setMessages(prev => [...prev, msg]));
    };
    connect();
    return () => { socketRef.current?.disconnect(); };
  }, [otherUid]);

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
      <div style={{ marginLeft: isMobile ? '0' : '245px', display: 'flex', justifyContent: 'center', paddingTop: isMobile ? '0' : '30px', height: isMobile ? '100vh' : 'auto' }}>
        <div style={{ width: '100%', maxWidth: '935px', backgroundColor: 'white', border: isMobile ? 'none' : '1px solid #dbdbdb', borderRadius: isMobile ? '0' : '3px', height: isMobile ? '100vh' : '85vh', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link href="/messages">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" style={{ cursor: 'pointer' }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
              {otherUser?.avatarUrl
                ? <img src={otherUser.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#8e8e8e' }}>{otherUser?.username?.[0]?.toUpperCase()}</div>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{otherUser?.username || otherUid}</p>
              <p style={{ fontSize: '12px', color: '#8e8e8e' }}>Active now</p>
            </div>
            {/* Video call button */}
            <button onClick={() => setInCall(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#8e8e8e' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dbdbdb', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 600, color: '#8e8e8e' }}>
                  {otherUser?.username?.[0]?.toUpperCase()}
                </div>
                <p style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '4px' }}>{otherUser?.username}</p>
                <p style={{ fontSize: '14px' }}>{otherUser?.followersCount || 0} followers</p>
              </div>
            )}
            {messages.map((msg: any, i: number) => {
              const isMine = msg.fromUid === user?.uid;
              return (
                <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isMine ? '#0095f6' : '#efefef', color: isMine ? 'white' : '#262626', fontSize: '14px', lineHeight: '18px', wordBreak: 'break-word' }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ flex: 1, border: '1px solid #dbdbdb', borderRadius: '22px', display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Message..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', minWidth: 0 }}
              />
              {text.trim() && (
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>Send</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {inCall && (
        <VideoCall
          channelName={`call-${[user?.uid, otherUid].sort().join('-')}`}
          role="host"
          remoteUsername={otherUser?.username || ''}
          onEnd={() => setInCall(false)}
        />
      )}
    </div>
  );
}