import { useState, useRef } from 'react';
import {
  useListComments, useCreateComment, useReactToComment,
  useAdminToggleStar, useAdminToggleHeart, useAdminDeleteComment,
  getListCommentsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Send, MessageSquare, ThumbsUp, ThumbsDown,
  Star, Heart, Trash2, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_USERNAME = 'Dinox';

interface StarTooltip { commentId: number; x: number; y: number }

interface Props {
  username: string;
  /** HMAC-signed admin token from server. Null = non-admin user. */
  adminToken: string | null;
}

export function CommentSection({ username, adminToken }: Props) {
  const queryClient = useQueryClient();
  const isAdmin = username === ADMIN_USERNAME && adminToken !== null;

  const adminHeaders = adminToken ? { headers: { 'x-admin-token': adminToken } } : undefined;

  const listParams = { username };
  const { data: comments } = useListComments(listParams, {
    query: { queryKey: getListCommentsQueryKey(listParams), refetchInterval: 30000 },
  });

  const createComment = useCreateComment();
  const reactToComment = useReactToComment();
  // Admin hooks use the signed token — unauthenticated requests are rejected server-side
  const toggleStar   = useAdminToggleStar({ request: adminHeaders });
  const toggleHeart  = useAdminToggleHeart({ request: adminHeaders });
  const deleteComment = useAdminDeleteComment({ request: adminHeaders });

  const [content, setContent] = useState('');
  const [starTooltip, setStarTooltip] = useState<StarTooltip | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 500) return;
    createComment.mutate(
      { data: { username, content: content.trim() } },
      { onSuccess: () => { setContent(''); invalidate(); } }
    );
  };

  const handleReact = (commentId: number, type: 'like' | 'dislike') => {
    reactToComment.mutate({ id: commentId, data: { username, type } }, { onSuccess: invalidate });
  };

  const handleStar = (commentId: number) => {
    if (!isAdmin) return;
    toggleStar.mutate({ id: commentId, data: { adminUsername: username } }, { onSuccess: invalidate });
  };

  const handleHeart = (commentId: number) => {
    if (!isAdmin) return;
    toggleHeart.mutate({ id: commentId, data: { adminUsername: username } }, { onSuccess: invalidate });
  };

  const handleDelete = (commentId: number) => {
    if (!isAdmin) return;
    if (!confirm('¿Eliminar este comentario?')) return;
    deleteComment.mutate({ id: commentId, data: { adminUsername: username } }, { onSuccess: invalidate });
  };

  const handleStarClick = (e: React.MouseEvent, commentId: number) => {
    if (isAdmin) { handleStar(commentId); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setStarTooltip({ commentId, x: rect.left, y: rect.bottom + 8 });
    setTimeout(() => setStarTooltip(null), 3000);
  };

  return (
    <div
      className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl"
      onClick={(e) => {
        if (starTooltip && tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
          setStarTooltip(null);
        }
      }}
    >
      {/* Header */}
      <div className="px-7 py-5 border-b border-white/8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#e82024]" />
          <h3 className="text-lg font-black font-serif tracking-wider text-white">Transmisiones</h3>
          {isAdmin && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e82024] bg-[#e82024]/10 px-2 py-0.5 rounded-full border border-[#e82024]/20">
              Vista Admin
            </span>
          )}
        </div>
        <span className="text-xs font-mono bg-white/5 border border-white/8 text-gray-400 px-3 py-1.5 rounded-full">
          {comments?.length || 0} mensajes
        </span>
      </div>

      {/* Compose */}
      <div className="px-7 pt-6 pb-4 border-b border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <label htmlFor="comment-input" className="sr-only">Escribe un mensaje</label>
          <textarea
            id="comment-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe un mensaje para la comunidad..."
            rows={2}
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e82024]/60 focus:ring-1 focus:ring-[#e82024]/40 resize-none transition-all leading-relaxed"
          />
          <button
            type="submit"
            aria-label="Enviar comentario"
            disabled={!content.trim() || createComment.isPending}
            className="shrink-0 p-3 bg-[#e82024] hover:bg-[#ff2a2e] text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(232,32,36,0.25)] hover:shadow-[0_0_18px_rgba(232,32,36,0.4)] mb-0.5"
          >
            <Send className="w-4 h-4" aria-hidden />
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-2" aria-live="polite">{content.length}/500 caracteres</p>
      </div>

      {/* Comment list */}
      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <motion.article
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-7 py-5 hover:bg-white/[0.015] transition-colors"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs uppercase select-none ${
                      comment.username === ADMIN_USERNAME
                        ? 'bg-gradient-to-tr from-[#e82024] to-orange-500 shadow-[0_0_10px_rgba(232,32,36,0.35)]'
                        : 'bg-gradient-to-tr from-[#e82024]/60 to-purple-700/60'
                    }`} aria-hidden>
                      {comment.username.substring(0, 2)}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-sm text-white truncate">{comment.username}</span>
                      {comment.username === ADMIN_USERNAME && (
                        <ShieldCheck
                          className="w-3.5 h-3.5 text-[#e82024] shrink-0"
                          aria-label="Administrador verificado"
                        />
                      )}
                    </div>
                  </div>
                  <time
                    dateTime={comment.createdAt}
                    className="text-[10px] text-gray-600 font-mono shrink-0"
                  >
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                  </time>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-3 pl-11">
                  {comment.content}
                </p>

                {/* Reaction row */}
                <div className="flex items-center justify-between gap-3 pl-11">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Like */}
                    <button
                      aria-label={`Me gusta — ${comment.likes} votos`}
                      aria-pressed={comment.userReaction === 'like'}
                      onClick={() => handleReact(comment.id, 'like')}
                      disabled={reactToComment.isPending}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        comment.userReaction === 'like'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/5 text-gray-500 border border-white/8 hover:text-emerald-400 hover:border-emerald-500/30'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" aria-hidden />
                      <span>{comment.likes}</span>
                    </button>

                    {/* Dislike */}
                    <button
                      aria-label={`No me gusta — ${comment.dislikes} votos`}
                      aria-pressed={comment.userReaction === 'dislike'}
                      onClick={() => handleReact(comment.id, 'dislike')}
                      disabled={reactToComment.isPending}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        comment.userReaction === 'dislike'
                          ? 'bg-[#e82024]/20 text-[#e82024] border border-[#e82024]/40'
                          : 'bg-white/5 text-gray-500 border border-white/8 hover:text-[#e82024] hover:border-[#e82024]/30'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" aria-hidden />
                      <span>{comment.dislikes}</span>
                    </button>

                    {/* Star — admin toggles, others see info popup */}
                    {(comment.hasStar || isAdmin) && (
                      <button
                        aria-label={isAdmin ? 'Marcar/desmarcar estrella del creador' : 'Ver información de la estrella'}
                        onClick={(e) => handleStarClick(e, comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          comment.hasStar
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                            : 'bg-white/5 text-gray-600 border-white/8 opacity-40'
                        } ${isAdmin ? 'hover:opacity-100' : ''}`}
                      >
                        <Star className="w-3 h-3" aria-hidden />
                      </button>
                    )}

                    {/* Heart — admin toggles, others see it as a badge */}
                    {(comment.hasHeart || isAdmin) && (
                      <button
                        aria-label={isAdmin ? 'Dar/quitar corazón' : 'El creador quiere este mensaje'}
                        onClick={() => isAdmin && handleHeart(comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          comment.hasHeart
                            ? 'bg-pink-500/15 text-pink-400 border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.15)]'
                            : 'bg-white/5 text-gray-600 border-white/8 opacity-40'
                        } ${isAdmin ? 'hover:opacity-100 cursor-pointer' : 'cursor-default'}`}
                      >
                        <Heart className="w-3 h-3" aria-hidden />
                      </button>
                    )}
                  </div>

                  {/* Admin delete */}
                  {isAdmin && (
                    <button
                      aria-label="Eliminar comentario"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleteComment.isPending}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-[#e82024] hover:bg-[#e82024]/10 border border-transparent hover:border-[#e82024]/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden />
                    </button>
                  )}
                </div>
              </motion.article>
            ))
          ) : (
            <div className="py-14 text-center">
              <p className="text-gray-600 text-sm font-serif italic">Aún no hay mensajes. Sé el primero en hablar.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Star info tooltip — appears on non-admin click */}
      <AnimatePresence>
        {starTooltip && (
          <motion.div
            ref={tooltipRef}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-[#0a0e1a] border border-amber-500/40 rounded-xl px-4 py-2.5 shadow-xl shadow-black/60 pointer-events-none"
            style={{
              left: Math.min(starTooltip.x, window.innerWidth - 260),
              top: starTooltip.y,
            }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden />
              <p className="text-xs text-amber-300 font-medium whitespace-nowrap">
                El creador apoya este mensaje
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
