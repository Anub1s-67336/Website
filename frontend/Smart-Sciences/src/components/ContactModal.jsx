/**
 * ContactModal — team contact info + decorative QR code placeholder.
 * Props:
 *   t       {object}   — translations (t.contactTitle, t.closeBtn …)
 *   onClose {function} — called when user dismisses the modal
 */
export function ContactModal({ t, onClose }) {
  const contacts = [
    { icon: '📧', label: 'Email',    value: 'hello@smart-sciences.uz' },
    { icon: '📱', label: 'Telegram', value: '@smart_sciences_uz'       },
    { icon: '🌐', label: 'Website',  value: 'smart-sciences.uz'        },
    { icon: '📍', label: '',         value: "Yangiyer, O'zbekiston"    },
  ]

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 360, borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d0d2b, #12062a)',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.25)',
        animation: 'popIn .4s cubic-bezier(.175,.885,.32,1.275)',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 24px 20px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,195,247,0.15))',
        }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚗️</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{t.contactTitle}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{t.contactSub}</div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 10 }}>
          {/* QR placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div style={{
              width: 120, height: 120, borderRadius: 14, position: 'relative', overflow: 'hidden',
              border: '2px solid rgba(167,139,250,0.4)',
              background: 'rgba(167,139,250,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 21 21" width={90} height={90}>
                {[[0, 0], [14, 0], [0, 14]].map(([px, py], fi) => (
                  <g key={fi}>
                    <rect x={px}   y={py}   width={7} height={7} rx={1}   fill="#a78bfa" opacity={0.9} />
                    <rect x={px+1} y={py+1} width={5} height={5} rx={0.5} fill="#12062a"               />
                    <rect x={px+2} y={py+2} width={3} height={3} rx={0.3} fill="#a78bfa" opacity={0.9} />
                  </g>
                ))}
                {Array.from({ length: 40 }, (_, k) => (
                  <rect key={k}
                    x={8 + (k % 5) * 2.4}
                    y={(Math.floor(k / 5) % 7) * 2.4}
                    width={1.8} height={1.8} rx={0.3}
                    fill="#a78bfa" opacity={k % 3 === 0 ? 0.85 : 0.2}
                  />
                ))}
                <rect x={16} y={16} width={3} height={3} rx={0.5} fill="#a78bfa" opacity={0.9} />
              </svg>
              {/* Logo center */}
              <div style={{
                position: 'absolute', width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #4fc3f7, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>⚛</div>
            </div>
          </div>

          {/* Contacts */}
          {contacts.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <div>
                {c.label && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{c.label}</div>}
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{c.value}</div>
              </div>
            </div>
          ))}

          <button
            onClick={onClose}
            style={{
              padding: 13, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
              color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: 'inherit',
              boxShadow: '0 4px 18px rgba(124,58,237,0.4)', marginTop: 4,
              transition: 'transform .2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
