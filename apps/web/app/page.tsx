'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const footerLinks = ['About','Help','Press','API','Jobs','Privacy','Terms','Locations','Top Accounts','Hashtags','Language'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const { data } = await api.post('/auth/login');
      setUser(data.user);
      router.push('/feed');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Sorry, your password was incorrect.'
        : 'An error occurred. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length >= 1;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '350px' }}>

        {/* Main card */}
        <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', padding: '40px 40px 24px', marginBottom: '10px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="ig-logo">Instagram</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              className="ig-input"
              type="text"
              placeholder="Phone number, username, or email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="ig-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              className="ig-btn-primary"
              type="submit"
              disabled={loading || !canSubmit}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Forgot password */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/forgot-password" style={{ color: '#00376b', fontSize: '12px', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign up card */}
        <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', padding: '16px', textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#0095f6', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>

        {/* Get the app */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#262626', marginBottom: '16px' }}>Get the app.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on App Store"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', paddingBottom: '32px', paddingTop: '8px' }}>
        <div className="ig-footer-links">
          {footerLinks.map(l => <a key={l}>{l}</a>)}
        </div>
        <p style={{ color: '#737373', fontSize: '12px' }}>© 2026 INSTAGRAM FROM META</p>
      </footer>
    </div>
  );
}
