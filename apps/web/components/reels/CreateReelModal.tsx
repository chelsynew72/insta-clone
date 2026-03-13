'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';

interface Props {
  onClose: () => void;
  onCreated: (reel: any) => void;
}

export default function CreateReelModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<'select' | 'preview' | 'details'>('select');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [audio, setAudio] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) return alert('Please select a video file');
    if (f.size > 100 * 1024 * 1024) return alert('Video must be under 100MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep('preview');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('caption', caption);
      formData.append('audio', audio);
      const { data } = await api.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated(data);
      onClose();
    } catch {
      alert('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#262626' }}>Cancel</button>
          <h2 style={{ fontWeight: 600, fontSize: '16px' }}>New reel</h2>
          {step === 'details'
            ? <button onClick={handleSubmit} disabled={uploading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#0095f6' }}>
                {uploading ? 'Uploading...' : 'Share'}
              </button>
            : step === 'preview'
              ? <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#0095f6' }}>Next</button>
              : <div />
          }
        </div>

        {/* Select step */}
        {step === 'select' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fafafa', border: '2px solid #dbdbdb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="1.5">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: '18px', color: '#262626' }}>Select a video</p>
            <p style={{ color: '#8e8e8e', fontSize: '14px', textAlign: 'center' }}>Choose a vertical video from your device. Max 100MB.</p>
            <button onClick={() => fileRef.current?.click()}
              style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 600, fontSize: '14px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Select from device
            </button>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && preview && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: '20px' }}>
            <video src={preview} controls style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}

        {/* Details step */}
        {step === 'details' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {preview && (
              <video src={preview} muted style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#000' }} />
            )}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Caption</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={500}
                rows={3}
                style={{ width: '100%', border: '1px solid #dbdbdb', borderRadius: '8px', padding: '10px', fontSize: '14px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Audio name</label>
              <input
                value={audio}
                onChange={e => setAudio(e.target.value)}
                placeholder="e.g. Original audio · your name"
                style={{ width: '100%', border: '1px solid #dbdbdb', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}