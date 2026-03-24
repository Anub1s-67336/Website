/**
 * PhysicsPage.jsx — Physics module dashboard.
 * 4 lesson cards, CircuitGame, 20-question quiz, ProfessorChat.
 * No AI — all data is static from physicsData.js
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { PHYSICS_LESSONS, PHYSICS_QUIZ } from '../data/physicsData.js'
import { CircuitGame } from '../components/CircuitGame.jsx'
import { ProfessorChat } from '../components/ProfessorChat.jsx'
import { FloatingProf } from '../components/FloatingProf.jsx'
import { Stars } from '../components/Stars.jsx'

// ── Quiz component ────────────────────────────────────────────────

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
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 6 }}>
          <span>Вопрос {idx + 1} / {questions.length}</span>
          <span style={{ color: lesson.color }}>{lesson.title}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
          <div style={{ height: 4, width: `${((idx) / questions.length) * 100}%`, background: lesson.gradient, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Formula badge */}
      {q.formula && (
        <div style={{
          marginBottom: 16, display: 'inline-block',
          padding: '4px 14px', borderRadius: 8,
          background: `${lesson.color}15`,
          border: `1px solid ${lesson.color}30`,
          color: lesson.color, fontWeight: 800, fontSize: 14,
        }}>{q.formula}</div>
      )}

      {/* Question */}
      <div style={{
        padding: '18px 20px', marginBottom: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.5,
      }}>{q.question}</div>

      {/* Options */}
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
              onMouseEnter={e => { if (selected === null) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.background = bg }}
            >
              <span style={{ color: lesson.color, fontWeight: 800, marginRight: 10 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
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

        {/* Key points */}
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

        {/* Formulas */}
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

        {/* Facts */}
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
  const { lang } = useAuth()

  const [view,      setView]      = useState('dashboard') // 'dashboard' | 'lesson' | 'quiz' | 'circuit'
  const [activeLes, setActiveLes] = useState(null)
  const [showChat,  setShowChat]  = useState(false)

  return (
    <>
      <Stars />
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
              }}>Физика</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Модуль 2</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setView('circuit')}
              style={{
                padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                border: '1px solid rgba(249,115,22,0.3)',
                background: 'rgba(249,115,22,0.08)', color: '#fb923c',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              }}
            >⚡ Игра «Электрик»</button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              }}
            >← Главная</button>
          </div>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

          {/* Dashboard */}
          {view === 'dashboard' && (
            <>
              <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
                <div style={{ fontSize: 56, marginBottom: 14,
                  filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.5))' }}>⚡</div>
                <h1 style={{
                  margin: '0 0 10px', fontWeight: 900,
                  fontSize: 'clamp(26px,5vw,40px)',
                  background: 'linear-gradient(135deg,#60a5fa,#fb923c)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Физика</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: 0 }}>
                  Сила, свет, электричество — выбери тему и начни!
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: 20,
              }}>
                {PHYSICS_LESSONS.map(les => (
                  <article
                    key={les.id}
                    onClick={() => { setActiveLes(les); setView('lesson') }}
                    style={{
                      padding: '24px 20px', borderRadius: 20, cursor: 'pointer',
                      background: les.glassColor,
                      border: `1px solid ${les.borderColor}`,
                      position: 'relative', overflow: 'hidden',
                      transition: 'transform .2s, box-shadow .2s',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 32px ${les.color}30`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: les.gradient }} />
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{les.icon}</div>
                    <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: `${les.color}15`, border: `1px solid ${les.color}30`, color: les.color, fontSize: 10, fontWeight: 700, marginBottom: 10 }}>
                      {les.tag}
                    </div>
                    <h3 style={{ margin: '0 0 4px', color: les.color, fontWeight: 900, fontSize: 18 }}>{les.title}</h3>
                    <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{les.subtitle}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {les.formulas.slice(0, 2).map(f => (
                        <span key={f} style={{
                          padding: '3px 8px', borderRadius: 6,
                          background: `${les.color}10`, border: `1px solid ${les.color}20`,
                          color: les.color, fontSize: 11, fontWeight: 700,
                        }}>{f}</span>
                      ))}
                    </div>
                  </article>
                ))}
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

        </div>
      </div>

      {/* Professor Atom */}
      <FloatingProf
        msg={showChat ? '' : '⚡ Привет, юный физик! Спрашивай о токе, силах и свете!'}
        happy={false}
        onChatOpen={() => setShowChat(v => !v)}
      />
      {showChat && (
        <ProfessorChat
          subject="physics"
          lang={lang}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  )
}
