import { useAuth } from '../context/AuthContext.jsx'
import { NAV }     from '../data/constants.js'
import { xpToLevel, xpLevelPercent } from '../data/constants.js'
import { snd }     from '../utils/sound.js'

export function Sidebar({ screen, setScreen, t }) {
  const { xp, medals, lang, setLang, logout, user } = useAuth()
  const level = xpToLevel(xp)
  const pct   = xpLevelPercent(xp)

  return (
    <aside
      className="desktop-only"
      style={{
        width: 240, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        padding: '20px 16px', gap: 16,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}
    >
      {/* Logo + language */}
      <div style={{ paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'linear-gradient(135deg,#4fc3f7,#7c3aed)' }}>⚛</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Smart-Sciences
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{t.appSub}</div>
          </div>
        </div>
        {/* Lang */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['RU', 'UZ'].map((l) => (
            <button key={l} onClick={() => { setLang(l); snd('click') }} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: lang === l ? 'linear-gradient(135deg,#4fc3f7,#7c3aed)' : 'rgba(255,255,255,0.07)',
              color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
              fontWeight: 900, fontSize: 12, fontFamily: 'inherit', transition: 'all .2s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* User info */}
      {user && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          👤 {user.username}
        </div>
      )}

      {/* XP bar */}
      <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{t.levelLabel} {level}</span>
          <span style={{ color: '#67e8f9', fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>{xp} XP</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)', transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'grid', gap: 4 }}>
        {NAV.map((item, i) => (
          <button key={item.id} onClick={() => { setScreen(item.id); snd('click') }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            border: `1px solid ${screen === item.id ? 'rgba(167,139,250,0.3)' : 'transparent'}`,
            background: screen === item.id ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: screen === item.id ? '#a78bfa' : 'rgba(255,255,255,0.45)',
            fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            textAlign: 'left', transition: 'all .2s',
          }}>
            <span style={{ fontSize: 16, filter: screen === item.id ? 'drop-shadow(0 0 5px #a78bfa)' : 'none' }}>{item.icon}</span>
            {t.nav[i]}
            {item.id === 'medals' && medals.length > 0 && (
              <span style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#fbbf24', color: '#000', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {medals.length}
              </span>
            )}
          </button>
        ))}

        {/* Logout */}
        {user && (
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, marginTop: 8,
            border: '1px solid rgba(255,80,80,0.2)',
            background: 'rgba(255,80,80,0.06)',
            color: 'rgba(255,130,130,0.7)',
            fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            transition: 'all .2s',
          }}>
            <span>🚪</span> {t.logout}
          </button>
        )}
      </nav>

    </aside>
  )
}
