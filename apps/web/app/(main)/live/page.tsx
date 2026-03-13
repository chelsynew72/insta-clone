'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import LiveStream from '@/components/live/LiveStream';

export default function LivePage() {
  const [lives, setLives] = useState<any[]>([]);
  const [watching, setWatching] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/live')
      .then(({ data }) => setLives(data))
      .finally(() => setLoading(false));

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      api.get('/live').then(({ data }) => setLives(data));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (watching) {
    return (
      <LiveStream
        channelName={watching.channelName}
        role="audience"
        hostUsername={watching.hostUsername}
        title={watching.title}
        onEnd={() => setWatching(null)}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', maxWidth: '935px', margin: '0 auto', paddingLeft: '245px', paddingTop: '30px', paddingBottom: '40px' }}>

        <h2 style={{ fontWeight: 600, fontSize: '16px', color: '#262626', marginBottom: '24px', padding: '0 20px' }}>
          Live Now
        </h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {!loading && lives.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8e8e8e' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#ed4956', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>LIVE</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626', marginBottom: '8px' }}>No one is live right now</p>
            <p style={{ fontSize: '14px' }}>When people you follow go live, you'll see them here.</p>
          </div>
        )}

        {/* Live grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '0 20px' }}>
          {lives.map(live => (
            <div
              key={live._id}
              onClick={() => setWatching(live)}
              style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#dbdbdb', position: 'relative', paddingBottom: '133%' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '24px', fontWeight: 600, color: 'white' }}>
                    {live.hostUsername[0]?.toUpperCase()}
                  </div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{live.hostUsername}</p>
                  {live.title && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px' }}>{live.title}</p>}
                </div>
              </div>
              {/* LIVE badge */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#ed4956', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                LIVE
              </div>
              {/* Viewer count */}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                {live.viewerCount}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}