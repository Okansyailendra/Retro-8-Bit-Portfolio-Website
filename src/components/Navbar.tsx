import { motion } from 'framer-motion';

type SectionId = 'home' | 'about' | 'skills' | 'projects' | 'arcade' | 'contact';

const NAV: { id: SectionId; label: string; short: string }[] = [
  { id: 'home',     label: 'HOME',     short: 'H' },
  { id: 'about',    label: 'ABOUT',    short: 'A' },
  { id: 'skills',   label: 'SKILLS',   short: 'SK' },
  { id: 'projects', label: 'PROJECTS', short: 'PR' },
  { id: 'arcade',   label: 'ARCADE',   short: 'AC' },
  { id: 'contact',  label: 'CONTACT',  short: 'CO' },
];

interface NavbarProps {
  activeSection: SectionId;
  scrollToSection: (id: SectionId) => void;
}

export default function Navbar({ activeSection, scrollToSection }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000]"
      style={{ background: '#0a0a1a', borderBottom: '4px solid #ffd700' }}
    >
      <div className="flex items-center justify-between px-3 py-2 max-w-6xl mx-auto">
        {/* Logo */}
        <button
          onClick={() => scrollToSection('home')}
          className="font-pixel text-gold text-[8px] sm:text-[10px] glow-gold hidden sm:block tracking-widest"
          style={{ cursor: 'none', background: 'none', border: 'none' }}
        >
          &lt;PIXEL.DEV/&gt;
        </button>

        {/* Nav items */}
        <div className="flex gap-1 sm:gap-2 mx-auto sm:mx-0">
          {NAV.map((item) => {
            const active = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                whileTap={{ scale: 0.88 }}
                className="font-pixel text-[7px] sm:text-[9px] px-2 sm:px-3 py-1.5 transition-all"
                style={{
                  cursor: 'none',
                  border: active ? '2px solid #ffd700' : '2px solid #2a2a6e',
                  background: active ? '#ffd700' : 'transparent',
                  color: active ? '#0f0f23' : '#ffd700',
                  boxShadow: active ? '2px 2px 0 0 #ffa500' : '2px 2px 0 0 #2a2a6e',
                  fontFamily: "'Press Start 2P', monospace",
                }}
              >
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.short}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Lives display */}
        <div className="hidden sm:flex items-center gap-1 font-pixel text-pink text-[9px]">
          <span className="glow-pink">♥♥♥</span>
        </div>
      </div>
    </nav>
  );
}
