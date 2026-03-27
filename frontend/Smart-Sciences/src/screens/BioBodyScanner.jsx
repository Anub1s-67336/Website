/**
 * BioBodyScanner.jsx — Biology Activity 1: Футуристический Сканер Тела
 * Hover over organs → heartbeat animation, blood composition, chemistry links.
 * Scanning line animation. Futuristic HUD overlay.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ORGANS = [
  {
    id: 'heart',
    icon: '❤️',
    pos: { top: '33%', left: '48%' },
    name: { RU: 'Сердце', UZ: 'Yurak' },
    color: '#ef4444',
    chem: {
      RU: 'АТФ → АДФ + Энергия. Сердечная мышца сокращается 70×/мин благодаря ионам Ca²⁺ и Na⁺.',
      UZ: 'ATF → ADF + Energiya. Yurak mushaklari Ca²⁺ va Na⁺ ionlari orqali daqiqada 70 marta qisqaradi.',
    },
    blood: [
      { label: 'O₂', pct: 98, color: '#ef4444' },
      { label: 'CO₂', pct: 5, color: '#94a3b8' },
      { label: 'Глюкоза', pct: 72, color: '#fbbf24' },
    ],
    pulse: true,
  },
  {
    id: 'lungs',
    icon: '🫁',
    pos: { top: '28%', left: '36%' },
    name: { RU: 'Лёгкие', UZ: 'O\'pka' },
    color: '#60a5fa',
    chem: {
      RU: 'O₂ + Hb → HbO₂. Газообмен: CO₂ выводится, O₂ поступает в кровь за 0.25 секунды!',
      UZ: 'O₂ + Hb → HbO₂. Gaz almashinuvi: CO₂ chiqariladi, O₂ qonga 0.25 soniyada kiradi!',
    },
    blood: [
      { label: 'O₂ (вход)', pct: 21, color: '#60a5fa' },
      { label: 'O₂ (выход)', pct: 16, color: '#3b82f6' },
      { label: 'CO₂', pct: 5.3, color: '#94a3b8' },
    ],
  },
  {
    id: 'brain',
    icon: '🧠',
    pos: { top: '12%', left: '46%' },
    name: { RU: 'Мозг', UZ: 'Miya' },
    color: '#c084fc',
    chem: {
      RU: 'Нейроны работают на глюкозе. Мозг — 2% веса, но 20% энергии! Нейромедиаторы: дофамин, серотонин.',
      UZ: 'Neyronlar glyukozada ishlaydi. Miya — 2% og\'irlik, lekin 20% energiya! Neyromediatorlar: dopamin, serotonin.',
    },
    blood: [
      { label: 'Глюкоза', pct: 80, color: '#fbbf24' },
      { label: 'O₂', pct: 20, color: '#ef4444' },
      { label: 'Вода', pct: 75, color: '#60a5fa' },
    ],
    neural: true,
  },
  {
    id: 'liver',
    icon: '🟤',
    pos: { top: '40%', left: '55%' },
    name: { RU: 'Печень', UZ: 'Jigar' },
    color: '#f59e0b',
    chem: {
      RU: 'Гликолиз + синтез белков. >500 биохимических реакций! Обезвреживает токсины через цитохром P450.',
      UZ: 'Glikoliz + oqsil sintezi. >500 biokimyoviy reaksiya! Toksik moddalarni sitoxrom P450 orqali zararsizlantiradi.',
    },
    blood: [
      { label: 'Желчь', pct: 45, color: '#84cc16' },
      { label: 'Гликоген', pct: 60, color: '#f59e0b' },
      { label: 'Фермент.', pct: 30, color: '#fb923c' },
    ],
  },
  {
    id: 'stomach',
    icon: '🫃',
    pos: { top: '47%', left: '43%' },
    name: { RU: 'Желудок', UZ: 'Oshqozon' },
    color: '#22d3ee',
    chem: {
      RU: 'HCl (pH 1.5–3.5) + пепсин → расщепление белков. Слизь защищает стенки от самопереваривания!',
      UZ: 'HCl (pH 1.5–3.5) + pepsin → oqsillarni parchalaydi. Shilimshiq qorin devorini o\'z-o\'zidan hazm bo\'lishidan himoya qiladi!',
    },
    blood: [
      { label: 'HCl', pct: 0.3, color: '#22d3ee' },
      { label: 'Пепсин', pct: 10, color: '#6366f1' },
      { label: 'pH', pct: 2.5, color: '#f87171' },
    ],
  },
]

/* ── Heartbeat animation ── */
function HeartbeatLine({ active }) {
  const d = 'M 0 25 L 20 25 L 28 10 L 36 40 L 44 25 L 52 25 L 60 5 L 68 45 L 76 25 L 100 25'
  return (
    <svg viewBox="0 0 100 50" style={{ width: '100%', height: 40 }}>
      <motion.path
        d={d}
        fill="none" stroke={active ? '#ef4444' : 'rgba(255,255,255,0.15)'}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut', repeat: active ? Infinity : 0 }}
      />
    </svg>
  )
}

