import type { LiveMatch, MatchEvent, MatchStats } from '@/types/match'

// ── Real WC 2026 fixtures ─────────────────────────────────────────────────────
// Schedule sourced from official FIFA draw and confirmed fixtures.
// Times are ET (UTC-4). We offset from a reference point of June 11 2026 15:00 ET
// so today's first match (MEX vs RSA) is simulated as ~50 min in progress.

// Reference: June 11 2026, 19:00 UTC = 15:00 ET
const REF_UTC = Date.UTC(2026, 5, 11, 19, 0, 0) // June 11 15:00 ET

interface MatchTemplate {
  id: string
  homeCode: string
  awayCode: string
  kickoffUTC: number   // absolute UTC ms
  venue: string
  group: string
}

function utc(y: number, mo: number, d: number, hUTC: number, mUTC = 0): number {
  return Date.UTC(y, mo - 1, d, hUTC, mUTC, 0)
}

// All times in UTC. ET = UTC-4, CT = UTC-5.
const TEMPLATES: MatchTemplate[] = [
  // ── June 11 ──────────────────────────────────────────────────────────────
  { id: 'wc-a1', homeCode: 'MEX', awayCode: 'RSA', kickoffUTC: utc(2026, 6, 11, 19,  0), venue: 'Estadio Azteca, Mexico City',   group: 'Group A' },
  { id: 'wc-a2', homeCode: 'KOR', awayCode: 'CZE', kickoffUTC: utc(2026, 6, 12,  2,  0), venue: 'Estadio Akron, Guadalajara',    group: 'Group A' },

  // ── June 12 ──────────────────────────────────────────────────────────────
  { id: 'wc-b1', homeCode: 'CAN', awayCode: 'BIH', kickoffUTC: utc(2026, 6, 12, 19,  0), venue: 'BMO Field, Toronto',            group: 'Group B' },
  { id: 'wc-d1', homeCode: 'USA', awayCode: 'PRY', kickoffUTC: utc(2026, 6, 13,  1,  0), venue: 'SoFi Stadium, Los Angeles',     group: 'Group D' },

  // ── June 13 ──────────────────────────────────────────────────────────────
  { id: 'wc-b2', homeCode: 'QAT', awayCode: 'SUI', kickoffUTC: utc(2026, 6, 13, 19,  0), venue: 'Levi\'s Stadium, Santa Clara',  group: 'Group B' },
  { id: 'wc-c1', homeCode: 'BRA', awayCode: 'MAR', kickoffUTC: utc(2026, 6, 13, 22,  0), venue: 'MetLife Stadium, New York',     group: 'Group C' },
  { id: 'wc-c2', homeCode: 'HAI', awayCode: 'SCO', kickoffUTC: utc(2026, 6, 14,  1,  0), venue: 'Gillette Stadium, Boston',      group: 'Group C' },

  // ── June 14 ──────────────────────────────────────────────────────────────
  { id: 'wc-e1', homeCode: 'GER', awayCode: 'CUW', kickoffUTC: utc(2026, 6, 14, 17,  0), venue: 'NRG Stadium, Houston',          group: 'Group E' },
  { id: 'wc-f1', homeCode: 'NED', awayCode: 'JPN', kickoffUTC: utc(2026, 6, 14, 20,  0), venue: 'AT&T Stadium, Dallas',          group: 'Group F' },
  { id: 'wc-e2', homeCode: 'CIV', awayCode: 'ECU', kickoffUTC: utc(2026, 6, 14, 23,  0), venue: 'Lincoln Financial Field, Philadelphia', group: 'Group E' },

  // ── June 15 ──────────────────────────────────────────────────────────────
  { id: 'wc-h1', homeCode: 'ESP', awayCode: 'CPV', kickoffUTC: utc(2026, 6, 15, 17,  0), venue: 'Mercedes-Benz Stadium, Atlanta', group: 'Group H' },
  { id: 'wc-g1', homeCode: 'BEL', awayCode: 'EGY', kickoffUTC: utc(2026, 6, 15, 22,  0), venue: 'Lumen Field, Seattle',          group: 'Group G' },

  // ── June 16 ──────────────────────────────────────────────────────────────
  { id: 'wc-i1', homeCode: 'FRA', awayCode: 'SEN', kickoffUTC: utc(2026, 6, 16, 19,  0), venue: 'MetLife Stadium, New York',     group: 'Group I' },
  { id: 'wc-j1', homeCode: 'ARG', awayCode: 'ALG', kickoffUTC: utc(2026, 6, 17,  1,  0), venue: 'Arrowhead Stadium, Kansas City', group: 'Group J' },
]

