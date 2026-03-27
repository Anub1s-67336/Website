/**
 * DNAHelix.jsx — Biology Activity 2 (Theory): Код ДНК
 * 3D rotating DNA double helix. Drag to rotate.
 * Base pairs: A-T (red-yellow) and G-C (blue-green).
 * Pure CSS 3D transforms + framer-motion.
 */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const PAIRS = [
  { a: 'A', b: 'T', colorA: '#ef4444', colorB: '#fbbf24' },
  { a: 'G', b: 'C', colorA: '#22c55e', colorB: '#3b82f6' },
  { a: 'T', b: 'A', colorA: '#fbbf24', colorB: '#ef4444' },
  { a: 'C', b: 'G', colorA: '#3b82f6', colorB: '#22c55e' },
  { a: 'A', b: 'T', colorA: '#ef4444', colorB: '#fbbf24' },
  { a: 'G', b: 'C', colorA: '#22c55e', colorB: '#3b82f6' },
  { a: 'T', b: 'A', colorA: '#fbbf24', colorB: '#ef4444' },
  { a: 'C', b: 'G', colorA: '#3b82f6', colorB: '#22c55e' },
  { a: 'G', b: 'C', colorA: '#22c55e', colorB: '#3b82f6' },
  { a: 'A', b: 'T', colorA: '#ef4444', colorB: '#fbbf24' },
  { a: 'T', b: 'A', colorA: '#fbbf24', colorB: '#ef4444' },
  { a: 'C', b: 'G', colorA: '#3b82f6', colorB: '#22c55e' },
]

const HELIX_RADIUS = 52
const PITCH = 28  // vertical distance between pairs

