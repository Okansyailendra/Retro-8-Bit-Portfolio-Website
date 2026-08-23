import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import PixelBox from './PixelBox';

interface Project {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  tech: string[];
  stars: number;
  status: 'COMPLETE' | 'PLAYING' | 'LOCKED';
  color: string;
  bgPattern: string;
  demoUrl?: string;
  repoUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: 1, name: 'QUEST LOG', subtitle: 'Task Management App',
    description: 'A dungeon-themed task manager with real-time updates, team collaboration, and quest-style achievement systems. Syncs across devices instantly.',
    tech: ['React','Supabase','TypeScript','Tailwind'],
    stars: 3, status: 'COMPLETE', color: '#39ff14',
    bgPattern: '▓▓▒▒░░', demoUrl: '#', repoUrl: '#',
  },
  {
    id: 2, name: 'PIXEL SHOP', subtitle: 'E-Commerce Platform',
    description: 'Full-stack e-commerce with Next.js, Stripe payments, custom CMS, and 99% Lighthouse score. Handles 1000+ concurrent users effortlessly.',
    tech: ['Next.js','Stripe','PostgreSQL','Redis'],
    stars: 4, status: 'COMPLETE', color: '#ffd700',
    bgPattern: '█▓▒░▒▓█', demoUrl: '#', repoUrl: '#',
  },
  {
    id: 3, name: 'DRAGON WEATHER', subtitle: 'Weather Application',
    description: 'Animated weather app where dragons react to weather conditions. Pixel art animations driven by live weather data from 40k+ cities worldwide.',
    tech: ['React','Canvas','OpenWeather','Framer'],
    stars: 3, status: 'COMPLETE', color: '#ff6ec7',
    bgPattern: '░▒▓█▓▒░', demoUrl: '#', repoUrl: '#',
  },
  {
    id: 4, name: 'CODE DUNGEON', subtitle: 'GitHub Stats Visualizer',
    description: 'Render your GitHub commit history as an explorable dungeon map. Each streak is a room, each contribution a treasure chest.',
    tech: ['React','D3.js','GitHub GraphQL','SVG'],
    stars: 4, status: 'COMPLETE', color: '#00e5ff',
    bgPattern: '▒░▒░▒░▒', demoUrl: '#', repoUrl: '#',
  },
  {
    id: 5, name: 'BOSS BATTLE', subtitle: 'Multiplayer Browser Game',
    description: 'Real-time PvP browser game with Socket.io. 50+ concurrent lobbies, persistent leaderboards, power-ups, and spectator mode.',
    tech: ['React','Socket.io','Node.js','MongoDB'],
    stars: 5, status: 'COMPLETE', color: '#ff4444',
    bgPattern: '█░█░█░█', demoUrl: '#', repoUrl: '#',
  },
  {
    id: 6, name: 'FINAL FORM', subtitle: 'This Portfolio!',
    description: 'The legendary portfolio site you are currently exploring. Pixel art aesthetic, Space Invaders game, scanline effects, and 60fps animations throughout.',
    tech: ['React','Framer Motion','Canvas','Tailwind'],
    stars: 5, status: 'PLAYING', color: '#ffd700',
    bgPattern: '◆★◆★◆★', demoUrl: '#', repoUrl: '#',
  },
];

