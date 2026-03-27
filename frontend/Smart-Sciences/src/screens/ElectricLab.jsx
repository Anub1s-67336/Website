/**
 * ElectricLab.jsx — Physics Activity 2 (Simulation): Лаборатория Электричества
 * • Ohm's law circuit: adjust V and R via sliders
 * • Calculated I = V/R, P = V²/R
 * • Animated bulb brightness based on current
 * • Short-circuit (R → 0): drone sparks + warning
 * • Drag-and-drop feel via component placement buttons
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Bulb component ── */
function Bulb({ brightness }) { // 0 – 1
  const glow = brightness
  const warmColor = `rgba(${Math.round(255)},${Math.round(200 * brightness + 50)},${Math.round(20 * brightness)},${0.15 + glow * 0.7})`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Glow halo */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {brightness > 0.1 && (
          <motion.div
            animate={{ scale: [1, 1.15 + brightness * 0.2, 1], opacity: [0.4 * brightness, 0.7 * brightness, 0.4 * brightness] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              position: 'absolute',
              width: 80 + brightness * 40, height: 80 + brightness * 40,
              borderRadius: '50%',
              background: `radial-gradient(circle,${warmColor},transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Bulb body */}
        <div style={{
          width: 60, height: 70, borderRadius: '50% 50% 30% 30%',
          background: brightness > 0.05
            ? `radial-gradient(circle at 40% 35%, rgba(255,255,200,${0.9 * brightness}), rgba(255,180,0,${0.6 * brightness}), rgba(255,100,0,${0.3 * brightness}))`
            : 'rgba(255,255,255,0.08)',
          border: `2px solid rgba(255,255,200,${0.2 + brightness * 0.5})`,
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: brightness > 0.05 ? `0 0 ${20 + brightness * 40}px rgba(255,200,50,${0.5 * brightness})` : 'none',
          transition: 'all 0.3s',
        }}>
          {/* Filament */}
          <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.6 + brightness * 0.4 }}>
            <path d="M 15 25 L 15 15 M 15 15 Q 8 8 12 5 Q 18 2 22 5 Q 26 8 22 12 Q 18 15 15 15"
              stroke={brightness > 0.1 ? `rgba(255,${Math.round(200*brightness)},0,1)` : 'rgba(255,255,255,0.3)'}
              strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        {/* Base */}
        <div style={{
          position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
          width: 24, height: 12, borderRadius: '0 0 4px 4px',
          background: 'rgba(255,255,255,0.15)',
        }} />
      </div>
      <div style={{ fontSize: 10, color: brightness > 0.1 ? '#fbbf24' : 'rgba(255,255,255,0.25)', fontWeight: 700, marginTop: 8 }}>
        {brightness > 0.8 ? '🔆 Ярко!' : brightness > 0.4 ? '💡 Горит' : brightness > 0.1 ? '🌑 Слабо' : '○ Выкл.'}
      </div>
    </div>
  )
}

/* ── Ammeter (animated needle) ── */
function Ammeter({ current, maxCurrent }) {
  const pct = Math.min(current / maxCurrent, 1)
  const angle = -90 + pct * 180 // -90° (left) to +90° (right)
  return (
    <div style={{
      width: 70, height: 70, borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.15)',
      position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      overflow: 'hidden', padding: 4,
    }}>
      {/* Arc marks */}
      <svg viewBox="0 0 70 70" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const a = (-90 + t * 180) * Math.PI / 180
          const r = 28, cx = 35, cy = 35
          return (
            <line key={i}
              x1={cx + (r-5) * Math.cos(a)} y1={cy + (r-5) * Math.sin(a)}
              x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
              stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          )
        })}
        {/* Colored arc */}
        <path
          d={`M 7 35 A 28 28 0 0 1 63 35`}
          stroke="rgba(96,165,250,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"
        />
      </svg>
      {/* Needle */}
      <motion.div
        animate={{ rotate: angle }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
        style={{
          position: 'absolute', bottom: 33, left: '50%',
          width: 2, height: 24, borderRadius: 2,
          background: 'linear-gradient(to top, #ef4444, #fbbf24)',
          transformOrigin: 'bottom center',
          marginLeft: -1,
        }}
      />
      {/* Label */}
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, zIndex: 1, marginBottom: 2 }}>А</div>
    </div>
  )
}

/* ── Wire segment with animated electrons ── */
function Wire({ active, horizontal, color = '#60a5fa' }) {
  return (
    <div style={{
      position: 'relative',
      [horizontal ? 'width' : 'height']: 60,
      [horizontal ? 'height' : 'width']: 8,
      background: `rgba(255,255,255,${active ? 0.15 : 0.06})`,
      borderRadius: 4,
      overflow: 'hidden',
    }}>
      {active && Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ [horizontal ? 'x' : 'y']: ['-10%', '110%'] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.27, ease: 'linear' }}
          style={{
            position: 'absolute',
            [horizontal ? 'top' : 'left']: '50%',
            [horizontal ? 'left' : 'top']: '-5%',
            transform: horizontal ? 'translateY(-50%)' : 'translateX(-50%)',
            width: 5, height: 5, borderRadius: '50%',
            background: color, boxShadow: `0 0 4px ${color}`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Short circuit sparks ── */
function Sparks({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'relative', width: 40, height: 40 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
            y: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
            opacity: [1, 0], scale: [1, 0],
          }}
          transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 3, height: 3, borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 6px #f59e0b',
          }}
        />
      ))}
      <div style={{ fontSize: 16 }}>⚡</div>
    </div>
  )
}

/* ── Main component ── */
export function ElectricLab({ lang, setMsg, setHappy }) {
  const [voltage,    setVoltage]    = useState(12)
  const [resistance, setResistance] = useState(6)
  const [switchOn,   setSwitchOn]   = useState(false)

  const isShortCircuit = resistance < 0.5
  const current = switchOn && !isShortCircuit ? voltage / resistance : 0
  const power   = switchOn && !isShortCircuit ? (voltage * voltage) / resistance : 0
  const brightness = switchOn ? Math.min(current / 5, 1) : 0

  useEffect(() => {
    if (isShortCircuit && switchOn) {
      setMsg(lang === 'UZ'
        ? '⚡ DIQQAT! Qisqa tutashuv! Qarshilikni oshiring!'
        : '⚡ ВНИМАНИЕ! Короткое замыкание! Увеличь сопротивление!')
      setHappy(false)
    } else if (switchOn && brightness > 0.7) {
      setMsg(lang === 'UZ' ? '💡 Yaxshi! Lampa yorqin yonmoqda!' : '💡 Отлично! Лампа горит ярко!')
      setHappy(true)
    } else if (!switchOn) {
      setMsg(lang === 'UZ' ? '🔌 Kalitni yoping va lampani yoqing!' : '🔌 Замкни выключатель — зажги лампочку!')
    }
  }, [voltage, resistance, switchOn, isShortCircuit, brightness, lang, setMsg, setHappy]) // eslint-disable-line

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '⚡ Elektr Laboratoriyasi' : '⚡ Лаборатория Электричества'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Kuchlanish va qarshilikni o\'zgartiring — lamba qanday o\'zgarishini kuzating!' : 'Меняй напряжение и сопротивление — наблюдай за лампочкой!'}
        </p>
      </div>

      {/* Circuit diagram */}
      <div style={{
        borderRadius: 20, padding: '20px 16px', marginBottom: 18,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
      }}>
        {/* Short circuit warning overlay */}
        <AnimatePresence>
          {isShortCircuit && switchOn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3, 0.7, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, repeat: Infinity }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 20,
                background: 'rgba(239,68,68,0.15)', zIndex: 5, pointerEvents: 'none',
                border: '2px solid rgba(239,68,68,0.6)',
              }}
            />
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
          {/* Battery */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {lang === 'UZ' ? 'Batareya' : 'Батарея'}
            </div>
            <div style={{
              width: 36, height: 56, borderRadius: 8, position: 'relative',
              background: 'linear-gradient(to bottom, #4ade80, #15803d)',
              boxShadow: switchOn ? '0 0 16px rgba(74,222,128,0.5)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: '#fff',
              transition: 'box-shadow 0.3s',
            }}>
              {voltage}V
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                {lang === 'UZ' ? 'Kuch.' : 'Напр.'}
              </div>
            </div>
          </div>

          {/* Wire + Switch */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Wire active={switchOn && !isShortCircuit} horizontal />
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
              onClick={() => setSwitchOn(v => !v)}
              style={{
                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                background: switchOn ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${switchOn ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                color: switchOn ? '#4ade80' : 'rgba(255,255,255,0.5)',
                fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
              }}
            >
              {switchOn ? '🔒 ON' : '🔓 OFF'}
            </motion.button>
            <Wire active={switchOn && !isShortCircuit} horizontal />
          </div>

          {/* Bulb */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {isShortCircuit && switchOn ? (
              <Sparks active />
            ) : (
              <Bulb brightness={brightness} />
            )}
          </div>

          {/* Resistor + Ammeter */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textAlign: 'center' }}>
              {lang === 'UZ' ? 'Qarshilik' : 'Резистор'}
            </div>
            <div style={{
              width: 50, height: 24, borderRadius: 6,
              background: isShortCircuit ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
              border: `1.5px solid ${isShortCircuit ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#fff', fontWeight: 700,
              transition: 'all 0.3s',
            }}>
              {resistance === 0 ? '∞' : `${resistance}Ω`}
            </div>
            <Ammeter current={current} maxCurrent={5} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              I = {current.toFixed(2)} A
            </div>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6 }}>
            ⚡ {lang === 'UZ' ? `Kuchlanish (U): ${voltage} В` : `Напряжение (U): ${voltage} В`}
          </label>
          <input type="range" min={1} max={24} value={voltage}
            onChange={e => setVoltage(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4ade80' }} />
        </div>
        <div>
          <label style={{ color: '#f97316', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6 }}>
            🔶 {lang === 'UZ' ? `Qarshilik (R): ${resistance} Ω` : `Сопротивление (R): ${resistance} Ω`}
            {isShortCircuit && <span style={{ color: '#ef4444', marginLeft: 6 }}>⚠️ КЗ!</span>}
          </label>
          <input type="range" min={0} max={20} step={0.5} value={resistance}
            onChange={e => setResistance(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316' }} />
        </div>
      </div>

      {/* Readings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { icon: '⚡', label: 'U', val: `${voltage} В`, color: '#4ade80' },
          { icon: '🔶', label: 'R', val: isShortCircuit ? '≈ 0 Ω ⚠️' : `${resistance} Ω`, color: '#f97316' },
          { icon: '⏩', label: 'I', val: `${current.toFixed(2)} А`, color: '#60a5fa' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '10px 8px', borderRadius: 12, textAlign: 'center',
            background: `${item.color}0f`, border: `1px solid ${item.color}30`,
          }}>
            <div style={{ fontSize: 16 }}>{item.icon}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Formula + Power */}
      <div style={{
        padding: '12px 14px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 12, lineHeight: 1.7,
      }}>
        <div style={{ color: '#a78bfa', fontWeight: 900, marginBottom: 4 }}>
          {lang === 'UZ' ? 'Om qonuni: I = U/R' : 'Закон Ома: I = U/R'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>
          I = {voltage}/{resistance} = <strong style={{ color: '#60a5fa' }}>{current.toFixed(3)} А</strong>
          {'   '}|{'   '}
          P = {lang === 'UZ' ? `Quvvat` : 'Мощность'} = <strong style={{ color: '#fbbf24' }}>{power.toFixed(2)} Вт</strong>
        </div>
      </div>
    </div>
  )
}
