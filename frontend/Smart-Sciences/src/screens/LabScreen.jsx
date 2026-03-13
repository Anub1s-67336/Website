import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { snd }       from '../utils/sound.js'

// ── Reagent definitions ─────────────────────────────────────────
const REAGENTS = {
  water:     { nameRU: 'Вода',       nameUZ: 'Suv',        formula: 'H₂O',       col: '#60a5fa', icon: '💧' },
  vinegar:   { nameRU: 'Уксус',      nameUZ: 'Sirka',      formula: 'CH₃COOH',   col: '#fbbf24', icon: '🟡' },
  soda:      { nameRU: 'Сода',       nameUZ: 'Soda',       formula: 'NaHCO₃',    col: '#cbd5e1', icon: '⬜' },
  naoh:      { nameRU: 'Щёлочь',     nameUZ: 'Ishqor',     formula: 'NaOH',      col: '#818cf8', icon: '🟣' },
  indicator: { nameRU: 'Индикатор',  nameUZ: 'Indikator',  formula: 'C₂₀H₁₄O₄', col: '#f472b6', icon: '🩷' },
  ethanol:   { nameRU: 'Этанол',     nameUZ: 'Etanol',     formula: 'C₂H₅OH',   col: '#6ee7b7', icon: '🍶' },
}

// ── Reaction definitions ────────────────────────────────────────
const REACTIONS = [
  {
    id: 'volcano',
    needs: ['vinegar', 'soda'], needsHeat: false,
    resultCol: '#f97316', effect: 'foam', xp: 30, sound: 'burst',
    factRU: '🌋 CH₃COOH + NaHCO₃ → CO₂ + H₂O + соль. Газ создаёт пену, как в вулкане!',
    factUZ: '🌋 CH₃COOH + NaHCO₃ → CO₂ + H₂O + tuz. Gaz ko\'pik hosil qiladi!',
  },
  {
    id: 'color_magic',
    needs: ['indicator', 'naoh'], needsHeat: false,
    resultCol: '#a855f7', effect: 'colorFlash', xp: 25, sound: 'magic',
    factRU: '🎨 Фенолфталеин бесцветен при pH < 8, но становится малиновым в щелочи!',
    factUZ: '🎨 Fenolftalein pH < 8 da rangsiz, lekin ishqorda qirmizi rangga kiradi!',
  },
  {
    id: 'neutralization',
    needs: ['vinegar', 'naoh'], needsHeat: false,
    resultCol: '#94a3b8', effect: 'neutral', xp: 20, sound: 'hiss',
    factRU: '⚗️ Кислота + щёлочь = соль + вода. Нейтрализация! pH стремится к 7.',
    factUZ: '⚗️ Kislota + ishqor = tuz + suv. Neytralizatsiya! pH 7 ga intiladi.',
  },
  {
    id: 'boiling',
    needs: ['water'], needsHeat: true,
    resultCol: '#93c5fd', effect: 'steam', xp: 15, sound: 'boil',
    factRU: '♨️ При 100°C водородные связи рвутся, H₂O превращается в пар!',
    factUZ: '♨️ 100°C da vodorod bog\'lari uziladi, H₂O bug\'ga aylanadi!',
  },
  {
    id: 'danger',
    needs: ['ethanol'], needsHeat: true,
    resultCol: '#f59e0b', effect: 'explosion', xp: 40, sound: 'burst',
    isDanger: true,
    factRU: '💥 СТОП! Нагрев этанола — пожарная опасность! В реальной лаборатории ЗАПРЕЩЕНО!',
    factUZ: '💥 TO\'XTAT! Etanolni qizdirish — yong\'in xavfi! Haqiqiy laboratoriyada TAQIQLANGAN!',
  },
]

function findReaction(added, heating) {
  const set = new Set(added)
  return REACTIONS.find(r =>
    r.needsHeat === heating &&
    r.needs.length <= added.length &&
    r.needs.every(n => set.has(n))
  ) ?? null
}

