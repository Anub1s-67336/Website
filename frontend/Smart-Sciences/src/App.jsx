/**
 * App.jsx — Top-level router.
 * Routes:
 *   /           → Home (module selector)
 *   /chemistry  → ChemistryApp (Module 1)
 *   /physics    → PhysicsPage  (Module 2)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { Stars } from './components/Stars.jsx'

// Pages
import { Home }         from './pages/Home.jsx'
import { ChemistryApp } from './pages/ChemistryApp.jsx'
import { PhysicsPage }  from './pages/PhysicsPage.jsx'

// Auth screens
import { LoginScreen }    from './screens/LoginScreen.jsx'
import { RegisterScreen } from './screens/RegisterScreen.jsx'
import { T }              from './data/translations.js'
import { useState }       from 'react'

function AuthGate() {
  const { user, lang, loading } = useAuth()
  const [authView, setAuthView] = useState('login')
  const t = T[lang]

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

  if (!user) {
    return (
      <>
        <Stars />
        {authView === 'login'
          ? <LoginScreen    t={t} onSwitch={() => setAuthView('register')} />
          : <RegisterScreen t={t} onSwitch={() => setAuthView('login')} />
        }
      </>
    )
  }

  // Authenticated: render the router
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/chemistry"  element={<ChemistryApp />} />
      <Route path="/chemistry/*" element={<ChemistryApp />} />
      <Route path="/physics"    element={<PhysicsPage />} />
      <Route path="/physics/*"  element={<PhysicsPage />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate />
    </BrowserRouter>
  )
}
