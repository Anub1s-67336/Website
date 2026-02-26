import { useAuth } from '../context/AuthContext.jsx'
import { snd }     from '../utils/sound.js'

export function MobileTopbar({ t }) {
  const { xp, lang, setLang } = useAuth()

  return (
    <div
      className="mobile-only"
      style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(6,7,25,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#4fc3f7,#7c3aed)', fontSize: 13 }}>⚛</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 12, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart-Sciences
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, lineHeight: 1 }}>{t.appSub}</div>
        </div>
      </div>

      {/* Lang + XP */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {['RU', 'UZ'].map((l) => (
          <button key={l} onClick={() => { setLang(l); snd('click') }} style={{
            padding: '4px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: lang === l ? 'linear-gradient(135deg,#4fc3f7,#7c3aed)' : 'rgba(255,255,255,0.08)',
            color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
            fontWeight: 900, fontSize: 11, fontFamily: 'inherit',
          }}>{l}</button>
        ))}
        <div style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(79,195,247,0.12)', color: '#67e8f9', fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>
          {xp}
        </div>
      </div>
    </div>
  )
}
