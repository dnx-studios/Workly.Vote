const roles = [
  { icon: '🏗️', label: 'Builders' },
  { icon: '⚙️', label: 'Commanders' },
  { icon: '🎨', label: 'Modeladores 3D' },
  { icon: '🎥', label: 'Renderizadores' },
  { icon: '📦', label: 'Creadores de Addons' },
  { icon: '💻', label: 'Desarrolladores' },
  { icon: '✏️', label: 'Diseñadores' },
];

const modalities = [
  { icon: '💰', label: 'Trabajos remunerados' },
  { icon: '🤝', label: 'Colaboraciones gratuitas' },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/30 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
      <h4 className="text-white font-serif font-bold text-base uppercase tracking-widest flex items-center gap-2">
        <span className="w-3 h-0.5 bg-[#e82024] rounded-full" />
        {title}
      </h4>
      {children}
    </div>
  );
}

export function ProjectCard() {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Header strip */}
      <div className="px-8 pt-8 pb-6 border-b border-white/8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e82024]/10 border border-[#e82024]/25 text-[#e82024] text-xs font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e82024] animate-pulse" />
            En desarrollo
          </span>
          <span className="text-xs text-gray-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/8">
            DNX Teams · v1.0
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-white mb-3">
          Workly Craft
        </h1>
        <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
          Plataforma web para conectar talento creativo de Minecraft y videojuegos con personas y equipos que buscan colaboradores — pagados o voluntarios.
        </p>
      </div>

      {/* Body */}
      <div className="p-8 grid gap-5">
        {/* Quote */}
        <div className="border-l-2 border-[#e82024] pl-5 py-1">
          <p className="text-gray-200 text-base md:text-lg leading-relaxed italic">
            "Todos los profesionales comenzaron desde cero. Workly existe para dar esa primera oportunidad."
          </p>
        </div>

        {/* Two-column cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard title="¿Quiénes pueden unirse?">
            <ul className="grid grid-cols-1 gap-2">
              {roles.map(r => (
                <li key={r.label} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-base w-7 text-center">{r.icon}</span>
                  {r.label}
                </li>
              ))}
              <li className="text-xs text-gray-500 mt-1 pl-10 font-serif italic">Y muchas otras profesiones.</li>
            </ul>
          </SectionCard>

          <div className="flex flex-col gap-4">
            <SectionCard title="Modalidades">
              <ul className="grid grid-cols-1 gap-2">
                {modalities.map(m => (
                  <li key={m.label} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-base w-7 text-center">{m.icon}</span>
                    {m.label}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Nuestra visión">
              <p className="text-sm text-gray-400 leading-relaxed">
                Construir una comunidad donde el talento tenga más peso que la experiencia previa, fomentando el aprendizaje y el crecimiento colaborativo.
              </p>
            </SectionCard>
          </div>
        </div>

        {/* What makes it different */}
        <SectionCard title="¿Qué hace diferente a Workly?">
          <p className="text-sm text-gray-400 leading-relaxed">
            La mayoría de plataformas priorizan portafolios consolidados. Workly nace con una idea diferente:{' '}
            <span className="text-white font-semibold">dar oportunidades reales a quienes están empezando.</span>
          </p>
        </SectionCard>

        {/* Launch status */}
        <div className="flex items-center justify-between gap-4 bg-[#e82024]/5 border border-[#e82024]/15 rounded-2xl px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e82024] mb-1">Estado de lanzamiento</p>
            <p className="text-sm text-gray-400">Sin fecha oficial. Desarrollo activo — apoya el proyecto con tu voto.</p>
          </div>
          <span className="shrink-0 text-3xl">🚀</span>
        </div>
      </div>
    </div>
  );
}
