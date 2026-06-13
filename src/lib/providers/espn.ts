import type { LiveMatch, MatchEvent, MatchStats, MatchStatus, EventType, TeamSide, LineupPlayer } from '@/types/match'

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world'

// ── ESPN abbreviation → our code (mismatches only) ───────────────────────────
const CODE_MAP: Record<string, string> = {
  SKO: 'KOR',  // South Korea (ESPN sometimes)
  BOS: 'BIH',  // Bosnia-Herzegovina
  PAR: 'PRY',  // Paraguay
  CUR: 'CUW',  // Curaçao
  CAP: 'CPV',  // Cape Verde
  HAT: 'HAI',  // Haiti
  DRC: 'COD',  // DR Congo
  TKY: 'TUR',  // Türkiye (unlikely but safe)
  NZE: 'NZL',  // New Zealand (unlikely but safe)
}
function toCode(abbr: string): string {
  return CODE_MAP[abbr] ?? abbr
}

// ── Status mapping ────────────────────────────────────────────────────────────
function toStatus(name: string): MatchStatus {
  switch (name) {
    case 'STATUS_SCHEDULED':               return 'UPCOMING'
    case 'STATUS_FIRST_HALF':              return 'LIVE'
    case 'STATUS_HALFTIME':                return 'HT'
    case 'STATUS_SECOND_HALF':             return 'LIVE'
    case 'STATUS_END_OF_REGULATION':       return 'LIVE'
    case 'STATUS_EXTRA_TIME_FIRST_HALF':
    case 'STATUS_EXTRA_TIME_SECOND_HALF':  return 'ET'
    case 'STATUS_EXTRA_TIME_HALFTIME':     return 'HT'
    case 'STATUS_PENALTY_SHOOTOUT':        return 'PEN'
    case 'STATUS_FINAL':
    case 'STATUS_FULL_TIME':               return 'FT'
    case 'STATUS_POSTPONED':               return 'POSTPONED'
    case 'STATUS_CANCELED':                return 'CANCELLED'
    case 'STATUS_SUSPENDED':               return 'HT'
    default:                               return 'SCHEDULED'
  }
}

// ── Event type mapping ────────────────────────────────────────────────────────
interface ESPNDetail {
  type: { id: string; text: string }
  clock: { value: number; displayValue: string }
  team: { id: string; abbreviation?: string }
  athletesInvolved?: Array<{
    displayName?: string
    shortName?: string
    fullName?: string
    athlete?: { displayName?: string } // older response shape fallback
  }>
  scoringPlay?: boolean
  yellowCard?: boolean
  redCard?: boolean
  penaltyKick?: boolean
  ownGoal?: boolean
}

function parseMinute(displayValue: string): number {
  // "9'", "45+2'", "87'" etc.
  const clean = displayValue.replace("'", '').trim()
  const parts = clean.split('+')
  return parseInt(parts[0]) || 0
}

function detailToEvent(d: ESPNDetail, homeTeamId: string, idx: number): MatchEvent {
  const side: TeamSide = d.team.id === homeTeamId ? 'home' : 'away'

  let type: EventType
  if (d.redCard)                            type = 'CARD_RED'
  else if (d.yellowCard)                    type = 'CARD_YELLOW'
  else if (d.scoringPlay && d.ownGoal)      type = 'OWN_GOAL'
  else if (d.scoringPlay && d.penaltyKick)  type = 'PENALTY_GOAL'
  else if (d.scoringPlay)                   type = 'GOAL'
  else                                      type = 'SUB'

  const minute = parseMinute(d.clock.displayValue) || Math.floor((d.clock.value ?? 0) / 60)

  return {
    id: `espn-${idx}-${d.clock.value}`,
    minute,
    type,
    side,
    playerName: d.athletesInvolved?.[0]?.displayName
      ?? d.athletesInvolved?.[0]?.athlete?.displayName,
  }
}

// ── keyEvents from /summary — richer than scoreboard details, includes subs ──
interface ESPNKeyEvent {
  id: string
  type: { id: string; text: string; type: string }
  clock?: { value: number; displayValue: string }
  period?: { number: number }
  team?: { id: string; displayName?: string }
  participants?: Array<{ athlete: { id: string; displayName?: string } }>
  text?: string
  scoringPlay?: boolean
}

