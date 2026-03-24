/**
 * ChemistryApp.jsx — Chemistry module (Module 1).
 * Extracted from App.jsx — all existing chemistry screens live here.
 * Accessed via React Router /chemistry
 */
import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { T } from '../data/translations.js'

// Components
import { Stars }        from '../components/Stars.jsx'
import { Particles, makeBurst } from '../components/Particles.jsx'
import { Sidebar }      from '../components/Sidebar.jsx'
import { FloatingProf } from '../components/FloatingProf.jsx'
import { MobileTopbar } from '../components/MobileTopbar.jsx'
import { MobileNav }    from '../components/MobileNav.jsx'
import { ContactModal } from '../components/ContactModal.jsx'
import { AchievementToast } from '../components/AchievementToast.jsx'
import { ProfessorChat } from '../components/ProfessorChat.jsx'
import { Tutorial }     from '../screens/Tutorial.jsx'

// Screens
import { HomeScreen }     from '../screens/HomeScreen.jsx'
import { BodyScreen }     from '../screens/BodyScreen.jsx'
import { LabScreen }      from '../screens/LabScreen.jsx'
import { Achievements }   from '../screens/Achievements.jsx'
import { RoadmapScreen }  from '../screens/RoadmapScreen.jsx'
import { ElectronGame }   from '../screens/ElectronGame.jsx'
import { LessonScreen }   from '../screens/LessonScreen.jsx'
import { IntroLesson }    from '../screens/IntroLesson.jsx'
import { ChemBasicsLesson } from '../screens/ChemBasicsLesson.jsx'
import { PeriodicTable }  from '../screens/PeriodicTable.jsx'

export function ChemistryApp() {
  const navigate = useNavigate()
  const { user, lang, loading, tutorialSeen, setTutorialSeen, xp } = useAuth()

  const [screen,        setScreen]        = useState('home')
  const [currentLesson, setCurrentLesson] = useState(0)
  const [pts,           setPts]           = useState([])
  const [profMsg,       setProfMsg]       = useState('')
  const [profHappy,     setProfHappy]     = useState(false)
  const [showContact,   setShowContact]   = useState(false)
  const [showTutorial,  setShowTutorial]  = useState(false)
  const [showChat,      setShowChat]      = useState(false)
  const [introDone,     setIntroDone]     = useState(() => !!localStorage.getItem('ss_intro_done'))

  const t = T[lang]

  // Show tutorial once on first login
  useEffect(() => {
    if (user && !tutorialSeen) {
      const id = setTimeout(() => setShowTutorial(true), 800)
      return () => clearTimeout(id)
    }
  }, [user, tutorialSeen])

  // Sync professor message
  useEffect(() => {
    const map = {
      home:       'home',
      body:       'body',
      lab:        'lab',
      medals:     'medals',
      roadmap:    'roadmap',
      electron:   'electron',
      lesson:     'home',
      chembasics: 'chembasics',
      table:      'table',
    }
    setProfMsg(t.prof[map[screen] ?? 'home'])
  }, [screen, lang])

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

  function onIntroComplete() {
    localStorage.setItem('ss_intro_done', '1')
    setIntroDone(true)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#060713',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚛</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Smart-Sciences…</div>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/')
    return null
  }

  // Intro lesson (xp === 0 on first login)
  if (!introDone && xp === 0) {
    return (
      <>
        <Stars />
        <IntroLesson lang={lang} onComplete={onIntroComplete} />
      </>
    )
  }

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
          <Sidebar screen={screen} setScreen={setScreen} t={t} />

          <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', paddingBottom: 80 }}>
            <MobileTopbar t={t} />

            {/* Back to home button */}
            <div style={{ padding: '12px 20px 0' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid rgba(167,139,250,0.25)',
                  background: 'rgba(124,58,237,0.06)', color: '#a78bfa',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
                }}
              >← Модули</button>
            </div>

            {screen === 'home' && (
              <HomeScreen
                {...screenProps}
                setScreen={setScreen}
                setLesson={setCurrentLesson}
                openContact={() => setShowContact(true)}
              />
            )}
            {screen === 'body'      && <BodyScreen    {...screenProps} />}
            {screen === 'lab'       && <LabScreen     {...screenProps} />}
            {screen === 'medals'    && <Achievements  {...screenProps} />}
            {screen === 'roadmap'   && <RoadmapScreen {...screenProps} />}
            {screen === 'electron'  && <ElectronGame  {...screenProps} />}
            {screen === 'lesson'    && (
              <LessonScreen
                {...screenProps}
                lessonIndex={currentLesson}
                onBack={() => setScreen('home')}
              />
            )}
            {screen === 'chembasics' && (
              <ChemBasicsLesson {...screenProps} onBack={() => setScreen('home')} />
            )}
            {screen === 'table' && (
              <PeriodicTable
                {...screenProps}
                setScreen={setScreen}
                setLesson={setCurrentLesson}
              />
            )}
          </main>
        </div>

        <MobileNav screen={screen} setScreen={setScreen} t={t} />

        {showContact && <ContactModal t={t} onClose={() => setShowContact(false)} />}
      </div>

      <AchievementToast />

      <FloatingProf
        msg={profMsg || t.prof.home}
        happy={profHappy}
        onChatOpen={() => setShowChat(v => !v)}
      />

      {showChat && user && (
        <ProfessorChat
          subject="chemistry"
          lang={lang}
          onClose={() => setShowChat(false)}
        />
      )}

      <AnimatePresence>
        {showTutorial && (
          <Tutorial key="tutorial" lang={lang} onComplete={onTutorialComplete} />
        )}
      </AnimatePresence>
    </>
  )
}
