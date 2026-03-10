'use client';
import { useAuthStore } from '@/store/auth.store';

const mockStories = [
  { uid: '1', username: 'your_story', avatarUrl: '', isYou: true },
  { uid: '2', username: 'john_doe', avatarUrl: '' },
  { uid: '3', username: 'sarah_k', avatarUrl: '' },
  { uid: '4', username: 'mike_23', avatarUrl: '' },
  { uid: '5', username: 'lisa_photos', avatarUrl: '' },
  { uid: '6', username: 'travel.with.me', avatarUrl: '' },
];

function Avatar({ username, avatarUrl, size = 56, hasStory = false, isYou = false }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{
        width: size + 4, height: size + 4, borderRadius: '50%',
        background: hasStory ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' : '#dbdbdb',
        padding: '2px', boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', backgroundColor: '#dbdbdb', position: 'relative' }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, color: '#8e8e8e' }}>{username[0].toUpperCase()}</div>
          }
          {isYou && (
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '18px', height: '18px', backgroundColor: '#0095f6', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 700, lineHeight: 1 }}>+</span>
            </div>
          )}
        </div>
      </div>
      <span style={{ fontSize: '12px', color: '#262626', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {isYou ? 'Your story' : username}
      </span>
    </div>
  );
}

export default function StoriesBar() {
  const { user } = useAuthStore();

  return (
    <div style={{
      backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px',
      padding: '16px 16px', marginBottom: '24px', overflowX: 'auto',
      scrollbarWidth: 'none'
    }}>
      <div style={{ display: 'flex', gap: '16px', width: 'max-content' }}>
        <Avatar username={user?.username || 'you'} avatarUrl={user?.avatarUrl} isYou hasStory={false} />
        {mockStories.slice(1).map(s => (
          <Avatar key={s.uid} username={s.username} avatarUrl={s.avatarUrl} hasStory />
        ))}
      </div>
    </div>
  );
}