import logoImg from '@assets/14_sin_título_20260705030524_1783245679681.png';
import { UserCircle2, ShieldCheck } from 'lucide-react';

const ADMIN_USERNAME = 'Dinox';

export function Header({ username }: { username: string | null }) {
  const isAdmin = username === ADMIN_USERNAME;

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-white/5 bg-black/25 backdrop-blur-md sticky top-0 z-40">
      {/* Logo — download-protected */}
      <div className="flex items-center gap-3 select-none">
        <img
          src={logoImg}
          alt="Workly Game Core"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className="h-14 md:h-16 object-contain drop-shadow-[0_0_14px_rgba(232,32,36,0.55)] pointer-events-none"
          style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
        />
      </div>

      {/* User badge */}
      {username && (
        <div className={`flex items-center gap-2.5 rounded-full py-2 px-4 backdrop-blur-sm border transition-all ${
          isAdmin
            ? 'bg-[#e82024]/10 border-[#e82024]/40 shadow-[0_0_16px_rgba(232,32,36,0.15)]'
            : 'bg-white/5 border-white/10'
        }`}>
          {isAdmin ? (
            <ShieldCheck className="w-4 h-4 text-[#e82024] shrink-0" />
          ) : (
            <UserCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-200 hidden sm:inline">
            {isAdmin ? 'Admin:' : 'Jugando como:'}{' '}
            <span className="font-bold text-white">{username}</span>
          </span>
          <span className="text-sm font-bold text-white sm:hidden">{username}</span>
          {isAdmin && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e82024] bg-[#e82024]/10 px-2 py-0.5 rounded-full border border-[#e82024]/20 hidden sm:inline">
              Admin
            </span>
          )}
        </div>
      )}
    </header>
  );
}
