import { useAuth }      from '../context/AuthContext.jsx'
import { TOPIC_META }   from '../data/constants.js'
import { xpToLevel, xpLevelPercent, xpToNextLevel } from '../data/constants.js'
import { snd }          from '../utils/sound.js'

export function HomeScreen({ t, setScreen, setLesson, openContact }) {
  const { xp, user } = useAuth()
  const level = xpToLevel(xp)
  const pct   = xpLevelPercent(xp)

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      {/* Greeting */}
      {user && (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
          👋 {t.levelLabel} {level} • <span style={{ color: '#a78bfa' }}>{user.username}</span>
        </div>
      )}

      {/* XP bar */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{t.levelLabel} {level} • {t.juniorChem}</span>
          <span style={{ color: '#67e8f9', fontWeight: 900, fontSize: 12, fontFamily: 'monospace' }}>{xp} XP</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa,#f472b6)', borderRadius: 5, boxShadow: '0 0 10px #a78bfa88', transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{t.toNextLevel}</span>
          <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700 }}>{xpToNextLevel(xp)} XP</span>
        </div>
      </div>

      {/* Topic cards */}
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 15, marginBottom: 12 }}>{t.topicsTitle}</h2>
      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {t.topics.map((tp, i) => {
          const m = TOPIC_META[i]
          return (
            <div key={i} onClick={() => { snd('click'); setLesson(i); setScreen('lesson') }} style={{
              background: m.grad, borderRadius: 18, padding: 18, cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .25s, box-shadow .25s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', right: -16, top: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700, background: m.tc, color: m.tcol }}>{tp.tag}</span>
              </div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 15 }}>{tp.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{tp.sub}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>{m.mol}</div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  <span>{t.levelLabel === 'Уровень' ? 'Прогресс' : 'Rivojlanish'}</span>
                  <span style={{ color: '#fff', fontWeight: 900 }}>{m.prog}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(0,0,0,0.25)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.prog}%`, background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 6px rgba(255,255,255,0.5)' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button onClick={() => { snd('click'); setScreen('lab') }} style={{
        width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg,#0891b2,#7c3aed)',
        color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
        boxShadow: '0 8px 28px rgba(124,58,237,0.45)', marginBottom: 12,
        transition: 'transform .2s, box-shadow .2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.55)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.45)' }}
      >
        {t.openLab}
      </button>

      <button onClick={openContact} style={{
        width: '100%', padding: '13px', borderRadius: 16,
        border: '1px solid rgba(167,139,250,0.25)', cursor: 'pointer',
        background: 'rgba(167,139,250,0.07)',
        color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
        transition: 'color .2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
      >
        {t.contact}
      </button>
    </div>
  )
}
