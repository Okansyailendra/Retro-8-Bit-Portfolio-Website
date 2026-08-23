import { useState, useEffect } from 'react'

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['hero', 'about', 'skills', 'projects', 'contact']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(5, 5, 26, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
        padding: '0 2rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        <a href="#hero" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#a78bfa', textDecoration: 'none', letterSpacing: '0.1em' }}>
          Kannz<span style={{ color: '#06b6d4' }}>Dev</span>
        </a>

        {/* Desktop nav */}
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }} className="hidden-mobile">
          {links.map(({ href, label }) => {
            const id = href.slice(1)
            return (
              <li key={href}>
                <a
                  href={href}
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: active === id ? '#a78bfa' : '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    position: 'relative',
                    paddingBottom: '2px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                  onMouseLeave={e => (e.currentTarget.style.color = active === id ? '#a78bfa' : '#94a3b8')}
                >
                  {label}
                  {active === id && (
                    <span style={{
                      position: 'absolute',
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                      borderRadius: '1px',
                    }} />
                  )}
                </a>
              </li>
            )
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none' }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          <div style={{ width: 22, height: 2, background: '#a78bfa', marginBottom: 5, transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: '#a78bfa', marginBottom: 5, opacity: open ? 0 : 1, transition: 'opacity 0.3s' }} />
          <div style={{ width: 22, height: 2, background: '#a78bfa', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu (Fluid Floating Glass Card) */}
      <div style={{
        position: 'absolute',
        top: '75px',
        right: '2rem',
        width: 'calc(100vw - 4rem)',
        maxWidth: '280px',
        background: 'linear-gradient(145deg, rgba(20, 15, 45, 0.95), rgba(10, 5, 25, 0.98))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        padding: '1rem',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(167, 139, 250, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy spring effect
        transformOrigin: 'top right',
        zIndex: 99
      }}>
        {links.map(({ href, label }) => {
          const id = href.slice(1)
          const isActive = active === id
          return (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem 1rem',
                borderRadius: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '1rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                overflow: 'hidden'
              }}
            >
              {/* Glow accent on the left */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '10%',
                  bottom: '10%',
                  width: '3px',
                  background: '#06b6d4',
                  boxShadow: '0 0 10px #06b6d4',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              
              {/* Active dot indicator */}
              {isActive && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#06b6d4',
                  boxShadow: '0 0 10px #06b6d4',
                  marginRight: '12px',
                  marginLeft: '8px'
                }} />
              )}
              
              <span style={{ marginLeft: isActive ? 0 : '26px', transition: 'margin 0.2s' }}>
                {label}
              </span>
            </a>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
