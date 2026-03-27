/**
 * ChemMicroscope.jsx — Activity 4 (Simulation): Микроскоп NaCl
 * Zoom levels 0–3:
 *   0 — macro: salt grains pile
 *   1 — crystal cube shape visible
 *   2 — ionic grid (Na⁺ blue / Cl⁻ green checkerboard)
 *   3 — electron density / orbital glow
 * Drone commentary updates at each level.
 * All transitions via framer-motion.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Commentary per level ── */
const COMMENTARY = {
  RU: [
    '🧂 Это обычная поваренная соль. На вид — просто белые кристаллики!',
    '🔬 Увеличиваем! Видишь кубическую форму? NaCl всегда образует кубы!',
    '⚛️ Ещё ближе! Na⁺ (синие) и Cl⁻ (зелёные) ионы чередуются в решётке.',
    '✨ Максимальное увеличение! Электронные облака перекрываются — это ионная связь!',
  ],
  UZ: [
    '🧂 Bu oddiy osh tuzi. Ko\'rinishda faqat oq kristallchalar!',
    '🔬 Kattalashtirmoqdamiz! Kubik shaklni ko\'ryapsanmi? NaCl doim kub hosil qiladi!',
    '⚛️ Yanada yaqinroq! Na⁺ (ko\'k) va Cl⁻ (yashil) ionlar panjara ichida navbat bilan joylashgan.',
    '✨ Maksimal kattalashtirish! Elektron bulutlar bir-birini qoplaydi — bu ion bog\'i!',
  ],
}

/* ── Level 0: Salt grains ── */
function GrainsView() {
  return (
    <div style={{
      width: '100%', height: 200, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
      borderRadius: 12,
    }}>
      {Array.from({ length: 40 }).map((_, i) => {
        const s = 4 + Math.abs(Math.sin(i * 3.7)) * 12
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 23 + 5) % 96}%`,
            top:  `${40 + Math.abs(Math.cos(i * 2.1)) * 45}%`,
            width: s, height: s,
            borderRadius: 3,
            background: `rgba(226,232,240,${0.4 + Math.random() * 0.5})`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            transform: `rotate(${i * 13}deg)`,
          }} />
        )
      })}
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        fontSize: 9, color: 'rgba(255,255,255,0.35)',
      }}>
        Масштаб: ~1 мм
      </div>
    </div>
  )
}

/* ── Level 1: Crystal cube outline ── */
function CrystalView() {
  return (
    <div style={{
      width: '100%', height: 200, display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative',
      background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 12,
    }}>
      {/* Isometric cube via CSS */}
      <div style={{ perspective: '400px', perspectiveOrigin: '50% 40%' }}>
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ width: 90, height: 90, position: 'relative', transformStyle: 'preserve-3d' }}
        >
          {/* 6 faces */}
          {[
            { transform: 'rotateY(0deg)   translateZ(45px)',  bg: 'rgba(100,116,139,0.35)' },
            { transform: 'rotateY(90deg)  translateZ(45px)',  bg: 'rgba(100,116,139,0.25)' },
            { transform: 'rotateY(180deg) translateZ(45px)',  bg: 'rgba(100,116,139,0.35)' },
            { transform: 'rotateY(-90deg) translateZ(45px)',  bg: 'rgba(100,116,139,0.25)' },
            { transform: 'rotateX(90deg)  translateZ(45px)',  bg: 'rgba(100,116,139,0.45)' },
            { transform: 'rotateX(-90deg) translateZ(45px)',  bg: 'rgba(100,116,139,0.20)' },
          ].map((f, i) => (
            <div key={i} style={{
              position: 'absolute', width: 90, height: 90,
              background: f.bg,
              border: '1px solid rgba(148,163,184,0.5)',
              transform: f.transform,
              backfaceVisibility: 'hidden',
            }} />
          ))}
        </motion.div>
      </div>
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        fontSize: 9, color: 'rgba(255,255,255,0.35)',
      }}>
        Масштаб: ~0.1 мм
      </div>
    </div>
  )
}

/* ── Level 2: Ionic grid ── */
const GRID = 7
function IonicView({ zoom }) {
  const cellSize = 28 + zoom * 2
  return (
    <div style={{
      width: '100%', height: 210, overflow: 'hidden',
      background: 'linear-gradient(135deg,#060713,#0d1117)', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        animate={{ scale: [1, 1.04, 1], rotate: [0, 0.8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, ${cellSize}px)`,
          gap: 4,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const row = Math.floor(i / GRID), col = i % GRID
          const isNa = (row + col) % 2 === 0
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.008, type: 'spring', stiffness: 200 }}
              style={{
                width: cellSize, height: cellSize, borderRadius: '50%',
                background: isNa
                  ? 'radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)'
                  : 'radial-gradient(circle at 35% 35%, #4ade80, #15803d)',
                boxShadow: isNa
                  ? '0 0 8px rgba(96,165,250,0.55)'
                  : '0 0 8px rgba(74,222,128,0.55)',
                display: 'grid', placeItems: 'center',
                fontSize: cellSize < 28 ? 7 : 9, fontWeight: 900, color: '#fff',
              }}
            >
              {isNa ? 'Na⁺' : 'Cl⁻'}
            </motion.div>
          )
        })}
      </motion.div>
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        fontSize: 9, color: 'rgba(255,255,255,0.35)',
      }}>
        Масштаб: ~0.28 нм
      </div>
    </div>
  )
}

