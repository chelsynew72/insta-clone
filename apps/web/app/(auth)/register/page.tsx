'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const footerLinks = ['About','Help','Press','API','Jobs','Privacy','Terms','Locations','Top Accounts','Hashtags','Language'];

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isValid = form.email && form.fullName && form.username && form.password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      const { data } = await api.post('/auth/register', { username: form.username });
      setUser(data.user);
      toast.success('Welcome to Instagram!');
      router.push('/feed');
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Another account is using the same email.'
        : err.response?.data?.message || 'An error occurred.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '350px' }}>

        {/* Main card */}
        <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', padding: '32px 40px 24px', marginBottom: '10px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span className="ig-logo">Instagram</span>
          </div>

          <p style={{ textAlign: 'center', fontWeight: 600, color: '#737373', fontSize: '17px', lineHeight: '20px', marginBottom: '20px' }}>
            Sign up to see photos and<br />videos from your friends.
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            <input className="ig-input" placeholder="Mobile number or email" value={form.email} onChange={e => update('email', e.target.value)} />
            <input className="ig-input" placeholder="Full Name" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
            <input className="ig-input" placeholder="Username" value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))} />
            <input className="ig-input" type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} />

            <button className="ig-btn-primary" type="submit" disabled={loading || !isValid} style={{ marginTop: '8px' }}>
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#737373', marginTop: '16px', lineHeight: '16px' }}>
            By signing up, you agree to our{' '}
            <span style={{ fontWeight: 600, color: '#262626', cursor: 'pointer' }}>Terms</span>,{' '}
            <span style={{ fontWeight: 600, color: '#262626', cursor: 'pointer' }}>Privacy Policy</span> and{' '}
            <span style={{ fontWeight: 600, color: '#262626', cursor: 'pointer' }}>Cookies Policy</span>.
          </p>
        </div>

        {/* Log in card */}
        <div style={{ backgroundColor: 'white', border: '1px solid #dbdbdb', padding: '16px', textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: '#0095f6', fontWeight: 600, textDecoration: 'none' }}>
            Log in
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
      <footer style={{ textAlign: 'center', paddingBottom: '32px' }}>
        <div className="ig-footer-links">
          {footerLinks.map(l => <a key={l}>{l}</a>)}
        </div>
        <p style={{ color: '#737373', fontSize: '12px' }}>© 2026 INSTAGRAM FROM META</p>
      </footer>
    </div>
  );
}