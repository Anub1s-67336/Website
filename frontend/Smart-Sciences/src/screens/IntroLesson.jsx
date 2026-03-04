/**
 * IntroLesson.jsx — Interactive intro chemistry lesson.
 *
 * Auto-launches when: user xp === 0 && !localStorage.ss_intro_done
 * Awards 50 XP + 'first' medal on completion (clicking the final button).
 * Skipping closes without awarding XP/medal but marks ss_intro_done.
 *
 * Steps:
 *   0 — Welcome / What is chemistry?  (floating atom visuals)
 *   1 — Interactive atom SVG          (click nucleus + electron)
 *   2 — Element cards grid            (click 3 or more)
 *   3 — Mini-quiz                     (3 questions, all correct to advance)
 *   4 — Win screen
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { snd }    from '../utils/sound.js'
import { T }      from '../data/translations.js'

const TOTAL_STEPS = 5

// ── Floating atom blob (decorative) ─────────────────────────────
function FloatingAtom({ x, y, color, size = 40, delay = 0 }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: '50%',
        background: color, opacity: 0.55,
        filter: `blur(1px)`,
        pointerEvents: 'none',
        boxShadow: `0 0 12px ${color}`,
      }}
      animate={{ y: [0, -14, 0], scale: [1, 1.07, 1] }}
      transition={{ duration: 2.6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

// ── Step 0 — Welcome ────────────────────────────────────────────
function WelcomeStep({ tL }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', height: 150, marginBottom: 18 }}>
        <FloatingAtom x="12%"  y="10%" color="#818cf8" size={48} delay={0}   />
        <FloatingAtom x="55%"  y="32%" color="#22d3ee" size={34} delay={0.5} />
        <FloatingAtom x="72%"  y="6%"  color="#a78bfa" size={40} delay={1}   />
        <FloatingAtom x="8%"   y="56%" color="#f9a8d4" size={28} delay={0.8} />
        <FloatingAtom x="62%"  y="60%" color="#4ade80" size={36} delay={0.3} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 62,
        }}>
          ⚛
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
        {tL.stepDescs[0]}
      </p>
    </div>
  )
}

// ── Step 1 — Interactive atom ───────────────────────────────────
function AtomStep({ tL, onReady }) {
  const [nucleusClicked,  setNucleusClicked]  = useState(false)
  const [electronClicked, setElectronClicked] = useState(false)

  useEffect(() => {
    onReady(nucleusClicked && electronClicked)
  }, [nucleusClicked, electronClicked, onReady])

  const electrons = [
    { angle: 0,   r: 64, color: '#22d3ee' },
    { angle: 120, r: 64, color: '#22d3ee' },
    { angle: 240, r: 64, color: '#22d3ee' },
    { angle: 60,  r: 88, color: '#4fc3f7' },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 16 }}>
        {tL.stepDescs[1]}
      </p>
      <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
        {/* Orbit rings */}
        {[64, 88].map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 100 - r, left: 100 - r,
            width: r * 2, height: r * 2, borderRadius: '50%',
            border: '1px solid rgba(167,139,250,0.22)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* Electrons */}
        {electrons.map((e, i) => {
          const rad = (e.angle * Math.PI) / 180
          const cx  = 100 + e.r * Math.cos(rad)
          const cy  = 100 + e.r * Math.sin(rad)
          return (
            <motion.button
              key={i}
              onClick={() => { setElectronClicked(true); snd('catch') }}
              whileTap={{ scale: 0.75 }}
              style={{
                position: 'absolute',
                left: cx - 10, top: cy - 10,
                width: 20, height: 20, borderRadius: '50%',
                background: electronClicked ? '#4ade80' : e.color,
                boxShadow: `0 0 8px ${electronClicked ? '#4ade80' : e.color}`,
                border: 'none', cursor: 'pointer',
                transition: 'background .3s, box-shadow .3s',
              }}
            />
          )
        })}

        {/* Nucleus */}
        <motion.button
          onClick={() => { setNucleusClicked(true); snd('drop') }}
          whileTap={{ scale: 0.88 }}
          style={{
            position: 'absolute', top: 75, left: 75,
            width: 50, height: 50, borderRadius: '50%',
            background: nucleusClicked
              ? 'radial-gradient(circle, #fbbf24, #f59e0b)'
              : 'radial-gradient(circle, #a78bfa, #7c3aed)',
            boxShadow: nucleusClicked ? '0 0 20px #fbbf24aa' : '0 0 16px #7c3aed88',
            border: 'none', cursor: 'pointer', fontSize: 18,
            transition: 'all .3s',
          }}
        >
          ☢️
        </motion.button>
      </div>

      {/* Interaction labels */}
      <div style={{ marginTop: 14, display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: nucleusClicked ? '#fbbf24' : 'rgba(255,255,255,0.3)', transition: 'color .3s' }}>
          {nucleusClicked ? '✓ ' : '○ '}{tL.nucleusLabel}
        </span>
        <span style={{ fontSize: 12, color: electronClicked ? '#4ade80' : 'rgba(255,255,255,0.3)', transition: 'color .3s' }}>
          {electronClicked ? '✓ ' : '○ '}{tL.electronLabel}
        </span>
      </div>
    </div>
  )
}

