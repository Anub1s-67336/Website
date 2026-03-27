/**
 * Ballistics.jsx — Physics Activity 3 (Game): Баллистика
 * Canvas API. Cannon on left, target on right.
 * Adjust angle + power → fire → parabolic trajectory.
 * Physics: x(t) = v₀cos(θ)t, y(t) = v₀sin(θ)t − ½gt²
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const GRAVITY = 980   // pixels/s² (scaled)
const FPS     = 60
const DT      = 1 / FPS

export function Ballistics({ lang, setMsg, setHappy, addPts }) {
  const { addXP } = useAuth()
  const canvasRef = useRef(null)
  const stateRef  = useRef({
    projectile: null,
    target: null,
    explosion: null,
    trailPts: [],
    animId: null,
  })
  const [angle,   setAngle]   = useState(45)
  const [power,   setPower]   = useState(55)
  const [score,   setScore]   = useState(0)
  const [hits,    setHits]    = useState(0)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [fired,   setFired]   = useState(false)

  /* ── Random target position ── */
  const newTarget = useCallback((W, H) => ({
    x: W * 0.55 + Math.random() * W * 0.35,
    y: H * 0.25 + Math.random() * (H * 0.55),
    r: 20 + Math.random() * 14,
  }), [])

  /* ── Draw everything ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    /* Background */
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#060a1a')
    sky.addColorStop(1, '#0f172a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    /* Stars */
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 89 + 37) % W)
      const sy = ((i * 71 + 13) % (H * 0.85))
      const br = 0.15 + Math.abs(Math.sin(Date.now() * 0.001 + i)) * 0.35
      ctx.fillStyle = `rgba(255,255,255,${br})`
      ctx.beginPath(); ctx.arc(sx, sy, 0.9, 0, Math.PI * 2); ctx.fill()
    }

    /* Ground */
    const gnd = ctx.createLinearGradient(0, H - 25, 0, H)
    gnd.addColorStop(0, '#1f2937'); gnd.addColorStop(1, '#111827')
    ctx.fillStyle = gnd; ctx.fillRect(0, H - 25, W, 25)
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(0, H - 26, W, 2)

    /* Trajectory preview (dotted arc) */
    if (!fired) {
      const aRad  = (angle * Math.PI) / 180
      const v0    = power * 6
      const vx    = v0 * Math.cos(aRad)
      const vy0   = -v0 * Math.sin(aRad)
      ctx.setLineDash([5, 9])
      ctx.strokeStyle = 'rgba(167,139,250,0.30)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let pathStarted = false
      for (let t = 0; t < 200; t += 1) {
        const dt = t * 0.012
        const px = 65 + vx * dt
        const py = (H - 25) + vy0 * dt + 0.5 * GRAVITY * dt * dt
        if (px > W || py > H - 25) break
        pathStarted ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), pathStarted = true)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    /* Trail */
    if (s.trailPts.length > 1) {
      for (let i = 1; i < s.trailPts.length; i++) {
        const alpha = (i / s.trailPts.length) * 0.55
        const radius = 2 + (i / s.trailPts.length) * 6
        ctx.fillStyle = `rgba(239,68,68,${alpha})`
        ctx.beginPath(); ctx.arc(s.trailPts[i].x, s.trailPts[i].y, radius, 0, Math.PI * 2); ctx.fill()
      }
    }

    /* Cannon */
    const cx = 55, cy = H - 25
    const aRad = (angle * Math.PI) / 180
    ctx.save(); ctx.translate(cx, cy)
    /* wheels */
    ctx.fillStyle = '#374151'
    ;[-15, 10].forEach(dx => {
      ctx.beginPath(); ctx.arc(dx, 0, 10, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke()
    })
    /* body */
    ctx.fillStyle = '#4b5563'
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill()
    /* barrel */
    ctx.rotate(-aRad)
    const barrelGrad = ctx.createLinearGradient(0, -7, 0, 7)
    barrelGrad.addColorStop(0, '#6b7280'); barrelGrad.addColorStop(1, '#374151')
    ctx.fillStyle = barrelGrad
    ctx.beginPath(); ctx.roundRect(0, -7, 48, 14, [0, 6, 6, 0]); ctx.fill()
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1; ctx.stroke()
    ctx.restore()

    /* Target */
    const tgt = s.target
    if (tgt && !s.explosion) {
      const grad = ctx.createRadialGradient(tgt.x - tgt.r * 0.3, tgt.y - tgt.r * 0.3, 0, tgt.x, tgt.y, tgt.r)
      grad.addColorStop(0, '#fde68a'); grad.addColorStop(1, '#b45309')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(tgt.x, tgt.y, tgt.r, 0, Math.PI * 2); ctx.fill()
      /* rings */
      [0.65, 0.35].forEach((f, i) => {
        ctx.strokeStyle = `rgba(255,255,255,${0.4 - i * 0.15})`
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(tgt.x, tgt.y, tgt.r * f, 0, Math.PI * 2); ctx.stroke()
      })
      /* crosshair */
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(tgt.x - tgt.r * 0.55, tgt.y); ctx.lineTo(tgt.x + tgt.r * 0.55, tgt.y)
      ctx.moveTo(tgt.x, tgt.y - tgt.r * 0.55); ctx.lineTo(tgt.x, tgt.y + tgt.r * 0.55)
      ctx.stroke()
      /* distance label */
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(tgt.x - cx)} px`, tgt.x, tgt.y + tgt.r + 14)
    }

    /* Projectile */
    const p = s.projectile
    if (p) {
      const pGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, 9)
      pGrad.addColorStop(0, '#fca5a5'); pGrad.addColorStop(1, '#dc2626')
      ctx.fillStyle = pGrad
      ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255,100,100,0.6)'; ctx.lineWidth = 2; ctx.stroke()
    }

    /* Explosion */
    const ex = s.explosion
    if (ex) {
      const elapsed = (Date.now() - ex.t) / 500
      const tFin = Math.min(elapsed, 1)
      for (let i = 0; i < 12; i++) {
        const a2 = (i / 12) * Math.PI * 2
        const r2 = tFin * 70
        ctx.fillStyle = `rgba(251,191,36,${(1 - tFin) * 0.85})`
        ctx.beginPath(); ctx.arc(ex.x + Math.cos(a2) * r2, ex.y + Math.sin(a2) * r2, 6 * (1 - tFin) + 2, 0, Math.PI * 2); ctx.fill()
      }
      ctx.fillStyle = `rgba(239,68,68,${(1 - tFin) * 0.6})`
      ctx.beginPath(); ctx.arc(ex.x, ex.y, tFin * 45, 0, Math.PI * 2); ctx.fill()
    }
  }, [angle, power, fired])

  /* ── Animation loop ── */
  const animate = useCallback(() => {
    const s = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const H = canvas.height

    if (s.projectile) {
      const p = s.projectile
      p.vy += GRAVITY * DT
      p.x += p.vx * DT
      p.y += p.vy * DT
      s.trailPts.unshift({ x: p.x, y: p.y })
      if (s.trailPts.length > 20) s.trailPts.pop()

      /* Ground hit */
      if (p.y > H - 25) {
        s.projectile = null; s.trailPts = []
        setFired(false)
        setMessage({ text: lang === 'UZ' ? '💨 O\'tkazib yubordingiz! Burchakni sozlang.' : '💨 Мимо! Настрой угол и силу.', type: 'miss' })
      }

      /* Target hit */
      const tgt = s.target
      if (tgt) {
        const dx = p.x - tgt.x, dy = p.y - tgt.y
        if (Math.sqrt(dx * dx + dy * dy) < tgt.r + 9) {
          s.explosion = { x: tgt.x, y: tgt.y, t: Date.now() }
          s.projectile = null; s.trailPts = []
          setFired(false)
          setScore(sc => sc + Math.round(10 + (100 - power) * 0.3))
          setHits(h => h + 1)
          setHappy(true)
          setMessage({ text: lang === 'UZ' ? '🎯 Nishonga tegdi! +10 XP' : '🎯 Попадание! +10 XP', type: 'hit' })
          addXP(10)
          if (canvas) {
            const r = canvas.getBoundingClientRect()
            addPts(r.left + tgt.x * (r.width / canvas.width), r.top + tgt.y * (r.height / canvas.height), '#fbbf24', 16)
          }
          /* New target after delay */
          setTimeout(() => {
            s.explosion = null
            s.target = newTarget(canvas.width, canvas.height)
            draw()
          }, 1200)
        }
      }
    }

    /* Animate explosion */
    if (s.explosion && Date.now() - s.explosion.t > 600) {
      s.explosion = null
    }

    draw()
    s.animId = requestAnimationFrame(animate)
  }, [lang, addXP, setHappy, addPts, newTarget, draw])

  /* ── Fire ── */
  const fire = () => {
    const s = stateRef.current
    const canvas = canvasRef.current
    if (!canvas || (s.projectile)) return
    cancelAnimationFrame(s.animId)

    const aRad = (angle * Math.PI) / 180
    const v0   = power * 6
    const H    = canvas.height

    s.projectile = { x: 55 + Math.cos(aRad) * 48, y: H - 25 - Math.sin(aRad) * 48, vx: v0 * Math.cos(aRad), vy: -v0 * Math.sin(aRad) }
    s.trailPts   = []
    setFired(true)
    setMessage({ text: '', type: 'info' })
    s.animId = requestAnimationFrame(animate)
  }

  /* ── Canvas setup ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      stateRef.current.target = newTarget(canvas.width, canvas.height)
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(stateRef.current.animId) }
  }, [newTarget, draw])

  useEffect(() => { draw() }, [angle, power, draw])

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '💥 Ballistika' : '💥 Баллистика'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Burchak va quvvatni sozlab, nishonga tegiz!' : 'Настрой угол и силу — попади в цель!'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[
          { icon: '🎯', val: `${hits}`, lbl: lang === 'UZ' ? 'Nishonlar' : 'Попаданий', color: '#fbbf24' },
          { icon: '📊', val: `${score}`, lbl: lang === 'UZ' ? 'Ballar' : 'Очки', color: '#a78bfa' },
        ].map(st => (
          <div key={st.lbl} style={{
            padding: '6px 14px', borderRadius: 12,
            background: `${st.color}12`, border: `1px solid ${st.color}35`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{st.icon}</span>
            <span style={{ color: st.color, fontWeight: 900, fontSize: 13 }}>{st.val}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{st.lbl}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: 260, position: 'relative', marginBottom: 14 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <AnimatePresence>
          {message.text && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                padding: '6px 16px', borderRadius: 20,
                background: message.type === 'hit' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.20)',
                border: `1px solid ${message.type === 'hit' ? '#22c55e' : '#ef4444'}55`,
                color: message.type === 'hit' ? '#86efac' : '#fca5a5',
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5 }}>
            📐 {lang === 'UZ' ? `Burchak: ${angle}°` : `Угол: ${angle}°`}
          </label>
          <input type="range" min={5} max={85} value={angle}
            onChange={e => setAngle(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#a78bfa' }} />
        </div>
        <div>
          <label style={{ color: '#fb923c', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5 }}>
            💪 {lang === 'UZ' ? `Quvvat: ${power}%` : `Сила: ${power}%`}
          </label>
          <input type="range" min={15} max={100} value={power}
            onChange={e => setPower(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#fb923c' }} />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
        onClick={fire} disabled={fired}
        style={{
          width: '100%', padding: '12px', borderRadius: 14, cursor: fired ? 'not-allowed' : 'pointer',
          background: fired ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
          border: 'none', color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
          opacity: fired ? 0.5 : 1, transition: 'all 0.2s',
        }}
      >
        {fired ? (lang === 'UZ' ? '⏳ Uchmoqda...' : '⏳ В полёте...') : `🔥 ${lang === 'UZ' ? 'Otish!' : 'Выстрел!'}`}
      </motion.button>

      {/* Formula */}
      <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
        x(t) = v₀·cos(θ)·t &nbsp;|&nbsp; y(t) = v₀·sin(θ)·t − ½·g·t²
      </div>
    </div>
  )
}
