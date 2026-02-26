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
    addPts(r.left + r.width / 2, r.top + r.height / 2, '#f472b6')
    snd(t.organs[id].snd)
    setSel(id)
    setSpeaking(true)
    setMsg(`${t.organs[id].name}: ${t.organs[id].info}`)
    setTimeout(() => setSpeaking(false), 3500)
    if (!medals.includes('body1')) addMedal('body1')
    incrementQuestProgress('dq_visit')
  }

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.bodyTitle}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>{t.bodySub}</p>

      {/* Body canvas */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto 16px',
        aspectRatio: '0.62',
        background: 'linear-gradient(135deg,rgba(30,10,60,0.85),rgba(10,20,60,0.85))',
        borderRadius: 24, border: '1px solid rgba(167,139,250,0.2)', overflow: 'hidden',
      }}>
        {/* Human silhouette */}
        <svg viewBox="0 0 100 162" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
          <ellipse cx="50" cy="11" rx="12" ry="11" fill="#a78bfa" />
          <rect x="36" y="21" width="28" height="42" rx="6" fill="#7c3aed" />
          <rect x="14" y="23" width="14" height="34" rx="5" fill="#7c3aed" />
          <rect x="72" y="23" width="14" height="34" rx="5" fill="#7c3aed" />
          <rect x="36" y="62" width="13" height="44" rx="5" fill="#7c3aed" />
          <rect x="51" y="62" width="13" height="44" rx="5" fill="#7c3aed" />
          <rect x="28" y="105" width="13" height="32" rx="5" fill="#7c3aed" />
          <rect x="59" y="105" width="13" height="32" rx="5" fill="#7c3aed" />
        </svg>

        {/* Clickable organs */}
        {Object.entries(ORGAN_POS).map(([id, op]) => (
          <button key={id} onClick={(e) => click(id, e)} style={{
            position: 'absolute',
            left: `${op.x}%`, top: `${op.y}%`, width: `${op.w}%`, height: `${op.h}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(14px, 3vw, 22px)',
            background: sel === id ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${sel === id ? '#a78bfa' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, cursor: 'pointer',
            boxShadow: sel === id ? '0 0 18px #a78bfa88' : 'none',
            animation: sel === id ? 'organPulse 1.2s ease-in-out infinite' : 'none',
            transition: 'all .2s',
          }}>
            {op.emoji}
          </button>
        ))}
      </div>

      {/* Info panel */}
      {sel && (
        <div style={{
          padding: '14px 16px', borderRadius: 16,
          background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
          animation: 'fadeUp .35s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{ORGAN_POS[sel].emoji}</span>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{t.organs[sel].name}</span>
            {speaking && (
              <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 3, borderRadius: 2, background: '#a78bfa', animation: `sndBar .6s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {t.organs[sel].info}
          </p>
        </div>
      )}
    </div>
  )
}
