/**
 * Particles overlay — renders floating burst dots over the entire viewport.
 * Usage:
 *   const [pts, setPts] = useState([])
 *   const addBurst = (x, y, color) => {
 *     const p = makeBurst(x, y, color)
 *     setPts(prev => [...prev, ...p])
 *     setTimeout(() => setPts(prev => prev.filter(v => !p.find(pp => pp.id === v.id))), 2200)
 *   }
 *   <Particles pts={pts} />
 */

export function Particles({ pts }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pts.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x - p.r,
            top:  p.y - p.r,
            width:  p.r * 2,
            height: p.r * 2,
            borderRadius: '50%',
            background: p.c,
            boxShadow: `0 0 ${p.r * 3}px ${p.c}`,
            animation: `ptUp ${p.life}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  )
}

/** Create a burst of particles centred on (x, y) */
export function makeBurst(x, y, color, count = 14) {
  return Array.from({ length: count }, (_, i) => ({
    id:   Date.now() + i + Math.random(),
    x:    x + (Math.random() - 0.5) * 70,
    y:    y + (Math.random() - 0.5) * 70,
    r:    3 + Math.random() * 7,
    c:    color,
    life: 0.7 + Math.random() * 0.9,
  }))
}
