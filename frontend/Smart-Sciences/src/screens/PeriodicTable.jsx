/**
 * PeriodicTable.jsx — Interactive periodic table screen
 *
 * Features:
 *  • 18-column CSS-grid layout for periods 1–4 (36 elements)
 *  • Filter bar: All / Metals / Non-metals / Noble gases / Real-life tags
 *  • Click on element → modal card with 3D atom model
 *  • 3D atom model uses pure CSS orbit animation
 *  • "Go to lesson" button links to backend lessons
 */

import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { snd }       from '../utils/sound.js'
import { ELEMENTS, CATEGORY_COLORS, REAL_LIFE_TAGS } from '../data/elements.js'

// ── 3D Atom Model (CSS-only) ────────────────────────────────────
function AtomModel({ shells, color }) {
  const RADII = [36, 56, 76, 96]
  return (
    <div style={{ width: 200, height: 200, position: 'relative', flexShrink: 0 }}>
      {/* Nucleus */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 26, height: 26, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 70%)`,
        boxShadow: `0 0 14px ${color}cc, 0 0 28px ${color}44`,
        zIndex: 5,
      }} />

      {/* Orbits + electrons */}
      {shells.map((count, i) => {
        const r   = RADII[i] ?? (RADII[RADII.length - 1] + (i - RADII.length + 1) * 18)
        const dur = 2.2 + i * 1.1
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `calc(50% - ${r}px)`, left: `calc(50% - ${r}px)`,
            width: r * 2, height: r * 2,
            borderRadius: '50%',
            border: `1px solid ${color}33`,
          }}>
            {Array.from({ length: count }, (_, j) => {
              const angle = (360 / count) * j
              return (
                <div key={j} style={{
                  position: 'absolute',
                  width: 7, height: 7, borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 5px ${color}`,
                  top: '50%', left: '50%',
                  transformOrigin: `-${r - 3}px -3px`,
                  transform: `rotate(${angle}deg) translateX(-${r}px)`,
                  animation: `orbit${i} ${dur}s linear infinite`,
                  animationDelay: `-${(dur / count) * j}s`,
                }} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Element Card Modal ──────────────────────────────────────────
