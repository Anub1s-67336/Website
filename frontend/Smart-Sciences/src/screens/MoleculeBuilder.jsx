/**
 * MoleculeBuilder.jsx — Activity 3 (Game): Сборщик Молекул 3D
 * • Choose Glucose or Caffeine.
 * • Add atoms (C, H, O, N) by clicking atom tiles until the formula matches.
 * • Timer counts down. Score = remaining seconds × 5 XP.
 * • Molecule view: atoms rendered as floating colored spheres with SVG bonds.
 * • Perspective CSS on container for pseudo-3D look.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { makeBurst } from '../components/Particles.jsx'

/* ── Molecule definitions ── */
const MOLECULES = [
  {
    id: 'glucose',
    name:   { RU: 'Глюкоза',  UZ: 'Glyukoza'  },
    formula:{ RU: 'C₆H₁₂O₆', UZ: 'C₆H₁₂O₆'  },
    atoms: { C: 6, H: 12, O: 6 },
    color: '#f59e0b',
    emoji: '🍬',
    fact: {
      RU: 'Глюкоза — основное топливо клеток. Мозг потребляет ~120 г глюкозы в сутки!',
      UZ: 'Glyukoza — hujayralarning asosiy yoqilg\'isi. Miya kuniga ~120 g glyukoza sarflaydi!',
    },
    /* Atom positions in the "3D" view — normalized 0–100 for a 300×200 area */
    nodes: [
      { el:'O', x:50, y:10, shell:1 },  // ring O
      { el:'C', x:28, y:28, shell:1 },  // C1
      { el:'C', x:18, y:55, shell:2 },  // C2
      { el:'C', x:28, y:80, shell:2 },  // C3
      { el:'C', x:55, y:80, shell:2 },  // C4
      { el:'C', x:72, y:55, shell:2 },  // C5
      { el:'C', x:85, y:28, shell:3 },  // C6 (CH2OH side)
      { el:'O', x:55, y:52, shell:2 },  // O between C2-C3
      { el:'O', x:72, y:28, shell:3 },  // O on C5
      { el:'O', x:92, y:10, shell:3 },  // O on C6
      // H atoms
      { el:'H', x:14, y:14, shell:1 }, { el:'H', x:8, y:50, shell:2 },
      { el:'H', x:14, y:75, shell:2 }, { el:'H', x:48, y:92, shell:2 },
      { el:'H', x:62, y:92, shell:2 }, { el:'H', x:80, y:68, shell:2 },
      { el:'H', x:92, y:36, shell:3 }, { el:'H', x:98, y:22, shell:3 },
    ],
    bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,7],[4,7],[5,8],[6,8],[6,9]],
  },
  {
    id: 'caffeine',
    name:   { RU: 'Кофеин',   UZ: 'Kofein'    },
    formula:{ RU: 'C₈H₁₀N₄O₂', UZ: 'C₈H₁₀N₄O₂' },
    atoms: { C: 8, H: 10, N: 4, O: 2 },
    color: '#8b5cf6',
    emoji: '☕',
    fact: {
      RU: 'Кофеин блокирует аденозиновые рецепторы в мозге — вот почему кофе бодрит!',
      UZ: 'Kofein miyada adenozin retseptorlarini bloklaydi — shuning uchun kofe quvvat beradi!',
    },
    nodes: [
      /* Purine ring system (simplified) */
      { el:'N', x:30, y:20, shell:1 },  // N1
      { el:'C', x:55, y:15, shell:1 },  // C2
      { el:'N', x:75, y:30, shell:1 },  // N3
      { el:'C', x:80, y:55, shell:2 },  // C4
      { el:'C', x:60, y:70, shell:2 },  // C5
      { el:'N', x:38, y:65, shell:2 },  // N7
      { el:'C', x:25, y:45, shell:2 },  // C8
      { el:'N', x:42, y:42, shell:2 },  // N9
      { el:'C', x:62, y:42, shell:2 },  // C4a (junction)
      /* O groups */
      { el:'O', x:55, y:0, shell:1  },  // O2
      { el:'O', x:95, y:58, shell:2 },  // O6
      /* CH3 groups */
      { el:'C', x:12, y:8,  shell:1 },  // N1-CH3
      { el:'C', x:88, y:18, shell:1 },  // N3-CH3
      { el:'C', x:22, y:80, shell:2 },  // N7-CH3
      /* H atoms */
      { el:'H', x:4, y:22, shell:1  }, { el:'H', x:78, y:82, shell:2 },
      { el:'H', x:90, y:75, shell:2 }, { el:'H', x:6, y:85, shell:2 },
    ],
    bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,3],[0,9],[2,10],[0,11],[2,12],[5,13]],
  },
]

const ATOM_COLORS = { C: '#94a3b8', H: '#e2e8f0', O: '#f87171', N: '#60a5fa' }
const ATOM_SIZE   = { C: 18, H: 13, O: 16, N: 16 }
const TIME_LIMIT  = 90

