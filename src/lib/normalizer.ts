import type { LiveMatch, MatchStats, MatchEvent, MatchStatus, EventType, TeamSide } from '@/types/match'

// ── football-data.org v4 shape ────────────────────────────────────────────────

interface FDScore { home: number | null; away: number | null }
interface FDTeam { tla: string; name: string }
interface FDGoal { minute: number; team: FDTeam; scorer: { name: string }; assist?: { name: string }; type: string }
interface FDBooking { minute: number; team: FDTeam; player: { name: string }; card: string }

interface FDMatch {
  id: number
  status: string
  minute?: number
  score: { fullTime: FDScore; halfTime: FDScore }
  homeTeam: FDTeam
  awayTeam: FDTeam
  utcDate: string
  goals?: FDGoal[]
  bookings?: FDBooking[]
  venue?: string
}

function fdStatusToInternal(s: string): MatchStatus {
  switch (s) {
    case 'IN_PLAY': return 'LIVE'
    case 'PAUSED': return 'HT'
    case 'FINISHED': return 'FT'
    case 'TIMED': return 'UPCOMING'
    case 'SCHEDULED': return 'SCHEDULED'
    case 'SUSPENDED': return 'HT'
    case 'EXTRA_TIME': return 'ET'
    case 'PENALTY_SHOOTOUT': return 'PEN'
    default: return 'SCHEDULED'
  }
}

function fdGoalToEvent(g: FDGoal, homeCode: string): MatchEvent {
  const side: TeamSide = g.team.tla === homeCode ? 'home' : 'away'
  const type: EventType = g.type === 'OWN_GOAL' ? 'OWN_GOAL' : g.type === 'PENALTY' ? 'PENALTY_GOAL' : 'GOAL'
  return {
    id: `goal-${g.minute}-${g.team.tla}`,
    minute: g.minute,
    type,
    side,
    playerName: g.scorer?.name,
    assistName: g.assist?.name,
  }
}

function fdBookingToEvent(b: FDBooking, homeCode: string): MatchEvent {
  const side: TeamSide = b.team.tla === homeCode ? 'home' : 'away'
  const type: EventType = b.card === 'RED_CARD' ? 'CARD_RED' : b.card === 'YELLOW_RED_CARD' ? 'CARD_YELLOW_RED' : 'CARD_YELLOW'
  return {
    id: `card-${b.minute}-${b.team.tla}`,
    minute: b.minute,
    type,
    side,
    playerName: b.player?.name,
  }
}

function emptyStats(): MatchStats {
  return { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], corners: [0, 0], yellowCards: [0, 0], redCards: [0, 0], dangerousAttacks: [0, 0] }
}

export function normalizeFDMatch(raw: FDMatch): LiveMatch {
  const homeCode = raw.homeTeam.tla
  const awayCode = raw.awayTeam.tla
  const goals = (raw.goals ?? []).map(g => fdGoalToEvent(g, homeCode))
  const bookings = (raw.bookings ?? []).map(b => fdBookingToEvent(b, homeCode))
  const events: MatchEvent[] = [...goals, ...bookings].sort((a, b) => a.minute - b.minute)

  const homeScore = raw.score.fullTime.home ?? 0
  const awayScore = raw.score.fullTime.away ?? 0

  const yellowHome = bookings.filter(e => e.side === 'home' && e.type === 'CARD_YELLOW').length
  const yellowAway = bookings.filter(e => e.side === 'away' && e.type === 'CARD_YELLOW').length
  const redHome = bookings.filter(e => e.side === 'home' && (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED')).length
  const redAway = bookings.filter(e => e.side === 'away' && (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED')).length

  return {
    id: String(raw.id),
    status: fdStatusToInternal(raw.status),
    minute: raw.minute ?? 0,
    homeTeam: { code: homeCode, name: raw.homeTeam.name, score: homeScore },
    awayTeam: { code: awayCode, name: raw.awayTeam.name, score: awayScore },
    events,
    stats: { ...emptyStats(), yellowCards: [yellowHome, yellowAway], redCards: [redHome, redAway] },
    kickoffTime: raw.utcDate,
    venue: raw.venue,
  }
}

export function normalizeFDMatchList(data: { matches: FDMatch[] }): LiveMatch[] {
  return data.matches.map(normalizeFDMatch)
}
