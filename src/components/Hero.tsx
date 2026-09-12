import { useEffect, useState } from 'react'

const ROLES = ['Software Developer', 'Web Developer', 'UI UX Designer', 'Game Developer', 'Cyber Security Enthusiast']

/* ── SVG inline planet components ── */
const PlanetMars = ({ size = 120, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <defs>
      <radialGradient id="mars" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </radialGradient>
      <radialGradient id="marsGlow" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(249,115,22,0.3)" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="50" fill="url(#mars)" />
    <circle cx="60" cy="60" r="56" fill="url(#marsGlow)" />
    <ellipse cx="45" cy="50" rx="12" ry="8" fill="rgba(185,28,28,0.4)" />
    <ellipse cx="70" cy="65" rx="8" ry="5" fill="rgba(185,28,28,0.3)" />
    <circle cx="55" cy="40" r="4" fill="rgba(251,146,60,0.3)" />
  </svg>
)

const PlanetNeptune = ({ size = 90, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" style={style}>
    <defs>
      <radialGradient id="neptune" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="40%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#164e63" />
      </radialGradient>
      <radialGradient id="neptuneGlow" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(6,182,212,0.35)" />
      </radialGradient>
    </defs>
    <circle cx="45" cy="45" r="38" fill="url(#neptune)" />
    <circle cx="45" cy="45" r="43" fill="url(#neptuneGlow)" />
    <ellipse cx="45" cy="38" rx="30" ry="3" fill="rgba(103,232,249,0.2)" />
    <ellipse cx="45" cy="50" rx="28" ry="2" fill="rgba(103,232,249,0.15)" />
  </svg>
)

const PlanetSaturn = ({ size = 160, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 160 112" style={style}>
    <defs>
      <radialGradient id="saturn" cx="40%" cy="35%" r="55%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>
      <radialGradient id="saturnGlow" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(251,191,36,0.25)" />
      </radialGradient>
    </defs>
    <ellipse cx="80" cy="60" rx="72" ry="18" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="6" />
    <ellipse cx="80" cy="60" rx="65" ry="14" fill="none" stroke="rgba(217,119,6,0.15)" strokeWidth="4" />
    <circle cx="80" cy="56" r="32" fill="url(#saturn)" />
    <circle cx="80" cy="56" r="36" fill="url(#saturnGlow)" />
    <ellipse cx="80" cy="52" rx="26" ry="2" fill="rgba(251,191,36,0.2)" />
    <ellipse cx="80" cy="60" rx="24" ry="2" fill="rgba(217,119,6,0.15)" />
    <ellipse cx="80" cy="60" rx="72" ry="18" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="3"
      strokeDasharray="10,120" strokeDashoffset="60" />
  </svg>
)

/* ── Small Astronaut SVG ── */
const Astronaut = ({ size = 60, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={style}>
    <ellipse cx="30" cy="38" rx="12" ry="16" fill="#e2e8f0" />
    <circle cx="30" cy="20" r="13" fill="#94a3b8" />
    <circle cx="30" cy="20" r="10" fill="#0f172a" />
    <circle cx="30" cy="19" r="9" fill="rgba(6,182,212,0.15)" />
    <ellipse cx="27" cy="17" rx="3" ry="4" fill="rgba(6,182,212,0.3)" transform="rotate(-15 27 17)" />
    <rect x="18" y="28" width="6" height="14" rx="2" fill="#94a3b8" />
    <ellipse cx="17" cy="36" rx="4" ry="7" fill="#e2e8f0" transform="rotate(20 17 36)" />
    <ellipse cx="43" cy="34" rx="4" ry="7" fill="#e2e8f0" transform="rotate(-15 43 34)" />
    <rect x="23" y="50" width="5" height="8" rx="2" fill="#e2e8f0" />
    <rect x="32" y="50" width="5" height="8" rx="2" fill="#e2e8f0" />
    <circle cx="30" cy="20" r="13" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="0.5" />
  </svg>
)

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30
    const y = (e.clientY / window.innerHeight - 0.5) * 30
    setMousePos({ x, y })
  }

  useEffect(() => {
    const cursor = setInterval(() => setShowCursor(c => !c), 530)
    return () => clearInterval(cursor)
  }, [])

  useEffect(() => {
    const current = ROLES[roleIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80)
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40)
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false)
      setRoleIndex(i => (i + 1) % ROLES.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, roleIndex])

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '6rem 1.5rem',
        zIndex: 1,
        overflow: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* ═══════ ATMOSPHERIC SPACE BACKGROUND ═══════ */}

      {/* Large nebula cloud — top left, dreamy purple */}
      <div style={{
        position: 'absolute',
        top: '-5%',
        left: '-10%',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 40% 40%, rgba(124,58,237,0.12) 0%, rgba(88,28,135,0.06) 35%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 0)`,
        transition: 'transform 0.3s ease-out',
        animation: 'nebulaPulse 16s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* Nebula cloud — center right, warm cyan-magenta */}
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '-8%',
        width: 550,
        height: 550,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, rgba(236,72,153,0.04) 40%, transparent 70%)',
        filter: 'blur(55px)',
        pointerEvents: 'none',
        transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
        animation: 'nebulaPulse 20s ease-in-out 4s infinite',
        willChange: 'transform',
      }} />

      {/* Nebula cloud — bottom center, subtle warm */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '30%',
        width: 600,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(236,72,153,0.06) 0%, rgba(124,58,237,0.03) 50%, transparent 80%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
        animation: 'nebulaPulse 18s ease-in-out 8s infinite',
        willChange: 'transform',
      }} />

      {/* Soft distant galaxy haze — top center */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '40%',
        width: 300,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'nebulaPulse 12s ease-in-out 2s infinite',
        transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
        transition: 'transform 0.3s ease-out',
        willChange: 'transform',
      }} />

      {/* ═══════ PLANETS — softened, more atmospheric ═══════ */}

      {/* Planet Mars — top right, faded & dreamy */}
      <div style={{
        position: 'absolute',
        top: '6%',
        right: '7%',
        pointerEvents: 'none',
        opacity: 0.6,
        transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`,
        transition: 'transform 0.4s ease-out',
        animation: 'planetFloat 16s ease-in-out infinite',
        filter: 'drop-shadow(0 0 25px rgba(249,115,22,0.25))',
        zIndex: 0,
      }}>
        <PlanetMars size={90} />
      </div>

      {/* Planet Neptune — bottom left, subtle */}
      <div style={{
        position: 'absolute',
        bottom: '18%',
        left: '4%',
        pointerEvents: 'none',
        opacity: 0.45,
        transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
        transition: 'transform 0.4s ease-out',
        animation: 'planetFloat 20s ease-in-out 3s infinite',
        filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.2))',
        zIndex: 0,
      }}>
        <PlanetNeptune size={60} />
      </div>

      {/* Planet Saturn — bottom right, very far background feel */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '10%',
        pointerEvents: 'none',
        opacity: 0.3,
        transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)`,
        transition: 'transform 0.4s ease-out',
        animation: 'planetFloat 24s ease-in-out 6s infinite',
        filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.15))',
        zIndex: 0,
      }}>
        <PlanetSaturn size={130} />
      </div>

      {/* Floating Astronaut — top left, gentle */}
      <div style={{
        position: 'absolute',
        top: '14%',
        left: '12%',
        pointerEvents: 'none',
        animation: 'astronautFloat 12s ease-in-out infinite',
        opacity: 0.35,
        transform: `translate(${mousePos.x * 2.5}px, ${mousePos.y * 2.5}px)`,
        transition: 'transform 0.4s ease-out',
        zIndex: 0,
      }}>
        <Astronaut size={45} />
      </div>

      {/* ═══════ SOFT DECORATIVE PARTICLES ═══════ */}
      {/* Gentle glowing dots scattered around — not harsh like asteroids */}
      {[
        { top: '20%', left: '75%', size: 4, color: 'rgba(167,139,250,0.5)', dur: '6s', delay: '0s' },
        { top: '65%', left: '15%', size: 3, color: 'rgba(6,182,212,0.4)', dur: '7s', delay: '1s' },
        { top: '40%', left: '88%', size: 5, color: 'rgba(236,72,153,0.35)', dur: '8s', delay: '2s' },
        { top: '80%', left: '55%', size: 3, color: 'rgba(167,139,250,0.4)', dur: '5s', delay: '3s' },
        { top: '12%', left: '50%', size: 4, color: 'rgba(6,182,212,0.35)', dur: '9s', delay: '1.5s' },
        { top: '55%', left: '5%', size: 3, color: 'rgba(251,191,36,0.3)', dur: '7s', delay: '4s' },
        { top: '30%', left: '30%', size: 2, color: 'rgba(226,232,240,0.3)', dur: '6s', delay: '2.5s' },
        { top: '75%', left: '80%', size: 3, color: 'rgba(124,58,237,0.35)', dur: '8s', delay: '0.5s' },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.top,
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `twinkle ${p.dur} ease-in-out ${p.delay} infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      {/* Orbit ring decorations — ultra subtle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 650,
        height: 650,
        marginTop: -325,
        marginLeft: -325,
        border: '1px solid rgba(124,58,237,0.06)',
        borderRadius: '50%',
        animation: 'gentleSpin 80s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: -2,
          left: '50%',
          marginLeft: -2,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.4)',
          boxShadow: '0 0 8px rgba(124,58,237,0.3)',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 900,
        height: 900,
        marginTop: -450,
        marginLeft: -450,
        border: '1px dashed rgba(6,182,212,0.04)',
        borderRadius: '50%',
        animation: 'gentleSpin 120s linear infinite reverse',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ═══════ HERO CONTENT ═══════ */}

      {/* Badge */}
      <div className="space-badge" style={{
        background: 'rgba(124, 58, 237, 0.1)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        zIndex: 2,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80, 0 0 20px rgba(74,222,128,0.3)', display: 'inline-block', animation: 'scalePulse 2s ease-in-out infinite' }} />
        <span style={{ color: '#a78bfa', fontWeight: 500 }}>
          Available for new opportunities
        </span>
      </div>

      {/* Greeting — cosmic glow */}
      <div style={{
        marginTop: '2rem',
        animation: 'cosmicFadeIn 1s ease 0.1s both',
        zIndex: 2,
      }}>
        <span className="cosmic-glow-text" style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 500,
          fontSize: 'clamp(1rem, 3vw, 1.5rem)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '0.5rem',
        }}>
          ✦ Halo, Saya ✦
        </span>
      </div>

      {/* Name — aurora gradient */}
      <h1 style={{
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: 900,
        fontSize: 'clamp(2.2rem, 7vw, 5rem)',
        lineHeight: 1.1,
        margin: '0 0 1.2rem',
        letterSpacing: '-0.01em',
        animation: 'cosmicFadeIn 1.1s ease 0.2s both',
        zIndex: 2,
      }}>
        <span className="aurora-text" style={{
          display: 'inline-block',
          filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.5))',
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
          transition: 'transform 0.2s ease-out',
          padding: '0.1em 0',
        }}>
          Okan Syailendra Wahyudi
        </span>
        <br />
        <span className="aurora-text" style={{
          display: 'inline-block',
          filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.5))',
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
          transition: 'transform 0.2s ease-out',
          padding: '0.1em 0',
          animationDelay: '0.5s',
        }}>
          Wahyudi
        </span>
      </h1>

      {/* Role typewriter — hologram style */}
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
        fontWeight: 500,
        letterSpacing: '0.08em',
        marginBottom: '1.8rem',
        minHeight: '2.2rem',
        animation: 'cosmicFadeIn 1.1s ease 0.3s both',
        zIndex: 2,
        position: 'relative',
      }}>
        <span style={{
          background: 'linear-gradient(90deg, #a78bfa, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.4))',
        }}>
          {'< '}
        </span>
        <span style={{
          color: '#06b6d4',
          textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
        }}>
          {displayed}
        </span>
        <span style={{ opacity: showCursor ? 1 : 0, color: '#ec4899', textShadow: '0 0 10px #ec4899' }}>|</span>
        <span style={{
          background: 'linear-gradient(90deg, #06b6d4, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 15px rgba(167,139,250,0.4))',
        }}>
          {' />'}
        </span>
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
        fontWeight: 400,
        maxWidth: 700,
        lineHeight: 1.8,
        letterSpacing: '0.02em',
        marginBottom: '2.5rem',
        textWrap: 'balance',
        animation: 'cosmicFadeIn 1.2s ease 0.4s both',
        color: '#94a3b8',
        zIndex: 2,
      }}>
        Menciptakan antarmuka yang elegan dan dunia digital yang imersif.{' '}
        <span style={{ color: '#e2e8f0' }}>
          Dari merancang interaksi UI yang mulus hingga membangun mekanika permainan yang memikat
        </span>{' '}
        — saya menghidupkan imajinasi menjadi realitas yang dapat dimainkan.
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animation: 'cosmicFadeIn 1.2s ease 0.5s both', zIndex: 2 }}>
        <a href="#projects" className="cosmic-btn-primary">
          🚀 Lihat Proyek
        </a>
        <a href="#contact" className="cosmic-btn-secondary">
          ☄️ Hubungi Saya
        </a>
      </div>

      {/* Scroll indicator */}
      <div style={{
        marginTop: '3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        opacity: 0.5,
        animation: 'cosmicFadeIn 1s ease 1.2s both',
        zIndex: 2,
      }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: 20,
          height: 34,
          border: '1px solid rgba(167,139,250,0.4)',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '5px',
        }}>
          <div style={{
            width: 3,
            height: 8,
            background: '#a78bfa',
            borderRadius: '2px',
            animation: 'float 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
    </section>
  )
}
