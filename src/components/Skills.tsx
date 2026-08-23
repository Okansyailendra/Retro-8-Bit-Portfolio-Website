import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import PixelBox from './PixelBox';

const SKILL_CATEGORIES = [
  {
    name: 'FRONTEND SPELLS',
    color: '#39ff14',
    icon: '⚔',
    skills: [
      { name: 'React',       icon: '⚛',  level: 92 },
      { name: 'TypeScript',  icon: 'TS', level: 88 },
      { name: 'Next.js',     icon: 'N',  level: 82 },
      { name: 'HTML/CSS',    icon: '<>', level: 96 },
      { name: 'Tailwind',    icon: '◈',  level: 90 },
      { name: 'Framer M.',   icon: '◎',  level: 76 },
    ],
  },
  {
    name: 'BACKEND MAGIC',
    color: '#ffd700',
    icon: '🏺',
    skills: [
      { name: 'Node.js',     icon: '⬡',  level: 78 },
      { name: 'Python',      icon: '∾',  level: 72 },
      { name: 'PostgreSQL',  icon: '♁',  level: 74 },
      { name: 'REST APIs',   icon: '⇌',  level: 85 },
      { name: 'GraphQL',     icon: '◈',  level: 68 },
      { name: 'Supabase',    icon: '◉',  level: 80 },
    ],
  },
  {
    name: 'TOOLS & POTIONS',
    color: '#ff6ec7',
    icon: '⚗',
    skills: [
      { name: 'Git',         icon: '⎇',  level: 92 },
      { name: 'Docker',      icon: '◱',  level: 68 },
      { name: 'Figma',       icon: '◫',  level: 78 },
      { name: 'VS Code',     icon: '◈',  level: 98 },
      { name: 'Vercel',      icon: '▲',  level: 84 },
      { name: 'Linux',       icon: '◈',  level: 74 },
    ],
  },
];

function SkillItem({ name, icon, level, color, delay }: {
  name: string; icon: string; level: number; color: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const getGrade = (l: number) => l >= 90 ? 'S' : l >= 80 ? 'A' : l >= 70 ? 'B' : 'C';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      <PixelBox color={`${color}60`} bg="#0a0a1a" className="p-2.5 hover:scale-[1.02] transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 font-pixel text-[8px]"
            style={{ background: color, color: '#0f0f23', boxShadow: `2px 2px 0 0 ${color}66` }}
          >
            {icon.length > 2 ? icon.slice(0, 2) : icon}
          </div>
          <span className="font-pixel text-[7px] sm:text-[8px] text-gold flex-1 truncate">{name}</span>
          <span
            className="font-pixel text-[8px] w-5 h-5 flex items-center justify-center flex-shrink-0"
            style={{ color, background: `${color}22`, border: `1px solid ${color}` }}
          >
            {getGrade(level)}
          </span>
        </div>
        <div className="h-2" style={{ background: '#1a1a3e', border: `1px solid ${color}44` }}>
          <div
            style={{
              height: '100%',
              width: inView ? `${level}%` : '0%',
              background: color,
              transition: inView ? `width 1s ${delay + 0.1}s ease-out` : 'none',
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        </div>
        <div className="font-vt text-sm mt-0.5 text-right" style={{ color, opacity: 0.7 }}>
          {level}%
        </div>
      </PixelBox>
    </motion.div>
  );
}

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section className="min-h-screen bg-bg py-16 px-4 pt-20 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="font-pixel text-xs sm:text-sm text-neon glow-neon mb-2">
            ▶ ITEM INVENTORY ◀
          </div>
          <h2 className="font-pixel text-gold text-lg sm:text-2xl glow-gold mb-3">
            SKILLS
          </h2>
          <div className="font-vt text-xl text-gold opacity-60">
            Equipped abilities and power levels
          </div>
        </motion.div>

        {/* Inventory header bar */}
        <div
          className="flex justify-between items-center px-4 py-2 mb-6 font-pixel text-[8px] text-bg"
          style={{ background: '#ffd700' }}
        >
          <span>INVENTORY — 18 ITEMS</span>
          <span>SORT: BY LEVEL</span>
          <span>WEIGHT: ∞/∞</span>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {SKILL_CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: ci % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: ci * 0.15 }}
            >
              {/* Category header */}
              <div
                className="flex items-center gap-2 px-3 py-2 mb-4 font-pixel text-[9px] text-bg"
                style={{ background: cat.color, boxShadow: `4px 4px 0 0 ${cat.color}66` }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="ml-auto opacity-70">[{cat.skills.length} ITEMS]</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cat.skills.map((skill, si) => (
                  <SkillItem
                    key={skill.name}
                    {...skill}
                    color={cat.color}
                    delay={si * 0.06}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer bar */}
        <div className="mt-8 font-pixel text-[7px] text-gold opacity-50 flex justify-between">
          <span>PRESS [A] TO USE ITEM</span>
          <span>PRESS [B] TO DROP</span>
        </div>
      </div>
    </section>
  );
}