/* ── Neural sparks ── */
function NeuralSparks({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'relative', height: 40 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, (Math.random() - 0.5) * 80],
            y: [0, (Math.random() - 0.5) * 30],
            opacity: [0, 1, 0], scale: [0, 1, 0],
          }}
          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.12 }}
          style={{
            position: 'absolute', left: `${10 + i * 11}%`, top: '50%',
            width: 4, height: 4, borderRadius: '50%',
            background: '#c084fc', boxShadow: '0 0 6px #c084fc',
          }}
        />
      ))}
    </div>
  )
}

/* ── Organ HUD panel ── */
function OrganPanel({ organ, lang }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      style={{
        borderRadius: 16, overflow: 'hidden',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
        border: `1.5px solid ${organ.color}50`,
        boxShadow: `0 0 24px ${organ.color}22`,
      }}
    >
      <div style={{
        padding: '10px 14px',
        background: `linear-gradient(135deg,${organ.color}22,${organ.color}08)`,
        borderBottom: `1px solid ${organ.color}25`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 20 }}>{organ.icon}</span>
        <div style={{ fontWeight: 900, fontSize: 14, color: organ.color }}>{organ.name[lang]}</div>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: `${organ.color}aa`, fontWeight: 700 }}>
          SCAN ACTIVE
        </div>
      </div>
      <div style={{ padding: '10px 14px' }}>
        {/* Heartbeat or sparks */}
        {organ.pulse && <HeartbeatLine active />}
        {organ.neural && <NeuralSparks active />}

        {/* Chemistry info */}
        <p style={{ margin: '8px 0', fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>
          ⚗️ {organ.chem[lang]}
        </p>

        {/* Blood composition bars */}
        <div style={{ borderTop: `1px solid ${organ.color}20`, paddingTop: 8, marginTop: 8 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
            {lang === 'UZ' ? 'QONNING TARKIBI' : 'СОСТАВ КРОВИ / ДАННЫЕ'}
          </div>
          {organ.blood.map(b => (
            <div key={b.label} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{b.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{b.pct}{b.pct < 5 ? '' : '%'}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(b.pct, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 2, background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main component ── */
export function BioBodyScanner({ lang, setMsg, setHappy }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null)
  const [scanY, setScanY] = useState(0)
  const [scanDir, setScanDir] = useState(1)

  /* Scanning line animation */
  useEffect(() => {
    const id = setInterval(() => {
      setScanY(y => {
        const next = y + scanDir * 1.2
        if (next > 100) { setScanDir(-1); return 100 }
        if (next < 0)   { setScanDir(1);  return 0   }
        return next
      })
    }, 30)
    return () => clearInterval(id)
  }, [scanDir])

  const handleHover = (organ) => {
    setHoveredOrgan(organ)
    setHappy(true)
    setMsg(lang === 'UZ'
      ? `🔬 ${organ.name.UZ} skaneri: kimyoviy jarayonlarni o\'rganing!`
      : `🔬 Сканирование: ${organ.name.RU} — изучай химические процессы!`)
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🔬 Tana Skaneri' : '🔬 Сканер Тела'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Organlar ustiga sichqonchani olib boring — kimyoviy reaktsiyalarni ko\'ring!' : 'Наведи на орган — увидишь химические реакции внутри!'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Body silhouette + organs */}
        <div style={{
          position: 'relative', borderRadius: 20,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden', minHeight: 300,
        }}>
          {/* HUD corners */}
          {['tl','tr','bl','br'].map(corner => (
            <div key={corner} style={{
              position: 'absolute',
              ...(corner.includes('t') ? { top: 8 } : { bottom: 8 }),
              ...(corner.includes('l') ? { left: 8 } : { right: 8 }),
              width: 14, height: 14,
              borderTop:    corner.includes('t') ? '2px solid rgba(34,211,238,0.6)' : 'none',
              borderBottom: corner.includes('b') ? '2px solid rgba(34,211,238,0.6)' : 'none',
              borderLeft:   corner.includes('l') ? '2px solid rgba(34,211,238,0.6)' : 'none',
              borderRight:  corner.includes('r') ? '2px solid rgba(34,211,238,0.6)' : 'none',
            }} />
          ))}

          {/* Scanning line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: `${scanY}%`,
            height: 2, zIndex: 5, pointerEvents: 'none',
            background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.6),transparent)',
            boxShadow: '0 0 8px rgba(34,211,238,0.4)',
          }} />

          {/* Body outline (CSS) */}
          <div style={{ position: 'relative', padding: '20px 10px', minHeight: 300 }}>
            {/* Head */}
            <div style={{
              width: 50, height: 60, borderRadius: '50% 50% 40% 40%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              margin: '0 auto 2px',
            }} />
            {/* Torso */}
            <div style={{
              width: 90, height: 140, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              margin: '0 auto', position: 'relative',
            }}>
              {/* Rib lines */}
              {[25, 45, 65].map(y => (
                <div key={y} style={{
                  position: 'absolute', top: y, left: 8, right: 8, height: 1,
                  background: 'rgba(255,255,255,0.05)', borderRadius: 1,
                }} />
              ))}
            </div>
            {/* Legs placeholder */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 2 }}>
              {[0,1].map(i => (
                <div key={i} style={{
                  width: 30, height: 70, borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }} />
              ))}
            </div>

            {/* Organ hotspots */}
            {ORGANS.map(organ => (
              <motion.button
                key={organ.id}
                onMouseEnter={() => handleHover(organ)}
                onMouseLeave={() => { setHoveredOrgan(null); setHappy(false) }}
                whileHover={{ scale: 1.3 }}
                animate={hoveredOrgan?.id === organ.id ? {
                  boxShadow: [`0 0 0px ${organ.color}`, `0 0 16px ${organ.color}`, `0 0 0px ${organ.color}`],
                } : {}}
                transition={{ duration: 0.7, repeat: Infinity }}
                style={{
                  position: 'absolute', ...organ.pos,
                  transform: 'translate(-50%,-50%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${organ.color}22`,
                  border: `1.5px solid ${organ.color}66`,
                  display: 'grid', placeItems: 'center',
                  fontSize: 14, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {organ.icon}
              </motion.button>
            ))}
          </div>

          {/* HUD text */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 8, color: 'rgba(34,211,238,0.5)', fontFamily: 'monospace' }}>
            SCAN MODE ACTIVE · BIO-HUD v2.0
          </div>
        </div>

        {/* Info panel */}
        <div>
          <AnimatePresence mode="wait">
            {hoveredOrgan ? (
              <OrganPanel key={hoveredOrgan.id} organ={hoveredOrgan} lang={lang} />
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  borderRadius: 16, padding: '20px 16px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔬</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6 }}>
                  {lang === 'UZ' ? 'Skanerlash uchun chap tarafdagi organ ustiga bosing' : 'Наведи на орган слева для сканирования'}
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ORGANS.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                      {o.name[lang]}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
