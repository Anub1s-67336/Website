import { useState } from 'react'
import { useAuth }  from '../context/AuthContext.jsx'
import { snd }      from '../utils/sound.js'

/**
 * RegisterScreen
 * Props:
 *   t        {object}   — translations (t.auth.*)
 *   onSwitch {function} — navigate to LoginScreen
 */
export function RegisterScreen({ t, onSwitch }) {
  const ta = t.auth
  const { register } = useAuth()

  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [shake,    setShake]    = useState(false)

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      triggerError('Заполните все поля / Barcha maydonlarni to\'ldiring')
      return
    }
    if (password.length < 6) {
      triggerError('Пароль минимум 6 символов / Parol kamida 6 ta belgi')
      return
    }

    setLoading(true); setError('')
    try {
      await register({ username, email, password })
      snd('win')
    } catch (e) {
      triggerError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerError = (msg) => {
    setError(msg); snd('wrong')
    setShake(true); setTimeout(() => setShake(false), 600)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: 'linear-gradient(135deg, #060713 0%, #0b0b25 55%, #100524 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18, fontSize: 28, marginBottom: 12,
            background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
            boxShadow: '0 0 30px rgba(167,139,250,0.4)',
            animation: 'profFloat 3s ease-in-out infinite',
          }}>🧪</div>
          <div style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart-Sciences
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{t.appSub}</div>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(167,139,250,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.1)',
          animation: shake ? 'shake .5s ease' : 'popIn .4s cubic-bezier(.175,.885,.32,1.275)',
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px 16px',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(244,114,182,0.12))',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{ta.registerTitle}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{ta.registerSub}</p>
          </div>

          <div style={{ padding: '24px 28px', display: 'grid', gap: 16 }}>
            <Field label={ta.usernameLabel} type="text"     value={username} onChange={setUsername} placeholder={ta.usernamePlaceholder} />
            <Field label={ta.emailLabel}    type="email"    value={email}    onChange={setEmail}    placeholder={ta.emailPlaceholder} />
            <Field label={ta.passwordLabel} type="password" value={password} onChange={setPassword} placeholder={ta.passwordPlaceholder} onEnter={handleSubmit} />

            {/* Password strength indicator */}
            {password.length > 0 && (
              <PasswordStrength password={password} />
            )}

            {error && (
              <div style={{ color: '#fb7185', fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #7c3aed, #db2777)',
                color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(167,139,250,0.45)',
                transition: 'all .2s', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? ta.registering : ta.registerBtn}
            </button>

            <button
              onClick={() => { snd('click'); onSwitch() }}
              style={{ background: 'none', border: 'none', color: '#67e8f9', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            >
              {ta.toLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Input field ─────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, onEnter }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${focused ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)'}`,
          color: '#fff', fontSize: 14, outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(167,139,250,0.15)' : 'none',
          transition: 'border .2s, box-shadow .2s',
        }}
      />
    </div>
  )
}

// ── Password strength bar ───────────────────────────────────────
function PasswordStrength({ password }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const colors  = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#4fc3f7']
  const labels  = { RU: ['Очень слабый','Слабый','Средний','Сильный','Отличный'], UZ: ['Juda zaif','Zaif','O\'rtacha','Kuchli','Mukammal'] }
  const col = colors[score - 1] ?? '#ef4444'

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? col : 'rgba(255,255,255,0.1)', transition: 'background .3s' }} />
        ))}
      </div>
    </div>
  )
}
