export type MarketType =
  | 'NEXT_GOAL'
  | 'NEXT_EVENT'
  | 'PHASE_CONTROL'
  | 'CLEAN_SHEET'
  | 'LEAD_TO_HT'
  | 'NEXT_CARD'
  | 'NEXT_CORNER'
  | 'SCORE_NEXT_10'
  | 'COMEBACK'
  | 'BOTH_SCORE'
  | 'NEXT_SUB'
  | 'STOPPAGE_GOAL'
  | 'RED_CARD_THREAT'
  | 'GOAL_RESPONSE'
  | 'BRACE_HUNT'
  | 'YELLOW_WATCH'
  | 'RED_ADVANTAGE'
  | 'SUB_SPARK'

export type MarketStatus = 'OPEN' | 'LOCKED' | 'RESOLVED' | 'VOID'

export type MarketOutcome = string

export interface MarketOption {
  id: string
  label: string
  subLabel?: string
  difficulty: number
}

export interface Market {
  id: string
  type: MarketType
  question: string
  options: MarketOption[]
  status: MarketStatus
  opensAt: number
  locksAt: number
  resolvedAt?: number
  resolvedOutcome?: MarketOutcome
  minuteContext: number
  context?: Record<string, string>   // arbitrary resolution context (e.g. trailingSide)
}

export interface UserPosition {
  marketId: string
  optionId: string
  conviction: number
  placedAt: number
}

export interface MarketResult {
  marketId: string
  question: string
  userOptionId: string
  userOptionLabel: string
  correctOptionId: string
  correct: boolean
  conviction: number
  pointsWon: number
  pointsLost: number
  multiplier: number
}

export interface SessionState {
  nickname: string
  matchId: string
  startingPoints: number
  currentPoints: number
  streak: number
  bestStreak: number
  totalCalls: number
  correctCalls: number
  positions: UserPosition[]
  results: MarketResult[]
  startedAt: number
}