export function DNAHelix({ lang, setMsg, setHappy }) {
  const [rotY,    setRotY]    = useState(0)
  const [autoRot, setAutoRot] = useState(true)
  const [selected, setSelected] = useState(null)
  const dragRef  = useRef({ dragging: false, startX: 0, startRotY: 0 })
  const animRef  = useRef(null)

  /* Auto rotate */
  useEffect(() => {
    if (!autoRot) { cancelAnimationFrame(animRef.current); return }
    const loop = () => {
      setRotY(r => (r + 0.5) % 360)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [autoRot])

  /* Drag handlers */
  const onPointerDown = (e) => {
    setAutoRot(false)
    dragRef.current = { dragging: true, startX: e.clientX, startRotY: rotY }
  }
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    setRotY((dragRef.current.startRotY + dx * 0.8) % 360)
  }
  const onPointerUp = () => {
    dragRef.current.dragging = false
    setTimeout(() => setAutoRot(true), 2000)
  }

  useEffect(() => {
    setMsg(lang === 'UZ'
      ? '🧬 DNA spiralini suring yoki bosing — asosiy juftlar haqida ma\'lumot olish uchun!'
      : '🧬 Потяни спираль мышкой — или нажми на пару оснований!')
  }, [lang, setMsg])

  const H = PAIRS.length * PITCH + 40
  const W = 200

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🧬 DNK Kodi' : '🧬 Код ДНК'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Spiralni suring — bazaviy juftlar haqida bilib oling!' : 'Потяни спираль — изучи базовые пары ДНК!'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Helix viewer */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            flex: '0 0 auto', borderRadius: 20, overflow: 'hidden',
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'grab', userSelect: 'none', position: 'relative',
            width: W + 20, height: H + 20,
          }}
        >
          {/* Perspective container */}
          <div style={{
            perspective: '600px', perspectiveOrigin: '50% 50%',
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              transform: `rotateY(${rotY}deg)`,
              transformStyle: 'preserve-3d',
              width: W, height: H,
              position: 'relative',
            }}>
              {PAIRS.map((pair, i) => {
                const angle    = (i / PAIRS.length) * Math.PI * 4  // 2 full turns
                const y        = i * PITCH + 20
                const xL       = W / 2 + Math.cos(angle) * HELIX_RADIUS
                const xR       = W / 2 + Math.cos(angle + Math.PI) * HELIX_RADIUS
                const zL       = Math.sin(angle) * HELIX_RADIUS
                const zR       = Math.sin(angle + Math.PI) * HELIX_RADIUS
                const depthL   = (zL + HELIX_RADIUS) / (HELIX_RADIUS * 2)
                const depthR   = (zR + HELIX_RADIUS) / (HELIX_RADIUS * 2)
                const isSelected = selected === i

                return (
                  <g key={i}>
                    {/* Left backbone node */}
                    <div
                      onClick={() => { setSelected(isSelected ? null : i); setHappy(true) }}
                      style={{
                        position: 'absolute',
                        left: xL - 9, top: y - 9,
                        width: 18, height: 18, borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, ${pair.colorA}dd, ${pair.colorA}66)`,
                        boxShadow: `0 0 ${8 + depthL * 8}px ${pair.colorA}${isSelected ? 'cc' : '55'}`,
                        opacity: 0.4 + depthL * 0.6,
                        display: 'grid', placeItems: 'center',
                        fontSize: 8, fontWeight: 900, color: '#fff',
                        cursor: 'pointer', zIndex: Math.round(depthL * 10),
                        border: isSelected ? `2px solid ${pair.colorA}` : 'none',
                      }}
                    >
                      {pair.a}
                    </div>

                    {/* Right backbone node */}
                    <div
                      onClick={() => { setSelected(isSelected ? null : i); setHappy(true) }}
                      style={{
                        position: 'absolute',
                        left: xR - 9, top: y - 9,
                        width: 18, height: 18, borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, ${pair.colorB}dd, ${pair.colorB}66)`,
                        boxShadow: `0 0 ${8 + depthR * 8}px ${pair.colorB}${isSelected ? 'cc' : '55'}`,
                        opacity: 0.4 + depthR * 0.6,
                        display: 'grid', placeItems: 'center',
                        fontSize: 8, fontWeight: 900, color: '#fff',
                        cursor: 'pointer', zIndex: Math.round(depthR * 10),
                        border: isSelected ? `2px solid ${pair.colorB}` : 'none',
                      }}
                    >
                      {pair.b}
                    </div>

                    {/* Base pair bond */}
                    <svg
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
                    >
                      <line
                        x1={xL} y1={y} x2={xR} y2={y}
                        stroke={isSelected ? pair.colorA : 'rgba(255,255,255,0.15)'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeDasharray={isSelected ? '' : '3 3'}
                      />
                    </svg>

                    {/* Backbone tube (previous pair to this one) */}
                    {i > 0 && (() => {
                      const prevAngle = ((i - 1) / PAIRS.length) * Math.PI * 4
                      const py = (i - 1) * PITCH + 20
                      const pxL = W / 2 + Math.cos(prevAngle) * HELIX_RADIUS
                      const pxR = W / 2 + Math.cos(prevAngle + Math.PI) * HELIX_RADIUS
                      return (
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                          <line x1={pxL} y1={py} x2={xL} y2={y} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                          <line x1={pxR} y1={py} x2={xR} y2={y} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                        </svg>
                      )
                    })()}
                  </g>
                )
              })}
            </div>
          </div>

          {/* Drag hint */}
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
            {autoRot ? (lang === 'UZ' ? '↔ Suring' : '↔ Тяни') : (lang === 'UZ' ? 'Avtomatik aylanish...' : 'Авто-вращение...')}
          </div>
        </div>

        {/* Info panel */}
        <div style={{ flex: 1, minWidth: 140 }}>
          {/* Selected pair info */}
          {selected !== null ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '14px 14px', borderRadius: 16,
                background: `${PAIRS[selected].colorA}12`,
                border: `1.5px solid ${PAIRS[selected].colorA}40`,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 14, color: PAIRS[selected].colorA, marginBottom: 4 }}>
                {PAIRS[selected].a} — {PAIRS[selected].b}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                {PAIRS[selected].a === 'A'
                  ? (lang === 'UZ' ? '🔴 Adenin — Timin: 2 vodorod bog\'i' : '🔴 Аденин — Тимин: 2 водородные связи')
                  : (lang === 'UZ' ? '🟢 Guanin — Citozin: 3 vodorod bog\'i' : '🟢 Гуанин — Цитозин: 3 водородные связи')}
              </div>
            </motion.div>
          ) : null}

          {/* Legend */}
          <div style={{ padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
              {lang === 'UZ' ? 'BAZAVIY JUFTLAR' : 'БАЗОВЫЕ ПАРЫ'}
            </div>
            {[
              { a: 'A', b: 'T', cA: '#ef4444', cB: '#fbbf24', bonds: 2, nameRU: 'Аденин–Тимин',  nameUZ: 'Adenin–Timin' },
              { a: 'G', b: 'C', cA: '#22c55e', cB: '#3b82f6', bonds: 3, nameRU: 'Гуанин–Цитозин', nameUZ: 'Guanin–Citozin' },
            ].map(bp => (
              <div key={bp.a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: bp.cA, flexShrink: 0, fontSize: 9, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900 }}>{bp.a}</div>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg,${bp.cA},${bp.cB})`, borderRadius: 1 }} />
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: bp.cB, flexShrink: 0, fontSize: 9, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900 }}>{bp.b}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>{bp.bonds}H</div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10, marginTop: 4 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {lang === 'UZ'
                  ? '🧬 Inson DNKsida 3 mlrd bazaviy juft bor. Uzunligi ~2 metr!'
                  : '🧬 В ДНК человека ~3 млрд базовых пар. Длина ~2 метра!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
