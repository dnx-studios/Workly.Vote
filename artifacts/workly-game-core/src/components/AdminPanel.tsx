import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ThumbsUp, ThumbsDown, Users, Activity } from 'lucide-react';
import { useAdminListVotes, getAdminListVotesQueryKey } from '@workspace/api-client-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  /** HMAC-signed token from POST /admin/session — never forged client-side */
  adminToken: string;
}

function maskIp(ip: string): string {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return `${ip.substring(0, 8)}…`;
}

export function AdminPanel({ open, onClose, adminToken }: AdminPanelProps) {
  const { data: votes, isLoading } = useAdminListVotes({
    query: {
      queryKey: getAdminListVotesQueryKey(),
      enabled: open,
      refetchInterval: open ? 15000 : false,
    },
    request: {
      headers: { 'x-admin-token': adminToken },
    },
  });

  const upvotes = votes?.filter((v) => v.voteType === 'up').length ?? 0;
  const downvotes = votes?.filter((v) => v.voteType === 'down').length ?? 0;

  // Aggregate votes by username
  const byUser: Record<string, { up: number; down: number; lastAt: string }> = {};
  votes?.forEach((v) => {
    if (!byUser[v.username]) byUser[v.username] = { up: 0, down: 0, lastAt: v.createdAt };
    if (v.voteType === 'up') byUser[v.username].up++;
    else byUser[v.username].down++;
    if (v.createdAt > byUser[v.username].lastAt) byUser[v.username].lastAt = v.createdAt;
  });
  const userList = Object.entries(byUser).sort(
    (a, b) => b[1].up + b[1].down - (a[1].up + a[1].down)
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-4 pb-4 sm:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full max-w-2xl bg-[#080b14] border border-[#e82024]/20 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#e82024]/5 shrink-0">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#e82024]" />
                <h2 className="font-black font-serif text-lg text-white tracking-wider">
                  Panel de Administración
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar panel"
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/8 border-b border-white/8 shrink-0">
              <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black text-white font-serif">{votes?.length ?? '—'}</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">A favor</p>
                <p className="text-2xl font-black text-emerald-400 font-serif">{upvotes}</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">En contra</p>
                <p className="text-2xl font-black text-[#e82024] font-serif">{downvotes}</p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {isLoading ? (
                <div className="py-16 text-center text-gray-600 text-sm">Cargando datos…</div>
              ) : (
                <>
                  {/* By user */}
                  <div className="px-6 pt-5 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-gray-500" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Votos por usuario
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {userList.length === 0 && (
                        <p className="text-sm text-gray-600 italic">Sin votos aún.</p>
                      )}
                      {userList.map(([user, data]) => (
                        <div
                          key={user}
                          className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#e82024]/60 to-purple-700/60 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {user.substring(0, 2)}
                          </div>
                          <span className="font-bold text-sm text-white flex-1 truncate">{user}</span>
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ThumbsUp className="w-3 h-3" aria-hidden /> {data.up}
                            </span>
                            <span className="flex items-center gap-1 text-[#e82024]">
                              <ThumbsDown className="w-3 h-3" aria-hidden /> {data.down}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-600 hidden sm:block shrink-0">
                            {formatDistanceToNow(new Date(data.lastAt), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full log */}
                  <div className="px-6 pt-5 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Registro completo
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {!votes?.length && (
                        <p className="text-sm text-gray-600 italic">Sin votos aún.</p>
                      )}
                      {votes?.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-3 text-xs px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                        >
                          <span
                            className={`shrink-0 font-bold ${v.voteType === 'up' ? 'text-emerald-400' : 'text-[#e82024]'}`}
                          >
                            {v.voteType === 'up' ? '▲' : '▼'}
                          </span>
                          <span className="text-gray-300 font-medium truncate flex-1">{v.username}</span>
                          <span className="text-gray-600 font-mono hidden sm:block">{maskIp(v.ipAddress)}</span>
                          <span className="text-gray-600 shrink-0">
                            {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
