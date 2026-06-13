'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMatchStore } from '@/store/matchStore'
import { useMarketStore } from '@/store/marketStore'
import { useSessionStore } from '@/store/sessionStore'
import { MatchHeader } from '@/components/match-room/MatchHeader'
import { EventRail } from '@/components/match-room/EventRail'
import { LineupPanel } from '@/components/match-room/LineupPanel'
import { PressurePulse } from '@/components/pulse/PressurePulse'
import { NextEventArena } from '@/components/arena/NextEventArena'
import { ConvictionMeter } from '@/components/market/ConvictionMeter'
import { PostMatchSummary } from '@/components/post-match/PostMatchSummary'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { isMatchLive, isMatchFinished } from '@/lib/match-engine'
import type { LiveMatch } from '@/types/match'

interface Props {
  initialMatch: LiveMatch
}

const POLL_INTERVAL_LIVE = 8000
const POLL_INTERVAL_IDLE = 30000

export function MatchRoomClient({ initialMatch }: Props) {
  const { currentMatch, pressure, lastGoalFlash, setCurrentMatch, updateCurrentMatch } = useMatchStore()
  const { tickMarkets, clearForMatch, activeMarkets } = useMarketStore()
  const { points, streak, bestStreak, totalCalls, correctCalls, applyResults, resetForMatch } = useSessionStore()
  const { results } = useMarketStore()

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchId = initialMatch.id

  // Hydrate store on mount
  useEffect(() => {
    setCurrentMatch(initialMatch)
    resetForMatch()
    clearForMatch(matchId)
  }, [matchId])

  // Polling loop
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/match/${matchId}`)
        if (!res.ok) return
        const fresh: LiveMatch = await res.json()
        updateCurrentMatch(fresh)

        // Tick market engine
        const newResults = tickMarkets(fresh, streak)
        if (newResults.length > 0) applyResults(newResults)
      } catch {
        // Silent — keep showing last known state
      }
    }

    const match = currentMatch ?? initialMatch
    const interval = isMatchLive(match) ? POLL_INTERVAL_LIVE : POLL_INTERVAL_IDLE

    pollingRef.current = setInterval(poll, interval)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [currentMatch?.status, matchId, streak])

  const match = currentMatch ?? initialMatch
  const live = isMatchLive(match)
  const finished = isMatchFinished(match)

  // Post-match view
  if (finished) {
    return (
      <PostMatchSummary
        match={match}
        results={results}
        points={points}
        streak={streak}
        bestStreak={bestStreak}
        totalCalls={totalCalls}
        correctCalls={correctCalls}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top nav */}
      <div
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="transition-colors text-sm font-medium"
            style={{ color: 'var(--dim)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
          >
            ←
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--dim)' }}>
            {match.homeTeam.code} vs {match.awayTeam.code}
          </span>
          {live && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'var(--live-bg)', border: '1px solid var(--live-glow)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--live)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--live)' }}>Live</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Match header with score */}
        <MatchHeader match={match} lastGoalFlash={lastGoalFlash} />

        {/* Upcoming locked state */}
        {!live && !finished && (
          <>
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-[10px] uppercase tracking-widest block mb-2 font-semibold" style={{ color: 'var(--dim)' }}>
                Room Opens at Kickoff
              </span>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Live calls and pressure tracking begin at kickoff</p>
            </div>
            <LineupPanel match={match} />
          </>
        )}

        {/* Live content */}
        <AnimatePresence>
          {live && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Pressure Pulse */}
              <PressurePulse match={match} pressure={pressure} />

              {/* Next Event Arena */}
              <NextEventArena match={match} />

              {/* Session conviction meter */}
              <ConvictionMeter
                points={points}
                streak={streak}
                bestStreak={bestStreak}
                totalCalls={totalCalls}
                correctCalls={correctCalls}
              />

              {/* Event rail */}
              <EventRail match={match} />

              {/* Lineup (collapsible) */}
              <LineupPanel match={match} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* HT state */}
        {match.status === 'HT' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <span className="text-[10px] uppercase tracking-widest block mb-1 font-bold" style={{ color: '#f59e0b' }}>
                Half Time
              </span>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>New calls open at the second half kickoff</p>
            </div>
            <PressurePulse match={match} pressure={pressure} />
            <ConvictionMeter
              points={points}
              streak={streak}
              bestStreak={bestStreak}
              totalCalls={totalCalls}
              correctCalls={correctCalls}
            />
            <EventRail match={match} />
            <LineupPanel match={match} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
