/**
 * MoleculeBuilder.jsx — «Конструктор молекул» mini-game
 *
 * How it works:
 *  1. Player picks one of 5 molecules from the task list
 *  2. A workspace shows ghost atom "slots" + dotted bond lines
 *  3. Atom palette at bottom — click to fill selected slot
 *  4. Click two filled atoms to draw/remove a bond between them
 *  5. "Проверить" validates via moleculeValidator.js
 *  6. Correct → XP + achievement + confetti burst
 *
 * Quest integration (used from LabScreen quests):
 *  Props: questMolecule — molecule id to auto-select
 */

import { useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { snd }     from '../utils/sound.js'
import { validateMolecule, atomsMatchTarget } from '../utils/moleculeValidator.js'

// ── Molecule task definitions ───────────────────────────────────
// slots: { id, symbol, x, y }  — x/y in % of workspace
// bonds: [[slotId, slotId], ...]  — expected bonds (for hint display)
const TASKS = [
  {
    id: 'h2o', formulaRU: 'H₂O', formulaUZ: 'H₂O',
    nameRU: 'Вода', nameUZ: 'Suv',
    color: '#22d3ee', icon: '💧',
    atoms: { H: 2, O: 1 },
    xp: 20,
    achievementId: 'mol_h2o',
    hintRU: 'Кислород посередине — два водорода по бокам',
    hintUZ: 'Kislorod markazda — ikki vodorod yonida',
    slots: [
      { id: 'O-0', symbol: 'O', x: 50, y: 38 },
      { id: 'H-0', symbol: 'H', x: 22, y: 65 },
      { id: 'H-1', symbol: 'H', x: 78, y: 65 },
    ],
    expectedBonds: [['O-0','H-0'], ['O-0','H-1']],
  },
  {
    id: 'co2', formulaRU: 'CO₂', formulaUZ: 'CO₂',
    nameRU: 'Углекислый газ', nameUZ: 'Karbonat angidrid',
    color: '#f472b6', icon: '🌿',
    atoms: { C: 1, O: 2 },
    xp: 25,
    achievementId: 'mol_co2',
    hintRU: 'Углерод в центре — два атома кислорода слева и справа',
    hintUZ: 'Uglerod markazda — chap va o\'ngda ikki kislorod',
    slots: [
      { id: 'O-0', symbol: 'O', x: 16, y: 50 },
      { id: 'C-0', symbol: 'C', x: 50, y: 50 },
      { id: 'O-1', symbol: 'O', x: 84, y: 50 },
    ],
    expectedBonds: [['O-0','C-0'], ['C-0','O-1']],
  },
  {
    id: 'nacl', formulaRU: 'NaCl', formulaUZ: 'NaCl',
    nameRU: 'Поваренная соль', nameUZ: 'Osh tuzi',
    color: '#a78bfa', icon: '🧂',
    atoms: { Na: 1, Cl: 1 },
    xp: 15,
    achievementId: 'mol_nacl',
    hintRU: 'Натрий и хлор — одна связь между ними',
    hintUZ: 'Natriy va xlor — ular orasida bitta bog\'',
    slots: [
      { id: 'Na-0', symbol: 'Na', x: 30, y: 50 },
      { id: 'Cl-0', symbol: 'Cl', x: 70, y: 50 },
    ],
    expectedBonds: [['Na-0','Cl-0']],
  },
  {
    id: 'nh3', formulaRU: 'NH₃', formulaUZ: 'NH₃',
    nameRU: 'Аммиак', nameUZ: 'Ammiak',
    color: '#34d399', icon: '💨',
    atoms: { N: 1, H: 3 },
    xp: 25,
    achievementId: 'mol_nh3',
    hintRU: 'Азот в центре — три атома водорода вокруг',
    hintUZ: 'Azot markazda — atrofida uchta vodorod',
    slots: [
      { id: 'N-0',  symbol: 'N', x: 50, y: 35 },
      { id: 'H-0',  symbol: 'H', x: 25, y: 68 },
      { id: 'H-1',  symbol: 'H', x: 50, y: 74 },
      { id: 'H-2',  symbol: 'H', x: 75, y: 68 },
    ],
    expectedBonds: [['N-0','H-0'], ['N-0','H-1'], ['N-0','H-2']],
  },
  {
    id: 'o2', formulaRU: 'O₂', formulaUZ: 'O₂',
    nameRU: 'Кислород (молекулярный)', nameUZ: 'Kislorod (molekulyar)',
    color: '#818cf8', icon: '🫁',
    atoms: { O: 2 },
    xp: 15,
    achievementId: 'mol_o2',
    hintRU: 'Два атома кислорода соединены двойной связью',
    hintUZ: 'Ikki kislorod atomi qo\'sh bog\' bilan bog\'langan',
    slots: [
      { id: 'O-0', symbol: 'O', x: 30, y: 50 },
      { id: 'O-1', symbol: 'O', x: 70, y: 50 },
    ],
    expectedBonds: [['O-0','O-1']],
  },
]

// Atom palette colours (symbol → hex)
const ATOM_COL = {
  H:  '#67e8f9', C: '#f9a8d4', O: '#a78bfa', N: '#c4b5fd',
  Na: '#4ade80', Cl: '#a3e635', S: '#eab308', Fe: '#f87171',
}
function atomColor(sym) { return ATOM_COL[sym] ?? '#94a3b8' }

// ── Main component ──────────────────────────────────────────────
export function MoleculeBuilder({ t, lang, setMsg, setHappy, addPts }) {
  const { addXP, earnAchievement } = useAuth()

  const [taskId,    setTaskId]    = useState(null)       // selected task id
  const [filled,    setFilled]    = useState({})          // { slotId: symbol | null }
  const [bonds,     setBonds]     = useState([])          // [[id,id], ...]
  const [selSlot,   setSelSlot]   = useState(null)        // selected slot for filling
  const [selAtom,   setSelAtom]   = useState(null)        // selected placed atom for bonding
  const [status,    setStatus]    = useState('idle')      // idle|error|success
  const [errorMsg,  setErrorMsg]  = useState('')
  const [showHint,  setShowHint]  = useState(false)
  const [completed, setCompleted] = useState([])          // completed task ids

  const workspaceRef = useRef(null)

  const task = TASKS.find(t => t.id === taskId)

  // ── Start a task ──────────────────────────────────────────────
  const startTask = (id) => {
    snd('click')
    setTaskId(id)
    setFilled({})
    setBonds([])
    setSelSlot(null)
    setSelAtom(null)
    setStatus('idle')
    setErrorMsg('')
    setShowHint(false)
    const tsk = TASKS.find(t => t.id === id)
    setMsg(lang === 'UZ'
      ? `🧬 ${tsk.nameUZ} yaratish vaqti!`
      : `🧬 Соберём молекулу ${tsk.nameRU}!`)
  }

  // ── Click a slot in the workspace ────────────────────────────
  const handleSlotClick = (slotId) => {
    if (status === 'success') return

    const isFilled = filled[slotId] != null

    if (isFilled) {
      // Bonding mode: select this filled atom
      if (selAtom === slotId) {
        setSelAtom(null)   // deselect
      } else if (selAtom) {
        // Create or remove bond between selAtom and slotId
        const exists = bonds.some(([a, b]) =>
          (a === selAtom && b === slotId) || (a === slotId && b === selAtom)
        )
        if (exists) {
          setBonds(prev => prev.filter(([a, b]) =>
            !((a === selAtom && b === slotId) || (a === slotId && b === selAtom))
          ))
          snd('click')
        } else {
          setBonds(prev => [...prev, [selAtom, slotId]])
          snd('pour')
        }
        setSelAtom(null)
      } else {
        setSelAtom(slotId)
        snd('click')
      }
      setSelSlot(null)
    } else {
      // Slot filling mode
      setSelSlot(selSlot === slotId ? null : slotId)
      setSelAtom(null)
      snd('click')
    }
    setStatus('idle')
    setErrorMsg('')
  }

  // ── Click an atom button in the palette ──────────────────────
  const handleAtomPick = (symbol) => {
    if (!selSlot || status === 'success') return
    snd('pour')
    setFilled(prev => ({ ...prev, [selSlot]: symbol }))
    setSelSlot(null)
  }

  // ── Validate ─────────────────────────────────────────────────
  const check = useCallback(() => {
    if (!task) return
    snd('click')

    // Build slot array with placed atoms
    const slots = task.slots.map(s => ({
      id:     s.id,
      symbol: filled[s.id] ?? '',
    })).filter(s => s.symbol !== '')

    // 1. Are all slots filled?
    if (slots.length < task.slots.length) {
      setStatus('error')
      setErrorMsg(lang === 'UZ'
        ? 'Barcha slotlarni to\'ldiring!'
        : 'Заполни все слоты атомами!')
      return
    }

    // 2. Are the right atoms placed?
    if (!atomsMatchTarget(slots, task.atoms)) {
      setStatus('error')
      setErrorMsg(lang === 'UZ'
        ? `Noto\'g\'ri atomlar! Kerak: ${Object.entries(task.atoms).map(([s,n]) => `${n}×${s}`).join(', ')}`
        : `Не те атомы! Нужно: ${Object.entries(task.atoms).map(([s,n]) => `${n}×${s}`).join(', ')}`)
      return
    }

    // 3. Validate bonds + valence
    const result = validateMolecule(slots, bonds)
    if (!result.ok) {
      setStatus('error')
      setErrorMsg(result.error)
      return
    }

    // ── SUCCESS ──
    snd('magic')
    setStatus('success')
    setHappy(true)
    addXP(task.xp)
    earnAchievement(task.achievementId).catch(() => {})

    if (!completed.includes(task.id)) {
      setCompleted(prev => [...prev, task.id])
    }

    if (addPts && workspaceRef.current) {
      const r = workspaceRef.current.getBoundingClientRect()
      addPts(r.left + r.width / 2, r.top + r.height / 2, task.color)
    }

    setMsg(lang === 'UZ'
      ? `🎉 ${task.formulaUZ} yaratildi! +${task.xp} XP!`
      : `🎉 Молекула ${task.formulaRU} собрана! +${task.xp} XP!`)
  }, [task, filled, bonds, lang, completed, addXP, earnAchievement, setHappy, setMsg, addPts])

  // ── Reset current task ────────────────────────────────────────
  const reset = () => {
    setFilled({})
    setBonds([])
    setSelSlot(null)
    setSelAtom(null)
    setStatus('idle')
    setErrorMsg('')
    snd('click')
  }

  // ── Available palette atoms for current task ──────────────────
  const paletteAtoms = task ? [...new Set(task.slots.map(s => s.symbol))] : []

  // ── Task list screen ──────────────────────────────────────────
  if (!taskId) {
    return (
      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
            {lang === 'UZ' ? '🧬 Molekula Konstruktori' : '🧬 Конструктор Молекул'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
            {lang === 'UZ'
              ? 'Atomlarni to\'g\'ri joylang va bog\'larni chizing'
              : 'Расставь атомы по местам и соедини их связями'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TASKS.map(task => {
            const done = completed.includes(task.id)
            return (
              <button
                key={task.id}
                onClick={() => startTask(task.id)}
                style={{
                  background: done
                    ? `${task.color}15`
                    : 'linear-gradient(135deg,rgba(14,6,38,0.97),rgba(4,8,34,0.97))',
                  border: `1px solid ${done ? task.color + '55' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 18, padding: '14px 16px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                  transition: 'border-color 0.2s',
                }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{task.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: task.color, fontWeight: 900, fontSize: 15 }}>
                      {task.formulaRU}
                    </span>
                    {done && (
                      <span style={{
                        background: `${task.color}20`, border: `1px solid ${task.color}`,
                        borderRadius: 12, padding: '1px 8px',
                        fontSize: 10, color: task.color, fontWeight: 800,
                      }}>✓</span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
                    {lang === 'UZ' ? task.nameUZ : task.nameRU}
                  </div>
                </div>
                <span style={{
                  background: `${task.color}22`, border: `1px solid ${task.color}55`,
                  borderRadius: 14, padding: '3px 10px',
                  color: task.color, fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  +{task.xp} XP
                </span>
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 18, padding: '12px 14px', borderRadius: 14,
          background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>
            {lang === 'UZ'
              ? `Bajarildi: ${completed.length}/${TASKS.length}`
              : `Выполнено: ${completed.length}/${TASKS.length}`}
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(completed.length / TASKS.length) * 100}%`,
              background: 'linear-gradient(90deg,#818cf8,#a78bfa)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Build screen ──────────────────────────────────────────────
  const ws = 300  // workspace size px

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

      {/* Header */}
      <div style={{ alignSelf: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { setTaskId(null); snd('click') }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '5px 12px',
              color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← {lang === 'UZ' ? 'Orqaga' : 'Назад'}
          </button>
          <div>
            <span style={{ color: task.color, fontWeight: 900, fontSize: 16 }}>{task.formulaRU}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 8 }}>
              {lang === 'UZ' ? task.nameUZ : task.nameRU}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        width: '100%', maxWidth: ws,
        background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: 12, padding: '8px 12px',
        fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
      }}>
        {status !== 'success' ? (
          lang === 'UZ'
            ? '① Slotni bosing (yashil) → ② Pastdan atom tanlang → ③ Ikkita atomni bosib bog\' chizing → ✓'
            : '① Нажми слот (загорится зелёным) → ② Выбери атом снизу → ③ Кликни два атома для связи → ✓'
        ) : (
          lang === 'UZ'
            ? `🎉 Ajoyib! ${task.formulaUZ} yaratildi! +${task.xp} XP`
            : `🎉 Отлично! Молекула ${task.formulaRU} собрана! +${task.xp} XP`
        )}
      </div>

      {/* Workspace */}
      <div
        ref={workspaceRef}
        style={{
          position: 'relative', width: ws, height: ws,
          background: 'linear-gradient(155deg,rgba(14,6,38,0.97),rgba(4,8,34,0.97))',
          border: `2px solid ${status === 'success' ? task.color + '88' : status === 'error' ? '#ef444488' : 'rgba(129,140,248,0.18)'}`,
          borderRadius: 22, flexShrink: 0,
          transition: 'border-color 0.3s',
          animation: status === 'error' ? 'shake 0.35s ease' : 'none',
        }}
      >
        {/* Bond lines SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox={`0 0 ${ws} ${ws}`}
        >
          {/* Expected bond hints (dotted) when showHint */}
          {showHint && task.expectedBonds.map(([a, b], i) => {
            const sa = task.slots.find(s => s.id === a)
            const sb = task.slots.find(s => s.id === b)
            if (!sa || !sb) return null
            return (
              <line key={`hint-${i}`}
                x1={sa.x / 100 * ws} y1={sa.y / 100 * ws}
                x2={sb.x / 100 * ws} y2={sb.y / 100 * ws}
                stroke="rgba(255,255,255,0.12)" strokeWidth="2"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Actual user bonds */}
          {bonds.map(([a, b], i) => {
            const sa = task.slots.find(s => s.id === a)
            const sb = task.slots.find(s => s.id === b)
            if (!sa || !sb) return null
            return (
              <line key={i}
                x1={sa.x / 100 * ws} y1={sa.y / 100 * ws}
                x2={sb.x / 100 * ws} y2={sb.y / 100 * ws}
                stroke={task.color + 'cc'} strokeWidth="3" strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* Atom slots */}
        {task.slots.map(slot => {
          const sym    = filled[slot.id]
          const isFill = !sym
          const isSel  = selSlot === slot.id || selAtom === slot.id
          const col    = sym ? atomColor(sym) : 'rgba(255,255,255,0.12)'

          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot.id)}
              style={{
                position: 'absolute',
                left:   `${slot.x}%`, top: `${slot.y}%`,
                transform: 'translate(-50%,-50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: sym ? `${col}22` : (isSel ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.04)'),
                border: `2px solid ${isSel ? '#818cf8' : sym ? col : 'rgba(255,255,255,0.2)'}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSel ? '0 0 0 3px rgba(129,140,248,0.4)' : sym ? `0 0 8px ${col}44` : 'none',
                transition: 'all 0.15s',
                zIndex: 2,
              }}
            >
              {sym ? (
                <>
                  <span style={{ fontSize: 14, fontWeight: 900, color: col, lineHeight: 1 }}>{sym}</span>
                  {isSel && (
                    <span style={{ fontSize: 7, color: col, opacity: 0.7 }}>
                      {lang === 'UZ' ? 'bog\'' : 'связь'}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 18, color: isSel ? '#818cf8' : 'rgba(255,255,255,0.2)' }}>
                  {isSel ? '⊕' : '○'}
                </span>
              )}
            </button>
          )
        })}

        {/* Success sparkle overlay */}
        {status === 'success' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20,
            background: `${task.color}0a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, animation: 'fadeUp 0.3s ease',
            pointerEvents: 'none',
          }}>
            ✅
          </div>
        )}
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <div style={{
          maxWidth: ws, width: '100%',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '8px 12px',
          color: '#fca5a5', fontSize: 12, animation: 'fadeUp 0.2s ease',
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Atom palette */}
      {status !== 'success' && (
        <div style={{ width: '100%', maxWidth: ws }}>
          <p style={{
            color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 6,
            fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            {selSlot
              ? (lang === 'UZ' ? 'Atom tanlang:' : 'Выбери атом:')
              : (lang === 'UZ' ? 'Avval slotni bosing' : 'Сначала выбери слот')}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {paletteAtoms.map(sym => {
              const col = atomColor(sym)
              return (
                <button
                  key={sym}
                  onClick={() => handleAtomPick(sym)}
                  disabled={!selSlot}
                  style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: selSlot ? `${col}22` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${selSlot ? col + '88' : 'rgba(255,255,255,0.1)'}`,
                    cursor: selSlot ? 'pointer' : 'default',
                    opacity: selSlot ? 1 : 0.35,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 1, transition: 'all 0.15s', fontFamily: 'inherit',
                    boxShadow: selSlot ? `0 0 10px ${col}33` : 'none',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 900, color: col }}>{sym}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: ws }}>
        {status !== 'success' && (
          <button
            onClick={check}
            style={{
              flex: 2,
              background: `linear-gradient(135deg,${task.color}dd,${task.color}88)`,
              border: `1px solid ${task.color}`,
              borderRadius: 14, padding: '10px 0',
              color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✓ {lang === 'UZ' ? 'Tekshirish' : 'Проверить'}
          </button>
        )}
        <button
          onClick={status === 'success' ? () => setTaskId(null) : reset}
          style={{
            flex: 1,
            background: status === 'success'
              ? `linear-gradient(135deg,${task.color}dd,${task.color}88)`
              : 'rgba(255,255,255,0.06)',
            border: `1px solid ${status === 'success' ? task.color : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 14, padding: '10px 0',
            color: status === 'success' ? '#fff' : 'rgba(255,255,255,0.5)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {status === 'success'
            ? (lang === 'UZ' ? '🏆 Ro\'yxat' : '🏆 К списку')
            : (lang === 'UZ' ? '🔄 Tozalash' : '🔄 Сброс')}
        </button>
        {status !== 'success' && (
          <button
            onClick={() => { setShowHint(!showHint); snd('click') }}
            title={lang === 'UZ' ? 'Maslahat' : 'Подсказка'}
            style={{
              flex: 0, width: 44, height: 44,
              background: showHint ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showHint ? '#fbbf24aa' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 12, cursor: 'pointer', fontSize: 18, fontFamily: 'inherit',
            }}
          >
            💡
          </button>
        )}
      </div>

      {/* Hint text */}
      {showHint && (
        <div style={{
          maxWidth: ws, width: '100%',
          background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 12, padding: '8px 12px',
          color: '#fde68a', fontSize: 12, animation: 'fadeUp 0.2s ease',
        }}>
          💡 {lang === 'UZ' ? task.hintUZ : task.hintRU}
        </div>
      )}
    </div>
  )
}
