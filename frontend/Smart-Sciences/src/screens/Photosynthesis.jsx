/**
 * Photosynthesis.jsx — Biology Activity 4 (Practice): Фотосинтез
 * Sliders: CO₂, H₂O, Light. At optimal balance (60-85%) → plant flowers.
 * Animated CO₂ particles, water droplets, sunrays, O₂ bubbles.
 * 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const OPTIMAL_MIN = 55
const OPTIMAL_MAX = 90

function inOptimal(v) { return v >= OPTIMAL_MIN && v <= OPTIMAL_MAX }

/* ── Plant growth stages ── */
const STAGES = [
  { icon: '🌱', name: { RU: 'Росток',    UZ: 'Ko\'chat'   }, height: 30 },
  { icon: '🌿', name: { RU: 'Листья',    UZ: 'Barglar'    }, height: 55 },
  { icon: '🌸', name: { RU: 'Цветение!', UZ: 'Gullash!'   }, height: 80 },
  { icon: '🌺', name: { RU: 'Расцвела!', UZ: 'Gul ochdi!' }, height: 100 },
]

/* ── Particle field ── */
function ParticleField({ type, count, color, label }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`${type}${i}`}
          initial={{ x: `${10 + Math.random() * 80}%`, y: type === 'co2' ? '-10%' : type === 'light' ? '-5%' : '110%', opacity: 0 }}
          animate={{
            y: type === 'co2' ? ['−10%', '110%'] : type === 'light' ? ['-5%', '110%'] : ['110%', '-10%'],
            opacity: [0, 0.7, 0.7, 0],
            x: [`${10 + Math.random() * 80}%`],
          }}
          transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
          style={{
            position: 'absolute', left: `${Math.random() * 90}%`,
            width: type === 'light' ? 3 : 16, height: type === 'light' ? '20%' : 16,
            borderRadius: type === 'light' ? 2 : '50%',
            background: color,
            fontSize: type !== 'light' ? 11 : undefined,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
            boxShadow: type === 'light' ? `0 0 6px ${color}` : 'none',
          }}
        >
          {type !== 'light' && label}
        </motion.div>
      ))}
    </div>
  )
}

/* ── O₂ bubbles rising from plant ── */
function O2Bubbles({ active, count }) {
  if (!active || count === 0) return null
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: '35%', pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -120 - Math.random() * 60], opacity: [0.8, 0], x: [(Math.random() - 0.5) * 40] }}
          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.25 }}
          style={{
            position: 'absolute', bottom: 0,
            width: 14, height: 14, borderRadius: '50%',
            border: '1.5px solid rgba(34,211,238,0.7)',
            background: 'rgba(34,211,238,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, color: '#22d3ee', fontWeight: 700,
          }}
        >
          O₂
        </motion.div>
      ))}
    </div>
  )
}

