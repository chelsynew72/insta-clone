'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import StoryViewer from './StoryViewer';
import CreateStoryModal from './CreateStoryModal';

export default function StoriesBar() {
  const { user } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingGroup, setViewingGroup] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/stories/feed');
      setStoryGroups(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, []);

  return (
    <>
      <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', borderRadius: '3px', padding: '16px', marginBottom: '24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: '16px', width: 'max-content' }}>

          {/* Your story */}
          <div
            onClick={() => setShowCreate(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', padding: '2px', background: '#dbdbdb' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', backgroundColor: '#dbdbdb', position: 'relative' }}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: '#8e8e8e' }}>
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                }
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', backgroundColor: '#0095f6', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>+</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#262626', maxWidth: '68px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
              Your story
            </span>
          </div>

          {/* Loading skeletons */}
          {loading && [1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#efefef' }} />
              <div style={{ width: '48px', height: '10px', backgroundColor: '#efefef', borderRadius: '4px' }} />
            </div>
          ))}

          {/* Story groups */}
          {!loading && storyGroups.map(group => (
            <div
              key={group.uid}
              onClick={() => setViewingGroup(group)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', padding: '2px',
                background: group.hasUnviewed
                  ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                  : '#dbdbdb',
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', backgroundColor: '#dbdbdb' }}>
                  {group.avatarUrl
                    ? <img src={group.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: '#8e8e8e' }}>
                        {group.username?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#262626', maxWidth: '68px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {group.username}
              </span>
            </div>
          ))}

          {!loading && storyGroups.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#8e8e8e', fontSize: '13px', paddingLeft: '8px' }}>
              Follow people to see their stories
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          onClose={() => { setViewingGroup(null); fetchStories(); }}
        />
      )}

      {/* Create Story */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchStories(); }}
        />
      )}
    </>
  );
}