'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAgora } from '@/hooks/useAgora';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';

interface Props {
  channelName: string;
  role: 'host' | 'audience';
  hostUsername: string;
  title?: string;
  onEnd: () => void;
}

export default function LiveStream({ channelName, role, hostUsername, title, onEnd }: Props) {
  const { user } = useAuthStore();
  const { join, leave, toggleMic, toggleCam, localVideoTrack, remoteVideoTrack, joined, micMuted, camOff } = useAgora(channelName, role);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgText, setMsgText] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const init = async () => {
      // ← FIX: call startLive so others can see the stream
      if (role === 'host') {
        await api.post('/live/start', { title: title || '' }).catch(() => {});
      } else {
        await api.post(`/live/${channelName}/join`).catch(() => {});
      }
      join();
    };
    init();

    return () => {
      leave();
      if (role === 'host') {
        api.delete('/live/end').catch(() => {});
      } else {
        api.post(`/live/${channelName}/leave`).catch(() => {});
      }
    };
  }, []);

  // Play local video
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  // Play remote video
  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.play(remoteVideoRef.current);
    }
  }, [remoteVideoTrack]);

  // Socket for live chat + viewer count
  useEffect(() => {
    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token },
        transports: ['websocket'],
      });
      socketRef.current = socket;

      socket.on(`liveChat:${channelName}`, (msg: any) => {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      });

      socket.on(`liveViewers:${channelName}`, ({ count }: any) => {
        setViewerCount(count);
      });

      // Notify others that someone went live
      if (role === 'host') {
        socket.emit('hostWentLive', { channelName, hostUsername, title });
      }
    };
    connect();
    return () => { socketRef.current?.disconnect(); };
  }, [channelName]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    socketRef.current?.emit('liveChatMessage', {
      channelName,
      message: msgText,
      username: user?.username,
    });
    setMsgText('');
  };

  const handleEnd = async () => {
    if (role === 'host') {
      await api.delete('/live/end').catch(() => {});
    }
    leave();
    onEnd();
  };

  const chatWidth = isMobile ? '100%' : '300px';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 500, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* Video area */}
      <div style={{ flex: 1, position: 'relative', minHeight: isMobile ? '55vh' : 'auto' }}>
        {/* Remote video */}
        <div ref={remoteVideoRef} style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
        {/* Local video */}
        <div ref={localVideoRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Waiting overlay for audience */}
        {role === 'audience' && !remoteVideoTrack && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'white', fontSize: '14px' }}>Connecting to stream...</p>
          </div>
        )}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(rgba(0,0,0,0.6), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#ed4956', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: 'white' }}>LIVE</div>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{hostUsername}</span>
            {title && !isMobile && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{title}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Viewer count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              {viewerCount}
            </div>
            {/* Toggle chat on mobile */}
            {isMobile && (
              <button onClick={() => setShowChat(s => !s)} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
                💬
              </button>
            )}
            <button onClick={handleEnd} style={{ backgroundColor: '#ed4956', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {role === 'host' ? 'End' : 'Leave'}
            </button>
          </div>
        </div>

        {/* Host controls */}
        {role === 'host' && (
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '16px' }}>
            <button onClick={toggleMic} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: micMuted ? '#ed4956' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {micMuted
                  ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/></>
                  : <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>
                }
              </svg>
            </button>
            <button onClick={toggleCam} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: camOff ? '#ed4956' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {camOff
                  ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34m-7.72-2.06a4 4 0 11-5.56-5.56"/></>
                  : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
                }
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chat panel */}
      {(!isMobile || showChat) && (
        <div style={{
          width: isMobile ? '100%' : '300px',
          height: isMobile ? '45vh' : '100%',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          borderTop: isMobile ? '1px solid #333' : 'none',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: 0 }}>Live Chat</h3>
            {isMobile && (
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>No messages yet. Say hi! 👋</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ fontSize: '13px' }}>
                <span style={{ fontWeight: 600, color: '#0095f6' }}>{msg.username} </span>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
            <input
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Say something..."
              style={{ flex: 1, backgroundColor: '#333', border: 'none', borderRadius: '20px', padding: '8px 14px', color: 'white', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#0095f6', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}