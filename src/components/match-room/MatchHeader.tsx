'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { TeamBadge } from '@/components/ui/TeamBadge'
import { getTeam } from '@/data/teams'
import { matchPhaseLabel, isMatchLive } from '@/lib/match-engine'
import type { LiveMatch } from '@/types/match'

interface Props {
  match: LiveMatch
  lastGoalFlash: number
}

function ScoreDigit({ value, color }: { value: number; color: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="tabular-nums font-black"
        style={{ color }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

function PhaseTag({ match }: { match: LiveMatch }) {
  const live = isMatchLive(match)
  const label = matchPhaseLabel(match)

  if (match.status === 'HT') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Half Time</span>
      </div>
    )
  }
  if (match.status === 'FT') {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Full Time</span>
      </div>
    )
  }
  if (live) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold text-red-400 tabular-nums">{label}</span>
      </div>
    )
  }
  return null
}

export function MatchHeader({ match, lastGoalFlash }: Props) {
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)
  const flashAge = Date.now() - lastGoalFlash

  return (
    <div className="relative">
      {/* Goal flash overlay */}
      <AnimatePresence>
        {lastGoalFlash > 0 && flashAge < 2000 && (
          <motion.div
            key={lastGoalFlash}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{ background: `radial-gradient(ellipse at center, #ffffff18 0%, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      <div
        className="relative rounded-2xl overflow-hidden p-5 sm:p-6"
        style={{
          background: `linear-gradient(135deg,
            color-mix(in srgb, ${home.primary} 15%, var(--surface)) 0%,
            var(--surface) 40%,
            var(--surface) 60%,
            color-mix(in srgb, ${away.primary} 15%, var(--surface)) 100%)`,
          border: '1px solid var(--border)',
        }}
      >
        {/* Color strip top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${home.primary}, ${away.primary})` }}
        />

        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge code={match.homeTeam.code} size="xl" />
            <span className="text-xs font-medium tracking-wide text-center" style={{ color: 'var(--muted)' }}>
              {home.shortName}
            </span>
          </div>

          {/* Score center */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 text-5xl sm:text-6xl">
              <ScoreDigit value={match.homeTeam.score} color={match.homeTeam.score > match.awayTeam.score ? home.accent : 'var(--text)'} />
              <span className="text-4xl font-thin" style={{ color: 'var(--dim)' }}>–</span>
              <ScoreDigit value={match.awayTeam.score} color={match.awayTeam.score > match.homeTeam.score ? away.accent : 'var(--text)'} />
            </div>
            <PhaseTag match={match} />
            {match.groupStage && (
              <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--dim)' }}>
                {match.groupStage} · {match.venue}
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge code={match.awayTeam.code} size="xl" />
            <span className="text-xs font-medium tracking-wide text-center" style={{ color: 'var(--muted)' }}>
              {away.shortName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