// ── Erlenmeyer Flask SVG ────────────────────────────────────────
function Flask({ liquidCol, fillPct, bubbling, shaking, foaming }) {
  // Flask interior: y≈15 (shoulder) to y≈127 (bowl bottom). Height=112 SVG units.
  const yShift = (1 - fillPct) * 112

  return (
    <svg
      viewBox="0 0 100 140"
      style={{
        width: 110, height: 154,
        filter: shaking
          ? 'drop-shadow(0 0 16px rgba(255,120,30,0.95))'
          : `drop-shadow(0 0 8px ${liquidCol}77)`,
        animation: shaking ? 'flaskShake 0.14s ease-in-out infinite' : 'none',
        transition: 'filter 0.5s',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Flask interior clip — neck shoulder to bowl bottom */}
        <clipPath id="fc">
          <path d="M38 15 L14 105 Q9 127 50 127 Q91 127 86 105 L62 15 Z" />
        </clipPath>
        <linearGradient id="fg" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </linearGradient>
      </defs>

      {/* ── Liquid (clipped to flask interior) ── */}
      <g clipPath="url(#fc)">
        {/* Base fill */}
        <rect
          x="0" y="15" width="100" height="130"
          fill={liquidCol}
          style={{
            transform: `translateY(${yShift}px)`,
            transition: 'transform 0.65s ease',
            opacity: 0.7,
          }}
        />

        {/* Foam overflow for volcano */}
        {foaming && (
          <rect
            x="0" y="0" width="100" height="35"
            fill="rgba(255,255,255,0.78)"
            rx="10"
            style={{ animation: 'foamRise 0.55s ease-out forwards' }}
          />
        )}

        {/* Rising bubbles */}
        {bubbling && [
          { cx: 46, delay: '0s'    },
          { cx: 55, delay: '0.38s' },
          { cx: 40, delay: '0.72s' },
          { cx: 58, delay: '0.18s' },
        ].map((b, i) => (
          <circle
            key={i}
            cx={b.cx} cy={122} r={2.8}
            fill="rgba(255,255,255,0.55)"
            style={{ animation: 'bubbleRise 1.5s ease-in infinite', animationDelay: b.delay }}
          />
        ))}

        {/* Gloss overlay */}
        <rect x="0" y="0" width="100" height="200" fill="url(#fg)" style={{ pointerEvents: 'none' }} />
      </g>

      {/* ── Flask glass outline ── */}
      {/* Neck */}
      <rect x="36" y="3" width="28" height="14" rx="4"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3"
      />
      {/* Shoulder + body */}
      <path d="M38 15 L14 105 Q9 127 50 127 Q91 127 86 105 L62 15 Z"
        fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3"
      />
      {/* Neck opening line */}
      <line x1="36" y1="3" x2="64" y2="3" stroke="rgba(255,255,255,0.38)" strokeWidth="1.6" />
      {/* Left-side shine */}
      <path d="M22 80 Q19 106 24 120" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.8" strokeLinecap="round" />

      {/* ── Steam above flask ── */}
      {bubbling && [0, 1, 2].map(i => (
        <ellipse
          key={i}
          cx={43 + i * 7} cy={-2 - i * 6} rx={3.5} ry={2.5}
          fill="rgba(255,255,255,0.13)"
          style={{ animation: 'steamWaft 2.2s ease-out infinite', animationDelay: `${i * 0.42}s` }}
        />
      ))}
    </svg>
  )
}

// ── Bunsen Burner SVG ───────────────────────────────────────────
function BunsenBurner({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      title={on ? 'Выключить горелку' : 'Включить горелку'}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        padding: 4,
      }}
    >
      {/* Flame */}
      {on && (
        <svg viewBox="0 0 40 58" style={{ width: 38, height: 55, marginBottom: -10, zIndex: 2 }}>
          <path
            d="M20 56 C4 46 2 29 10 17 C14 9 17 1 20 1 C23 1 26 9 30 17 C38 29 36 46 20 56 Z"
            fill="#f97316" opacity="0.88"
            style={{ animation: 'flameFlicker 0.55s ease-in-out infinite', transformOrigin: '20px 56px' }}
          />
          <path
            d="M20 52 C10 42 10 29 16 19 C18 12 19 6 20 4 C21 6 22 12 24 19 C30 29 30 42 20 52 Z"
            fill="#fbbf24" opacity="0.82"
            style={{ animation: 'flameFlicker 0.42s ease-in-out infinite', animationDelay: '0.1s', transformOrigin: '20px 52px' }}
          />
          <ellipse cx="20" cy="40" rx="5" ry="8"
            fill="rgba(255,255,255,0.55)"
            style={{ animation: 'flameFlicker 0.32s ease-in-out infinite', animationDelay: '0.05s', transformOrigin: '20px 40px' }}
          />
        </svg>
      )}

      {/* Burner body */}
      <svg viewBox="0 0 60 46" style={{ width: 58, height: 44 }}>
        {/* Barrel */}
        <rect x="22" y="0" width="16" height="22" rx="3"
          fill={on ? '#1e293b' : '#334155'} stroke="#64748b" strokeWidth="1"
        />
        {/* Air collar */}
        <rect x="19" y="17" width="22" height="6" rx="2"
          fill={on ? '#0f172a' : '#1e293b'} stroke="#475569" strokeWidth="1"
        />
        {/* Base */}
        <rect x="13" y="23" width="34" height="12" rx="4"
          fill="#1e293b" stroke="#475569" strokeWidth="1"
        />
        {/* Gas stem */}
        <rect x="26" y="35" width="8" height="11" rx="2"
          fill="#0f172a" stroke="#334155" strokeWidth="1"
        />
        {on && <ellipse cx="30" cy="1" rx="8" ry="2.5" fill="rgba(249,115,22,0.25)" />}
      </svg>

      <span style={{
        fontSize: 9, color: on ? '#f97316' : '#64748b',
        marginTop: 3, fontWeight: 800, letterSpacing: 0.5,
      }}>
        {on ? '🔥 ВКЛ' : '○ ВЫКЛ'}
      </span>
    </button>
  )
}

