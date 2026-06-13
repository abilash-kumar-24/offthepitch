'use client'
import { create } from 'zustand'
import type { Market, MarketType, UserPosition, MarketResult } from '@/types/market'
import { resolveMarket, selectNextMarket, getMultiplier, getStreakMultiplier } from '@/lib/market-engine'
import type { LiveMatch } from '@/types/match'

interface MarketStore {
  activeMarkets: Market[]
  resolvedMarkets: Market[]
  positions: UserPosition[]
  results: MarketResult[]
  recentTypes: MarketType[]

  spawnMarket: (match: LiveMatch) => void
  placeConviction: (marketId: string, optionId: string, amount: number) => void
  tickMarkets: (match: LiveMatch, streak: number) => MarketResult[]
  clearForMatch: (matchId: string) => void
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  activeMarkets: [],
  resolvedMarkets: [],
  positions: [],
  results: [],
  recentTypes: [],

  spawnMarket: (match) => {
    const { activeMarkets, recentTypes } = get()
    // Don't open new market if one is already open
    if (activeMarkets.some(m => m.status === 'OPEN')) return
    if (match.status !== 'LIVE') return

    const market = selectNextMarket(match, recentTypes)
    set(s => ({
      activeMarkets: [...s.activeMarkets, market],
      recentTypes: [...s.recentTypes.slice(-4), market.type],
    }))
  },

  placeConviction: (marketId, optionId, amount) => {
    const pos: UserPosition = { marketId, optionId, conviction: amount, placedAt: Date.now() }
    set(s => ({
      positions: [...s.positions.filter(p => p.marketId !== marketId), pos],
    }))
  },

  tickMarkets: (match, streak) => {
    const { activeMarkets, positions, results } = get()
    const newResults: MarketResult[] = []
    const updatedMarkets: Market[] = []

    for (const market of activeMarkets) {
      const now = Date.now()

      // Lock expired open markets
      if (market.status === 'OPEN' && now >= market.locksAt) {
        updatedMarkets.push({ ...market, status: 'LOCKED' })
        continue
      }

      // Try to resolve locked markets
      if (market.status === 'LOCKED') {
        const eventsSinceOpen = match.events.filter(
          e => e.minute >= market.minuteContext
        )
        const outcome = resolveMarket(market, eventsSinceOpen, match.minute, match)

        if (outcome !== null) {
          const resolved = { ...market, status: 'RESOLVED' as const, resolvedAt: now, resolvedOutcome: outcome }
          updatedMarkets.push(resolved)

          const pos = positions.find(p => p.marketId === market.id)
          if (pos) {
            const correct = pos.optionId === outcome
            const option = market.options.find(o => o.id === pos.optionId)
            const multiplier = correct ? getMultiplier(option?.difficulty ?? 2) * getStreakMultiplier(streak) : 0
            const pointsWon = correct ? Math.round(pos.conviction * multiplier) : 0
            const pointsLost = correct ? 0 : pos.conviction

            const result: MarketResult = {
              marketId: market.id,
              question: market.question,
              userOptionId: pos.optionId,
              userOptionLabel: option?.label ?? pos.optionId,
              correctOptionId: outcome,
              correct,
              conviction: pos.conviction,
              pointsWon,
              pointsLost,
              multiplier,
            }
            newResults.push(result)
          }
          continue
        }
        updatedMarkets.push(market)
        continue
      }

      updatedMarkets.push(market)
    }

    const resolved = updatedMarkets.filter(m => m.status === 'RESOLVED')
    const active = updatedMarkets.filter(m => m.status !== 'RESOLVED')

    set(s => ({
      activeMarkets: active,
      resolvedMarkets: [...s.resolvedMarkets, ...resolved],
      results: [...results, ...newResults],
    }))

    return newResults
  },

  clearForMatch: (_matchId) => {
    set({ activeMarkets: [], resolvedMarkets: [], positions: [], results: [], recentTypes: [] })
  },
}))
