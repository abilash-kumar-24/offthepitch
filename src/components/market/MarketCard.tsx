'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getTeam } from '@/data/teams'
import type { Market, MarketOption } from '@/types/market'
import type { LiveMatch } from '@/types/match'

interface Props {
  market: Market
  match: LiveMatch
  onPlace: (marketId: string, optionId: string, amount: number) => void
  userPosition?: string
  sessionPoints: number
}

const QUICK_AMOUNTS = [50, 100, 200, 400]

// ── Seeded community % distribution ─────────────────────────────────────────
// Deterministic from marketId so all players see the same "community" split
function seededCommunityPct(marketId: string, options: MarketOption[]): Record<string, number> {
  let h = 5381
  for (let i = 0; i < marketId.length; i++) {
    h = ((h << 5) + h) ^ marketId.charCodeAt(i)
    h = h >>> 0  // keep unsigned
  }
  const raws = options.map((_, i) => {
    const s = (h + i * 2654435761) >>> 0
    return (Math.sin(s) * 0.5 + 0.5) * 80 + 10  // 10–90 raw
  })
  const total = raws.reduce((a, b) => a + b, 0)
  const pcts = raws.map(r => Math.round((r / total) * 100))
  // Fix rounding drift
  const sum = pcts.reduce((a, b) => a + b, 0)
  if (sum !== 100 && pcts.length > 0) pcts[0] += 100 - sum
  return Object.fromEntries(options.map((o, i) => [o.id, pcts[i]]))
}

