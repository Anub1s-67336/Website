/**
 * ChemBasicsLesson.jsx
 * ─────────────────────────────────────────────────────────────
 * Introductory chemistry lesson — 5 interactive steps:
 *   0  What is Chemistry?  (read + visual examples)
 *   1  Chemistry Everywhere (click 4 compound cards, need 3)
 *   2  Atoms & Molecules   (click H and O in an H₂O diagram)
 *   3  Quiz                (3 questions, retry on wrong)
 *   4  Win screen          (+50 XP + lesson_chembasics medal)
 *
 * Receives standard screenProps: { t, lang, setMsg, setHappy, addPts, onBack }
 * Awards are protected by the 'lesson_chembasics' medal check (idempotent).
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const TOTAL_STEPS = 5   // steps 0–4

// ── Decorative floating blob ──────────────────────────────────
function FloatingAtom({ style }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.25), transparent)',
        border: '1px solid rgba(167,139,250,0.18)',
        position: 'absolute', pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

// ── In-lesson professor speech bubble ────────────────────────
function ProfBubble({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -6 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={  { opacity: 0, scale: 0.85, y: -6  }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        background: 'rgba(30,27,75,0.92)',
        border: '1px solid rgba(167,139,250,0.28)',
        borderRadius: 12, padding: '11px 15px',
        fontSize: 13, color: 'rgba(255,255,255,0.82)',
        lineHeight: 1.55, marginBottom: 14,
      }}
    >
      <span style={{ marginRight: 7 }}>🧑‍🔬</span>{msg}
    </motion.div>
  )
}

// ── Step 0: What is Chemistry? ────────────────────────────────
function WelcomeStep({ tx }) {
  return (
    <div style={{ position: 'relative', paddingTop: 8 }}>
      <FloatingAtom style={{ top: -8,  left: '4%',  width: 56, height: 56 }} />
      <FloatingAtom style={{ top: '30%', right: '6%', width: 36, height: 36 }} />
      <FloatingAtom style={{ bottom: 0, left: '18%', width: 28, height: 28 }} />

      <div style={{ textAlign: 'center', padding: '4px 0 20px' }}>
        <motion.div
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 52, marginBottom: 14, display: 'inline-block' }}
        >⚗️</motion.div>

        <p style={{
          color: 'rgba(255,255,255,0.75)', lineHeight: 1.7,
          fontSize: 14, margin: '0 0 20px',
        }}>
          {tx.stepDescs[0]}
        </p>
      </div>

      {/* Quick-glance examples */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {tx.examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * 0.12 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 9,
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{ex.icon}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.4 }}>
              {ex.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Step 1: Compound cards (click ≥ 3) ───────────────────────
function DailyLifeStep({ tx, clicked, onCardClick }) {
  const needed = 3
  const hint = tx.clickCards.replace('{n}', `${clicked.size}/${needed}`)

  return (
    <div>
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', marginBottom: 12,
      }}>
        {hint}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tx.cards.map((card, i) => {
          const active = clicked.has(i)
          return (
            <motion.button
              key={i}
              onClick={() => onCardClick(i)}
              whileTap={{ scale: 0.94 }}
              style={{
                background: active ? `${card.col}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? card.col + '55' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: '14px 12px',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: active ? `0 0 14px ${card.col}28` : 'none',
                transition: 'all 0.28s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 5 }}>{card.icon}</div>
              <div style={{
                fontSize: 13, fontWeight: 700, marginBottom: 3,
                color: active ? card.col : 'rgba(255,255,255,0.72)',
              }}>
                {card.name}
              </div>
              <div style={{
                fontSize: 11, fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.38)', marginBottom: active ? 6 : 0,
              }}>
                {card.formula}
              </div>
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={  { opacity: 0, height: 0 }}
                    style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.45, overflow: 'hidden',
                    }}
                  >
                    {card.fact}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 2: H₂O molecule interaction ─────────────────────────
function MoleculeStep({ tx, atomsClicked, onAtomClick }) {
  const ATOMS = [
    { sym: 'H', key: 'H', col: '#67e8f9', side: 'left'  },
    { sym: 'O', key: 'O', col: '#f472b6', side: 'center' },
    { sym: 'H', key: 'H', col: '#67e8f9', side: 'right' },
  ]

  return (
    <div>
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', marginBottom: 20,
      }}>
        {tx.moleculeHint}
      </p>

      {/* H—O—H visual */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, marginBottom: 24,
      }}>
        {ATOMS.map((atom, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{
                width: 28, height: 3,
                background: `linear-gradient(90deg,${ATOMS[i-1].col}55,${atom.col}55)`,
                boxShadow: `0 0 6px ${atom.col}33`,
              }} />
            )}
            <motion.button
              onClick={() => onAtomClick(atom.key)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9  }}
              animate={atomsClicked.has(atom.key)
                ? { boxShadow: [`0 0 10px ${atom.col}`, `0 0 22px ${atom.col}`, `0 0 10px ${atom.col}`] }
                : { boxShadow: '0 0 0px transparent' }
              }
              transition={{ duration: 1.4, repeat: atomsClicked.has(atom.key) ? Infinity : 0 }}
              style={{
                width: 62, height: 62, borderRadius: '50%',
                background: atomsClicked.has(atom.key)
                  ? `radial-gradient(circle, ${atom.col}44, ${atom.col}18)`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${atom.col}${atomsClicked.has(atom.key) ? 'bb' : '35'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column',
                fontSize: 15, fontWeight: 900, color: atom.col,
                transition: 'background 0.3s, border-color 0.3s',
              }}
            >
              {atom.sym}
            </motion.button>
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {atomsClicked.has('H') && (
            <motion.div
              key="H"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0   }}
              exit={  { opacity: 0, x: -18  }}
              style={{
                background: 'rgba(103,232,249,0.08)',
                border: '1px solid rgba(103,232,249,0.24)',
                borderRadius: 10, padding: '10px 14px',
              }}
            >
              <span style={{ color: '#67e8f9', fontWeight: 700, fontSize: 13 }}>
                H — {tx.atomLabels.H}:{' '}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 13 }}>
                {tx.atomFacts.H}
              </span>
            </motion.div>
          )}
          {atomsClicked.has('O') && (
            <motion.div
              key="O"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0   }}
              exit={  { opacity: 0, x: -18  }}
              style={{
                background: 'rgba(244,114,182,0.08)',
                border: '1px solid rgba(244,114,182,0.24)',
                borderRadius: 10, padding: '10px 14px',
              }}
            >
              <span style={{ color: '#f472b6', fontWeight: 700, fontSize: 13 }}>
                O — {tx.atomLabels.O}:{' '}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 13 }}>
                {tx.atomFacts.O}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Step 3: Quiz ──────────────────────────────────────────────
function QuizStep({ tx, onComplete }) {
  const [qIdx,     setQIdx]     = useState(0)
  const [selected, setSelected] = useState(null)
  const [done,     setDone]     = useState(false)
  const [correct,  setCorrect]  = useState(0)

  function handleAnswer(i) {
    if (selected !== null) return
    setSelected(i)
    const isRight = i === tx.quiz[qIdx].ans

    if (isRight) {
      const newCorrect = correct + 1
      setCorrect(newCorrect)
      if (qIdx < tx.quiz.length - 1) {
        setTimeout(() => { setQIdx(q => q + 1); setSelected(null) }, 800)
      } else {
        setTimeout(() => { setDone(true); onComplete() }, 800)
      }
    } else {
      // Wrong — shake and let them retry after a pause
      setTimeout(() => setSelected(null), 1100)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '28px 0' }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
        <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>
          {tx.allCorrect}
        </div>
      </motion.div>
    )
  }

  const q = tx.quiz[qIdx]

  return (
    <div>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 16 }}>
        {tx.quiz.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s',
            background: i < correct ? '#4ade80'
                      : i === qIdx ? '#a78bfa'
                      : 'rgba(255,255,255,0.14)',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0  }}
          exit={  { opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center', marginBottom: 16, lineHeight: 1.55,
          }}>
            {q.q}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {q.opts.map((opt, i) => {
              const isSel    = selected === i
              const isRight  = i === q.ans
              let bg     = 'rgba(255,255,255,0.04)'
              let border = 'rgba(255,255,255,0.1)'
              let col    = 'rgba(255,255,255,0.72)'
              if (isSel && isRight)  { bg = 'rgba(74,222,128,0.15)'; border = '#4ade80'; col = '#4ade80' }
              if (isSel && !isRight) { bg = 'rgba(248,113,113,0.15)'; border = '#f87171'; col = '#f87171' }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  whileTap={selected === null ? { scale: 0.95 } : {}}
                  animate={isSel && !isRight ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 10, padding: '12px 10px',
                    cursor: selected !== null ? 'default' : 'pointer',
                    color: col, fontWeight: 600, fontSize: 13,
                    transition: 'background 0.25s, border-color 0.25s, color 0.25s',
                    textAlign: 'center',
                  }}
                >
                  {opt}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Step 4: Win ───────────────────────────────────────────────
function WinStep({ tx }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '12px 0' }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: 54, display: 'inline-block', marginBottom: 14 }}
      >⚗️</motion.div>

      <h3 style={{
        fontSize: 20, fontWeight: 900, color: '#fbbf24',
        marginBottom: 10,
      }}>
        {tx.winTitle}
      </h3>

      <p style={{
        fontSize: 14, color: 'rgba(255,255,255,0.68)',
        marginBottom: 18, lineHeight: 1.65,
      }}>
        {tx.winDesc}
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(74,222,128,0.14)',
          border: '1px solid rgba(74,222,128,0.38)',
          borderRadius: 20, padding: '6px 18px',
          fontSize: 13, fontWeight: 700, color: '#4ade80',
        }}>
          +50 XP
        </div>
        <div style={{
          background: 'rgba(251,191,36,0.14)',
          border: '1px solid rgba(251,191,36,0.38)',
          borderRadius: 20, padding: '6px 18px',
          fontSize: 13, fontWeight: 700, color: '#fbbf24',
        }}>
          ⚗️ {tx.medalName}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────
export function ChemBasicsLesson({ t, setHappy, onBack }) {
  const { addXP, addMedal, medals } = useAuth()
  const tx = t.chemBasicsLesson

  const [step,         setStep]         = useState(0)
  const [cardsClicked, setCardsClicked] = useState(new Set())
  const [atomsClicked, setAtomsClicked] = useState(new Set())
  const [quizDone,     setQuizDone]     = useState(false)

  // XP/medal are awarded only once (idempotent via medal check)
  const alreadyRewarded = medals.includes('lesson_chembasics')

  const isWin = step === TOTAL_STEPS - 1

  const canNext = (
    step === 0 ? true :
    step === 1 ? cardsClicked.size >= 3 :
    step === 2 ? atomsClicked.has('H') && atomsClicked.has('O') :
    step === 3 ? quizDone :
    true
  )

  function handleNext() {
    if (!canNext) return
    // Award on transition to win screen
    if (step === TOTAL_STEPS - 2) {
      if (!alreadyRewarded) {
        addXP(50)
        addMedal('lesson_chembasics')
        if (setHappy) setHappy(true)
      }
    }
    setStep(s => s + 1)
  }

  function handleCardClick(i) {
    setCardsClicked(prev => new Set([...prev, i]))
  }

  function handleAtomClick(key) {
    setAtomsClicked(prev => new Set([...prev, key]))
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100

  return (
    <div style={{
      padding: '24px 20px',
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '5px 12px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 13,
            }}
          >
            ← {tx.back}
          </motion.button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
            {step + 1} / {TOTAL_STEPS}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, background: 'rgba(255,255,255,0.08)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg,#a78bfa,#22d3ee)',
            }}
          />
        </div>
      </div>

      {/* ── Professor bubble (step-specific) ── */}
      <AnimatePresence mode="wait">
        <ProfBubble key={step} msg={tx.profMsgs[step]} />
      </AnimatePresence>

      {/* ── Step title ── */}
      <h2 style={{
        fontSize: 17, fontWeight: 900, marginBottom: 14,
        background: 'linear-gradient(90deg,#a78bfa,#22d3ee)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {tx.stepTitles[step]}
      </h2>

      {/* ── Step content ── */}
      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0  }}
            exit={  { opacity: 0, x: -28 }}
            transition={{ duration: 0.22 }}
          >
            {step === 0 && <WelcomeStep tx={tx} />}
            {step === 1 && (
              <DailyLifeStep
                tx={tx}
                clicked={cardsClicked}
                onCardClick={handleCardClick}
              />
            )}
            {step === 2 && (
              <MoleculeStep
                tx={tx}
                atomsClicked={atomsClicked}
                onAtomClick={handleAtomClick}
              />
            )}
            {step === 3 && (
              <QuizStep tx={tx} onComplete={() => setQuizDone(true)} />
            )}
            {step === 4 && <WinStep tx={tx} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom button ── */}
      {!isWin ? (
        <motion.button
          onClick={handleNext}
          disabled={!canNext}
          whileTap={canNext ? { scale: 0.97 } : {}}
          style={{
            marginTop: 22,
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: canNext
              ? 'linear-gradient(90deg,#7c3aed,#0ea5e9)'
              : 'rgba(255,255,255,0.06)',
            color: canNext ? '#fff' : 'rgba(255,255,255,0.22)',
            fontWeight: 800, fontSize: 15, width: '100%',
            cursor: canNext ? 'pointer' : 'default',
            boxShadow: canNext ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
            transition: 'all 0.28s',
          }}
        >
          {step === TOTAL_STEPS - 2 ? tx.finish : tx.next}
        </motion.button>
      ) : (
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 22, padding: '14px 24px',
            borderRadius: 12, border: 'none', width: '100%',
            background: 'linear-gradient(90deg,#f59e0b,#ef4444)',
            color: '#fff', fontWeight: 800, fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
          }}
        >
          🚀 {tx.backToHome}
        </motion.button>
      )}
    </div>
  )
}
