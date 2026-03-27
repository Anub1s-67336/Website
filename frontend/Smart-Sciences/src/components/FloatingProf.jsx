/**
 * FloatingProf.jsx — Drone-Assistant widget (top-right, fixed).
 * • Floats with framer-motion spring bobbing + gentle rotation.
 * • Smart comment bubbles react to screen changes via `msg` prop.
 * • Introductory tour (8 steps) fires when xp === 0 on first hub visit.
 * • Tour is saved to localStorage so it only runs once.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TOUR = {
  RU: [
    '👋 Привет! Я Дрон-Ассистент! Давай покажу Smart-Sciences!',
    '📚 Слева — навигация по разделам. Нажми на любой раздел!',
    '⚗️ «Алхимический Реактор» — смешивай реагенты с эффектами!',
    '⚛️ «Таблица Менделеева» — узнай про золото Мурунтау!',
    '🧬 «Сборщик Молекул» — собери глюкозу или кофеин на время!',
    '🔭 «Микроскоп» — исследуй кристаллическую решётку NaCl!',
    '🏆 Зарабатывай XP за каждое задание — расти по уровням!',
    '🚀 Нажимай на меня в любой момент — я помогу! Удачи!',
  ],
  UZ: [
    '👋 Salom! Men Dron-Yordamchiman! Smart-Sciences-ni ko\'rsatay!',
    '📚 Chap tomonda — barcha bo\'limlar navigatsiyasi!',
    '⚗️ «Alkimyoviy Reaktor» — reagentlarni effektlar bilan aralashtir!',
    '⚛️ «Davriy jadval» — O\'zbekiston Muruntovidagi oltin haqida bil!',
    '🧬 «Molekula Yig\'uvchi» — glyukoza yoki kofeinni vaqt ichida yig\'!',
    '🔭 «Mikroskop» — NaCl kristall panjarasini o\'rgan!',
    '🏆 Har bir topshiriq uchun XP qozan — darajalang!',
    '🚀 Istalgan vaqtda meni bos — yordam beraman! Omad!',
  ],
}

export function FloatingProf({ msg, happy = false, onChatOpen, xp = null, lang = 'RU' }) {
  const [blink,    setBlink]    = useState(false)
  const [open,     setOpen]     = useState(true)
  const [tourStep, setTourStep] = useState(0)
  const [inTour,   setInTour]   = useState(false)

  /* ── Eyes blink every 2.8 s ── */
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  /* ── Start tour once when xp === 0 ── */
  useEffect(() => {
    if (xp !== 0) return
    const seen = localStorage.getItem('ss_drone_tour')
    if (seen) return
    const id = setTimeout(() => { setInTour(true); setTourStep(0); setOpen(true) }, 1200)
    return () => clearTimeout(id)
  }, [xp])

  /* ── Auto-advance tour steps ── */
  useEffect(() => {
    if (!inTour) return
    const steps = TOUR[lang] ?? TOUR.RU
    setOpen(true)
    if (tourStep < steps.length - 1) {
      const id = setTimeout(() => setTourStep(s => s + 1), 4000)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => {
        setInTour(false)
        localStorage.setItem('ss_drone_tour', '1')
      }, 4000)
      return () => clearTimeout(id)
    }
  }, [tourStep, inTour, lang])

  /* ── Open bubble whenever the message changes (out of tour) ── */
  useEffect(() => { if (!inTour) setOpen(true) }, [msg, inTour])

  const steps    = TOUR[lang] ?? TOUR.RU
  const shownMsg = inTour ? steps[tourStep] : msg
  const isCyan   = inTour

  /* ── Colors ── */
  const bubbleBg  = isCyan ? 'rgba(8,145,178,0.30)'   : 'rgba(109,40,217,0.28)'
  const bubbleBdr = isCyan ? 'rgba(34,211,238,0.50)'  : 'rgba(167,139,250,0.35)'
  const sphereFrom= isCyan ? '#0e7490' : '#7c3aed'
  const sphereTo  = isCyan ? '#164e63' : '#4c1d95'
  const hatColor  = isCyan ? '#0891b2' : '#7c3aed'
  const mouthBdr  = isCyan ? '#7dd3fc' : '#c4b5fd'

  return (
    <div style={{
      position: 'fixed', top: 70, right: 12, zIndex: 500,
      display: 'flex', alignItems: 'flex-end', gap: 10,
      pointerEvents: 'none',
    }}>
      {/* ── Speech bubble ── */}
      <AnimatePresence mode="wait">
        {open && shownMsg && (
          <motion.div
            key={shownMsg}
            initial={{ opacity: 0, scale: 0.82, x: 14 }}
            animate={{ opacity: 1, scale: 1,    x: 0  }}
            exit={{    opacity: 0, scale: 0.82, x: 14 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              maxWidth: 220, padding: '10px 14px',
              borderRadius: '16px 16px 4px 16px',
              background: bubbleBg,
              border: `1px solid ${bubbleBdr}`,
              backdropFilter: 'blur(14px)',
              boxShadow: `0 4px 22px ${isCyan ? 'rgba(34,211,238,0.22)' : 'rgba(109,40,217,0.28)'}`,
              position: 'relative', pointerEvents: 'auto',
            }}
          >
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, fontWeight: 600, color: 'rgba(255,255,255,0.93)' }}>
              {shownMsg}
            </p>

            {/* Tour progress dots */}
            {inTour && (
              <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: i === tourStep ? 1.3 : 1 }}
                    style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: i === tourStep ? '#22d3ee' : 'rgba(255,255,255,0.22)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tail */}
            <div style={{
              position: 'absolute', right: -8, bottom: 12,
              width: 10, height: 10, transform: 'rotate(45deg)',
              background: bubbleBg,
              borderTop:   `1px solid ${bubbleBdr}`,
              borderRight: `1px solid ${bubbleBdr}`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drone character ── */}
      <motion.div
        animate={{
          y:      [0, -9, 0],
          rotate: inTour ? [-2, 2, -2] : [0, 0, 0],
        }}
        transition={{
          y:      { duration: 3,   repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        onClick={() => onChatOpen ? onChatOpen() : setOpen(v => !v)}
        style={{ flexShrink: 0, cursor: 'pointer', pointerEvents: 'auto' }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.93 }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%', position: 'relative',
          background: `radial-gradient(circle at 35% 30%, ${sphereFrom}, ${sphereTo})`,
          boxShadow: happy
            ? '0 0 28px #a78bfa, 0 0 56px #7c3aed88'
            : isCyan
              ? '0 0 24px rgba(34,211,238,0.55), 0 0 48px rgba(8,145,178,0.30)'
              : '0 0 18px #7c3aed66',
          transition: 'box-shadow .4s, background .5s',
        }}>
          {/* Hat brim */}
          <div style={{
            position: 'absolute', top: -17, left: '50%',
            transform: 'translateX(-50%)',
            width: 40, height: 3, borderRadius: 2, background: hatColor,
          }} />
          {/* Hat body */}
          <div style={{
            position: 'absolute', top: -17, left: '50%',
            transform: 'translateX(-50%)',
            width: 27, height: 16, borderRadius: '6px 6px 0 0',
            background: `linear-gradient(to top, ${sphereTo}, ${sphereFrom})`,
          }} />

          {/* Eyes */}
          <div style={{
            position: 'absolute', top: 13, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between', padding: '0 9px',
          }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: 9, height: 9, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 5, borderRadius: '50%',
                  background: isCyan ? '#0c4a6e' : '#312e81',
                  height: blink ? 1 : 5,
                  transform: (happy || inTour) ? 'translateY(1px)' : 'none',
                  transition: 'height .08s',
                }} />
              </div>
            ))}
          </div>

          {/* Mouth */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            width:  (happy || inTour) ? 16 : 12,
            height: (happy || inTour) ? 8  : 5,
            borderRadius: '0 0 50% 50%',
            border: `2px solid ${mouthBdr}`, borderTop: 'none',
            transition: 'all .3s',
          }} />

          {/* Orbit ring */}
          <div style={{
            position: 'absolute', inset: -9, borderRadius: '50%',
            border: `1px solid ${isCyan ? 'rgba(34,211,238,0.45)' : 'rgba(167,139,250,0.35)'}`,
            animation: 'spinOrb 3s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: '#22d3ee', boxShadow: '0 0 8px #22d3ee',
            }} />
          </div>

          {/* Tour pulse badge */}
          {inTour && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 11, height: 11, borderRadius: '50%',
                background: '#22d3ee', boxShadow: '0 0 8px #22d3ee',
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
