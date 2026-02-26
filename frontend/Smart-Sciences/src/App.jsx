/**
 * App.jsx — Top-level routing and layout shell.
 *
 * Screens: home | body | lab | medals | roadmap | electron | lesson
 * Lesson routing: currentLesson state (0-2) determines which lesson to show.
 */

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence }  from 'framer-motion'
import { useAuth }          from './context/AuthContext.jsx'
import { T }                from './data/translations.js'

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
import { Achievements }   from './screens/Achievements.jsx'
import { RoadmapScreen }  from './screens/RoadmapScreen.jsx'
import { ElectronGame }   from './screens/ElectronGame.jsx'
import { Tutorial }       from './screens/Tutorial.jsx'
import { LessonScreen }   from './screens/LessonScreen.jsx'

// ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user, lang, loading, tutorialSeen, setTutorialSeen } = useAuth()

  const [screen,       setScreen]       = useState('home')
  const [currentLesson,setCurrentLesson]= useState(0)     // 0 | 1 | 2
  const [authView,     setAuthView]     = useState('login')
  const [pts,          setPts]          = useState([])
  const [profMsg,      setProfMsg]      = useState('')
  const [profHappy,    setProfHappy]    = useState(false)
  const [showContact,  setShowContact]  = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const t = T[lang]

  // Show tutorial once on first login
  useEffect(() => {
    if (user && !tutorialSeen) {
      const id = setTimeout(() => setShowTutorial(true), 800)
      return () => clearTimeout(id)
    }
  }, [user, tutorialSeen])

  // Sync professor message on screen / language change
  useEffect(() => {
    const map = {
      home:     'home',
      body:     'body',
      lab:      'lab',
      medals:   'medals',
      roadmap:  'roadmap',
      electron: 'electron',
      lesson:   'home',      // professor message handled inside LessonScreen
    }
    setProfMsg(t.prof[map[screen] ?? 'home'])
  }, [screen, lang])

  // Particle burst helper
  const addPts = useCallback((x, y, color, count = 14) => {
    const p = makeBurst(x, y, color, count)
    setPts(prev => [...prev, ...p])
    setTimeout(() => setPts(prev => prev.filter(v => !p.find(pp => pp.id === v.id))), 2200)
  }, [])

  const setHappy = useCallback((val) => {
    setProfHappy(val)
    if (val) setTimeout(() => setProfHappy(false), 2500)
  }, [])

  function onTutorialComplete() {
    setShowTutorial(false)
    setTutorialSeen()
  }

  // ── Loading splash ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#060713',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'profFloat 1.5s ease-in-out infinite' }}>⚛</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Smart-Sciences…</div>
        </div>
      </div>
    )
  }

  // ── Auth screens ──────────────────────────────────────────────
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

  // ── Main app ──────────────────────────────────────────────────
  const screenProps = { t, lang, setMsg: setProfMsg, setHappy, addPts }

  return (
    <>
      <Stars />
      <Particles pts={pts} />

      <div style={{
        minHeight: '100vh', width: '100%',
        background: 'linear-gradient(135deg,#060713 0%,#0b0b25 55%,#100524 100%)',
        fontFamily: "'Nunito', sans-serif", position: 'relative',
      }}>
        <div style={{
          position: 'relative', zIndex: 1, display: 'flex',
          maxWidth: 1100, margin: '0 auto', minHeight: '100vh',
        }}>
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

            {screen === 'home'     && (
              <HomeScreen
                {...screenProps}
                setScreen={setScreen}
                setLesson={setCurrentLesson}
                openContact={() => setShowContact(true)}
              />
            )}
            {screen === 'body'     && <BodyScreen    {...screenProps} />}
            {screen === 'lab'      && <LabScreen     {...screenProps} />}
            {screen === 'medals'   && <Achievements  {...screenProps} />}
            {screen === 'roadmap'  && <RoadmapScreen {...screenProps} />}
            {screen === 'electron' && <ElectronGame  {...screenProps} />}
            {screen === 'lesson'   && (
              <LessonScreen
                {...screenProps}
                lessonIndex={currentLesson}
                onBack={() => setScreen('home')}
              />
            )}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav screen={screen} setScreen={setScreen} t={t} />

        {/* Contact modal */}
        {showContact && <ContactModal t={t} onClose={() => setShowContact(false)} />}
      </div>

      {/* Tutorial overlay */}
      <AnimatePresence>
        {showTutorial && (
          <Tutorial
            key="tutorial"
            lang={lang}
            onComplete={onTutorialComplete}
          />
        )}
      </AnimatePresence>
    </>
  )
}
