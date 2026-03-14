/**
 * ProfessorChat.jsx — AI-чат с Профессором Атомом.
 * Открывается кликом на персонажа FloatingProf.
 * Стриминг через SSE: data: {"delta": "..."} / data: [DONE]
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { getToken, API_URL } from '../api/api'

export function ProfessorChat({ lang, screen, onClose }) {
  const greeting = lang === 'RU'
    ? 'Привет, юный химик! ⚛️ Я Профессор Атом — задавай вопросы, я помогу разобраться!'
    : 'Salom, yosh kimyogar! ⚛️ Men Professor Atom — savol ber, tushunishga yordam beraman!'

  const [messages,  setMessages]  = useState([{ role: 'assistant', content: greeting }])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const abortRef  = useRef(null)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Фокус на инпут при открытии
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Отмена стрима при закрытии
  useEffect(() => () => abortRef.current?.abort(), [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg  = { role: 'user',      content: text }
    const nextMsgs = [...messages, userMsg]
    setMessages(nextMsgs)
    setInput('')
    setStreaming(true)

    // Добавляем пустое сообщение ассистента — заполним потоком
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMsgs,
          screen_context: screen,
          lang,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''   // неполная строка — откладываем

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break

          try {
            const { delta, error } = JSON.parse(payload)
            if (error) throw new Error(error)
            if (delta) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role:    'assistant',
                  content: updated[updated.length - 1].content + delta,
                }
                return updated
              })
            }
          } catch { /* пропускаем битые чанки */ }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setMessages(prev => {
        const updated = [...prev]
        const last    = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            role:    'assistant',
            content: lang === 'RU' ? '⚠️ Ошибка связи. Попробуй позже.' : '⚠️ Aloqa xatosi. Keyinroq urinib ko\'r.',
          }
        }
        return updated
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [input, messages, streaming, screen, lang])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearHistory = () => {
    setMessages([{ role: 'assistant', content: greeting }])
  }

  return (
    <div style={{
      position: 'fixed', bottom: 100, right: 16,
      width: 340, height: 480,
      background: 'rgba(8,8,24,0.97)',
      border: '1px solid rgba(124,58,237,0.45)',
      borderRadius: 18,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 12px 48px rgba(0,0,0,0.7), 0 0 32px rgba(124,58,237,0.15)',
      zIndex: 600,
      backdropFilter: 'blur(20px)',
      animation: 'chatSlideUp 0.25s ease-out',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '11px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
      }}>
        {/* Мини-аватар */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)',
          boxShadow: '0 0 12px rgba(124,58,237,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>⚛️</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13 }}>
            {lang === 'RU' ? 'Профессор Атом' : 'Professor Atom'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
            {streaming
              ? (lang === 'RU' ? '✍️ печатает...' : '✍️ yozmoqda...')
              : (lang === 'RU' ? '● онлайн' : '● online')}
          </div>
        </div>
        {/* Очистить историю */}
        <button
          onClick={clearHistory}
          title={lang === 'RU' ? 'Очистить чат' : 'Chatni tozalash'}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer', fontSize: 14, padding: '2px 5px', borderRadius: 4,
          }}
        >🗑</button>
        {/* Закрыть */}
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 2px',
          }}
        >×</button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(124,58,237,0.3) transparent',
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          const isLastStreaming = streaming && i === messages.length - 1 && !isUser
          return (
            <div
              key={i}
              style={{
                alignSelf:  isUser ? 'flex-end' : 'flex-start',
                maxWidth:   '86%',
                background: isUser
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.25))'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isUser ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '8px 11px',
                fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.55,
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
              {isLastStreaming && (
                <span style={{
                  display: 'inline-block', width: 8, height: 14,
                  background: '#a78bfa', marginLeft: 2, borderRadius: 2,
                  animation: 'cursorBlink 0.7s step-end infinite',
                  verticalAlign: 'middle',
                }} />
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

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
          disabled={streaming}
          placeholder={lang === 'RU' ? 'Задай вопрос... (Enter — отправить)' : 'Savol ber... (Enter — yuborish)'}
          style={{
            flex: 1, resize: 'none', overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '7px 10px',
            color: '#fff', fontSize: 13, outline: 'none',
            fontFamily: 'inherit', lineHeight: 1.4,
            opacity: streaming ? 0.5 : 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          style={{
            flexShrink: 0,
            background: streaming || !input.trim()
              ? 'rgba(99,102,241,0.25)'
              : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', borderRadius: 10, padding: '7px 14px',
            color: '#fff', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 16, transition: 'all 0.2s',
          }}
        >
          {streaming ? '⋯' : '➤'}
        </button>
      </div>
    </div>
  )
}