function keyEventToMatchEvent(
  e: ESPNKeyEvent,
  homeTeamId: string,
  idx: number,
): MatchEvent | null {
  const typeSlug = e.type?.type ?? ''
  const minute   = parseMinute(e.clock?.displayValue ?? '')
              || Math.floor((e.clock?.value ?? 0) / 60)
  const side: TeamSide = e.team?.id === homeTeamId ? 'home' : 'away'
  const p0 = e.participants?.[0]?.athlete?.displayName
  const p1 = e.participants?.[1]?.athlete?.displayName

  let type: EventType
  let playerName: string | undefined = p0
  let assistName: string | undefined

  switch (typeSlug) {
    case 'goal':
      type = 'GOAL'; assistName = p1; break
    case 'own-goal':
      type = 'OWN_GOAL'; break
    case 'penalty-goal':
    case 'penalty-converted':
      type = 'PENALTY_GOAL'; assistName = p1; break
    case 'yellow-card':
      type = 'CARD_YELLOW'; break
    case 'red-card':
      type = 'CARD_RED'; break
    case 'yellow-red-card':
      type = 'CARD_YELLOW_RED'; break
    case 'var---red-card-upgrade':
    case 'var-red-card-upgrade':
      type = 'CARD_RED'; break
    case 'substitution':
      type = 'SUB'
      playerName = p0   // coming ON
      assistName = p1   // going OFF
      break
    default:
      return null   // skip kickoffs, delays, halftimes
  }

  // skip events with no minute (phase markers)
  if (minute === 0 && typeSlug !== 'goal' && typeSlug !== 'own-goal') return null

  return {
    id: `ke-${idx}-${e.id}`,
    minute,
    type,
    side,
    playerName,
    assistName,
  }
}

// ── Roster → lineup array ──────────────────────────────────────────────────────
interface ESPNRosterEntry {
  starter?: boolean
  subbedIn?: boolean
  subbedOut?: boolean
  jersey?: string
  position?: { abbreviation?: string }
  athlete?: { displayName?: string; fullName?: string }
}
interface ESPNRoster {
  homeAway: string
  roster?: ESPNRosterEntry[]
  athletes?: ESPNRosterEntry[]
}

function parseLineups(rosters: ESPNRoster[]): { home: LineupPlayer[]; away: LineupPlayer[] } {
  const result = { home: [] as LineupPlayer[], away: [] as LineupPlayer[] }
  for (const roster of rosters) {
    const side = roster.homeAway as 'home' | 'away'
    if (side !== 'home' && side !== 'away') continue
    const entries = roster.roster ?? roster.athletes ?? []
    result[side] = entries.map(a => ({
      name:      a.athlete?.displayName ?? a.athlete?.fullName ?? '?',
      jersey:    a.jersey,
      position:  a.position?.abbreviation,
      starter:   a.starter ?? false,
      subbedIn:  a.subbedIn ?? false,
      subbedOut: a.subbedOut ?? false,
    }))
  }
  return result
}

// ── Stats from /summary ───────────────────────────────────────────────────────
interface ESPNStat { name: string; displayValue: string }

function parseStats(
  homeStats: ESPNStat[],
  awayStats: ESPNStat[],
): MatchStats {
  function n(stats: ESPNStat[], key: string): number {
    const s = stats.find(x => x.name === key)
    return s ? parseFloat(s.displayValue) || 0 : 0
  }
  const homePoss = n(homeStats, 'possessionPct') || 50
  return {
    possession:     [Math.round(homePoss), Math.round(100 - homePoss)],
    shots:          [n(homeStats, 'totalShots'),    n(awayStats, 'totalShots')],
    shotsOnTarget:  [n(homeStats, 'shotsOnTarget'), n(awayStats, 'shotsOnTarget')],
    corners:        [n(homeStats, 'wonCorners'),    n(awayStats, 'wonCorners')],
    yellowCards:    [n(homeStats, 'yellowCards'),   n(awayStats, 'yellowCards')],
    redCards:       [n(homeStats, 'redCards'),      n(awayStats, 'redCards')],
    dangerousAttacks: [0, 0],
  }
}

function emptyStats(): MatchStats {
  return {
    possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0],
    corners: [0, 0], yellowCards: [0, 0], redCards: [0, 0], dangerousAttacks: [0, 0],
  }
}

// ── Normalise a single ESPN competition object → LiveMatch ────────────────────
interface ESPNComp {
  id: string
  date: string
  status: {
    clock: number
    displayClock: string
    period: number
    type: { name: string; detail?: string }
  }
  competitors: Array<{
    id: string
    homeAway: 'home' | 'away'
    score: string
    team: { id: string; abbreviation: string; displayName: string }
  }>
  details?: ESPNDetail[]
  venue?: { fullName?: string; address?: { city?: string } }
  notes?: Array<{ headline?: string }>
}

function compToMatch(comp: ESPNComp, stats?: MatchStats): LiveMatch {
  const home = comp.competitors.find(c => c.homeAway === 'home')!
  const away = comp.competitors.find(c => c.homeAway === 'away')!
  const homeId = home.id
  const events: MatchEvent[] = (comp.details ?? []).map((d, i) => detailToEvent(d, homeId, i))

  const statusName = comp.status.type.name
  const status = toStatus(statusName)

  // minute: ESPN provides clock in seconds, displayClock as "87'"
  const minute = parseMinute(comp.status.displayClock) || Math.floor((comp.status.clock ?? 0) / 60)

  // Group from notes headline (ESPN sometimes has "Group A" etc.)
  const group = comp.notes?.find(n => /group/i.test(n.headline ?? ''))?.headline

  return {
    id: comp.id,
    status,
    minute,
    homeTeam: { code: toCode(home.team.abbreviation), name: home.team.displayName, score: parseInt(home.score) || 0 },
    awayTeam: { code: toCode(away.team.abbreviation), name: away.team.displayName, score: parseInt(away.score) || 0 },
    events,
    stats: stats ?? emptyStats(),
    kickoffTime: comp.date,
    venue: comp.venue?.fullName ?? comp.venue?.address?.city,
    groupStage: group,
  }
}

