'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Wait for token to be ready
          await firebaseUser.getIdToken(true);
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch {
          // User exists in Firebase but not yet in MongoDB (mid-registration)
          // This is fine — the register handler sets the user directly
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, [setUser]);

  return <>{children}</>;
}