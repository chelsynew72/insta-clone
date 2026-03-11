'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSaved: (user: any) => void;
}

export default function EditProfileModal({ onClose, onSaved }: Props) {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/me', form);
      setUser(data.user);
      onSaved(data.user);
      toast.success('Profile updated!');
      onClose();
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', borderRadius: '12px', zIndex: 201,
        width: '520px', maxWidth: '95vw', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #dbdbdb' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#262626' }}>Cancel</button>
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Edit profile</h3>
          <button onClick={handleSave} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>

        {/* Avatar */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #efefef', backgroundColor: '#fafafa', borderRadius: '12px', margin: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '20px', color: '#8e8e8e' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>{user?.username}</p>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px', padding: 0, marginTop: '4px' }}>
              Change profile photo
            </button>
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px', color: '#262626', display: 'block', marginBottom: '6px' }}>Username</label>
            <input
              className="ig-input"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', color: '#262626', display: 'block', marginBottom: '6px' }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              maxLength={150}
              rows={3}
              style={{ width: '100%', border: '1px solid #dbdbdb', borderRadius: '3px', padding: '9px 8px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '12px', color: '#8e8e8e', textAlign: 'right' }}>{form.bio.length}/150</p>
          </div>
        </div>
      </div>
    </>
  );
}