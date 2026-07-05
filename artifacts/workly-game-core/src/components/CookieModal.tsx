import { motion, AnimatePresence } from 'framer-motion';

export function CookieModal({ open, onAccept }: { open: boolean, onAccept: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#0a0e1a]/90 border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e82024] to-transparent opacity-50" />
            <h2 className="text-2xl font-bold font-serif mb-4 tracking-wider text-white">Aviso de Cookies</h2>
            <p className="text-gray-300 mb-8 text-sm leading-relaxed">
              Workly Game Core utiliza cookies para mejorar tu experiencia. Si rechazas, la página se cerrará.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Attempt to close the tab; if blocked (tab not opened by script),
                  // replace location with a blank rejection page so the user cannot
                  // interact with the site.
                  try {
                    window.close();
                  } finally {
                    // Fallback: replace page content immediately
                    document.body.innerHTML =
                      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#666;font-family:sans-serif;text-align:center;"><div><p style="font-size:1.2rem">Has rechazado las cookies.</p><p style="font-size:0.9rem;margin-top:0.5rem">Puedes cerrar esta ventana.</p></div></div>';
                  }
                }}
                className="flex-1 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white font-medium border border-white/10"
              >
                Rechazar
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 px-4 rounded-lg bg-[#e82024]/20 hover:bg-[#e82024]/40 border border-[#e82024]/50 transition-all text-[#e82024] hover:text-white font-medium shadow-[0_0_15px_rgba(232,32,36,0.2)] hover:shadow-[0_0_25px_rgba(232,32,36,0.4)]"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
