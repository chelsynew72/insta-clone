'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStoryModal({ onClose, onCreated }: Props) {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  });

  const handleShare = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      formData.append('username', user?.username || '');
      formData.append('avatarUrl', user?.avatarUrl || '');
      await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Story shared! It will disappear in 24 hours.');
      onCreated();
    } catch {
      toast.error('Failed to share story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 200 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: '12px', zIndex: 201, width: '400px', maxWidth: '95vw', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #dbdbdb' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Create story</h3>
          {preview
            ? <button onClick={handleShare} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px', opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Sharing...' : 'Share'}
              </button>
            : <div style={{ width: '40px' }} />
          }
        </div>

        {/* Upload or preview */}
        {!preview ? (
          <div {...getRootProps()} style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: isDragActive ? '#fafafa' : 'white' }}>
            <input {...getInputProps()} />
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ fontSize: '18px', fontWeight: 300, color: '#262626', marginBottom: '12px' }}>
              {isDragActive ? 'Drop it here' : 'Add a photo to your story'}
            </p>
            <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>Disappears after 24 hours</p>
            <button style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 600, fontSize: '14px', padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Select photo
            </button>
          </div>
        ) : (
          <div>
            <div style={{ position: 'relative', height: '400px', backgroundColor: '#000' }}>
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #efefef' }}>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add a caption..."
                maxLength={150}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#262626' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}