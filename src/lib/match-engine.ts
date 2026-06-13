import type { LiveMatch, MatchEvent, PressureState, TeamSide } from '@/types/match'

// ── Pressure score (0–100 per side) ──────────────────────────────────────────
// Derived from possession, recent events, scoreline, and match minute.
// This runs client-side so the pulse is always animating.

const EVENT_WEIGHTS: Partial<Record<MatchEvent['type'], number>> = {
  GOAL: 40,
  PENALTY_GOAL: 35,
  OWN_GOAL: 30,
  CARD_RED: 25,
  CARD_YELLOW_RED: 25,
  CARD_YELLOW: 8,
  VAR_REVIEW: 15,
  VAR_OVERTURNED: 20,
  DANGEROUS_ATTACK: 5,
  CORNER: 3,
  SUB: 2,
}

export function computePressure(match: LiveMatch, prevState: PressureState | null): PressureState {
  const { stats, events, minute, status } = match
  if (status === 'UPCOMING' || status === 'SCHEDULED') {
    return { homePressure: 50, awayPressure: 50, tension: 0, momentum: null, lastShockwave: null, shockwaveAt: 0 }
  }

  // Base from possession
  const [homePoss] = stats.possession
  let home = homePoss
  let away = 100 - homePoss

  // Recent events in last 5 minutes
  const recentCutoff = minute - 5
  const recent = events.filter(e => e.minute >= recentCutoff)
  for (const e of recent) {
    const decay = Math.max(0, 1 - (minute - e.minute) / 5)
    const w = (EVENT_WEIGHTS[e.type] ?? 0) * decay
    if (e.side === 'home') home += w
    else away += w
  }

  // Normalize to 0–100 keeping it relative
  const total = home + away
  const homePressure = Math.round((home / total) * 100)
  const awayPressure = 100 - homePressure

  // Tension: peaks when close score, late minute, high event density
  const scoreDiff = Math.abs(match.homeTeam.score - match.awayTeam.score)
  const lateFactor = minute > 70 ? (minute - 70) / 20 : 0
  const closeFactor = scoreDiff === 0 ? 1 : scoreDiff === 1 ? 0.6 : 0.2
  const tension = Math.min(100, Math.round((lateFactor * 60 + closeFactor * 40) + recent.length * 5))

  // Momentum: side with higher recent event weight
  const homeRecent = recent.filter(e => e.side === 'home').reduce((acc, e) => acc + (EVENT_WEIGHTS[e.type] ?? 0), 0)
  const awayRecent = recent.filter(e => e.side === 'away').reduce((acc, e) => acc + (EVENT_WEIGHTS[e.type] ?? 0), 0)
  const momentum: TeamSide | null = homeRecent > awayRecent + 5 ? 'home' : awayRecent > homeRecent + 5 ? 'away' : null

  // Shockwave: detect new major events since last state
  const majorTypes: MatchEvent['type'][] = ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL', 'CARD_RED', 'CARD_YELLOW_RED', 'VAR_OVERTURNED']
  const prevShockwave = prevState?.lastShockwave ?? null
  const prevId = prevShockwave?.id ?? ''
  const latestMajor = [...events].reverse().find(e => majorTypes.includes(e.type))
  const newShockwave = latestMajor && latestMajor.id !== prevId ? latestMajor : prevShockwave

  return {
    homePressure,
    awayPressure,
    tension,
    momentum,
    lastShockwave: newShockwave ?? null,
    shockwaveAt: newShockwave && newShockwave.id !== prevId ? Date.now() : (prevState?.shockwaveAt ?? 0),
  }
}

// ── Match phase helpers ───────────────────────────────────────────────────────

export function matchPhaseLabel(match: LiveMatch): string {
  switch (match.status) {
    case 'LIVE': {
      if (match.minute >= 45 && match.minuteExtra) return `45+${match.minuteExtra}'`
      if (match.minute >= 90 && match.minuteExtra) return `90+${match.minuteExtra}'`
      return `${match.minute}'`
    }
    case 'HT': return 'HT'
    case 'ET': return `ET ${match.minute}'`
    case 'PEN': return 'PEN'
    case 'FT': return 'FT'
    case 'UPCOMING': return 'Upcoming'
    case 'SCHEDULED': return 'Scheduled'
    case 'CANCELLED': return 'Cancelled'
    default: return ''
  }
}

export function isMatchLive(match: LiveMatch): boolean {
  return match.status === 'LIVE' || match.status === 'HT' || match.status === 'ET' || match.status === 'PEN'
}

export function isMatchFinished(match: LiveMatch): boolean {
  return match.status === 'FT'
}

export function minutesSinceEvent(event: MatchEvent, currentMinute: number): number {
  return currentMinute - event.minute
}
