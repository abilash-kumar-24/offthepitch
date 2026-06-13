'use client'
import { getTeam, CONF_SHAPE } from '@/data/teams'
import { cn } from '@/lib/utils'

interface Props {
  code: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  namePosition?: 'below' | 'right'
  className?: string
}

const SIZE_MAP = {
  xs: { box: 24, font: 7, label: 'text-[9px]' },
  sm: { box: 36, font: 10, label: 'text-[10px]' },
  md: { box: 48, font: 13, label: 'text-xs' },
  lg: { box: 64, font: 17, label: 'text-sm' },
  xl: { box: 88, font: 23, label: 'text-base' },
}

// Minimal SVG shapes per confederation
function ShapePath({ shape, size }: { shape: string; size: number }) {
  const c = size / 2
  const r = size * 0.42

  switch (shape) {
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6
        return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`
      }).join(' ')
      return <polygon points={pts} />
    }
    case 'diamond': {
      return <polygon points={`${c},${c - r} ${c + r * 0.85},${c} ${c},${c + r} ${c - r * 0.85},${c}`} />
    }
    case 'circle': {
      return <circle cx={c} cy={c} r={r} />
    }
    case 'square': {
      const s = r * 1.3
      return <rect x={c - s / 2} y={c - s / 2} width={s} height={s} rx={3} />
    }
    case 'pentagon': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (Math.PI * 2 / 5) * i - Math.PI / 2
        return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`
      }).join(' ')
      return <polygon points={pts} />
    }
    case 'ring': {
      return (
        <>
          <circle cx={c} cy={c} r={r} fill="none" strokeWidth={size * 0.1} />
          <circle cx={c} cy={c} r={r * 0.45} />
        </>
      )
    }
    default:
      return <circle cx={c} cy={c} r={r} />
  }
}

export function TeamBadge({ code, size = 'md', showName = false, namePosition = 'below', className }: Props) {
  const team = getTeam(code)
  const shape = CONF_SHAPE[team.confederation]
  const s = SIZE_MAP[size]

  const badge = (
    <svg
      width={s.box}
      height={s.box}
      viewBox={`0 0 ${s.box} ${s.box}`}
      className="flex-shrink-0"
      style={{ filter: `drop-shadow(0 0 ${s.box * 0.12}px ${team.primary}88)` }}
    >
      <g fill={team.primary} stroke={team.accent} strokeWidth={s.box * 0.04}>
        <ShapePath shape={shape} size={s.box} />
      </g>
      <text
        x={s.box / 2}
        y={s.box / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s.font}
        fontWeight="700"
        fontFamily="'Inter', 'SF Mono', monospace"
        letterSpacing={s.font > 12 ? '0.05em' : '0.02em'}
        fill={team.accent === '#FFFFFF' || team.accent === '#FFDF00' ? team.accent : '#FFFFFF'}
      >
        {code}
      </text>
    </svg>
  )

  if (!showName) return <div className={cn('flex-shrink-0', className)}>{badge}</div>

  if (namePosition === 'right') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {badge}
        <span className={cn('font-medium text-white/80', s.label)}>{team.shortName}</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {badge}
      <span className={cn('font-medium text-white/60 uppercase tracking-wider', s.label)}>{code}</span>
    </div>
  )
}
