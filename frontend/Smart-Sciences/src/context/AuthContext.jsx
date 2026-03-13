/**
 * AuthContext
 * ─────────────────────────────────────────────────────────────
 * Provides application-wide state:
 *   user                 – { id, username, email } | null
 *   xp                   – number (total accumulated)
 *   medals               – string[]
 *   lang                 – 'RU' | 'UZ'
 *   tutorialSeen         – boolean (persisted in localStorage)
 *   dailyQuests          – { date, quests: { [id]: { progress, completed } } }
 *   pendingAchievement   – achievement to show in toast | null
 *
 * Methods:
 *   login / register / logout
 *   addXP(delta)                  — add XP and persist
 *   addMedal(id)                  — add medal if not present, persist
 *   earnAchievement(id)           — grant achievement + show toast
 *   clearPendingAchievement()     — dismiss toast
 *   setLang(lang)                 — switch UI language
 *   setTutorialSeen()             — mark tutorial as done
 *   incrementQuestProgress(id, n) — add n progress to daily quest, auto-complete
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUserData,
  updateProgress,
  getToken,
  earnAchievementApi,
  getUnseenAchievements,
  markAchievementsSeen,
} from '../api/api.js'
import { snd }                       from '../utils/sound.js'
import { DAILY_QUESTS, ACHIEVEMENT_DEF } from '../data/constants.js'

// ── Local achievement storage key ─────────────────────────────
const ACH_KEY = 'ss_achievements'   // localStorage: string[]
function loadLocalAch()  { try { return JSON.parse(localStorage.getItem(ACH_KEY) ?? '[]') } catch { return [] } }
function saveLocalAch(a) { localStorage.setItem(ACH_KEY, JSON.stringify(a)) }

const AuthContext = createContext(null)

// ── Helper: default daily quests state for a given date ────────
function defaultDailyQuests(date) {
  return {
    date,
    quests: {
      dq_lab:      { progress: 0, completed: false },
      dq_electron: { progress: 0, completed: false },
      dq_visit:    { progress: 0, completed: false },
    },
  }
}

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null)
  const [xp,     setXpRaw]  = useState(0)
  const [medals, setMedals] = useState(['first'])
  const [lang,   setLang]   = useState('RU')
  const [loading, setLoading] = useState(true)

  // Achievement toast state
  const [pendingAchievement, setPendingAchievement] = useState(null)

  // Tutorial seen — persisted in localStorage
  const [tutorialSeen, setTutorialSeenRaw] = useState(
    () => !!localStorage.getItem('ss_tutorial_seen')
  )

  // Daily quests — auto-resets when date changes
  const [dailyQuests, setDailyQuests] = useState(() => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const stored = JSON.parse(localStorage.getItem('ss_daily_quests') ?? 'null')
      if (stored?.date === today) return stored
    } catch {}
    return defaultDailyQuests(today)
  })

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
        apiLogout()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  // ── Login ───────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    await apiLogin({ email, password })
    const data = await getUserData()
    setUser({ id: data.id, username: data.username, email: data.email })
    setXpRaw(data.xp ?? 0)
    setMedals(data.medals ?? ['first'])
    snd('win')
  }, [])

  // ── Register ────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    await apiRegister({ username, email, password })
    await login({ email, password })
  }, [login])

  // ── Logout ──────────────────────────────────────────────────
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
      if (getToken()) {
        updateProgress({ xpDelta: delta, medals }).catch(() => {})
      }
      return next
    })
  }, [medals])

  // ── Add Medal ───────────────────────────────────────────────
  const addMedal = useCallback((id) => {
    setMedals((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      snd('medal')
      if (getToken()) {
        updateProgress({ xpDelta: 0, medals: next }).catch(() => {})
      }
      return next
    })
  }, [])

  // ── Earn Achievement ────────────────────────────────────────
  // Idempotent: shows toast only on first grant (tracked in localStorage).
  const earnAchievement = useCallback(async (achievementId) => {
    const already = loadLocalAch()
    if (already.includes(achievementId)) return   // already earned

    // Look up local catalogue for instant toast data
    const def = ACHIEVEMENT_DEF.find(a => a.id === achievementId)
    if (!def) return

    // Mark locally first (optimistic)
    const next = [...already, achievementId]
    saveLocalAch(next)

    // Show toast
    setPendingAchievement({ ...def, lang })

    // Persist to backend (fire-and-forget)
    if (getToken()) {
      earnAchievementApi(achievementId).catch(() => {})
    }
  }, [lang])

  const clearPendingAchievement = useCallback(() => {
    setPendingAchievement(null)
    // Mark as seen on backend
    if (getToken()) {
      markAchievementsSeen().catch(() => {})
    }
  }, [])

  // ── On login: fetch unseen achievements and queue first one ─
  const fetchUnseen = useCallback(async () => {
    if (!getToken()) return
    try {
      const { achievements } = await getUnseenAchievements()
      if (!achievements?.length) return
      // Add them to local storage
      const local = loadLocalAch()
      const toAdd = achievements.map(a => a.id).filter(id => !local.includes(id))
      if (toAdd.length) saveLocalAch([...local, ...toAdd])
      // Show first one as toast
      const first = achievements[0]
      const def   = ACHIEVEMENT_DEF.find(a => a.id === first.id)
      if (def) setPendingAchievement({ ...def, lang })
      await markAchievementsSeen()
    } catch {
      // silently ignore — backend may not have achievements yet
    }
  }, [lang])

  // ── Mark tutorial as seen ───────────────────────────────────
  const setTutorialSeen = useCallback(() => {
    localStorage.setItem('ss_tutorial_seen', '1')
    setTutorialSeenRaw(true)
  }, [])

  // ── Increment daily quest progress ─────────────────────────
  // Safely called from any game screen.  Auto-awards XP + medal on completion.
  const incrementQuestProgress = useCallback((questId, amount = 1) => {
    setDailyQuests((prev) => {
      const quest = prev.quests[questId]
      if (!quest || quest.completed) return prev

      const def         = DAILY_QUESTS.find(q => q.id === questId)
      if (!def) return prev

      const newProgress = Math.min(quest.progress + amount, def.target)
      const nowDone     = newProgress >= def.target

      const next = {
        ...prev,
        quests: {
          ...prev.quests,
          [questId]: { progress: newProgress, completed: nowDone },
        },
      }
      localStorage.setItem('ss_daily_quests', JSON.stringify(next))

      // Award XP + medal outside the state updater (React rule)
      if (nowDone) {
        setTimeout(() => {
          addXP(def.xpReward)
          if (def.medalReward) addMedal(def.medalReward)
          snd('medal')
        }, 0)
      }
      return next
    })
  }, [addXP, addMedal])

  // Fetch unseen achievements shortly after login
  useEffect(() => {
    if (!user) return
    const t = setTimeout(fetchUnseen, 1200)
    return () => clearTimeout(t)
  }, [user])  // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user, xp, medals, lang, loading,
    tutorialSeen,
    dailyQuests,
    pendingAchievement,
    login, register, logout,
    addXP, addMedal,
    earnAchievement,
    clearPendingAchievement,
    setLang,
    setTutorialSeen,
    incrementQuestProgress,
    // Direct XP setter (for API hydration)
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
