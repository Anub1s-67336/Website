/**
 * SoundVisualizer.jsx — Physics Activity 4 (Interactive): Звуковой Визуализатор
 * Keys A–G → different frequencies. Web Audio API oscillator + Canvas sine wave.
 * Amplitude / frequency visualized in real-time.
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NOTES = [
  { key: 'A', label: 'Ля',   freq: 440,  color: '#f87171' },
  { key: 'S', label: 'Си',   freq: 494,  color: '#fb923c' },
  { key: 'D', label: 'До',   freq: 523,  color: '#fbbf24' },
  { key: 'F', label: 'Ре',   freq: 587,  color: '#4ade80' },
  { key: 'G', label: 'Ми',   freq: 659,  color: '#22d3ee' },
  { key: 'H', label: 'Фа',   freq: 698,  color: '#818cf8' },
  { key: 'J', label: 'Соль', freq: 784,  color: '#c084fc' },
]

export function SoundVisualizer({ lang, setMsg }) {
  const canvasRef   = useRef(null)
  const audioCtxRef = useRef(null)
  const oscRef      = useRef(null)
  const gainRef     = useRef(null)
  const animIdRef   = useRef(null)
  const phaseRef    = useRef(0)

  const [activeNote, setActiveNote]   = useState(null)
  const [freq,       setFreq]         = useState(440)
  const [amplitude,  setAmplitude]    = useState(0)
  const [waveType,   setWaveType]     = useState('sine')
  const [playing,    setPlaying]      = useState(false)

  /* ── Draw waveform ── */
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)

    /* Background */
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#060a1a'); bg.addColorStop(1, '#0f172a')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    /* Grid */
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = H / 4 * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }
    for (let i = 1; i < 8; i++) {
      const x = W / 8 * i
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }

    /* Center line */
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
    ctx.setLineDash([])

    /* Sine wave */
    if (amplitude > 0.01) {
      const note = NOTES.find(n => n.freq === freq) ?? NOTES[0]
      const color = note?.color ?? '#a78bfa'

      /* Glow */
      ctx.shadowBlur = 16; ctx.shadowColor = color

      /* Main wave */
      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0, color + '00')
      grad.addColorStop(0.2, color)
      grad.addColorStop(0.8, color)
      grad.addColorStop(1, color + '00')
      ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.beginPath()

      const cycles = (freq / 440) * 3   // more cycles for higher freq
      for (let px = 0; px < W; px++) {
        const t = px / W
        let y = 0
        if (waveType === 'sine') {
          y = Math.sin(t * Math.PI * 2 * cycles + phaseRef.current) * amplitude * (H / 2 - 10)
        } else if (waveType === 'square') {
          y = Math.sign(Math.sin(t * Math.PI * 2 * cycles + phaseRef.current)) * amplitude * (H / 2 - 12)
        } else {
          y = (((t * cycles + phaseRef.current / (Math.PI * 2)) % 1) * 2 - 1) * amplitude * (H / 2 - 10)
        }
        px === 0 ? ctx.moveTo(px, H / 2 - y) : ctx.lineTo(px, H / 2 - y)
      }
      ctx.stroke()

      /* Fill under wave */
      ctx.shadowBlur = 0
      ctx.fillStyle = color + '18'
      ctx.beginPath()
      for (let px = 0; px < W; px++) {
        const t = px / W
        let y = 0
        if (waveType === 'sine') y = Math.sin(t * Math.PI * 2 * cycles + phaseRef.current) * amplitude * (H / 2 - 10)
        else if (waveType === 'square') y = Math.sign(Math.sin(t * Math.PI * 2 * cycles + phaseRef.current)) * amplitude * (H / 2 - 12)
        else y = (((t * cycles + phaseRef.current / (Math.PI * 2)) % 1) * 2 - 1) * amplitude * (H / 2 - 10)
        px === 0 ? ctx.moveTo(px, H / 2) : ctx.lineTo(px, H / 2 - y)
      }
      ctx.lineTo(W, H / 2); ctx.closePath(); ctx.fill()

      /* Labels */
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px monospace'
      ctx.fillText(`f = ${freq} Hz`, 8, 16)
      ctx.fillText(`λ = ${(343 / freq).toFixed(2)} m`, 8, 30)
      ctx.fillText(`A = ${Math.round(amplitude * 100)}%`, 8, 44)
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(lang === 'UZ' ? '⬇️ Nota tugmasini bosing yoki klaviatura tugmasini basing' : '⬇️ Нажми кнопку ноты или клавишу A-J', W / 2, H / 2 + 4)
      ctx.textAlign = 'left'
    }

    /* Advance phase */
    phaseRef.current += (freq / 440) * 0.06
  }, [amplitude, freq, waveType, lang])

  /* ── Animation loop ── */
  const animLoop = useCallback(() => {
    drawWave()
    animIdRef.current = requestAnimationFrame(animLoop)
  }, [drawWave])

  useEffect(() => {
    animIdRef.current = requestAnimationFrame(animLoop)
    return () => cancelAnimationFrame(animIdRef.current)
  }, [animLoop])

  /* ── Canvas resize ── */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  /* ── Audio ── */
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
  }

  const playNote = useCallback((note) => {
    ensureAudio()
    const ctx = audioCtxRef.current
    if (oscRef.current) { oscRef.current.stop(); oscRef.current.disconnect() }
    if (gainRef.current) gainRef.current.disconnect()

    gainRef.current = ctx.createGain()
    gainRef.current.gain.setValueAtTime(0, ctx.currentTime)
    gainRef.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gainRef.current.connect(ctx.destination)

    oscRef.current = ctx.createOscillator()
    oscRef.current.type = waveType
    oscRef.current.frequency.setValueAtTime(note.freq, ctx.currentTime)
    oscRef.current.connect(gainRef.current)
    oscRef.current.start()

    setFreq(note.freq)
    setAmplitude(0.7)
    setActiveNote(note.key)
    setPlaying(true)
    setMsg(lang === 'UZ' ? `🎵 Nota: ${note.label} (${note.freq} Hz) — Sinusoida` : `🎵 Нота: ${note.label} (${note.freq} Гц) — синусоида`)
  }, [waveType, lang, setMsg])

  const stopNote = useCallback(() => {
    if (gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, (audioCtxRef.current?.currentTime ?? 0) + 0.1)
    }
    setTimeout(() => {
      if (oscRef.current) { oscRef.current.stop(); oscRef.current.disconnect(); oscRef.current = null }
    }, 120)
    setActiveNote(null)
    setAmplitude(0)
    setPlaying(false)
  }, [])

  /* ── Keyboard ── */
  useEffect(() => {
    const keyMap = Object.fromEntries(NOTES.map(n => [n.key.toLowerCase(), n]))
    const down = (e) => {
      const note = keyMap[e.key.toLowerCase()]
      if (note && !e.repeat) playNote(note)
    }
    const up = (e) => {
      const note = keyMap[e.key.toLowerCase()]
      if (note) stopNote()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [playNote, stopNote])

  /* ── Wave type change ── */
  const changeWaveType = (type) => {
    setWaveType(type)
    if (oscRef.current) oscRef.current.type = type
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🎵 Tovush Vizualizatori' : '🎵 Звуковой Визуализатор'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Nota tugmalarini bosing yoki A–J klavishalarini basing!' : 'Нажимай кнопки нот или клавиши A–J!'}
        </p>
      </div>

      {/* Canvas */}
      <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: 200, marginBottom: 14 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Wave type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { id: 'sine',     label: '〜 ' + (lang === 'UZ' ? 'Sinusoida' : 'Синусоида') },
          { id: 'square',   label: '⊓ ' + (lang === 'UZ' ? 'Kvadrat'   : 'Квадрат')   },
          { id: 'sawtooth', label: '/' + ' ' + (lang === 'UZ' ? 'Arr'   : 'Пила')     },
        ].map(wt => (
          <motion.button
            key={wt.id}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => changeWaveType(wt.id)}
            style={{
              flex: 1, padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
              background: waveType === wt.id ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${waveType === wt.id ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
              color: waveType === wt.id ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            {wt.label}
          </motion.button>
        ))}
      </div>

      {/* Note buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {NOTES.map(note => {
          const isActive = activeNote === note.key
          return (
            <motion.button
              key={note.key}
              onPointerDown={() => playNote(note)}
              onPointerUp={stopNote}
              onPointerLeave={stopNote}
              whileTap={{ scale: 0.93 }}
              animate={isActive ? { y: -4, boxShadow: `0 8px 20px ${note.color}55` } : { y: 0 }}
              style={{
                padding: '12px 4px', borderRadius: 12, cursor: 'pointer',
                background: isActive ? `${note.color}30` : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${isActive ? note.color : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: 'inherit', userSelect: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: isActive ? note.color : 'rgba(255,255,255,0.7)' }}>
                {note.label}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>[{note.key}]</div>
              <div style={{ fontSize: 8, color: note.color, opacity: 0.8 }}>{note.freq}Hz</div>
            </motion.button>
          )
        })}
      </div>

      {/* Freq + Physics info */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
              display: 'flex', gap: 16, flexWrap: 'wrap',
            }}
          >
            {[
              { lbl: lang === 'UZ' ? 'Chastota' : 'Частота',    val: `${freq} Гц`          },
              { lbl: lang === 'UZ' ? 'To\'lqin uzunligi' : 'Длина волны', val: `${(343/freq).toFixed(2)} м` },
              { lbl: lang === 'UZ' ? 'Davr' : 'Период',          val: `${(1000/freq).toFixed(2)} мс` },
            ].map(it => (
              <div key={it.lbl}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{it.lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#a5b4fc' }}>{it.val}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
