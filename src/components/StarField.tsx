import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  opacity: number
  speed: number
  color: string
}

interface Comet {
  x: number
  y: number
  angle: number
  speed: number
  length: number
  opacity: number
  active: boolean
  timer: number
  delay: number
}

const STAR_COLORS = ['#ffffff', '#a78bfa', '#06b6d4', '#ec4899', '#e2e8f0']

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const starsRef = useRef<Star[]>([])
  const cometsRef = useRef<Comet[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const COUNT = 280
    const stars: Star[] = []
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random(),
        size: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.12 + 0.02,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })
    }
    starsRef.current = stars

    // Comets - multiple with random delays
    const comets: Comet[] = []
    for (let i = 0; i < 4; i++) {
      comets.push({
        x: 0,
        y: 0,
        angle: -35 * (Math.PI / 180),
        speed: 6 + Math.random() * 4,
        length: 120 + Math.random() * 100,
        opacity: 0,
        active: false,
        timer: 0,
        delay: 3000 + Math.random() * 8000, // random 3-11s between each comet
      })
    }
    cometsRef.current = comets

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    let lastTime = performance.now()

    let isRunning = true

    const draw = (currentTime: number) => {
      if (!isRunning) return
      const dt = currentTime - lastTime
      lastTime = currentTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x / canvas.width - 0.5
      const my = mouseRef.current.y / canvas.height - 0.5

      // Draw stars
      for (const star of starsRef.current) {
        const parallaxX = mx * star.z * 18
        const parallaxY = my * star.z * 18
        const px = star.x + parallaxX
        const py = star.y + parallaxY

        const twinkle = Math.sin(currentTime * 0.001 * star.speed * 3 + star.x) * 0.3 + 0.7

        ctx.beginPath()
        ctx.arc(px, py, star.size, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.opacity * twinkle
        ctx.fill()

        // Glow for larger stars
        if (star.size > 1.2) {
          ctx.beginPath()
          ctx.arc(px, py, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = star.color
          ctx.globalAlpha = star.opacity * twinkle * 0.15
          ctx.fill()
        }

        // Cross sparkle for the biggest stars
        if (star.size > 1.5) {
          const sparkleLen = star.size * 6 * twinkle
          ctx.globalAlpha = star.opacity * twinkle * 0.3
          ctx.strokeStyle = star.color
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(px - sparkleLen, py)
          ctx.lineTo(px + sparkleLen, py)
          ctx.moveTo(px, py - sparkleLen)
          ctx.lineTo(px, py + sparkleLen)
          ctx.stroke()
        }

        ctx.globalAlpha = 1
        star.y += star.speed * 0.15
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      }

      // Draw comets
      for (const comet of cometsRef.current) {
        comet.timer += dt

        if (!comet.active) {
          if (comet.timer >= comet.delay) {
            comet.active = true
            comet.timer = 0
            comet.opacity = 1
            // Spawn at random position along top/right edge
            const edge = Math.random()
            if (edge < 0.6) {
              comet.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.2
              comet.y = -20
            } else {
              comet.x = canvas.width + 20
              comet.y = Math.random() * canvas.height * 0.5
            }
          }
          continue
        }

        // Move comet
        comet.x += Math.cos(comet.angle) * comet.speed
        comet.y -= Math.sin(comet.angle) * comet.speed

        // Fade out when near edges
        if (comet.x < -200 || comet.y > canvas.height + 200) {
          comet.active = false
          comet.timer = 0
          comet.delay = 3000 + Math.random() * 10000
          continue
        }

        // Draw comet head
        const headGrad = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 8)
        headGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        headGrad.addColorStop(0.3, 'rgba(167, 139, 250, 0.8)')
        headGrad.addColorStop(1, 'rgba(167, 139, 250, 0)')
        ctx.globalAlpha = comet.opacity
        ctx.beginPath()
        ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = headGrad
        ctx.fill()

        // Draw comet outer glow
        const outerGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 20)
        outerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.3)')
        outerGlow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(comet.x, comet.y, 20, 0, Math.PI * 2)
        ctx.fillStyle = outerGlow
        ctx.globalAlpha = comet.opacity * 0.5
        ctx.fill()

        // Draw comet trail
        const tailX = comet.x - Math.cos(comet.angle) * comet.length
        const tailY = comet.y + Math.sin(comet.angle) * comet.length
        const trailGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY)
        trailGrad.addColorStop(0, 'rgba(167, 139, 250, 0.8)')
        trailGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.4)')
        trailGrad.addColorStop(1, 'rgba(167, 139, 250, 0)')

        ctx.globalAlpha = comet.opacity * 0.7
        ctx.beginPath()
        ctx.moveTo(comet.x, comet.y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = trailGrad
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw wider faint trail
        ctx.globalAlpha = comet.opacity * 0.15
        ctx.beginPath()
        ctx.moveTo(comet.x, comet.y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = trailGrad
        ctx.lineWidth = 6
        ctx.stroke()

        ctx.globalAlpha = 1
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false
        cancelAnimationFrame(frameRef.current)
      } else {
        if (!isRunning) {
          isRunning = true
          lastTime = performance.now()
          frameRef.current = requestAnimationFrame(draw)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      isRunning = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
