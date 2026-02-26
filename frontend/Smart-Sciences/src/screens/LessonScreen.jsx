/**
 * LessonScreen.jsx — Three interactive chemistry lessons.
 *
 * Lessons (indexed by lessonIndex prop):
 *   0 — ATP / «Почему мы двигаемся?»
 *       Click phosphate (Pi) groups to charge ADP → ATP.
 *
 *   1 — Calcium / «Крепкие кости»
 *       3-question multiple-choice quiz with a bone-density progress bar.
 *
 *   2 — Dopamine / «Химия эмоций»
 *       Click dopamine molecules in the synapse to activate receptors.
 *
 * Rewards: +50 XP + lesson-specific medal on completion.
 *
 * Audio placeholders — replace paths with your own .mp3 files:
 *   /sounds/lesson_correct.mp3   — correct quiz answer
 *   /sounds/lesson_wrong.mp3     — wrong quiz answer
 *   /sounds/lesson_win.mp3       — lesson completed
 *   /sounds/lesson_step.mp3      — professor speaking
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth }  from '../context/AuthContext.jsx'
import { snd }      from '../utils/sound.js'
import { TOPIC_META } from '../data/constants.js'

// ── Bilingual lesson content ────────────────────────────────────
const LESSON_DATA = {
  RU: [
    // ── Lesson 0: ATP ─────────────────────────────────────────
    {
      title:    'Почему мы двигаемся?',
      subtitle: 'АТФ — молекула энергии',
      medal:    'lesson_atp',
      type:     'atp',
      profMsgs: [
        'Перед тобой молекула АДФ — аденозиндифосфат. Ей не хватает энергии! Нажимай на группы Pi (фосфат), чтобы зарядить её! ⚡',
        'Отлично! Один фосфат присоединён! Ещё два — и АТФ будет полностью заряжена!',
        'Почти готово! Последний фосфат — и клетки получат топливо для движения!',
        '⚡ АТФ создана! Аденозинтрифосфат — это батарейка каждой клетки твоего тела!',
      ],
      winMsg: '🎉 Ты создал АТФ! Теперь мышцы получат энергию для движения!',
    },
    // ── Lesson 1: Calcium ─────────────────────────────────────
    {
      title:    'Крепкие кости',
      subtitle: 'Кальций и костная ткань',
      medal:    'lesson_calcium',
      type:     'quiz',
      profMsgs: [
        'Проверь свои знания о кальции! Выбери правильный ответ на каждый вопрос.',
        'Правильно! Отличное знание химии!',
        'Не совсем верно — но теперь ты знаешь правильный ответ!',
        '🦴 Великолепно! Теперь ты знаешь, почему нужно пить молоко и гулять на солнце!',
      ],
      winMsg: '🦴 Ты настоящий знаток костной химии! +50 XP!',
      questions: [
        {
          q:       'Какой минерал составляет основу костной ткани?',
          opts:    ['Натрий (Na)', 'Кальций (Ca)', 'Железо (Fe)', 'Цинк (Zn)'],
          correct: 1,
          explain: 'Кальций (Ca) — главный строительный материал скелета!',
        },
        {
          q:       'Как называется основной минерал кости?',
          opts:    ['CaCO₃', 'Ca₁₀(PO₄)₆(OH)₂', 'Ca₃(PO₄)₂', 'NaCl'],
          correct: 1,
          explain: 'Гидроксиапатит Ca₁₀(PO₄)₆(OH)₂ — кристаллическая решётка кости!',
        },
        {
          q:       'Что помогает усвоению кальция в организме?',
          opts:    ['Витамин A', 'Витамин B₁₂', 'Витамин C', 'Витамин D'],
          correct: 3,
          explain: 'Витамин D активирует всасывание кальция в кишечнике!',
        },
      ],
    },
    // ── Lesson 2: Dopamine ────────────────────────────────────
    {
      title:    'Химия эмоций',
      subtitle: 'Дофамин и нейронные сети',
      medal:    'lesson_dopamine',
      type:     'synapse',
      target:   6,
      profMsgs: [
        'Перед тобой синапс — щель между нейронами. Дофамин (🟣) плавает между ними. Нажимай на молекулы, чтобы отправить их к рецепторам правого нейрона!',
        'Отличный захват! Дофамин активирует рецептор и передаёт сигнал!',
        '😊 Все рецепторы активированы! Именно так мозг создаёт ощущение радости и мотивации!',
      ],
      winMsg: '😊 Ты активировал дофаминовые рецепторы! Вот как рождается радость!',
    },
  ],
  UZ: [
    {
      title:    'Nima uchun harakatlanamiz?',
      subtitle: 'ATF — energiya molekulasi',
      medal:    'lesson_atp',
      type:     'atp',
      profMsgs: [
        'Oldingizda ADF molekulasi — adenozin difosfat. Unga energiya yetishmayapti! Pi (fosfat) guruhlarini bosing va uni zaryadlang! ⚡',
        'Ajoyib! Bir fosfat ulandi! Yana ikkitasi — va ATF to\'liq zaryadlanadi!',
        'Deyarli tayyor! Oxirgi fosfat — va hujayralar harakat uchun yoqilg\'i oladi!',
        '⚡ ATF yaratildi! Adenozin trifosfat — tanangizning har bir hujayrasining batareyasi!',
      ],
      winMsg: '🎉 Siz ATF yaratdingiz! Endi muskullar harakat uchun energiya oladi!',
    },
    {
      title:    'Mustahkam suyaklar',
      subtitle: 'Kaltsiy va suyak to\'qimasi',
      medal:    'lesson_calcium',
      type:     'quiz',
      profMsgs: [
        'Kaltsiy haqidagi bilimingizni sinab ko\'ring! Har bir savol uchun to\'g\'ri javobni tanlang.',
        'To\'g\'ri! Kimyoni zo\'r bilasiz!',
        'Unchalik to\'g\'ri emas — lekin endi to\'g\'ri javobni bilasiz!',
        '🦴 Zo\'r! Endi nima uchun sut ichish va quyoshda sayr qilish kerakligini bilasiz!',
      ],
      winMsg: '🦴 Siz haqiqiy suyak kimyosi bilimdonisiz! +50 XP!',
      questions: [
        {
          q:       'Suyak to\'qimasining asosini qaysi mineral tashkil etadi?',
          opts:    ['Natriy (Na)', 'Kaltsiy (Ca)', 'Temir (Fe)', 'Rux (Zn)'],
          correct: 1,
          explain: 'Kaltsiy (Ca) — skeletning asosiy qurilish materiali!',
        },
        {
          q:       'Suyakning asosiy minerali qanday nomlanadi?',
          opts:    ['CaCO₃', 'Ca₁₀(PO₄)₆(OH)₂', 'Ca₃(PO₄)₂', 'NaCl'],
          correct: 1,
          explain: 'Gidroksiapatit Ca₁₀(PO₄)₆(OH)₂ — suyakning kristall panjarasi!',
        },
        {
          q:       'Organizmda kaltsiyning o\'zlashtirishiga nima yordam beradi?',
          opts:    ['A vitamini', 'B₁₂ vitamini', 'C vitamini', 'D vitamini'],
          correct: 3,
          explain: 'D vitamini ichaklarda kaltsiyning so\'rilishini faollashtiradi!',
        },
      ],
    },
    {
      title:    'Hissiyotlar kimyosi',
      subtitle: 'Dopamin va neyron tarmoqlari',
      medal:    'lesson_dopamine',
      type:     'synapse',
      target:   6,
      profMsgs: [
        'Oldingizda sinaps — neyronlar orasidagi bo\'shliq. Dopamin (🟣) suzib yurmoqda. O\'ng neyronning retseptorlariga yuborish uchun molekulalarni bosing!',
        'Ajoyib! Dopamin retseptorni faollashtiradi va signal uzatadi!',
        '😊 Barcha retseptorlar faollashtirildi! Miya xuddi shunday quvonch va motivatsiya hissini yaratadi!',
      ],
      winMsg: '😊 Siz dopamin retseptorlarini faollashtirdingiz! Quvonch shunday tug\'iladi!',
    },
  ],
}

// ── Shared professor bubble ─────────────────────────────────────
function ProfBubble({ msg, col = '#818cf8' }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={msg}
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{
          padding: '14px 18px',
          borderRadius: 18,
          background: `linear-gradient(135deg,rgba(30,27,75,0.9),rgba(45,42,110,0.9))`,
          border: `1.5px solid ${col}55`,
          boxShadow: `0 0 24px ${col}22`,
          marginBottom: 20,
          position: 'relative',
        }}
      >
        {/* Atom avatar */}
        <div style={{
          position: 'absolute', top: -14, left: 16,
          width: 28, height: 28, borderRadius: '50%',
          background: `linear-gradient(135deg,#4f46e5,${col})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, boxShadow: `0 0 10px ${col}66`,
        }}>⚛</div>
        <p style={{
          color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.7,
          margin: '8px 0 0', fontWeight: 500,
        }}>
          {msg}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

// ── WIN banner ──────────────────────────────────────────────────
function WinBanner({ msg, col }) {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{
        textAlign: 'center', padding: '24px 20px', borderRadius: 22,
        background: `linear-gradient(135deg,${col}22,rgba(74,222,128,0.1))`,
        border: `1.5px solid ${col}66`,
        boxShadow: `0 0 40px ${col}33`,
        marginTop: 16,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
      <div style={{ color: '#fff', fontWeight: 900, fontSize: 17, marginBottom: 6 }}>{msg}</div>
      <div style={{
        display: 'inline-block', padding: '6px 20px', borderRadius: 99,
        background: 'linear-gradient(90deg,#4ade80,#22d3ee)',
        color: '#fff', fontWeight: 900, fontSize: 14,
      }}>
        +50 XP 🌟
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// LESSON 0: ATP — "Почему мы двигаемся?"
// ══════════════════════════════════════════════════════════════
function ATPLesson({ data, lang, onWin }) {
  const [attached, setAttached] = useState(0)   // 0–3 phosphate groups added
  const [won,      setWon]      = useState(false)
  const [profMsg,  setProfMsg]  = useState(data.profMsgs[0])

  useEffect(() => {
    if (!won) setProfMsg(data.profMsgs[Math.min(attached, 2)])
  }, [attached, won])

  function handlePi() {
    if (won || attached >= 3) return
    snd('drop')
    // TODO: replace with your own audio:
    // new Audio('/sounds/lesson_step.mp3').play().catch(() => {})
    const next = attached + 1
    setAttached(next)
    if (next >= 3) {
      setTimeout(() => {
        snd('win')
        // TODO: new Audio('/sounds/lesson_win.mp3').play().catch(() => {})
        setProfMsg(data.profMsgs[3])
        setWon(true)
        onWin(data.medal, data.winMsg)
      }, 350)
    }
  }

  const col = '#22d3ee'
  const piRemaining = 3 - attached

  return (
    <div>
      <ProfBubble msg={profMsg} col={col} />

      {/* Molecule chain: Adenosine — P — P — [slot][slot][slot] */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, marginBottom: 20, minWidth: 340,
        }}>
          {/* Adenosine body */}
          <motion.div
            animate={{ boxShadow: won ? ['0 0 12px #4ade80','0 0 28px #4ade80','0 0 12px #4ade80'] : '0 0 12px #818cf844' }}
            transition={{ duration: 1.5, repeat: won ? Infinity : 0 }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#1e1b4b', border: '2px solid #818cf8',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#a78bfa', fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>Аде</span>
            <span style={{ color: '#818cf8', fontWeight: 800, fontSize: 9, fontFamily: 'monospace' }}>нозин</span>
          </motion.div>

          {/* 5 phosphate groups: 2 original + 3 slots */}
          {[0, 1, 2, 3, 4].map(i => {
            const filled = i < 2 || (i - 2) < attached
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Connector line */}
                <div style={{
                  width: i === 0 ? 12 : 8, height: 3,
                  background: filled ? col : 'rgba(255,255,255,0.15)',
                  transition: 'background .4s',
                  flexShrink: 0,
                }} />
                {/* Phosphate circle */}
                <motion.div
                  animate={filled ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: i < 2 ? 38 : 34, height: i < 2 ? 38 : 34,
                    borderRadius: '50%', flexShrink: 0,
                    background: filled ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${filled ? col : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: filled ? `0 0 14px ${col}88` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .4s',
                  }}
                >
                  <span style={{
                    color: filled ? col : 'rgba(255,255,255,0.2)',
                    fontWeight: 900, fontSize: 11, fontFamily: 'monospace',
                    transition: 'color .4s',
                  }}>P</span>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <motion.span
          animate={won ? { color: ['#22d3ee', '#4ade80', '#22d3ee'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: '#22d3ee', fontWeight: 900, fontSize: 18, fontFamily: 'monospace' }}
        >
          {attached < 3
            ? `АДФ (ADP) — ${attached}/3 Pi`
            : '⚡ АТФ (ATP) — заряжена!'}
        </motion.span>
      </div>

      {/* Floating Pi buttons */}
      {!won && piRemaining > 0 && (
        <div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
            {lang === 'UZ' ? 'Pi guruhlarini bosing 👆' : 'Нажимай на группы Pi 👆'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
            {Array.from({ length: piRemaining }, (_, i) => (
              <motion.button
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePi}
                style={{
                  width: 58, height: 58, borderRadius: '50%',
                  background: 'rgba(34,211,238,0.12)',
                  border: '2px solid #22d3ee',
                  boxShadow: '0 0 20px rgba(34,211,238,0.5)',
                  color: '#22d3ee', fontWeight: 900, fontSize: 14,
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
              >
                Pi
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {won && <WinBanner msg={data.winMsg} col={col} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LESSON 1: CALCIUM QUIZ — "Крепкие кости"
// ══════════════════════════════════════════════════════════════
function CalciumLesson({ data, lang, onWin }) {
  const [qIdx,    setQIdx]    = useState(0)
  const [selected, setSelected] = useState(null)   // chosen answer index
  const [correct, setCorrect] = useState(false)
  const [score,   setScore]   = useState(0)
  const [profMsg, setProfMsg] = useState(data.profMsgs[0])
  const [won,     setWon]     = useState(false)

  const totalQ = data.questions.length
  const q      = data.questions[qIdx]
  const col    = '#a78bfa'

  function choose(idx) {
    if (selected !== null || won) return
    const isCorrect = idx === q.correct
    setSelected(idx)
    setCorrect(isCorrect)

    if (isCorrect) {
      snd('win')
      // TODO: new Audio('/sounds/lesson_correct.mp3').play().catch(() => {})
      setProfMsg(`✅ ${data.profMsgs[1]} — ${q.explain}`)
      const newScore = score + 1
      setScore(newScore)
      if (newScore >= totalQ) {
        setTimeout(() => {
          snd('medal')
          // TODO: new Audio('/sounds/lesson_win.mp3').play().catch(() => {})
          setProfMsg(data.profMsgs[3])
          setWon(true)
          onWin(data.medal, data.winMsg)
        }, 1200)
      }
    } else {
      snd('wrong')
      // TODO: new Audio('/sounds/lesson_wrong.mp3').play().catch(() => {})
      setProfMsg(`❌ ${data.profMsgs[2]} ${q.explain}`)
    }
  }

  function next() {
    if (qIdx + 1 >= totalQ) return
    setQIdx(qi => qi + 1)
    setSelected(null)
    setCorrect(false)
    setProfMsg(data.profMsgs[0])
  }

  return (
    <div>
      {/* Bone density bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>
            🦴 {lang === 'UZ' ? 'Suyak mustahkamligi' : 'Крепость костей'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {score}/{totalQ}
          </span>
        </div>
        <div style={{ height: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(score / totalQ) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg,#a78bfa,#4ade80)',
              boxShadow: '0 0 10px #a78bfa',
            }}
          />
        </div>
      </div>

      <ProfBubble msg={profMsg} col={col} />

      {!won && (
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div style={{
              padding: '16px 18px', borderRadius: 16, marginBottom: 14,
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.25)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>
                {lang === 'UZ' ? 'Savol' : 'Вопрос'} {qIdx + 1}/{totalQ}
              </div>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
                {q.q}
              </p>
            </div>

            {/* Answer options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {q.opts.map((opt, i) => {
                let bg = 'rgba(255,255,255,0.04)'
                let border = '1px solid rgba(255,255,255,0.1)'
                let textCol = '#e2e8f0'
                if (selected !== null) {
                  if (i === q.correct) {
                    bg = 'rgba(74,222,128,0.15)'; border = '1.5px solid #4ade80'; textCol = '#4ade80'
                  } else if (i === selected && !correct) {
                    bg = 'rgba(239,68,68,0.15)'; border = '1.5px solid #ef4444'; textCol = '#fca5a5'
                  }
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={selected === null ? { scale: 1.03 } : {}}
                    whileTap={selected === null ? { scale: 0.97 } : {}}
                    onClick={() => choose(i)}
                    style={{
                      padding: '12px 10px', borderRadius: 13,
                      background: bg, border, cursor: selected === null ? 'pointer' : 'default',
                      color: textCol, fontWeight: 600, fontSize: 13,
                      fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.4,
                      transition: 'all .25s',
                    }}
                  >
                    {opt}
                  </motion.button>
                )
              })}
            </div>

            {/* Next question button */}
            {selected !== null && qIdx + 1 < totalQ && !won && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={next}
                style={{
                  width: '100%', marginTop: 14, padding: '12px',
                  borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#818cf8,#6366f1)',
                  color: '#fff', fontWeight: 800, fontSize: 14,
                  fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                {lang === 'UZ' ? 'Keyingi savol →' : 'Следующий вопрос →'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {won && <WinBanner msg={data.winMsg} col={col} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LESSON 2: DOPAMINE SYNAPSE — "Химия эмоций"
// ══════════════════════════════════════════════════════════════
const INIT_DOPAMINE = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    // Random position within the synaptic gap area
    x: 22 + Math.random() * 56,   // % of container width
    y: 15 + Math.random() * 70,   // % of container height
    sent: false,
  }))

function DopamineLesson({ data, lang, onWin }) {
  const [molecules, setMolecules] = useState(INIT_DOPAMINE)
  const [sent,      setSent]      = useState(0)
  const [profMsg,   setProfMsg]   = useState(data.profMsgs[0])
  const [won,       setWon]       = useState(false)

  const total = data.target ?? 6
  const col   = '#f472b6'

  function sendMolecule(id) {
    if (won) return
    snd('drop')
    // TODO: new Audio('/sounds/lesson_step.mp3').play().catch(() => {})
    setMolecules(prev => prev.map(m => m.id === id ? { ...m, sent: true } : m))
    const newSent = sent + 1
    setSent(newSent)
    if (newSent >= total) {
      setTimeout(() => {
        snd('win')
        // TODO: new Audio('/sounds/lesson_win.mp3').play().catch(() => {})
        setProfMsg(data.profMsgs[2])
        setWon(true)
        onWin(data.medal, data.winMsg)
      }, 500)
    } else if (newSent === 1) {
      setProfMsg(data.profMsgs[1])
    }
  }

  return (
    <div>
      {/* Joy meter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>
            😊 {lang === 'UZ' ? 'Quvonch darajasi' : 'Уровень радости'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {sent}/{total}
          </span>
        </div>
        <div style={{ height: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(sent / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg,#f472b6,#fbbf24)',
              boxShadow: '0 0 10px #f472b6',
            }}
          />
        </div>
      </div>

      <ProfBubble msg={profMsg} col={col} />

      {/* Synapse visualization */}
      <div style={{
        position: 'relative', height: 200, borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(135deg,rgba(15,10,40,0.9),rgba(30,10,60,0.9))',
        border: '1px solid rgba(244,114,182,0.2)',
        marginBottom: 16,
      }}>
        {/* Left neuron (presynaptic) */}
        <div style={{
          position: 'absolute', left: -30, top: '50%', transform: 'translateY(-50%)',
          width: 110, height: 110, borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 40%,rgba(99,102,241,0.4),rgba(79,70,229,0.15))',
          border: '2px solid rgba(129,140,248,0.5)',
          boxShadow: '0 0 30px rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ marginLeft: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>🧠</div>
            <div style={{ color: '#818cf8', fontSize: 9, fontWeight: 700, marginTop: 2 }}>Нейрон 1</div>
          </div>
        </div>

        {/* Right neuron (postsynaptic) */}
        <div style={{
          position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)',
          width: 110, height: 110, borderRadius: '50%',
          background: `radial-gradient(circle at 40% 40%,${won ? 'rgba(244,114,182,0.4)' : 'rgba(30,10,60,0.4)'},rgba(244,114,182,0.1))`,
          border: `2px solid ${won ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`,
          boxShadow: won ? '0 0 40px rgba(244,114,182,0.5)' : '0 0 20px rgba(244,114,182,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .6s',
        }}>
          <div style={{ marginRight: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{won ? '😊' : '😐'}</div>
            <div style={{ color: col, fontSize: 9, fontWeight: 700, marginTop: 2 }}>Нейрон 2</div>
          </div>
        </div>

        {/* Synaptic gap label */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 700, letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}>
          — {lang === 'UZ' ? 'SINAPS' : 'СИНАПС'} —
        </div>

        {/* Dopamine molecules */}
        {molecules.map(m => !m.sent && (
          <motion.button
            key={m.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: [0, 3, -3, 0], y: [0, -4, 0] }}
            transition={{
              scale: { duration: 0.3 },
              x: { duration: 3 + m.id * 0.4, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 2 + m.id * 0.3, repeat: Infinity, ease: 'easeInOut', delay: m.id * 0.2 },
            }}
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => sendMolecule(m.id)}
            style={{
              position: 'absolute',
              left: `${m.x}%`,
              top:  `${m.y}%`,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(244,114,182,0.25)',
              border: '2px solid #f472b6',
              boxShadow: '0 0 14px rgba(244,114,182,0.7)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12,
              transform: 'translate(-50%,-50%)',
            }}
          >
            🟣
          </motion.button>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', margin: '0 0 8px' }}>
        {lang === 'UZ' ? '🟣 Dopamin molekulalarini bosing!' : '🟣 Нажимай на молекулы дофамина!'}
      </p>

      {won && <WinBanner msg={data.winMsg} col={col} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN: LessonScreen
// ══════════════════════════════════════════════════════════════
export function LessonScreen({ lessonIndex, t, lang, setMsg, setHappy, onBack }) {
  const { addXP, addMedal, medals } = useAuth()

  const allData = LESSON_DATA[lang] ?? LESSON_DATA.RU
  const data    = allData[lessonIndex] ?? allData[0]
  const meta    = TOPIC_META[lessonIndex] ?? TOPIC_META[0]

  // Sync professor bubble in sidebar
  useEffect(() => {
    setMsg(data.profMsgs[0])
    // TODO: new Audio('/sounds/lesson_step.mp3').play().catch(() => {})
    snd('think')
  }, [lessonIndex, lang])

  function handleWin(medalId, winMsg) {
    setHappy(true)
    addXP(50)
    if (!medals.includes(medalId)) addMedal(medalId)
    setMsg(winMsg)
    snd('medal')
    // TODO: new Audio('/sounds/lesson_win.mp3').play().catch(() => {})
  }

  const lessonProps = { data, lang, onWin: handleWin }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '16px 16px 100px', maxWidth: 560, margin: '0 auto' }}
    >
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '7px 14px',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
          }}
        >
          ← {lang === 'UZ' ? 'Orqaga' : 'Назад'}
        </button>

        <div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{data.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{data.subtitle}</div>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 24 }}>{meta.icon}</div>
      </div>

      {/* Gradient accent bar */}
      <div style={{
        height: 4, borderRadius: 2, marginBottom: 20,
        background: meta.grad,
        boxShadow: `0 0 16px ${meta.tcol}66`,
      }} />

      {/* Lesson content */}
      {data.type === 'atp'     && <ATPLesson      {...lessonProps} />}
      {data.type === 'quiz'    && <CalciumLesson   {...lessonProps} />}
      {data.type === 'synapse' && <DopamineLesson  {...lessonProps} />}
    </motion.div>
  )
}
