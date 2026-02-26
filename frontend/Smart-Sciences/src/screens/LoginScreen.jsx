import { useState } from 'react'
import { useAuth }  from '../context/AuthContext.jsx'
import { snd }      from '../utils/sound.js'

/**
 * LoginScreen
 * Props:
 *   t           {object}   — translations (t.auth.*)
 *   onSwitch    {function} — navigate to RegisterScreen
 */
export function LoginScreen({ t, onSwitch }) {
  const ta = t.auth
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [shake,    setShake]    = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { triggerError('Заполните все поля / Barcha maydonlarni to\'ldiring'); return }
    setLoading(true); setError('')
    try {
      await login({ email, password })
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
            background: 'linear-gradient(135deg, #4fc3f7, #7c3aed)',
            boxShadow: '0 0 30px rgba(79,195,247,0.4)',
            animation: 'profFloat 3s ease-in-out infinite',
          }}>⚛</div>
          <div style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(90deg,#4fc3f7,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart-Sciences
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{t.appSub}</div>
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(167,139,250,0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.1)',
            animation: shake ? 'shake .5s ease' : 'popIn .4s cubic-bezier(.175,.885,.32,1.275)',
          }}
        >
          {/* Card header */}
          <div style={{
            padding: '24px 28px 16px',
            background: 'linear-gradient(135deg, rgba(79,195,247,0.1), rgba(124,58,237,0.15))',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{ta.loginTitle}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{ta.loginSub}</p>
          </div>

          <div style={{ padding: '24px 28px', display: 'grid', gap: 16 }}>
            {/* Email */}
            <Field
              label={ta.emailLabel}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={ta.emailPlaceholder}
            />
            {/* Password */}
            <Field
              label={ta.passwordLabel}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={ta.passwordPlaceholder}
              onEnter={handleSubmit}
            />

            {/* Error */}
            {error && (
              <div style={{ color: '#fb7185', fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Demo hint */}
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center' }}>{ta.demoHint}</div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #0891b2, #7c3aed)',
                color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(124,58,237,0.45)',
                transition: 'all .2s', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? ta.loggingIn : ta.loginBtn}
            </button>

            {/* Switch */}
            <button
              onClick={() => { snd('click'); onSwitch() }}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            >
              {ta.toRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared field component ───────────────────────────────────────
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
          border: `1px solid ${focused ? 'rgba(79,195,247,0.6)' : 'rgba(255,255,255,0.1)'}`,
          color: '#fff', fontSize: 14, outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(79,195,247,0.15)' : 'none',
          transition: 'border .2s, box-shadow .2s',
        }}
      />
    </div>
  )
}
