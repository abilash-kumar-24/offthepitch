'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { LiveMatch } from '@/types/match'
import type { Market } from '@/types/market'
import { useMarketStore } from '@/store/marketStore'
import { useSessionStore } from '@/store/sessionStore'
import { MarketCard } from '@/components/market/MarketCard'

interface Props {
  match: LiveMatch
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
              {' '}· You called {market.options.find(o => o.id === userOptionId)?.label}
            </span>
          )}
        </p>
      </div>
      <div className="shrink-0">
        {correct === true && (
          <span className="text-[10px] font-black" style={{ color: 'var(--success)' }}>✓ Got it</span>
        )}
        {correct === false && (
          <span className="text-[10px] font-black" style={{ color: 'var(--live)' }}>✗ Miss</span>
        )}
        {correct === null && (
          <span className="text-[10px]" style={{ color: 'var(--dim)' }}>—</span>
        )}
      </div>
    </motion.div>
  )
}

export function NextEventArena({ match }: Props) {
  const { activeMarkets, resolvedMarkets, pendingEventMarkets, spawnMarket, placeConviction, positions } = useMarketStore()
  const { points } = useSessionStore()
  const [lastSpawn, setLastSpawn] = useState(0)

  // Auto-spawn: check every 1.5s, spawn if no open market and 8s cooldown passed
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

  // Initial spawn at 800ms
  useEffect(() => {
    if (match.status === 'LIVE' && activeMarkets.length === 0) {
      const t = setTimeout(() => {
        spawnMarket(match)
        setLastSpawn(Date.now())
      }, 800)
      return () => clearTimeout(t)
    }
  }, [match.status])

  const openMarket = activeMarkets.find(m => m.status === 'OPEN')
  const lockedMarket = activeMarkets.find(m => m.status === 'LOCKED')
  const recentResolved = resolvedMarkets.slice(-4).reverse()

  if (match.status === 'HT') {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: '#f59e0b' }}>Half Time</span>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>New calls open at the second half kickoff</p>
      </div>
    )
  }

  if (match.status === 'FT') return null

  return (
    <div className="space-y-3">
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
          {!openMarket && match.status === 'LIVE' && (
            <span className="text-[10px]" style={{ color: 'var(--dim)' }}>New call soon…</span>
          )}
        </div>
      </div>

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
        ) : lockedMarket ? (
          <motion.div
            key={lockedMarket.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/[0.06] bg-black/20 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
              />
              <span className="text-[10px] uppercase tracking-wider text-amber-400/60">Awaiting result…</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{lockedMarket.question}</p>
          </motion.div>
        ) : match.status === 'LIVE' ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/[0.04] bg-black/10 p-5 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full mx-auto mb-2"
              style={{ background: 'var(--accent)' }}
            />
            <span className="text-xs" style={{ color: 'var(--dim)' }}>Reading the match…</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Resolved call history */}
      {recentResolved.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>
            Past Calls
          </span>
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
