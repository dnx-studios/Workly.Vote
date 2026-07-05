import { useState, useEffect } from 'react';
import { Background } from '@/components/Background';
import { CookieModal } from '@/components/CookieModal';
import { UsernameModal } from '@/components/UsernameModal';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { VoteSection } from '@/components/VoteSection';
import { CommentSection } from '@/components/CommentSection';

export default function Home() {
  const [cookieState, setCookieState] = useState<'checking' | 'accepted' | 'pending'>('checking');
  const [userState, setUserState] = useState<{ status: 'checking' | 'set' | 'pending', username: string | null }>({ status: 'checking', username: null });

  useEffect(() => {
    const accepted = localStorage.getItem('workly_cookies_accepted');
    setCookieState(accepted === 'true' ? 'accepted' : 'pending');

    const savedUsername = localStorage.getItem('workly_username');
    setUserState(savedUsername
      ? { status: 'set', username: savedUsername }
      : { status: 'pending', username: null }
    );
  }, []);

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

  return (
    <div className="min-h-[100dvh] w-full text-white selection:bg-[#e82024]/30 selection:text-white">
      <Background />
      <CookieModal open={showCookieModal} onAccept={handleAcceptCookies} />
      <UsernameModal open={showUserModal} onComplete={handleSetUsername} />
      <Header username={userState.username} />

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16 relative z-10 flex flex-col gap-5">
        {/* Tag */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-gray-400 shadow-xl shadow-black/40">
            <span className="text-[#e82024]">●</span>
            Workly Game Core · DNX Teams
          </span>
        </div>

        {/* Cards */}
        <ProjectCard />

        {isReady && (
          <>
            <VoteSection username={userState.username!} />
            <CommentSection username={userState.username!} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5">
        <p className="text-xs text-gray-600 font-mono tracking-widest">
          © 2026 DNX Teams · Workly Game Core
        </p>
      </footer>
    </div>
  );
}
