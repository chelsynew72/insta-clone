'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import CreatePostModal from '@/components/post/CreatePostModal';

export default function Sidebar({ onPostCreated }: { onPostCreated?: (post: any) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [showMore, setShowMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const navItems = [
    { label: 'Home', href: '/feed', icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#262626' : 'none'} stroke="#262626" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { label: 'Search', href: '/search', icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )},
    { label: 'Explore', href: '/explore', icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    )},
    { label: 'Messages', href: '/messages', icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    )},
    { label: 'Notifications', href: '/notifications', icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    )},
  ];

  return (
    <>
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '245px',
        backgroundColor: 'white', borderRight: '1px solid #dbdbdb',
        display: 'flex', flexDirection: 'column', padding: '8px 12px', zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 12px 24px' }}>
          <span className="ig-logo" style={{ fontSize: '28px' }}>Instagram</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: active ? 600 : 400, color: '#262626' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {item.icon(active)}
                  <span style={{ fontSize: '16px' }}>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Create */}
          <div
            onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#262626' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span style={{ fontSize: '16px' }}>Create</span>
          </div>

          {/* Profile */}
          {user && (
            <Link href={`/profile/${user.uid}`} style={{ textDecoration: 'none' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#262626' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#dbdbdb', flexShrink: 0 }}>
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#8e8e8e' }}>{user.username?.[0]?.toUpperCase()}</div>
                  }
                </div>
                <span style={{ fontSize: '16px' }}>Profile</span>
              </div>
            </Link>
          )}
        </nav>

        {/* More */}
        <div style={{ position: 'relative' }}>
          {showMore && (
            <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
              <button
                onClick={handleLogout}
                style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#262626', fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Log out
              </button>
            </div>
          )}
          <div
            onClick={() => setShowMore(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#262626' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <span style={{ fontSize: '16px' }}>More</span>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPostCreated={(post) => {
            onPostCreated?.(post);
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
}