/**
 * AlchemicalReactor.jsx — Activity 2 (Practice).
 * Two reagent slots. On mixing: particle burst + CSS-filter color change + result card.
 * All animations via framer-motion.
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { makeBurst } from '../components/Particles.jsx'

/* ── Reagent definitions ── */
const REAGENTS = [
  { id: 'HCl',    label: 'HCl',    name: { RU: 'Соляная кислота',   UZ: 'Xlorid kislota'   }, color: '#22c55e', emoji: '🟢' },
  { id: 'NaOH',   label: 'NaOH',   name: { RU: 'Гидроксид натрия',  UZ: 'Natriy gidroksid' }, color: '#3b82f6', emoji: '🔵' },
  { id: 'H2SO4',  label: 'H₂SO₄',  name: { RU: 'Серная кислота',    UZ: 'Sulfat kislota'   }, color: '#f59e0b', emoji: '🟡' },
  { id: 'Na',     label: 'Na',     name: { RU: 'Натрий (металл)',    UZ: 'Natriy (metall)'  }, color: '#a78bfa', emoji: '🟣' },
  { id: 'Fe',     label: 'Fe',     name: { RU: 'Железо',            UZ: 'Temir'             }, color: '#94a3b8', emoji: '⚫' },
  { id: 'Cu',     label: 'Cu',     name: { RU: 'Медь',              UZ: 'Mis'               }, color: '#f97316', emoji: '🟠' },
  { id: 'H2O2',   label: 'H₂O₂',  name: { RU: 'Перекись водорода', UZ: 'Vodorod peroksid' }, color: '#e2e8f0', emoji: '⚪' },
  { id: 'H2O',    label: 'H₂O',   name: { RU: 'Вода',              UZ: 'Suv'               }, color: '#67e8f9', emoji: '💧' },
]

/* ── Reaction table [a+b] ── */
const REACTIONS = {
  'HCl+NaOH':   { result: 'NaCl + H₂O', effect: 'glow',   color: '#3b82f6', xp: 20,
    desc: { RU: 'Реакция нейтрализации! Кислота + щёлочь = соль + вода.', UZ: 'Neytrallanish reaksiyasi! Kislota + ishqor = tuz + suv.' } },
  'NaOH+HCl':   { result: 'NaCl + H₂O', effect: 'glow',   color: '#3b82f6', xp: 20,
    desc: { RU: 'Реакция нейтрализации! Кислота + щёлочь = соль + вода.', UZ: 'Neytrallanish reaksiyasi! Kislota + ishqor = tuz + suv.' } },
  'Na+H2O':     { result: 'NaOH + H₂↑', effect: 'explosion', color: '#f97316', xp: 30,
    desc: { RU: '💥 Взрыв! Натрий бурно реагирует с водой — выделяется водород!', UZ: '💥 Portlash! Natriy suv bilan shiddatli reaksiyaga kirishadi — vodorod ajraladi!' } },
  'H2O+Na':     { result: 'NaOH + H₂↑', effect: 'explosion', color: '#f97316', xp: 30,
    desc: { RU: '💥 Взрыв! Натрий бурно реагирует с водой — выделяется водород!', UZ: '💥 Portlash! Natriy suv bilan shiddatli reaksiyaga kirishadi — vodorod ajraladi!' } },
  'Fe+HCl':     { result: 'FeCl₂ + H₂↑', effect: 'bubble',  color: '#22c55e', xp: 25,
    desc: { RU: '🫧 Железо растворяется в кислоте — пузырьки водорода!', UZ: '🫧 Temir kislotada eriydi — vodorod pufakchalari!' } },
  'HCl+Fe':     { result: 'FeCl₂ + H₂↑', effect: 'bubble',  color: '#22c55e', xp: 25,
    desc: { RU: '🫧 Железо растворяется в кислоте — пузырьки водорода!', UZ: '🫧 Temir kislotada eriydi — vodorod pufakchalari!' } },
  'Cu+H2SO4':   { result: 'CuSO₄ + H₂O + SO₂↑', effect: 'color', color: '#0ea5e9', xp: 25,
    desc: { RU: '🔵 Медь растворяется — раствор становится синим (CuSO₄)!', UZ: '🔵 Mis eriydi — eritma ko\'k rangga kiradi (CuSO₄)!' } },
  'H2SO4+Cu':   { result: 'CuSO₄ + H₂O + SO₂↑', effect: 'color', color: '#0ea5e9', xp: 25,
    desc: { RU: '🔵 Медь растворяется — раствор становится синим (CuSO₄)!', UZ: '🔵 Mis eriydi — eritma ko\'k rangga kiradi (CuSO₄)!' } },
  'H2O2+Fe':    { result: 'Fe(OH)₃ + O₂↑', effect: 'foam',  color: '#f59e0b', xp: 20,
    desc: { RU: '🧯 Реакция Фентона! Перекись разлагается с образованием пены.', UZ: '🧯 Fenton reaksiyasi! Peroksid parchalanib ko\'pik hosil qiladi.' } },
  'Fe+H2O2':    { result: 'Fe(OH)₃ + O₂↑', effect: 'foam',  color: '#f59e0b', xp: 20,
    desc: { RU: '🧯 Реакция Фентона! Перекись разлагается с образованием пены.', UZ: '🧯 Fenton reaksiyasi! Peroksid parchalanib ko\'pik hosil qiladi.' } },
  'NaOH+H2SO4': { result: 'Na₂SO₄ + H₂O', effect: 'glow',  color: '#a78bfa', xp: 20,
    desc: { RU: 'Нейтрализация! Щёлочь + кислота = соль сульфат натрия.', UZ: 'Neytrallanish! Ishqor + kislota = natriy sulfat tuzi.' } },
  'H2SO4+NaOH': { result: 'Na₂SO₄ + H₂O', effect: 'glow',  color: '#a78bfa', xp: 20,
    desc: { RU: 'Нейтрализация! Щёлочь + кислота = соль сульфат натрия.', UZ: 'Neytrallanish! Ishqor + kislota = natriy sulfat tuzi.' } },
}

