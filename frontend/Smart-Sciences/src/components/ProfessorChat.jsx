/**
 * ProfessorChat.jsx — Professor Atom chat (KEYWORD-BASED, no API calls).
 * Receives subject ('physics' | 'chemistry') to pick the right FAQ.
 * Falls back to FALLBACK_RESPONSES if no keyword matches.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { matchProfessorResponse } from '../data/professorFAQ.js'

// Typing animation delay (ms per character)
const TYPING_SPEED = 18

// Subject-specific greeting
function getGreeting(subject, lang) {
  if (subject === 'physics') {
    return lang === 'UZ'
      ? "Salom, yosh fizik! ⚡ Men Professor Atom — savol ber, fizika sirlarini ochaman!"
      : "Привет, юный физик! ⚡ Я Профессор Атом — задавай вопросы о токе, силах, свете!"
  }
  return lang === 'UZ'
    ? "Salom, yosh kimyogar! ⚛️ Men Professor Atom — savol ber, kimyo sirlarini ochaman!"
    : "Привет, юный химик! ⚛️ Я Профессор Атом — спроси об атомах, реакциях, молекулах!"
}

// Subject accent color
const ACCENT = { physics: '#60a5fa', chemistry: '#a78bfa' }

export function ProfessorChat({ subject = 'chemistry', lang = 'RU', onClose }) {
  const greeting = getGreeting(subject, lang)
  const accent   = ACCENT[subject] || '#a78bfa'

  const [messages,  setMessages]  = useState([{ role: 'assistant', content: greeting }])
  const [input,     setInput]     = useState('')
  const [typing,    setTyping]    = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const timerRef  = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 120)
    return () => clearTimeout(timerRef.current)
  }, [])

  // Animated typing effect for Professor's response
  const typeResponse = useCallback((response) => {
    setTyping(true)
    // Add empty assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    let charIdx = 0
    const step = () => {
      if (charIdx >= response.length) {
        setTyping(false)
        return
      }
      charIdx++
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: response.slice(0, charIdx),
        }
        return updated
      })
      timerRef.current = setTimeout(step, TYPING_SPEED)
    }
    step()
  }, [])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || typing) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')

    // Small pause before professor "types"
    setTimeout(() => {
      const response = matchProfessorResponse(text, subject)
      typeResponse(response)
    }, 350)
  }, [input, typing, subject, typeResponse])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearHistory = () => {
    clearTimeout(timerRef.current)
    setTyping(false)
    setMessages([{ role: 'assistant', content: greeting }])
  }

  // Suggested quick questions
  const SUGGESTIONS = subject === 'physics'
    ? ['Что такое ток?', 'Закон Ньютона', 'Как работает линза?', 'Что такое давление?']
    : ['Что такое атом?', 'Закон Ома', 'Что такое реакция?', 'Таблица Менделеева']

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes dotPulse {
          0%, 60%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(1.8); }
        }
      `}</style>

      <div style={{
        position: 'fixed', bottom: 100, right: 16,
        width: 340, height: 490,
        background: 'rgba(6,7,25,0.97)',
        border: `1px solid rgba(${subject === 'physics' ? '59,130,246' : '124,58,237'},0.4)`,
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 12px 48px rgba(0,0,0,0.75)',
        zIndex: 600,
        backdropFilter: 'blur(20px)',
        animation: 'chatSlideUp 0.22s ease-out',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '11px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
          background: `linear-gradient(90deg, rgba(${subject === 'physics' ? '59,130,246' : '124,58,237'},0.12) 0%, transparent 100%)`,
        }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: subject === 'physics'
              ? 'radial-gradient(circle at 35% 30%, #1d4ed8, #ea580c)'
              : 'radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)',
            boxShadow: `0 0 14px ${accent}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>⚛️</div>

          <div style={{ flex: 1 }}>
            <div style={{ color: accent, fontWeight: 800, fontSize: 13 }}>
              Профессор Атом
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
              {typing ? '✍️ печатает...' : `● ${subject === 'physics' ? 'Физика' : 'Химия'}`}
            </div>
          </div>

          <button
            onClick={clearHistory}
            title="Очистить чат"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14, padding: '2px 5px' }}
          >🗑</button>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 21, lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
          scrollbarWidth: 'thin',
          scrollbarColor: `${accent}40 transparent`,
        }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const isLastTyping = typing && i === messages.length - 1 && !isUser
            return (
              <div key={i} style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                background: isUser
                  ? `linear-gradient(135deg, rgba(${subject === 'physics' ? '37,99,235' : '99,102,241'},0.35), rgba(${subject === 'physics' ? '234,88,12' : '139,92,246'},0.2))`
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isUser ? `${accent}40` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '8px 11px',
                fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.55,
                wordBreak: 'break-word',
              }}>
                {msg.content}
                {isLastTyping && (
                  <span style={{
                    display: 'inline-block', width: 8, height: 14,
                    background: accent, marginLeft: 2, borderRadius: 2,
                    animation: 'cursorBlink 0.7s step-end infinite',
                    verticalAlign: 'middle',
                  }} />
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick suggestions ── */}
        {messages.length <= 2 && !typing && (
          <div style={{
            padding: '6px 12px 0',
            display: 'flex', flexWrap: 'wrap', gap: 5,
          }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); setTimeout(sendMessage, 50) }}
                style={{
                  padding: '4px 10px', borderRadius: 8, border: `1px solid ${accent}30`,
                  background: `${accent}10`, color: accent,
                  fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${accent}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${accent}10`}
              >{s}</button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div style={{
          padding: '9px 10px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={typing}
            placeholder="Задай вопрос... (Enter — отправить)"
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '7px 10px',
              color: '#fff', fontSize: 13, outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.4,
              opacity: typing ? 0.5 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={typing || !input.trim()}
            style={{
              flexShrink: 0,
              background: typing || !input.trim()
                ? 'rgba(255,255,255,0.08)'
                : subject === 'physics'
                  ? 'linear-gradient(135deg,#2563eb,#ea580c)'
                  : 'linear-gradient(135deg,#7c3aed,#059669)',
              border: 'none', borderRadius: 10, padding: '7px 14px',
              color: typing || !input.trim() ? 'rgba(255,255,255,0.3)' : '#fff',
              cursor: typing || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: 16, transition: 'all 0.2s',
            }}
          >
            {typing ? '⋯' : '➤'}
          </button>
        </div>
      </div>
    </>
  )
}
