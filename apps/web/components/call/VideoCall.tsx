'use client';
import { useEffect, useRef } from 'react';
import { useAgora } from '@/hooks/useAgora';
import api from '@/lib/api';

interface Props {
  channelName: string;
  role: 'host' | 'audience';
  remoteUsername: string;
  onEnd: () => void;
}

export default function VideoCall({ channelName, role, remoteUsername, onEnd }: Props) {
  const { join, leave, toggleMic, toggleCam, localVideoTrack, remoteVideoTrack, joined, micMuted, camOff, error } = useAgora(channelName, role);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => { join(); return () => { leave(); }; }, []);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.play(remoteVideoRef.current);
    }
  }, [remoteVideoTrack]);

  const handleEnd = () => { leave(); onEnd(); };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 500 }}>
      {/* Remote video — full screen */}
      <div ref={remoteVideoRef} style={{ width: '100%', height: '100%', backgroundColor: '#111' }}>
        {!remoteVideoTrack && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 600, color: 'white' }}>
              {remoteUsername[0]?.toUpperCase()}
            </div>
            <p style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>{remoteUsername}</p>
            <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
              {joined ? 'Calling...' : 'Connecting...'}
            </p>
          </div>
        )}
      </div>

      {/* Local video — picture-in-picture */}
      <div ref={localVideoRef} style={{ position: 'absolute', bottom: '100px', right: '20px', width: '120px', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #333', backgroundColor: '#222' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(rgba(0,0,0,0.5), transparent)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>{remoteUsername}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{remoteVideoTrack ? 'Connected' : 'Calling...'}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Mute */}
        <button onClick={toggleMic} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: micMuted ? '#ed4956' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            {micMuted
              ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/></>
              : <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>
            }
          </svg>
        </button>

        {/* End call */}
        <button onClick={handleEnd} style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#ed4956', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 012 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.19 19.79 19.79 0 01.36 .55a2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.3 6.6a16 16 0 004.38 6.71z" transform="rotate(135 12 12)"/>
          </svg>
        </button>

        {/* Camera */}
        <button onClick={toggleCam} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: camOff ? '#ed4956' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            {camOff
              ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34m-7.72-2.06a4 4 0 11-5.56-5.56"/></>
              : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
            }
          </svg>
        </button>
      </div>

      {error && (
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ed4956', padding: '8px 16px', borderRadius: '8px', color: 'white', fontSize: '14px' }}>
          {error}
        </div>
      )}
    </div>
  );
}