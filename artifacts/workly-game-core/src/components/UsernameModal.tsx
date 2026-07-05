import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateUser } from '@workspace/api-client-react';
import { AlertCircle, LockKeyhole } from 'lucide-react';

export function UsernameModal({ open, onComplete }: { open: boolean; onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const createUser = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('El nombre debe tener entre 2 y 30 caracteres.');
      return;
    }
    setError('');
    createUser.mutate(
      { data: { username: trimmed } },
      {
        onSuccess: () => {
          onComplete(trimmed);
        },
        onError: (err: any) => {
          const msg =
            err?.data?.error ||
            err?.message ||
            'Error al registrar el nombre. Intenta de nuevo.';
          setError(msg);
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#0a0e1a]/95 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#e82024]/60 to-transparent" />

            <div className="flex items-center gap-3 mb-2">
              <LockKeyhole className="w-5 h-5 text-[#e82024]" />
              <h2 className="text-2xl font-bold font-serif tracking-wide text-white">Identifícate</h2>
            </div>

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Elige tu nombre de jugador. Solo letras, números, guiones y guiones bajos.
            </p>

            <div className="flex items-start gap-2 bg-[#e82024]/8 border border-[#e82024]/20 rounded-xl p-3 mb-6">
              <AlertCircle className="w-4 h-4 text-[#e82024] shrink-0 mt-0.5" />
              <p className="text-xs text-[#e82024]/80 leading-relaxed">
                Este nombre <strong>no podrá cambiarse</strong> una vez registrado. Elige bien.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Tu nombre de jugador"
                  maxLength={30}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#e82024]/60 focus:ring-1 focus:ring-[#e82024]/30 transition-all"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#e82024] text-xs mt-2 pl-1"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <button
                type="submit"
                disabled={createUser.isPending || name.trim().length < 2}
                className="w-full py-3.5 rounded-xl bg-[#e82024] hover:bg-[#ff2a2e] text-white font-bold tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(232,32,36,0.25)] hover:shadow-[0_0_30px_rgba(232,32,36,0.45)] uppercase text-sm"
              >
                {createUser.isPending ? 'Verificando...' : 'Entrar al Núcleo'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
