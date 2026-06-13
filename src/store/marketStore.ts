'use client'
import { create } from 'zustand'
import type { Market, MarketType, UserPosition, MarketResult } from '@/types/market'
import type { MatchEvent, LiveMatch } from '@/types/match'
import {
  resolveMarket, selectNextMarket, getMultiplier, getStreakMultiplier,
  buildGoalResponseMarket, buildBraceHuntMarket,
  buildYellowWatchMarket, buildRedAdvantageMarket, buildSubSparkMarket,
} from '@/lib/market-engine'

interface MarketStore {
  activeMarkets: Market[]
  resolvedMarkets: Market[]
  positions: UserPosition[]
  results: MarketResult[]
  recentTypes: MarketType[]
  triggeredEventIds: string[]
  pendingEventMarkets: Market[]

  spawnMarket: (match: LiveMatch) => void
  spawnEventMarket: (match: LiveMatch, event: MatchEvent) => void
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
  triggeredEventIds: [],
  pendingEventMarkets: [],

  spawnMarket: (match) => {
    const { activeMarkets, recentTypes, pendingEventMarkets } = get()
    if (activeMarkets.some(m => m.status === 'OPEN')) return
    if (match.status !== 'LIVE') return

    // Drain event-triggered queue first
    if (pendingEventMarkets.length > 0) {
      const [market, ...rest] = pendingEventMarkets
      set(s => ({
        activeMarkets: [...s.activeMarkets, market],
        pendingEventMarkets: rest,
        recentTypes: [...s.recentTypes.slice(-4), market.type],
      }))
      return
    }

    const market = selectNextMarket(match, recentTypes)
    set(s => ({
      activeMarkets: [...s.activeMarkets, market],
      recentTypes: [...s.recentTypes.slice(-4), market.type],
    }))
  },

  spawnEventMarket: (match, event) => {
    const { triggeredEventIds } = get()
    if (triggeredEventIds.includes(event.id)) return

    const markets: Market[] = []

    if (event.type === 'GOAL' || event.type === 'PENALTY_GOAL') {
      markets.push(buildGoalResponseMarket(match, event))
      if (event.playerName) markets.push(buildBraceHuntMarket(match, event))
    } else if (event.type === 'CARD_YELLOW') {
      markets.push(buildYellowWatchMarket(match, event))
    } else if (event.type === 'CARD_RED' || event.type === 'CARD_YELLOW_RED') {
      markets.push(buildRedAdvantageMarket(match, event))
    } else if (event.type === 'SUB') {
      markets.push(buildSubSparkMarket(match, event))
    }

    if (markets.length === 0) return

    set(s => ({
      triggeredEventIds: [...s.triggeredEventIds, event.id],
      pendingEventMarkets: [...s.pendingEventMarkets, ...markets].slice(-5),
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

      if (market.status === 'OPEN' && now >= market.locksAt) {
        updatedMarkets.push({ ...market, status: 'LOCKED' })
        continue
      }

      if (market.status === 'LOCKED') {
        const eventsSinceOpen = match.events.filter(e => e.minute >= market.minuteContext)
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

            newResults.push({
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
            })
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
    set({
      activeMarkets: [],
      resolvedMarkets: [],
      positions: [],
      results: [],
      recentTypes: [],
      triggeredEventIds: [],
      pendingEventMarkets: [],
    })
  },
}))