function StarRating({ count, max = 5, color }: { count: number; max?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <span key={i} className="font-pixel text-[10px]" style={{ color: i < count ? color : '#2a2a6e' }}>★</span>
      ))}
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="max-w-lg w-full"
        style={{ cursor: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <PixelBox color={project.color} glow className="p-5">
          {/* Modal header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-pixel text-xs sm:text-sm mb-1" style={{ color: project.color }}>
                STAGE {project.id.toString().padStart(2, '0')}
              </div>
              <h3 className="font-pixel text-gold text-base sm:text-lg glow-gold">{project.name}</h3>
              <div className="font-vt text-gold text-lg opacity-70 mt-1">{project.subtitle}</div>
            </div>
            <button
              onClick={onClose}
              className="pixel-btn font-pixel text-[9px] px-2 py-1 text-red"
            >✕ ESC</button>
          </div>

          {/* Stats panel */}
          <div
            className="p-3 mb-4 font-vt text-lg"
            style={{ background: '#0a0a1a', border: `2px solid ${project.color}44` }}
          >
            <div className="flex justify-between mb-2">
              <span style={{ color: project.color }}>RATING:</span>
              <StarRating count={project.stars} color={project.color} />
            </div>
            <div className="flex justify-between">
              <span style={{ color: project.color }}>STATUS:</span>
              <span
                className="font-pixel text-[8px]"
                style={{ color: project.status === 'PLAYING' ? '#39ff14' : project.color }}
              >
                {project.status === 'PLAYING' ? '▶ ' : ''}{project.status}
              </span>
            </div>
          </div>

          <p className="font-vt text-gold text-lg leading-relaxed mb-4 opacity-90">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="mb-5">
            <div className="font-pixel text-[8px] mb-2" style={{ color: project.color }}>TECH STACK:</div>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-pixel text-[7px] px-2 py-1"
                  style={{
                    color: project.color,
                    border: `2px solid ${project.color}`,
                    background: `${project.color}15`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={project.demoUrl}
              className="pixel-btn font-pixel text-[8px] px-3 py-2 flex-1 text-center"
              style={{ color: project.color }}
            >
              ▶ PLAY DEMO
            </a>
            <a
              href={project.repoUrl}
              className="pixel-btn font-pixel text-[8px] px-3 py-2 flex-1 text-center text-gold"
            >
              ◎ SOURCE CODE
            </a>
          </div>
        </PixelBox>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'none' }}
    >
      <PixelBox
        color={hovered ? project.color : '#2a2a6e'}
        glow={hovered}
        className="p-4 h-full transition-all duration-150"
        bg={hovered ? `${project.color}08` : '#0a0a1a'}
      >
        {/* Stage number */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-pixel text-[8px]" style={{ color: project.color }}>
            STAGE {project.id.toString().padStart(2, '0')}
          </span>
          <span
            className="font-pixel text-[7px] px-1.5 py-0.5"
            style={{
              color: project.status === 'PLAYING' ? '#0f0f23' : project.color,
              background: project.status === 'PLAYING' ? '#39ff14' : `${project.color}22`,
              border: `1px solid ${project.color}`,
            }}
          >
            {project.status === 'PLAYING' ? '▶ ACTIVE' : project.status}
          </span>
        </div>

        {/* BG pattern strip */}
        <div
          className="h-10 flex items-center justify-center mb-3 font-pixel text-base tracking-widest overflow-hidden"
          style={{
            background: `${project.color}15`,
            border: `2px solid ${project.color}33`,
            color: `${project.color}66`,
          }}
        >
          {project.bgPattern.repeat(6)}
        </div>

        <h3 className="font-pixel text-[10px] sm:text-xs text-gold mb-1">{project.name}</h3>
        <p className="font-vt text-lg text-gold opacity-60 mb-3">{project.subtitle}</p>

        <div className="flex justify-between items-center">
          <StarRating count={project.stars} color={project.color} />
          <span className="font-pixel text-[7px]" style={{ color: project.color }}>
            {hovered ? 'CLICK TO ENTER' : `${project.tech.length} TECHS`}
          </span>
        </div>
      </PixelBox>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
          <div className="font-pixel text-xs sm:text-sm text-pink glow-pink mb-2">
            ▶ STAGE SELECT ◀
          </div>
          <h2 className="font-pixel text-gold text-lg sm:text-2xl glow-gold mb-3">
            PROJECTS
          </h2>
          <div className="font-vt text-xl text-gold opacity-60">
            Select a stage to begin your adventure
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECTS.map((project, i) => (
            <div key={project.id} onClick={() => setSelectedProject(project)} style={{ cursor: 'none' }}>
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>

        <div className="mt-6 font-pixel text-[7px] text-gold opacity-40 text-center">
          CLICK ANY STAGE TO VIEW DETAILS — {PROJECTS.filter(p => p.status === 'COMPLETE').length}/{PROJECTS.length} COMPLETED
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
