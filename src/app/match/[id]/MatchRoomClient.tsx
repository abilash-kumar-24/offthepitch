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
import { getTeam } from '@/data/teams'
import { isMatchLive, isMatchFinished } from '@/lib/match-engine'
import type { LiveMatch } from '@/types/match'

interface Props {
  initialMatch: LiveMatch
}

const POLL_INTERVAL_LIVE = 8000
const POLL_INTERVAL_IDLE = 30000

// Interpolated live clock — ticks every second between polls
function useLiveClock(matchMinute: number, isLive: boolean): number {
  const [display, setDisplay] = useState(matchMinute)
  const pollTimeRef  = useRef(Date.now())
  const baseMinRef   = useRef(matchMinute)

  useEffect(() => {
    pollTimeRef.current = Date.now()
    baseMinRef.current  = matchMinute
    setDisplay(matchMinute)
  }, [matchMinute])

  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(() => {
      const elapsed = (Date.now() - pollTimeRef.current) / 1000
      // Demo runs at 2s per sim minute; cap extrapolation at +4 min to avoid drift
      const extrapolated = Math.floor(baseMinRef.current + elapsed / 2)
      setDisplay(Math.min(extrapolated, baseMinRef.current + 4))
    }, 1000)
    return () => clearInterval(timer)
  }, [isLive])

  return display
}

// Full-screen goal celebration overlay
function GoalBurst({ scorerName, scoringCode }: { scorerName?: string; scoringCode: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center gap-3"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)' }}
    >
      <motion.span
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: [1.6, 1.3, 1.5], rotate: [15, -8, 10] }}
        transition={{ duration: 0.7, ease: 'backOut' }}
        style={{ fontSize: 72, lineHeight: 1 }}
      >
        ⚽
      </motion.span>

      <motion.p
        initial={{ opacity: 0, y: 16, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, duration: 0.4, ease: 'backOut' }}
        className="font-black text-4xl tracking-widest uppercase"
        style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,200,0,0.5)' }}
      >
        GOAL!
      </motion.p>

      {scorerName && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.35 }}
          className="text-base font-bold"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {scorerName} · {scoringCode}
        </motion.p>
      )}

      {/* Confetti-like radial shimmer */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,220,50,0.15) 0%, transparent 70%)' }}
      />
    </motion.div>
  )
}

export function MatchRoomClient({ initialMatch }: Props) {
  const { currentMatch, pressure, lastGoalFlash, setCurrentMatch, updateCurrentMatch } = useMatchStore()
  const { tickMarkets, clearForMatch, activeMarkets, spawnEventMarket } = useMarketStore()
  const { points, streak, bestStreak, totalCalls, correctCalls, applyResults, resetForMatch } = useSessionStore()
  const { results } = useMarketStore()

  const pollingRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevEventIdsRef = useRef<Set<string>>(new Set(initialMatch.events.map(e => e.id)))
  const matchId = initialMatch.id

  const [goalBurst, setGoalBurst] = useState<{ key: number; scorerName?: string; code: string } | null>(null)

  // Hydrate store on mount
  useEffect(() => {
    setCurrentMatch(initialMatch)
    resetForMatch()
    clearForMatch(matchId)
  }, [matchId])

  // Goal celebration
  useEffect(() => {
    if (!lastGoalFlash) return
    const match = currentMatch ?? initialMatch
    // Find the most recent goal event
    const latestGoal = [...match.events].reverse().find(e =>
      e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL'
    )
    const scoringCode = latestGoal?.side === 'home'
      ? match.homeTeam.code
      : match.awayTeam.code
    const home = getTeam(scoringCode)
    setGoalBurst({ key: lastGoalFlash, scorerName: latestGoal?.playerName, code: home.shortName })
    const t = setTimeout(() => setGoalBurst(null), 2800)
    return () => clearTimeout(t)
  }, [lastGoalFlash])

  // Polling loop
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/match/${matchId}`)
        if (!res.ok) return
        const fresh: LiveMatch = await res.json()

        const freshEvents = fresh.events.filter(e => !prevEventIdsRef.current.has(e.id))
        prevEventIdsRef.current = new Set(fresh.events.map(e => e.id))

        updateCurrentMatch(fresh)
        freshEvents.forEach(e => spawnEventMarket(fresh, e))

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

  const match    = currentMatch ?? initialMatch
  const live     = isMatchLive(match)
  const finished = isMatchFinished(match)
  const liveMinute = useLiveClock(match.minute, live)

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

  // Augment match with interpolated minute for display
  const displayMatch = live ? { ...match, minute: liveMinute } : match

  return (
    <div className={`min-h-screen ${live ? 'match-room-live' : ''}`} style={{ background: 'var(--bg)' }}>

      {/* Goal burst celebration overlay */}
      <AnimatePresence>
        {goalBurst && (
          <GoalBurst
            key={`burst-${goalBurst.key}`}
            scorerName={goalBurst.scorerName}
            scoringCode={goalBurst.code}
          />
        )}
      </AnimatePresence>

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
              <span className="text-[10px] font-bold uppercase tracking-widest tabular-nums" style={{ color: 'var(--live)' }}>
                {liveMinute}&apos;
              </span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Match header with score + points */}
        <MatchHeader match={displayMatch} lastGoalFlash={lastGoalFlash} />

        {/* Upcoming state */}
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
              <PressurePulse match={match} pressure={pressure} />
              <NextEventArena match={match} />
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
              <span className="text-[10px] uppercase tracking-widest block mb-1 font-bold" style={{ color: '#f59e0b' }}>Half Time</span>
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
