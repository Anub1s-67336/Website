/**
 * PhysicsPage.jsx — Physics Module (Module 2).
 * 4 legacy lessons + 4 new activities: GeniusArchive, ElectricLab, Ballistics, SoundVisualizer.
 * Drone comments in RU/UZ. Module Victory modal on completion.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { PHYSICS_LESSONS, PHYSICS_QUIZ } from '../data/physicsData.js'
import { CircuitGame } from '../components/CircuitGame.jsx'
import { ProfessorChat } from '../components/ProfessorChat.jsx'
import { FloatingProf } from '../components/FloatingProf.jsx'
import { ModuleVictory } from '../components/ModuleVictory.jsx'
import { Particles, makeBurst } from '../components/Particles.jsx'
import { Stars } from '../components/Stars.jsx'
import { GeniusArchive } from '../screens/GeniusArchive.jsx'
import { ElectricLab } from '../screens/ElectricLab.jsx'
import { Ballistics } from '../screens/Ballistics.jsx'
import { SoundVisualizer } from '../screens/SoundVisualizer.jsx'

const ACTIVITIES = [
  { id: 'genius',  icon: '🏛', nameRU: 'Архив Гениев',         nameUZ: 'Daholar Arxivi',      color: '#f59e0b' },
  { id: 'electric',icon: '⚡', nameRU: 'Лаборатория Электричества', nameUZ: 'Elektr Laboratoriyasi', color: '#60a5fa' },
  { id: 'ballistics',icon:'🎯',nameRU: 'Баллистика',             nameUZ: 'Ballistika',           color: '#fb923c' },
  { id: 'sound',   icon: '🎵', nameRU: 'Звуковой Визуализатор', nameUZ: 'Tovush Vizualizatori', color: '#a78bfa' },
]

const PROF_MSGS = {
  RU: {
    dashboard:  '⚡ Физика — наука о природе! Выбери активность и начни эксперимент!',
    genius:     '🏛 Изучи великих учёных! Наведи мышь на карточку — закон оживёт!',
    electric:   '⚡ Подбирай напряжение и сопротивление — следи за током и мощностью!',
    ballistics: '🎯 Настрой угол и силу выстрела — попади в цель!',
    sound:      '🎵 Нажимай клавиши A-J — слушай и видь звуковые волны!',
    lesson:     '📖 Читай внимательно — потом проверь себя тестом!',
    circuit:    '🔌 Собери цепь, чтобы лампочка зажглась!',
  },
  UZ: {
    dashboard:  '⚡ Fizika — tabiat haqidagi fan! Faoliyatni tanlang va tajriba boshlang!',
    genius:     '🏛 Buyuk olimlarni o\'rganing! Kartochka ustiga boring — qonun tiriladi!',
    electric:   '⚡ Kuchlanish va qarshilikni tanlang — tok va quvvatni kuzating!',
    ballistics: '🎯 Burchak va kuchni sozlang — nishonga uring!',
    sound:      '🎵 A-J tugmalarni bosing — tovush to\'lqinlarini eshiting va ko\'ring!',
    lesson:     '📖 Diqqat bilan o\'qing — keyin testda tekshirib ko\'ring!',
    circuit:    '🔌 Lampochka yonishi uchun zanjir yig\'ing!',
  },
}

// ── Quiz component ─────────────────────────────────────────────────

function PhysicsQuiz({ lesson, onBack }) {
  const questions = PHYSICS_QUIZ.filter(q => q.topic === lesson.id)
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [correct,  setCorrect]  = useState(0)
  const [done,     setDone]     = useState(false)

  const q = questions[idx]

  function choose(i) {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correct) setCorrect(c => c + 1)
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1)
        setSelected(null)
      } else {
        setDone(true)
      }
    }, 1200)
  }

  if (!questions.length) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>
        Нет вопросов для этой темы.
        <br /><br />
        <button onClick={onBack} style={backBtnStyle(lesson.color)}>← Назад</button>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}
        </div>
        <h3 style={{ color: lesson.color, margin: '0 0 8px', fontSize: 24, fontWeight: 900 }}>
          {pct >= 80 ? 'Отлично!' : pct >= 50 ? 'Хорошо!' : 'Продолжай учиться!'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
          {correct} / {questions.length} правильных ({pct}%)
        </p>
        <button onClick={onBack} style={backBtnStyle(lesson.color)}>← К урокам</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 6 }}>
          <span>Вопрос {idx + 1} / {questions.length}</span>
          <span style={{ color: lesson.color }}>{lesson.title}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
          <div style={{ height: 4, width: `${((idx) / questions.length) * 100}%`, background: lesson.gradient, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      {q.formula && (
        <div style={{
          marginBottom: 16, display: 'inline-block',
          padding: '4px 14px', borderRadius: 8,
          background: `${lesson.color}15`,
          border: `1px solid ${lesson.color}30`,
          color: lesson.color, fontWeight: 800, fontSize: 14,
        }}>{q.formula}</div>
      )}

      <div style={{
        padding: '18px 20px', marginBottom: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.5,
      }}>{q.question}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect  = i === q.correct
          let bg = 'rgba(255,255,255,0.04)'
          let border = 'rgba(255,255,255,0.1)'
          if (selected !== null) {
            if (isCorrect)       { bg = 'rgba(16,185,129,0.15)'; border = '#10b981' }
            else if (isSelected) { bg = 'rgba(239,68,68,0.15)';  border = '#ef4444' }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              style={{
                padding: '13px 18px', borderRadius: 12,
                background: bg, border: `1px solid ${border}`,
                color: '#fff', cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'inherit', fontSize: 14, textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ color: lesson.color, fontWeight: 800, marginRight: 10 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 12,
          background: selected === q.correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${selected === q.correct ? '#10b98130' : '#ef444430'}`,
          color: 'rgba(255,255,255,0.7)', fontSize: 13,
        }}>
          {selected === q.correct ? '✅ ' : '❌ '}{q.explanation}
        </div>
      )}

      <button onClick={onBack} style={{ ...backBtnStyle(lesson.color), marginTop: 24 }}>← Назад</button>
    </div>
  )
}

function backBtnStyle(color) {
  return {
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${color}30`,
    background: `${color}10`, color: color,
    fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
  }
}

// ── Lesson detail view ────────────────────────────────────────────

function LessonDetail({ lesson, onBack, onQuiz }) {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={onBack} style={backBtnStyle(lesson.color)}>← Назад</button>

      <div style={{
        marginTop: 20, padding: '24px', borderRadius: 20,
        background: lesson.glassColor,
        border: `1px solid ${lesson.borderColor}`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{lesson.icon}</div>
        <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: `${lesson.color}15`, border: `1px solid ${lesson.color}30`, color: lesson.color, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
          {lesson.tag}
        </div>
        <h2 style={{ margin: '0 0 4px', color: lesson.color, fontWeight: 900, fontSize: 24 }}>{lesson.title}</h2>
        <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>{lesson.subtitle}</p>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>КЛЮЧЕВЫЕ ПОНЯТИЯ</div>
          {lesson.keyPoints.map((pt, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '8px 12px', marginBottom: 6, borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5,
            }}>
              <span style={{ color: lesson.color, fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
              {pt}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>ФОРМУЛЫ</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {lesson.formulas.map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 8,
                background: `${lesson.color}10`,
                border: `1px solid ${lesson.color}25`,
                color: lesson.color, fontWeight: 800, fontSize: 14,
              }}>{f}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>ИНТЕРЕСНЫЕ ФАКТЫ</div>
          {lesson.facts.map((f, i) => (
            <div key={i} style={{
              padding: '8px 14px', marginBottom: 6, borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.65)', fontSize: 13,
            }}>{f}</div>
          ))}
        </div>

        <button
          onClick={onQuiz}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: lesson.gradient, border: 'none',
            color: '#fff', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 900, fontSize: 15,
            boxShadow: `0 6px 20px ${lesson.color}40`,
          }}
        >
          🧠 Пройти тест по теме
        </button>
      </div>
    </div>
  )
}

// ── Main PhysicsPage ──────────────────────────────────────────────

export function PhysicsPage() {
  const navigate = useNavigate()
  const { lang, xp, addXP } = useAuth()

  const [view,      setView]      = useState('dashboard')
  const [activeLes, setActiveLes] = useState(null)
  const [profMsg,   setProfMsg]   = useState('')
  const [profHappy, setProfHappy] = useState(false)
  const [showChat,  setShowChat]  = useState(false)
  const [pts,       setPts]       = useState([])
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_phy_done') ?? '[]') } catch { return [] }
  })
  const [showVictory, setShowVictory] = useState(false)

  /* Drone message sync */
  useEffect(() => {
    const msgs = PROF_MSGS[lang] ?? PROF_MSGS.RU
    if (view === 'lesson') { setProfMsg(msgs.lesson); return }
    if (view === 'circuit') { setProfMsg(msgs.circuit); return }
    setProfMsg(msgs[view] ?? msgs.dashboard)
  }, [view, lang])

  const markDone = (id) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      localStorage.setItem('ss_phy_done', JSON.stringify(next))
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
        background: 'radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(249,115,22,0.06) 0%, transparent 55%), #0f172a',
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 80,
      }}>

        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', maxWidth: 900, margin: '0 auto',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#2563eb,#ea580c)',
            }}>⚡</div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 15,
                background: 'linear-gradient(90deg,#60a5fa,#fb923c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {lang === 'UZ' ? 'Fizika' : 'Физика'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                {lang === 'UZ' ? 'Modul 2' : 'Модуль 2'} · {completed.length}/{ACTIVITIES.length}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {view !== 'dashboard' && (
              <button
                onClick={() => setView('dashboard')}
                style={{
                  padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                  border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)',
                  color: '#60a5fa', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
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
                  style={{ fontSize: 52, marginBottom: 12, filter: 'drop-shadow(0 0 24px rgba(96,165,250,0.4))' }}
                >
                  ⚡
                </motion.div>
                <h1 style={{
                  margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(24px,5vw,38px)',
                  background: 'linear-gradient(135deg,#60a5fa,#fb923c)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {lang === 'UZ' ? 'Fizika' : 'Физика'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
                  {lang === 'UZ' ? 'Tajribalarni tanlang va boshlang!' : 'Сила, свет, электричество — выбери активность!'}
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 28, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  <span>{lang === 'UZ' ? 'Modul taraqqi' : 'Прогресс модуля'}</span>
                  <span style={{ color: '#60a5fa', fontWeight: 700 }}>{completed.length}/{ACTIVITIES.length}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    animate={{ width: `${(completed.length / ACTIVITIES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#60a5fa,#fb923c)' }}
                  />
                </div>
              </div>

              {/* Activity cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16, marginBottom: 32 }}>
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

              {/* Legacy lessons section */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  {lang === 'UZ' ? 'DARSLAR' : 'УРОКИ И ТЕСТ'}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: 16,
                }}>
                  {PHYSICS_LESSONS.map(les => (
                    <article
                      key={les.id}
                      onClick={() => { setActiveLes(les); setView('lesson') }}
                      style={{
                        padding: '20px 18px', borderRadius: 18, cursor: 'pointer',
                        background: les.glassColor,
                        border: `1px solid ${les.borderColor}`,
                        transition: 'transform .2s, box-shadow .2s',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.boxShadow = `0 14px 36px rgba(0,0,0,0.5), 0 0 28px ${les.color}28`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = ''
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: les.gradient, borderRadius: '18px 18px 0 0' }} />
                      <div style={{ fontSize: 30, marginBottom: 8 }}>{les.icon}</div>
                      <h3 style={{ margin: '0 0 4px', color: les.color, fontWeight: 900, fontSize: 16 }}>{les.title}</h3>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>{les.subtitle}</p>
                    </article>
                  ))}
                  <article
                    onClick={() => setView('circuit')}
                    style={{
                      padding: '20px 18px', borderRadius: 18, cursor: 'pointer',
                      background: 'rgba(249,115,22,0.05)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      transition: 'transform .2s, box-shadow .2s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.5), 0 0 28px rgba(249,115,22,0.28)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'
                    }}
                  >
                    <div style={{ fontSize: 30, marginBottom: 8 }}>🔌</div>
                    <h3 style={{ margin: '0 0 4px', color: '#fb923c', fontWeight: 900, fontSize: 16 }}>
                      {lang === 'UZ' ? 'Elektrik O\'yini' : 'Игра «Электрик»'}
                    </h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>
                      {lang === 'UZ' ? 'Zanjir yig\'ing' : 'Собери цепь'}
                    </p>
                  </article>
                </div>
              </div>
            </>
          )}

          {/* Lesson detail */}
          {view === 'lesson' && activeLes && (
            <LessonDetail
              lesson={activeLes}
              onBack={() => setView('dashboard')}
              onQuiz={() => setView('quiz')}
            />
          )}

          {/* Quiz */}
          {view === 'quiz' && activeLes && (
            <PhysicsQuiz
              lesson={activeLes}
              onBack={() => setView('lesson')}
            />
          )}

          {/* Circuit game */}
          {view === 'circuit' && (
            <CircuitGame onClose={() => setView('dashboard')} />
          )}

          {/* New activity screens */}
          {view === 'genius'     && <GeniusArchive   {...screenProps} />}
          {view === 'electric'   && <ElectricLab     {...screenProps} />}
          {view === 'ballistics' && <Ballistics       {...screenProps} />}
          {view === 'sound'      && <SoundVisualizer  {...screenProps} />}

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
        <ProfessorChat subject="physics" lang={lang} onClose={() => setShowChat(false)} />
      )}

      <AnimatePresence>
        {showVictory && (
          <ModuleVictory
            key="victory"
            module="physics"
            lang={lang}
            onClose={() => setShowVictory(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
