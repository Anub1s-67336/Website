/**
 * ModuleVictory.jsx — Финальное модальное окно «Победа в модуле»
 * Shows when all activities in a module are completed.
 * Awards rare medal + XP.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const CONFETTI_COLORS = ['#fbbf24', '#a78bfa', '#60a5fa', '#4ade80', '#f87171', '#22d3ee']

function Confetti() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${5 + Math.random() * 90}%`, rotate: 0, opacity: 1 }}
          animate={{ y: '110%', rotate: 360 * (Math.random() > 0.5 ? 1 : -1), opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 2, delay: i * 0.06, ease: 'easeIn' }}
          style={{
            position: 'absolute', top: 0,
            width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      ))}
    </div>
  )
}

export function ModuleVictory({ module, lang, onClose }) {
  const { addXP } = useAuth()

  const DATA = {
    physics: {
      emoji: '⚡',
      titleRU: 'Модуль Физики Пройден!',
      titleUZ: 'Fizika moduli yakunlandi!',
      descRU:  'Ты освоил законы Ньютона, электричество, баллистику и акустику! Ты настоящий физик!',
      descUZ:  'Sen Nyuton qonunlari, elektr, ballistika va akustikani o\'zlashtirishdi! Haqiqiy fiziksen!',
      medal:   '🏆',
      medalRU: 'Мастер Физики',
      medalUZ: 'Fizika Ustasi',
      color:   '#60a5fa',
      gradient:'linear-gradient(135deg,#1e3a8a,#7c2d12)',
      xp: 100,
    },
    biology: {
      emoji: '🧬',
      titleRU: 'Модуль Биологии Пройден!',
      titleUZ: 'Biologiya moduli yakunlandi!',
      descRU:  'Ты изучил тело изнутри, ДНК, иммунную систему и фотосинтез! Ты настоящий биолог!',
      descUZ:  'Sen tanani ichidan, DNK, immunitet tizimi va fotosintezni o\'zlashtirishdi! Haqiqiy biologsen!',
      medal:   '🥇',
      medalRU: 'Мастер Биологии',
      medalUZ: 'Biologiya Ustasi',
      color:   '#4ade80',
      gradient:'linear-gradient(135deg,#064e3b,#1e3a8a)',
      xp: 100,
    },
  }

  const d = DATA[module] ?? DATA.physics

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 40 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 380, width: '100%',
          borderRadius: 28, overflow: 'hidden', position: 'relative',
          background: d.gradient,
          border: `2px solid ${d.color}55`,
          boxShadow: `0 0 60px ${d.color}33`,
        }}
      >
        <Confetti />

        <div style={{ padding: '32px 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {/* Trophy */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}
          >
            {d.emoji}
          </motion.div>

          {/* Title */}
          <h2 style={{
            margin: '0 0 10px', fontSize: 22, fontWeight: 900,
            background: `linear-gradient(90deg,${d.color},#fff)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {lang === 'UZ' ? d.titleUZ : d.titleRU}
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
            {lang === 'UZ' ? d.descUZ : d.descRU}
          </p>

          {/* Rare medal */}
          <div style={{
            padding: '14px 20px', borderRadius: 18, marginBottom: 20,
            background: 'rgba(0,0,0,0.35)', border: `1.5px solid ${d.color}55`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 36, flexShrink: 0 }}
            >
              {d.medal}
            </motion.div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: d.color }}>
                {lang === 'UZ' ? d.medalUZ : d.medalRU}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                {lang === 'UZ' ? '🔮 Kam uchraydigan medal' : '🔮 Редкая медаль'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 900, fontSize: 16, color: '#fbbf24' }}>
              +{d.xp} XP
            </div>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.12, type: 'spring', damping: 10 }}
                style={{ fontSize: 24 }}
              >
                ⭐
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            style={{
              width: '100%', padding: '13px', borderRadius: 16, cursor: 'pointer',
              background: `linear-gradient(135deg,${d.color}dd,${d.color}88)`,
              border: 'none', color: '#fff', fontWeight: 900, fontSize: 16,
              fontFamily: 'inherit',
              boxShadow: `0 6px 20px ${d.color}44`,
            }}
          >
            {lang === 'UZ' ? '🚀 Davom etish!' : '🚀 Продолжить!'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
