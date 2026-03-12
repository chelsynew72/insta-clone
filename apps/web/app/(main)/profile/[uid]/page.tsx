'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import EditProfileModal from '@/components/profile/EditProfileModal';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const params = useParams();
const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid as string;
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');

  const isOwnProfile = user?.uid === uid;

useEffect(() => {
  if (!user || !uid) return;

  console.log('FETCHING — user:', user.uid, 'profile:', uid, 'own:', user.uid === uid);

  const fetchData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${uid}`),
        api.get(`/posts/user/${uid}`),
      ]);
      setProfile(profileRes.data.user);
      setPosts(postsRes.data);

      if (user.uid !== uid) {
        const [followRes, blocksRes] = await Promise.all([
          api.get(`/follows/${uid}/is-following`),  // ← direct check
          api.get('/blocks'),
        ]);

        console.log('isFollowing response:', followRes.data);
        setIsFollowing(followRes.data.isFollowing);
        setIsBlocked(blocksRes.data.some((b: any) => b.blockedUid === uid));
      }
    } catch (err) {
      console.error('fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [uid, user]);
   


      
  

  const handleFollow = async () => {
    if (isFollowing) {
      setIsFollowing(false);
      setProfile((p: any) => ({ ...p, followersCount: p.followersCount - 1 }));
      await api.delete(`/follows/${uid}`);
    } else {
      setIsFollowing(true);
      setProfile((p: any) => ({ ...p, followersCount: p.followersCount + 1 }));
      await api.post(`/follows/${uid}`);
    }
  };

  const handleBlock = async () => {
    if (isBlocked) {
      await api.delete(`/blocks/${uid}`);
      setIsBlocked(false);
      toast.success('User unblocked');
    } else {
      await api.post(`/blocks/${uid}`);
      setIsBlocked(true);
      // Also unfollow if blocking
      if (isFollowing) {
        await api.delete(`/follows/${uid}`);
        setIsFollowing(false);
      }
      toast.success('User blocked');
    }
    setShowOptions(false);
  };

  if (loading) return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #dbdbdb', borderTopColor: '#262626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '245px', maxWidth: '935px', margin: '0 auto', paddingLeft: '245px', paddingTop: '30px' }}>

        {/* Profile header */}
<div className="profile-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '80px', padding: '0 20px 44px' }}>

          {showEdit && (
            <EditProfileModal
              onClose={() => setShowEdit(false)}
              onSaved={(updated) => setProfile(updated)}
            />
          )}

          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
<div className="profile-avatar" style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#dbdbdb', border: '1px solid #dbdbdb' }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', fontWeight: 300, color: '#8e8e8e' }}>
                    {profile?.username?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h2 style={{ fontWeight: 300, fontSize: '28px', color: '#262626' }}>{profile?.username}</h2>

              {isOwnProfile ? (
                <button
                  onClick={() => setShowEdit(true)}
                  style={{ padding: '7px 16px', backgroundColor: 'transparent', border: '1px solid #dbdbdb', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#262626' }}
                >
                  Edit profile
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Follow button — hidden if blocked */}
                  {!isBlocked && (
                    <button
                      onClick={handleFollow}
                      style={{
                        padding: '7px 16px', borderRadius: '8px', fontWeight: 600,
                        fontSize: '14px', cursor: 'pointer', border: 'none',
                        backgroundColor: isFollowing ? 'transparent' : '#0095f6',
                        color: isFollowing ? '#262626' : 'white',
                        outline: isFollowing ? '1px solid #dbdbdb' : 'none',
                      } as any}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}

                  {/* Message button — hidden if blocked */}
                  {!isBlocked && (
                    <Link href={`/messages/${uid}`}>
                      <button style={{ padding: '7px 16px', backgroundColor: 'transparent', border: '1px solid #dbdbdb', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#262626' }}>
                        Message
                      </button>
                    </Link>
                  )}

                  {/* 3-dot options */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowOptions(s => !s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
                        <circle cx="5" cy="12" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="19" cy="12" r="1.5"/>
                      </svg>
                    </button>

                    {showOptions && (
                      <>
                        {/* Close backdrop */}
                        <div onClick={() => setShowOptions(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />

                        {/* Dropdown */}
                        <div style={{ position: 'absolute', right: 0, top: '40px', backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '220px', overflow: 'hidden' }}>
                          <button
                            onClick={handleBlock}
                            style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ed4956', fontWeight: 700, borderBottom: '1px solid #efefef' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {isBlocked ? '✓ Unblock' : 'Block'}
                          </button>
                          <button
                            style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ed4956', fontWeight: 600, borderBottom: '1px solid #efefef' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Report
                          </button>
                          <button
                            style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#262626', borderBottom: '1px solid #efefef' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Restrict
                          </button>
                          <button
                            onClick={() => setShowOptions(false)}
                            style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#262626' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
<div className="profile-stats" style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
              {[
                { label: 'posts', value: posts.length },
                { label: 'followers', value: profile?.followersCount || 0 },
                { label: 'following', value: profile?.followingCount || 0 },
              ].map(stat => (
                <div key={stat.label}>
                  <span style={{ fontWeight: 600, fontSize: '16px', color: '#262626' }}>{stat.value.toLocaleString()}</span>
                  <span style={{ color: '#262626', fontSize: '16px' }}> {stat.label}</span>
                </div>
              ))}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p style={{ fontSize: '14px', color: '#262626', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Blocked banner */}
        {isBlocked && (
          <div style={{ margin: '0 20px 24px', padding: '16px', backgroundColor: '#fafafa', border: '1px solid #dbdbdb', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#262626', marginBottom: '4px' }}>You've blocked this account</p>
            <p style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '12px' }}>You can't see their posts while they're blocked.</p>
            <button
              onClick={handleBlock}
              style={{ padding: '7px 16px', backgroundColor: 'transparent', border: '1px solid #dbdbdb', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#262626' }}
            >
              Unblock
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderTop: '1px solid #dbdbdb', display: 'flex', justifyContent: 'center', gap: '48px' }}>
          {[
            { key: 'posts', label: 'POSTS', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            )},
            { key: 'saved', label: 'SAVED', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            )},
            { key: 'tagged', label: 'TAGGED', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            )},
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '16px 0', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                letterSpacing: '1px',
                color: activeTab === tab.key ? '#262626' : '#8e8e8e',
                borderTop: activeTab === tab.key ? '1px solid #262626' : '1px solid transparent',
                marginTop: '-1px',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Posts grid — hidden if blocked */}
        {activeTab === 'posts' && !isBlocked && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '3px 0' }}>
            {posts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: '#8e8e8e' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626' }}>No Posts Yet</p>
              </div>
            )}
            {posts.map(post => (
              <Link key={post._id} href={`/post/${post._id}`}>
                <div
                  style={{ position: 'relative', paddingBottom: '100%', backgroundColor: '#dbdbdb', overflow: 'hidden', cursor: 'pointer' }}
                  onMouseEnter={e => { const o = e.currentTarget.querySelector('.overlay') as HTMLElement; if (o) o.style.opacity = '1'; }}
                  onMouseLeave={e => { const o = e.currentTarget.querySelector('.overlay') as HTMLElement; if (o) o.style.opacity = '0'; }}
                >
                  <img src={post.imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', opacity: 0, transition: 'opacity 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      {post.likesCount || 0}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      {post.commentsCount || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8e8e8e' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
            <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626' }}>Save</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Save photos and videos that you want to see again.</p>
          </div>
        )}

        {activeTab === 'tagged' && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8e8e8e' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            </svg>
            <p style={{ fontWeight: 600, fontSize: '22px', color: '#262626' }}>Photos of you</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>When people tag you in photos, they'll appear here.</p>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
