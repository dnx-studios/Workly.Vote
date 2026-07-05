import { useState, useEffect } from 'react';
import { Background } from '@/components/Background';
import { CookieModal } from '@/components/CookieModal';
import { UsernameModal } from '@/components/UsernameModal';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { VoteSection } from '@/components/VoteSection';
import { CommentSection } from '@/components/CommentSection';
import { AdminPanel } from '@/components/AdminPanel';
import { ShieldCheck } from 'lucide-react';

const ADMIN_USERNAME = 'Dinox';

export default function Home() {
  const [cookieState, setCookieState] = useState<'checking' | 'accepted' | 'pending'>('checking');
  const [userState, setUserState] = useState<{ status: 'checking' | 'set' | 'pending'; username: string | null }>({
    status: 'checking',
    username: null,
  });
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem('workly_cookies_accepted');
    setCookieState(accepted === 'true' ? 'accepted' : 'pending');

    const savedUsername = localStorage.getItem('workly_username');
    setUserState(
      savedUsername
        ? { status: 'set', username: savedUsername }
        : { status: 'pending', username: null }
    );
  }, []);

  // Fetch a server-signed admin token once the admin user is identified.
  // The token is derived from SESSION_SECRET server-side — the client cannot forge it.
  useEffect(() => {
    if (userState.username !== ADMIN_USERNAME) return;

    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/admin/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAdminToken(d?.token ?? null))
      .catch(() => setAdminToken(null));
  }, [userState.username]);

  const handleAcceptCookies = () => {
    localStorage.setItem('workly_cookies_accepted', 'true');
    setCookieState('accepted');
  };

  const handleSetUsername = (name: string) => {
    const trimmed = name.trim();
    localStorage.setItem('workly_username', trimmed);
    setUserState({ status: 'set', username: trimmed });
  };

  if (cookieState === 'checking' || userState.status === 'checking') return null;

  const showCookieModal = cookieState === 'pending';
  const showUserModal = !showCookieModal && userState.status === 'pending';
  const isReady = cookieState === 'accepted' && userState.status === 'set' && userState.username !== null;
  const isAdmin = userState.username === ADMIN_USERNAME;

  return (
    <div className="min-h-[100dvh] w-full text-white selection:bg-[#e82024]/30 selection:text-white">
      <Background />
      <CookieModal open={showCookieModal} onAccept={handleAcceptCookies} />
      <UsernameModal open={showUserModal} onComplete={handleSetUsername} />
      {isAdmin && adminToken && (
        <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} adminToken={adminToken} />
      )}
      <Header username={userState.username} />

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16 relative z-10 flex flex-col gap-5">
        {/* Tag */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-gray-400 shadow-xl shadow-black/40">
            <span className="text-[#e82024]">●</span>
            Workly Game Core · DNX Teams
          </span>
        </div>

        {/* Admin panel button — only visible to verified admin */}
        {isAdmin && adminToken && (
          <div className="flex justify-end">
            <button
              onClick={() => setAdminOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e82024]/10 border border-[#e82024]/30 text-[#e82024] text-xs font-bold uppercase tracking-widest hover:bg-[#e82024]/20 transition-all shadow-[0_0_12px_rgba(232,32,36,0.1)]"
            >
              <ShieldCheck className="w-4 h-4" />
              Panel Admin
            </button>
          </div>
        )}

        <ProjectCard />

        {isReady && (
          <>
            <VoteSection username={userState.username!} />
            <CommentSection username={userState.username!} adminToken={adminToken} />
          </>
        )}
      </main>

      <footer className="relative z-10 text-center py-8 border-t border-white/5">
        <p className="text-xs text-gray-600 font-mono tracking-widest">
          © 2026 DNX Teams · Workly Game Core
        </p>
      </footer>
    </div>
  );
}