/* ── Molecule 3D viewer ── */
function MoleculeView({ molecule, activated }) {
  const W = 300, H = 200
  const nodes = molecule.nodes

  const px = (n) => (n.x / 100) * W
  const py = (n) => (n.y / 100) * H

  return (
    <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
      {/* SVG bonds */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={`0 0 ${W} ${H}`}
      >
        {molecule.bonds.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b]
          if (!na || !nb) return null
          const isActive = activated[a] && activated[b]
          return (
            <line
              key={i}
              x1={px(na)} y1={py(na)} x2={px(nb)} y2={py(nb)}
              stroke={isActive ? molecule.color : 'rgba(255,255,255,0.12)'}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray={isActive ? '' : '4 3'}
              style={{ transition: 'all 0.4s' }}
            />
          )
        })}
      </svg>

      {/* Atom nodes */}
      {nodes.map((node, i) => {
        const r   = ATOM_SIZE[node.el] ?? 14
        const col = ATOM_COLORS[node.el] ?? '#a78bfa'
        const act = !!activated[i]
        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: act ? 1 : 0.55, opacity: act ? 1 : 0.3 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            style={{
              position: 'absolute',
              left: px(node) - r, top: py(node) - r,
              width: r * 2, height: r * 2, borderRadius: '50%',
              background: act
                ? `radial-gradient(circle at 35% 35%, ${col}ee, ${col}88)`
                : 'rgba(255,255,255,0.1)',
              boxShadow: act ? `0 0 ${r}px ${col}88` : 'none',
              display: 'grid', placeItems: 'center',
              fontSize: r < 16 ? 7 : 9, fontWeight: 900,
              color: act ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            {node.el}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Main component ── */
export function MoleculeBuilder({ t, lang, setMsg, setHappy, addPts }) {
  const { addXP } = useAuth()
  const [selected,   setSelected]   = useState(null)  // which molecule
  const [activated,  setActivated]  = useState({})    // {nodeIndex: bool}
  const [atomCounts, setAtomCounts] = useState({ C: 0, H: 0, O: 0, N: 0 })
  const [timeLeft,   setTimeLeft]   = useState(TIME_LIMIT)
  const [running,    setRunning]    = useState(false)
  const [won,        setWon]        = useState(false)
  const [lost,       setLost]       = useState(false)
  const timerRef = useRef(null)
  const winRef   = useRef(null)

  /* ── Timer ── */
  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          setLost(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  /* ── Check win ── */
  useEffect(() => {
    if (!selected || !running) return
    const target = selected.atoms
    const match = Object.entries(target).every(([el, n]) => atomCounts[el] === n)
    const noExtra = Object.entries(atomCounts).every(([el, n]) => (target[el] ?? 0) >= n)
    if (match && noExtra) {
      clearInterval(timerRef.current)
      setRunning(false)
      setWon(true)
      const xp = Math.max(10, timeLeft * 5)
      addXP(xp)
      setHappy(true)
      setMsg(lang === 'UZ'
        ? `🎉 Molekula yig\'ildi! +${xp} XP! Vaqt: ${timeLeft}s`
        : `🎉 Молекула собрана! +${xp} XP! Время: ${timeLeft}с`)
      if (winRef.current) {
        const r = winRef.current.getBoundingClientRect()
        addPts(r.left + r.width / 2, r.top + r.height / 2, selected.color, 28)
      }
    }
  }, [atomCounts, selected, running]) // eslint-disable-line

  /* ── Activate nodes progressively ── */
  useEffect(() => {
    if (!selected) return
    // Activate nodes that match accumulated atom types (in order)
    const counts = { ...atomCounts }
    const newAct = {}
    selected.nodes.forEach((node, i) => {
      if ((counts[node.el] ?? 0) > 0) {
        newAct[i] = true
        counts[node.el]--
      }
    })
    setActivated(newAct)
  }, [atomCounts, selected])

  const addAtom = (el) => {
    if (!running || won || lost) return
    const target = selected?.atoms ?? {}
    if ((atomCounts[el] ?? 0) >= (target[el] ?? 0)) return // already at max
    setAtomCounts(c => ({ ...c, [el]: c[el] + 1 }))
  }

  const startGame = (mol) => {
    setSelected(mol)
    setAtomCounts({ C: 0, H: 0, O: 0, N: 0 })
    setActivated({})
    setTimeLeft(TIME_LIMIT)
    setWon(false); setLost(false)
    setRunning(true)
    setMsg(lang === 'UZ'
      ? `⏱ ${TIME_LIMIT}s ichida ${mol.name[lang]} (${mol.formula[lang]}) ni yig'! Atomlarni bosing!`
      : `⏱ Собери ${mol.name[lang]} (${mol.formula[lang]}) за ${TIME_LIMIT}с! Нажимай на атомы!`)
  }

  const restart = () => {
    clearInterval(timerRef.current)
    setSelected(null); setWon(false); setLost(false); setRunning(false)
    setAtomCounts({ C: 0, H: 0, O: 0, N: 0 }); setActivated({})
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 20 ? '#f59e0b' : '#ef4444'

  return (
    <div ref={winRef} style={{ padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🧬 Molekula Yig\'uvchi 3D' : '🧬 Сборщик Молекул 3D'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ'
            ? 'Molekulani tanlang va atomlarni qo\'shing!'
            : 'Выбери молекулу и добавляй атомы нужного типа!'}
        </p>
      </div>

      {/* Molecule selector */}
      {!selected && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {MOLECULES.map(mol => (
            <motion.button
              key={mol.id}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => startGame(mol)}
              style={{
                flex: 1, minWidth: 130, padding: '16px 12px',
                borderRadius: 18, cursor: 'pointer',
                background: `${mol.color}14`,
                border: `2px solid ${mol.color}55`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 30 }}>{mol.emoji}</span>
              <span style={{ fontWeight: 900, fontSize: 15, color: mol.color }}>{mol.name[lang]}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{mol.formula[lang]}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(mol.atoms).map(([el, n]) => (
                  <span key={el} style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 6,
                    background: `${ATOM_COLORS[el]}22`, color: ATOM_COLORS[el], fontWeight: 700,
                  }}>
                    {n}× {el}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Game zone */}
      {selected && !won && !lost && (
        <>
          {/* Timer bar */}
          <div style={{
            marginBottom: 14, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                {selected.emoji} {selected.name[lang]} — {selected.formula[lang]}
              </span>
              <span style={{ fontWeight: 900, color: timerColor, fontSize: 14 }}>
                ⏱ {timeLeft}с
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${timerPct}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: '100%', borderRadius: 3, background: timerColor }}
              />
            </div>
          </div>

          {/* 3D Molecule view */}
          <div style={{
            borderRadius: 18, padding: 16, marginBottom: 16,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            perspective: '600px',
          }}>
            <motion.div
              animate={{ rotateY: [0, 4, 0, -4, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <MoleculeView molecule={selected} activated={activated} />
            </motion.div>
          </div>

          {/* Atom counter + add buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {Object.entries(selected.atoms).map(([el, need]) => {
              const have = atomCounts[el] ?? 0
              const done = have >= need
              return (
                <motion.button
                  key={el}
                  whileHover={!done ? { scale: 1.07, y: -2 } : {}}
                  whileTap={!done ? { scale: 0.93 } : {}}
                  onClick={() => addAtom(el)}
                  disabled={done}
                  style={{
                    padding: '12px 6px', borderRadius: 14, cursor: done ? 'default' : 'pointer',
                    background: done ? `${ATOM_COLORS[el]}33` : `${ATOM_COLORS[el]}11`,
                    border: `2px solid ${done ? ATOM_COLORS[el] + 'aa' : ATOM_COLORS[el] + '44'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${ATOM_COLORS[el]}cc, ${ATOM_COLORS[el]}66)`,
                    display: 'grid', placeItems: 'center',
                    fontSize: 13, fontWeight: 900, color: '#fff',
                    boxShadow: `0 0 12px ${ATOM_COLORS[el]}66`,
                  }}>
                    {el}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ATOM_COLORS[el] }}>
                    {have}/{need}
                  </div>
                  {done && <div style={{ fontSize: 9, color: '#22c55e' }}>✓</div>}
                </motion.button>
              )
            })}
          </div>

          <button
            onClick={restart}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'inherit',
            }}
          >
            {lang === 'UZ' ? '← Orqaga' : '← Назад'}
          </button>
        </>
      )}

      {/* Win screen */}
      <AnimatePresence>
        {won && selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              borderRadius: 20, padding: '24px 20px', textAlign: 'center',
              background: `${selected.color}18`, border: `2px solid ${selected.color}55`,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h3 style={{ color: selected.color, fontSize: 18, fontWeight: 900, margin: '0 0 8px' }}>
              {lang === 'UZ' ? 'Ajoyib! Molekula yig\'ildi!' : 'Молекула собрана!'}
            </h3>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
              {selected.emoji} {selected.name[lang]} · +{Math.max(10, timeLeft * 5)} XP ✨
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 16 }}>
              💡 {selected.fact[lang]}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => startGame(selected)}
                style={{
                  padding: '9px 18px', borderRadius: 12, cursor: 'pointer',
                  background: selected.color, border: 'none',
                  color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '🔄 Qayta' : '🔄 Ещё раз'}
              </motion.button>
              <button
                onClick={restart}
                style={{
                  padding: '9px 18px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '🧬 Boshqa molekula' : '🧬 Другая молекула'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lose screen */}
      <AnimatePresence>
        {lost && selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              borderRadius: 20, padding: '24px 20px', textAlign: 'center',
              background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.35)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>⏰</div>
            <h3 style={{ color: '#f87171', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>
              {lang === 'UZ' ? 'Vaqt tugadi!' : 'Время вышло!'}
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
              {selected.formula[lang]} — {lang === 'UZ' ? 'keyingi safar ulgurasan!' : 'в следующий раз успеешь!'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => startGame(selected)}
                style={{
                  padding: '9px 18px', borderRadius: 12, cursor: 'pointer',
                  background: '#ef4444', border: 'none',
                  color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '🔄 Qayta' : '🔄 Ещё раз'}
              </button>
              <button
                onClick={restart}
                style={{
                  padding: '9px 18px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '← Orqaga' : '← Назад'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
