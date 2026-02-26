/**
 * Tutorial.jsx — Guided onboarding overlay for first-time users.
 *
 * Uses framer-motion for smooth animations.
 * ⚠ Run `npm install` in frontend/Smart-Sciences/ before first launch.
 *
 * Props:
 *   lang        — 'RU' | 'UZ'
 *   onComplete  — called when user finishes or skips the tutorial
 *   addXP       — from useAuth() — awards 50 XP on completion
 *   addMedal    — from useAuth() — awards 'tutorial_done' medal
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { snd } from '../utils/sound.js'

// ── Drone SVG character ─────────────────────────────────────────
function Drone({ happy }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left rotor blade */}
      <ellipse cx="17" cy="26" rx="15" ry="4.5" fill="#4f46e5" opacity="0.85"/>
      {/* Right rotor blade */}
      <ellipse cx="79" cy="26" rx="15" ry="4.5" fill="#4f46e5" opacity="0.85"/>
      {/* Left arm */}
      <line x1="17" y1="26" x2="26" y2="34" stroke="#818cf8" strokeWidth="3" strokeLinecap="round"/>
      {/* Right arm */}
      <line x1="79" y1="26" x2="70" y2="34" stroke="#818cf8" strokeWidth="3" strokeLinecap="round"/>
      {/* Body */}
      <rect x="24" y="34" width="48" height="36" rx="16" fill="#1e1b4b"/>
      <rect x="24" y="34" width="48" height="36" rx="16" stroke="#818cf8" strokeWidth="1.5" opacity="0.8"/>
      {/* Eye left */}
      <circle cx="37" cy="48" r="8" fill="#22d3ee"/>
      <circle cx="37" cy="48" r="5" fill="white"/>
      <circle cx="38.5" cy="47" r="2.5" fill="#0e7490"/>
      {/* Eye right */}
      <circle cx="59" cy="48" r="8" fill="#22d3ee"/>
      <circle cx="59" cy="48" r="5" fill="white"/>
      <circle cx="60.5" cy="47" r="2.5" fill="#0e7490"/>
      {/* Mouth happy / neutral */}
      {happy
        ? <path d="M36 60 Q48 70 60 60" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        : <path d="M36 61 Q48 66 60 61" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      }
      {/* Antenna */}
      <line x1="48" y1="34" x2="48" y2="22" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="48" cy="19" r="4.5" fill="#f472b6"/>
      <circle cx="48" cy="19" r="2.5" fill="#fce7f3" opacity="0.9"/>
      {/* Thrusters */}
      <rect x="30" y="68" width="12" height="9" rx="4.5" fill="#3730a3"/>
      <rect x="54" y="68" width="12" height="9" rx="4.5" fill="#3730a3"/>
      {/* Thruster glow */}
      <ellipse cx="36" cy="79" rx="5" ry="2.5" fill="#818cf8" opacity="0.55"/>
      <ellipse cx="60" cy="79" rx="5" ry="2.5" fill="#818cf8" opacity="0.55"/>
    </svg>
  )
}

// ── Pulsing highlight ring (points at nav items) ────────────────
// Positions: bottom nav on mobile, approximate screen positions
function HighlightRing({ id }) {
  const positions = {
    xp:       { top: 72,         left: '50%', transform: 'translateX(-50%)' },
    lab:      { bottom: 76,      left: '33%', transform: 'translateX(-50%)' },
    electron: { bottom: 76,      left: '50%', transform: 'translateX(-50%)' },
    medals:   { bottom: 76,      left: '67%', transform: 'translateX(-50%)' },
  }
  const pos = positions[id]
  if (!pos) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{
        position: 'fixed',
        width: 60, height: 60,
        borderRadius: '50%',
        border: '3px solid #818cf8',
        boxShadow: '0 0 26px rgba(129,140,248,0.7)',
        animation: 'organPulse 1.5s ease-out infinite',
        pointerEvents: 'none',
        zIndex: 10001,
        ...pos,
      }}
    />
  )
}

