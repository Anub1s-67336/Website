import { useMemo } from 'react'

/** Fixed starfield background — generated once, no re-renders */
export function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id:    i,
        w:     1 + Math.random() * 2,
        left:  Math.random() * 100,
        top:   Math.random() * 100,
        dur:   2 + Math.random() * 3,
        delay: Math.random() * 4,
      })),
    [],
  )

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position:     'absolute',
            width:         s.w,
            height:        s.w,
            left:         `${s.left}%`,
            top:          `${s.top}%`,
            borderRadius: '50%',
            background:   '#fff',
            animation:    `starTwinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
