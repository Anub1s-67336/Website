/**
 * AchievementToast.jsx
 *
 * Shows a slide-in notification when the user earns a new achievement.
 * Auto-dismisses after 3.5 seconds.
 *
 * Usage in App.jsx:
 *   <AchievementToast />          ← reads pendingAchievement from AuthContext
 */

import { useEffect } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { snd }       from '../utils/sound.js'

export function AchievementToast() {
  const { pendingAchievement, clearPendingAchievement } = useAuth()

  useEffect(() => {
    if (!pendingAchievement) return
    snd('medal')
    const t = setTimeout(clearPendingAchievement, 3500)
    return () => clearTimeout(t)
  }, [pendingAchievement, clearPendingAchievement])

  if (!pendingAchievement) return null

  const { icon, titleRU, titleUZ, xp, lang } = pendingAchievement
  const title = lang === 'UZ' ? (titleUZ ?? titleRU) : titleRU

  return (
    <div
      onClick={clearPendingAchievement}
      style={{
        position: 'fixed', bottom: 90, right: 16, zIndex: 1200,
        background: 'linear-gradient(135deg,#1e1b4b,#0f172a)',
        border: '1.5px solid rgba(167,139,250,0.6)',
        borderRadius: 18, padding: '12px 16px',
        maxWidth: 280, width: 'calc(100vw - 32px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(167,139,250,0.15)',
        cursor: 'pointer',
        animation: 'toastSlideIn 0.38s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
          display: 'grid', placeItems: 'center', fontSize: 22,
        }}>
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            🏆 {lang === 'UZ' ? 'Yutuq!' : 'Достижение!'}
          </div>
          <div style={{
            color: '#fff', fontWeight: 900, fontSize: 13, marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </div>
          {xp > 0 && (
            <div style={{
              color: '#a78bfa', fontSize: 11, fontWeight: 700, marginTop: 2,
            }}>
              +{xp} XP
            </div>
          )}
        </div>

        {/* Close × */}
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, flexShrink: 0 }}>×</div>
      </div>

      {/* Progress bar (auto-dismiss indicator) */}
      <div style={{
        height: 2, background: 'rgba(167,139,250,0.15)', borderRadius: 1,
        marginTop: 10, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#a78bfa', borderRadius: 1,
          animation: 'toastProgress 3.5s linear forwards',
        }} />
      </div>
    </div>
  )
}