// ── Tutorial component ──────────────────────────────────────────
export function Tutorial({ lang, onComplete }) {
  const { addXP, addMedal } = useAuth()
  const [step,  setStep]  = useState(0)
  const [happy, setHappy] = useState(false)

  const tl     = lang === 'UZ'
  const steps  = tl
    ? [
        { text: 'Salom, yosh kimyogar! Men Dron-Yordamchi! 🤖 Smart-Sciences bo\'ylab yo\'lboshchilik qilaman!', highlight: null },
        { text: 'Bu sizning TAJRIBA (XP) ⬆️ Qancha ko\'p vazifa bajarsangiz — daraja shuncha yuqori! Har keyingi daraja 20% ko\'proq XP talab qiladi.', highlight: 'xp' },
        { text: '🧪 Laboratoriya — atomlardan molekulalar yig\'ing va har biri uchun XP oling!', highlight: 'lab' },
        { text: '⚡ «Elektron Ovi» — yangi mini-o\'yin! Ko\'k elektronlarni ushlang, pushti protonlardan saqlaning!', highlight: 'electron' },
        { text: '🏆 Yutuqlar — kunlik topshiriqlar va kamyob medallar. Har kuni yangilanadi!', highlight: 'medals' },
        { text: 'Hammasi tayyor! Muvaffaqiyat formulasi: Topshiriqlar → XP → Darajalar → Medallar. Omad! 🚀', highlight: null, isLast: true },
      ]
    : [
        { text: 'Привет, юный химик! Я — Дрон-Помощник! 🤖 Проведу тебя по Smart-Sciences!', highlight: null },
        { text: 'Это твой ОПЫТ (XP) ⬆️ Чем больше задач решаешь — тем выше уровень! Каждый следующий уровень требует на 20% больше XP.', highlight: 'xp' },
        { text: '🧪 Лаборатория — собирай молекулы из атомов и зарабатывай XP за каждую!', highlight: 'lab' },
        { text: '⚡ «Охота за электронами» — новая мини-игра! Лови синие электроны, избегай розовых протонов!', highlight: 'electron' },
        { text: '🏆 Достижения — ежедневные задания с редкими медалями. Обновляются каждый день!', highlight: 'medals' },
        { text: 'Всё готово! Формула успеха: Задания → XP → Уровни → Медали. Удачи, химик! 🚀', highlight: null, isLast: true },
      ]

  const cur = steps[step]

  // Sound on each step change
  useEffect(() => {
    snd('think')
    // TODO: add your own narration audio here, e.g.:
    // new Audio(`/sounds/tutorial_step_${step + 1}.mp3`).play().catch(() => {})
  }, [step])

  function advance() {
    if (cur.isLast) {
      setHappy(true)
      snd('win')
      // TODO: replace with your own completion sound:
      // new Audio('/sounds/tutorial_complete.mp3').play().catch(() => {})
      addXP(50)
      addMedal('tutorial_done')
      setTimeout(onComplete, 750)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(6,7,19,0.87)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Nunito', sans-serif",
        padding: '20px 16px',
      }}
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: 'rgba(255,255,255,0.45)',
          borderRadius: 9, padding: '7px 18px',
          cursor: 'pointer', fontSize: 13,
          fontFamily: 'inherit',
        }}
      >
        {tl ? "O'tkazish" : 'Пропустить'}
      </button>

      {/* Floating drone character */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          filter: happy
            ? 'drop-shadow(0 0 24px #4ade80)'
            : 'drop-shadow(0 0 16px #818cf8)',
          marginBottom: 14,
        }}
      >
        <Drone happy={happy} />
      </motion.div>

      {/* Step progress dots */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 22 }}>
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 26 : 8, opacity: i <= step ? 1 : 0.28 }}
            transition={{ duration: 0.3 }}
            style={{
              height: 8, borderRadius: 4,
              background: i === step ? '#818cf8' : 'rgba(255,255,255,0.22)',
            }}
          />
        ))}
      </div>

      {/* Speech bubble with animated step transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.87, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.87, y: -16 }}
          transition={{ type: 'spring', stiffness: 290, damping: 24 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30,27,75,0.97), rgba(45,42,110,0.97))',
            border: '1.5px solid rgba(129,140,248,0.45)',
            borderRadius: 24, padding: '28px 32px',
            maxWidth: 460, width: '100%', textAlign: 'center',
            boxShadow: '0 0 60px rgba(129,140,248,0.18), 0 16px 48px rgba(0,0,0,0.55)',
            position: 'relative',
          }}
        >
          {/* Bubble tail pointing up toward drone */}
          <div style={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '12px solid rgba(129,140,248,0.45)',
          }} />

          <p style={{
            color: '#e2e8f0', fontSize: 15.5, lineHeight: 1.8,
            margin: '0 0 24px', fontWeight: 500,
          }}>
            {cur.text}
          </p>

          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 8px 28px rgba(99,102,241,0.65)' }}
            whileTap={{ scale: 0.94 }}
            onClick={advance}
            style={{
              background: cur.isLast
                ? 'linear-gradient(135deg, #4ade80, #22d3ee)'
                : 'linear-gradient(135deg, #818cf8, #6366f1)',
              border: 'none', borderRadius: 14,
              padding: '12px 40px', cursor: 'pointer',
              color: '#fff', fontWeight: 800, fontSize: 15,
              boxShadow: '0 4px 18px rgba(99,102,241,0.42)',
              fontFamily: 'inherit',
            }}
          >
            {cur.isLast
              ? (tl ? '🚀 Boshlash!' : '🚀 Начать!')
              : (tl ? 'Keyingi →' : 'Далее →')
            }
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Step counter */}
      <div style={{ marginTop: 18, color: 'rgba(255,255,255,0.26)', fontSize: 12, letterSpacing: 1 }}>
        {step + 1} / {steps.length}
      </div>

      {/* Navigation highlight ring */}
      <AnimatePresence>
        {cur.highlight && <HighlightRing key={cur.highlight} id={cur.highlight} />}
      </AnimatePresence>
    </motion.div>
  )
}