/* ── Flask SVG shape ── */
function Flask({ reagent, slot, color, onDrop, lang }) {
  const isEmpty = !reagent
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: isEmpty ? 'default' : 'pointer',
      }}
    >
      {/* Label */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
        {lang === 'UZ' ? `${slot === 'A' ? 'A' : 'B'} Slot` : `Слот ${slot}`}
      </div>
      {/* Flask body */}
      <div style={{
        width: 80, height: 110, position: 'relative', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Neck */}
        <div style={{
          width: 28, height: 28, borderRadius: '6px 6px 0 0',
          background: 'rgba(255,255,255,0.06)',
          border: '1.5px solid rgba(255,255,255,0.15)', borderBottom: 'none',
          zIndex: 2,
        }} />
        {/* Body */}
        <div style={{
          width: 80, flex: 1, borderRadius: '0 0 40px 40px',
          background: isEmpty
            ? 'rgba(255,255,255,0.04)'
            : `${reagent.color}22`,
          border: `1.5px solid ${isEmpty ? 'rgba(255,255,255,0.12)' : reagent.color + '55'}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          transition: 'all 0.4s', position: 'relative', overflow: 'hidden',
        }}>
          {!isEmpty && (
            <>
              {/* Liquid fill */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '50%', borderRadius: '0 0 40px 40px',
                  background: `${reagent.color}44`,
                  transformOrigin: 'bottom',
                }}
              />
              <div style={{ fontSize: 22, zIndex: 1 }}>{reagent.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: reagent.color, zIndex: 1 }}>
                {reagent.label}
              </div>
            </>
          )}
          {isEmpty && (
            <div style={{ fontSize: 22, opacity: 0.25 }}>🧪</div>
          )}
        </div>
      </div>
      {/* Reagent name */}
      <div style={{
        fontSize: 10, color: isEmpty ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
        textAlign: 'center', maxWidth: 80,
      }}>
        {isEmpty ? (lang === 'UZ' ? 'Bo\'sh' : 'Пусто') : reagent.name[lang]}
      </div>
    </div>
  )
}

/* ── Effect overlays ── */
function EffectOverlay({ effect, color, active }) {
  if (!active) return null
  if (effect === 'explosion') return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle,${color}cc,${color}00)`,
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
  if (effect === 'glow') return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: [0,1,0.6,0] }}
      transition={{ duration: 1.2 }}
      style={{
        position: 'absolute', inset: -20, borderRadius: 24,
        background: `radial-gradient(ellipse,${color}55,transparent 70%)`,
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
  if (effect === 'bubble') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
      {Array.from({length: 12}).map((_, i) => (
        <motion.div key={i}
          initial={{ y: 0, x: 20 + Math.random() * 60, opacity: 1, scale: 0.5 }}
          animate={{ y: -120 - Math.random() * 80, opacity: 0, scale: 1.2 }}
          transition={{ duration: 1 + Math.random() * 0.8, delay: i * 0.07 }}
          style={{
            position: 'absolute', bottom: '30%',
            width: 8 + Math.random() * 10, height: 8 + Math.random() * 10,
            borderRadius: '50%', border: `2px solid ${color}aa`,
            background: `${color}22`,
          }}
        />
      ))}
    </div>
  )
  if (effect === 'foam') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
      {Array.from({length: 20}).map((_, i) => (
        <motion.div key={i}
          initial={{ y: 0, x: Math.random() * 160, opacity: 1 }}
          animate={{ y: -60 - Math.random() * 60, opacity: 0 }}
          transition={{ duration: 0.8 + Math.random() * 0.6, delay: i * 0.04 }}
          style={{
            position: 'absolute', bottom: '20%',
            width: 12, height: 12, borderRadius: '50%',
            background: `${color}66`, border: `1px solid ${color}aa`,
          }}
        />
      ))}
    </div>
  )
  if (effect === 'color') return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.5] }}
      transition={{ duration: 1 }}
      style={{
        position: 'absolute', inset: 0, borderRadius: 18,
        background: `${color}33`,
        border: `2px solid ${color}66`,
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
  return null
}

/* ── Main component ── */
export function AlchemicalReactor({ t, lang, setMsg, setHappy, addPts }) {
  const { addXP } = useAuth()
  const [slotA,    setSlotA]    = useState(null)
  const [slotB,    setSlotB]    = useState(null)
  const [reacting, setReacting] = useState(false)
  const [result,   setResult]   = useState(null)
  const [effect,   setEffect]   = useState(null)
  const [discovered, setDiscovered] = useState([])
  const mixRef = useRef(null)

  const handleSelect = (reagent) => {
    if (!slotA) { setSlotA(reagent); return }
    if (!slotB) { setSlotB(reagent); return }
    // Both slots full — replace A
    setSlotA(reagent); setSlotB(null)
  }

  const handleMix = useCallback(() => {
    if (!slotA || !slotB || reacting) return
    const key = `${slotA.id}+${slotB.id}`
    const rx = REACTIONS[key]
    setReacting(true)
    setResult(null)

    if (rx) {
      setEffect(rx.effect)
      setTimeout(() => {
        setResult(rx)
        setEffect(null)
        if (!discovered.includes(key)) {
          setDiscovered(d => [...d, key])
          addXP(rx.xp)
          setHappy(true)
          setMsg(lang === 'UZ'
            ? `🎉 Yangi reaksiya! +${rx.xp} XP qozdingiz!`
            : `🎉 Новая реакция открыта! +${rx.xp} XP!`)
          if (mixRef.current) {
            const r = mixRef.current.getBoundingClientRect()
            addPts(r.left + r.width / 2, r.top + r.height / 2, rx.color, 20)
          }
        } else {
          setMsg(lang === 'UZ' ? '♻️ Bu reaksiya allaqachon kashf etilgan!' : '♻️ Эта реакция уже известна!')
        }
        setReacting(false)
      }, 800)
    } else {
      setEffect(null)
      setTimeout(() => {
        setResult({ result: lang === 'UZ' ? '⚗️ Reaksiya kechmaди' : '⚗️ Реакция не идёт', desc: { RU: 'Эти вещества не реагируют при обычных условиях.', UZ: 'Bu moddalar oddiy sharoitda reaksiyaga kirishmaydi.' }, xp: 0, color: '#64748b' })
        setReacting(false)
      }, 600)
    }
  }, [slotA, slotB, reacting, discovered, lang, addXP, setHappy, setMsg, addPts])

  const reset = () => { setSlotA(null); setSlotB(null); setResult(null); setEffect(null) }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '⚗️ Alkimyoviy Reaktor' : '⚗️ Алхимический Реактор'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ'
            ? 'Ikki reagentni tanlang va ularni aralashtiring!'
            : 'Выбери два реагента и смешай их!'}
        </p>
        {discovered.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#a78bfa' }}>
            {lang === 'UZ' ? `🔓 Kashf etildi: ${discovered.length}` : `🔓 Открыто реакций: ${discovered.length}`}
          </div>
        )}
      </div>

      {/* Reagent palette */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 24,
      }}>
        {REAGENTS.map(r => (
          <motion.button
            key={r.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(r)}
            style={{
              padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
              background: (slotA?.id === r.id || slotB?.id === r.id)
                ? `${r.color}33`
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${(slotA?.id === r.id || slotB?.id === r.id) ? r.color + '99' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{r.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: r.color }}>{r.label}</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.2 }}>
              {r.name[lang]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Mixing zone */}
      <div
        ref={mixRef}
        style={{
          position: 'relative', borderRadius: 20, padding: '20px 16px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 16, overflow: 'hidden',
        }}
      >
        {/* Effect overlay */}
        <AnimatePresence>
          {effect && <EffectOverlay key={effect} effect={effect} color={result?.color ?? '#a78bfa'} active />}
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Flask reagent={slotA} slot="A" lang={lang} />

          {/* Mix button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)' }}>+</div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              animate={reacting ? { rotate: 360 } : { rotate: 0 }}
              transition={reacting ? { duration: 0.6, ease: 'linear' } : {}}
              onClick={handleMix}
              disabled={!slotA || !slotB || reacting}
              style={{
                width: 52, height: 52, borderRadius: '50%', cursor: (!slotA || !slotB) ? 'not-allowed' : 'pointer',
                background: (!slotA || !slotB) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                border: 'none', fontSize: 22,
                boxShadow: (!slotA || !slotB) ? 'none' : '0 0 20px rgba(124,58,237,0.45)',
                display: 'grid', placeItems: 'center',
                transition: 'all 0.3s',
              }}
            >
              🔥
            </motion.button>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              {lang === 'UZ' ? 'Aralashtir!' : 'Смешать!'}
            </div>
          </div>

          <Flask reagent={slotB} slot="B" lang={lang} />
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          style={{
            marginTop: 14, display: 'block', marginLeft: 'auto', marginRight: 'auto',
            padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'inherit',
          }}
        >
          {lang === 'UZ' ? '🔄 Tozalash' : '🔄 Сброс'}
        </button>
      </div>

      {/* Result card */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={result.result}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 14, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            style={{
              borderRadius: 16, padding: '14px 16px',
              background: `${result.color ?? '#7c3aed'}18`,
              border: `1.5px solid ${result.color ?? '#7c3aed'}44`,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16, color: result.color ?? '#a78bfa', marginBottom: 6 }}>
              {slotA?.label} + {slotB?.label} →&nbsp;
              <span style={{ color: '#fff' }}>{result.result}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
              {result.desc?.[lang]}
            </p>
            {result.xp > 0 && !discovered.slice(0,-1).includes(`${slotA?.id}+${slotB?.id}`) && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>
                +{result.xp} XP ✨
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!slotA && !slotB && (
        <div style={{
          marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.22)',
          lineHeight: 1.5,
        }}>
          {lang === 'UZ'
            ? '⬆️ Yuqoridagi reagentlardan ikkitasini tanlang, so\'ng 🔥 bosing'
            : '⬆️ Выбери два реагента выше, затем нажми 🔥'}
        </div>
      )}
    </div>
  )
}
