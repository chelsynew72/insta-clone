'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      toast.success('Password reset successfully! Please login.');
      router.push('/login');
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
          
          <div style={{ marginBottom: '24px' }}>
             <span className="ig-logo">Instagram</span>
          </div>

          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '16px' }}>Reset Your Password</h2>

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              className="ig-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="ig-input"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <input
              className="ig-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <button
              className="ig-btn-primary"
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || !email}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="ig-divider" style={{ margin: '24px 0' }}>
            <span>OR</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Link href="/login" style={{ color: '#00376b', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
