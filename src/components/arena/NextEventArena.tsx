'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getTeam } from '@/data/teams'
import type { Market } from '@/types/market'
import type { LiveMatch } from '@/types/match'
import { useMarketStore } from '@/store/marketStore'
import { useSessionStore } from '@/store/sessionStore'
import { MarketCard } from '@/components/market/MarketCard'

interface Props {
  match: LiveMatch
}

export function NextEventArena({ match }: Props) {
  const { activeMarkets, spawnMarket, placeConviction, positions } = useMarketStore()
  const { points } = useSessionStore()
  const [lastSpawn, setLastSpawn] = useState(0)

  // Auto-spawn markets every 30-90 seconds
  useEffect(() => {
    if (match.status !== 'LIVE') return
    const interval = setInterval(() => {
      const openMarkets = activeMarkets.filter(m => m.status === 'OPEN')
      if (openMarkets.length === 0 && Date.now() - lastSpawn > 20000) {
        spawnMarket(match)
        setLastSpawn(Date.now())
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [match, activeMarkets, spawnMarket, lastSpawn])

  // Initial spawn
  useEffect(() => {
    if (match.status === 'LIVE' && activeMarkets.length === 0) {
      const t = setTimeout(() => {
        spawnMarket(match)
        setLastSpawn(Date.now())
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [match.status])

  const openMarket = activeMarkets.find(m => m.status === 'OPEN')
  const lockedMarket = activeMarkets.find(m => m.status === 'LOCKED')

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

  if (match.status === 'FT') {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>Next Event Arena</span>
        {!openMarket && match.status === 'LIVE' && (
          <span className="text-[10px]" style={{ color: 'var(--dim)' }}>New call soon…</span>
        )}
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
              <span className="text-[10px] uppercase tracking-wider text-amber-400/60">Awaiting resolution</span>
            </div>
            <p className="text-sm text-white/50">{lockedMarket.question}</p>
          </motion.div>
        ) : match.status === 'LIVE' ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/[0.04] bg-black/10 p-5 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-white/20 mx-auto mb-2"
            />
            <span className="text-xs text-white/25">Reading the match…</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
