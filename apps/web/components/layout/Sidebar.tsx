"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import CreatePostModal from "@/components/post/CreatePostModal";
import LiveStream from "@/components/live/LiveStream";

export default function Sidebar({
  onPostCreated,
}: {
  onPostCreated?: (post: any) => void;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showLive, setShowLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications")
      .then(({ data }) => {
        setNotifCount(data.filter((n: any) => !n.read).length);
      })
      .catch(() => {});
    api
      .get("/messages/conversations")
      .then(({ data }) => {
        setMsgCount(data.filter((c: any) => c.unread).length);
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    logout();
    router.push("/login");
  };

  const navItems = [
    {
      label: "Home",
      href: "/feed",
      badge: 0,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#262626" : "none"} stroke="#262626" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Search",
      href: "/search",
      badge: 0,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth={active ? 2.5 : 2}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      label: "Explore",
      href: "/explore",
      badge: 0,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#262626" : "none"} stroke="#262626" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
  label: "Reels",
  href: "/reels",
  badge: 0,
  icon: (active: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#262626" : "none"} stroke="#262626" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  ),
},
    {
      label: "Messages",
      href: "/messages",
      badge: msgCount,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#262626" : "none"} stroke="#262626" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      href: "/notifications",
      badge: notifCount,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#262626" : "none"} stroke="#262626" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: `/profile/${user?.uid}`,
      badge: 0,
      icon: (_active: boolean) => (
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#dbdbdb", border: pathname === `/profile/${user?.uid}` ? "2px solid #262626" : "2px solid transparent" }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#8e8e8e" }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      ),
    },
  ];

  // ── MOBILE BOTTOM NAV ──
  if (isMobile) {
    return (
      <>
        <div style={{ height: "60px" }} />
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "60px", backgroundColor: "white", borderTop: "1px solid #dbdbdb", display: "flex", alignItems: "center", justifyContent: "space-around", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)" }}>
          <Link href="/feed">
            <div style={{ padding: "8px", cursor: "pointer" }}>{navItems[0].icon(pathname === "/feed")}</div>
          </Link>
          <Link href="/search">
            <div style={{ padding: "8px", cursor: "pointer" }}>{navItems[1].icon(pathname === "/search")}</div>
          </Link>
          {/* Create */}
          <div onClick={() => setShowCreate(true)} style={{ padding: "8px", cursor: "pointer" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <Link href="/notifications">
            <div style={{ padding: "8px", cursor: "pointer", position: "relative" }}>
              {navItems[4].icon(pathname === "/notifications")}
              {notifCount > 0 && (
                <div style={{ position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", backgroundColor: "#ed4956", borderRadius: "50%", fontSize: "10px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {notifCount}
                </div>
              )}
            </div>
          </Link>
          <Link href={`/profile/${user?.uid}`}>
            <div style={{ padding: "8px", cursor: "pointer" }}>{navItems[5].icon(pathname === `/profile/${user?.uid}`)}</div>
          </Link>
        </nav>

        {showCreate && (
          <CreatePostModal
            onClose={() => setShowCreate(false)}
            onPostCreated={(post: any) => { setShowCreate(false); onPostCreated?.(post); }}
          />
        )}

        {showLive && (
          <LiveStream
            channelName={user?.uid || ""}
            role="host"
            hostUsername={user?.username || ""}
            title={liveTitle}
            onEnd={() => setShowLive(false)}
          />
        )}
      </>
    );
  }

  // ── DESKTOP SIDEBAR ──
  return (
    <>
      <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "245px", backgroundColor: "white", borderRight: "1px solid #dbdbdb", display: "flex", flexDirection: "column", padding: "8px 0", zIndex: 100 }}>
        {/* Logo */}
        <div style={{ padding: "16px 24px 24px" }}>
          <Link href="/feed" style={{ textDecoration: "none" }}>
            <span className="ig-logo" style={{ fontSize: "24px" }}>Instagram</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", borderRadius: "8px", marginBottom: "4px", cursor: "pointer", position: "relative", backgroundColor: "transparent", transition: "background-color 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.icon(active)}
                  <span style={{ fontSize: "16px", fontWeight: active ? 600 : 400, color: "#262626" }}>
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <div style={{ position: "absolute", left: "28px", top: "8px", width: "18px", height: "18px", backgroundColor: "#ed4956", borderRadius: "50%", fontSize: "11px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.badge > 9 ? "9+" : item.badge}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Create */}
          <div
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", borderRadius: "8px", marginBottom: "4px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span style={{ fontSize: "16px", color: "#262626" }}>Create</span>
          </div>

          {/* Go Live — inside nav ✅ */}
          <div
            onClick={() => setShowLive(true)}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", borderRadius: "8px", marginBottom: "4px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div style={{ width: "24px", height: "24px", backgroundColor: "#ed4956", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: "9px", fontWeight: 800, letterSpacing: "0.5px" }}>LIVE</span>
            </div>
            <span style={{ fontSize: "16px", color: "#262626" }}>Go Live</span>
          </div>
        </nav>

        {/* More menu */}
        <div style={{ padding: "0 8px 8px", position: "relative" }}>
          <div
            onClick={() => setShowMore((s) => !s)}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", borderRadius: "8px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
            <span style={{ fontSize: "16px", color: "#262626" }}>More</span>
          </div>

          {showMore && (
            <>
              <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{ position: "absolute", bottom: "60px", left: "8px", right: "8px", backgroundColor: "white", border: "1px solid #dbdbdb", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}>
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: "14px", color: "#262626" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPostCreated={(post: any) => { setShowCreate(false); onPostCreated?.(post); }}
        />
      )}

      {/* LiveStream overlay — desktop ✅ */}
      {showLive && (
        <LiveStream
          channelName={user?.uid || ""}
          role="host"
          hostUsername={user?.username || ""}
          title={liveTitle}
          onEnd={() => setShowLive(false)}
        />
      )}
    </>
  );
}