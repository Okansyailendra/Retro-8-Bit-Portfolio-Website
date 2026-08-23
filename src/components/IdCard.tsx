import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function IdCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [motion, setMotion] = useState({
    dragX: 0,
    dragY: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    ribbonWave: 0,
    holoX: 50,
    holoY: 50,
  })
  const [hasInteracted, setHasInteracted] = useState(false)

  // Physics simulation references
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const rotZRef = useRef(0)
  const rotVelZRef = useRef(0)
  const rotXRef = useRef(0)
  const rotVelXRef = useRef(0)
  const rotYRef = useRef(0)
  const rotVelYRef = useRef(0)
  const wavePhaseRef = useRef(0)

  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    cardX: 0,
    cardY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastTime: 0,
  })

  const isDraggingRef = useRef(false)
  isDraggingRef.current = isDragging
  const animFrameRef = useRef<number | null>(null)

  // Realistic Soft-Cloth & Spring Constants
  const SPRING_K = 0.048 // Snappy spring force
  const DAMPING = 0.925 // Rubbery harmonic oscillations
  const ROT_SPRING_K = 0.045 // Pendulum wobble frequency
  const ROT_DAMPING = 0.91 // Pendulum friction
  const MAX_DRAG_DIST = 260 // Deep pull reach

  // Physics animation loop
  const updatePhysics = useCallback(() => {
    if (!isDraggingRef.current) {
      // 1. Position Spring Physics (Harmonic oscillator towards origin)
      const ax = -SPRING_K * posRef.current.x
      const ay = -SPRING_K * posRef.current.y

      velRef.current.x = (velRef.current.x + ax) * DAMPING
      velRef.current.y = (velRef.current.y + ay) * DAMPING

      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y

      // 2. Rotational Pendulum Spring Physics
      const targetAngleZ = -Math.atan2(posRef.current.x, 150 + posRef.current.y) * (180 / Math.PI) * 0.85
      const torqueZ = -ROT_SPRING_K * (rotZRef.current - targetAngleZ) - velRef.current.x * 0.1
      rotVelZRef.current = (rotVelZRef.current + torqueZ) * ROT_DAMPING
      rotZRef.current += rotVelZRef.current

      // 3D Tilt Oscillations (X & Y axes)
      const targetAngleX = Math.max(-18, Math.min(18, -posRef.current.y * 0.08))
      const torqueX = -0.04 * (rotXRef.current - targetAngleX)
      rotVelXRef.current = (rotVelXRef.current + torqueX) * 0.9
      rotXRef.current += rotVelXRef.current

      const targetAngleY = Math.max(-25, Math.min(25, posRef.current.x * 0.12))
      const torqueY = -0.04 * (rotYRef.current - targetAngleY)
      rotVelYRef.current = (rotVelYRef.current + torqueY) * 0.9
      rotYRef.current += rotVelYRef.current

      // Ribbon wave flutter
      wavePhaseRef.current += 0.22
      const waveVal = Math.sin(wavePhaseRef.current) * (velRef.current.x * 0.45)

      setMotion({
        dragX: posRef.current.x,
        dragY: posRef.current.y,
        rotX: rotXRef.current,
        rotY: rotYRef.current,
        rotZ: rotZRef.current,
        ribbonWave: waveVal,
        holoX: 50 + (posRef.current.x / MAX_DRAG_DIST) * 45,
        holoY: 50 + (posRef.current.y / MAX_DRAG_DIST) * 45,
      })

      // Check if motion has sufficiently decayed
      const isMoving =
        Math.abs(velRef.current.x) > 0.01 ||
        Math.abs(velRef.current.y) > 0.01 ||
        Math.abs(posRef.current.x) > 0.08 ||
        Math.abs(posRef.current.y) > 0.08 ||
        Math.abs(rotVelZRef.current) > 0.015 ||
        Math.abs(rotZRef.current) > 0.08

      if (isMoving) {
        animFrameRef.current = requestAnimationFrame(updatePhysics)
      } else {
        posRef.current = { x: 0, y: 0 }
        velRef.current = { x: 0, y: 0 }
        rotZRef.current = 0
        rotVelZRef.current = 0
        rotXRef.current = 0
        rotYRef.current = 0
        setMotion({
          dragX: 0,
          dragY: 0,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          ribbonWave: 0,
          holoX: 50,
          holoY: 50,
        })
      }
    } else {
      // While dragging: Card tilts towards the direction of pull
      const targetAngleZ = -Math.atan2(posRef.current.x, 150 + posRef.current.y) * (180 / Math.PI) * 0.85
      rotZRef.current = rotZRef.current * 0.65 + targetAngleZ * 0.35

      const targetAngleX = Math.max(-20, Math.min(20, -posRef.current.y * 0.08))
      rotXRef.current = rotXRef.current * 0.65 + targetAngleX * 0.35

      const targetAngleY = Math.max(-25, Math.min(25, posRef.current.x * 0.12))
      rotYRef.current = rotYRef.current * 0.65 + targetAngleY * 0.35

      setMotion({
        dragX: posRef.current.x,
        dragY: posRef.current.y,
        rotX: rotXRef.current,
        rotY: rotYRef.current,
        rotZ: rotZRef.current,
        ribbonWave: 0,
        holoX: 50 + (posRef.current.x / MAX_DRAG_DIST) * 45,
        holoY: 50 + (posRef.current.y / MAX_DRAG_DIST) * 45,
      })

      animFrameRef.current = requestAnimationFrame(updatePhysics)
    }
  }, [])

  // Start dragging handler
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.card-flip-btn')) return

    e.preventDefault()
    setIsDragging(true)
    setHasInteracted(true)

    const now = performance.now()
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      cardX: posRef.current.x,
      cardY: posRef.current.y,
      lastPointerX: e.clientX,
      lastPointerY: e.clientY,
      lastTime: now,
    }

    velRef.current = { x: 0, y: 0 }
    rotVelZRef.current = 0

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(updatePhysics)
  }

  // Pointer move & release handlers
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return

      const now = performance.now()
      const dt = Math.max(1, now - dragStartRef.current.lastTime)

      const rawDx = e.clientX - dragStartRef.current.pointerX
      const rawDy = e.clientY - dragStartRef.current.pointerY

      // Soft rubber-band resistance curve
      const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy)
      const maxDist = MAX_DRAG_DIST
      // Smooth hyperbolic tangent elasticity
      const stretchFactor = dist > 0 ? (maxDist * Math.tanh(dist / (maxDist * 1.15))) / dist : 1

      const newX = dragStartRef.current.cardX + rawDx * stretchFactor
      const newY = dragStartRef.current.cardY + rawDy * stretchFactor

      // Calculate throwing momentum
      const instVx = ((e.clientX - dragStartRef.current.lastPointerX) / dt) * 16
      const instVy = ((e.clientY - dragStartRef.current.lastPointerY) / dt) * 16

      velRef.current = {
        x: velRef.current.x * 0.35 + instVx * 0.65,
        y: velRef.current.y * 0.35 + instVy * 0.65,
      }

      dragStartRef.current.lastPointerX = e.clientX
      dragStartRef.current.lastPointerY = e.clientY
      dragStartRef.current.lastTime = now

      posRef.current.x = newX
      posRef.current.y = newY
    }

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        setIsDragging(false)
        // Clamp release velocity
        velRef.current.x = Math.max(-28, Math.min(28, velRef.current.x))
        velRef.current.y = Math.max(-28, Math.min(28, velRef.current.y))
        rotVelZRef.current = -velRef.current.x * 0.45
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // ═══════ ADVANCED DYNAMIC SOFT-CLOTH LANYARD CALCULATION ═══════
  const { dragX, dragY, rotX, rotY, rotZ, ribbonWave, holoX, holoY } = motion
  const anchorCenterX = 180
  const anchorY = 0

  // Left & right strap anchor points at top
  const leftAnchorX = anchorCenterX - 28
  const rightAnchorX = anchorCenterX + 28

  // Card hook position
  const hookX = anchorCenterX + dragX
  const hookY = 140 + dragY

  // Metal clasp attachment point
  const claspX = hookX
  const claspY = hookY - 42

  // Distance & angle calculations
  const distLeft = Math.hypot(claspX - 8 - leftAnchorX, claspY - anchorY)
  const distRight = Math.hypot(claspX + 8 - rightAnchorX, claspY - anchorY)
  const restLength = 135

  // Natural gravity droop and catenary bow when there is slack
  const slackLeft = Math.max(0, restLength - distLeft) * 0.8
  const slackRight = Math.max(0, restLength - distRight) * 0.8

  // Lateral pull bias:
  const dx = dragX

  // Left strap cubic Bezier control points (Soft Cloth physics)
  const leftCp1X = leftAnchorX - 16 - slackLeft * 0.4 + dx * 0.25 + ribbonWave * 0.6
  const leftCp1Y = anchorY + 45 + slackLeft * 0.9

  const leftCp2X = claspX - 16 - slackLeft * 0.3 + dx * 0.35 - ribbonWave * 0.4
  const leftCp2Y = claspY - 30 + slackLeft * 0.4

  // Right strap cubic Bezier control points (Soft Cloth physics)
  const rightCp1X = rightAnchorX + 16 + slackRight * 0.4 + dx * 0.25 + ribbonWave * 0.6
  const rightCp1Y = anchorY + 45 + slackRight * 0.9

  const rightCp2X = claspX + 16 + slackRight * 0.3 + dx * 0.35 - ribbonWave * 0.4
  const rightCp2Y = claspY - 30 + slackRight * 0.4

  // Dynamic strap thickness with stretch
  const leftWidth = Math.max(16, 21 - Math.max(0, distLeft - restLength) * 0.02)
  const rightWidth = Math.max(16, 21 - Math.max(0, distRight - restLength) * 0.02)

  // Clasp rotation: smooth alignment with tension vector
  const claspAngleRad = Math.atan2(claspY - anchorY, claspX - anchorCenterX)
  const claspAngleDeg = (claspAngleRad * 180) / Math.PI - 90

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '360px',
        maxWidth: '100%',
        height: '670px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        touchAction: 'none',
        perspective: '1200px',
      }}
    >
      {/* ═══════ LANYARD SOFT-CLOTH SVG LAYER ═══════ */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        viewBox="0 0 360 670"
      >
        <defs>
          {/* Lanyard strap deep gradient */}
          <linearGradient id="lanyardRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#080d26" />
            <stop offset="25%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#312e81" />
            <stop offset="85%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#080d26" />
          </linearGradient>

          {/* Neon outer edge glow */}
          <linearGradient id="lanyardNeonEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Metallic chrome shine */}
          <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#cbd5e1" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Dark metallic hardware */}
          <linearGradient id="metalDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Soft Cloth Drop Shadow */}
          <filter id="ribbonShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="rgba(0,0,0,0.6)" />
          </filter>

          {/* Metal Clip Shadow */}
          <filter id="claspShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="rgba(0,0,0,0.8)" />
          </filter>

          {/* High-tech fabric texture pattern */}
          <pattern id="clothWeave" width="12" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="6" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
            <line x1="6" y1="6" x2="12" y2="0" stroke="rgba(167,139,250,0.4)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* ── Top Ceiling Anchor Bracket ── */}
        <g transform={`translate(${anchorCenterX}, 0)`}>
          <rect x="-44" y="-12" width="88" height="18" rx="5" fill="url(#metalDark)" />
          <rect x="-38" y="-10" width="76" height="4" rx="2" fill="url(#metalChrome)" />
          <circle cx="-26" cy="0" r="3" fill="#06b6d4" />
          <circle cx="26" cy="0" r="3" fill="#7c3aed" />
        </g>

        {/* ── LEFT LANYARD STRAP (Cubic Bezier Soft Cloth) ── */}
        <g filter="url(#ribbonShadow)">
          {/* Main fabric body */}
          <path
            d={`M ${leftAnchorX} 0 C ${leftCp1X} ${leftCp1Y}, ${leftCp2X} ${leftCp2Y}, ${claspX - 8} ${claspY}`}
            fill="none"
            stroke="url(#lanyardRibbonGrad)"
            strokeWidth={leftWidth}
            strokeLinecap="round"
          />
          {/* Weave pattern overlay */}
          <path
            d={`M ${leftAnchorX} 0 C ${leftCp1X} ${leftCp1Y}, ${leftCp2X} ${leftCp2Y}, ${claspX - 8} ${claspY}`}
            fill="none"
            stroke="url(#clothWeave)"
            strokeWidth={leftWidth - 2}
            strokeLinecap="round"
          />
          {/* Outer edge piping */}
          <path
            d={`M ${leftAnchorX - 9} 0 C ${leftCp1X - 9} ${leftCp1Y}, ${leftCp2X - 9} ${leftCp2Y}, ${claspX - 17} ${claspY}`}
            fill="none"
            stroke="url(#lanyardNeonEdge)"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d={`M ${leftAnchorX + 9} 0 C ${leftCp1X + 9} ${leftCp1Y}, ${leftCp2X + 9} ${leftCp2Y}, ${claspX + 1} ${claspY}`}
            fill="none"
            stroke="url(#lanyardNeonEdge)"
            strokeWidth="1.2"
            opacity="0.5"
          />
        </g>

        {/* ── RIGHT LANYARD STRAP (Cubic Bezier Soft Cloth) ── */}
        <g filter="url(#ribbonShadow)">
          {/* Main fabric body */}
          <path
            d={`M ${rightAnchorX} 0 C ${rightCp1X} ${rightCp1Y}, ${rightCp2X} ${rightCp2Y}, ${claspX + 8} ${claspY}`}
            fill="none"
            stroke="url(#lanyardRibbonGrad)"
            strokeWidth={rightWidth}
            strokeLinecap="round"
          />
          {/* Weave pattern overlay */}
          <path
            d={`M ${rightAnchorX} 0 C ${rightCp1X} ${rightCp1Y}, ${rightCp2X} ${rightCp2Y}, ${claspX + 8} ${claspY}`}
            fill="none"
            stroke="url(#clothWeave)"
            strokeWidth={rightWidth - 2}
            strokeLinecap="round"
          />
          {/* Outer edge piping */}
          <path
            d={`M ${rightAnchorX + 9} 0 C ${rightCp1X + 9} ${rightCp1Y}, ${rightCp2X + 9} ${rightCp2Y}, ${claspX + 17} ${claspY}`}
            fill="none"
            stroke="url(#lanyardNeonEdge)"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d={`M ${rightAnchorX - 9} 0 C ${rightCp1X - 9} ${rightCp1Y}, ${rightCp2X - 9} ${rightCp2Y}, ${claspX - 1} ${claspY}`}
            fill="none"
            stroke="url(#lanyardNeonEdge)"
            strokeWidth="1.2"
            opacity="0.5"
          />
        </g>

        {/* ── Lanyard Crimp Clamp / Metal Ring Joiner ── */}
        <g transform={`translate(${claspX}, ${claspY}) rotate(${claspAngleDeg * 0.6})`} filter="url(#claspShadow)">
          <rect x="-16" y="-7" width="32" height="14" rx="3.5" fill="url(#metalChrome)" />
          <rect x="-14" y="-5" width="28" height="2" fill="#ffffff" />
          <rect x="-14" y="2" width="28" height="2" fill="rgba(15,23,42,0.8)" />
          <circle cx="0" cy="0" r="2.5" fill="#06b6d4" />
        </g>

        {/* ── Metallic Swivel Carabiner Hook ── */}
        <g transform={`translate(${claspX}, ${claspY + 12}) rotate(${claspAngleDeg})`} filter="url(#claspShadow)">
          {/* Top Swivel Ring */}
          <ellipse cx="0" cy="0" rx="9" ry="6" fill="none" stroke="url(#metalChrome)" strokeWidth="3.5" />

          {/* Swivel Pivot Body */}
          <rect x="-5.5" y="4" width="11" height="9" rx="2" fill="url(#metalDark)" />
          <rect x="-4.5" y="5" width="9" height="7" rx="1.5" fill="url(#metalChrome)" />

          {/* Carabiner Hook Body */}
          <path
            d="M -6 13 C -6 13, -9 24, -3 32 C 0 36, 4 36, 6 32 C 8 28, 8 22, 6 18 L 4 18 C 5 21, 5 26, 3 28 C 1 30, -1 30, -3 27 C -5 22, -3 15, -3 13 Z"
            fill="url(#metalChrome)"
          />

          {/* Spring gate latch */}
          <line x1="-3" y1="15" x2="3" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-3" cy="15" r="2" fill="#94a3b8" />

          {/* Bottom hook loop through badge slot */}
          <ellipse cx="0" cy="30" rx="5" ry="3.5" fill="none" stroke="url(#metalChrome)" strokeWidth="3" />
          <circle cx="-2" cy="29" r="1.2" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>

      {/* ═══════ DRAGGABLE 3D ID CARD HOLDER ═══════ */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'absolute',
          top: 140,
          transform: `translate3d(${dragX}px, ${dragY}px, 0) rotateZ(${rotZ}deg) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformOrigin: '50% 0%',
          transition: isDragging ? 'none' : 'transform 0.04s linear',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 20,
          width: '320px',
          height: '465px',
          animation: !isDragging && !hasInteracted ? 'gentleCardSway 6s ease-in-out infinite' : 'none',
          perspective: '1200px',
          touchAction: 'none',
        }}
      >
        {/* ── 3D Rotator Wrapper ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ═══════ CARD FRONT SIDE ═══════ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(124,58,237,0.12) 100%)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              boxShadow: `
                0 20px 40px -10px rgba(0,0,0,0.7),
                0 0 25px rgba(6,182,212,0.2),
                0 0 50px rgba(124,58,237,0.15),
                inset 0 1px 2px rgba(255,255,255,0.4),
                inset 0 -1px 2px rgba(0,0,0,0.5)
              `,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              zIndex: isFlipped ? 1 : 2,
            }}
          >
            {/* Top Hang Slot Punch Hole */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '42px',
                height: '8px',
                borderRadius: '5px',
                background: 'rgba(5,5,26,0.95)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
                zIndex: 30,
              }}
            />

            {/* Inner Content Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#070b1e',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
              }}
            >
              {/* Dynamic Holographic Foil Glare Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at ${holoX}% ${holoY}%, rgba(255,255,255,0.28) 0%, rgba(6,182,212,0.18) 30%, rgba(236,72,153,0.12) 60%, transparent 80%)`,
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                  zIndex: 20,
                  transition: 'background 0.05s ease-out',
                }}
              />

              {/* Background Graphic Waves & Cyber Tech Matrix */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
                viewBox="0 0 296 441"
              >
                <defs>
                  <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="50%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                <rect width="296" height="441" fill="#070b1e" />

                {/* Fluid Curved Waves */}
                <path
                  d="M 0 0 L 296 0 L 296 140 C 240 160 190 120 120 150 C 60 175 20 155 0 170 Z"
                  fill="url(#waveGrad1)"
                />
                <path
                  d="M 0 0 L 200 0 C 170 60 100 80 0 100 Z"
                  fill="url(#waveGrad2)"
                  opacity="0.6"
                />
                <path
                  d="M 0 320 C 60 300 120 340 180 320 C 240 300 280 325 296 315 L 296 441 L 0 441 Z"
                  fill="url(#waveGrad1)"
                />
                <path
                  d="M 0 380 C 80 360 160 400 296 350 L 296 441 L 0 441 Z"
                  fill="url(#waveGrad2)"
                  opacity="0.7"
                />
                <path
                  d="M 0 415 C 100 400 200 425 296 405 L 296 441 L 0 441 Z"
                  fill="#38bdf8"
                  opacity="0.4"
                />

                {/* Cyber Matrix Dots Grid (Top Right) */}
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3].map((col) => (
                    <circle
                      key={`dot-tr-${row}-${col}`}
                      cx={230 + col * 12}
                      cy={36 + row * 10}
                      r="1.8"
                      fill={row === 0 || col === 3 ? '#38bdf8' : '#facc15'}
                      opacity="0.85"
                    />
                  ))
                )}

                {/* Cyber Matrix Dots Grid (Bottom Right) */}
                {[0, 1, 2].map((row) =>
                  [0, 1, 2, 3].map((col) => (
                    <circle
                      key={`dot-br-${row}-${col}`}
                      cx={230 + col * 12}
                      cy={390 + row * 10}
                      r="1.8"
                      fill="#38bdf8"
                      opacity="0.75"
                    />
                  ))
                )}

                {/* Left Accent Neon Bar */}
                <rect x="14" y="28" width="4" height="28" rx="2" fill="#facc15" />
                <rect x="282" y="325" width="4" height="35" rx="2" fill="#facc15" />
              </svg>

              {/* ── CARD FRONT HEADER ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '24px 18px 0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 12px rgba(6,182,212,0.5)',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    <span style={{ fontSize: '1rem', color: '#ffffff' }}>✦</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        color: '#ffffff',
                        textShadow: '0 0 10px rgba(6,182,212,0.6)',
                      }}
                    >
                      KANNZ<span style={{ color: '#38bdf8' }}>.DEV</span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.5rem',
                        letterSpacing: '0.2em',
                        color: '#94a3b8',
                      }}
                    >
                      DEV PASS // 2026
                    </div>
                  </div>
                </div>

                {/* Status Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(5,5,26,0.7)',
                    border: '1px solid rgba(74,222,128,0.4)',
                    borderRadius: '12px',
                    padding: '3px 8px',
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      color: '#4ade80',
                      letterSpacing: '0.08em',
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* ── CARD FRONT PHOTO (Large Rounded Rectangle matching Mockup) ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '4px 16px',
                }}
              >
                {/* Mockup-style Accent Outer Frame */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '215px',
                    borderRadius: '16px',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Mockup Accent Geometry Tabs (Orange / Neon Cyber Brackets) */}
                  {/* Top-Right Accent Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '70px',
                      height: '70px',
                      borderTop: '5px solid #f97316',
                      borderRight: '5px solid #f97316',
                      borderTopRightRadius: '18px',
                      boxShadow: '0 0 15px rgba(249,115,22,0.6)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />

                  {/* Left Side Tab Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '50px',
                      borderRadius: '4px',
                      background: 'linear-gradient(180deg, #f97316, #ea580c)',
                      boxShadow: '0 0 12px rgba(249,115,22,0.6)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />

                  {/* Right Side Tab Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '50px',
                      borderRadius: '4px',
                      background: 'linear-gradient(180deg, #f97316, #ea580c)',
                      boxShadow: '0 0 12px rgba(249,115,22,0.6)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />

                  {/* Bottom-Left Accent Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '-5px',
                      width: '45px',
                      height: '45px',
                      borderBottom: '4px solid #f97316',
                      borderLeft: '4px solid #f97316',
                      borderBottomLeftRadius: '18px',
                      boxShadow: '0 0 12px rgba(249,115,22,0.5)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />

                  {/* Photo Frame Container */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: '#0b102b',
                      border: '2px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.5)',
                      position: 'relative',
                    }}
                  >
                    <img
                      src="/foto.webp"
                      alt="Okan Syailendra"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 15%',
                        display: 'block',
                      }}
                    />

                    {/* Subtle Hologram & Scanline Effect */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 60%, rgba(5,5,26,0.5) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Photo Corner Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(7, 11, 30, 0.85)',
                        border: '1px solid rgba(249,115,22,0.6)',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem' }}>🚀</span>
                      <span
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '0.45rem',
                          color: '#f97316',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        DEV // LVL 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CARD FRONT FOOTER (Name, Title & Mockup Barcode) ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '6px 18px 18px 18px',
                }}
              >
                {/* Name & Role Row */}
                <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                      margin: '0 0 2px 0',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(249,115,22,0.4)',
                    }}
                  >
                    Okan Syailendra
                  </h3>

                  <div
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      textShadow: '0 0 8px rgba(56,189,248,0.6)',
                    }}
                  >
                    SOFTWARE DEVELOPER
                  </div>
                </div>

                {/* Bottom Barcode & Metadata (matching Mockup layout) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    background: 'rgba(5, 5, 26, 0.75)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {/* Mockup-style Barcode on Bottom-Left */}
                  <div>
                    <svg width="78" height="18" viewBox="0 0 78 18">
                      <rect x="0" y="0" width="2" height="18" fill="#f97316" />
                      <rect x="4" y="0" width="1" height="18" fill="#ffffff" />
                      <rect x="7" y="0" width="3" height="18" fill="#38bdf8" />
                      <rect x="12" y="0" width="1" height="18" fill="#ffffff" />
                      <rect x="15" y="0" width="4" height="18" fill="#f97316" />
                      <rect x="21" y="0" width="2" height="18" fill="#ffffff" />
                      <rect x="25" y="0" width="1" height="18" fill="#38bdf8" />
                      <rect x="28" y="0" width="3" height="18" fill="#ffffff" />
                      <rect x="33" y="0" width="2" height="18" fill="#f97316" />
                      <rect x="37" y="0" width="4" height="18" fill="#ffffff" />
                      <rect x="43" y="0" width="1" height="18" fill="#38bdf8" />
                      <rect x="46" y="0" width="2" height="18" fill="#ffffff" />
                      <rect x="50" y="0" width="3" height="18" fill="#f97316" />
                      <rect x="55" y="0" width="2" height="18" fill="#ffffff" />
                      <rect x="59" y="0" width="1" height="18" fill="#38bdf8" />
                      <rect x="62" y="0" width="4" height="18" fill="#ffffff" />
                      <rect x="68" y="0" width="2" height="18" fill="#f97316" />
                      <rect x="72" y="0" width="3" height="18" fill="#ffffff" />
                      <rect x="76" y="0" width="2" height="18" fill="#38bdf8" />
                    </svg>
                    <div style={{ fontSize: '0.42rem', color: '#94a3b8', fontFamily: 'Orbitron, sans-serif' }}>
                      #KD-2026-X
                    </div>
                  </div>

                  {/* Security Level / Status */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.42rem', color: '#94a3b8', fontFamily: 'Orbitron, sans-serif' }}>AUTHENTICATED</div>
                    <div style={{ fontSize: '0.62rem', color: '#4ade80', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                      SECURITY LVL 5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ CARD BACK SIDE (3D Flip View) ═══════ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(124,58,237,0.12) 100%)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              boxShadow: `
                0 20px 40px -10px rgba(0,0,0,0.7),
                0 0 25px rgba(6,182,212,0.2),
                0 0 50px rgba(124,58,237,0.15),
                inset 0 1px 2px rgba(255,255,255,0.4),
                inset 0 -1px 2px rgba(0,0,0,0.5)
              `,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              zIndex: isFlipped ? 2 : 1,
            }}
          >
            {/* Top Hang Slot Punch Hole */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '42px',
                height: '8px',
                borderRadius: '5px',
                background: 'rgba(5,5,26,0.95)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
                zIndex: 30,
              }}
            />

            {/* Inner Content Card (Back) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#070b1e',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                padding: '24px 18px 18px 18px',
              }}
            >
              {/* Background Graphic Waves for Back Side */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
                viewBox="0 0 296 441"
              >
                <path
                  d="M 0 0 L 296 0 L 296 100 C 210 130 120 80 0 120 Z"
                  fill="url(#waveGrad1)"
                />
                <path
                  d="M 0 0 L 150 0 C 110 50 60 70 0 80 Z"
                  fill="url(#waveGrad2)"
                  opacity="0.5"
                />
                <path
                  d="M 0 350 C 70 330 160 370 296 330 L 296 441 L 0 441 Z"
                  fill="url(#waveGrad1)"
                />
                <path
                  d="M 0 390 C 90 380 180 410 296 380 L 296 441 L 0 441 Z"
                  fill="url(#waveGrad2)"
                  opacity="0.7"
                />

                {/* Dots Pattern on Back */}
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3].map((col) => (
                    <circle
                      key={`back-dot-${row}-${col}`}
                      cx={230 + col * 12}
                      cy={35 + row * 10}
                      r="1.8"
                      fill={row === 0 || col === 3 ? '#38bdf8' : '#facc15'}
                      opacity="0.85"
                    />
                  ))
                )}
              </svg>

              {/* ── BACK HEADER ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>✦</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: '#ffffff',
                      }}
                    >
                      KANNZ<span style={{ color: '#38bdf8' }}>.DEV</span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.45rem',
                        letterSpacing: '0.15em',
                        color: '#94a3b8',
                      }}
                    >
                      OFFICIAL CREDENTIAL
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BACK CONTACT INFO LIST ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  margin: '4px 0',
                }}
              >
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/okan_syailendra0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'linear-gradient(90deg, rgba(236,72,153,0.18) 0%, rgba(124,58,237,0.18) 100%)',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(236,72,153,0.4)',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f472b6'
                    e.currentTarget.style.boxShadow = '0 0 14px rgba(236,72,153,0.4)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(236,72,153,0.4)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      boxShadow: '0 0 8px rgba(236,72,153,0.6)',
                    }}
                  >
                    📸
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', color: '#f472b6', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                      INSTAGRAM PROFILE ↗
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#fdf2f8', fontWeight: 700, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @okan_syailendra0
                    </div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:otansyailendra123@gmail.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56,189,248,0.6)'
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(6,182,212,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(6,182,212,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✉️
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.45rem', color: '#94a3b8', fontFamily: 'Orbitron, sans-serif' }}>EMAIL TRANSMISSION ↗</div>
                    <div style={{ fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      otansyailendra123@gmail.com
                    </div>
                  </div>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Okansyailendra"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(124,58,237,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a78bfa',
                      fontSize: '0.75rem',
                    }}
                  >
                    🐙
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.45rem', color: '#94a3b8', fontFamily: 'Orbitron, sans-serif' }}>GITHUB REPOSITORY</div>
                    <div style={{ fontSize: '0.68rem', color: '#e2e8f0', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      github.com/Okansyailendra
                    </div>
                  </div>
                </a>
              </div>

              {/* Mission Statement */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.6rem',
                  color: '#cbd5e1',
                  lineHeight: 1.45,
                  textAlign: 'center',
                  padding: '5px 8px',
                  borderTop: '1px dashed rgba(255,255,255,0.12)',
                  borderBottom: '1px dashed rgba(255,255,255,0.12)',
                }}
              >
                "Mengembangkan solusi perangkat lunak modern, performa tinggi, dan antarmuka web interaktif."
              </div>

              {/* ── BACK FOOTER (Scannable Instagram QR Code & Barcode) ── */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginTop: '2px',
                }}
              >
                {/* Real Scannable Instagram QR Code */}
                <a
                  href="https://www.instagram.com/okan_syailendra0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Scan atau Klik untuk Buka Instagram @okan_syailendra0"
                  style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
                    padding: '3px',
                    borderRadius: '8px',
                    boxShadow: '0 0 16px rgba(236,72,153,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 0 22px rgba(236,72,153,0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 0 16px rgba(236,72,153,0.35)'
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '5px',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fwww.instagram.com%2Fokan_syailendra0%2F&color=070b1e&bgcolor=ffffff&margin=1"
                      alt="Instagram QR Code @okan_syailendra0"
                      style={{
                        width: '46px',
                        height: '46px',
                        display: 'block',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.42rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '0.08em',
                      marginTop: '2px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    SCAN / TAP IG
                  </div>
                </a>

                {/* Barcode & Signature */}
                <a
                  href="https://www.instagram.com/okan_syailendra0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.45rem', color: '#f472b6', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                    INSTAGRAM VERIFIED PASS
                  </div>
                  <svg width="88" height="22" viewBox="0 0 88 22" style={{ margin: '2px 0' }}>
                    <rect x="0" y="0" width="2" height="22" fill="#ec4899" />
                    <rect x="4" y="0" width="1" height="22" fill="#ffffff" />
                    <rect x="7" y="0" width="3" height="22" fill="#38bdf8" />
                    <rect x="12" y="0" width="1" height="22" fill="#ffffff" />
                    <rect x="15" y="0" width="4" height="22" fill="#ec4899" />
                    <rect x="21" y="0" width="2" height="22" fill="#ffffff" />
                    <rect x="25" y="0" width="1" height="22" fill="#38bdf8" />
                    <rect x="28" y="0" width="3" height="22" fill="#ffffff" />
                    <rect x="33" y="0" width="2" height="22" fill="#ec4899" />
                    <rect x="37" y="0" width="4" height="22" fill="#ffffff" />
                    <rect x="43" y="0" width="1" height="22" fill="#38bdf8" />
                    <rect x="46" y="0" width="2" height="22" fill="#ffffff" />
                    <rect x="50" y="0" width="3" height="22" fill="#ec4899" />
                    <rect x="55" y="0" width="2" height="22" fill="#ffffff" />
                    <rect x="59" y="0" width="1" height="22" fill="#38bdf8" />
                    <rect x="62" y="0" width="4" height="22" fill="#ffffff" />
                    <rect x="68" y="0" width="2" height="22" fill="#ec4899" />
                    <rect x="72" y="0" width="3" height="22" fill="#ffffff" />
                    <rect x="77" y="0" width="1" height="22" fill="#38bdf8" />
                    <rect x="80" y="0" width="3" height="22" fill="#ffffff" />
                    <rect x="85" y="0" width="2" height="22" fill="#ec4899" />
                  </svg>
                  <div style={{ fontSize: '0.45rem', color: '#38bdf8', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em' }}>
                    @OKAN_SYAILENDRA0
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ INTERACTIVE CONTROL & PROMPT BADGES ═══════ */}
        {/* Flip Card Button */}
        <button
          className="card-flip-btn"
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped((f) => !f)
            setHasInteracted(true)
          }}
          style={{
            position: 'absolute',
            bottom: '-44px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(6,182,212,0.45)',
            color: '#38bdf8',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5), 0 0 12px rgba(6,182,212,0.25)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(6,182,212,0.25)'
            e.currentTarget.style.borderColor = '#38bdf8'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'
            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5), 0 0 12px rgba(6,182,212,0.25)'
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>🔄</span>
          <span>{isFlipped ? 'Lihat Tampak Depan' : 'Lihat Tampak Belakang'}</span>
        </button>

        {/* Drag Hint Tooltip */}
        {!hasInteracted && (
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(124,58,237,0.9)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.65rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.06em',
              boxShadow: '0 0 15px rgba(124,58,237,0.5)',
              pointerEvents: 'none',
              animation: 'bounceSway 2s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>✨</span>
            <span>Tarik / Drag ID Card Ini</span>
            <span>👇</span>
          </div>
        )}
      </div>
    </div>
  )
}
