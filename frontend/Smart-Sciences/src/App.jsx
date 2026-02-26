/**
 * App.jsx — Top-level routing and layout shell.
 *
 * Responsibilities:
 *   - Read auth state from AuthContext
 *   - Show Auth screens (Login / Register) when user is null
 *   - Show main app layout (Sidebar + screens) when authenticated
 *   - Manage screen routing, particles, professor message state
 *
 * Does NOT contain any screen logic — that lives in src/screens/.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import { T }       from './data/translations.js'

// ── Components ───────────────────────────────────────────────────
import { Stars }        from './components/Stars.jsx'
import { Particles, makeBurst } from './components/Particles.jsx'
import { Sidebar }      from './components/Sidebar.jsx'
import { MobileTopbar } from './components/MobileTopbar.jsx'
import { MobileNav }    from './components/MobileNav.jsx'
import { ContactModal } from './components/ContactModal.jsx'

// ── Screens ──────────────────────────────────────────────────────
import { LoginScreen }    from './screens/LoginScreen.jsx'
import { RegisterScreen } from './screens/RegisterScreen.jsx'
import { HomeScreen }     from './screens/HomeScreen.jsx'
import { BodyScreen }     from './screens/BodyScreen.jsx'
import { LabScreen }      from './screens/LabScreen.jsx'
import { MedalsScreen }   from './screens/MedalsScreen.jsx'
import { RoadmapScreen }  from './screens/RoadmapScreen.jsx'

// ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user, lang, loading } = useAuth()

  const [screen,       setScreen]       = useState('home')
  const [authView,     setAuthView]     = useState('login')   // 'login' | 'register'
  const [pts,          setPts]          = useState([])
  const [profMsg,      setProfMsg]      = useState('')
  const [profHappy,    setProfHappy]    = useState(false)
  const [showContact,  setShowContact]  = useState(false)

  const t = T[lang]

  // Sync professor message on screen / language change
  useEffect(() => {
    const map = { home: 'home', body: 'body', lab: 'lab', medals: 'medals', roadmap: 'roadmap' }
    setProfMsg(t.prof[map[screen] ?? 'home'])
  }, [screen, lang])

  // Particle burst helper passed down to screens
  const addPts = useCallback((x, y, color, count = 14) => {
    const p = makeBurst(x, y, color, count)
    setPts((prev) => [...prev, ...p])
    setTimeout(() => setPts((prev) => prev.filter((v) => !p.find((pp) => pp.id === v.id))), 2200)
  }, [])

  const setHappy = useCallback((val) => {
    setProfHappy(val)
    if (val) setTimeout(() => setProfHappy(false), 2500)
  }, [])

  // ── Loading splash ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060713' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'profFloat 1.5s ease-in-out infinite' }}>⚛</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Smart-Sciences…</div>
        </div>
      </div>
    )
  }

  // ── Auth screens ───────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <Stars />
        <Particles pts={pts} />
        {authView === 'login'
          ? <LoginScreen    t={t} onSwitch={() => setAuthView('register')} />
          : <RegisterScreen t={t} onSwitch={() => setAuthView('login')}    />
        }
      </>
    )
  }

  // ── Main app ───────────────────────────────────────────────────
  const screenProps = { t, lang, setMsg: setProfMsg, setHappy, addPts }

  return (
    <>
      <Stars />
      <Particles pts={pts} />

      <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg,#060713 0%,#0b0b25 55%,#100524 100%)', fontFamily: "'Nunito', sans-serif", position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', minHeight: '100vh' }}>

          {/* Desktop sidebar */}
          <Sidebar
            screen={screen}
            setScreen={setScreen}
            profMsg={profMsg || t.prof.home}
            profHappy={profHappy}
            t={t}
          />

          {/* Main content */}
          <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', paddingBottom: 80 }}>
            <MobileTopbar t={t} />

            {screen === 'home'    && <HomeScreen    {...screenProps} setScreen={setScreen} openContact={() => setShowContact(true)} />}
            {screen === 'body'    && <BodyScreen    {...screenProps} />}
            {screen === 'lab'     && <LabScreen     {...screenProps} />}
            {screen === 'medals'  && <MedalsScreen  {...screenProps} />}
            {screen === 'roadmap' && <RoadmapScreen {...screenProps} />}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav screen={screen} setScreen={setScreen} t={t} />

        {/* Contact modal */}
        {showContact && <ContactModal t={t} onClose={() => setShowContact(false)} />}
      </div>
    </>
  )
}
