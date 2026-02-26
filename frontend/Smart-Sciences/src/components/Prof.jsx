import { useState, useEffect } from 'react'

/**
 * Professor Atom — animated mascot with speech bubble.
 * Props:
 *   msg   {string}  — speech bubble text
 *   happy {boolean} — triggers "happy" animation + glow
 */
export function Prof({ msg, happy = false }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {/* ── Character ── */}
      <div style={{ flexShrink: 0, animation: 'profFloat 3s ease-in-out infinite' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', position: 'relative',
          background: 'radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)',
          boxShadow: happy
            ? '0 0 28px #a78bfa, 0 0 56px #7c3aed88'
            : '0 0 18px #7c3aed66',
          transition: 'box-shadow .4s',
        }}>
          {/* Hat brim */}
          <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 44, height: 3, borderRadius: 2, background: '#7c3aed' }} />
          {/* Hat body */}
          <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 30, height: 18, borderRadius: '6px 6px 0 0', background: 'linear-gradient(to top, #4c1d95, #7c3aed)' }} />
          {/* Eyes */}
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 6, borderRadius: '50%', background: '#312e81',
                  height: blink ? 1 : 6,
                  transform: happy ? 'translateY(1px)' : 'none',
                  transition: 'height .08s',
                }} />
              </div>
            ))}
          </div>
          {/* Mouth */}
          <div style={{
            position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)',
            width: happy ? 18 : 13, height: happy ? 9 : 5,
            borderRadius: '0 0 50% 50%', border: '2px solid #c4b5fd', borderTop: 'none',
            transition: 'all .3s',
          }} />
          {/* Orbit ring */}
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: '1px solid rgba(167,139,250,0.35)',
            animation: 'spinOrb 3s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%,-50%)',
              width: 7, height: 7, borderRadius: '50%', background: '#22d3ee',
              boxShadow: '0 0 8px #22d3ee',
            }} />
          </div>
        </div>
      </div>

      {/* ── Speech bubble ── */}
      <div style={{
        flex: 1, maxWidth: 260, padding: '10px 14px',
        borderRadius: '16px 16px 16px 4px',
        background: 'rgba(109,40,217,0.22)',
        border: '1px solid rgba(167,139,250,0.35)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(109,40,217,0.22)',
        position: 'relative',
      }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
          {msg}
        </p>
        {/* Tail */}
        <div style={{
          position: 'absolute', left: -8, bottom: 12, width: 10, height: 10, transform: 'rotate(45deg)',
          background: 'rgba(109,40,217,0.22)',
          borderBottom: '1px solid rgba(167,139,250,0.35)',
          borderLeft:   '1px solid rgba(167,139,250,0.35)',
        }} />
      </div>
    </div>
  )
}