// ── Timer bar ─────────────────────────────────────────────────────────────────
function TimerBar({ locksAt, opensAt }: { locksAt: number; opensAt: number }) {
  const [pct, setPct] = useState(100)

  useEffect(() => {
    const total = locksAt - opensAt
    const tick = () => setPct(Math.max(0, ((locksAt - Date.now()) / total) * 100))
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [locksAt, opensAt])

  const color = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--live)'

  return (
    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function SecondsLeft({ locksAt }: { locksAt: number }) {
  const [secs, setSecs] = useState(Math.max(0, Math.ceil((locksAt - Date.now()) / 1000)))
  useEffect(() => {
    const id = setInterval(() => setSecs(Math.max(0, Math.ceil((locksAt - Date.now()) / 1000))), 500)
    return () => clearInterval(id)
  }, [locksAt])
  return <span className="tabular-nums">{secs}s</span>
}

// ── Community split bar (shown after resolution) ──────────────────────────────
function CommunityBar({
  option, pct, isCorrect, isUserPick,
}: {
  option: MarketOption
  pct: number
  isCorrect: boolean
  isUserPick: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <span style={{ color: isCorrect ? 'var(--success)' : 'var(--muted)' }} className="font-semibold">
            {option.label}
          </span>
          {isUserPick && (
            <span
              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
              style={{
                background: isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: isCorrect ? 'var(--success)' : 'var(--live)',
                border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              {isCorrect ? 'Your call ✓' : 'Your call ✗'}
            </span>
          )}
          {isCorrect && !isUserPick && (
            <span className="text-[9px] font-bold" style={{ color: 'var(--success)' }}>✓ Correct</span>
          )}
        </div>
        <span className="font-bold tabular-nums" style={{ color: isCorrect ? 'var(--success)' : 'var(--dim)' }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{
            background: isCorrect
              ? 'linear-gradient(90deg, var(--success), rgba(34,197,94,0.5))'
              : 'var(--border-strong)',
          }}
        />
      </div>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────
export function MarketCard({ market, match, onPlace, userPosition, sessionPoints }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userPosition ?? null)
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [placed, setPlaced] = useState(!!userPosition)

  const isLocked   = market.status === 'LOCKED'
  const isResolved = market.status === 'RESOLVED'

  const communityPct = isResolved
    ? seededCommunityPct(market.id, market.options)
    : null

  const correctPct = communityPct && market.resolvedOutcome
    ? (communityPct[market.resolvedOutcome] ?? 0)
    : 0

  function handlePlace() {
    if (!selectedOption || placed || isLocked) return
    onPlace(market.id, selectedOption, selectedAmount)
    setPlaced(true)
  }

  function teamColor(optionId: string) {
    const code = optionId === 'home' ? match.homeTeam.code
      : optionId === 'away' ? match.awayTeam.code : null
    return code ? getTeam(code).primary : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}
    >
      {/* Timer bar */}
      {market.status === 'OPEN' && (
        <TimerBar locksAt={market.locksAt} opensAt={market.opensAt} />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>
            Conviction Call
          </span>
          {market.status === 'OPEN' && (
            <span className="text-[10px]" style={{ color: 'var(--dim)' }}>
              Locks in <SecondsLeft locksAt={market.locksAt} />
            </span>
          )}
          {isLocked && (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--warning)' }}
              />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--warning)' }}>Watching…</span>
            </div>
          )}
          {isResolved && (
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--dim)' }}>
              Settled
            </span>
          )}
        </div>

        {/* Question */}
        <p className="text-base font-semibold mb-4 leading-snug" style={{ color: 'var(--text)' }}>
          {market.question}
        </p>

        {/* ── OPEN / LOCKED: Option buttons ──────────────────────────────── */}
        {!isResolved && (
          <div
            className="grid gap-2 mb-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(market.options.length, 3)}, 1fr)` }}
          >
            {market.options.map(option => {
              const isSelected = selectedOption === option.id
              const color = teamColor(option.id)

              return (
                <motion.button
                  key={option.id}
                  disabled={isLocked || placed}
                  onClick={() => !placed && !isLocked && setSelectedOption(option.id)}
                  whileTap={!placed && !isLocked ? { scale: 0.97 } : {}}
                  className="relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center disabled:cursor-default"
                  style={{
                    borderColor: isSelected
                      ? (color ? `${color}60` : 'var(--accent-glow)')
                      : 'var(--border)',
                    background: isSelected
                      ? (color ? `${color}15` : 'var(--accent-bg)')
                      : 'var(--surface-2)',
                  }}
                >
                  {color && isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full mb-0.5" style={{ background: color }} />
                  )}
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{option.label}</span>
                  {option.subLabel && (
                    <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{option.subLabel}</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Amount selector */}
        <AnimatePresence>
          {selectedOption && !placed && !isLocked && !isResolved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--dim)' }}>
                    Conviction
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{sessionPoints} pts available</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {QUICK_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className="py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: selectedAmount === amt ? 'var(--accent-bg)' : 'var(--surface-2)',
                        color: selectedAmount === amt ? 'var(--accent)' : 'var(--dim)',
                        border: selectedAmount === amt ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
                      }}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePlace}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Back this read · {selectedAmount} pts
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placed (waiting) state */}
        {placed && !isResolved && (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <span className="text-xs font-semibold block" style={{ color: 'var(--muted)' }}>
                {market.options.find(o => o.id === selectedOption)?.label}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--dim)' }}>Conviction placed</span>
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>{selectedAmount} pts</span>
          </div>
        )}

        {/* ── RESOLVED: Community stats + outcome ────────────────────────── */}
        {isResolved && communityPct && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {/* Community split */}
            <div className="space-y-2.5">
              {market.options.map(option => (
                <CommunityBar
                  key={option.id}
                  option={option}
                  pct={communityPct[option.id] ?? 0}
                  isCorrect={market.resolvedOutcome === option.id}
                  isUserPick={placed && selectedOption === option.id}
                />
              ))}
            </div>

            {/* Summary row */}
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl mt-1"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-[10px]" style={{ color: 'var(--dim)' }}>
                {correctPct}% of players called this
              </span>
              {placed && (
                <span
                  className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: selectedOption === market.resolvedOutcome ? 'var(--success)' : 'var(--live)' }}
                >
                  {selectedOption === market.resolvedOutcome
                    ? `+${selectedAmount} pts won`
                    : `−${selectedAmount} pts`}
                </span>
              )}
              {!placed && (
                <span className="text-[10px]" style={{ color: 'var(--dim)' }}>No call placed</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