/* ── Level 3: Electron density ── */
function OrbitalView() {
  return (
    <div style={{
      width: '100%', height: 210, position: 'relative', overflow: 'hidden',
      background: '#000', borderRadius: 12, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Na ion core */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #93c5fd, #1e40af)',
            boxShadow: '0 0 30px #60a5fa88, 0 0 60px #3b82f644',
          }}
        />
        {/* Electron cloud Na */}
        {[40, 65, 90].map((r, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 * (i % 2 ? 1 : -1) }}
            transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: `calc(50% - ${r}px)`, left: `calc(50% - ${r}px)`,
              width: r * 2, height: r * 2, borderRadius: '50%',
              border: `1px solid rgba(96,165,250,${0.35 - i * 0.1})`,
              background: `radial-gradient(ellipse,rgba(96,165,250,${0.08 - i*0.02}),transparent)`,
            }}
          />
        ))}
      </div>

      {/* Bond zone */}
      <div style={{
        width: 60, height: 6,
        background: 'linear-gradient(90deg,rgba(96,165,250,0.5),rgba(74,222,128,0.5))',
        boxShadow: '0 0 12px rgba(255,255,255,0.2)',
      }} />

      {/* Cl ion core */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ scale: [1.08, 1, 1.08] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #86efac, #15803d)',
            boxShadow: '0 0 30px #4ade8088, 0 0 60px #22c55e44',
          }}
        />
        {[44, 70, 96].map((r, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 * (i % 2 ? -1 : 1) }}
            transition={{ duration: 2.5 + i * 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: `calc(50% - ${r}px)`, left: `calc(50% - ${r}px)`,
              width: r * 2, height: r * 2, borderRadius: '50%',
              border: `1px solid rgba(74,222,128,${0.35 - i * 0.1})`,
              background: `radial-gradient(ellipse,rgba(74,222,128,${0.08 - i*0.02}),transparent)`,
            }}
          />
        ))}
      </div>
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        fontSize: 9, color: 'rgba(255,255,255,0.35)',
      }}>
        Масштаб: ~0.1 нм (электроны)
      </div>
    </div>
  )
}

