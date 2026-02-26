import { useEffect } from 'react'
import { LV_ICONS, LV_COLS } from '../data/constants.js'

export function RoadmapScreen({ t, setMsg }) {
  useEffect(() => { setMsg(t.prof.roadmap) }, [t])

  return (
    <div style={{ padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{t.roadmapTitle}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>{t.roadmapSub}</p>

      <div style={{ position: 'relative' }}>
        {/* Vertical timeline line */}
        <div style={{
          position: 'absolute', left: 31, top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, ${LV_COLS.join(',')})`,
          opacity: 0.6,
        }} />

        <div style={{ display: 'grid', gap: 16 }}>
          {t.levels.map((lv, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Level node */}
              <div style={{
                width: 62, height: 62, borderRadius: 16, flexShrink: 0, zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: `${LV_COLS[i]}18`,
                border: `2px solid ${LV_COLS[i]}`,
                boxShadow: `0 0 20px ${LV_COLS[i]}33`,
              }}>
                <span style={{ fontSize: 20 }}>{LV_ICONS[i]}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: LV_COLS[i], lineHeight: 1 }}>Lv{i + 1}</span>
              </div>

              {/* Card */}
              <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>{lv.name}</span>
                  <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, fontFamily: 'monospace', fontWeight: 700, color: LV_COLS[i], background: `${LV_COLS[i]}1a` }}>
                    {lv.xp}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {lv.games.map((g, j) => (
                    <span key={j} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      🎮 {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
