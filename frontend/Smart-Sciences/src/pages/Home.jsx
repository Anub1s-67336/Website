/**
 * Home.jsx — Module selection landing page.
 * Shows two large cards: [Химия 🧪] and [Физика ⚡]
 * Colors: Chemistry = violet/green · Physics = blue/orange
 */
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { T } from '../data/translations.js'
import { snd } from '../utils/sound.js'

const MODULES = [
  {
    id: 'chemistry',
    title: 'Химия',
    emoji: '🧪',
    number: 'МОДУЛЬ 1',
    tagline: 'Атомы, молекулы, реакции',
    topics: [
      { icon: '⚛️', text: 'Периодическая таблица Менделеева' },
      { icon: '🧬', text: 'Химические реакции и синтез' },
      { icon: '🔬', text: 'Молекулярная лаборатория' },
      { icon: '🫀', text: 'Химия внутри организма' },
    ],
    gradient:    'linear-gradient(135deg, #3b0764, #064e3b)',
    btnGradient: 'linear-gradient(90deg, #7c3aed, #059669)',
    glowColor:   'rgba(124,58,237,0.45)',
    borderColor: 'rgba(124,58,237,0.3)',
    bgColor:     'rgba(124,58,237,0.05)',
    accent:      '#a78bfa',
    accentAlt:   '#34d399',
    route:       '/chemistry',
  },
  {
    id: 'physics',
    title: 'Физика',
    emoji: '⚡',
    number: 'МОДУЛЬ 2',
    tagline: 'Сила, свет, электричество',
    topics: [
      { icon: '⚡', text: 'Электрический ток и закон Ома' },
      { icon: '🍎', text: 'Законы Ньютона и гравитация' },
      { icon: '🌈', text: 'Оптика и преломление света' },
      { icon: '🌊', text: 'Давление и закон Архимеда' },
    ],
    gradient:    'linear-gradient(135deg, #1e3a8a, #7c2d12)',
    btnGradient: 'linear-gradient(90deg, #2563eb, #ea580c)',
    glowColor:   'rgba(249,115,22,0.45)',
    borderColor: 'rgba(59,130,246,0.3)',
    bgColor:     'rgba(59,130,246,0.05)',
    accent:      '#60a5fa',
    accentAlt:   '#fb923c',
    route:       '/physics',
  },
  {
    id: 'biology',
    title: 'Биология',
    emoji: '🧬',
    number: 'МОДУЛЬ 3',
    tagline: 'Клетки, ДНК, жизнь',
    topics: [
      { icon: '🔬', text: 'Сканер тела и органы человека' },
      { icon: '🧬', text: 'Двойная спираль ДНК' },
      { icon: '🛡', text: 'Иммунный защитник — поглощай вирусы' },
      { icon: '🌿', text: 'Фотосинтез и рост растений' },
    ],
    gradient:    'linear-gradient(135deg, #064e3b, #1e3a8a)',
    btnGradient: 'linear-gradient(90deg, #22c55e, #c084fc)',
    glowColor:   'rgba(34,197,94,0.45)',
    borderColor: 'rgba(74,222,128,0.3)',
    bgColor:     'rgba(34,197,94,0.05)',
    accent:      '#4ade80',
    accentAlt:   '#c084fc',
    route:       '/biology',
  },
]

export function Home() {
  const navigate  = useNavigate()
  const { lang, user, logout } = useAuth()
  const t = T[lang]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.08) 0%, transparent 60%), #0f172a',
      fontFamily: "'Nunito', sans-serif",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 48px',
      overflowX: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <header style={{
        width: '100%', maxWidth: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 0', marginBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#7c3aed,#4fc3f7)',
          }}>⚛️</div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: 16,
              background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Smart-Sciences</div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Платформа знаний</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language placeholder */}
          {user && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              👤 {user.username}
            </span>
          )}
          <button
            onClick={() => { logout(); snd('click') }}
            style={{
              padding: '7px 16px', borderRadius: 9, cursor: 'pointer',
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.06)', color: 'rgba(252,165,165,0.8)',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              transition: 'all .2s',
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', margin: '36px 0 52px', width: '100%', maxWidth: 900 }}>
        <div style={{
          fontSize: 'clamp(52px, 10vw, 80px)', marginBottom: 20,
          filter: 'drop-shadow(0 0 40px rgba(167,139,250,0.4))',
          lineHeight: 1,
        }}>⚛️</div>
        <h1 style={{
          margin: '0 0 14px',
          fontSize: 'clamp(30px, 6vw, 52px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #4fc3f7 0%, #a78bfa 50%, #fb923c 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.15,
        }}>Smart-Sciences</h1>
        <p style={{
          margin: 0, color: 'rgba(255,255,255,0.5)',
          fontSize: 'clamp(14px, 2.5vw, 18px)',
        }}>
          Выбери модуль и начни своё путешествие в науку
        </p>
      </div>

      {/* ── Module cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 28, width: '100%', maxWidth: 900,
      }}>
        {MODULES.map(mod => (
          <article
            key={mod.id}
            onClick={() => { snd('click'); navigate(mod.route) }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(mod.route)}
            style={{
              padding: '32px 28px 28px',
              borderRadius: 26,
              border: `1px solid ${mod.borderColor}`,
              background: mod.bgColor,
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.015)'
              e.currentTarget.style.boxShadow = `0 20px 56px rgba(0,0,0,0.55), 0 0 48px ${mod.glowColor}`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45)'
            }}
          >
            {/* Gradient top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 5,
              background: mod.gradient, borderRadius: '26px 26px 0 0',
            }} />

            {/* Module number badge */}
            <div style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${mod.borderColor}`,
              color: mod.accent, fontSize: 10, fontWeight: 900,
              letterSpacing: 1.5, marginBottom: 18,
            }}>
              {mod.number}
            </div>

            {/* Emoji */}
            <div style={{ fontSize: 58, lineHeight: 1, marginBottom: 14 }}>{mod.emoji}</div>

            {/* Title */}
            <h2 style={{
              margin: '0 0 6px', fontSize: 34, fontWeight: 900, color: mod.accent,
              letterSpacing: -0.5,
            }}>{mod.title}</h2>

            {/* Tagline */}
            <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
              {mod.tagline}
            </p>

            {/* Topics list */}
            <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {mod.topics.map(tp => (
                <li key={tp.text} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: 600,
                }}>
                  <span style={{ fontSize: 16 }}>{tp.icon}</span>
                  {tp.text}
                </li>
              ))}
            </ul>

            {/* CTA button */}
            <div style={{
              padding: '13px 24px', borderRadius: 14, textAlign: 'center',
              background: mod.btnGradient, color: '#fff',
              fontWeight: 900, fontSize: 15,
              boxShadow: `0 6px 20px ${mod.glowColor}`,
              letterSpacing: 0.3,
            }}>
              Начать изучение →
            </div>
          </article>
        ))}
      </div>

      {/* ── Footer hint ── */}
      <p style={{
        marginTop: 44, color: 'rgba(255,255,255,0.18)', fontSize: 13, textAlign: 'center',
      }}>
        ⚛️ Профессор Атом поможет тебе в каждом модуле
      </p>
    </div>
  )
}
