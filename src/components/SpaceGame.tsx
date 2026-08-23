import { useEffect, useRef, useState } from 'react'

type GameState = 'START' | 'PLAYING' | 'GAMEOVER'

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  speed?: number
  color?: string
  markedForDeletion?: boolean
}

export default function SpaceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('START')
  const [score, setScore] = useState(0)

  // Image Refs
  const asteroidImgRef = useRef<HTMLImageElement | null>(null)
  const starImgRef = useRef<HTMLImageElement | null>(null)
  const shipImgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const ast = new Image()
    ast.src = '/game-icons--asteroid.svg'
    asteroidImgRef.current = ast

    const st = new Image()
    st.src = '/material-symbols--star-rounded.svg'
    starImgRef.current = st

    const ship = new Image()
    ship.src = '/game-icons--spaceship.svg'
    shipImgRef.current = ship
  }, [])

  // Game internal state (avoiding React state for 60FPS loop)
  const gameRef = useRef({
    keys: { left: false, right: false, space: false },
    ship: { x: 0, y: 0, width: 40, height: 40, speed: 7 },
    lasers: [] as GameObject[],
    asteroids: [] as GameObject[],
    stars: [] as GameObject[],
    bgStars: [] as any[],
    particles: [] as any[],
    lastAsteroidTime: 0,
    asteroidInterval: 1200, // spawn every 1.2s initially
    score: 0,
    animationId: 0,
    width: 0,
    height: 0,
    isInvulnerable: false,
    invulnerableUntil: 0
  })

  // Initialize Game
  const initGame = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas ref is null!")
      return
    }
    const w = canvas.clientWidth || 800
    const h = canvas.clientHeight || 450
    canvas.width = w
    canvas.height = h

    const game = gameRef.current
    game.width = w
    game.height = h
    game.ship.x = w / 2 - game.ship.width / 2
    game.ship.y = h - 80
    game.lasers = []
    game.asteroids = []
    game.stars = []
    game.bgStars = Array.from({length: 80}).map(() => ({
      x: Math.random() * w, 
      y: Math.random() * h, 
      radius: Math.random() * 1.5 + 0.5, 
      speed: Math.random() * 3 + 0.5, 
      alpha: Math.random() * 0.6 + 0.2 
    }))
    game.particles = []
    game.score = 0
    game.asteroidInterval = 1200
    game.isInvulnerable = false
    setScore(0)
  }

  const startGame = () => {
    initGame()
    setGameState('PLAYING')
  }

  // Draw utilities
  const drawShip = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isInvulnerable: boolean) => {
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    
    // Shield
    if (isInvulnerable) {
      const time = Date.now()
      const pulse = Math.sin(time / 150) * 0.1 + 0.9
      const radius = w * 0.8 * pulse

      // Inner glow
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'
      ctx.fill()
      
      // Outer bright ring with purple glow
      ctx.shadowBlur = 20
      ctx.shadowColor = '#a78bfa'
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)'
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Rotating pink dashed inner ring
      ctx.beginPath()
      ctx.setLineDash([8, 12])
      ctx.arc(0, 0, radius * 0.85, (time / 400) % (Math.PI * 2), (time / 400) % (Math.PI * 2) + Math.PI * 2)
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])
      ctx.shadowBlur = 0
    }
    // Engine glow
    const time = Date.now()
    const engineGlow = Math.sin(time / 50) * 5 + 10
    ctx.shadowBlur = 15
    ctx.shadowColor = '#06b6d4'
    ctx.fillStyle = '#06b6d4'
    ctx.beginPath()
    ctx.moveTo(-10, h/2)
    ctx.lineTo(10, h/2)
    ctx.lineTo(0, h/2 + engineGlow)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    if (shipImgRef.current && shipImgRef.current.complete) {
      // Draw Ship Image
      ctx.drawImage(shipImgRef.current, -w/2, -h/2, w, h)
    } else {
      // Fallback Ship body
      ctx.fillStyle = '#e2e8f0'
      ctx.beginPath()
      ctx.moveTo(0, -h / 2) // nose
      ctx.lineTo(w / 2, h / 2) // right wing
      ctx.lineTo(-w / 2, h / 2) // left wing
      ctx.closePath()
      ctx.fill()

      // Cockpit
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(0, -h / 4)
      ctx.lineTo(w / 6, h / 6)
      ctx.lineTo(-w / 6, h / 6)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  const drawAsteroid = (ctx: CanvasRenderingContext2D, a: GameObject) => {
    ctx.save()
    ctx.translate(a.x + a.width / 2, a.y + a.height / 2)
    ctx.rotate(a.y * 0.02) // slow rotation
    
    if (asteroidImgRef.current && asteroidImgRef.current.complete) {
      ctx.drawImage(asteroidImgRef.current, -a.width/2, -a.height/2, a.width, a.height)
    } else {
      ctx.fillStyle = a.color || '#94a3b8'
      ctx.beginPath()
      // Irregular hexagon
      ctx.moveTo(-a.width/2, 0)
      ctx.lineTo(-a.width/4, -a.height/2)
      ctx.lineTo(a.width/4, -a.height/2)
      ctx.lineTo(a.width/2, 0)
      ctx.lineTo(a.width/3, a.height/2)
      ctx.lineTo(-a.width/3, a.height/2)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    ctx.restore()
  }

  const drawStar = (ctx: CanvasRenderingContext2D, s: GameObject) => {
    ctx.save()
    ctx.translate(s.x + s.width / 2, s.y + s.height / 2)
    const time = Date.now()
    ctx.rotate(time / 500) // rotate steadily
    
    if (starImgRef.current && starImgRef.current.complete) {
      ctx.shadowBlur = 15
      ctx.shadowColor = '#facc15'
      ctx.drawImage(starImgRef.current, -s.width/2, -s.height/2, s.width, s.height)
      ctx.shadowBlur = 0
    } else {
      ctx.fillStyle = '#facc15'
      ctx.beginPath()
      ctx.arc(0, 0, s.width/2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // Create explosion particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      gameRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color
      })
    }
  }

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const loop = (timestamp: number) => {
      if (gameState !== 'PLAYING') return
      if (!gameRef.current) return
      
      const game = gameRef.current

      // Check Invulnerability
      if (game.isInvulnerable && Date.now() > game.invulnerableUntil) {
        game.isInvulnerable = false
      }

      // Clear Canvas and Draw Background
      ctx.fillStyle = '#030712' // very dark space color
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update background stars (parallax)
      game.bgStars.forEach(star => {
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Move Ship
      if (game.keys.left) game.ship.x -= game.ship.speed
      if (game.keys.right) game.ship.x += game.ship.speed

      // Clamp ship
      if (game.ship.x < 0) game.ship.x = 0
      if (game.ship.x + game.ship.width > canvas.width) game.ship.x = canvas.width - game.ship.width

      // Draw Ship
      drawShip(ctx, game.ship.x, game.ship.y, game.ship.width, game.ship.height, game.isInvulnerable)

      // Shoot Laser
      if (game.keys.space) {
        game.lasers.push({
          x: game.ship.x + game.ship.width / 2 - 2,
          y: game.ship.y - 10,
          width: 4,
          height: 15,
          speed: 12
        })
        game.keys.space = false // semi-auto
      }

      // Update and Draw Lasers
      game.lasers.forEach(l => {
        l.y -= l.speed!
        ctx.shadowBlur = 10
        ctx.shadowColor = '#ec4899'
        ctx.fillStyle = '#ec4899'
        ctx.fillRect(l.x, l.y, l.width, l.height)
        ctx.shadowBlur = 0
        if (l.y < -20) l.markedForDeletion = true
      })

      // Spawn Asteroids and Stars
      if (timestamp - game.lastAsteroidTime > game.asteroidInterval) {
        // 15% chance to spawn a star instead of an asteroid
        if (Math.random() < 0.15) {
          game.stars.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 3
          })
        } else {
          const size = Math.random() * 30 + 20
          game.asteroids.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: Math.random() * 2 + 2 + (game.score * 0.05), // gets faster
            color: ['#64748b', '#94a3b8', '#475569'][Math.floor(Math.random()*3)]
          })
        }
        
        game.lastAsteroidTime = timestamp
        // Decrease interval to make it harder
        if (game.asteroidInterval > 400) game.asteroidInterval -= 20
      }

      // Update and Draw Stars
      game.stars.forEach(s => {
        s.y += s.speed!
        drawStar(ctx, s)

        // Collision with Ship (Collect Star)
        if (
          s.x < game.ship.x + game.ship.width &&
          s.x + s.width > game.ship.x &&
          s.y < game.ship.y + game.ship.height &&
          s.y + s.height > game.ship.y
        ) {
          s.markedForDeletion = true
          game.isInvulnerable = true
          game.invulnerableUntil = Date.now() + 2000
          createExplosion(s.x + s.width/2, s.y + s.height/2, '#facc15')
        }

        if (s.y > canvas.height) s.markedForDeletion = true
      })

      // Update and Draw Asteroids
      game.asteroids.forEach(a => {
        a.y += a.speed!
        drawAsteroid(ctx, a)
        
        // Collision with Ship
        if (
          a.x < game.ship.x + game.ship.width &&
          a.x + a.width > game.ship.x &&
          a.y < game.ship.y + game.ship.height &&
          a.y + a.height > game.ship.y
        ) {
          if (game.isInvulnerable) {
            a.markedForDeletion = true
            createExplosion(a.x + a.width/2, a.y + a.height/2, '#f59e0b')
            game.score += 5
            setScore(game.score)
          } else {
            createExplosion(game.ship.x + game.ship.width/2, game.ship.y + game.ship.height/2, '#06b6d4')
            setGameState('GAMEOVER')
          }
        }

        if (a.y > canvas.height) a.markedForDeletion = true
      })

      // Update Particles (Safe filtering)
      game.particles = game.particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.03
        if (p.life <= 0) return false
        
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.random() * 3 + 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1.0
        return true
      })

      // Collision Laser -> Asteroid & Stars
      game.lasers.forEach(l => {
        // Asteroids
        game.asteroids.forEach(a => {
          if (
            !l.markedForDeletion && !a.markedForDeletion &&
            l.x < a.x + a.width && l.x + l.width > a.x &&
            l.y < a.y + a.height && l.y + l.height > a.y
          ) {
            l.markedForDeletion = true
            a.markedForDeletion = true
            createExplosion(a.x + a.width/2, a.y + a.height/2, '#f59e0b')
            game.score += 10
            setScore(game.score)
          }
        })

        // Stars
        game.stars.forEach(s => {
          if (
            !l.markedForDeletion && !s.markedForDeletion &&
            l.x < s.x + s.width && l.x + l.width > s.x &&
            l.y < s.y + s.height && l.y + l.height > s.y
          ) {
            l.markedForDeletion = true
            s.markedForDeletion = true
            createExplosion(s.x + s.width/2, s.y + s.height/2, '#facc15')
          }
        })
      })

      // Cleanup
      game.lasers = game.lasers.filter(l => !l.markedForDeletion)
      game.asteroids = game.asteroids.filter(a => !a.markedForDeletion)
      game.stars = game.stars.filter(s => !s.markedForDeletion)

      game.animationId = requestAnimationFrame(loop)
    }

    if (gameState === 'PLAYING') {
      gameRef.current.animationId = requestAnimationFrame(loop)
    }

    return () => cancelAnimationFrame(gameRef.current.animationId)
  }, [gameState])

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current
      if (e.key === 'ArrowLeft' || e.key === 'a') g.keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') g.keys.right = true
      if (e.key === 'Enter' && gameState === 'PLAYING') {
        g.keys.space = true
        e.preventDefault() // prevent scroll
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current
      if (e.key === 'ArrowLeft' || e.key === 'a') g.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') g.keys.right = false
      if (e.key === 'Enter') g.keys.space = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (gameState !== 'PLAYING') initGame()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gameState])

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      background: 'rgba(5,5,26,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)',
    }}>
      
      {/* Top Bar / Score */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', color: '#38bdf8', fontWeight: 700 }}>
          SCORE: <span style={{ color: '#fff' }}>{score}</span>
        </div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#94a3b8', fontSize: '0.8rem' }}>
          ASTEROID DEFENDER
        </div>
      </div>

      <canvas 
        ref={canvasRef}
        width={800}
        height={450} 
        style={{ width: '100%', height: '450px', display: 'block', touchAction: 'none' }}
      />

      {/* OVERLAYS */}
      {gameState === 'START' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,5,26,0.8)',
          zIndex: 20
        }}>
          <h3 style={{ fontFamily: 'Orbitron, sans-serif', color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', textAlign: 'center' }}>
            Mission: <span style={{ color: '#ec4899' }}>DEFEND</span>
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2rem', textAlign: 'center', maxWidth: '80%' }}>
            Gunakan tombol <strong>Kiri/Kanan</strong> untuk bergerak, dan <strong>Enter</strong> untuk menembak. <br/>
            Kumpulkan <strong>Bintang</strong> untuk menjadi kebal selama 2 detik! <br/>
            Di HP, gunakan tombol sentuh di layar.
          </p>
          <button 
            onClick={startGame}
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(236,72,153,0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            START MISSION
          </button>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(220,38,38,0.15)',
          backdropFilter: 'blur(4px)',
          zIndex: 20
        }}>
          <h3 style={{ fontFamily: 'Orbitron, sans-serif', color: '#f87171', fontSize: '2.5rem', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(220,38,38,0.5)' }}>
            GAME OVER
          </h3>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem', fontFamily: 'Orbitron, sans-serif' }}>
            Final Score: <strong style={{ color: '#38bdf8' }}>{score}</strong>
          </p>
          <button 
            onClick={startGame}
            style={{
              padding: '0.8rem 2rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* MOBILE CONTROLS */}
      {gameState === 'PLAYING' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onPointerDown={(e) => { e.preventDefault(); gameRef.current.keys.left = true }}
              onPointerUp={(e) => { e.preventDefault(); gameRef.current.keys.left = false }}
              onPointerOut={(e) => { e.preventDefault(); gameRef.current.keys.left = false }}
              onContextMenu={e => e.preventDefault()}
              style={{
                width: '55px', height: '55px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              &#8592;
            </button>
            <button 
              onPointerDown={(e) => { e.preventDefault(); gameRef.current.keys.right = true }}
              onPointerUp={(e) => { e.preventDefault(); gameRef.current.keys.right = false }}
              onPointerOut={(e) => { e.preventDefault(); gameRef.current.keys.right = false }}
              onContextMenu={e => e.preventDefault()}
              style={{
                width: '55px', height: '55px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              &#8594;
            </button>
          </div>
          
          <button 
            onPointerDown={(e) => { e.preventDefault(); gameRef.current.keys.space = true }}
            onPointerUp={(e) => { e.preventDefault(); gameRef.current.keys.space = false }}
            onPointerOut={(e) => { e.preventDefault(); gameRef.current.keys.space = false }}
            onContextMenu={e => e.preventDefault()}
            style={{
              width: '80px', height: '55px', borderRadius: '25px',
              background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.5)',
              color: '#ec4899', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            FIRE
          </button>
        </div>
      )}
    </div>
  )
}
