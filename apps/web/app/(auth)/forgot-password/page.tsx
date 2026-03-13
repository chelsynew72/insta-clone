'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '350px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', padding: '40px 40px 24px', textAlign: 'center' }}>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ width: '96px', height: '96px', border: '2px solid #262626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               <svg aria-label="Lock" color="#262626" fill="#262626" height="44" role="img" viewBox="0 0 48 48" width="44">
                 <path d="M15 16.3V10c0-4.962 4.038-9 9-9s9 4.038 9 9v6.3c3.414.862 6 3.931 6 7.61v11.59c0 4.411-3.589 8-8 8H17c-4.411 0-8-3.589-8-8V23.91c0-3.679 2.586-6.748 6-7.61zM18 10v6.3h12V10c0-3.309-2.691-6-6-6s-6 2.691-6 6zm21 13.91c0-2.757-2.243-5-5-5H14c-2.757 0-5 2.243-5 5v11.59c0 2.757 2.243 5 5 5h20c2.757 0 5-2.243 5-5V23.91z"></path>
               </svg>
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>Trouble Logging In?</h2>
            <p style={{ fontSize: '14px', color: '#8e8e8e', lineHeight: '18px', marginBottom: '16px' }}>
              Enter your email and we'll send you a link to get back into your account.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                className="ig-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                className="ig-btn-primary"
                type="submit"
                disabled={loading || !email}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Sending...' : 'Send Login Link'}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', color: '#262626' }}>We've sent an email to <strong>{email}</strong> with a link to reset your password.</p>
            </div>
          )}

          <div className="ig-divider" style={{ margin: '24px 0' }}>
            <span>OR</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Link href="/register" style={{ color: '#262626', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Create New Account
            </Link>
          </div>

          <div style={{ backgroundColor: '#fafafa', borderTop: '1px solid #dbdbdb', margin: '0 -40px -24px', padding: '14px 0' }}>
             <Link href="/login" style={{ color: '#262626', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
               Back To Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
