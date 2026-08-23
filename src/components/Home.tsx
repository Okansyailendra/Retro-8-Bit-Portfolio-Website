import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

function useTypewriter(text: string, speed = 80, startDelay = 600) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplay('');
    setDone(false);
    let idx = 0;
    const tid = setTimeout(() => {
      const iid = setInterval(() => {
        idx++;
        setDisplay(text.slice(0, idx));
        if (idx >= text.length) { clearInterval(iid); setDone(true); }
      }, speed);
      return () => clearInterval(iid);
    }, startDelay);
    return () => clearTimeout(tid);
  }, [text, speed, startDelay]);
  return { display, done };
}

const Star = memo(({ x, y, size, dur, delay, color }: {
  x: number; y: number; size: number; dur: number; delay: number; color: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: color,
      animation: `twinkle ${dur}s ${delay}s ease-in-out infinite`,
      willChange: 'opacity, transform',
    }}
  />
));

const PIXEL_CHARS = ['◆','★','●','▲','◉'] as const;

export default function Home({ scrollToNext }: { scrollToNext: () => void }) {
  const stars = useMemo(() =>
    Array.from({ length: 110 }, (_, i) => ({
      id: i,
      x: (i * 37.3 + 7) % 100,
      y: (i * 61.7 + 13) % 100,
      size: i % 5 === 0 ? 3 : 2,
      dur: 1.5 + (i % 7) * 0.4,
      delay: (i % 11) * 0.3,
      color: i % 7 === 0 ? '#00e5ff' : i % 5 === 0 ? '#ff6ec7' : '#ffd700',
    })),
    []
  );

  const floatingPixels = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 5 + (i * 8.5) % 90,
      y: 10 + (i * 13.7) % 75,
      char: PIXEL_CHARS[i % PIXEL_CHARS.length],
      color: ['#ffd700','#39ff14','#ff6ec7','#00e5ff'][i % 4],
      dur: 2.5 + (i % 5) * 0.6,
    })),
    []
  );

  const { display: nameText, done: nameDone } = useTypewriter('YOUR.NAME', 110, 800);
  const { display: roleText } = useTypewriter('FULL STACK DEVELOPER', 60, 2200);

  const [showStart, setShowStart] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowStart(true), 3800); return () => clearTimeout(t); }, []);

  return (
    <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center overflow-hidden pt-14">
      {/* Stars */}
      {stars.map(s => <Star key={s.id} {...s} />)}

      {/* Floating pixel decorations */}
      {floatingPixels.map(p => (
        <div
          key={p.id}
          className="absolute font-pixel text-sm select-none pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            opacity: 0.35,
            animation: `float-y ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.id * 0.2}s`,
          }}
        >
          {p.char}
        </div>
      ))}

      {/* Score bar (top HUD) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-16 left-0 right-0 flex justify-between px-6 sm:px-12 font-pixel"
      >
        <div className="text-center">
          <div className="text-gold text-[7px] sm:text-[9px]">1UP</div>
          <div className="text-gold text-[8px] sm:text-[10px]">000200</div>
        </div>
        <div className="text-center">
          <div className="text-pink text-[7px] sm:text-[9px] glow-pink">HI-SCORE</div>
          <div className="text-pink text-[8px] sm:text-[10px]">050000</div>
        </div>
        <div className="text-center">
          <div className="text-gold text-[7px] sm:text-[9px]">2UP</div>
          <div className="text-gold text-[8px] sm:text-[10px]">000000</div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 text-center px-4 max-w-3xl"
      >
        {/* INSERT COIN */}
        <p className="font-pixel text-pink text-[9px] sm:text-xs mb-6 blink glow-pink tracking-widest">
          ★ INSERT COIN TO PLAY ★
        </p>

        {/* Title */}
        <h1
          className="font-pixel text-gold text-2xl sm:text-4xl md:text-5xl mb-3 glitch-text glow-gold"
          style={{ letterSpacing: '0.05em', lineHeight: 1.4 }}
        >
          {nameText}
          {!nameDone && <span className="blink">_</span>}
        </h1>

        {/* Role typewriter */}
        <div
          className="font-pixel text-cyan text-[10px] sm:text-sm md:text-base mb-3 glow-cyan"
          style={{ letterSpacing: '0.1em' }}
        >
          &gt;&nbsp;{roleText}
          <span className="blink ml-1 text-gold">▮</span>
        </div>

        {/* Flavor text */}
        <p
          className="font-vt text-gold text-xl sm:text-2xl mb-10 mt-3"
          style={{ opacity: 0.55, letterSpacing: '0.05em' }}
        >
          // Crafting legendary web experiences since 2019 //
        </p>

        {/* PRESS START */}
        {showStart && (
          <motion.button
            onClick={scrollToNext}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.04 }}
            className="pixel-btn font-pixel text-neon text-[9px] sm:text-xs px-5 sm:px-8 py-3 sm:py-4 glow-neon"
          >
            &gt;&gt; PRESS START &lt;&lt;
          </motion.button>
        )}
      </motion.div>

      {/* Bottom HUD */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 sm:px-12 font-pixel text-gold text-[7px] sm:text-[9px] opacity-50">
        <span>STAGE 1-1</span>
        <span className="blink">▼ SCROLL ▼</span>
        <span>LEVEL 99</span>
      </div>

      {/* Ground pixels */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold opacity-30" />
    </div>
  );
}