// ── Scripted events per fixture (for demo realism) ────────────────────────────
// Using generic player names — these are illustrative, not real match facts.
interface ScriptedEvent {
  minute: number
  type: MatchEvent['type']
  side: 'home' | 'away'
  player?: string
}

const SCRIPTS: Record<string, ScriptedEvent[]> = {
  'wc-a1': [ // MEX vs RSA — in progress today
    { minute: 8,  type: 'CARD_YELLOW', side: 'home', player: 'Edson Álvarez' },
    { minute: 23, type: 'GOAL',        side: 'home', player: 'Raúl Jiménez' },
    { minute: 39, type: 'CARD_YELLOW', side: 'away', player: 'Themba Zwane' },
    { minute: 44, type: 'GOAL',        side: 'away', player: 'Percy Tau' },
    { minute: 61, type: 'GOAL',        side: 'home', player: 'Hirving Lozano' },
    { minute: 74, type: 'CARD_YELLOW', side: 'away' },
    { minute: 82, type: 'GOAL',        side: 'away', player: 'Lyle Foster' },
  ],
  'wc-c1': [ // BRA vs MAR
    { minute: 12, type: 'CARD_YELLOW', side: 'away', player: 'Hakimi' },
    { minute: 28, type: 'GOAL',        side: 'home', player: 'Vinicius Jr' },
    { minute: 55, type: 'GOAL',        side: 'away', player: 'En-Nesyri' },
    { minute: 68, type: 'CARD_RED',    side: 'away', player: 'Amallah' },
    { minute: 79, type: 'GOAL',        side: 'home', player: 'Rodrygo' },
  ],
  'wc-d1': [ // USA vs PRY
    { minute: 17, type: 'GOAL',        side: 'home', player: 'Pulisic' },
    { minute: 34, type: 'CARD_YELLOW', side: 'away' },
    { minute: 52, type: 'GOAL',        side: 'away', player: 'Almiron' },
    { minute: 71, type: 'GOAL',        side: 'home', player: 'Weah' },
    { minute: 88, type: 'CARD_YELLOW', side: 'home' },
  ],
  'wc-e1': [ // GER vs CUW
    { minute: 6,  type: 'GOAL',        side: 'home', player: 'Wirtz' },
    { minute: 31, type: 'GOAL',        side: 'home', player: 'Musiala' },
    { minute: 47, type: 'CARD_YELLOW', side: 'away' },
    { minute: 60, type: 'GOAL',        side: 'home', player: 'Havertz' },
    { minute: 77, type: 'GOAL',        side: 'away', player: 'Martina' },
  ],
  'wc-i1': [ // FRA vs SEN
    { minute: 14, type: 'CARD_YELLOW', side: 'away', player: 'Koulibaly' },
    { minute: 33, type: 'GOAL',        side: 'home', player: 'Mbappé' },
    { minute: 58, type: 'GOAL',        side: 'away', player: 'Diatta' },
    { minute: 72, type: 'CARD_YELLOW', side: 'home' },
    { minute: 84, type: 'GOAL',        side: 'home', player: 'Dembélé' },
  ],
}

