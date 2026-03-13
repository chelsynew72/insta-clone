import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/layout/AuthProvider';

export const metadata: Metadata = {
  title: 'Instagram',
  description: 'Instagram Clone',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}