// ── Fetch today's + next 7 days of WC matches ─────────────────────────────────
export async function fetchESPNMatches(): Promise<LiveMatch[]> {
  const today = new Date()
  const end   = new Date(today.getTime() + 7 * 86_400_000)
  const fmt   = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const url   = `${BASE}/scoreboard?dates=${fmt(today)}-${fmt(end)}&limit=50`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`ESPN scoreboard ${res.status}`)
  const data = await res.json()

  const matches: LiveMatch[] = []
  for (const event of data.events ?? []) {
    const comp: ESPNComp = { id: event.id, date: event.date, ...event.competitions?.[0] }
    if (!comp.competitors?.length) continue
    try {
      matches.push(compToMatch(comp))
    } catch {
      // skip malformed entries
    }
  }
  return matches
}

// ── Fetch a single live match with full stats ─────────────────────────────────
export async function fetchESPNMatch(eventId: string): Promise<LiveMatch | null> {
  // Fetch scoreboard for this event (events can appear in the scoreboard)
  // and summary for statistics - both in parallel
  const [sbRes, sumRes] = await Promise.allSettled([
    fetch(`${BASE}/scoreboard?events=${eventId}`, { next: { revalidate: 0 } }),
    fetch(`${BASE}/summary?event=${eventId}`,     { next: { revalidate: 0 } }),
  ])

  // Parse summary — stats + keyEvents + rosters + home team ID (authoritative source)
  let stats: MatchStats | undefined
  let keyEvents: MatchEvent[] = []
  let lineups: { home: LineupPlayer[]; away: LineupPlayer[] } | undefined
  let sumData: Record<string, unknown> | undefined
  let homeTeamId = ''       // resolved from summary header first (most reliable)
  let summaryComp: ESPNComp | undefined  // fallback match data if scoreboard misses

  if (sumRes.status === 'fulfilled' && sumRes.value.ok) {
    try {
      sumData = await sumRes.value.json() as Record<string, unknown>

      // Stats
      const bsTeams = (sumData.boxscore as { teams?: Array<{ homeAway: string; statistics: ESPNStat[] }> })?.teams ?? []
      const homeStats = bsTeams.find(t => t.homeAway === 'home')?.statistics ?? bsTeams[0]?.statistics ?? []
      const awayStats = bsTeams.find(t => t.homeAway === 'away')?.statistics ?? bsTeams[1]?.statistics ?? []
      stats = parseStats(homeStats, awayStats)

      // Home team ID from summary header — reliable even for completed/past matches
      const headerComp = (sumData.header as { competitions?: ESPNComp[] })?.competitions?.[0]
      if (headerComp) {
        homeTeamId = headerComp.competitors?.find(c => c.homeAway === 'home')?.id ?? ''
        summaryComp = {
          id: eventId,
          date: headerComp.date ?? '',
          status: headerComp.status,
          competitors: headerComp.competitors,
          details: [],
          venue: headerComp.venue,
        }
      }

      // Lineups from rosters
      const rosters = (sumData.rosters as ESPNRoster[] | undefined) ?? []
      if (rosters.length > 0) lineups = parseLineups(rosters)
    } catch {
      // stats/lineups unavailable
    }
  }

  // Parse match from scoreboard (preferred for live matches — has up-to-date clock/status)
  let match: LiveMatch | null = null

  if (sbRes.status === 'fulfilled' && sbRes.value.ok) {
    try {
      const sbData = await sbRes.value.json()
      // Only trust the scoreboard event if it's actually the one we want
      const event = sbData.events?.find((e: { id: string }) => e.id === eventId)
      if (event) {
        const comp: ESPNComp = { id: event.id, date: event.date, ...event.competitions?.[0] }
        // If we already have homeTeamId from summary, keep it; otherwise derive from scoreboard
        if (!homeTeamId) {
          homeTeamId = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home')?.id ?? ''
        }
        match = compToMatch(comp, stats)
      }
    } catch {
      // fall through
    }
  }

  // Fallback: build match from summary header (covers completed/older matches)
  if (!match && summaryComp) {
    try {
      match = compToMatch(summaryComp, stats)
    } catch {
      // give up
    }
  }

  if (!match) return null

  // keyEvents from summary — richer than scoreboard details, includes subs with both players
  if (sumData && homeTeamId) {
    try {
      const rawKeyEvents = (sumData.keyEvents as ESPNKeyEvent[] | undefined) ?? []
      const parsed = rawKeyEvents
        .map((e, i) => keyEventToMatchEvent(e, homeTeamId, i))
        .filter((e): e is MatchEvent => e !== null)
        .sort((a, b) => a.minute - b.minute)
      if (parsed.length > 0) keyEvents = parsed
    } catch {
      // keep scoreboard events
    }
  }

  if (keyEvents.length > 0) match.events = keyEvents
  if (lineups) match.lineups = lineups

  return match
}
