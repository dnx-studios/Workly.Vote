import logoImg from '@assets/14_sin_título_20260705030524_1783245679681.png';
import { UserCircle2 } from 'lucide-react';

export function Header({ username }: { username: string | null }) {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <img src={logoImg} alt="Workly Game Core" className="h-10 object-contain drop-shadow-[0_0_10px_rgba(232,32,36,0.5)]" />
      </div>
      {username && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full py-2 px-5 backdrop-blur-sm">
          <UserCircle2 className="w-5 h-5 text-[#e82024]" />
          <span className="text-sm font-medium tracking-wide text-gray-200 hidden sm:inline">
            Jugando como: <span className="text-white font-bold ml-1">{username}</span>
          </span>
          <span className="text-sm font-medium tracking-wide text-white font-bold sm:hidden">
            {username}
          </span>
        </div>
      )}
    </header>
  );
}
