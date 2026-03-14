/**
 * FloatingProf.jsx — Fixed top-right Professor Atom widget (Duolingo-style).
 * Speech bubble appears to the LEFT of the character.
 * Click the character to show / hide the bubble.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function FloatingProf({ msg, happy = false, onChatOpen }) {
  const [blink, setBlink] = useState(false)
  const [open,  setOpen]  = useState(true)

  // Blink eyes every 2.8 s
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  // Auto-open bubble whenever the message changes
  useEffect(() => { setOpen(true) }, [msg])

  return (
    <div style={{
      position: 'fixed', top: 70, right: 12, zIndex: 500,
      display: 'flex', alignItems: 'flex-end', gap: 10,
      pointerEvents: 'none',
    }}>
      {/* ── Speech bubble (left of character) ── */}
      <AnimatePresence>
        {open && msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, scale: 0.85, x: 10 }}
            animate={{ opacity: 1, scale: 1,    x: 0  }}
            exit={{    opacity: 0, scale: 0.85, x: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            style={{
              maxWidth: 200, padding: '10px 14px',
              borderRadius: '16px 16px 4px 16px',   // sharp bottom-right corner → tail side
              background: 'rgba(109,40,217,0.28)',
              border: '1px solid rgba(167,139,250,0.35)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 4px 20px rgba(109,40,217,0.28)',
              position: 'relative',
              pointerEvents: 'auto',
            }}
          >
            <p style={{
              margin: 0, fontSize: 12, lineHeight: 1.5,
              fontWeight: 600, color: 'rgba(255,255,255,0.92)',
            }}>
              {msg}
            </p>
            {/* Tail pointing RIGHT — toward character */}
            <div style={{
              position: 'absolute', right: -8, bottom: 12,
              width: 10, height: 10, transform: 'rotate(45deg)',
              background: 'rgba(109,40,217,0.28)',
              borderTop:   '1px solid rgba(167,139,250,0.35)',
              borderRight: '1px solid rgba(167,139,250,0.35)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Character (floats, click to toggle bubble) ── */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => onChatOpen ? onChatOpen() : setOpen(v => !v)}
        style={{ flexShrink: 0, cursor: 'pointer', pointerEvents: 'auto' }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%', position: 'relative',
          background: 'radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)',
          boxShadow: happy
            ? '0 0 28px #a78bfa, 0 0 56px #7c3aed88'
            : '0 0 18px #7c3aed66',
          transition: 'box-shadow .4s',
        }}>
          {/* Hat brim */}
          <div style={{
            position: 'absolute', top: -17, left: '50%',
            transform: 'translateX(-50%)',
            width: 40, height: 3, borderRadius: 2, background: '#7c3aed',
          }} />
          {/* Hat body */}
          <div style={{
            position: 'absolute', top: -17, left: '50%',
            transform: 'translateX(-50%)',
            width: 27, height: 16, borderRadius: '6px 6px 0 0',
            background: 'linear-gradient(to top, #4c1d95, #7c3aed)',
          }} />
          {/* Eyes */}
          <div style={{
            position: 'absolute', top: 13, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between', padding: '0 9px',
          }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: 9, height: 9, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 5, borderRadius: '50%', background: '#312e81',
                  height: blink ? 1 : 5,
                  transform: happy ? 'translateY(1px)' : 'none',
                  transition: 'height .08s',
                }} />
              </div>
            ))}
          </div>
          {/* Mouth */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            width: happy ? 16 : 12, height: happy ? 8 : 5,
            borderRadius: '0 0 50% 50%',
            border: '2px solid #c4b5fd', borderTop: 'none',
            transition: 'all .3s',
          }} />
          {/* Orbit ring */}
          <div style={{
            position: 'absolute', inset: -9, borderRadius: '50%',
            border: '1px solid rgba(167,139,250,0.35)',
            animation: 'spinOrb 3s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: '#22d3ee', boxShadow: '0 0 8px #22d3ee',
            }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
