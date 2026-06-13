'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { getTeam } from '@/data/teams'
import type { LiveMatch, PressureState } from '@/types/match'

interface Props {
  match: LiveMatch
  pressure: PressureState | null
}

function Shockwave({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      initial={{ opacity: 0.7, scale: 1 }}
      animate={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ border: `1px solid ${color}`, borderRadius: 16 }}
    />
  )
}

export function PressurePulse({ match, pressure }: Props) {
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)

  const homePct = pressure?.homePressure ?? 50
  const awayPct = pressure?.awayPressure ?? 50
  const tension = pressure?.tension ?? 0
  const momentum = pressure?.momentum

  const shockwaveKey = pressure?.shockwaveAt ?? 0
  const lastShockwave = pressure?.lastShockwave

  const shockColor = lastShockwave
    ? (lastShockwave.side === 'home' ? home.primary : away.primary)
    : '#ffffff'

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {shockwaveKey > 0 && <Shockwave color={shockColor} key={shockwaveKey} />}

      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>Pressure Pulse</span>
        {tension > 40 && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: tension > 70 ? '#ef4444' : '#f59e0b' }}
          >
            {tension > 70 ? 'High Tension' : 'Building'}
          </motion.span>
        )}
      </div>

      {/* Main pulse bar */}
      <div className="px-4 py-4">
        {/* Team labels */}
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: home.primary }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>{match.homeTeam.code}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>{match.awayTeam.code}</span>
            <div className="w-2 h-2 rounded-full" style={{ background: away.primary }} />
          </div>
        </div>

        {/* Pulse bar */}
        <div className="relative h-8 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          {/* Home side */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-l-full"
            animate={{ width: `${homePct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: `linear-gradient(90deg, ${home.primary}cc, ${home.primary}44)`,
              boxShadow: momentum === 'home' ? `0 0 20px ${home.primary}60` : 'none',
            }}
          />
          {/* Away side */}
          <motion.div
            className="absolute inset-y-0 right-0 rounded-r-full"
            animate={{ width: `${awayPct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: `linear-gradient(270deg, ${away.primary}cc, ${away.primary}44)`,
              boxShadow: momentum === 'away' ? `0 0 20px ${away.primary}60` : 'none',
            }}
          />
          {/* Center divider */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/60 z-10" />

          {/* Possession labels */}
          <div className="absolute inset-0 flex items-center justify-between px-3 z-20 pointer-events-none">
            <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--text)' }}>{homePct}%</span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--text)' }}>{awayPct}%</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatBlock
            label="Shots"
            home={match.stats.shots[0]}
            away={match.stats.shots[1]}
            homeColor={home.primary}
            awayColor={away.primary}
          />
          <StatBlock
            label="On Target"
            home={match.stats.shotsOnTarget[0]}
            away={match.stats.shotsOnTarget[1]}
            homeColor={home.primary}
            awayColor={away.primary}
          />
          <StatBlock
            label="Corners"
            home={match.stats.corners[0]}
            away={match.stats.corners[1]}
            homeColor={home.primary}
            awayColor={away.primary}
          />
        </div>
      </div>

      {/* Tension glow bottom border */}
      {tension > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `linear-gradient(90deg, ${home.primary}, ${away.primary})`,
            opacity: tension / 100,
          }}
        />
      )}
    </div>
  )
}

function StatBlock({
  label, home, away, homeColor, awayColor,
}: {
  label: string
  home: number
  away: number
  homeColor: string
  awayColor: string
}) {
  const total = home + away || 1
  const homePct = (home / total) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-center" style={{ color: 'var(--dim)' }}>{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tabular-nums" style={{ color: homeColor }}>{home}</span>
        <div className="flex-1 mx-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${homePct}%` }}
            transition={{ duration: 1 }}
            style={{ background: `linear-gradient(90deg, ${homeColor}, ${awayColor})` }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums" style={{ color: awayColor }}>{away}</span>
      </div>
    </div>
  )
}
