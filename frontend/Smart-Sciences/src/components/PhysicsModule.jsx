/**
 * PhysicsModule.jsx — Модуль 2: Физика
 * Main physics dashboard: lesson cards with progress + mini-game launcher.
 * Mirrors the chemistry HomeScreen/LabScreen design language.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { API_URL, getToken } from '../api/api.js'
import { snd } from '../utils/sound.js'
import { CircuitGame }    from './CircuitGame.jsx'
import { TrajectoryGame } from './TrajectoryGame.jsx'

// ── Static physics lesson metadata (matches seeded DB titles exactly) ──────
const PHYSICS_TOPICS = [
  {
    title:     'Механика и движение',
    icon:      '🏎',
    tag:       '5–6 класс',
    formula:   'v = s / t',
    gradient:  'linear-gradient(135deg,#0891b2,#1d4ed8)',
    tcol:      'rgba(103,232,249,0.2)',
    color:     '#67e8f9',
    screen:    'mechanics',
  },
  {
    title:     'Законы Ньютона',
    icon:      '🍎',
    tag:       '6–7 класс',
    formula:   'F = m · a',
    gradient:  'linear-gradient(135deg,#7c3aed,#a21caf)',
    tcol:      'rgba(196,181,253,0.2)',
    color:     '#c4b5fd',
    screen:    'mechanics',
  },
  {
    title:     'Электричество и цепи',
    icon:      '⚡',
    tag:       '7–8 класс',
    formula:   'I = U / R',
    gradient:  'linear-gradient(135deg,#d97706,#dc2626)',
    tcol:      'rgba(251,191,36,0.2)',
    color:     '#fbbf24',
    screen:    'circuits',
  },
  {
    title:     'Оптика и свет',
    icon:      '🌈',
    tag:       '7–8 класс',
    formula:   'n = sin α / sin β',
    gradient:  'linear-gradient(135deg,#059669,#0284c7)',
    tcol:      'rgba(110,231,183,0.2)',
    color:     '#6ee7b7',
    screen:    'optics',
  },
  {
    title:     'Тепловые явления',
    icon:      '🌡️',
    tag:       '7–8 класс',
    formula:   'Q = c · m · ΔT',
    gradient:  'linear-gradient(135deg,#dc2626,#ea580c)',
    tcol:      'rgba(252,165,165,0.2)',
    color:     '#fca5a5',
    screen:    'thermodynamics',
  },
  {
    title:     'Архимед и плавание тел',
    icon:      '🚢',
    tag:       '7 класс',
    formula:   'Fₐ = ρ·g·V',
    gradient:  'linear-gradient(135deg,#0284c7,#0891b2)',
    tcol:      'rgba(125,211,252,0.2)',
    color:     '#7dd3fc',
    screen:    'mechanics',
  },
  {
    title:     'Звук и волны',
    icon:      '🎵',
    tag:       '8 класс',
    formula:   'λ = v / f',
    gradient:  'linear-gradient(135deg,#7c3aed,#4f46e5)',
    tcol:      'rgba(167,139,250,0.2)',
    color:     '#a78bfa',
    screen:    'mechanics',
  },
]

// ── Mini-game definitions ─────────────────────────────────────────
const MINI_GAMES = [
  {
    id:       'circuits',
    icon:     '⚡',
    title:    'Конструктор Цепей',
    sub:      'Закон Ома · I = U / R',
    gradient: 'linear-gradient(135deg,#d97706,#7c3aed)',
    color:    '#fbbf24',
  },
  {
    id:       'trajectory',
    icon:     '🎯',
    title:    'Баллистика',
    sub:      'Траектория · y = x·tan θ − gx²/2v²cos²θ',
    gradient: 'linear-gradient(135deg,#7c3aed,#0891b2)',
    color:    '#a78bfa',
  },
]

// ── Glassmorphism card base style ─────────────────────────────────
const gs = {
  background:    'rgba(255,255,255,0.04)',
  border:        '1px solid rgba(255,255,255,0.08)',
  borderRadius:  20,
  backdropFilter:'blur(10px)',
}

// ── Physics quiz mini component (inline, reuses /physics-quest endpoint) ─────
function PhysicsQuiz({ lessonId, lessonTitle, onClose }) {
  const { addXP, earnAchievement } = useAuth()
  const [questions,  setQuestions]  = useState([])
  const [current,    setCurrent]    = useState(0)
  const [selected,   setSelected]   = useState(null)
  const [score,      setScore]      = useState(0)
  const [done,       setDone]       = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/physics-quest/${lessonId}?count=5`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail)))
      .then(data => { setQuestions(data.questions); setLoading(false) })
      .catch(e  => { setError(String(e)); setLoading(false) })
  }, [lessonId])

  const choose = useCallback((idx) => {
    if (selected !== null) return
    setSelected(idx)
    const q = questions[current]
    if (idx === q.correct_index) setScore(s => s + 1)
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true)
        const finalScore = score + (idx === q.correct_index ? 1 : 0)
        const xpGain = finalScore * 10
        addXP(xpGain)
        if (finalScore >= 4) earnAchievement('phys_newton')
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
      }
    }, 1200)
  }, [selected, questions, current, score, addXP, earnAchievement])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
      <div style={{ fontSize: 32, marginBottom: 12, animation: 'profFloat 1.2s ease-in-out infinite' }}>⚛️</div>
      Генерирую задачи по физике…
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 30, color: '#f87171' }}>
      ❌ Ошибка: {error}
      <br />
      <button onClick={onClose} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
        Закрыть
      </button>
    </div>
  )

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : score >= 3 ? '🎯' : '📚'}</div>
      <h3 style={{ color: '#a78bfa', margin: '0 0 8px', fontSize: 22 }}>Тест завершён!</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>
        Правильных ответов: <strong style={{ color: '#4fc3f7', fontSize: 20 }}>{score}</strong> из {questions.length}
      </p>
      <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: 15, margin: '0 0 24px' }}>
        +{score * 10} XP заработано!
      </p>
      <button
        onClick={onClose}
        style={{
          padding: '12px 28px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#4fc3f7)',
          color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 15, cursor: 'pointer',
        }}
      >
        Готово ✓
      </button>
    </div>
  )

  const q = questions[current]
  if (!q) return null

  const diffColor = q.difficulty === 1 ? '#4ade80' : q.difficulty === 2 ? '#fbbf24' : '#f87171'
  const diffLabel = q.difficulty === 1 ? 'Лёгкий' : q.difficulty === 2 ? 'Средний' : 'Сложный'

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${((current + 1) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg,#7c3aed,#4fc3f7)',
            transition: 'width .5s ease',
          }} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, flexShrink: 0 }}>
          {current + 1} / {questions.length}
        </span>
        <span style={{ color: diffColor, fontSize: 11, fontWeight: 700 }}>{diffLabel}</span>
      </div>

      {/* Formula badge */}
      {q.formula && (
        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 8, marginBottom: 12,
          background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)',
          color: '#4fc3f7', fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
        }}>
          {q.formula}
        </div>
      )}

      {/* Question */}
      <p style={{
        color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.55,
        margin: '0 0 20px',
      }}>
        {q.question}
      </p>

      {/* Options */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.05)'
          let bc = 'rgba(255,255,255,0.08)'
          let col = 'rgba(255,255,255,0.8)'
          if (selected !== null) {
            if (i === q.correct_index) { bg = 'rgba(74,222,128,0.15)'; bc = 'rgba(74,222,128,0.4)'; col = '#4ade80' }
            else if (i === selected)   { bg = 'rgba(248,113,113,0.12)'; bc = 'rgba(248,113,113,0.35)'; col = '#f87171' }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              style={{
                padding: '12px 16px', borderRadius: 12, border: `1px solid ${bc}`,
                background: bg, color: col, fontFamily: 'inherit', fontWeight: 700,
                fontSize: 14, textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all .25s',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: 8 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation after answer */}
      {selected !== null && (
        <div style={{
          padding: '10px 14px', borderRadius: 11, fontSize: 13, lineHeight: 1.55,
          background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
          color: 'rgba(255,255,255,0.6)',
        }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  )
}

// ── Main PhysicsModule component ──────────────────────────────────

export function PhysicsModule({ lang, setScreen: setAppScreen, onOpenChat }) {
  const { addXP, earnAchievement } = useAuth()

  const [view,         setView]         = useState('dashboard')  // 'dashboard' | 'circuits' | 'trajectory' | 'quiz'
  const [progress,     setProgress]     = useState({})           // { [title]: completed }
  const [quizLesson,   setQuizLesson]   = useState(null)         // { id, title }
  const [lessons,      setLessons]      = useState([])           // from backend
  const [firstVisit,   setFirstVisit]   = useState(
    () => !localStorage.getItem('ss_physics_visited')
  )

  // Fetch lessons + progress on mount
  useEffect(() => {
    const token = getToken()
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_URL}/progress`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/lessons`,  { headers }).then(r => r.json()),
    ]).then(([prog, lsns]) => {
      // Build map: title → { id, completed }
      const physTitles = new Set(PHYSICS_TOPICS.map(t => t.title))
      const lessonMap  = {}
      lsns.forEach(l => {
        if (physTitles.has(l.title)) lessonMap[l.title] = l.id
      })
      setLessons(lessonMap)

      const progMap = {}
      prog.forEach(p => { progMap[p.title] = p.completed })
      setProgress(progMap)
    }).catch(() => {})
  }, [])

  // First visit achievement
  useEffect(() => {
    if (firstVisit) {
      localStorage.setItem('ss_physics_visited', '1')
      setFirstVisit(false)
      earnAchievement('phys_first')
      addXP(15)
    }
  }, [firstVisit, earnAchievement, addXP])

  const completedCount = PHYSICS_TOPICS.filter(t => progress[t.title]).length

  function openQuiz(topic) {
    const lid = lessons[topic.title]
    if (!lid) return
    setQuizLesson({ id: lid, title: topic.title })
    setView('quiz')
    snd('click')
  }

  // ── Render sub-screens ─────────────────────────────────────────
  if (view === 'circuits') {
    return <CircuitGame lang={lang} onBack={() => setView('dashboard')} />
  }
  if (view === 'trajectory') {
    return <TrajectoryGame lang={lang} onBack={() => setView('dashboard')} />
  }

  // ── Dashboard ─────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, fontSize: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#7c3aed,#4fc3f7)',
            boxShadow: '0 0 24px rgba(124,58,237,0.4)',
          }}>⚛️</div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 900,
              background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Физика
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Законы природы · 5–8 класс
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#4fc3f7', fontWeight: 900, fontSize: 20 }}>
              {completedCount}/{PHYSICS_TOPICS.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>уроков пройдено</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, transition: 'width 1s ease',
            width: `${(completedCount / PHYSICS_TOPICS.length) * 100}%`,
            background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)',
          }} />
        </div>
      </div>

      {/* ── Professor Atom banner ── */}
      <div style={{
        ...gs, padding: '14px 18px', marginBottom: 28,
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <button
          onClick={onOpenChat}
          style={{
            fontSize: 32, background: 'none', border: 'none', cursor: 'pointer',
            filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.5))',
            transition: 'transform .2s',
            flexShrink: 0,
          }}
          title="Открыть чат с Профессором Атом"
        >⚛️</button>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color: '#a78bfa' }}>Профессор Атом:</strong>{' '}
          "Добро пожаловать в мир физики! Нажми на меня — и я отвечу на любой вопрос.
          Начни с механики или сразу прыгни в мини-игры! 🚀"
        </p>
      </div>

      {/* ── Mini-games section ── */}
      <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 800, marginBottom: 12, marginTop: 0 }}>
        🎮 Мини-игры
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14, marginBottom: 32 }}>
        {MINI_GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => { snd('click'); setView(game.id) }}
            style={{
              padding: '20px 18px', borderRadius: 18, border: 'none', cursor: 'pointer',
              background: game.gradient, textAlign: 'left', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'transform .18s, box-shadow .18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{game.icon}</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{game.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'monospace' }}>{game.sub}</div>
          </button>
        ))}
      </div>

      {/* ── Physics lessons section ── */}
      <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 800, marginBottom: 12, marginTop: 0 }}>
        📚 Уроки физики
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
        {PHYSICS_TOPICS.map((topic) => {
          const done   = !!progress[topic.title]
          const hasLid = !!lessons[topic.title]

          return (
            <div
              key={topic.title}
              style={{
                ...gs, padding: '18px 16px', position: 'relative', overflow: 'hidden',
                transition: 'transform .18s, border-color .18s',
                borderColor: done ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              {/* Gradient accent top bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: done ? 'linear-gradient(90deg,#4ade80,#4fc3f7)' : topic.gradient,
                borderRadius: '20px 20px 0 0',
              }} />

              {/* Completion badge */}
              {done && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11,
                }}>✓</div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, background: topic.tcol, border: `1px solid ${topic.color}30`,
                }}>
                  {topic.icon}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.3, marginBottom: 3 }}>
                    {topic.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: topic.tcol, color: topic.color,
                    }}>{topic.tag}</span>
                  </div>
                </div>
              </div>

              {/* Formula */}
              <div style={{
                padding: '5px 10px', borderRadius: 8, marginBottom: 12,
                background: 'rgba(0,0,0,0.2)', display: 'inline-block',
                color: topic.color, fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
              }}>
                {topic.formula}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {hasLid && (
                  <button
                    onClick={() => openQuiz(topic)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
                      background: done
                        ? 'rgba(74,222,128,0.1)'
                        : 'linear-gradient(135deg,rgba(124,58,237,0.6),rgba(79,195,247,0.4))',
                      color: done ? '#4ade80' : '#fff',
                      transition: 'all .2s',
                    }}
                  >
                    {done ? '🔄 Повторить' : '🧪 Пройти тест'}
                  </button>
                )}
                {!hasLid && (
                  <div style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, textAlign: 'center',
                    color: 'rgba(255,255,255,0.25)', fontSize: 12,
                    background: 'rgba(255,255,255,0.03)',
                  }}>
                    Загрузка…
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Quiz modal overlay ── */}
      {view === 'quiz' && quizLesson && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
            background: 'linear-gradient(135deg,#0d0d2b,#130d25)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          }}>
            {/* Quiz header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#a78bfa', fontWeight: 900, fontSize: 15 }}>
                  ⚛️ Тест по физике
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {quizLesson.title}
                </div>
              </div>
              <button
                onClick={() => { setView('dashboard'); setQuizLesson(null) }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
                }}
              >✕</button>
            </div>

            <PhysicsQuiz
              lessonId={quizLesson.id}
              lessonTitle={quizLesson.title}
              onClose={() => { setView('dashboard'); setQuizLesson(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
