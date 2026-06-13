'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LiveMatch } from '@/types/match'
import type { Market } from '@/types/market'
import { getTeam } from '@/data/teams'
import { useMarketStore } from '@/store/marketStore'
import { useSessionStore } from '@/store/sessionStore'
import { MarketCard } from '@/components/market/MarketCard'

interface Props {
  match: LiveMatch
}

// Animated live stats panel — shown whenever no question is active
function MatchAtmosphere({ match }: { match: LiveMatch }) {
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)
  const stats = match.stats
  const hPos = stats.possession[0]
  const aPos = stats.possession[1]
  const hAtk = stats.dangerousAttacks[0]
  const aAtk = stats.dangerousAttacks[1]
  const atkTotal = hAtk + aAtk || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-4 space-y-3.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>
            Live Match Pulse
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--dim)' }}>Next call soon…</span>
      </div>

      {/* Possession */}
      <div>
        <div className="flex justify-between text-[9px] font-bold mb-1.5" style={{ color: 'var(--dim)' }}>
          <span style={{ color: home.primary }}>{match.homeTeam.code} {hPos}%</span>
          <span>Possession</span>
          <span style={{ color: away.primary }}>{match.awayTeam.code} {aPos}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${hPos}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ background: `linear-gradient(90deg, ${home.primary}dd, ${away.primary}dd)` }}
          />
        </div>
      </div>

      {/* Shots / On target / Corners */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {([
          { label: 'Shots', h: stats.shots[0], a: stats.shots[1] },
          { label: 'On Target', h: stats.shotsOnTarget[0], a: stats.shotsOnTarget[1] },
          { label: 'Corners', h: stats.corners[0], a: stats.corners[1] },
        ] as { label: string; h: number; a: number }[]).map(s => (
          <div key={s.label}>
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <motion.span
                key={`h-${s.h}`}
                initial={{ scale: 1.5, color: home.accent }}
                animate={{ scale: 1, color: 'var(--text)' as string }}
                transition={{ duration: 0.4 }}
                className="text-sm font-black tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {s.h}
              </motion.span>
              <span className="text-[9px]" style={{ color: 'var(--dim)' }}>–</span>
              <motion.span
                key={`a-${s.a}`}
                initial={{ scale: 1.5, color: away.accent }}
                animate={{ scale: 1, color: 'var(--text)' as string }}
                transition={{ duration: 0.4 }}
                className="text-sm font-black tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {s.a}
              </motion.span>
            </div>
            <span className="text-[8px] uppercase tracking-widest block" style={{ color: 'var(--dim)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Dangerous attacks bar */}
      <div>
        <div className="flex justify-between text-[9px] mb-1.5" style={{ color: 'var(--dim)' }}>
          <span style={{ color: home.primary }}>{hAtk}</span>
          <span>Dangerous Attacks</span>
          <span style={{ color: away.primary }}>{aAtk}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${(hAtk / atkTotal) * 100}%` }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{ background: home.primary }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function ResolvedCallRow({ market, userOptionId }: { market: Market; userOptionId?: string }) {
  const correct = userOptionId ? userOptionId === market.resolvedOutcome : null
  const correctOption = market.options.find(o => o.id === market.resolvedOutcome)

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 flex items-start justify-between gap-3"
      style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-snug truncate" style={{ color: 'var(--muted)' }}>
          {market.question}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--dim)' }}>
          Result:{' '}
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            {correctOption?.label ?? market.resolvedOutcome}
          </span>
          {userOptionId && correct === false && (
            <span style={{ color: 'var(--dim)' }}>
              {' '}· You picked {market.options.find(o => o.id === userOptionId)?.label}
            </span>
          )}
        </p>
      </div>
      <div className="shrink-0">
        {correct === true  && <span className="text-[10px] font-black" style={{ color: 'var(--success)' }}>✓ Got it</span>}
        {correct === false && <span className="text-[10px] font-black" style={{ color: 'var(--live)' }}>✗ Miss</span>}
        {correct === null  && <span className="text-[10px]" style={{ color: 'var(--dim)' }}>—</span>}
      </div>
    </motion.div>
  )
}

export function NextEventArena({ match }: Props) {
  const { activeMarkets, resolvedMarkets, pendingEventMarkets, spawnMarket, placeConviction, positions } = useMarketStore()
  const { points } = useSessionStore()
  const [lastSpawn, setLastSpawn] = useState(0)
  const spawnedOnce = useRef(false)

  // Auto-spawn: check every 1.5s, spawn if no open market and 8s cooldown
  useEffect(() => {
    if (match.status !== 'LIVE') return
    const interval = setInterval(() => {
      const openMarkets = activeMarkets.filter(m => m.status === 'OPEN')
      if (openMarkets.length === 0 && Date.now() - lastSpawn > 8000) {
        spawnMarket(match)
        setLastSpawn(Date.now())
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [match, activeMarkets, spawnMarket, lastSpawn])

  // First spawn at 800ms — only once
  useEffect(() => {
    if (match.status === 'LIVE' && activeMarkets.length === 0 && !spawnedOnce.current) {
      spawnedOnce.current = true
      const t = setTimeout(() => {
        spawnMarket(match)
        setLastSpawn(Date.now())
      }, 800)
      return () => clearTimeout(t)
    }
  }, [match.status])

  const openMarket   = activeMarkets.find(m => m.status === 'OPEN')
  const lockedMarket = activeMarkets.find(m => m.status === 'LOCKED')
  const recentResolved = resolvedMarkets.slice(-4).reverse()
  const showAtmosphere = !openMarket && match.status === 'LIVE'

  if (match.status === 'HT') {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: '#f59e0b' }}>Half Time</span>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>New calls open at the second half kickoff</p>
        <MatchAtmosphere match={match} />
      </div>
    )
  }

  if (match.status === 'FT') return null

  return (
    <div className="space-y-3">
      {/* Arena header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>
          Next Event Arena
        </span>
        <div className="flex items-center gap-2">
          {pendingEventMarkets.length > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              +{pendingEventMarkets.length} queued
            </span>
          )}
        </div>
      </div>

      {/* Active question */}
      <AnimatePresence mode="wait">
        {openMarket ? (
          <MarketCard
            key={openMarket.id}
            market={openMarket}
            match={match}
            onPlace={placeConviction}
            userPosition={positions.find(p => p.marketId === openMarket.id)?.optionId}
            sessionPoints={points}
          />
        ) : null}
      </AnimatePresence>

      {/* Locked market indicator */}
      <AnimatePresence>
        {lockedMarket && (
          <motion.div
            key={lockedMarket.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-3 flex items-center gap-3 mb-1"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: '#f59e0b' }}
              />
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider block" style={{ color: '#f59e0b', opacity: 0.7 }}>
                  Awaiting result
                </span>
                <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{lockedMarket.question}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live match atmosphere — always visible when no open question */}
      <AnimatePresence>
        {showAtmosphere && (
          <MatchAtmosphere key="atmosphere" match={match} />
        )}
      </AnimatePresence>

      {/* Resolved call history */}
      {recentResolved.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>Past Calls</span>
          <AnimatePresence>
            {recentResolved.map(market => (
              <ResolvedCallRow
                key={market.id}
                market={market}
                userOptionId={positions.find(p => p.marketId === market.id)?.optionId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