// ── Main LabScreen ──────────────────────────────────────────────
export function LabScreen({ t, lang, setMsg, setHappy, addPts }) {
  const { addXP, addMedal, medals, incrementQuestProgress, earnAchievement } = useAuth()

  const [added,    setAdded]    = useState([])         // reagent ids in flask
  const [heating,  setHeating]  = useState(false)
  const [stage,    setStage]    = useState('idle')     // idle|partial|ready|reacting|done
  const [reaction, setReaction] = useState(null)

  const flaskRef = useRef(null)

  useEffect(() => { setMsg(t.prof.lab) }, [t])

  // Derived display values
  const fillPct   = Math.min(added.length / 2.5, 1)
  const liquidCol = reaction?.resultCol
    ?? (added.length ? REAGENTS[added[added.length - 1]]?.col : '#0f2a4a')
  const bubbling  = stage === 'reacting' && (reaction?.effect === 'steam' || reaction?.effect === 'foam')
  const shaking   = stage === 'reacting' && reaction?.effect === 'foam'
  const foaming   = stage === 'reacting' && reaction?.effect === 'foam'

  const burst = useCallback((col) => {
    if (!flaskRef.current || !addPts) return
    const r  = flaskRef.current.getBoundingClientRect()
    addPts(r.left + r.width / 2, r.top + r.height / 2, col)
  }, [addPts])

  const addReagent = (id) => {
    if (stage === 'reacting' || stage === 'done') return
    if (added.includes(id) || added.length >= 3) return
    snd('pour')
    const next = [...added, id]
    setAdded(next)
    const found = findReaction(next, heating)
    if (found) {
      setReaction(found)
      setStage('ready')
      setMsg(lang === 'UZ'
        ? '⚗️ Tayyor! REAKSIYA tugmasini bos!'
        : '⚗️ Готово к реакции! Нажми РЕАГИРОВАТЬ!')
    } else {
      setStage('partial')
    }
  }

  const react = () => {
    if (stage !== 'ready' || !reaction) return
    setStage('reacting')
    snd(reaction.sound)
    burst(reaction.resultCol)
    if (reaction.isDanger) {
      setTimeout(() => snd('boom'), 280)
      setTimeout(() => snd('boom'), 560)
    }
    setMsg(reaction[lang === 'UZ' ? 'factUZ' : 'factRU'])
    if (reaction.effect === 'colorFlash') setHappy(true)

    const delay = reaction.effect === 'foam' ? 2600
      : reaction.effect === 'explosion'      ? 1600
      : 1900
    setTimeout(() => {
      setStage('done')
      addXP(reaction.xp)
      if (!medals.includes('lab1')) addMedal('lab1')
      incrementQuestProgress('dq_lab')
      // Grant reaction-specific achievements
      earnAchievement('first_lab').catch(() => {})
      if (reaction.id === 'volcano')        earnAchievement('volcano').catch(() => {})
      if (reaction.id === 'color_magic')    earnAchievement('color_magic').catch(() => {})
      if (reaction.id === 'neutralization') earnAchievement('neutralizer').catch(() => {})
      if (reaction.id === 'danger')         earnAchievement('danger_zone').catch(() => {})
      setTimeout(() => setHappy(false), 2200)
    }, delay)
  }

  const toggleHeat = () => {
    if (stage === 'reacting' || stage === 'done') return
    const next = !heating
    setHeating(next)
    snd(next ? 'ignite' : 'click')
    const found = findReaction(added, next)
    if (found) { setReaction(found); setStage('ready') }
    else if (!next && reaction?.needsHeat) {
      setReaction(null)
      setStage(added.length > 0 ? 'partial' : 'idle')
    }
  }

  const reset = () => {
    setAdded([]); setHeating(false)
    setStage('idle'); setReaction(null)
    snd('click')
    setMsg(t.prof.lab)
  }

  const nameKey = lang === 'UZ' ? 'nameUZ' : 'nameRU'

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ alignSelf: 'flex-start' }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{t.labTitle}</h2>
        <p  style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginTop: 2 }}>
          {lang === 'UZ' ? 'Reagentlarni aralashtirib reaksiyalarni kashf et!' : 'Смешивай реагенты и открывай реакции!'}
        </p>
      </div>

      {/* ── Lab bench ─────────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 340,
        background: 'linear-gradient(155deg,rgba(14,6,38,0.97),rgba(4,8,34,0.97))',
        borderRadius: 22,
        border: `1px solid ${reaction ? reaction.resultCol + '44' : 'rgba(167,139,250,0.18)'}`,
        padding: '18px 14px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        transition: 'border-color 0.5s',
      }}>

        {/* Flask + Burner row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, justifyContent: 'center' }}>
          <div ref={flaskRef}>
            <Flask
              liquidCol={liquidCol}
              fillPct={fillPct}
              bubbling={bubbling}
              shaking={shaking}
              foaming={foaming}
            />
          </div>
          <BunsenBurner on={heating} onClick={toggleHeat} />
        </div>

        {/* Added reagent tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', minHeight: 28 }}>
          {added.map(id => (
            <span key={id} style={{
              background: REAGENTS[id].col + '20',
              border: `1px solid ${REAGENTS[id].col}66`,
              borderRadius: 20, padding: '2px 11px',
              fontSize: 12, color: REAGENTS[id].col, fontWeight: 800,
              animation: 'labelPop 0.3s ease',
            }}>
              {REAGENTS[id].icon} {REAGENTS[id].formula}
            </span>
          ))}
          {heating && (
            <span style={{
              background: '#f9731620', border: '1px solid #f9731666',
              borderRadius: 20, padding: '2px 11px',
              fontSize: 12, color: '#f97316', fontWeight: 800,
              animation: 'labelPop 0.3s ease',
            }}>
              🔥 {lang === 'UZ' ? 'isitish' : 'нагрев'}
            </span>
          )}
        </div>

        {/* React button */}
        {stage === 'ready' && reaction && (
          <button onClick={react} style={{
            background: `linear-gradient(135deg, ${reaction.resultCol}dd, ${reaction.resultCol}88)`,
            border: `1px solid ${reaction.resultCol}`,
            borderRadius: 14, padding: '9px 28px',
            color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer',
            animation: 'neonPulse 1.2s ease-in-out infinite',
            boxShadow: `0 0 18px ${reaction.resultCol}55`,
            fontFamily: 'inherit',
          }}>
            ⚗️ {lang === 'UZ' ? 'REAKSIYA!' : 'РЕАГИРОВАТЬ!'}
          </button>
        )}

        {/* Reacting status */}
        {stage === 'reacting' && (
          <div style={{ color: reaction?.resultCol ?? '#fff', fontWeight: 800, fontSize: 13, animation: 'fadeUp .25s ease' }}>
            {reaction?.effect === 'foam'      ? '🌋 Вулкан!'
            : reaction?.effect === 'steam'     ? '♨️ Кипение!'
            : reaction?.effect === 'explosion' ? '💥 ОПАСНО!'
            : reaction?.effect === 'colorFlash'? '🎨 Меняется цвет!'
            : '⚗️ Реакция...'}
          </div>
        )}

        {/* Bench shelf line */}
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />

        {/* Reset button */}
        {(stage === 'done' || added.length > 0 || heating) && (
          <button onClick={reset} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '5px 18px',
            color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 700,
          }}>
            🔄 {lang === 'UZ' ? 'Tozalash' : 'Сбросить'}
          </button>
        )}
      </div>

      {/* ── Reagent shelf ─────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 340 }}>
        <p style={{
          color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 8,
          fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
        }}>
          {lang === 'UZ' ? 'Reagentlar — bosib qo\'shing' : 'Реагенты — нажми чтобы добавить'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {Object.entries(REAGENTS).map(([id, r]) => {
            const isAdded  = added.includes(id)
            const disabled = isAdded || stage === 'reacting' || stage === 'done' || added.length >= 3
            return (
              <button
                key={id}
                onClick={() => !disabled && addReagent(id)}
                style={{
                  background: isAdded ? r.col + '28' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isAdded ? r.col + 'aa' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 14, padding: '10px 6px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled && !isAdded ? 0.38 : 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.18s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <span style={{ color: isAdded ? r.col : '#fff', fontSize: 11, fontWeight: 800 }}>{r[nameKey]}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }}>{r.formula}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Result fact panel ─────────────────────────────────── */}
      {stage === 'done' && reaction && (
        <div style={{
          width: '100%', maxWidth: 340,
          padding: '14px 16px', borderRadius: 18,
          background: `${reaction.resultCol}12`,
          border: `1px solid ${reaction.resultCol}55`,
          animation: 'fadeUp 0.4s ease',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            {reaction[lang === 'UZ' ? 'factUZ' : 'factRU']}
          </p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              background: reaction.resultCol + '30',
              border: `1px solid ${reaction.resultCol}`,
              borderRadius: 20, padding: '3px 14px',
              fontSize: 13, color: reaction.resultCol, fontWeight: 900,
            }}>
              +{reaction.xp} XP ⭐
            </span>
            {reaction.isDanger && (
              <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>
                ⚠️ {lang === 'UZ' ? 'Faqat simulyatsiyada!' : 'Только в симуляции!'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Idle hint ─────────────────────────────────────────── */}
      {stage === 'idle' && (
        <div style={{
          width: '100%', maxWidth: 340,
          padding: '12px 14px', borderRadius: 14,
          background: 'rgba(129,140,248,0.07)',
          border: '1px solid rgba(129,140,248,0.18)',
          fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7,
        }}>
          {lang === 'UZ' ? (
            <>
              💡 Sinab ko'r: <span style={{ color: '#fbbf24' }}>Sirka</span> + <span style={{ color: '#cbd5e1' }}>Soda</span> → vulqon!<br />
              Yoki: <span style={{ color: '#f472b6' }}>Indikator</span> + <span style={{ color: '#818cf8' }}>Ishqor</span> → rang o'zgarishi!
            </>
          ) : (
            <>
              💡 Попробуй: <span style={{ color: '#fbbf24' }}>Уксус</span> + <span style={{ color: '#cbd5e1' }}>Сода</span> → вулкан!<br />
              Или: <span style={{ color: '#f472b6' }}>Индикатор</span> + <span style={{ color: '#818cf8' }}>Щёлочь</span> → смена цвета!
            </>
          )}
        </div>
      )}

    </div>
  )
}