/* ── Legend ── */
function Legend({ zoom, lang }) {
  if (zoom < 2) return null
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      marginTop: 10, flexWrap: 'wrap',
    }}>
      {[
        { color: '#60a5fa', label: lang === 'UZ' ? 'Na⁺ — natriy kationi' : 'Na⁺ — катион натрия' },
        { color: '#4ade80', label: lang === 'UZ' ? 'Cl⁻ — xlor anioni' : 'Cl⁻ — анион хлора' },
      ].map(item => (
        <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: item.color, boxShadow: `0 0 6px ${item.color}`,
          }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main component ── */
export function ChemMicroscope({ t, lang, setMsg, setHappy }) {
  const [zoom, setZoom] = useState(0)

  const handleZoom = (lvl) => {
    setZoom(lvl)
    setHappy(lvl >= 2)
    setMsg((COMMENTARY[lang] ?? COMMENTARY.RU)[lvl])
  }

  const LEVEL_LABELS = {
    RU: ['🧂 Макро', '🔍 Кристалл', '⚛️ Ионная решётка', '✨ Электроны'],
    UZ: ['🧂 Makro', '🔍 Kristall', '⚛️ Ion panjara', '✨ Elektronlar'],
  }
  const labels = LEVEL_LABELS[lang] ?? LEVEL_LABELS.RU

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🔭 NaCl Mikroskobi' : '🔭 Микроскоп: NaCl'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ'
            ? 'Kattalashtirishni sozlang va kristall panjarani o\'rganing!'
            : 'Управляй увеличением — исследуй кристаллическую решётку!'}
        </p>
      </div>

      {/* Zoom level tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {labels.map((lbl, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleZoom(i)}
            style={{
              padding: '7px 12px', borderRadius: 20, cursor: 'pointer',
              background: zoom === i ? 'rgba(34,211,238,0.20)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${zoom === i ? 'rgba(34,211,238,0.65)' : 'rgba(255,255,255,0.1)'}`,
              color: zoom === i ? '#22d3ee' : 'rgba(255,255,255,0.45)',
              fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            {lbl}
          </motion.button>
        ))}
      </div>

      {/* Zoom slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {lang === 'UZ' ? 'Kattalashtirish:' : 'Увеличение:'}
        </span>
        <input
          type="range" min={0} max={3} step={1} value={zoom}
          onChange={e => handleZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#22d3ee' }}
        />
        <span style={{ fontSize: 12, fontWeight: 900, color: '#22d3ee', minWidth: 28 }}>
          {['1×', '100×', '10M×', '1B×'][zoom]}
        </span>
      </div>

      {/* Microscope view */}
      <div style={{
        borderRadius: 18, overflow: 'hidden',
        border: '2px solid rgba(34,211,238,0.25)',
        boxShadow: '0 0 30px rgba(34,211,238,0.10)',
        position: 'relative',
      }}>
        {/* Lens overlay corners */}
        {['top:8px;left:8px', 'top:8px;right:8px', 'bottom:8px;left:8px', 'bottom:8px;right:8px'].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', width: 12, height: 12, zIndex: 5,
            borderTop:    i < 2 ? '2px solid rgba(34,211,238,0.6)' : 'none',
            borderBottom: i >= 2 ? '2px solid rgba(34,211,238,0.6)' : 'none',
            borderLeft:   i % 2 === 0 ? '2px solid rgba(34,211,238,0.6)' : 'none',
            borderRight:  i % 2 !== 0 ? '2px solid rgba(34,211,238,0.6)' : 'none',
            ...(i === 0 ? { top: 8, left: 8 } : i === 1 ? { top: 8, right: 8 } : i === 2 ? { bottom: 8, left: 8 } : { bottom: 8, right: 8 }),
          }} />
        ))}

        <AnimatePresence mode="wait">
          <motion.div
            key={zoom}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            {zoom === 0 && <GrainsView />}
            {zoom === 1 && <CrystalView />}
            {zoom === 2 && <IonicView zoom={zoom} />}
            {zoom === 3 && <OrbitalView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Legend zoom={zoom} lang={lang} />

      {/* Drone comment bubble (inline) */}
      <motion.div
        key={zoom}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 14,
          background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)',
          fontSize: 13, color: 'rgba(255,255,255,0.80)', lineHeight: 1.55,
        }}
      >
        🤖 {(COMMENTARY[lang] ?? COMMENTARY.RU)[zoom]}
      </motion.div>

      {/* NaCl info card */}
      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontWeight: 900, fontSize: 13, color: '#fff', marginBottom: 6 }}>
          {lang === 'UZ' ? '🧂 NaCl haqida faktlar' : '🧂 Факты о NaCl'}
        </div>
        {[
          { icon:'🔬', RU: 'Ионная кристаллическая решётка: кубическая система',     UZ: 'Ion kristall panjara: kubik tizim'                },
          { icon:'📏', RU: 'Расстояние Na⁺–Cl⁻: 0.282 нм',                          UZ: 'Na⁺–Cl⁻ masofa: 0.282 nm'                        },
          { icon:'🌡', RU: 'Температура плавления: 801 °C',                           UZ: 'Erish harorati: 801 °C'                           },
          { icon:'💧', RU: 'Хорошо растворим в воде (35.7 г/100 мл при 20 °C)',       UZ: 'Suvda yaxshi eriydi (35.7 g/100 ml, 20 °C da)'   },
        ].map(f => (
          <div key={f.RU} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>{f.icon}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)' }}>{f[lang] ?? f.RU}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
