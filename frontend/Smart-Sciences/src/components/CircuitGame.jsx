/**
 * CircuitGame.jsx — Simple click-order circuit game (no AI, pure useState).
 * Goal: click Battery → Wire → Bulb in the correct order to light the lamp.
 */
import { useState } from 'react'

const STEPS = ['battery', 'wire', 'bulb']

const ITEM_INFO = {
  battery: { emoji: '🔋', label: 'Батарейка', hint: 'Источник тока (ЭДС)' },
  wire:    { emoji: '〰️', label: 'Провод',    hint: 'Проводник (R → 0)' },
  bulb:    { emoji: '💡', label: 'Лампочка',  hint: 'Нагрузка (R > 0)' },
}

export function CircuitGame({ onClose }) {
  const [stepIdx,  setStepIdx]  = useState(0)
  const [done,     setDone]     = useState([])
  const [lit,      setLit]      = useState(false)
  const [wrong,    setWrong]    = useState(null)
  const [score,    setScore]    = useState(0)
  const [attempts, setAttempts] = useState(0)

  const isBatteryConnected = done.includes('battery')
  const isWireConnected    = done.includes('wire')

  function handleClick(id) {
    if (lit) return
    const expected = STEPS[stepIdx]

    if (id === expected) {
      const next = [...done, id]
      setDone(next)
      setWrong(null)
      setStepIdx(stepIdx + 1)

      if (isBatteryConnected && isWireConnected && id === 'bulb') {
        setLit(true)
        setScore(s => s + 1)
      }
    } else {
      setWrong(id)
      setAttempts(a => a + 1)
      setTimeout(() => setWrong(null), 700)
    }
  }

  function reset() {
    setStepIdx(0)
    setDone([])
    setLit(false)
    setWrong(null)
    setAttempts(0)
  }

  const HINT_TEXTS = [
    '⚡ Кликни на Батарейку — она даёт напряжение!',
    '🔌 Подключи Провод — путь для электронов!',
    '💡 Теперь добавь Лампочку — она станет нагрузкой!',
  ]

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif", padding: '24px 16px',
    }}>
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); }
          50%       { box-shadow: 0 0 40px rgba(251,191,36,0.9); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }
      `}</style>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, color: '#f97316', fontWeight: 900, fontSize: 22 }}>
              ⚡ Игра «Электрик»
            </h2>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Собери цепь: Батарейка → Провод → Лампочка
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 24 }}
            >×</button>
          )}
        </div>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Успехов', value: score,    color: '#10b981' },
          { label: 'Ошибок',  value: attempts, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            textAlign: 'center', padding: '10px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${color}30`,
            borderRadius: 12,
          }}>
            <div style={{ color, fontSize: 22, fontWeight: 900 }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Circuit diagram */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(249,115,22,0.2)',
        borderRadius: 20, padding: '20px 24px',
        marginBottom: 28,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 12, letterSpacing: 1 }}>
          СХЕМА ЦЕПИ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {STEPS.map((id, i) => {
            const info   = ITEM_INFO[id]
            const isDone = done.includes(id)
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  textAlign: 'center', padding: '12px 16px', borderRadius: 14,
                  background: isDone ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isDone ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  opacity: isDone ? 1 : 0.4, transition: 'all 0.3s',
                }}>
                  <div style={{ fontSize: 28 }}>{isDone ? info.emoji : '⬜'}</div>
                  <div style={{ color: isDone ? '#f97316' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                    {isDone ? info.label : '???'}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 32, height: 2, margin: '0 4px',
                    background: isDone ? '#f97316' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                    boxShadow: isDone ? '0 0 6px rgba(249,115,22,0.6)' : 'none',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Hint */}
      {!lit && (
        <div style={{
          marginBottom: 24, padding: '10px 18px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 10, color: '#60a5fa', fontSize: 13,
        }}>
          {HINT_TEXTS[stepIdx] ?? ''}
        </div>
      )}

      {/* Clickable items */}
      {!lit ? (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map(id => {
            const info    = ITEM_INFO[id]
            const isDone  = done.includes(id)
            const isWrong = wrong === id

            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                disabled={isDone}
                style={{
                  width: 120, padding: '18px 12px',
                  background: isDone
                    ? 'rgba(249,115,22,0.15)'
                    : isWrong
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isDone ? '#f97316' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 16, cursor: isDone ? 'default' : 'pointer',
                  color: '#fff', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  animation: isWrong ? 'shake 0.35s ease' : 'none',
                  transition: 'background 0.2s, border 0.2s',
                  opacity: isDone ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!isDone) e.currentTarget.style.transform = 'scale(1.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <span style={{ fontSize: 36 }}>{info.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{info.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{info.hint}</span>
                {isDone && <span style={{ fontSize: 10, color: '#f97316' }}>✓ Добавлено</span>}
              </button>
            )
          })}
        </div>
      ) : (
        /* Victory */
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 80, marginBottom: 20,
            animation: 'glow 1.2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.8))',
          }}>💡</div>
          <h3 style={{
            margin: '0 0 8px', fontSize: 26, fontWeight: 900,
            background: 'linear-gradient(90deg, #f97316, #fbbf24)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Лампочка горит! 🎉
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>
            Цепь замкнута. По закону Ома: <strong style={{ color: '#f97316' }}>I = U / R</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 24px' }}>
            Электроны движутся от «−» батарейки через провод к лампочке и обратно.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg,#ea580c,#f97316)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
              boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔄 Повторить
          </button>
        </div>
      )}

      {/* Formula reference */}
      <div style={{
        marginTop: 36, width: '100%', maxWidth: 480,
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>
          ФОРМУЛЫ
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['I = U / R', 'P = U × I', 'A = P × t'].map(f => (
            <span key={f} style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.2)',
              color: '#fb923c', fontSize: 13, fontWeight: 700,
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
