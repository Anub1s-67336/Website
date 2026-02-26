import { useAuth } from '../context/AuthContext.jsx'
import { NAV }     from '../data/constants.js'
import { snd }     from '../utils/sound.js'

export function MobileNav({ screen, setScreen, t }) {
  const { medals } = useAuth()

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex',
        background: 'rgba(6,7,25,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {NAV.map((item, i) => (
        <button
          key={item.id}
          onClick={() => { setScreen(item.id); snd('click') }}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 4px 8px', gap: 2,
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: screen === item.id ? '#a78bfa' : 'rgba(255,255,255,0.35)',
            fontFamily: 'inherit', transition: 'color .2s', position: 'relative',
          }}
        >
          {/* Active indicator */}
          {screen === item.id && (
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 28, height: 3, borderRadius: '0 0 3px 3px',
              background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)',
            }} />
          )}

          <span style={{ fontSize: 19, filter: screen === item.id ? 'drop-shadow(0 0 5px #a78bfa)' : 'none' }}>
            {item.icon}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>{t.nav[i]}</span>

          {/* Medal badge */}
          {item.id === 'medals' && medals.length > 0 && (
            <div style={{
              position: 'absolute', top: 6, right: 6,
              width: 14, height: 14, borderRadius: '50%',
              background: '#fbbf24', color: '#000',
              fontSize: 8, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {medals.length}
            </div>
          )}
        </button>
      ))}
    </nav>
  )
}
