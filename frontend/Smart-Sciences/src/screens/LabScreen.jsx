import { useState, useEffect, useRef } from 'react'
import { useAuth }    from '../context/AuthContext.jsx'
import { MOLS, ACOL, ATOM_NAMES } from '../data/constants.js'
import { snd }        from '../utils/sound.js'

export function LabScreen({ t, lang, setMsg, setHappy, addPts }) {
  const { addXP, addMedal, medals, incrementQuestProgress } = useAuth()

  const [molKey,     setMolKey]     = useState('water')
  const [zone,       setZone]       = useState([])
  const [drag,       setDrag]       = useState(null)
  const [won,        setWon]        = useState(false)
  const [flash,      setFlash]      = useState(null)   // 'win' | 'wrong' | null
  const [combo,      setCombo]      = useState(0)
  const [molsBuilt,  setMolsBuilt]  = useState(0)
  const dropRef = useRef(null)

  const mol    = MOLS[molKey]
  const needed = mol.atoms
  const total  = Object.values(needed).reduce((a, v) => a + v, 0)
  const counts = zone.reduce((a, c) => ({ ...a, [c]: (a[c] || 0) + 1 }), {})

  // Reset when molecule target or language changes
  useEffect(() => {
    setMsg(t.prof.lab)
    setZone([]); setWon(false); setFlash(null); setCombo(0)
  }, [t, molKey])

  const checkWin = (z) => {
    const c = z.reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {})
    return z.length === total && Object.keys(needed).every((k) => c[k] === needed[k])
  }

  const doWin = () => {
    setWon(true); setFlash('win')
    setMsg(t.prof.win); setHappy(true)
    addXP(100); snd('win')
    addMedal('lab1')
    incrementQuestProgress('dq_lab')
    const nb = molsBuilt + 1
    setMolsBuilt(nb)
    if (nb >= 3) addMedal('lab2')
    setTimeout(() => setHappy(false), 2500)
  }

  const addAtom = (atom) => {
    if (won) return
    const newCnt = { ...counts, [atom]: (counts[atom] || 0) + 1 }
    if ((newCnt[atom] || 0) > (needed[atom] || 0)) {
      setFlash('wrong'); setTimeout(() => setFlash(null), 500)
      snd('wrong'); setMsg(t.prof.wrong); setCombo(0); return
    }
    const nz = [...zone, atom]
    setZone(nz); snd('drop')
    const nc = combo + 1; setCombo(nc)
    addXP(nc >= 3 ? 15 : 5)
    if (nc >= 3) setMsg(t.prof.combo)
    if (checkWin(nz)) setTimeout(doWin, 250)
  }

  const reset = () => { setZone([]); setWon(false); setFlash(null); setCombo(0); snd('click') }

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.labTitle}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>{t.labSub}</p>

      {/* Molecule selector */}
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>{t.selectMol}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.entries(MOLS).map(([k, m]) => (
          <button key={k} onClick={() => { snd('click'); setMolKey(k) }} style={{
            flex: 1, padding: '8px 4px', borderRadius: 12,
            border: `1px solid ${molKey === k ? m.col : 'rgba(255,255,255,0.1)'}`,
            background: molKey === k ? `${m.col}22` : 'rgba(255,255,255,0.04)',
            color: molKey === k ? m.col : 'rgba(255,255,255,0.5)',
            fontWeight: 900, fontSize: 11, fontFamily: 'monospace', cursor: 'pointer',
            boxShadow: molKey === k ? `0 0 12px ${m.col}44` : 'none', transition: 'all .2s',
          }}>
            {m.formula}<br />
            <span style={{ fontFamily: 'inherit', fontSize: 9, fontWeight: 600, opacity: 0.7 }}>
              {lang === 'RU' ? m.nameRU : m.nameUZ}
            </span>
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => { if (drag) addAtom(drag) }}
        style={{
          minHeight: 100, borderRadius: 16, padding: 16, marginBottom: 12,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center',
          border: `2px dashed ${flash === 'win' ? '#4ade80' : flash === 'wrong' ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
          background: flash === 'win' ? 'rgba(74,222,128,0.1)' : flash === 'wrong' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
          boxShadow: flash === 'win' ? '0 0 30px rgba(74,222,128,0.3)' : flash === 'wrong' ? '0 0 20px rgba(239,68,68,0.25)' : 'none',
          transition: 'all .3s',
        }}
      >
        {zone.length === 0
          ? <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>{t.dropHere}</span>
          : zone.map((a, i) => (
            <div key={i} style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: 14, fontFamily: 'monospace',
              background: ACOL[a].bg, border: `2px solid ${ACOL[a].gw}`,
              boxShadow: `0 0 12px ${ACOL[a].gw}66`,
            }}>{a}</div>
          ))
        }
      </div>

      {/* Progress bars */}
      <div style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
        {Object.entries(needed).map(([a, need]) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: ACOL[a].gw }}>{a}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((counts[a] || 0) / need) * 100)}%`, background: ACOL[a].gw, boxShadow: `0 0 6px ${ACOL[a].gw}`, transition: 'width .35s' }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)', width: 28, textAlign: 'right' }}>{counts[a] || 0}/{need}</span>
          </div>
        ))}
      </div>

      {/* Win banner */}
      {won && (
        <div style={{ padding: '16px', borderRadius: 16, textAlign: 'center', marginBottom: 16, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', animation: 'popIn .5s cubic-bezier(.175,.885,.32,1.275)' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🎉</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{t.winTitle}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 4 }}>{t.winSub}</div>
          <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 16px', borderRadius: 99, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)', color: '#fff', fontWeight: 900, fontSize: 13 }}>
            +100 XP 🌟
          </span>
        </div>
      )}

      {/* Combo */}
      {combo >= 3 && !won && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ padding: '6px 16px', borderRadius: 99, background: 'linear-gradient(90deg,#f59e0b,#ef4444)', color: '#fff', fontWeight: 900, fontSize: 12 }}>
            {t.comboText}{combo}! {t.xpBonus}
          </span>
        </div>
      )}

      {/* Draggable atoms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {Object.keys(needed).map((atom) => (
          <div key={atom}
            draggable
            onDragStart={() => setDrag(atom)}
            onDragEnd={() => setDrag(null)}
            onClick={() => addAtom(atom)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'grab', userSelect: 'none' }}
          >
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: 22, fontFamily: 'monospace',
                background: `radial-gradient(circle at 35% 35%, ${ACOL[atom].gw}44, ${ACOL[atom].bg})`,
                border: `2px solid ${ACOL[atom].gw}88`,
                boxShadow: `0 0 20px ${ACOL[atom].gw}44`,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 30px ${ACOL[atom].gw}88` }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 20px ${ACOL[atom].gw}44` }}
            >
              {atom}
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
              {ATOM_NAMES[lang][atom]}
            </span>
          </div>
        ))}
      </div>

      <button onClick={reset} style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', transition: 'color .2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
      >
        {t.resetBtn}
      </button>
    </div>
  )
}
