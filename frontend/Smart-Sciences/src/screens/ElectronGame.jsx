/**
 * ElectronGame.jsx — «Охота за Электронами» / «Elektron Ovi»
 *
 * Canvas-based mini-game:
 *   • Electrons (cyan ●) orbit the nucleus — click to catch → +10 score
 *   • Protons (magenta ＋) appear as decoys — click = −1 life
 *   • Speed and proton ratio increase every 200 score points (level up)
 *   • 3 lives total; game ends when lives reach 0
 *   • XP awarded at game end: caught × 5
 *
 * Audio placeholders (replace paths with your own .mp3 files):
 *   /sounds/electron_catch.mp3   — played on catching an electron
 *   /sounds/proton_hit.mp3       — played when hitting a proton
 *   /sounds/game_over.mp3        — played when game ends
 *
 * Integration:
 *   Calls addXP()                 from AuthContext
 *   Calls addMedal('electron_hunter') when 20 electrons caught in one session
 *   Calls incrementQuestProgress('dq_electron', n) when game ends
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { snd } from '../utils/sound.js'

// ── Game configuration ──────────────────────────────────────────
const W          = 500          // canvas side length (square)
const CX         = W / 2        // centre x
const CY         = W / 2        // centre y
const ORBITS     = [75, 142, 212]  // orbital radii in px
const BASE_SPD   = 0.012        // angular speed (rad/frame) at level 1
const SPD_INC    = 0.002        // extra speed added per level
const SPAWN_MS   = 2600         // ms between new particle spawns
const MAX_P      = 18           // max particles on canvas at once
const E_RADIUS   = 11           // electron visual radius
const P_RADIUS   = 12           // proton visual radius
const HIT_PAD    = 7            // extra click hit-radius for usability

let _uid = 0  // unique particle ID counter

function mkParticle(level) {
  const orbitIdx    = Math.floor(Math.random() * ORBITS.length)
  const protonRate  = Math.min(0.10 + level * 0.05, 0.45)
  const type        = Math.random() < protonRate ? 'proton' : 'electron'
  return {
    id:     ++_uid,
    angle:  Math.random() * Math.PI * 2,
    radius: ORBITS[orbitIdx],
    dir:    Math.random() > 0.5 ? 1 : -1,   // CW or CCW
    type,
    size:   type === 'proton' ? P_RADIUS : E_RADIUS,
    flash:  0,   // frames of white flash remaining after click
    _x: CX, _y: CY,              // updated each frame for hit detection
  }
}

// ── Drawing helpers ─────────────────────────────────────────────
function glowCircle(ctx, x, y, r, color, blur, alpha = 1) {
  ctx.save()
  ctx.globalAlpha  = alpha
  ctx.shadowBlur   = blur
  ctx.shadowColor  = color
  ctx.fillStyle    = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawOrbitRing(ctx, r, color) {
  ctx.save()
  ctx.setLineDash([5, 9])
  ctx.strokeStyle = color
  ctx.lineWidth   = 1.5
  ctx.globalAlpha = 0.28
  ctx.shadowBlur  = 10
  ctx.shadowColor = color
  ctx.beginPath()
  ctx.arc(CX, CY, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawNucleus(ctx, pulse) {
  // Soft outer aura
  glowCircle(ctx, CX, CY, 36 + pulse, 'rgba(99,102,241,0.15)', 32, 0.5)
  // Core body
  glowCircle(ctx, CX, CY, 24, '#4f46e5', 24)
  // Bright centre
  glowCircle(ctx, CX, CY, 14, '#818cf8', 18)
  // Atom symbol
  ctx.save()
  ctx.fillStyle    = 'rgba(255,255,255,0.92)'
  ctx.font         = 'bold 13px sans-serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚛', CX, CY)
  ctx.restore()
}

function drawElectron(ctx, x, y, r) {
  glowCircle(ctx, x, y, r, '#22d3ee', 22)
  // White inner dot
  ctx.save()
  ctx.fillStyle = '#e0f7fa'
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawProton(ctx, x, y, r) {
  glowCircle(ctx, x, y, r, '#f472b6', 22)
  // Plus sign
  ctx.save()
  ctx.strokeStyle = '#fce7f3'
  ctx.lineWidth   = 2.5
  ctx.lineCap     = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y)
  ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5)
  ctx.stroke()
  ctx.restore()
}

// ── Component ───────────────────────────────────────────────────
export function ElectronGame({ t, lang }) {
  const { addXP, addMedal, medals, incrementQuestProgress } = useAuth()

  const canvasRef  = useRef(null)
  const rafRef     = useRef(null)
  const gRef       = useRef(null)       // mutable game state (bypasses React renders)
  const spawnRef   = useRef(0)          // timestamp of last particle spawn
  const pulseRef   = useRef(0)          // sine phase for nucleus pulse

  // React state — only what needs to trigger a re-render for the HUD / overlays
  const [phase,    setPhase]    = useState('idle')   // 'idle' | 'playing' | 'over'
  const [score,    setScore]    = useState(0)
  const [lives,    setLives]    = useState(3)
  const [levelNum, setLevelNum] = useState(1)
  const [xpEarned, setXpEarned] = useState(0)
  const [caught,   setCaught]   = useState(0)

  const eg = t.electronGame

  // Draw static idle canvas (nucleus + rings) once on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, W * 0.7)
    bg.addColorStop(0, '#0d0a2e')
    bg.addColorStop(1, '#060713')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, W)
    ORBITS.forEach((r, i) => drawOrbitRing(ctx, r, ['#22d3ee', '#818cf8', '#f472b6'][i]))
    drawNucleus(ctx, 0)
  }, [])

  // ── Start ─────────────────────────────────────────────────────
  function startGame() {
    gRef.current = { particles: [], score: 0, lives: 3, level: 1, caught: 0, running: true }
    spawnRef.current = Date.now() - SPAWN_MS  // force immediate first spawn
    setPhase('playing')
    setScore(0); setLives(3); setLevelNum(1); setXpEarned(0); setCaught(0)
    snd('drop')
  }

  // ── End ───────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    const g = gRef.current
    if (!g) return
    g.running = false
    const earned = g.caught * 5
    setXpEarned(earned)
    setPhase('over')
    if (earned > 0)  addXP(earned)
    if (g.caught > 0) incrementQuestProgress('dq_electron', g.caught)
    if (g.caught >= 20 && !medals.includes('electron_hunter')) addMedal('electron_hunter')
    snd('wrong')
    // TODO: replace with your own game-over audio:
    // new Audio('/sounds/game_over.mp3').play().catch(() => {})
  }, [addXP, addMedal, medals, incrementQuestProgress])

  // ── Game loop ─────────────────────────────────────────────────
  const loop = useCallback(() => {
    const g = gRef.current
    if (!g?.running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    pulseRef.current += 0.045
    const pulse = Math.sin(pulseRef.current) * 5

    // Background radial gradient
    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, W * 0.7)
    bg.addColorStop(0, '#0d0a2e')
    bg.addColorStop(1, '#060713')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, W)

    // Orbit rings
    ORBITS.forEach((r, i) => drawOrbitRing(ctx, r, ['#22d3ee', '#818cf8', '#f472b6'][i]))

    // Nucleus
    drawNucleus(ctx, pulse)

    // Spawn new particle if due
    const now = Date.now()
    if (now - spawnRef.current > SPAWN_MS && g.particles.length < MAX_P) {
      g.particles.push(mkParticle(g.level))
      spawnRef.current = now
    }

    // Update and draw all particles
    g.particles.forEach(p => {
      // Advance angle — faster per level, per-particle random direction
      p.angle += (BASE_SPD + SPD_INC * (g.level - 1)) * p.dir * (1 + (g.level - 1) * 0.1)
      const px = CX + Math.cos(p.angle) * p.radius
      const py = CY + Math.sin(p.angle) * p.radius
      p._x = px; p._y = py

      // White catch flash
      if (p.flash > 0) {
        glowCircle(ctx, px, py, p.size * 2.6, '#ffffff', 28, 0.5)
        p.flash--
      }

      if (p.type === 'electron') {
        drawElectron(ctx, px, py, p.size)
      } else {
        drawProton(ctx, px, py, p.size)
      }
    })

    // Level up check
    const newLevel = Math.floor(g.score / 200) + 1
    if (newLevel !== g.level) {
      g.level = newLevel
      setLevelNum(newLevel)
    }

    // Sync HUD state (batched — React 18 auto-batches these)
    setScore(g.score)
    setLives(g.lives)

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Start / stop animation frame when phase changes
  useEffect(() => {
    if (phase === 'playing') {
      rafRef.current = requestAnimationFrame(loop)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, loop])

  // ── Click / tap handler ───────────────────────────────────────
  const onClick = useCallback(e => {
    const g = gRef.current
    if (!g?.running) return
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    // Scale mouse coords to canvas resolution
    const sx = canvas.width  / rect.width
    const sy = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * sx
    const my = (e.clientY - rect.top)  * sy

    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i]
      if (Math.hypot(mx - p._x, my - p._y) <= p.size + HIT_PAD) {
        p.flash = 5
        if (p.type === 'electron') {
          g.score  += 10
          g.caught += 1
          setCaught(c => c + 1)
          g.particles.splice(i, 1)
          snd('win')
          // TODO: replace with your own audio file:
          // new Audio('/sounds/electron_catch.mp3').play().catch(() => {})
        } else {
          // Hit a proton
          g.lives -= 1
          g.particles.splice(i, 1)
          snd('wrong')
          // TODO: replace with your own audio file:
          // new Audio('/sounds/proton_hit.mp3').play().catch(() => {})
          if (g.lives <= 0) { endGame(); return }
        }
        break
      }
    }
  }, [endGame])

  // ── Shared button style ───────────────────────────────────────
  const btnStyle = {
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    border: 'none', borderRadius: 16,
    padding: '13px 42px', cursor: 'pointer',
    color: '#fff', fontWeight: 800, fontSize: 16,
    fontFamily: "'Nunito', sans-serif",
    boxShadow: '0 0 26px rgba(99,102,241,0.55)',
    transition: 'transform 0.15s',
  }

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <h2 style={{ color: '#e2e8f0', fontWeight: 900, fontSize: 20, margin: '0 0 4px' }}>
        {eg.title}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>
        {eg.sub}
      </p>

      {/* HUD bar */}
      {phase !== 'idle' && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 18px', marginBottom: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
        }}>
          <span style={{ color: '#22d3ee', fontWeight: 800, fontSize: 15 }}>⚡ {score}</span>
          <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13 }}>Lv.{levelNum}</span>
          <span style={{ fontSize: 19 }}>
            {'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, 3 - lives))}
          </span>
        </div>
      )}

      {/* Canvas + overlays */}
      <div style={{ position: 'relative', width: '100%' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={W}
          onClick={onClick}
          style={{
            width: '100%', height: 'auto', display: 'block',
            borderRadius: 22,
            cursor: phase === 'playing' ? 'crosshair' : 'default',
            border: '1.5px solid rgba(129,140,248,0.28)',
            boxShadow: '0 0 50px rgba(99,102,241,0.22)',
          }}
        />

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 22,
            background: 'rgba(6,7,25,0.75)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 54 }}>⚛️</div>
            <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 18 }}>
              {eg.title}
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 13,
              textAlign: 'center', maxWidth: 260, lineHeight: 1.65, margin: 0,
            }}>
              {eg.tip}
            </p>
            <button
              style={btnStyle}
              onClick={startGame}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {eg.start}
            </button>
          </div>
        )}

        {/* Game-over overlay */}
        {phase === 'over' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 22,
            background: 'rgba(6,7,25,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 54 }}>💥</div>
            <div style={{ color: '#f472b6', fontWeight: 900, fontSize: 22 }}>
              {eg.gameOver}
            </div>
            <div style={{ color: '#22d3ee', fontWeight: 700, fontSize: 15 }}>
              {eg.score}: {score}
            </div>
            {caught > 0 && (
              <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 17 }}>
                +{xpEarned} {eg.xpEarned}
              </div>
            )}
            <button
              style={{ ...btnStyle, marginTop: 4 }}
              onClick={startGame}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {eg.restart}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 14, padding: '10px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 12, textAlign: 'center',
        display: 'flex', justifyContent: 'center', gap: 24,
      }}>
        <span>
          <span style={{ color: '#22d3ee', fontSize: 16 }}>●</span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'UZ' ? 'elektron +10' : 'электрон +10'}
          </span>
        </span>
        <span>
          <span style={{ color: '#f472b6', fontSize: 16 }}>●</span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'UZ' ? 'proton −❤️' : 'протон −❤️'}
          </span>
        </span>
      </div>
    </div>
  )
}
