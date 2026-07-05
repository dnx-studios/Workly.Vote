import { useState } from 'react';
import { useListComments, useCreateComment, getListCommentsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommentSection({ username }: { username: string }) {
  const queryClient = useQueryClient();
  const { data: comments } = useListComments({ query: { queryKey: getListCommentsQueryKey(), refetchInterval: 30000 } });
  const createComment = useCreateComment();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 500) return;
    createComment.mutate(
      { data: { username, content: content.trim() } },
      {
        onSuccess: () => {
          setContent('');
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="px-7 py-5 border-b border-white/8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#e82024]" />
          <h3 className="text-lg font-black font-serif tracking-wider text-white">Transmisiones</h3>
        </div>
        <span className="text-xs font-mono bg-white/5 border border-white/8 text-gray-400 px-3 py-1.5 rounded-full">
          {comments?.length || 0} mensajes
        </span>
      </div>

      {/* Compose */}
      <div className="px-7 pt-6 pb-4 border-b border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <label htmlFor="comment-input" className="sr-only">Escribe un mensaje para la comunidad</label>
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
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-2">{content.length}/500 caracteres</p>
      </div>

      {/* Comment list */}
      <div className="divide-y divide-white/5 max-h-[560px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 px-7 py-5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Avatar */}
                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e82024] to-purple-700 flex items-center justify-center text-white font-bold text-xs uppercase shadow-[0_0_10px_rgba(232,32,36,0.2)]">
                  {comment.username.substring(0, 2)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="font-bold text-sm text-white truncate">{comment.username}</span>
                    <span className="text-[10px] text-gray-600 font-mono shrink-0">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-14 text-center">
              <p className="text-gray-600 text-sm font-serif italic">Aún no hay mensajes. Sé el primero en hablar.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