/* ── Main ── */
export function Photosynthesis({ lang, setMsg, setHappy, addPts }) {
  const { addXP } = useAuth()
  const [co2,   setCo2]   = useState(40)
  const [water, setWater] = useState(50)
  const [light, setLight] = useState(60)
  const [xpGiven, setXpGiven] = useState(false)
  const prevFlowering = useRef(false)

  const isOptimal  = inOptimal(co2) && inOptimal(water) && inOptimal(light)
  const avgRate    = (co2 + water + light) / 3
  const stage      = Math.min(Math.floor(avgRate / 25), 3)
  const o2Count    = isOptimal ? 6 : Math.floor(avgRate / 40)

  /* XP on first flowering */
  useEffect(() => {
    if (isOptimal && !prevFlowering.current) {
      prevFlowering.current = true
      setHappy(true)
      setMsg(lang === 'UZ'
        ? '🌸 Mukammal balans! Fotosintez to\'liq ketmoqda! +25 XP'
        : '🌸 Идеальный баланс! Фотосинтез идёт на полную! +25 XP')
      if (!xpGiven) { addXP(25); setXpGiven(true) }
    }
    if (!isOptimal) { prevFlowering.current = false }
  }, [isOptimal, lang, setMsg, setHappy, addXP, xpGiven])

  const sliderDefs = [
    { id: 'co2',   val: co2,   set: setCo2,   label: 'CO₂', icon: '💨', color: '#94a3b8' },
    { id: 'water', val: water, set: setWater, label: lang === 'UZ' ? 'Suv' : 'H₂O',  icon: '💧', color: '#60a5fa' },
    { id: 'light', val: light, set: setLight, label: lang === 'UZ' ? 'Yorug\'lik' : 'Свет', icon: '☀️', color: '#fbbf24' },
  ]

  const stageData = STAGES[stage]

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🌿 Fotosintez' : '🌿 Фотосинтез'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'CO₂, suv va yorug\'lik balansini sozlang — o\'simlikni gullating!' : 'Настрой баланс CO₂, воды и света — добейся цветения растения!'}
        </p>
      </div>

      {/* Plant visualization */}
      <div style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(180deg,#0c1a0c 0%,#0f2a0f 60%,#1a2e14 100%)',
        border: `1.5px solid ${isOptimal ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
        height: 200, marginBottom: 18,
        boxShadow: isOptimal ? '0 0 30px rgba(34,197,94,0.2)' : 'none',
        transition: 'border-color 0.5s, box-shadow 0.5s',
      }}>
        {/* Sky glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${isOptimal ? 'rgba(251,191,36,0.25)' : 'rgba(251,191,36,0.08)'} 0%, transparent 60%)`,
          transition: 'background 0.5s',
        }} />

        {/* Particle fields */}
        <ParticleField type="co2"   count={Math.round(co2/25)}   color="rgba(148,163,184,0.6)" label="CO₂" />
        <ParticleField type="light" count={Math.round(light/20)} color={`rgba(251,191,36,${0.4 + light/200})`} />
        <ParticleField type="water" count={Math.round(water/30)} color="rgba(96,165,250,0.6)"  label="💧" />

        {/* Ground */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
          background: 'linear-gradient(to bottom,#3d2006,#1c0f03)',
          borderTop: '2px solid rgba(120,53,15,0.4)',
        }}>
          {/* Soil pattern */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${6 + i * 8}%`, top: 8,
              width: 4, height: 4, borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
            }} />
          ))}
        </div>

        {/* Plant */}
        <div style={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Stem */}
          <motion.div
            animate={{ height: 20 + stage * 22 }}
            transition={{ duration: 0.8, type: 'spring' }}
            style={{ width: 6, background: 'linear-gradient(to top,#15803d,#22c55e)', borderRadius: 3, minHeight: 20 }}
          />
          {/* Plant icon */}
          <motion.div
            key={stage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            style={{ fontSize: 40, lineHeight: 1, marginTop: -4 }}
          >
            {stageData.icon}
          </motion.div>
        </div>

        {/* O₂ bubbles */}
        <O2Bubbles active={isOptimal || avgRate > 50} count={o2Count} />

        {/* Stage label */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 700,
          color: isOptimal ? '#86efac' : 'rgba(255,255,255,0.3)',
          background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 20,
          backdropFilter: 'blur(4px)',
          transition: 'color 0.3s',
        }}>
          {stageData.name[lang]}
          {isOptimal && ' ✨'}
        </div>

        {/* Photosynthesis rate */}
        <div style={{
          position: 'absolute', bottom: 44, right: 10,
          fontSize: 9, color: 'rgba(255,255,255,0.35)',
        }}>
          PS: {Math.round(avgRate)}%
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        {sliderDefs.map(sl => {
          const opt = inOptimal(sl.val)
          return (
            <div key={sl.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: opt ? sl.color : 'rgba(255,255,255,0.5)' }}>
                  {sl.icon} {sl.label}
                  {opt && <span style={{ marginLeft: 6, fontSize: 10, color: '#4ade80' }}>✓</span>}
                </label>
                <span style={{ fontSize: 12, fontWeight: 900, color: sl.color }}>{sl.val}%</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="range" min={0} max={100} value={sl.val}
                  onChange={e => sl.set(Number(e.target.value))}
                  style={{ width: '100%', accentColor: sl.color }}
                />
                {/* Optimal zone indicators */}
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  left: `${OPTIMAL_MIN}%`, width: `${OPTIMAL_MAX - OPTIMAL_MIN}%`, height: 4,
                  background: 'rgba(74,222,128,0.25)', borderRadius: 2, pointerEvents: 'none',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Formula */}
      <div style={{
        padding: '12px 14px', borderRadius: 14,
        background: isOptimal ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOptimal ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.4s', textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isOptimal ? '#86efac' : 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
          6CO₂ + 6H₂O + hν → C₆H₁₂O₆ + 6O₂
        </div>
        {!isOptimal && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'UZ' ? `Optimal zona: ${OPTIMAL_MIN}–${OPTIMAL_MAX}% (ko\'k yo\'l)` : `Оптимум: ${OPTIMAL_MIN}–${OPTIMAL_MAX}% (синяя зона)`}
          </div>
        )}
        {isOptimal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: 6, fontSize: 12, color: '#4ade80', fontWeight: 700 }}
          >
            {lang === 'UZ' ? '✨ Mukammal fotosintez! +25 XP' : '✨ Идеальный фотосинтез! +25 XP'}
          </motion.div>
        )}
      </div>
    </div>
  )
}
