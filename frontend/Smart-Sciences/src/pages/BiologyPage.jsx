/**
 * BiologyPage.jsx — Biology Module (Module 3).
 * 4 activities: BodyScanner, DNAHelix, ImmuneDefender, Photosynthesis.
 * Drone comments in RU/UZ. Module Victory modal on completion.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { Stars } from '../components/Stars.jsx'
import { FloatingProf } from '../components/FloatingProf.jsx'
import { ProfessorChat } from '../components/ProfessorChat.jsx'
import { ModuleVictory } from '../components/ModuleVictory.jsx'
import { Particles, makeBurst } from '../components/Particles.jsx'
import { BioBodyScanner } from '../screens/BioBodyScanner.jsx'
import { DNAHelix } from '../screens/DNAHelix.jsx'
import { ImmuneDefender } from '../screens/ImmuneDefender.jsx'
import { Photosynthesis } from '../screens/Photosynthesis.jsx'

const ACTIVITIES = [
  { id: 'scanner', icon: '🔬', nameRU: 'Сканер Тела',       nameUZ: 'Tana Skaneri',      color: '#22d3ee' },
  { id: 'dna',     icon: '🧬', nameRU: 'Код ДНК',           nameUZ: 'DNK Kodi',          color: '#c084fc' },
  { id: 'immune',  icon: '🛡', nameRU: 'Иммунный Защитник', nameUZ: 'Immun Himoyachi',   color: '#4ade80' },
  { id: 'photo',   icon: '🌿', nameRU: 'Фотосинтез',        nameUZ: 'Fotosintez',        color: '#86efac' },
]

const PROF_MSGS = {
  RU: {
    dashboard: '🧬 Биология — наука жизни! Выбери активность и начни исследовать!',
    scanner:   '🔬 Наведи на орган — я расскажу о химических процессах внутри!',
    dna:       '🧬 ДНК — код жизни! Потяни спираль мышкой — изучи базовые пары!',
    immune:    '🛡 Управляй лейкоцитом! Поглощай вирусы — защищай организм!',
    photo:     '🌿 Настрой CO₂, воду и свет в оптимальный диапазон — и растение зацветёт!',
  },
  UZ: {
    dashboard: '🧬 Biologiya — hayot fani! Faoliyatni tanlang va tadqiq qilishni boshlang!',
    scanner:   '🔬 Organ ustiga boring — ichidagi kimyoviy jarayonlar haqida gapirib beraman!',
    dna:       '🧬 DNK — hayot kodi! Spiralni sichqoncha bilan suring — bazaviy juftlarni o\'rganing!',
    immune:    '🛡 Leykotsitni boshqaring! Viruslarni yuting — organizmni himoya qiling!',
    photo:     '🌿 CO₂, suv va yorug\'likni optimal diapazonga sozlang — o\'simlik gullaydi!',
  },
}

export function BiologyPage() {
  const navigate = useNavigate()
  const { lang, xp, addXP } = useAuth()

  const [view,      setView]      = useState('dashboard')
  const [profMsg,   setProfMsg]   = useState('')
  const [profHappy, setProfHappy] = useState(false)
  const [showChat,  setShowChat]  = useState(false)
  const [pts,       setPts]       = useState([])
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_bio_done') ?? '[]') } catch { return [] }
  })
  const [showVictory, setShowVictory] = useState(false)

  /* Drone message sync */
  useEffect(() => {
    const msgs = PROF_MSGS[lang] ?? PROF_MSGS.RU
    setProfMsg(msgs[view] ?? msgs.dashboard)
  }, [view, lang])

  /* Track completions */
  const markDone = (id) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      localStorage.setItem('ss_bio_done', JSON.stringify(next))
      if (next.length === ACTIVITIES.length) {
        setTimeout(() => { setShowVictory(true); addXP(100) }, 800)
      }
      return next
    })
  }

  const addPts = (x, y, color, count = 14) => {
    const p = makeBurst(x, y, color, count)
    setPts(prev => [...prev, ...p])
    setTimeout(() => setPts(prev => prev.filter(v => !p.find(pp => pp.id === v.id))), 2200)
  }

  const setHappy = (val) => {
    setProfHappy(val)
    if (val) setTimeout(() => setProfHappy(false), 2500)
  }

  const screenProps = { lang, setMsg: setProfMsg, setHappy, addPts }

  return (
    <>
      <Stars />
      <Particles pts={pts} />

      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%,rgba(34,197,94,0.07) 0%,transparent 55%), radial-gradient(ellipse at 80% 80%,rgba(192,132,252,0.06) 0%,transparent 55%), #0a1a0a',
        fontFamily: "'Nunito', sans-serif", paddingBottom: 80,
      }}>
        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', maxWidth: 900, margin: '0 auto',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#c084fc)' }}>🧬</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, background: 'linear-gradient(90deg,#4ade80,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {lang === 'UZ' ? 'Biologiya' : 'Биология'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                {lang === 'UZ' ? 'Modul 3' : 'Модуль 3'} · {completed.length}/{ACTIVITIES.length}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {view !== 'dashboard' && (
              <button
                onClick={() => setView('dashboard')}
                style={{
                  padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                  border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)',
                  color: '#4ade80', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
                }}
              >← {lang === 'UZ' ? 'Orqaga' : 'Назад'}</button>
            )}
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              }}
            >← {lang === 'UZ' ? 'Modullar' : 'Модули'}</button>
          </div>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
          {/* Dashboard */}
          {view === 'dashboard' && (
            <>
              <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
                <motion.div
                  animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ fontSize: 52, marginBottom: 12, filter: 'drop-shadow(0 0 24px rgba(74,222,128,0.4))' }}
                >
                  🧬
                </motion.div>
                <h1 style={{
                  margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(24px,5vw,38px)',
                  background: 'linear-gradient(135deg,#4ade80,#c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {lang === 'UZ' ? 'Biologiya' : 'Биология'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
                  {lang === 'UZ' ? 'Hayotning sirlari — tanlang va o\'rganing!' : 'Тайны жизни — выбери активность и начни!'}
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 28, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  <span>{lang === 'UZ' ? 'Modul taraqqi' : 'Прогресс модуля'}</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>{completed.length}/{ACTIVITIES.length}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    animate={{ width: `${(completed.length / ACTIVITIES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#4ade80,#c084fc)' }}
                  />
                </div>
              </div>

              {/* Activity cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16 }}>
                {ACTIVITIES.map((act, i) => {
                  const done = completed.includes(act.id)
                  return (
                    <motion.article
                      key={act.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setView(act.id); if (!done) markDone(act.id) }}
                      style={{
                        padding: '20px 16px', borderRadius: 20, cursor: 'pointer',
                        background: done ? `${act.color}14` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${done ? act.color + '55' : 'rgba(255,255,255,0.08)'}`,
                        position: 'relative', overflow: 'hidden',
                        boxShadow: done ? `0 4px 24px ${act.color}18` : 'none',
                      }}
                    >
                      {done && (
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                          width: 22, height: 22, borderRadius: '50%',
                          background: act.color, display: 'grid', placeItems: 'center',
                          fontSize: 12,
                        }}>✓</div>
                      )}
                      <div style={{ fontSize: 36, marginBottom: 10 }}>{act.icon}</div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: done ? act.color : '#fff', marginBottom: 4 }}>
                        {lang === 'UZ' ? act.nameUZ : act.nameRU}
                      </div>
                      <div style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: done ? `${act.color}22` : 'rgba(255,255,255,0.06)',
                        color: done ? act.color : 'rgba(255,255,255,0.35)',
                      }}>
                        {done ? (lang === 'UZ' ? '✓ Bajarildi' : '✓ Пройдено') : (lang === 'UZ' ? 'Boshlash →' : 'Начать →')}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </>
          )}

          {view === 'scanner' && <BioBodyScanner {...screenProps} />}
          {view === 'dna'     && <DNAHelix       {...screenProps} />}
          {view === 'immune'  && <ImmuneDefender  {...screenProps} />}
          {view === 'photo'   && <Photosynthesis  {...screenProps} />}
        </div>
      </div>

      <FloatingProf
        msg={profMsg}
        happy={profHappy}
        onChatOpen={() => setShowChat(v => !v)}
        xp={xp}
        lang={lang}
      />

      {showChat && (
        <ProfessorChat subject="chemistry" lang={lang} onClose={() => setShowChat(false)} />
      )}

      <AnimatePresence>
        {showVictory && (
          <ModuleVictory
            key="victory"
            module="biology"
            lang={lang}
            onClose={() => setShowVictory(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
