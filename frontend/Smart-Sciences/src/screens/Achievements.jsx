/**
 * Achievements.jsx — Daily quests + medal gallery.
 *
 * Replaces the old MedalsScreen.  Accessed via the 'medals' nav item.
 *
 * Shows:
 *   1. Daily Quests section with progress bars (auto-reset at midnight)
 *   2. Full medal gallery (locked medals shown in greyscale)
 *
 * Quest progress is tracked inside AuthContext via incrementQuestProgress().
 * Quests refresh automatically when the calendar date changes.
 */

import { useAuth }     from '../context/AuthContext.jsx'
import { MEDAL_DEF, DAILY_QUESTS, xpLevelProgress } from '../data/constants.js'

// ── Quest progress card ─────────────────────────────────────────
function QuestCard({ quest, progress, lang, tAch }) {
  const idx       = ['dq_lab', 'dq_electron', 'dq_visit'].indexOf(quest.id)
  const name      = tAch.questNames[idx] ?? quest.id
  const desc      = tAch.questDescs[idx] ?? ''
  const pct       = Math.min(100, (progress.progress / quest.target) * 100)
  const done      = progress.completed

  return (
    <div style={{
      padding: '16px 18px', borderRadius: 18,
      background: done
        ? 'linear-gradient(135deg,rgba(74,222,128,0.1),rgba(34,211,238,0.08))'
        : 'rgba(255,255,255,0.04)',
      border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
      marginBottom: 10,
      transition: 'all .3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{quest.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{name}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 1 }}>{desc}</div>
        </div>
        {done ? (
          <span style={{
            padding: '4px 12px', borderRadius: 99,
            background: 'linear-gradient(90deg,#4ade80,#22d3ee)',
            color: '#fff', fontWeight: 800, fontSize: 11,
          }}>
            {tAch.completed}
          </span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'monospace' }}>
            {progress.progress}/{quest.target}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: done
            ? 'linear-gradient(90deg,#4ade80,#22d3ee)'
            : 'linear-gradient(90deg,#818cf8,#6366f1)',
          boxShadow: done ? '0 0 8px #4ade80' : '0 0 6px #818cf8',
          transition: 'width .4s ease',
        }} />
      </div>

      {/* Reward badge */}
      {!done && (
        <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
          {tAch.reward}: +{quest.xpReward} XP
          {quest.medalReward && ' + 📅'}
        </div>
      )}
    </div>
  )
}

// ── Medal card ──────────────────────────────────────────────────
function MedalCard({ def, earned, name, desc }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '14px 8px', borderRadius: 16,
      background: earned ? `${def.col}18` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${earned ? def.col + '55' : 'rgba(255,255,255,0.06)'}`,
      opacity: earned ? 1 : 0.55,
      filter: earned ? 'none' : 'grayscale(0.7)',
      transition: 'all .2s',
    }}>
      <span style={{
        fontSize: 28,
        filter: earned ? `drop-shadow(0 0 8px ${def.col})` : 'none',
      }}>
        {earned ? def.icon : '🔒'}
      </span>
      <div style={{
        color: earned ? def.col : 'rgba(255,255,255,0.35)',
        fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
      }}>
        {name}
      </div>
      {earned && (
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textAlign: 'center' }}>
          {desc}
        </div>
      )}
    </div>
  )
}

// ── Achievements screen ─────────────────────────────────────────
export function Achievements({ t, lang }) {
  const { medals, xp, dailyQuests } = useAuth()
  const tAch = t.achievements

  // How long until midnight reset
  const now     = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const hoursLeft = Math.ceil((midnight - now) / 3600000)

  const { level, percent, toNext } = xpLevelProgress(xp)

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <h2 style={{ color: '#e2e8f0', fontWeight: 900, fontSize: 20, margin: '0 0 4px' }}>
        {tAch.title}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px' }}>
        {tAch.sub}
      </p>

      {/* XP / Level summary */}
      <div style={{
        padding: '14px 18px', borderRadius: 16, marginBottom: 22,
        background: 'rgba(129,140,248,0.08)',
        border: '1px solid rgba(129,140,248,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#818cf8', fontWeight: 800, fontSize: 15 }}>
            {t.levelLabel} {level}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            {toNext} {t.toNextLevel}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${percent}%`,
            background: 'linear-gradient(90deg,#818cf8,#22d3ee)',
            boxShadow: '0 0 8px #818cf8',
            transition: 'width .4s',
          }} />
        </div>
        <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
          {xp} XP {lang === 'UZ' ? 'jami' : 'всего'}
        </div>
      </div>

      {/* ── Daily quests ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 16, margin: 0 }}>
          {tAch.dailyTitle}
        </h3>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>
          🕛 {hoursLeft}h
        </span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 14px' }}>
        {tAch.dailyReset}
      </p>

      {DAILY_QUESTS.map(quest => (
        <QuestCard
          key={quest.id}
          quest={quest}
          progress={dailyQuests?.quests?.[quest.id] ?? { progress: 0, completed: false }}
          lang={lang}
          tAch={tAch}
        />
      ))}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '22px 0 18px' }} />

      {/* ── Medal gallery ──────────────────────────────────── */}
      <h3 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 16, margin: '0 0 6px' }}>
        {tAch.allTitle}
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 16px' }}>
        {medals.length}/{MEDAL_DEF.length}{' '}
        {lang === 'UZ' ? 'ta medal' : 'медалей'}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 10,
      }}>
        {MEDAL_DEF.map((def, i) => (
          <MedalCard
            key={def.id}
            def={def}
            earned={medals.includes(def.id)}
            name={t.medalNames[i] ?? def.id}
            desc={t.medalDescs[i] ?? ''}
          />
        ))}
      </div>
    </div>
  )
}
