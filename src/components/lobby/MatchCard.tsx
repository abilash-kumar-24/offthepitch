'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TeamBadge } from '@/components/ui/TeamBadge'
import { getTeam } from '@/data/teams'
import { formatKickoff, formatCountdown } from '@/lib/utils'
import { matchPhaseLabel, isMatchLive } from '@/lib/match-engine'
import type { LiveMatch } from '@/types/match'

interface Props {
  match: LiveMatch
  index?: number
}

function StatusBadge({ match }: { match: LiveMatch }) {
  if (match.status === 'FT') {
    return (
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--dim)' }}>
        Full Time
      </span>
    )
  }
  if (match.status === 'HT') {
    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold"
        style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        Half Time
      </span>
    )
  }
  if (match.status === 'ET') {
    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold"
        style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        Extra Time
      </span>
    )
  }
  if (match.status === 'PEN') {
    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold"
        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        Penalties
      </span>
    )
  }
  if (isMatchLive(match)) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--live)' }} />
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--live)' }}>
          Live · {matchPhaseLabel(match)}
        </span>
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--muted)' }}>
      {formatKickoff(match.kickoffTime)}
    </span>
  )
}

export function MatchCard({ match, index = 0 }: Props) {
  const homeTeam = getTeam(match.homeTeam.code)
  const awayTeam = getTeam(match.awayTeam.code)
  const live     = isMatchLive(match)
  const upcoming = match.status === 'UPCOMING' || match.status === 'SCHEDULED'
  const finished = match.status === 'FT'
  const hasScore = finished || live || match.status === 'HT' || match.status === 'ET' || match.status === 'PEN'
  const isDemo   = match.id === 'wc-demo'

  const possession = match.stats?.possession ?? [50, 50]
  const homeWins   = match.homeTeam.score > match.awayTeam.score
  const awayWins   = match.awayTeam.score > match.homeTeam.score

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <Link href={`/match/${match.id}`} className="block">
        <div
          className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300"
          style={{
            background: `linear-gradient(135deg,
              color-mix(in srgb, ${homeTeam.primary} 22%, var(--surface)) 0%,
              var(--surface) 38%,
              var(--surface) 62%,
              color-mix(in srgb, ${awayTeam.primary} 22%, var(--surface)) 100%
            )`,
            border: live
              ? `1px solid ${homeTeam.primary}60`
              : `1px solid var(--border)`,
            boxShadow: live
              ? `0 0 0 1px ${homeTeam.primary}25, 0 16px 48px ${homeTeam.primary}20, inset 0 0 0 1px ${awayTeam.primary}12`
              : '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* Always-on colour top strip */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${homeTeam.primary}, ${awayTeam.primary})`,
              opacity: live ? 1 : 0.3,
            }}
          />

          {/* Hover shimmer overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
          />

          <div className="p-4 sm:p-5 relative z-10">

            {/* Row 1: group label + status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--dim)' }}
                >
                  {match.groupStage ?? 'Group Stage'}
                </span>
                {isDemo && (
                  <span
                    className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-glow)', color: 'var(--accent)' }}
                  >
                    DEMO
                  </span>
                )}
              </div>
              <StatusBadge match={match} />
            </div>

            {/* Row 2: teams + score */}
            <div className="flex items-center justify-between gap-2">

              {/* Home */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <TeamBadge code={match.homeTeam.code} size="lg" />
                <span
                  className="text-[11px] font-semibold tracking-wide text-center leading-tight truncate w-full text-center"
                  style={{ color: 'var(--muted)' }}
                >
                  {homeTeam.shortName}
                </span>
              </div>

              {/* Score / vs */}
              <div className="flex flex-col items-center gap-1 min-w-[88px]">
                {hasScore ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-[32px] font-black tabular-nums leading-none"
                        style={{ color: homeWins ? homeTeam.accent : 'var(--text)' }}
                      >
                        {match.homeTeam.score}
                      </span>
                      <span className="text-lg font-light" style={{ color: 'var(--dim)' }}>–</span>
                      <span
                        className="text-[32px] font-black tabular-nums leading-none"
                        style={{ color: awayWins ? awayTeam.accent : 'var(--text)' }}
                      >
                        {match.awayTeam.score}
                      </span>
                    </div>
                    {live && (
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--live)' }}>
                        {match.minute}'
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-base font-light" style={{ color: 'var(--dim)' }}>vs</span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: 'var(--muted)' }}
                    >
                      {formatCountdown(match.kickoffTime)}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>
                      starts in
                    </span>
                  </div>
                )}
              </div>

              {/* Away */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <TeamBadge code={match.awayTeam.code} size="lg" />
                <span
                  className="text-[11px] font-semibold tracking-wide text-center leading-tight truncate w-full text-center"
                  style={{ color: 'var(--muted)' }}
                >
                  {awayTeam.shortName}
                </span>
              </div>
            </div>

            {/* Possession bar (live only) */}
            {live && (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--dim)' }}>
                  <span style={{ color: homeTeam.primary }}>{possession[0]}%</span>
                  <span style={{ color: 'var(--dim)' }}>Possession</span>
                  <span style={{ color: awayTeam.primary }}>{possession[1]}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: '50%' }}
                    animate={{ width: `${possession[0]}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, ${homeTeam.primary}CC, ${awayTeam.primary}CC)` }}
                  />
                </div>
              </div>
            )}

            {/* Row 3: venue + CTA */}
            <div
              className="flex items-center justify-between mt-4 pt-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-[10px] truncate" style={{ color: 'var(--dim)' }}>
                📍 {match.venue ?? 'TBD'}
              </span>
              {live ? (
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${homeTeam.primary}, ${awayTeam.primary})`,
                    color: 'white',
                    boxShadow: `0 4px 16px ${homeTeam.primary}50`,
                  }}
                >
                  Enter Arena ›
                </span>
              ) : upcoming ? (
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--dim)' }}>
                  Opens at kickoff
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--dim)' }}>
                  View recap
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