function ElementCard({ el, lang, onClose, onGoLesson }) {
  const cat = CATEGORY_COLORS[el.category] ?? CATEGORY_COLORS.nonmetal
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg,#0f172a,#1e1b4b)',
          border: `2px solid ${cat.border}55`,
          borderRadius: 24, padding: '24px 20px',
          maxWidth: 360, width: '100%',
          animation: 'popIn 0.28s ease',
          boxShadow: `0 0 40px ${cat.border}22`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14,
            background: cat.bg, border: `2px solid ${cat.border}66`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: cat.border }}>{el.symbol}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: -4 }}>{el.z}</div>
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, margin: 0 }}>
              {lang === 'UZ' ? el.nameUZ : el.nameRU}
            </h2>
            <div style={{ color: cat.border, fontSize: 12, fontWeight: 700, marginTop: 2 }}>
              {lang === 'UZ' ? cat.labelUZ : cat.label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3 }}>
              M = {el.mass} &nbsp;·&nbsp; {lang === 'UZ' ? 'Valentlik' : 'Валентность'}: {el.valence}
            </div>
          </div>
        </div>

        {/* 3D atom model */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <AtomModel shells={el.shells} color={cat.border} />
        </div>

        {/* Electron config */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 14 }}>
          {el.shells.map((n, i) => (
            <span key={i} style={{
              background: `${cat.border}22`, border: `1px solid ${cat.border}55`,
              borderRadius: 8, padding: '3px 10px', fontSize: 12,
              color: cat.border, fontWeight: 700,
            }}>
              {lang === 'UZ' ? `${i+1}-qobiq` : `${i+1}-й слой`}: {n}e⁻
            </span>
          ))}
        </div>

        {/* Fact */}
        <p style={{
          color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.65,
          background: 'rgba(255,255,255,0.04)', borderRadius: 12,
          padding: '10px 12px', marginBottom: 14,
        }}>
          💡 {el.fact}
        </p>

        {/* Real-life tags */}
        {el.realLife.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {el.realLife.map(tag => {
              const def = REAL_LIFE_TAGS.find(t => t.id === tag)
              return def ? (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.6)',
                }}>
                  {def.icon} {lang === 'UZ' ? def.labelUZ : def.labelRU}
                </span>
              ) : null
            })}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {el.lessonId && (
            <button
              onClick={() => { onGoLesson(el.lessonId); onClose() }}
              style={{
                flex: 1, background: `linear-gradient(135deg,${cat.border}cc,${cat.border}88)`,
                border: 'none', borderRadius: 12, padding: '9px 0',
                color: '#fff', fontWeight: 900, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              📚 {lang === 'UZ' ? 'Darsni ochish' : 'Открыть урок'}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '9px 0',
              color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {lang === 'UZ' ? 'Yopish' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Filter bar ──────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',      labelRU: 'Все',          labelUZ: 'Barchasi'    },
  { id: 'metal',    labelRU: 'Металлы',      labelUZ: 'Metallar'    },
  { id: 'nonmetal', labelRU: 'Неметаллы',    labelUZ: 'Nometallar'  },
  { id: 'noble',    labelRU: 'Инертные',     labelUZ: 'Inert gazlar'},
  ...REAL_LIFE_TAGS.map(t => ({
    id: `rl_${t.id}`,
    labelRU: `${t.icon} ${t.labelRU}`,
    labelUZ: `${t.icon} ${t.labelUZ}`,
  })),
]

function matchesFilter(el, filterId) {
  if (filterId === 'all')     return true
  if (filterId === 'metal')   return ['metal','alkali','alkaline','transition'].includes(el.category)
  if (filterId === 'nonmetal')return ['nonmetal','halogen','metalloid'].includes(el.category)
  if (filterId === 'noble')   return el.category === 'noble'
  if (filterId.startsWith('rl_')) return el.realLife.includes(filterId.slice(3))
  return true
}

// ── Main PeriodicTable screen ───────────────────────────────────
export function PeriodicTable({ t, lang, setMsg, setHappy, addPts, setScreen, setLesson }) {
  const { earnAchievement } = useAuth()
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setMsg(lang === 'UZ'
      ? '⚛️ Davriy jadvalni kashf et — elementni bosing!'
      : '⚛️ Изучи периодическую таблицу — нажми на элемент!')
    // Grant "table opened" achievement once
    earnAchievement('table_open')
  }, [lang])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (el) => {
    snd('click')
    setSelected(el)
    setHappy(true)
  }

  const handleGoLesson = (lessonId) => {
    if (setLesson && setScreen) {
      setLesson(lessonId - 1)
      setScreen('lesson')
    }
  }

  return (
    <div style={{ padding: '16px 12px 100px' }}>
      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
          {lang === 'UZ' ? '⚛️ Davriy Jadval' : '⚛️ Таблица Менделеева'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3 }}>
          {lang === 'UZ'
            ? 'Elementni bosib 3D atom modelini ko\'ring'
            : 'Нажми на элемент — увидишь 3D-модель атома'}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
      }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); snd('click') }}
            style={{
              background: filter === f.id ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f.id ? 'rgba(129,140,248,0.7)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20, padding: '5px 12px',
              color: filter === f.id ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {lang === 'UZ' ? f.labelUZ : f.labelRU}
          </button>
        ))}
      </div>

      {/* Category legend */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
          <span key={key} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 9, color: 'rgba(255,255,255,0.45)',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2, flexShrink: 0,
              background: val.bg, border: `1px solid ${val.border}66`,
            }} />
            {lang === 'UZ' ? val.labelUZ : val.label}
          </span>
        ))}
      </div>

      {/* Grid — 18 columns, 4 rows + placeholder row header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
        gap: 2,
        overflowX: 'auto',
        minWidth: 340,
      }}>
        {ELEMENTS.map(el => {
          const cat        = CATEGORY_COLORS[el.category] ?? CATEGORY_COLORS.nonmetal
          const highlighted = matchesFilter(el, filter)
          return (
            <button
              key={el.z}
              onClick={() => handleSelect(el)}
              style={{
                gridColumn: el.group,
                gridRow: el.period,
                background: highlighted ? cat.bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${highlighted ? cat.border + '55' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 5,
                padding: '5px 2px 4px',
                cursor: 'pointer',
                opacity: highlighted ? 1 : 0.22,
                transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minWidth: 0,
                fontFamily: 'inherit',
              }}
            >
              <span style={{
                fontSize: 8, color: 'rgba(255,255,255,0.4)',
                lineHeight: 1, alignSelf: 'flex-start', paddingLeft: 2,
              }}>
                {el.z}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 900,
                color: highlighted ? cat.border : 'rgba(255,255,255,0.25)',
                lineHeight: 1.1,
              }}>
                {el.symbol}
              </span>
              <span style={{
                fontSize: 7, color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', maxWidth: '100%',
              }}>
                {lang === 'UZ'
                  ? el.nameUZ.split(' ')[0].slice(0, 5)
                  : el.nameRU.slice(0, 6)}
              </span>
            </button>
          )
        })}

        {/* Period 5+ placeholder row */}
        <div style={{
          gridColumn: '1 / -1', gridRow: 5,
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 5, padding: '4px 8px',
          color: 'rgba(255,255,255,0.2)', fontSize: 10,
          display: 'flex', alignItems: 'center',
        }}>
          {lang === 'UZ' ? '5–7 davrlar — tez orada...' : '5–7 периоды — скоро...'}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        marginTop: 16, padding: '10px 14px', borderRadius: 12,
        background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)',
        fontSize: 12, color: 'rgba(255,255,255,0.5)',
      }}>
        {lang === 'UZ'
          ? `📊 Jadvalda ${ELEMENTS.length} ta element ko'rsatilmoqda (1–4 davrlar)`
          : `📊 Показано ${ELEMENTS.length} элементов (периоды 1–4)`}
        {filter !== 'all' && (
          <span style={{ color: '#a5b4fc', marginLeft: 8 }}>
            · {lang === 'UZ' ? 'Filtr: ' : 'Фильтр: '}
            {FILTERS.find(f => f.id === filter)?.[lang === 'UZ' ? 'labelUZ' : 'labelRU']}
            {' — '}
            {ELEMENTS.filter(e => matchesFilter(e, filter)).length}
            {lang === 'UZ' ? ' ta' : ' эл.'}
          </span>
        )}
      </div>

      {/* Element card modal */}
      {selected && (
        <ElementCard
          el={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          onGoLesson={handleGoLesson}
        />
      )}
    </div>
  )
}