// ── Possession profiles per fixture (home possession % at each decile) ────────
const POSSESSION: Record<string, number[]> = {
  'wc-a1': [56, 58, 55, 54, 53, 51, 52, 50, 49, 48],
  'wc-a2': [45, 44, 46, 48, 50, 49, 47, 46, 45, 44],
  'wc-b1': [52, 54, 55, 53, 51, 50, 52, 53, 54, 55],
  'wc-d1': [60, 62, 61, 59, 58, 57, 56, 55, 54, 53],
  'wc-b2': [40, 38, 37, 39, 41, 42, 40, 38, 37, 36],
  'wc-c1': [58, 60, 62, 61, 59, 57, 56, 55, 54, 53],
  'wc-c2': [38, 37, 39, 41, 43, 42, 40, 39, 38, 37],
  'wc-e1': [65, 67, 68, 66, 64, 63, 62, 61, 60, 59],
  'wc-f1': [52, 50, 48, 50, 52, 53, 54, 53, 52, 51],
  'wc-e2': [54, 55, 56, 54, 52, 51, 50, 49, 48, 47],
  'wc-h1': [64, 66, 67, 65, 63, 62, 61, 63, 65, 66],
  'wc-g1': [57, 55, 54, 56, 58, 57, 55, 54, 53, 52],
  'wc-i1': [62, 63, 64, 62, 60, 59, 58, 57, 56, 55],
  'wc-j1': [60, 62, 63, 61, 59, 58, 57, 56, 55, 54],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeScore(events: MatchEvent[], side: 'home' | 'away'): number {
  return events.filter(e =>
    (e.type === 'GOAL' || e.type === 'PENALTY_GOAL') && e.side === side
  ).length
}

function buildEventsToMinute(script: ScriptedEvent[], minute: number): MatchEvent[] {
  return script
    .filter(e => e.minute <= minute)
    .map((e, i) => ({
      id: `ev-${i}`,
      minute: e.minute,
      type: e.type,
      side: e.side,
      playerName: e.player,
    }))
}

function buildStats(id: string, minute: number, events: MatchEvent[]): MatchStats {
  const pIdx = Math.min(Math.floor(minute / 9), 9)
  const pArr = POSSESSION[id] ?? Array(10).fill(50)
  const homePoss = pArr[pIdx]

  const hg = events.filter(e => e.side === 'home' && (e.type === 'GOAL' || e.type === 'PENALTY_GOAL')).length
  const ag = events.filter(e => e.side === 'away' && (e.type === 'GOAL' || e.type === 'PENALTY_GOAL')).length

  const hShots = Math.max(hg * 4, Math.round((homePoss / 100) * (minute / 5)))
  const aShots = Math.max(ag * 4, Math.round(((100 - homePoss) / 100) * (minute / 5)))

  return {
    possession: [homePoss, 100 - homePoss],
    shots: [hShots, aShots],
    shotsOnTarget: [Math.ceil(hShots * 0.4), Math.ceil(aShots * 0.4)],
    corners: [Math.floor(hShots * 0.55), Math.floor(aShots * 0.55)],
    yellowCards: [
      events.filter(e => e.side === 'home' && e.type === 'CARD_YELLOW').length,
      events.filter(e => e.side === 'away' && e.type === 'CARD_YELLOW').length,
    ],
    redCards: [
      events.filter(e => e.side === 'home' && (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED')).length,
      events.filter(e => e.side === 'away' && (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED')).length,
    ],
    dangerousAttacks: [Math.floor(hShots * 2.2), Math.floor(aShots * 2.2)],
  }
}

// ── Demo simulation (advancing real-time match) ───────────────────────────────
// 1 real second = 1 simulated match minute. Full 90-min match plays in ~3 min.
// Resets automatically after FT+5 min cooldown.

const DEMO_ID = 'wc-demo'
const DEMO_SCRIPT = SCRIPTS['wc-i1']! // FRA vs SEN
const SECS_PER_MIN = 2 // 2 real seconds per match minute

let _demoStart: number | null = null

function ensureDemoRunning() {
  if (!_demoStart) _demoStart = Date.now()
}

function getDemoMinuteAndStatus(): { minute: number; status: LiveMatch['status'] } {
  ensureDemoRunning()
  const elapsed = (Date.now() - _demoStart!) / 1000 // real seconds elapsed
  const rawMin = Math.floor(elapsed / SECS_PER_MIN) // simulated match minutes

  if (rawMin < 45) return { minute: rawMin, status: 'LIVE' }
  if (rawMin < 47) return { minute: 45, status: 'HT' }
  if (rawMin < 92) return { minute: rawMin - 2, status: 'LIVE' } // 2-min HT gap
  if (rawMin < 97) return { minute: 90, status: 'FT' }

  // Reset: start a new match
  _demoStart = Date.now()
  return { minute: 0, status: 'LIVE' }
}

export function getDemoMatch(): LiveMatch {
  const { minute, status } = getDemoMinuteAndStatus()
  const events = buildEventsToMinute(DEMO_SCRIPT, status === 'FT' ? 90 : minute)
  const stats = buildStats('wc-i1', minute, events)

  return {
    id: DEMO_ID,
    status,
    minute,
    homeTeam: { code: 'FRA', name: 'France',  score: computeScore(events, 'home') },
    awayTeam: { code: 'SEN', name: 'Senegal', score: computeScore(events, 'away') },
    events,
    stats,
    kickoffTime: new Date(_demoStart ?? Date.now()).toISOString(),
    venue: 'MetLife Stadium, New York',
    groupStage: 'Group I · Live Demo',
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getMockMatches(): LiveMatch[] {
  const now = Date.now()

  return TEMPLATES.map(t => {
    const diffMs = now - t.kickoffUTC
    const diffMin = diffMs / 60000

    let status: LiveMatch['status']
    let minute = 0

    if (diffMin < 0) {
      status = 'UPCOMING'
    } else if (diffMin < 45) {
      status = 'LIVE'
      minute = Math.floor(diffMin)
    } else if (diffMin < 47) {
      status = 'HT'
      minute = 45
    } else if (diffMin < 90) {
      status = 'LIVE'
      minute = Math.floor(diffMin - 2) // 2-min HT break offset
    } else if (diffMin < 95) {
      status = 'FT'
      minute = 90
    } else {
      status = 'FT'
      minute = 90
    }

    const script = SCRIPTS[t.id] ?? []
    const events = buildEventsToMinute(script, status === 'FT' ? 90 : minute)
    const stats = buildStats(t.id, minute, events)

    return {
      id: t.id,
      status,
      minute,
      homeTeam: { code: t.homeCode, name: t.homeCode, score: computeScore(events, 'home') },
      awayTeam: { code: t.awayCode, name: t.awayCode, score: computeScore(events, 'away') },
      events,
      stats,
      kickoffTime: new Date(t.kickoffUTC).toISOString(),
      venue: t.venue,
      groupStage: t.group,
    }
  })
}

export function getMockMatch(id: string): LiveMatch | null {
  return getMockMatches().find(m => m.id === id) ?? null
}

export function simulateMatchTick(match: LiveMatch): LiveMatch {
  if (match.status !== 'LIVE') return match

  const script = SCRIPTS[match.id] ?? []
  const newMinute = Math.min(90, match.minute + 1)
  const newStatus: LiveMatch['status'] = newMinute === 45 ? 'HT' : newMinute >= 90 ? 'FT' : 'LIVE'
  const events = buildEventsToMinute(script, newMinute)
  const stats = buildStats(match.id, newMinute, events)

  return {
    ...match,
    minute: newMinute,
    status: newStatus,
    homeTeam: { ...match.homeTeam, score: computeScore(events, 'home') },
    awayTeam: { ...match.awayTeam, score: computeScore(events, 'away') },
    events,
    stats,
  }
}
