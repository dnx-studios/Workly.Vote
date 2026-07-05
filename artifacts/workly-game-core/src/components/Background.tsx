import { useMemo } from 'react';

interface Particle {
  size: number;
  left: string;
  top: string;
  opacity: number;
  duration: string;
  delay: string;
  color: 'red' | 'white';
}

// Stable particle configs computed once — not during render
function makeParticles(): Particle[] {
  const redPositions = [
    [5, 10], [11.5, 47], [18, 22], [24.5, 59], [31, 14],
    [37.5, 72], [44, 30], [50.5, 55], [57, 18], [63.5, 68],
    [70, 38], [76.5, 15], [83, 63], [89.5, 42],
  ];
  const whitePositions = [
    [15, 30], [25, 83], [35, 55], [45, 72], [55, 40],
    [65, 65], [75, 35], [85, 58],
  ];

  const red: Particle[] = redPositions.map(([left, top], i) => ({
    size: 1.5 + (i % 3) * 0.8,
    left: `${left}%`,
    top: `${top}%`,
    opacity: 0.15 + (i % 4) * 0.07,
    duration: `${6 + (i % 5) * 2}s`,
    delay: `${(i * 0.7) % 5}s`,
    color: 'red',
  }));

  const white: Particle[] = whitePositions.map(([left, top], i) => ({
    size: 1.2 + (i % 2) * 0.6,
    left: `${left}%`,
    top: `${top}%`,
    opacity: 0.06 + (i % 3) * 0.04,
    duration: `${8 + (i % 4) * 2}s`,
    delay: `${(i * 1.2) % 6}s`,
    color: 'white',
  }));

  return [...red, ...white];
}

const PARTICLES = makeParticles();

export function Background() {
  // useMemo is a safeguard — PARTICLES is a module-level constant so the
  // array reference is already stable; this just makes the intent explicit.
  const particles = useMemo(() => PARTICLES, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#080b14] overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Main red orb - floats slowly */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#e82024] opacity-[0.12] blur-[140px] rounded-full animate-orb-1" />

      {/* Secondary accent orb - bottom right */}
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[400px] bg-[#6b21a8] opacity-[0.08] blur-[120px] rounded-full animate-orb-2" />

      {/* Small accent orb - top left */}
      <div className="absolute top-[20%] left-[-5%] w-[400px] h-[300px] bg-[#1e3a8a] opacity-[0.10] blur-[100px] rounded-full animate-orb-3" />

      {/* Floating particles — stable config, no re-render jitter */}
      <div className="absolute inset-0" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              backgroundColor: p.color === 'red' ? '#e82024' : '#ffffff',
              animation: `particle-float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#080b14_100%)]" />
    </div>
  );
}
