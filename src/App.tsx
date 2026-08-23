import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import MiniGame from './components/MiniGame';
import Contact from './components/Contact';

type SectionId = 'home' | 'about' | 'skills' | 'projects' | 'arcade' | 'contact';

const SECTION_IDS: SectionId[] = ['home', 'about', 'skills', 'projects', 'arcade', 'contact'];

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);

  const homeRef    = useRef<HTMLElement>(null);
  const aboutRef   = useRef<HTMLElement>(null);
  const skillsRef  = useRef<HTMLElement>(null);
  const projectsRef= useRef<HTMLElement>(null);
  const arcadeRef  = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const refs = useMemo<Record<SectionId, React.RefObject<HTMLElement | null>>>(() => ({
    home: homeRef, about: aboutRef, skills: skillsRef,
    projects: projectsRef, arcade: arcadeRef, contact: contactRef,
  }), []);

  // Intersection observer for active section
  useEffect(() => {
    const obs: IntersectionObserver[] = SECTION_IDS.map((key) => {
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(key); },
        { threshold: 0.35 }
      );
      if (refs[key].current) o.observe(refs[key].current!);
      return o;
    });
    return () => obs.forEach(o => o.disconnect());
  }, [refs]);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    const down = () => setClicking(true);
    const up   = () => setClicking(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  const scrollTo = useCallback((id: SectionId) => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [refs]);

  return (
    <div className="bg-bg text-gold overflow-x-hidden min-h-screen">
      {/* Pixel crosshair cursor */}
      <div
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: cursorPos.x - 8,
          top: cursorPos.y - 8,
          transform: clicking ? 'scale(0.75)' : 'scale(1)',
          transition: 'transform 0.06s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
          <rect x="7" y="0" width="2" height="4" fill="#ffd700" />
          <rect x="7" y="12" width="2" height="4" fill="#ffd700" />
          <rect x="0" y="7" width="4" height="2" fill="#ffd700" />
          <rect x="12" y="7" width="4" height="2" fill="#ffd700" />
          <rect x="6" y="6" width="4" height="4" fill="#ffd700" />
          <rect x="7" y="7" width="2" height="2" fill="#0f0f23" />
        </svg>
      </div>

      <Navbar activeSection={activeSection} scrollToSection={scrollTo} />

      <section ref={homeRef}     id="home">     <Home scrollToNext={() => scrollTo('about')} /></section>
      <section ref={aboutRef}    id="about">    <About /></section>
      <section ref={skillsRef}   id="skills">   <Skills /></section>
      <section ref={projectsRef} id="projects"> <Projects /></section>
      <section ref={arcadeRef}   id="arcade">   <MiniGame /></section>
      <section ref={contactRef}  id="contact">  <Contact /></section>
    </div>
  );
}
