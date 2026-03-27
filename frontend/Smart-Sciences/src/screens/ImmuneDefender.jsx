/**
 * ImmuneDefender.jsx — Biology Activity 3 (Game): Иммунный Защитник
 * Canvas game: leukocyte (player) absorbs viruses in the bloodstream.
 * Controls: WASD / Arrow keys. Tap buttons on mobile.
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const PLAYER_R = 22
const VIRUS_R  = 12
const ABSORB_D = PLAYER_R + VIRUS_R - 4  // absorption distance

export function ImmuneDefender({ lang, setMsg, setHappy, addPts }) {
  const { addXP } = useAuth()
  const canvasRef = useRef(null)
  const stateRef  = useRef({
    player: { x: 200, y: 180, vx: 0, vy: 0 },
    viruses: [],
    particles: [],
    keys: {},
    score: 0,
    lives: 3,
    level: 1,
    spawnTimer: 0,
    animId: null,
    running: false,
    frameCount: 0,
  })

  const [uiScore, setUiScore] = useState(0)
  const [uiLives, setUiLives] = useState(3)
  const [uiLevel, setUiLevel] = useState(1)
  const [phase, setPhase] = useState('idle')   // idle | playing | dead
  const [absorbCount, setAbsorbCount] = useState(0)

  /* ── Spawn virus ── */
  const spawnVirus = (W, H, level) => {
    const side = Math.floor(Math.random() * 4)
    let x, y
    if (side === 0) { x = Math.random() * W; y = -20 }
    else if (side === 1) { x = W + 20; y = Math.random() * H }
    else if (side === 2) { x = Math.random() * W; y = H + 20 }
    else { x = -20; y = Math.random() * H }
    const speed = 0.8 + level * 0.25
    const types = ['🦠', '👾', '🔴']
    return { x, y, vx: 0, vy: 0, speed, type: types[Math.floor(Math.random() * types.length)], hp: 1, wobble: Math.random() * Math.PI * 2 }
  }

  /* ── Draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    /* Background — bloodstream */
    ctx.fillStyle = '#180a0a'; ctx.fillRect(0, 0, W, H)
    /* Blood vessel walls */
    const wallGrad = ctx.createLinearGradient(0, 0, 0, H)
    wallGrad.addColorStop(0, 'rgba(180,30,30,0.35)')
    wallGrad.addColorStop(0.5, 'transparent')
    wallGrad.addColorStop(1, 'rgba(180,30,30,0.35)')
    ctx.fillStyle = wallGrad; ctx.fillRect(0, 0, W, H)
    /* Flow lines */
    for (let i = 0; i < 5; i++) {
      const y = (H / 5 * i + s.frameCount * 0.5) % H
      ctx.strokeStyle = `rgba(220,50,50,0.06)`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    /* Particles */
    s.particles = s.particles.filter(p => p.life > 0)
    s.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.r *= 0.93
      ctx.fillStyle = `rgba(34,197,94,${p.life})`
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    })

    /* Viruses */
    s.viruses.forEach(v => {
      ctx.save()
      ctx.translate(v.x, v.y)
      /* Spikes */
      const spikeN = 8
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5
      for (let k = 0; k < spikeN; k++) {
        const a = (k / spikeN) * Math.PI * 2 + v.wobble
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * VIRUS_R, Math.sin(a) * VIRUS_R)
        ctx.lineTo(Math.cos(a) * (VIRUS_R + 7), Math.sin(a) * (VIRUS_R + 7))
        ctx.stroke()
      }
      /* Body */
      const vGrad = ctx.createRadialGradient(-3, -3, 0, 0, 0, VIRUS_R)
      vGrad.addColorStop(0, '#f87171'); vGrad.addColorStop(1, '#b91c1c')
      ctx.fillStyle = vGrad
      ctx.beginPath(); ctx.arc(0, 0, VIRUS_R, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke()
      /* Eye */
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(-4, -4, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1c1917'
      ctx.beginPath(); ctx.arc(-3, -4, 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    })

    /* Player — leukocyte */
    const p = s.player
    /* Glow */
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, PLAYER_R * 2.5)
    glow.addColorStop(0, 'rgba(96,165,250,0.25)'); glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, PLAYER_R * 2.5, 0, Math.PI * 2); ctx.fill()
    /* Body */
    const pGrad = ctx.createRadialGradient(p.x - 7, p.y - 7, 0, p.x, p.y, PLAYER_R)
    pGrad.addColorStop(0, '#93c5fd'); pGrad.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = pGrad
    ctx.beginPath(); ctx.arc(p.x, p.y, PLAYER_R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke()
    /* Nucleus */
    const nGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, 10)
    nGrad.addColorStop(0, '#e0f2fe'); nGrad.addColorStop(1, '#0369a1')
    ctx.fillStyle = nGrad
    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill()
    /* Pseudopods (tentacles) */
    const t = s.frameCount * 0.05
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + t
      const px2 = p.x + Math.cos(a) * (PLAYER_R + Math.sin(t * 2 + k) * 5)
      const py2 = p.y + Math.sin(a) * (PLAYER_R + Math.sin(t * 2 + k) * 5)
      ctx.fillStyle = 'rgba(96,165,250,0.4)'
      ctx.beginPath(); ctx.arc(px2, py2, 4, 0, Math.PI * 2); ctx.fill()
    }

    s.frameCount++
  }, [])

  /* ── Game loop ── */
  const gameLoop = useCallback(() => {
    const s = stateRef.current
    if (!s.running) return
    const canvas = canvasRef.current; if (!canvas) return
    const W = canvas.width, H = canvas.height

    /* Player movement */
    const speed = 4
    if (s.keys['ArrowLeft'] || s.keys['a'])  s.player.vx = Math.max(s.player.vx - 0.8, -speed)
    if (s.keys['ArrowRight'] || s.keys['d']) s.player.vx = Math.min(s.player.vx + 0.8, speed)
    if (s.keys['ArrowUp'] || s.keys['w'])    s.player.vy = Math.max(s.player.vy - 0.8, -speed)
    if (s.keys['ArrowDown'] || s.keys['s'])  s.player.vy = Math.min(s.player.vy + 0.8, speed)
    /* Friction */
    if (!s.keys['ArrowLeft'] && !s.keys['a'] && !s.keys['ArrowRight'] && !s.keys['d']) s.player.vx *= 0.8
    if (!s.keys['ArrowUp']   && !s.keys['w'] && !s.keys['ArrowDown']  && !s.keys['s']) s.player.vy *= 0.8

    s.player.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, s.player.x + s.player.vx))
    s.player.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, s.player.y + s.player.vy))

    /* Spawn viruses */
    s.spawnTimer++
    const spawnRate = Math.max(40, 90 - s.level * 6)
    if (s.spawnTimer >= spawnRate) {
      s.viruses.push(spawnVirus(W, H, s.level))
      s.spawnTimer = 0
    }

    /* Move viruses toward player */
    s.viruses.forEach(v => {
      v.wobble += 0.05
      const dx = s.player.x - v.x, dy = s.player.y - v.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      v.vx += (dx / dist) * v.speed * 0.15
      v.vy += (dy / dist) * v.speed * 0.15
      v.vx *= 0.92; v.vy *= 0.92
      v.x += v.vx; v.y += v.vy

      /* Absorption */
      const adx = s.player.x - v.x, ady = s.player.y - v.y
      if (Math.sqrt(adx * adx + ady * ady) < ABSORB_D) {
        /* Spawn particles */
        for (let i = 0; i < 8; i++) {
          const pa = Math.random() * Math.PI * 2
          s.particles.push({ x: v.x, y: v.y, vx: Math.cos(pa) * 3, vy: Math.sin(pa) * 3, r: 5 + Math.random() * 4, life: 1 })
        }
        v.hp = 0
        s.score++
        setUiScore(s.score)
        setAbsorbCount(c => c + 1)
        /* Level up */
        if (s.score % 5 === 0) {
          s.level++
          setUiLevel(s.level)
          setHappy(true)
          setMsg(lang === 'UZ' ? `🎉 Daraja ${s.level}! Viruslar tezroq bo'lib ketdi!` : `🎉 Уровень ${s.level}! Вирусы ускорились!`)
        }
        /* XP */
        if (s.score % 5 === 0) addXP(10)
      }

      /* Player hit */
      if (Math.sqrt(adx * adx + ady * ady) < PLAYER_R - 4) {
        v.hp = 0
        s.lives--
        setUiLives(s.lives)
        if (s.lives <= 0) {
          s.running = false
          setPhase('dead')
          setMsg(lang === 'UZ' ? '💀 Immunitet tizimi yiqildi! Yana bir marta urining.' : '💀 Иммунитет подавлен! Попробуй снова.')
        }
      }
    })
    s.viruses = s.viruses.filter(v => v.hp > 0)

    draw()
    s.animId = requestAnimationFrame(gameLoop)
  }, [draw, addXP, setHappy, setMsg, lang])

  /* ── Start / Restart ── */
  const startGame = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const W = canvas.width, H = canvas.height
    const s = stateRef.current
    cancelAnimationFrame(s.animId)
    s.player  = { x: W / 2, y: H / 2, vx: 0, vy: 0 }
    s.viruses = []; s.particles = []; s.keys = {}
    s.score   = 0; s.lives = 3; s.level = 1; s.spawnTimer = 0; s.frameCount = 0
    s.running = true
    setUiScore(0); setUiLives(3); setUiLevel(1); setAbsorbCount(0)
    setPhase('playing')
    setMsg(lang === 'UZ' ? '🦠 WASD / strelka tugmalari bilan leykotsitni harakatlantiring — viruslarni yuting!' : '🦠 WASD / стрелки — двигай лейкоцит! Поглощай вирусы!')
    s.animId = requestAnimationFrame(gameLoop)
  }

  /* ── Canvas setup + keyboard ── */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const keyDown = (e) => { stateRef.current.keys[e.key] = true; e.preventDefault() }
    const keyUp   = (e) => { stateRef.current.keys[e.key] = false }
    window.addEventListener('keydown', keyDown, { passive: false })
    window.addEventListener('keyup', keyUp)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      cancelAnimationFrame(stateRef.current.animId)
    }
  }, [])

  /* Mobile directional buttons */
  const pressDirBtn = (dir, down) => {
    stateRef.current.keys[dir] = down
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '🛡 Immunitet Himoyachisi' : '🛡 Иммунный Защитник'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ' ? 'Leykotsitni WASD bilan harakatlantiring — viruslarni yuting!' : 'WASD / стрелки — управляй лейкоцитом, поглощай вирусы!'}
        </p>
      </div>

      {/* Stats bar */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          {[
            { icon: '❤️', val: Array(uiLives).fill('❤').join('') + Array(3 - uiLives).fill('🖤').join(''), lbl: '' },
            { icon: '🦠', val: uiScore, lbl: lang === 'UZ' ? 'Yutildi' : 'Поглощено' },
            { icon: '⭐', val: uiLevel, lbl: lang === 'UZ' ? 'Daraja' : 'Уровень' },
          ].map(st => (
            <div key={st.lbl} style={{
              flex: 1, padding: '6px 10px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center', fontSize: 11,
            }}>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 14 }}>{st.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>{st.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(220,50,50,0.3)', height: 260, position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Overlays */}
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={startGame}
                style={{
                  padding: '12px 28px', borderRadius: 14, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#22c55e,#15803d)',
                  border: 'none', color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '▶ O\'yinni boshlash' : '▶ Начать игру'}
              </motion.button>
            </motion.div>
          )}
          {phase === 'dead' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>💀</div>
              <div style={{ color: '#f87171', fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
                {lang === 'UZ' ? 'Immunitet yiqildi!' : 'Иммунитет подавлен!'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
                {lang === 'UZ' ? `${uiScore} ta virus yutildingiz` : `Поглощено вирусов: ${uiScore}`}
              </div>
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={startGame}
                style={{
                  padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                  border: 'none', color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {lang === 'UZ' ? '🔄 Qayta' : '🔄 Ещё раз'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile controls */}
      {phase === 'playing' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onPointerDown={() => pressDirBtn('ArrowUp', true)}
              onPointerUp={() => pressDirBtn('ArrowUp', false)}
              onPointerLeave={() => pressDirBtn('ArrowUp', false)}
              style={{ padding: '10px 24px', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit', fontSize: 16 }}
            >▲</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {[['ArrowLeft','◄'],['ArrowDown','▼'],['ArrowRight','►']].map(([dir,lbl]) => (
              <button key={dir}
                onPointerDown={() => pressDirBtn(dir, true)}
                onPointerUp={() => pressDirBtn(dir, false)}
                onPointerLeave={() => pressDirBtn(dir, false)}
                style={{ padding: '10px 16px', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit', fontSize: 16 }}
              >{lbl}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
