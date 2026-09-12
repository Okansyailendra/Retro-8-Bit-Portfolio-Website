import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import PixelBox from './PixelBox';

const STATS = [
  { label: 'STR', name: 'Problem Solving', val: 88, color: '#ff6ec7' },
  { label: 'INT', name: 'Architecture',    val: 92, color: '#ffd700' },
  { label: 'DEF', name: 'Debugging',       val: 79, color: '#39ff14' },
  { label: 'AGI', name: 'Learning Speed',  val: 95, color: '#00e5ff' },
  { label: 'LCK', name: 'Deadlines',       val: 72, color: '#ff6ec7' },
];

function StatBar({ label, name, val, color, delay }: typeof STATS[0] & { delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  return (
    <div ref={ref} className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-[7px] sm:text-[9px]" style={{ color }}>
          {label}
        </span>
        <span className="font-vt text-base sm:text-lg" style={{ color, opacity: 0.8 }}>
          {name}
        </span>
        <span className="font-pixel text-[7px] sm:text-[9px] text-gold">{val}/100</span>
      </div>
      <div className="h-3 sm:h-4 w-full" style={{ background: '#0a0a1a', border: '2px solid #2a2a6e' }}>
        <div
          className="h-full"
          style={{
            width: inView ? `${val}%` : '0%',
            background: color,
            transition: inView ? `width 1.2s ${delay}s cubic-bezier(0.4,0,0.2,1)` : 'none',
            boxShadow: `0 0 8px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg viewBox="0 0 10 9" width={18} height={18} style={{ imageRendering: 'pixelated' }}>
      <rect x="1" y="1" width="3" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="6" y="1" width="3" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="0" y="2" width="4" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="5" y="2" width="4" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="0" y="3" width="9" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="0" y="4" width="9" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="1" y="5" width="8" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="2" y="6" width="7" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="3" y="7" width="5" height="1" fill={filled ? color : '#2a2a6e'} />
      <rect x="4" y="8" width="3" height="1" fill={filled ? color : '#2a2a6e'} />
    </svg>
  );
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const xpPercent = 72;
  const xpRef = useRef<HTMLDivElement>(null);
  const xpInView = useInView(xpRef, { once: true });

  return (
    <section className="min-h-screen bg-bg py-16 px-4 pt-20 flex flex-col items-center justify-center">
      <div className="pixel-divider w-full mb-10" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        ref={ref}
        className="text-center mb-10"
      >
        <div className="font-pixel text-xs sm:text-sm text-pink glow-pink mb-2">
          ▶ CHARACTER SELECT ◀
        </div>
        <h2 className="font-pixel text-gold text-lg sm:text-2xl glow-gold">
          ABOUT ME
        </h2>
      </motion.div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Character card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h-full flex flex-col"
        >
          <PixelBox color="#ff6ec7" glow className="p-5 h-full flex flex-col justify-between">
            <div>
              {/* Card header */}
              <div className="font-pixel text-pink text-[9px] mb-4 glow-pink tracking-widest border-b-2 border-pink pb-2">
                PLAYER CARD
              </div>

              <div className="flex gap-6 items-start mb-5">
                {/* Sprite */}
                <div className="flex-shrink-0 float">
                  <PixelBox color="#ffd700" bg="#0a0a1a" className="p-2">
                    <img src="/foto.webp" alt="Profile" className="w-[180px] h-[240px] sm:w-[220px] sm:h-[293px] object-cover object-[center_15%]" />
                  </PixelBox>
                </div>

                {/* Info */}
                <div className="font-vt text-lg sm:text-xl space-y-1.5 flex-1 mt-2">
                  <div><span className="text-gold font-pixel text-[8px]">NAME</span><br />
                    <span className="text-cyan text-xl">Okan Syailendra Wahyudi</span></div>
                  <div><span className="text-gold font-pixel text-[8px]">CLASS</span><br />
                    <span className="text-pink text-xl">Web Developer</span></div>
                  <div><span className="text-gold font-pixel text-[8px]">LEVEL</span><br />
                    <span className="text-neon text-xl glow-neon">LVL 15 ★★★★★</span></div>
                  <div><span className="text-gold font-pixel text-[8px]">ORIGIN</span><br />
                    <span className="text-gold text-xl">Indonesia</span></div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {/* HP row */}
              <div className="mb-2">
                <div className="flex justify-between font-pixel text-[7px] mb-1">
                  <span className="text-neon">HP</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <HeartIcon key={i} filled={i < 4} color="#39ff14" />)}
                  </div>
                  <span className="text-neon">850/1000</span>
                </div>
                <div className="h-3" style={{ background: '#0a0a1a', border: '2px solid #2a2a6e' }}>
                  <div className="h-full bg-neon" style={{ width: '85%', boxShadow: '0 0 8px #39ff14' }} />
                </div>
              </div>

              {/* MP row */}
              <div className="mb-4">
                <div className="flex justify-between font-pixel text-[7px] mb-1">
                  <span className="text-cyan">MP</span>
                  <span className="text-cyan">420/600</span>
                </div>
                <div className="h-3" style={{ background: '#0a0a1a', border: '2px solid #2a2a6e' }}>
                  <div className="h-full bg-cyan" style={{ width: '70%', boxShadow: '0 0 8px #00e5ff' }} />
                </div>
              </div>

              {/* EXP */}
              <div ref={xpRef}>
                <div className="flex justify-between font-pixel text-[7px] mb-1">
                  <span className="text-gold">EXP</span>
                  <span className="text-gold">7200/10000</span>
                </div>
                <div className="h-3" style={{ background: '#0a0a1a', border: '2px solid #2a2a6e' }}>
                  <div
                    className="h-full bg-gold"
                    style={{
                      width: xpInView ? `${xpPercent}%` : '0%',
                      transition: xpInView ? 'width 1.5s 0.3s ease-out' : 'none',
                      boxShadow: '0 0 8px #ffd700',
                    }}
                  />
                </div>
              </div>
            </div>
          </PixelBox>
        </motion.div>

        {/* Right: Stats */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PixelBox color="#ffd700" glow className="p-5 h-full">
            <div className="font-pixel text-gold text-[9px] mb-4 glow-gold tracking-widest border-b-2 border-gold pb-2">
              BASE STATS
            </div>
            {STATS.map((s, i) => (
              <StatBar key={s.label} {...s} delay={0.1 * i} />
            ))}

            <div className="mt-5 border-t-2 border-border pt-4">
              <div className="font-pixel text-cyan text-[8px] mb-3 glow-cyan">BACKSTORY:</div>
              <p className="font-vt text-gold text-lg leading-snug" style={{ opacity: 0.85 }}>
                A passionate developer who discovered HTML at age 19 and never looked back.
                Now on a quest to build legendary web apps that users actually love.
                Specializes in React spells, TypeScript enchantments, and pixel-perfect UIs.
              </p>
              <div className="mt-3 font-vt text-neon text-base glow-neon">
                &gt; Active quests: 3<br />
                &gt; Bugs slain: 1,337<br />
                &gt; Coffee consumed: ∞
              </div>
            </div>
          </PixelBox>
        </motion.div>
      </div>
      <div className="pixel-divider w-full mt-10" />
    </section>
  );
}
