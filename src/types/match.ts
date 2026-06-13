export type MatchStatus =
  | 'SCHEDULED'
  | 'UPCOMING'
  | 'PRE_LIVE'
  | 'LIVE'
  | 'HT'
  | 'ET'
  | 'PEN'
  | 'FT'
  | 'CANCELLED'
  | 'POSTPONED'

export type EventType =
  | 'GOAL'
  | 'OWN_GOAL'
  | 'PENALTY_GOAL'
  | 'CARD_YELLOW'
  | 'CARD_RED'
  | 'CARD_YELLOW_RED'
  | 'SUB'
  | 'VAR_REVIEW'
  | 'VAR_OVERTURNED'
  | 'KICKOFF'
  | 'HT'
  | 'FT'
  | 'ET_START'
  | 'PEN_START'
  | 'CORNER'
  | 'DANGEROUS_ATTACK'

export type TeamSide = 'home' | 'away'

export interface MatchEvent {
  id: string
  minute: number
  minuteExtra?: number
  type: EventType
  side: TeamSide
  playerName?: string
  assistName?: string
  detail?: string
}

export interface MatchTeam {
  code: string
  name: string
  score: number
}

export interface LineupPlayer {
  name: string
  jersey?: string
  position?: string   // e.g. 'G', 'CD-L', 'LB', 'F', 'AM'
  starter: boolean
  subbedIn?: boolean
  subbedOut?: boolean
}

export interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  yellowCards: [number, number]
  redCards: [number, number]
  dangerousAttacks: [number, number]
}

export interface LiveMatch {
  id: string
  status: MatchStatus
  minute: number
  minuteExtra?: number
  homeTeam: MatchTeam
  awayTeam: MatchTeam
  events: MatchEvent[]
  stats: MatchStats
  kickoffTime: string
  venue?: string
  groupStage?: string
  lineups?: {
    home: LineupPlayer[]
    away: LineupPlayer[]
  }
}

export interface PressureState {
  homePressure: number
  awayPressure: number
  tension: number
  momentum: TeamSide | null
  lastShockwave: MatchEvent | null
  shockwaveAt: number
}
