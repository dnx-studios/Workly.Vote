import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateUser } from '@workspace/api-client-react';
import { AlertCircle } from 'lucide-react';

export function UsernameModal({ open, onComplete }: { open: boolean, onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const createUser = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2 || name.length > 30) {
      setError('El nombre debe tener entre 2 y 30 caracteres.');
      return;
    }
    createUser.mutate(
      { data: { username: name } },
      {
        onSuccess: () => {
          onComplete(name);
        },
        onError: (err: any) => {
          setError(err.error || 'Error al guardar el nombre.');
        }
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
            className="w-full max-w-md bg-[#0a0e1a]/90 border border-[#e82024]/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(232,32,36,0.1)] relative"
          >
            <h2 className="text-3xl font-bold font-serif mb-3 tracking-wide text-white">Identifícate</h2>
            <p className="text-[#e82024] text-sm mb-6 flex items-start gap-2 bg-[#e82024]/10 p-3 rounded-lg border border-[#e82024]/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>⚠️ Este nombre de usuario no podrá cambiarse</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre de jugador"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#e82024] focus:ring-1 focus:ring-[#e82024] transition-all"
                />
                {error && <p className="text-[#e82024] text-sm mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={createUser.isPending}
                className="w-full py-4 rounded-lg bg-[#e82024] hover:bg-[#ff2a2e] text-white font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(232,32,36,0.3)] hover:shadow-[0_0_30px_rgba(232,32,36,0.5)] uppercase"
              >
                {createUser.isPending ? 'Conectando...' : 'Entrar al Núcleo'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
