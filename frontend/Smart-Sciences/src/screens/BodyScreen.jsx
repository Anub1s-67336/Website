import { useState, useRef, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { ORGAN_POS } from '../data/constants.js'
import { snd }       from '../utils/sound.js'
import bodySilhouette from '../assets/30473.png'

export function BodyScreen({ t, setMsg, setHappy, addPts }) {
  const { addMedal, medals, incrementQuestProgress } = useAuth()
  const [sel,      setSel]      = useState(null)
  const [hov,      setHov]      = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const svgRef = useRef(null)

  useEffect(() => { setMsg(t.prof.body) }, [t])

  const click = (id) => {
    const op = ORGAN_POS[id]
    if (svgRef.current) {
      const r = svgRef.current.getBoundingClientRect()
      addPts(
        r.left + (op.cx / 100) * r.width,
        r.top  + (op.cy / 162) * r.height,
        op.col,
      )
    }
    snd(t.organs[id].snd)
    setSel(id)
    setSpeaking(true)
    setMsg(`${t.organs[id].name}: ${t.organs[id].info}`)
    setTimeout(() => setSpeaking(false), 3500)
    if (!medals.includes('body1')) addMedal('body1')
    incrementQuestProgress('dq_visit')
  }

  // Returns inline style for an SVG organ shape
  const os = (id) => {
    const { col } = ORGAN_POS[id]
    const active = sel === id
    const hover  = hov === id
    return {
      fill:        active ? col + 'cc' : hover ? col + '88' : col + '33',
      stroke:      active || hover ? col : col + '55',
      strokeWidth: active ? 1.5 : 0.7,
      filter:      active ? `drop-shadow(0 0 5px ${col})` : hover ? `drop-shadow(0 0 2px ${col})` : 'none',
      cursor:      'pointer',
      transition:  'fill .18s, stroke .18s, filter .18s',
    }
  }

  // Event handlers for an organ group
  const h = (id) => ({
    onClick:      () => click(id),
    onMouseEnter: () => setHov(id),
    onMouseLeave: () => setHov(null),
  })

  // Shared text style (non-interactive, no pointer events)
  const labelStyle = { pointerEvents: 'none', userSelect: 'none' }

  const active = sel ? ORGAN_POS[sel] : null

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.bodyTitle}</h2>
      <p  style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>{t.bodySub}</p>

      {/* ── Body canvas ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 320, margin: '0 auto 16px',
        aspectRatio: '0.62',
        background: 'linear-gradient(160deg,rgba(20,8,50,0.92),rgba(6,12,46,0.92))',
        borderRadius: 24,
        border: `1px solid ${active ? active.col + '55' : 'rgba(167,139,250,0.2)'}`,
        overflow: 'hidden',
        transition: 'border-color .4s',
      }}>

        {/* Hover tooltip */}
        {hov && t.organs[hov] && (
          <div style={{
            position: 'absolute',
            top:  `${Math.max(3, (ORGAN_POS[hov].cy / 162) * 100 - 9)}%`,
            left: `${ORGAN_POS[hov].cx}%`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(6,4,24,0.96)',
            border: `1px solid ${ORGAN_POS[hov].col}99`,
            borderRadius: 8,
            padding: '3px 10px',
            fontSize: 11, fontWeight: 700,
            color: ORGAN_POS[hov].col,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            {ORGAN_POS[hov].emoji} {t.organs[hov].name}
          </div>
        )}

        {/*
          viewBox 0 0 100 162 — matches the 0.62 aspect ratio of the container.
          Organ z-order (back → front): muscle → kidneys → intestine →
          liver → stomach → lungs → heart → brain
        */}
        <svg
          ref={svgRef}
          viewBox="0 0 100 162"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* ── Human silhouette (real PNG, non-clickable) ────────── */}
          {/*
            Image is a black silhouette on white background (512×512).
            filter:invert(1) → white figure on black.
            mix-blend-mode:screen → black vanishes, white figure glows.
            The image is wider than the viewBox, centred: x=-27 crops edges.
          */}
          <image
            href={bodySilhouette}
            x="-27" y="0"
            width="154" height="154"
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
            style={{
              filter: 'invert(1) sepia(1) hue-rotate(220deg) saturate(1.5)',
              mixBlendMode: 'screen',
              opacity: 0.35,
            }}
          />

          {/* ── LAYER 1: Muscles (thighs) ─────────────────────────── */}
          {/* Silhouette thighs: y≈87–114, each thigh ~13 units wide    */}
          <g {...h('muscle')}>
            <rect x="31" y="87" width="13" height="27" rx="7" style={os('muscle')} />
            <rect x="56" y="87" width="13" height="27" rx="7" style={os('muscle')} />
            <text x="37.5" y="102" textAnchor="middle" fontSize="7" style={labelStyle}>💪</text>
          </g>

          {/* ── LAYER 2: Kidneys (retroperitoneal flanks) ─────────── */}
          {/* y≈60–71, tucked behind stomach/liver                       */}
          <g {...h('kidneys')}>
            <ellipse cx="32" cy="65" rx="4.5" ry="6" style={os('kidneys')} />
            <ellipse cx="68" cy="65" rx="4.5" ry="6" style={os('kidneys')} />
            <text x="32" y="67.5" textAnchor="middle" fontSize="5.5" style={labelStyle}>🫘</text>
            <text x="68" y="67.5" textAnchor="middle" fontSize="5.5" style={labelStyle}>🫘</text>
          </g>

          {/* ── LAYER 3: Intestine (lower abdomen) ────────────────── */}
          {/* y≈70–79, between abdomen and hips                         */}
          <g {...h('intestine')}>
            <rect x="33" y="70" width="34" height="9" rx="5" style={os('intestine')} />
            <text x="50" y="76.5" textAnchor="middle" fontSize="6" style={labelStyle}>🌀</text>
          </g>

          {/* ── LAYER 4: Liver (right upper abdomen) ──────────────── */}
          {/* D-shaped right lobe, y≈56–71                             */}
          <g {...h('liver')}>
            <path
              d="M52 58 Q54 56 67 58 Q70 60 69 66 Q68 71 60 71 Q53 70 52 65 Z"
              style={os('liver')}
            />
            <text x="61" y="65" textAnchor="middle" fontSize="5.5" style={labelStyle}>🟤</text>
          </g>

          {/* ── LAYER 5: Stomach (left upper abdomen) ─────────────── */}
          {/* Ellipse, y≈55–67                                          */}
          <g {...h('stomach')}>
            <ellipse cx="39" cy="61" rx="8.5" ry="6" style={os('stomach')} />
            <text x="39" y="63.5" textAnchor="middle" fontSize="5.5" style={labelStyle}>🟡</text>
          </g>

          {/* ── LAYER 6: Lungs (bilateral, upper chest) ───────────── */}
          {/* y≈33–54, mediastinum gap at x=45–55                       */}
          <g {...h('lungs')}>
            <rect x="29" y="33" width="16" height="21" rx="7" style={os('lungs')} />
            <rect x="55" y="33" width="16" height="21" rx="7" style={os('lungs')} />
            <text x="37" y="46" textAnchor="middle" fontSize="7" style={labelStyle}>🫁</text>
          </g>

          {/* ── LAYER 7: Heart (left-centre chest, ON TOP of lungs) ── */}
          {/* Spans x≈36–50, y≈33.5–47 (shifted +8 from original)      */}
          <g {...h('heart')}>
            <path
              d="M43,47
                 C43,47 36,41 36,37.5
                 C36,35 38.5,33.5 40.5,35.5
                 C41.5,36.5 42.5,37.5 43,38
                 C43.5,37.5 44.5,36.5 45.5,35.5
                 C47.5,33.5 50,35 50,37.5
                 C50,41 43,47 43,47 Z"
              style={os('heart')}
            />
            <text x="43" y="42.5" textAnchor="middle" fontSize="6" style={labelStyle}>❤️</text>
          </g>

          {/* ── LAYER 8: Brain (inside head, topmost) ─────────────── */}
          {/* Head center y≈14                                           */}
          <g {...h('brain')}>
            <ellipse cx="50" cy="14" rx="8" ry="7" style={os('brain')} />
            <text x="50" y="16.5" textAnchor="middle" fontSize="7" style={labelStyle}>🧠</text>
          </g>

          {/* Active organ name label at bottom of SVG */}
          {sel && (
            <text
              x="50" y="155"
              textAnchor="middle"
              fontSize="7"
              fill={ORGAN_POS[sel].col}
              fontWeight="bold"
              pointerEvents="none"
            >
              {ORGAN_POS[sel].emoji} {t.organs[sel].name}
            </text>
          )}
        </svg>
      </div>

      {/* ── Info panel (shown on organ click) ───────────────────── */}
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

            {/* Sound-wave bars while speaking */}
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
