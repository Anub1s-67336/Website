/**
 * TrajectoryGame.jsx — "Баллистика" mini-game
 * Launch a cannonball to hit a target by choosing angle & velocity.
 * Physics: y = x·tan(θ) − g·x²/(2v²·cos²(θ))
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { snd } from '../utils/sound.js'

const G      = 9.8    // m/s²
const CW     = 660    // canvas width
const CH     = 310    // canvas height
const GND    = CH - 50  // ground y in canvas coords
const OX     = 55    // cannon origin x
const SCALE  = 2.4   // pixels per metre

const gs = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
}

// ── Physics helpers ───────────────────────────────────────────────

/** Convert world (m) → canvas pixel coords */
function toCanvas(wx, wy) {
  return { cx: OX + wx * SCALE, cy: GND - wy * SCALE }
}

/** Pre-compute full trajectory as canvas points */
function buildTrajectory(angleDeg, v) {
  const θ = angleDeg * Math.PI / 180
  const pts = []
  const dt  = 0.04
  let t = 0
  while (t < 60) {
    const wx = v * Math.cos(θ) * t
    const wy = v * Math.sin(θ) * t - 0.5 * G * t * t
    pts.push(toCanvas(wx, wy))
    if (wy < 0 && t > 0.1) break
    t += dt
  }
  return pts
}

/** Theoretical range: R = v²·sin(2θ)/g */
function range(angleDeg, v) {
  const θ = angleDeg * Math.PI / 180
  return (v * v * Math.sin(2 * θ)) / G
}

// ── Drawing helpers ───────────────────────────────────────────────

