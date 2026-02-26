/**
 * AuthContext
 * ───────────────────────────────────────────────────────────────
 * Provides application-wide state:
 *   user    – { id, username, email } | null
 *   xp      – number
 *   medals  – string[]
 *   lang    – 'RU' | 'UZ'
 *
 * Also exposes:
 *   login(email, password)   → calls api.login, loads user, resolves/rejects
 *   register(...)            → calls api.register, then auto-login
 *   logout()                 → clears token + state
 *   addXP(delta)             → increment XP, persist to backend
 *   addMedal(id)             → add medal if not already present
 *   setLang(lang)            → switch language
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUserData,
  updateProgress,
  getToken,
} from '../api/api.js'
import { snd } from '../utils/sound.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null)
  const [xp,     setXpRaw]  = useState(0)
  const [medals, setMedals] = useState(['first'])
  const [lang,   setLang]   = useState('RU')
  const [loading, setLoading] = useState(true) // checking stored token on mount

  // ── On mount: restore session if token exists ───────────────
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) { setLoading(false); return }
      try {
        const data = await getUserData()
        setUser({ id: data.id, username: data.username, email: data.email })
        setXpRaw(data.xp ?? 0)
        setMedals(data.medals ?? ['first'])
      } catch {
        // Token expired or invalid — proceed as guest
        apiLogout()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    await apiLogin({ email, password })           // saves token to localStorage
    const data = await getUserData()
    setUser({ id: data.id, username: data.username, email: data.email })
    setXpRaw(data.xp ?? 0)
    setMedals(data.medals ?? ['first'])
    snd('win')
  }, [])

  // ── Register ─────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    await apiRegister({ username, email, password })
    // Auto-login after successful registration
    await login({ email, password })
  }, [login])

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
    setXpRaw(0)
    setMedals(['first'])
    snd('click')
  }, [])

  // ── Add XP ──────────────────────────────────────────────────
  const addXP = useCallback((delta) => {
    setXpRaw((prev) => {
      const next = prev + delta
      // Persist to backend (fire-and-forget, don't block UI)
      if (getToken()) {
        updateProgress({ xpDelta: delta, medals }).catch(() => {})
      }
      return next
    })
  }, [medals])

  // ── Add Medal ────────────────────────────────────────────────
  const addMedal = useCallback((id) => {
    setMedals((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      snd('medal')
      // Persist
      if (getToken()) {
        updateProgress({ xpDelta: 0, medals: next }).catch(() => {})
      }
      return next
    })
  }, [])

  const value = {
    user, xp, medals, lang,
    loading,
    login, register, logout,
    addXP, addMedal,
    setLang,
    // Allow direct XP set (e.g. hydrating from API)
    setXp: setXpRaw,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
