import { useEffect, useState } from 'react';
import { useCastVote, useGetVoteStats, useGetVoteStatus, getGetVoteStatsQueryKey, getGetVoteStatusQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function VoteSection({ username }: { username: string }) {
  const queryClient = useQueryClient();
  const { data: stats } = useGetVoteStats({ query: { queryKey: getGetVoteStatsQueryKey(), refetchInterval: 10000 } });
  const { data: status } = useGetVoteStatus({ query: { queryKey: getGetVoteStatusQueryKey(), refetchInterval: 10000 } });
  const castVote = useCastVote();
  const [localRemaining, setLocalRemaining] = useState(0);

  useEffect(() => {
    if (status && !status.canVote && status.secondsRemaining > 0) {
      setLocalRemaining(status.secondsRemaining);
      const interval = setInterval(() => {
        setLocalRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            queryClient.invalidateQueries({ queryKey: getGetVoteStatusQueryKey() });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLocalRemaining(0);
      return undefined;
    }
  }, [status, queryClient]);

  const handleVote = (type: 'up' | 'down') => {
    if (!status?.canVote) return;
    castVote.mutate({ data: { type, username } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetVoteStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVoteStatusQueryKey() });
      }
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const total = stats?.total || 0;
  const up = stats?.upvotes || 0;
  const down = stats?.downvotes || 0;
  const percentage = stats?.percentage || 0;
  const canVote = status?.canVote ?? true;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="px-7 py-5 border-b border-white/8 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black font-serif tracking-wider text-white">Vota por el proyecto</h3>
          <p className="text-xs text-gray-500 mt-0.5">Una vez por hora · tu voto cambia el resultado</p>
        </div>
        <span className="text-xs font-mono bg-white/5 border border-white/8 text-gray-400 px-3 py-1.5 rounded-full">
          {total} votos
        </span>
      </div>

      {/* Vote buttons */}
      <div className="p-7 flex flex-col sm:flex-row items-center gap-5">
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Upvote */}
          <motion.button
            whileHover={canVote ? { scale: 1.03 } : {}}
            whileTap={canVote ? { scale: 0.97 } : {}}
            onClick={() => handleVote('up')}
            disabled={!canVote || castVote.isPending}
            className={`flex-1 sm:flex-none flex flex-col items-center justify-center gap-2 w-full sm:w-36 py-6 rounded-2xl border-2 transition-all duration-200 ${
              status?.lastVoteType === 'up'
                ? 'bg-emerald-500/15 border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                : 'bg-black/25 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/40'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className={`w-7 h-7 transition-colors ${status?.lastVoteType === 'up' ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="font-black font-serif text-xl text-white">{up}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">A favor</span>
          </motion.button>

          {/* Downvote */}
          <motion.button
            whileHover={canVote ? { scale: 1.03 } : {}}
            whileTap={canVote ? { scale: 0.97 } : {}}
            onClick={() => handleVote('down')}
            disabled={!canVote || castVote.isPending}
            className={`flex-1 sm:flex-none flex flex-col items-center justify-center gap-2 w-full sm:w-36 py-6 rounded-2xl border-2 transition-all duration-200 ${
              status?.lastVoteType === 'down'
                ? 'bg-[#e82024]/15 border-[#e82024]/70 shadow-[0_0_30px_rgba(232,32,36,0.2)]'
                : 'bg-black/25 border-white/10 hover:bg-[#e82024]/10 hover:border-[#e82024]/40'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className={`w-7 h-7 transition-colors ${status?.lastVoteType === 'down' ? 'text-[#e82024]' : 'text-gray-400'}`} />
            <span className="font-black font-serif text-xl text-white">{down}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">En contra</span>
          </motion.button>
        </div>

        {/* Stats bar */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Aprobación</span>
            <span className={`text-sm font-black font-mono ${percentage >= 50 ? 'text-emerald-400' : 'text-[#e82024]'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            />
          </div>

          {/* Cooldown */}
          {!canVote && localRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-xs text-gray-500"
            >
              <Clock className="w-3.5 h-3.5 text-[#e82024]" />
              <span>Próximo voto en</span>
              <span className="text-[#e82024] font-mono font-bold text-sm">{formatTime(localRemaining)}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
