import { useEffect } from 'react'
import { useAuth }  from '../context/AuthContext.jsx'
import { MEDAL_DEF } from '../data/constants.js'

export function MedalsScreen({ t, setMsg }) {
  const { medals, xp } = useAuth()

  useEffect(() => { setMsg(t.prof.medals) }, [t])

  const unlocked = (id) =>
    medals.includes(id) ||
    (id === 'first'  && xp > 0) ||
    (id === 'genius' && medals.length >= 4)

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.medalTitle}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>{t.medalSub}</p>

      <div style={{ display: 'grid', gap: 12 }}>
        {MEDAL_DEF.map((m, i) => {
          const ok = unlocked(m.id)
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 16,
              background: ok ? `${m.col}14` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${ok ? m.col + '44' : 'rgba(255,255,255,0.07)'}`,
              opacity: ok ? 1 : 0.5,
              transition: 'all .3s',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                background: ok ? `${m.col}22` : 'rgba(255,255,255,0.06)',
                border: `2px solid ${ok ? m.col : 'rgba(255,255,255,0.1)'}`,
                boxShadow: ok ? `0 0 18px ${m.col}44` : 'none',
                filter: ok ? 'none' : 'grayscale(1)',
              }}>
                {ok ? m.icon : '🔒'}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>{t.medalNames[i]}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{t.medalDescs[i]}</div>
                {ok && (
                  <div style={{ color: m.col, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                    ✓ {t.levelLabel === 'Уровень' ? 'Получена!' : 'Olindi!'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