function drawScene(ctx, { angleDeg, target, ballPt, trajectory, result }) {
  // Background sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, CH)
  sky.addColorStop(0, '#060713')
  sky.addColorStop(1, '#0d1232')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CW, CH)

  // Stars (deterministic pseudo-random)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  for (let i = 0; i < 35; i++) {
    const sx = (i * 139 + 23) % CW
    const sy = ((i * 97 + 7) % (GND - 20))
    const r  = i % 5 === 0 ? 1.2 : 0.8
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Ground
  ctx.fillStyle = '#172554'
  ctx.fillRect(0, GND, CW, CH - GND)
  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, GND, CW, 3)

  // ── Cannon ──
  const barrelAngle = angleDeg * Math.PI / 180
  const barrelLen   = 36

  // Carriage (simple rect)
  ctx.fillStyle = '#0e7490'
  ctx.beginPath()
  ctx.roundRect(OX - 22, GND - 22, 44, 22, 4)
  ctx.fill()
  // Wheels
  ctx.fillStyle = '#4fc3f7'
  ;[OX - 12, OX + 10].forEach(wx => {
    ctx.beginPath()
    ctx.arc(wx, GND - 4, 7, 0, Math.PI * 2)
    ctx.fill()
  })
  // Barrel
  ctx.save()
  ctx.translate(OX, GND - 14)
  ctx.rotate(-barrelAngle)
  ctx.fillStyle = '#67e8f9'
  ctx.beginPath()
  ctx.roundRect(0, -6, barrelLen, 12, 3)
  ctx.fill()
  ctx.restore()

  // ── Target ──
  const { cx: tcx, cy: tcy } = toCanvas(target.wx, 0)
  // Pole
  ctx.strokeStyle = 'rgba(251,113,133,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(tcx, GND)
  ctx.lineTo(tcx, tcy - 38)
  ctx.stroke()
  // Bullseye rings
  const tRings = [32, 22, 12]
  const tAlpha = [0.1, 0.18, 0.35]
  tRings.forEach((r, i) => {
    ctx.beginPath()
    ctx.arc(tcx, tcy - 38, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(251,113,133,${tAlpha[i]})`
    ctx.fill()
    ctx.strokeStyle = result === 'hit' ? '#4ade80' : '#fb7185'
    ctx.lineWidth = 1.5
    ctx.stroke()
  })
  // Target centre dot
  ctx.fillStyle = result === 'hit' ? '#4ade80' : '#fb7185'
  ctx.beginPath()
  ctx.arc(tcx, tcy - 38, 5, 0, Math.PI * 2)
  ctx.fill()

  // ── Trajectory ghost path ──
  if (trajectory.length > 1) {
    ctx.save()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = 'rgba(167,139,250,0.45)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    trajectory.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.cx, pt.cy)
      else         ctx.lineTo(pt.cx, pt.cy)
    })
    ctx.stroke()
    ctx.restore()
  }

  // ── Ball ──
  if (ballPt) {
    ctx.save()
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur  = 18
    ctx.fillStyle   = '#fbbf24'
    ctx.beginPath()
    ctx.arc(ballPt.cx, ballPt.cy, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // ── Result overlay ──
  if (result === 'hit') {
    ctx.save()
    ctx.font      = 'bold 22px Nunito, sans-serif'
    ctx.fillStyle = '#4ade80'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#4ade80'
    ctx.shadowBlur  = 12
    ctx.fillText('🎯 ПОПАЛ!', tcx, tcy - 65)
    ctx.restore()
  }
  if (result === 'miss') {
    const lp = trajectory[trajectory.length - 1]
    if (lp) {
      ctx.save()
      ctx.font      = 'bold 16px Nunito, sans-serif'
      ctx.fillStyle = '#f87171'
      ctx.textAlign = 'center'
      ctx.fillText('✗', lp.cx, lp.cy - 14)
      ctx.restore()
    }
  }
}

// ── Component ─────────────────────────────────────────────────────

export function TrajectoryGame({ lang, onBack }) {
  const { addXP, earnAchievement } = useAuth()

  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  const [angle,    setAngle]    = useState(45)
  const [velocity, setVelocity] = useState(30)
  const [target,   setTarget]   = useState(() => ({ wx: 90 + Math.random() * 100 }))
  const [result,   setResult]   = useState(null)   // null | 'hit' | 'miss'
  const [achieved, setAchieved] = useState(false)
  const [launched, setLaunched] = useState(false)

  // Theoretical range
  const theorRange = useMemo(() => range(angle, velocity).toFixed(1), [angle, velocity])

  // Distance to target in metres
  const targetDist = useMemo(() => target.wx.toFixed(0), [target])

  // ── Draw static scene on mount / when angle or target changes ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = CW
    canvas.height = CH
    const ctx = canvas.getContext('2d')
    drawScene(ctx, { angleDeg: angle, target, ballPt: null, trajectory: [], result: null })
  }, [angle, target])

  const newTarget = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    setTarget({ wx: 70 + Math.random() * 130 })
    setResult(null)
    setLaunched(false)
  }, [])

  const launch = useCallback(() => {
    if (animRef.current || launched) return
    snd('click')
    setLaunched(true)
    setResult(null)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const pts = buildTrajectory(angle, velocity)
    if (pts.length < 2) return

    let idx = 0
    const animate = () => {
      idx = Math.min(idx + 4, pts.length - 1)
      const visible = pts.slice(0, idx + 1)
      drawScene(ctx, { angleDeg: angle, target, ballPt: pts[idx], trajectory: visible, result: null })

      if (idx < pts.length - 1) {
        animRef.current = requestAnimationFrame(animate)
        return
      }
      // Animation done — evaluate hit
      animRef.current = null
      const lastPt = pts[pts.length - 1]
      const { cx: tcx } = toCanvas(target.wx, 0)
      const hit = Math.abs(lastPt.cx - tcx) < 28
      const res = hit ? 'hit' : 'miss'
      setResult(res)
      drawScene(ctx, { angleDeg: angle, target, ballPt: lastPt, trajectory: pts, result: res })

      if (hit) {
        snd('win')
        if (!achieved) {
          earnAchievement('phys_trajectory')
          addXP(25)
          setAchieved(true)
        }
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [angle, velocity, target, launched, achieved, earnAchievement, addXP])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 720, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
          }}
        >← Назад</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>
            🎯 Баллистика
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            y = x·tan(θ) − g·x²/(2v²·cos²(θ))
          </p>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ ...gs, padding: 6, marginBottom: 16, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', display: 'block', borderRadius: 14 }}
        />
      </div>

      {/* ── Sliders ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Angle */}
        <div style={{ ...gs, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Угол броска θ</span>
            <span style={{ color: '#a78bfa', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>{angle}°</span>
          </div>
          <input
            type="range" min="5" max="85" value={angle}
            onChange={e => { setAngle(Number(e.target.value)); setResult(null); setLaunched(false) }}
            style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>5°</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>✦ 45° = макс. дальность</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>85°</span>
          </div>
        </div>

        {/* Velocity */}
        <div style={{ ...gs, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Начальная скорость v</span>
            <span style={{ color: '#4fc3f7', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>{velocity} м/с</span>
          </div>
          <input
            type="range" min="10" max="80" value={velocity}
            onChange={e => { setVelocity(Number(e.target.value)); setResult(null); setLaunched(false) }}
            style={{ width: '100%', accentColor: '#4fc3f7', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>10 м/с</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>80 м/с</span>
          </div>
        </div>
      </div>

      {/* ── Action buttons + info ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={launch}
          disabled={launched && !result}
          style={{
            flex: 1, minWidth: 140, padding: '13px 20px', borderRadius: 14,
            border: 'none', cursor: launched && !result ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontWeight: 900, fontSize: 15, transition: 'all .2s',
            background: launched && !result
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg,#7c3aed,#4fc3f7)',
            color: launched && !result ? 'rgba(255,255,255,0.3)' : '#fff',
            boxShadow: launched && !result ? 'none' : '0 0 24px rgba(124,58,237,0.35)',
          }}
        >
          {launched && !result ? '✈ Летит...' : '🚀 Запустить'}
        </button>

        <button
          onClick={newTarget}
          style={{
            flex: 1, minWidth: 140, padding: '13px 20px', borderRadius: 14,
            border: '1px solid rgba(251,191,36,0.25)', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 800, fontSize: 14, transition: 'all .2s',
            background: 'rgba(251,191,36,0.07)', color: '#fbbf24',
          }}
        >
          🎯 Новая цель
        </button>

        {/* Info badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ ...gs, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Цель</div>
            <div style={{ color: '#fb7185', fontWeight: 900, fontSize: 15, fontFamily: 'monospace' }}>{targetDist} м</div>
          </div>
          <div style={{ ...gs, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Дальность R</div>
            <div style={{ color: '#a78bfa', fontWeight: 900, fontSize: 15, fontFamily: 'monospace' }}>{theorRange} м</div>
          </div>
        </div>
      </div>

      {/* ── Result banner ── */}
      {result && (
        <div style={{
          padding: '14px 20px', borderRadius: 14, textAlign: 'center',
          fontWeight: 800, fontSize: 16, marginBottom: 14, transition: 'all .3s',
          background: result === 'hit'
            ? 'linear-gradient(135deg,rgba(74,222,128,0.15),rgba(79,195,247,0.15))'
            : 'rgba(248,113,113,0.1)',
          border: result === 'hit'
            ? '1px solid rgba(74,222,128,0.35)'
            : '1px solid rgba(248,113,113,0.3)',
          color: result === 'hit' ? '#4ade80' : '#f87171',
        }}>
          {result === 'hit'
            ? '🎯 Попал! Отличный расчёт! +25 XP'
            : '❌ Промах! Скорректируй угол или скорость и попробуй снова'}
        </div>
      )}

      {/* ── Physics formula explainer ── */}
      <div style={{ ...gs, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>⚛️</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65 }}>
          <strong style={{ color: '#a78bfa' }}>Профессор Атом:</strong>{' '}
          "Используй формулу дальности <span style={{ fontFamily: 'monospace', color: '#4fc3f7' }}>R = v²·sin(2θ)/g</span>.
          При θ = 45° дальность максимальна! Сейчас R = <strong style={{ color: '#fbbf24' }}>{theorRange} м</strong>,
          цель в <strong style={{ color: '#fb7185' }}>{targetDist} м</strong>.
          {parseFloat(theorRange) > parseFloat(targetDist) * 1.15
            ? ' Уменьши скорость или угол — перелёт!'
            : parseFloat(theorRange) < parseFloat(targetDist) * 0.85
            ? ' Увеличь скорость или выбери угол ближе к 45°!'
            : ' Отлично! Почти точное попадание — жми «Запустить»! 🚀'
          }"
        </div>
      </div>

      {/* Achievement notification */}
      {achieved && (
        <div style={{
          marginTop: 14, padding: '12px 18px', borderRadius: 14, textAlign: 'center',
          background: 'linear-gradient(135deg,rgba(167,139,250,0.15),rgba(79,195,247,0.15))',
          border: '1px solid rgba(167,139,250,0.3)',
          color: '#c4b5fd', fontWeight: 800, fontSize: 14,
        }}>
          🏅 Достижение разблокировано: «Меткий стрелок» +25 XP
        </div>
      )}
    </div>
  )
}
