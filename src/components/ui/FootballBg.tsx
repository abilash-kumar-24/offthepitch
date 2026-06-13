'use client'

// Floating football icons — fixed behind all content, sitewide
const BALLS = [
  { left: 7,  top: 11, size: 32, dur: 22, delay: 0,  opacity: 0.055 },
  { left: 87, top: 23, size: 18, dur: 17, delay: 4,  opacity: 0.04  },
  { left: 51, top: 67, size: 38, dur: 29, delay: 9,  opacity: 0.058 },
  { left: 75, top: 6,  size: 14, dur: 15, delay: 14, opacity: 0.035 },
  { left: 19, top: 53, size: 26, dur: 25, delay: 6,  opacity: 0.048 },
  { left: 63, top: 37, size: 20, dur: 19, delay: 11, opacity: 0.042 },
  { left: 33, top: 81, size: 16, dur: 23, delay: 2,  opacity: 0.038 },
  { left: 92, top: 57, size: 22, dur: 18, delay: 16, opacity: 0.036 },
  { left: 44, top: 29, size: 12, dur: 32, delay: 7,  opacity: 0.03  },
]

const ANIMS = ['float-ball-a', 'float-ball-b', 'float-ball-c']

export function FootballBg() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        userSelect: 'none',
      }}
    >
      {BALLS.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            top: `${b.top}%`,
            fontSize: b.size,
            opacity: b.opacity,
            animation: `${ANIMS[i % 3]} ${b.dur}s ease-in-out ${b.delay}s infinite`,
            lineHeight: 1,
            display: 'block',
            willChange: 'transform',
          }}
        >
          ⚽
        </span>
      ))}
    </div>
  )
}
