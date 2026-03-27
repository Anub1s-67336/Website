/**
 * GeniusArchive.jsx — Physics Activity 1 (Theory)
 * Cards for Newton, Tesla, Einstein.
 * Hover → animated demonstration of their key law.
 * All animations via framer-motion.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GENIUSES = [
  {
    id: 'newton',
    name: { RU: 'Исаак Ньютон', UZ: 'Isaak Nyuton' },
    years: '1643 – 1727',
    emoji: '🍎',
    color: '#4ade80',
    law: { RU: 'F = m·a', UZ: 'F = m·a' },
    title: { RU: 'Второй закон Ньютона', UZ: 'Nyutonning ikkinchi qonuni' },
    desc: {
      RU: 'Сила равна произведению массы на ускорение. Именно это поняла Ньютон, когда яблоко упало ему на голову.',
      UZ: 'Kuch massa va tezlanishning ko\'paytmasiga teng. Nyuton buni olma boshiga tushganda tushungan.',
    },
    fact: {
      RU: '🌍 Ньютон также открыл закон всемирного тяготения, разложил свет в спектр и изобрёл дифференциальное исчисление!',
      UZ: '🌍 Nyuton shuningdek umumjahon tortishish qonunini kashf etdi, nurni spektrga ajratdi va differentsial hisobni ixtiro qildi!',
    },
  },
  {
    id: 'tesla',
    name: { RU: 'Никола Тесла', UZ: 'Nikola Tesla' },
    years: '1856 – 1943',
    emoji: '⚡',
    color: '#60a5fa',
    law: { RU: 'U = I·R', UZ: 'U = I·R' },
    title: { RU: 'Закон Ома · Переменный ток', UZ: 'Om qonuni · O\'zgaruvchan tok' },
    desc: {
      RU: 'Напряжение равно произведению тока на сопротивление. Тесла использовал это для создания системы переменного тока, питающего мир.',
      UZ: 'Kuchlanish tok va qarshilikni ko\'paytmasiga teng. Tesla buni dunyoni quvvatlantiruvchi o\'zgaruvchan tok tizimini yaratish uchun ishlatgan.',
    },
    fact: {
      RU: '⚡ Тесла запатентовал более 300 изобретений, включая радио. Его именем названа единица измерения магнитного поля — Тесла (Тл)!',
      UZ: '⚡ Tesla 300 dan ortiq ixtironi patentladi, jumladan radioni. Uning sharafiga magnit maydoni o\'lchov birligi — Tesla (Tl) deb nomlangan!',
    },
  },
  {
    id: 'einstein',
    name: { RU: 'Альберт Эйнштейн', UZ: 'Albert Eynshteyn' },
    years: '1879 – 1955',
    emoji: '✨',
    color: '#f59e0b',
    law: { RU: 'E = mc²', UZ: 'E = mc²' },
    title: { RU: 'Теория относительности', UZ: 'Nisbiylik nazariyasi' },
    desc: {
      RU: 'Энергия равна массе, умноженной на квадрат скорости света. Эта формула объяснила, как Солнце производит свою энергию.',
      UZ: 'Energiya massa va yorug\'lik tezligining kvadratiiga ko\'paytmasiga teng. Bu formula Quyosh energiyasini qanday ishlab chiqarishini tushuntirdi.',
    },
    fact: {
      RU: '🌌 Эйнштейн показал, что пространство и время — единое целое (пространство-время), и что гравитация его искривляет!',
      UZ: '🌌 Eynshteyn fazo va vaqt yagona bir butun (fazo-vaqt) ekanligini va tortishish uni egishini ko\'rsatdi!',
    },
  },
]

/* ── Newton: falling apple animation ── */
function NewtonDemo({ active }) {
  return (
    <div style={{ height: 100, position: 'relative', overflow: 'hidden' }}>
      {/* Tree */}
      <div style={{ position: 'absolute', bottom: 0, left: '15%', width: 8, height: 50, background: '#854d0e', borderRadius: 4 }} />
      <div style={{ position: 'absolute', bottom: 40, left: '0%', width: 60, height: 50, borderRadius: '50%', background: '#15803d', opacity: 0.8 }} />
      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, borderRadius: 4, background: '#374151' }} />

      {/* Falling apple */}
      <motion.div
        animate={active ? { y: [0, 100], opacity: [1, 1, 0], scale: [1, 1.2, 0.5] } : { y: 0, opacity: 1 }}
        transition={active ? { duration: 1.2, repeat: Infinity, ease: 'easeIn' } : {}}
        style={{ position: 'absolute', top: 20, left: '20%', fontSize: 20 }}
      >
        🍎
      </motion.div>

      {/* Force arrow */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              position: 'absolute', top: 30, left: '45%',
              color: '#4ade80', fontWeight: 900, fontSize: 11,
            }}
          >
            F=mg↓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parabola preview */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: active ? 0.4 : 0 }} viewBox="0 0 200 100">
        <path d="M 100 20 Q 140 60 180 90" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

