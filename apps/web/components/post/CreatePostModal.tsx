'use client';
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

type Step = 'select' | 'preview' | 'caption';

export default function CreatePostModal({ onClose, onPostCreated }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep('preview');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleNext = () => setStep('caption');
  const handleBack = () => setStep(step === 'caption' ? 'preview' : 'select');

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Post shared!');
      onPostCreated(data);
      onClose();
    } catch {
      toast.error('Failed to share post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 200 }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', borderRadius: '12px',
        zIndex: 201, overflow: 'hidden',
        width: step === 'select' ? '520px' : '820px',
        maxWidth: '95vw',
        transition: 'width 0.3s ease',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #dbdbdb' }}>
          {step !== 'select' && (
            <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#262626' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
          <h3 style={{ fontWeight: 600, fontSize: '16px', color: '#262626', flex: 1, textAlign: 'center' }}>
            {step === 'select' ? 'Create new post' : step === 'preview' ? 'Crop' : 'Create new post'}
          </h3>
          {step === 'preview' && (
            <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px' }}>
              Next
            </button>
          )}
          {step === 'caption' && (
            <button onClick={handleSubmit} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0095f6', fontWeight: 600, fontSize: '14px', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
          {step === 'select' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Step: Select */}
        {step === 'select' && (
          <div
            {...getRootProps()}
            style={{
              height: '520px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              backgroundColor: isDragActive ? '#fafafa' : 'white',
              transition: 'background 0.2s',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ marginBottom: '16px' }}>
              <svg width="77" height="77" viewBox="0 0 77 77" fill="none">
                <path d="M38.5 7.5C21.4 7.5 7.5 21.4 7.5 38.5S21.4 69.5 38.5 69.5 69.5 55.6 69.5 38.5 55.6 7.5 38.5 7.5z" stroke="#262626" strokeWidth="2.5"/>
                <path d="M27 38.5h23M38.5 27v23" stroke="#262626" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '22px', fontWeight: 300, color: '#262626', marginBottom: '12px' }}>
              {isDragActive ? 'Drop your photo here' : 'Drag photos and videos here'}
            </p>
            <button style={{
              backgroundColor: '#0095f6', color: 'white', fontWeight: 600,
              fontSize: '14px', padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer'
            }}>
              Select from computer
            </button>
          </div>
        )}

        {/* Step: Preview + Caption */}
        {(step === 'preview' || step === 'caption') && (
          <div style={{ display: 'flex' }}>
            {/* Image preview */}
            <div style={{ width: '520px', height: '520px', flexShrink: 0, backgroundColor: '#000', position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

              {/* Filter bar at bottom of image */}
              {step === 'preview' && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))', padding: '20px 16px 12px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
                  {['Normal','Clarendon','Gingham','Moon','Lark','Reyes','Juno','Slumber'].map(f => (
                    <div key={f} style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', border: '2px solid white', marginBottom: '4px' }}>
                        <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'white' }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caption panel */}
            {step === 'caption' && (
              <div style={{ width: '340px', display: 'flex', flexDirection: 'column' }}>
                {/* User info */}
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dbdbdb' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>You</span>
                </div>

                {/* Caption textarea */}
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  maxLength={2200}
                  style={{
                    flex: 1, border: 'none', outline: 'none', resize: 'none',
                    padding: '0 16px', fontSize: '14px', color: '#262626',
                    fontFamily: 'inherit', lineHeight: '20px', minHeight: '168px'
                  }}
                />

                {/* Character count */}
                <div style={{ padding: '8px 16px', textAlign: 'right', borderTop: '1px solid #efefef' }}>
                  <span style={{ fontSize: '12px', color: '#8e8e8e' }}>{caption.length}/2,200</span>
                </div>

                {/* Extra options */}
                {[
                  { label: 'Add location', icon: '📍' },
                  { label: 'Accessibility', icon: '♿' },
                  { label: 'Advanced settings', icon: '⚙️' },
                ].map(opt => (
                  <div key={opt.label} style={{ padding: '14px 16px', borderTop: '1px solid #efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#262626' }}>
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}