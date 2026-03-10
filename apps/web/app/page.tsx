import Link from 'next/link';

const footerLinks = ['About','Help','Press','API','Jobs','Privacy','Terms','Locations','Top Accounts','Hashtags','Language'];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero with Instagram gradient */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 text-white text-center py-16"
        style={{ background: 'linear-gradient(to bottom, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)' }}
      >
        {/* Icon */}
        <div className="mb-4 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
          </svg>
        </div>

        {/* Logo */}
        <h1 style={{ fontFamily: "'Grand Hotel', cursive", fontSize: '52px', lineHeight: 1, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
          Instagram
        </h1>

        <p className="mt-3 text-white/80 text-base max-w-xs">
          See photos and videos from your friends.
        </p>

        {/* Buttons */}
        <div className="w-full max-w-[260px] flex flex-col gap-3 mt-8">
          <Link href="/register" className="block">
            <button style={{
              width: '100%', backgroundColor: 'white', color: '#d62976',
              fontWeight: 700, fontSize: '14px', padding: '10px 16px',
              borderRadius: '8px', border: 'none', cursor: 'pointer'
            }}>
              Create new account
            </button>
          </Link>
          <Link href="/login" className="block">
            <button style={{
              width: '100%', backgroundColor: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.8)', color: 'white',
              fontWeight: 700, fontSize: '14px', padding: '10px 16px',
              borderRadius: '8px', cursor: 'pointer'
            }}>
              Log in
            </button>
          </Link>
        </div>

        <p className="mt-10 text-white/50 text-xs">
          from <span className="font-semibold text-white/70">Meta</span>
        </p>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 px-4 text-center border-t border-[#dbdbdb]">
        <div className="ig-footer-links">
          {footerLinks.map(l => <a key={l}>{l}</a>)}
        </div>
        <p style={{ color: '#737373', fontSize: '12px' }}>© 2026 INSTAGRAM FROM META</p>
      </footer>
    </div>
  );
}