// ── Step 2 — Elements grid ──────────────────────────────────────
function ElementsStep({ tL, onReady }) {
  const [clicked, setClicked] = useState(new Set())

  useEffect(() => {
    onReady(clicked.size >= 3)
  }, [clicked, onReady])

  function toggle(i) {
    setClicked(prev => new Set([...prev, i]))
    snd('click')
  }

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
        {tL.clickElements}
        <span style={{ color: clicked.size >= 3 ? '#4ade80' : 'rgba(255,255,255,0.35)', marginLeft: 6 }}>
          ({clicked.size}/3)
        </span>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {tL.elements.map((el, i) => {
          const on = clicked.has(i)
          return (
            <motion.button
              key={i}
              onClick={() => toggle(i)}
              whileTap={{ scale: 0.94 }}
              style={{
                padding: '10px 6px', borderRadius: 12, fontFamily: 'inherit',
                background: on ? `${el.col}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? el.col : 'rgba(255,255,255,0.09)'}`,
                cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
              }}
            >
              <div style={{
                fontSize: 20, fontWeight: 900, fontFamily: 'monospace',
                color: on ? el.col : 'rgba(255,255,255,0.7)',
              }}>
                {el.sym}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                {el.name}
              </div>
              {on && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: 9, color: el.col, marginTop: 5, lineHeight: 1.35 }}
                >
                  {el.fact}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3 — Mini-quiz ──────────────────────────────────────────
function QuizStep({ tL, onReady }) {
  const [qIdx,    setQIdx]    = useState(0)
  const [answers, setAnswers] = useState([null, null, null])
  const [selected, setSelected] = useState(null)

  const allCorrect = answers.every(a => a === true)

  useEffect(() => {
    onReady(allCorrect)
  }, [allCorrect, onReady])

  const quiz = tL.quiz
  const q    = quiz[qIdx]

  function choose(optIdx) {
    if (answers[qIdx] !== null) return
    const correct   = optIdx === q.ans
    const newAnswers = [...answers]
    newAnswers[qIdx] = correct
    setAnswers(newAnswers)
    setSelected(optIdx)
    snd(correct ? 'win' : 'wrong')
    if (correct && qIdx < quiz.length - 1) {
      setTimeout(() => { setQIdx(q => q + 1); setSelected(null) }, 850)
    }
  }

  function retry() {
    setAnswers(prev => { const n = [...prev]; n[qIdx] = null; return n })
    setSelected(null)
  }

  return (
    <div>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {quiz.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%', transition: 'background .3s',
            background: answers[i] === true  ? '#4ade80'
                      : answers[i] === false ? '#f87171'
                      : i === qIdx           ? '#818cf8'
                      :                        'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 20  }}
          animate={{ opacity: 1, x: 0   }}
          exit={{    opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
        >
          <p style={{
            color: '#e2e8f0', fontWeight: 700, fontSize: 15,
            marginBottom: 16, textAlign: 'center',
          }}>
            {q.q}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {q.opts.map((opt, i) => {
              const answered   = answers[qIdx] !== null
              const isCorrect  = i === q.ans
              const isSelected = i === selected
              let bg     = 'rgba(255,255,255,0.05)'
              let border = 'rgba(255,255,255,0.1)'
              if (answered) {
                if (isCorrect)               { bg = 'rgba(74,222,128,0.15)';  border = '#4ade80' }
                if (isSelected && !isCorrect) { bg = 'rgba(248,113,113,0.15)'; border = '#f87171' }
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{
                    padding: '12px 8px', borderRadius: 10, fontFamily: 'inherit',
                    background: bg, border: `1px solid ${border}`,
                    color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                    cursor: answered ? 'default' : 'pointer',
                    transition: 'all .2s', textAlign: 'center',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {answers[qIdx] === false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12, textAlign: 'center' }}
            >
              <button
                onClick={retry}
                style={{
                  padding: '8px 20px', borderRadius: 10, border: 'none',
                  background: 'rgba(255,255,255,0.09)', color: '#e2e8f0',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                }}
              >
                {tL.retry}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Step 4 — Win screen ─────────────────────────────────────────
function WinStep({ tL }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 200 }}
      style={{ textAlign: 'center' }}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ fontSize: 64, marginBottom: 12 }}
      >
        🎉
      </motion.div>

      <div style={{
        display: 'inline-flex', flexDirection: 'column', gap: 8,
        padding: '14px 24px', borderRadius: 16, marginBottom: 14,
        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
      }}>
        <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 18 }}>{tL.xpEarned}</div>
        <div style={{ color: '#fbbf24', fontSize: 14 }}>⚗️ {tL.medalEarned}</div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
        {tL.stepDescs[4]}
      </p>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────────
export function IntroLesson({ lang, onComplete }) {
  const { addXP, addMedal } = useAuth()
  const [step, setStep]         = useState(0)
  const [canAdvance, setCanAdvance] = useState(true) // step 0 is always passable

  const tL = T[lang].introLesson

  // Steps 0 and 4 are always passable; steps 1-3 require interaction
  useEffect(() => {
    if (step === 0 || step === 4) setCanAdvance(true)
    else setCanAdvance(false)
  }, [step])

  // Stable setter passed to child components
  const handleReady = useCallback((val) => setCanAdvance(val), [])

  function handleNext() {
    if (step === 4) {
      addXP(50)
      addMedal('first')
      snd('medal')
      onComplete()
      return
    }
    snd('click')
    setStep(s => s + 1)
  }

  function handleSkip() {
    snd('click')
    onComplete()   // marks done in localStorage without awarding XP/medal
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'linear-gradient(135deg,#060713 0%,#0b0b25 55%,#100524 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif",
      padding: '20px 16px',
      overflowY: 'auto',
    }}>

      {/* ── Header: title + skip ── */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ fontWeight: 900, fontSize: 17, color: '#e2e8f0' }}
            >
              {tL.stepTitles[step]}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <button
              onClick={handleSkip}
              style={{
                padding: '4px 14px', borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.38)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {tL.skip}
            </button>
          )}
        </div>

        {/* Step progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg,#818cf8,#22d3ee)' }}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ── Professor speech bubble ── */}
      <div style={{
        width: '100%', maxWidth: 480, marginBottom: 16,
        padding: '11px 16px', borderRadius: 16,
        background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(167,139,250,0.28)',
        backdropFilter: 'blur(12px)',
      }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 5  }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
          >
            <span style={{ marginRight: 6 }}>⚗️</span>
            {tL.profMsgs[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Step content card ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '20px 16px', borderRadius: 20,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 18, minHeight: 260,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12  }}
              animate={{ opacity: 1, y: 0   }}
              exit={{    opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              {step === 0 && <WelcomeStep  tL={tL} />}
              {step === 1 && <AtomStep     tL={tL} onReady={handleReady} />}
              {step === 2 && <ElementsStep tL={tL} onReady={handleReady} />}
              {step === 3 && <QuizStep     tL={tL} onReady={handleReady} />}
              {step === 4 && <WinStep      tL={tL} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Next / Finish button ── */}
      <motion.button
        onClick={handleNext}
        disabled={!canAdvance}
        whileTap={canAdvance ? { scale: 0.96 } : {}}
        style={{
          padding: '14px 44px', borderRadius: 16, border: 'none',
          background: canAdvance
            ? 'linear-gradient(135deg,#818cf8,#22d3ee)'
            : 'rgba(255,255,255,0.07)',
          color:  canAdvance ? '#fff' : 'rgba(255,255,255,0.22)',
          fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
          cursor: canAdvance ? 'pointer' : 'default',
          boxShadow: canAdvance ? '0 4px 20px rgba(129,140,248,0.4)' : 'none',
          transition: 'all .3s',
        }}
      >
        {step === 4 ? tL.finish : tL.next}
      </motion.button>

      {/* ── Step indicator dots ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 8, height: 8, borderRadius: 4,
            background: i < step ? '#818cf8' : i === step ? '#a78bfa' : 'rgba(255,255,255,0.14)',
            transition: 'all .3s',
          }} />
        ))}
      </div>
    </div>
  )
}
