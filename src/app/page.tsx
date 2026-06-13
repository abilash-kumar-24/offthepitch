'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MatchCard } from '@/components/lobby/MatchCard'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { TeamBadge } from '@/components/ui/TeamBadge'
import { getTeam } from '@/data/teams'
import type { LiveMatch, MatchEvent } from '@/types/match'
import { isMatchLive, isMatchFinished } from '@/lib/match-engine'

type Filter = 'all' | 'live' | 'today' | 'upcoming'

function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <polygon points="17,2 31,10 31,24 17,32 3,24 3,10" fill="none" stroke="var(--accent)" strokeWidth="1.2" opacity="0.5" />
      <polygon points="17,7 26,12 26,22 17,27 8,22 8,12" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="0.6" opacity="0.8" />
      <circle cx="17" cy="17" r="3.5" fill="var(--accent)" />
    </svg>
  )
}

function eventIcon(e: MatchEvent): string {
  if (e.type === 'GOAL' || e.type === 'PENALTY_GOAL') return '⚽'
  if (e.type === 'OWN_GOAL') return '⚽'
  if (e.type === 'CARD_YELLOW') return '🟨'
  if (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED') return '🟥'
  if (e.type === 'SUB') return '🔄'
  return '•'
}

function DemoShowcase({ match }: { match: LiveMatch }) {
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)
  const recentEvents = match.events.slice(-3).reverse()
  const possession = match.stats?.possession ?? [50, 50]

  return (
    <Link href="/match/wc-demo" className="block">
      <motion.div
        whileHover={{ scale: 1.015, y: -4 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative overflow-hidden rounded-3xl cursor-pointer"
        style={{
          background: `linear-gradient(145deg,
            color-mix(in srgb, ${home.primary} 28%, #080c18) 0%,
            #080c18 42%,
            #080c18 58%,
            color-mix(in srgb, ${away.primary} 28%, #080c18) 100%)`,
          border: `1px solid ${home.primary}70`,
          boxShadow: `0 0 0 1px ${home.primary}22, 0 24px 72px ${home.primary}35, 0 0 100px ${away.primary}12`,
        }}
      >
        {/* Team colour strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${home.primary}, ${away.primary})` }}
        />

        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-3xl"
            style={{ background: home.primary, opacity: 0.18 }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-3xl"
            style={{ background: away.primary, opacity: 0.18 }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-7">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.45)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f87171' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#f87171' }}>
                Live Simulation
              </span>
            </motion.div>
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Click to play →
            </span>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamBadge code={match.homeTeam.code} size="xl" />
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>{home.shortName}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <motion.span
                  key={`h-${match.homeTeam.score}`}
                  initial={{ scale: 1.3, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl sm:text-6xl font-black tabular-nums"
                  style={{ color: home.accent }}
                >
                  {match.homeTeam.score}
                </motion.span>
                <span className="text-3xl font-thin" style={{ color: 'rgba(255,255,255,0.2)' }}>–</span>
                <motion.span
                  key={`a-${match.awayTeam.score}`}
                  initial={{ scale: 1.3, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl sm:text-6xl font-black tabular-nums"
                  style={{ color: away.accent }}
                >
                  {match.awayTeam.score}
                </motion.span>
              </div>

              {/* Live minute */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#f87171' }} />
                <span className="text-[10px] font-bold tabular-nums" style={{ color: '#f87171' }}>
                  {match.minute}&apos;
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamBadge code={match.awayTeam.code} size="xl" />
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>{away.shortName}</span>
            </div>
          </div>

          {/* Possession bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span style={{ color: home.primary }}>{possession[0]}%</span>
              <span>Possession</span>
              <span style={{ color: away.primary }}>{possession[1]}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: '50%' }}
                animate={{ width: `${possession[0]}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${home.primary}CC, ${away.primary}CC)` }}
              />
            </div>
          </div>

          {/* Recent events */}
          {recentEvents.length > 0 && (
            <div className="space-y-1 mb-5">
              {recentEvents.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="w-6 text-right text-[10px] tabular-nums font-semibold shrink-0"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{e.minute}&apos;</span>
                  <span className="text-sm">{eventIcon(e)}</span>
                  <span className="truncate">{e.playerName ?? (e.side === 'home' ? match.homeTeam.code : match.awayTeam.code)}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest text-white"
            style={{
              background: `linear-gradient(135deg, ${home.primary}, ${away.primary})`,
              boxShadow: `0 8px 36px ${home.primary}55`,
            }}
          >
            Jump Into the Simulation ›
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}

function DemoSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="p-6 space-y-4">
        <div className="skeleton h-5 w-36 rounded-full" />
        <div className="flex items-center justify-between gap-4">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="skeleton h-14 w-28 rounded" />
          <div className="skeleton w-16 h-16 rounded-full" />
        </div>
        <div className="skeleton h-1.5 w-full rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-40 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
        <div className="skeleton h-11 w-full rounded-2xl" />
      </div>
    </div>
  )
}

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'live',     label: '🔴 Live' },
  { key: 'today',    label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
]

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="skeleton w-14 h-14 rounded-full" />
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded" />
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="skeleton w-14 h-14 rounded-full" />
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
        </div>
        <div className="skeleton h-2 w-full rounded" />
      </div>
    </div>
  )
}

export default function LobbyPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  async function load() {
    try {
      const res = await fetch('/api/matches')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setMatches(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 15_000)
    return () => clearInterval(id)
  }, [])

  const demo     = useMemo(() => matches.find(m => m.id === 'wc-demo'), [matches])
  const live     = useMemo(() => matches.filter(m => isMatchLive(m) && m.id !== 'wc-demo'), [matches])
  const today    = useMemo(() => matches.filter(m => (m.status === 'UPCOMING' || m.status === 'SCHEDULED') && m.id !== 'wc-demo'), [matches])
  const finished = useMemo(() => matches.filter(m => isMatchFinished(m) && m.id !== 'wc-demo'), [matches])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'live':     return live
      case 'today':    return today
      case 'upcoming': return today
      default:         return matches.filter(m => m.id !== 'wc-demo')
    }
  }, [filter, matches, live, today])

  const showBySection = filter === 'all'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <div>
              <span className="text-sm font-black tracking-tight" style={{ color: 'var(--text)' }}>OffThePitch</span>
              <span className="text-[9px] block uppercase tracking-widest leading-none" style={{ color: 'var(--dim)' }}>World Cup 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {live.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'var(--live-bg)', border: '1px solid var(--live-glow)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--live)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--live)' }}>
                  {live.length} Live
                </span>
              </div>
            )}
            <ThemeToggle />
            <Link
              href="/wth"
              className="text-[10px] uppercase tracking-widest font-semibold transition-colors hidden sm:block"
              style={{ color: 'var(--dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
            >
              WTH?
            </Link>
            <Link
              href="/guide"
              className="text-[10px] uppercase tracking-widest font-semibold transition-colors hidden sm:block"
              style={{ color: 'var(--dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--muted)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
            >
              Guide
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pitch-bg">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: 'var(--hero-1)', opacity: 0.8 }} />
          <div className="orb-2 absolute top-10 right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'var(--hero-2)', opacity: 0.75 }} />
          <div className="orb-3 absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full blur-[100px]"
            style={{ background: 'var(--hero-3)', opacity: 0.6 }} />
          <div className="orb-4 absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'var(--accent-bg)', opacity: 0.5 }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">

            {/* Left: hero text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Top badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-glow)', color: 'var(--accent)' }}
                >
                  ⚽ FIFA World Cup 2026
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1 rounded-full"
                  style={{ background: 'var(--live-bg)', border: '1px solid var(--live-glow)', color: 'var(--live)' }}
                >
                  🇺🇸 USA · 🇨🇦 Canada · 🇲🇽 Mexico
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-5">
                <span className="text-gradient">Off</span>
                <span className="text-gradient-accent">ThePitch</span>
              </h1>
              <p className="text-base sm:text-lg max-w-lg leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
                Back your football instinct with virtual conviction points.
                Live calls every few minutes — next goal, next card, who fires back after conceding.
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                No gambling. No real money. Pure match intelligence.{' '}
                <Link href="/wth" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Wait, what?
                </Link>
              </p>

              {/* Feature pills */}
              <motion.div
                className="flex flex-wrap gap-2 mt-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                {[
                  { label: '⚡ Live Pressure Pulse', accent: true },
                  { label: '🎯 Dynamic Conviction Calls' },
                  { label: '📊 48 Nations' },
                  { label: `🗓️ ${matches.filter(m => m.id !== 'wc-demo').length} Matches` },
                  ...(live.length > 0 ? [{ label: `🔴 ${live.length} Live Now`, hot: true }] : []),
                ].map(stat => (
                  <span
                    key={stat.label}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={stat.hot ? {
                      background: 'var(--live-bg)', border: '1px solid var(--live-glow)', color: 'var(--live)',
                    } : stat.accent ? {
                      background: 'var(--accent-bg)', border: '1px solid var(--accent-glow)', color: 'var(--accent)',
                    } : {
                      background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)',
                    }}
                  >
                    {stat.label}
                  </span>
                ))}
              </motion.div>

              {/* 3-step row — desktop only */}
              <motion.div
                className="hidden lg:grid grid-cols-3 gap-3 mt-7 max-w-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
              >
                {[
                  { n: '1', label: 'Watch live', icon: '📺' },
                  { n: '2', label: 'Make a call', icon: '🎯' },
                  { n: '3', label: 'Track instinct', icon: '📈' },
                ].map(step => (
                  <div
                    key={step.n}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--dim)' }}>Step {step.n}</span>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>{step.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Live demo showcase */}
            <motion.div
              initial={{ opacity: 0, x: 28, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {demo ? <DemoShowcase match={demo} /> : loading ? <DemoSkeleton /> : null}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div
        className="sticky top-[57px] z-40 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 90%, transparent)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-none">
            {FILTER_TABS.map(tab => {
              const count = tab.key === 'live' ? live.length
                          : tab.key === 'today' || tab.key === 'upcoming' ? today.length
                          : matches.filter(m => m.id !== 'wc-demo').length
              const active = filter === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer"
                  style={active ? {
                    background: 'var(--accent-bg)', border: '1px solid var(--accent-glow)', color: 'var(--accent)',
                  } : {
                    background: 'transparent', border: '1px solid transparent', color: 'var(--dim)',
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={active ? {
                        background: 'var(--accent)', color: 'var(--bg)',
                      } : {
                        background: 'var(--surface-2)', color: 'var(--dim)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Match list ──────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-3xl mb-3">📡</p>
            <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>No signal</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Failed to load matches. Check your connection.</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Filtered single-section view */}
        {!loading && !error && !showBySection && (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {filtered.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--dim)' }}>
                  <p className="text-3xl mb-3">⚽</p>
                  <p className="text-sm">No {filter} matches right now</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* "All" — sectioned view (demo lives in the hero, not here) */}
        {!loading && !error && showBySection && (
          <div className="space-y-10">

            {live.length > 0 && (
              <section>
                <SectionHeader label="Live Now" count={live.length} accent="live" icon="🔴" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {live.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                </div>
              </section>
            )}

            {today.length > 0 && (
              <section>
                <SectionHeader label="Today's Matches" count={today.length} icon="📅" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {today.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                </div>
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <SectionHeader label="Full Time" count={finished.length} icon="🏁" dim />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {finished.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                </div>
              </section>
            )}

            {matches.filter(m => m.id !== 'wc-demo').length === 0 && (
              <div className="text-center py-20" style={{ color: 'var(--dim)' }}>
                <p className="text-4xl mb-4">⚽</p>
                <p className="font-bold text-lg mb-1" style={{ color: 'var(--muted)' }}>No matches today</p>
                <p className="text-sm">Check back during the tournament window (June–July 2026)</p>
                <p className="text-sm mt-2">
                  Meanwhile,{' '}
                  <Link href="/match/wc-demo" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    try the simulation ↑
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--dim)' }}>
            Virtual points only · No real money · No gambling
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--dim)', opacity: 0.5 }}>
            Live match data · OffThePitch 2026
          </p>
        </div>
      </main>
    </div>
  )
}

function SectionHeader({
  label, count, icon, accent, dim,
}: {
  label: string; count: number; icon?: string; accent?: 'live' | 'accent'; dim?: boolean
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span
        className="text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: accent === 'live' ? 'var(--live)' : accent === 'accent' ? 'var(--accent)' : dim ? 'var(--dim)' : 'var(--muted)' }}
      >
        {label}
      </span>
      <span
        className="px-1.5 py-0.5 rounded text-[9px] font-bold"
        style={{ background: 'var(--surface-2)', color: 'var(--dim)', border: '1px solid var(--border)' }}
      >
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}