/* ── Tesla: electric arc animation ── */
function TeslaDemo({ active }) {
  return (
    <div style={{ height: 100, position: 'relative', overflow: 'hidden', background: 'rgba(30,27,75,0.5)', borderRadius: 8 }}>
      {/* Sine wave */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 100">
        {active && Array.from({ length: 3 }).map((_, i) => (
          <motion.path
            key={i}
            d={`M 0 50 ${Array.from({ length: 20 }, (_, j) => {
              const x = j * 10
              const y = 50 + Math.sin((j / 20) * Math.PI * 2 + i * 2) * (20 - i * 6)
              return `L ${x} ${y}`
            }).join(' ')}`}
            stroke={['#60a5fa', '#818cf8', '#34d399'][i]}
            strokeWidth={2 - i * 0.5}
            fill="none"
            strokeOpacity={1 - i * 0.3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>

      {/* Labels */}
      {active && (
        <>
          <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, color: '#60a5fa', fontWeight: 700 }}>U (В)</div>
          <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: '#818cf8', fontWeight: 700 }}>t (с)</div>
          <motion.div
            animate={{ x: [0, 150], opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ position: 'absolute', top: '50%', left: 0, width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}
          />
        </>
      )}
      {!active && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          U = I·R — {' '}<span style={{ marginLeft: 4 }}>Наведи курсор</span>
        </div>
      )}
    </div>
  )
}

/* ── Einstein: spacetime grid animation ── */
function EinsteinDemo({ active }) {
  const gridLines = 5
  return (
    <div style={{ height: 100, position: 'relative', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 100">
        {/* Spacetime grid */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const y = (i / (gridLines - 1)) * 100
          const bend = active ? Math.sin((i / gridLines) * Math.PI) * 20 : 0
          return (
            <motion.path
              key={`h${i}`}
              d={`M 0 ${y} Q 100 ${y + bend} 200 ${y}`}
              stroke={`rgba(245,158,11,${0.15 + i * 0.08})`}
              strokeWidth={1}
              fill="none"
              animate={{ d: active ? `M 0 ${y} Q 100 ${y + bend} 200 ${y}` : `M 0 ${y} L 200 ${y}` }}
              transition={{ duration: 0.8, type: 'spring' }}
            />
          )
        })}
        {Array.from({ length: gridLines }).map((_, i) => {
          const x = (i / (gridLines - 1)) * 200
          const bend = active ? Math.sin((i / gridLines) * Math.PI) * 20 : 0
          return (
            <motion.path
              key={`v${i}`}
              d={`M ${x} 0 Q ${x + bend} 50 ${x} 100`}
              stroke={`rgba(245,158,11,${0.10 + i * 0.05})`}
              strokeWidth={1}
              fill="none"
              animate={{ d: active ? `M ${x} 0 Q ${x + bend} 50 ${x} 100` : `M ${x} 0 L ${x} 100` }}
              transition={{ duration: 0.8, type: 'spring' }}
            />
          )
        })}
        {/* Mass causing curvature */}
        {active && (
          <motion.circle
            cx={100} cy={50} r={14}
            fill="radial-gradient(circle,#fbbf24,#d97706)"
            initial={{ r: 0 }}
            animate={{ r: 14 }}
            style={{ fill: '#fbbf24', filter: 'url(#glow)' }}
          />
        )}
        {active && (
          <motion.text x={95} y={55} fontSize={10} fill="#fff" fontWeight="bold"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>M</motion.text>
        )}
      </svg>
    </div>
  )
}

const DEMO_COMPONENTS = { newton: NewtonDemo, tesla: TeslaDemo, einstein: EinsteinDemo }

/* ── Main ── */
export function GeniusArchive({ lang, setMsg, setHappy }) {
  const [hovered, setHovered] = useState(null)
  const [flipped, setFlipped] = useState(null)

  const handleHover = (id) => {
    setHovered(id)
    const g = GENIUSES.find(x => x.id === id)
    if (g) setMsg(lang === 'UZ' ? `${g.name.UZ}: ${g.law.UZ} — ${g.title.UZ}` : `${g.name.RU}: ${g.law.RU} — ${g.title.RU}`)
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🏛 Daho Arxivi' : '🏛 Архив Гениев'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Kartani ustiga bosib qoldirib ko\'ring!' : 'Наведи курсор на карточку — увидишь закон в действии!'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GENIUSES.map(g => {
          const DemoComp = DEMO_COMPONENTS[g.id]
          const isHov = hovered === g.id
          const isFlipped = flipped === g.id

          return (
            <motion.div
              key={g.id}
              onHoverStart={() => { handleHover(g.id); setHappy(true) }}
              onHoverEnd={() => { setHovered(null); setHappy(false) }}
              onClick={() => setFlipped(f => f === g.id ? null : g.id)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderRadius: 20, cursor: 'pointer', overflow: 'hidden',
                border: `1.5px solid ${isHov ? g.color + '80' : 'rgba(255,255,255,0.08)'}`,
                background: isHov ? `${g.color}10` : 'rgba(255,255,255,0.03)',
                transition: 'border-color 0.3s, background 0.3s',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
                <motion.div
                  animate={{ rotate: isHov ? [0, -5, 5, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: 40, flexShrink: 0 }}
                >
                  {g.emoji}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: g.color }}>{g.name[lang]}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{g.years}</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 900,
                      background: `${g.color}20`, color: g.color,
                      border: `1px solid ${g.color}40`,
                    }}>
                      {g.law[lang]}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.3)',
                  transform: isFlipped ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s',
                }}>
                  ▼
                </div>
              </div>

              {/* Demo area — visible on hover */}
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ padding: '0 18px', overflow: 'hidden' }}
                  >
                    <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, color: g.color }}>
                      {g.title[lang]}
                    </div>
                    <DemoComp active={isHov} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded info — visible on click */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ padding: '0 18px 16px', overflow: 'hidden' }}
                  >
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                      {g.desc[lang]}
                    </p>
                    <div style={{
                      padding: '8px 12px', borderRadius: 10,
                      background: `${g.color}0d`, border: `1px solid ${g.color}25`,
                      fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    }}>
                      {g.fact[lang]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
