import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { ORGAN_POS } from '../data/constants.js'
import { snd }       from '../utils/sound.js'

export function BodyScreen({ t, setMsg, setHappy, addPts }) {
  const { addMedal, medals, incrementQuestProgress } = useAuth()
  const [sel,      setSel]      = useState(null)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => { setMsg(t.prof.body) }, [t])

  const click = (id, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    // Particle burst in each organ's own color
    addPts(r.left + r.width / 2, r.top + r.height / 2, ORGAN_POS[id].col)
    snd(t.organs[id].snd)
    setSel(id)
    setSpeaking(true)
    setMsg(`${t.organs[id].name}: ${t.organs[id].info}`)
    setTimeout(() => setSpeaking(false), 3500)
    if (!medals.includes('body1')) addMedal('body1')
    incrementQuestProgress('dq_visit')
  }

  const active = sel ? ORGAN_POS[sel] : null

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.bodyTitle}</h2>
      <p  style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>{t.bodySub}</p>

      {/* ── Body canvas ────────────────────────────────────────── */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto 16px',
        aspectRatio: '0.62',
        background: 'linear-gradient(160deg,rgba(20,8,50,0.92),rgba(6,12,46,0.92))',
        borderRadius: 24,
        border: `1px solid ${active ? active.col + '55' : 'rgba(167,139,250,0.2)'}`,
        overflow: 'hidden',
        transition: 'border-color .4s',
      }}>

        {/* ── Human silhouette SVG ───────────────────────────── */}
        {/*
          viewBox 0 0 100 162 — same aspect ratio as the container (0.62).
          The SVG stretches to fill the container exactly, so percentage
          positions on overlaid buttons map 1-to-1 with the drawing.
        */}
        <svg
          viewBox="0 0 100 162"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}
        >
          {/* Head */}
          <ellipse cx="50" cy="11" rx="11" ry="10.5" fill="#818cf8" />
          {/* Neck */}
          <rect x="46" y="21" width="8" height="5" rx="2" fill="#7c3aed" />
          {/* Collar-bone hint */}
          <path d="M38 25 Q50 23 62 25" stroke="#a78bfa" strokeWidth="1.3" fill="none" opacity="0.7" />
          {/* Torso — tapered trapezoid: wide shoulders → narrower waist */}
          <path
            d="M29 26 L71 26 C74 26 75 29 75 32
               L73 59 C73 62 70 63 67 63
               L33 63 C30 63 27 62 27 59
               L25 32 C25 29 26 26 29 26 Z"
            fill="#6d28d9"
          />
          {/* Sternum / ribcage lines */}
          <line x1="50" y1="26" x2="50" y2="56" stroke="#a78bfa" strokeWidth="0.7" opacity="0.4" />
          <path d="M40 34 Q50 31 60 34" stroke="#a78bfa" strokeWidth="0.7" fill="none" opacity="0.35" />
          <path d="M39 41 Q50 38 61 41" stroke="#a78bfa" strokeWidth="0.7" fill="none" opacity="0.35" />
          <path d="M38 48 Q50 45 62 48" stroke="#a78bfa" strokeWidth="0.7" fill="none" opacity="0.35" />
          {/* Hip region */}
          <path
            d="M27 59 C25 64 27 69 32 69 L68 69 C73 69 75 64 73 59 Z"
            fill="#7c3aed"
          />
          {/* Left arm */}
          <path d="M29 29 L15 34 L13 60 L21 62 L23 38 L28 30 Z" fill="#7c3aed" />
          {/* Right arm */}
          <path d="M71 29 L85 34 L87 60 L79 62 L77 38 L72 30 Z" fill="#7c3aed" />
          {/* Left thigh */}
          <rect x="30" y="68" width="17" height="41" rx="7" fill="#7c3aed" />
          {/* Right thigh */}
          <rect x="53" y="68" width="17" height="41" rx="7" fill="#7c3aed" />
          {/* Left shin */}
          <rect x="31" y="107" width="15" height="30" rx="5" fill="#6d28d9" />
          {/* Right shin */}
          <rect x="54" y="107" width="15" height="30" rx="5" fill="#6d28d9" />
          {/* Left foot */}
          <ellipse cx="40" cy="139" rx="11" ry="4" fill="#7c3aed" />
          {/* Right foot */}
          <ellipse cx="61" cy="139" rx="11" ry="4" fill="#7c3aed" />
        </svg>

        {/* ── Clickable organ buttons ────────────────────────── */}
        {Object.entries(ORGAN_POS).map(([id, op]) => {
          const isActive = sel === id
          return (
            <button
              key={id}
              onClick={(e) => click(id, e)}
              title={t.organs[id].name}
              style={{
                position: 'absolute',
                left: `${op.x}%`, top: `${op.y}%`,
                width: `${op.w}%`, height: `${op.h}%`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1,
                fontSize: 'clamp(11px, 2.5vw, 18px)',
                background: isActive
                  ? `${op.col}30`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? op.col : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 18px ${op.col}88, inset 0 0 8px ${op.col}22` : 'none',
                animation: isActive ? 'organPulse 1.2s ease-in-out infinite' : 'none',
                transition: 'all .22s',
              }}
            >
              <span style={{ lineHeight: 1 }}>{op.emoji}</span>
            </button>
          )
        })}
      </div>

      {/* ── Info panel (color-coded per organ) ──────────────────── */}
      {sel && (
        <div style={{
          padding: '14px 16px', borderRadius: 16,
          background: `${ORGAN_POS[sel].col}14`,
          border: `1px solid ${ORGAN_POS[sel].col}50`,
          animation: 'fadeUp .3s ease',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 22,
              filter: `drop-shadow(0 0 6px ${ORGAN_POS[sel].col})`,
            }}>
              {ORGAN_POS[sel].emoji}
            </span>
            <span style={{
              color: ORGAN_POS[sel].col, fontWeight: 900, fontSize: 15,
              textShadow: `0 0 12px ${ORGAN_POS[sel].col}66`,
            }}>
              {t.organs[sel].name}
            </span>

            {/* Sound-wave animation while speaking */}
            {speaking && (
              <div style={{
                display: 'flex', gap: 3, marginLeft: 'auto',
                alignItems: 'flex-end', height: 18,
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 3, height: 16, borderRadius: 2,
                      background: ORGAN_POS[sel].col,
                      animation: 'sndBar .6s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Chemistry fact */}
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13, lineHeight: 1.65, margin: 0,
          }}>
            {t.organs[sel].info}
          </p>
        </div>
      )}
    </div>
  )
}
