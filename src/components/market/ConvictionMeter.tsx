'use client'
import { motion } from 'framer-motion'
import { hitRate } from '@/lib/utils'
import { getStreakMultiplier } from '@/lib/market-engine'

interface Props {
  points: number
  streak: number
  bestStreak: number
  totalCalls: number
  correctCalls: number
}

export function ConvictionMeter({ points, streak, bestStreak, totalCalls, correctCalls }: Props) {
  const rate = hitRate(correctCalls, totalCalls)
  const multiplier = getStreakMultiplier(streak)
  const startingPoints = 1000
  const pct = Math.min(100, Math.max(0, (points / (startingPoints * 2)) * 100))

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>Session</span>
        {streak > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20"
          >
            <span className="text-[10px] text-amber-400 font-semibold">{streak} streak · {multiplier}×</span>
          </motion.div>
        )}
      </div>

      {/* Points display */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <motion.span
          key={points}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-black tabular-nums"
          style={{ color: 'var(--text)' }}
        >
          {points.toLocaleString()}
        </motion.span>
        <span className="text-xs font-medium" style={{ color: 'var(--dim)' }}>pts</span>
      </div>

      {/* Points bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--surface-2)' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: points >= startingPoints
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #ef4444, #dc2626)',
          }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCell label="Hit Rate" value={`${rate}%`} highlight={rate > 60} />
        <StatCell label="Calls" value={`${correctCalls}/${totalCalls}`} />
        <StatCell label="Best Streak" value={`${bestStreak}`} highlight={bestStreak >= 3} />
      </div>
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--dim)' }}>{label}</span>
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: highlight ? 'var(--warning)' : 'var(--muted)' }}
      >
        {value}
      </span>
    </div>
  )
}
