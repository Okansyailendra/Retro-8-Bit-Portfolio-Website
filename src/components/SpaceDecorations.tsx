
export const Planet = ({ top, left, right, bottom, color, size, delay = '0s' }: any) => (
  <div style={{
    position: 'absolute', top, left, right, bottom,
    width: size, height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, ${color}, #020617)`,
    boxShadow: `inset -15px -15px 30px rgba(0,0,0,0.8), 0 0 40px ${color}40`,
    zIndex: 0, pointerEvents: 'none',
    animation: `astronautFloat 12s ease-in-out ${delay} infinite`
  }}>
    {/* Texture ring */}
    <div style={{
      position: 'absolute', top: '40%', left: '-10%', right: '-10%', height: '15%',
      borderTop: '2px solid rgba(255,255,255,0.1)',
      borderBottom: '2px solid rgba(255,255,255,0.05)',
      borderRadius: '50%',
      transform: 'rotate(-15deg)',
      opacity: 0.5
    }} />
  </div>
)

export const Moon = ({ top, left, right, bottom, size, delay = '0s' }: any) => (
  <div style={{
    position: 'absolute', top, left, right, bottom,
    width: size, height: size,
    borderRadius: '50%',
    background: '#94a3b8',
    boxShadow: 'inset -12px -12px 25px rgba(0,0,0,0.7), inset 5px 5px 15px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.1)',
    zIndex: 0, pointerEvents: 'none',
    animation: `astronautFloat 15s ease-in-out ${delay} infinite reverse`
  }}>
    <div style={{ position:'absolute', top:'20%', left:'30%', width:'25%', height:'25%', borderRadius:'50%', background:'rgba(0,0,0,0.15)', boxShadow:'inset 2px 2px 6px rgba(0,0,0,0.3)' }} />
    <div style={{ position:'absolute', top:'50%', left:'60%', width:'18%', height:'18%', borderRadius:'50%', background:'rgba(0,0,0,0.15)', boxShadow:'inset 2px 2px 6px rgba(0,0,0,0.3)' }} />
    <div style={{ position:'absolute', top:'65%', left:'25%', width:'12%', height:'12%', borderRadius:'50%', background:'rgba(0,0,0,0.15)', boxShadow:'inset 2px 2px 4px rgba(0,0,0,0.3)' }} />
  </div>
)

export const Sun = ({ top, left, right, bottom, size }: any) => (
  <div style={{
    position: 'absolute', top, left, right, bottom,
    width: size, height: size,
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, #fef08a 0%, #f59e0b 40%, #ea580c 80%)',
    boxShadow: '0 0 80px 20px rgba(245, 158, 11, 0.4), 0 0 120px 40px rgba(234, 88, 12, 0.2)',
    zIndex: 0, pointerEvents: 'none',
    animation: 'nebulaPulse 8s ease-in-out infinite'
  }} />
)

export const ShootingStar = ({ delay, top }: any) => (
  <div style={{
    position: 'absolute', top, left: '-20%',
    width: '150px', height: '2px',
    background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
    zIndex: 0, pointerEvents: 'none',
    transform: 'rotate(-25deg)',
    animation: `shootingStar 8s linear ${delay} infinite`,
    opacity: 0,
  }}>
    <div style={{ position: 'absolute', right: 0, top: '-2px', width: '5px', height: '5px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' }} />
  </div>
)

export const FloatingIcon = ({ icon, top, left, right, bottom, size, animDur, rotation, opacity = 0.5 }: any) => (
  <div style={{
    position: 'absolute', top, left, right, bottom,
    fontSize: size,
    zIndex: 0, pointerEvents: 'none',
    opacity,
    animation: `astronautFloat ${animDur}s ease-in-out infinite`,
    transform: `rotate(${rotation}deg)`
  }}>
    {icon}
  </div>
)
