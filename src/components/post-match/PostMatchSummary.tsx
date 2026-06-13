'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TeamBadge } from '@/components/ui/TeamBadge'
import { getTeam } from '@/data/teams'
import { hitRate } from '@/lib/utils'
import type { LiveMatch } from '@/types/match'
import type { MarketResult } from '@/types/market'

interface Props {
  match: LiveMatch
  results: MarketResult[]
  points: number
  streak: number
  bestStreak: number
  totalCalls: number
  correctCalls: number
}

export function PostMatchSummary({ match, results, points, streak, bestStreak, totalCalls, correctCalls }: Props) {
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)
  const rate = hitRate(correctCalls, totalCalls)
  const gained = points - 1000
  const winnerCode = match.homeTeam.score > match.awayTeam.score ? match.homeTeam.code
    : match.awayTeam.score > match.homeTeam.score ? match.awayTeam.code : null
  const winner = winnerCode ? getTeam(winnerCode) : null

  const bestCall = results.filter(r => r.correct).sort((a, b) => b.pointsWon - a.pointsWon)[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold block mb-2" style={{ color: 'var(--dim)' }}>Match Complete</span>

        {/* Final score card */}
        <div
          className="rounded-2xl p-6 mb-4 overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg,
              color-mix(in srgb, ${home.primary} 14%, var(--surface)) 0%,
              var(--surface) 40%,
              var(--surface) 60%,
              color-mix(in srgb, ${away.primary} 14%, var(--surface)) 100%)`,
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, ${home.primary}, ${away.primary})` }}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamBadge code={match.homeTeam.code} size="lg" />
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{home.shortName}</span>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black tabular-nums" style={{ color: 'var(--text)' }}>
                <span style={{ color: match.homeTeam.score > match.awayTeam.score ? home.accent : 'var(--text)' }}>
                  {match.homeTeam.score}
                </span>
                <span className="mx-3 text-4xl font-thin" style={{ color: 'var(--dim)' }}>–</span>
                <span style={{ color: match.awayTeam.score > match.homeTeam.score ? away.accent : 'var(--text)' }}>
                  {match.awayTeam.score}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest mt-1 block" style={{ color: 'var(--dim)' }}>Full Time</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamBadge code={match.awayTeam.code} size="lg" />
              <span className="text-[11px] text-white/40">{away.shortName}</span>
            </div>
          </div>
        </div>

        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${winner.primary}40`, background: `${winner.primary}10` }}
          >
            <span className="text-xs font-semibold" style={{ color: winner.accent }}>{winner.shortName} win</span>
          </motion.div>
        )}
        {!winner && (
          <span className="text-xs text-white/30">Draw</span>
        )}
      </motion.div>

      {/* Session score */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold block mb-3" style={{ color: 'var(--dim)' }}>Your Session</span>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums" style={{ color: gained >= 0 ? '#22c55e' : '#ef4444' }}>
                {gained >= 0 ? '+' : ''}{gained.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: 'var(--dim)' }}>pts</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Net points</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums" style={{ color: 'var(--text)' }}>{rate}%</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Hit rate</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <MiniStat label="Calls" value={`${correctCalls}/${totalCalls}`} />
          <MiniStat label="Best Streak" value={`${bestStreak}`} highlight={bestStreak >= 3} />
          <MiniStat label="Final Points" value={points.toLocaleString()} />
        </div>
      </motion.div>

      {/* Best call highlight */}
      {bestCall && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-green-500/10 bg-green-500/5 p-4 mb-4"
        >
          <span className="text-[10px] uppercase tracking-widest text-green-400/50 block mb-2">Strongest Read</span>
          <p className="text-sm text-white/70 mb-1">{bestCall.question}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400 font-semibold">{bestCall.userOptionLabel}</span>
            <span className="text-xs text-green-400 font-bold">+{bestCall.pointsWon} pts</span>
          </div>
        </motion.div>
      )}

      {/* All calls */}
      {results.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>All Calls</span>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {results.map((r, i) => (
              <motion.div
                key={r.marketId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{r.question}</p>
                  <span className="text-[11px]" style={{ color: r.correct ? '#86efac' : '#fca5a5' }}>
                    {r.userOptionLabel}
                  </span>
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: r.correct ? '#22c55e' : '#ef4444' }}
                >
                  {r.correct ? `+${r.pointsWon}` : `-${r.pointsLost}`}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Back to lobby */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Link href="/">
          <button
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            ← Back to Lobby
          </button>
        </Link>
      </motion.div>
    </motion.div>
  )
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--dim)' }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: highlight ? 'var(--warning)' : 'var(--muted)' }}>
        {value}
      </span>
    </div>
  )
}
