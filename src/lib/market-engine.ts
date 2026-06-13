import type { LiveMatch, MatchEvent } from '@/types/match'
import type { Market, MarketOption, MarketOutcome, MarketType } from '@/types/market'

let marketCounter = 0

function uid() {
  return `mkt-${Date.now()}-${++marketCounter}`
}

// ── Payout multipliers by difficulty ─────────────────────────────────────────
const PAYOUT: Record<number, number> = { 1: 1.4, 2: 1.8, 3: 2.4 }

export function getMultiplier(difficulty: number): number {
  return PAYOUT[difficulty] ?? 1.5
}

// ── Streak multiplier ─────────────────────────────────────────────────────────
export function getStreakMultiplier(streak: number): number {
  if (streak >= 5) return 3.0
  if (streak >= 3) return 2.0
  if (streak >= 2) return 1.5
  if (streak >= 1) return 1.2
  return 1.0
}

// ── Market generators ─────────────────────────────────────────────────────────

export function buildNextGoalMarket(match: LiveMatch): Market {
  const lock = Date.now() + 75000
  const homeScore = match.homeTeam.score
  const awayScore = match.awayTeam.score
  const scoreDiff = homeScore - awayScore

  const options: MarketOption[] = [
    { id: 'home', label: match.homeTeam.code, subLabel: 'Scores next', difficulty: scoreDiff < 0 ? 3 : 2 },
    { id: 'away', label: match.awayTeam.code, subLabel: 'Scores next', difficulty: scoreDiff > 0 ? 3 : 2 },
    { id: 'none', label: 'No Goal', subLabel: 'Next 10 min', difficulty: 1 },
  ]

  return {
    id: uid(),
    type: 'NEXT_GOAL',
    question: 'Who scores next?',
    options,
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: lock,
    minuteContext: match.minute,
  }
}

export function buildPhaseControlMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'PHASE_CONTROL',
    question: 'Who controls the next 5 minutes?',
    options: [
      { id: 'home', label: match.homeTeam.code, subLabel: 'Takes control', difficulty: 2 },
      { id: 'away', label: match.awayTeam.code, subLabel: 'Takes control', difficulty: 2 },
      { id: 'even', label: 'Balanced', subLabel: 'Even play', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 60000,
    minuteContext: match.minute,
  }
}

export function buildNextCardMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'NEXT_CARD',
    question: 'Which side gets booked next?',
    options: [
      { id: 'home', label: match.homeTeam.code, subLabel: 'Yellow / Red', difficulty: 2 },
      { id: 'away', label: match.awayTeam.code, subLabel: 'Yellow / Red', difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 90000,
    minuteContext: match.minute,
  }
}

export function buildLeadToHTMarket(match: LiveMatch): Market {
  const leader = match.homeTeam.score > match.awayTeam.score ? match.homeTeam.code
    : match.awayTeam.score > match.homeTeam.score ? match.awayTeam.code : null

  return {
    id: uid(),
    type: 'LEAD_TO_HT',
    question: leader ? `Does ${leader} hold the lead to HT?` : 'Does anyone break the deadlock before HT?',
    options: leader
      ? [
          { id: 'yes', label: 'Holds', subLabel: `${leader} leads at HT`, difficulty: 1 },
          { id: 'no', label: 'Lost', subLabel: 'Score changes', difficulty: 3 },
        ]
      : [
          { id: 'yes', label: 'Yes', subLabel: 'Goal before HT', difficulty: 2 },
          { id: 'no', label: 'No', subLabel: '0–0 at half-time', difficulty: 2 },
        ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 90000,
    minuteContext: match.minute,
  }
}

export function buildNextCornerMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'NEXT_CORNER',
    question: 'Who wins the next corner?',
    options: [
      { id: 'home', label: match.homeTeam.code, difficulty: 2 },
      { id: 'away', label: match.awayTeam.code, difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 45000,
    minuteContext: match.minute,
  }
}

export function buildNextEventMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'NEXT_EVENT',
    question: 'What happens next?',
    options: [
      { id: 'goal', label: 'Goal', subLabel: 'Either side', difficulty: 3 },
      { id: 'card', label: 'Card', subLabel: 'Yellow or Red', difficulty: 2 },
      { id: 'sub', label: 'Sub', subLabel: 'Either side', difficulty: 2 },
      { id: 'nothing', label: 'Quiet spell', subLabel: 'No major event', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 60000,
    minuteContext: match.minute,
  }
}

// ── NEW MARKETS ───────────────────────────────────────────────────────────────

/** Triggered when one team is trailing by 1 — can they claw it back? */
export function buildComebackMarket(match: LiveMatch): Market {
  const homeLeading = match.homeTeam.score > match.awayTeam.score
  const trailingSide = homeLeading ? 'away' : 'home'
  const trailingCode = homeLeading ? match.awayTeam.code : match.homeTeam.code
  const leadingCode  = homeLeading ? match.homeTeam.code : match.awayTeam.code

  return {
    id: uid(),
    type: 'COMEBACK',
    question: `Can ${trailingCode} find the equaliser?`,
    options: [
      { id: 'yes', label: 'Equaliser', subLabel: `${trailingCode} levels it`, difficulty: 3 },
      { id: 'no',  label: 'Holds',    subLabel: `${leadingCode} keeps the lead`, difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 90000,
    minuteContext: match.minute,
    context: { trailingSide },
  }
}

/** Triggered when the score is 0-0 in the first half — will both teams score? */
export function buildBothScoreMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'BOTH_SCORE',
    question: 'Will both teams get on the scoresheet?',
    options: [
      { id: 'yes', label: 'Both Score', subLabel: 'At least one each', difficulty: 2 },
      { id: 'no',  label: 'Clean Sheet', subLabel: 'One side blanked', difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 90000,
    minuteContext: match.minute,
  }
}

/** Which bench makes the next move? */
export function buildNextSubMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'NEXT_SUB',
    question: 'Which manager makes the next change?',
    options: [
      { id: 'home', label: match.homeTeam.code, subLabel: 'Changes first', difficulty: 2 },
      { id: 'away', label: match.awayTeam.code, subLabel: 'Changes first', difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 120000,
    minuteContext: match.minute,
  }
}

/** Triggered at 88'+ — will stoppage time deliver drama? */
export function buildStoppageGoalMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'STOPPAGE_GOAL',
    question: 'Will stoppage time deliver a goal?',
    options: [
      { id: 'yes', label: 'Late Drama', subLabel: 'Goal in added time', difficulty: 3 },
      { id: 'no',  label: 'Scoreline Stands', subLabel: 'No late change', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 60000,
    minuteContext: match.minute,
  }
}

/** Triggered when yellow cards are building — will someone see red? */
export function buildRedCardThreatMarket(match: LiveMatch): Market {
  return {
    id: uid(),
    type: 'RED_CARD_THREAT',
    question: 'Will someone see red before the whistle?',
    options: [
      { id: 'yes', label: 'Seeing Red', subLabel: 'Red card incoming', difficulty: 3 },
      { id: 'no',  label: 'Keeps it Together', subLabel: 'No dismissal', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 120000,
    minuteContext: match.minute,
  }
}

// ── Event-triggered market builders ──────────────────────────────────────────

/** After a goal — can the conceding team hit back immediately? */
export function buildGoalResponseMarket(match: LiveMatch, goalEvent: MatchEvent): Market {
  const scoringSide = goalEvent.type === 'OWN_GOAL'
    ? (goalEvent.side === 'home' ? 'away' : 'home')
    : goalEvent.side
  const concedingSide = scoringSide === 'home' ? 'away' : 'home'
  const scoringCode  = scoringSide  === 'home' ? match.homeTeam.code : match.awayTeam.code
  const concedingCode = concedingSide === 'home' ? match.homeTeam.code : match.awayTeam.code
  const shortName = goalEvent.playerName?.split(' ').slice(-1)[0]

  return {
    id: uid(),
    type: 'GOAL_RESPONSE',
    question: shortName
      ? `${shortName} strikes for ${scoringCode}. Does ${concedingCode} fire back?`
      : `${scoringCode} lead. Does ${concedingCode} respond immediately?`,
    options: [
      { id: 'yes', label: 'Fire Back!', subLabel: `${concedingCode} levels it`, difficulty: 3 },
      { id: 'no',  label: 'Lead Holds', subLabel: `${scoringCode} stays ahead`, difficulty: 2 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 55000,
    minuteContext: match.minute,
    context: { concedingSide },
  }
}

/** After a named goal scorer — do they grab a brace? */
export function buildBraceHuntMarket(match: LiveMatch, goalEvent: MatchEvent): Market {
  const scorerSide = goalEvent.type === 'OWN_GOAL'
    ? (goalEvent.side === 'home' ? 'away' : 'home')
    : goalEvent.side
  const scorerName = goalEvent.playerName ?? ''
  const shortName  = scorerName ? scorerName.split(' ').slice(-1)[0] : null
  const scorerCode = scorerSide === 'home' ? match.homeTeam.code : match.awayTeam.code

  return {
    id: uid(),
    type: 'BRACE_HUNT',
    question: shortName
      ? `Can ${shortName} add a second and grab the brace?`
      : `Can ${scorerCode} double up with another goal?`,
    options: [
      { id: 'yes', label: 'Brace!', subLabel: shortName ? `${shortName} scores again` : `${scorerCode} add a second`, difficulty: 3 },
      { id: 'no',  label: 'One & Done', subLabel: 'No repeat', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 65000,
    minuteContext: match.minute,
    context: { scorerSide, scorerName },
  }
}

/** After a yellow card — will they lose their head and see a second? */
export function buildYellowWatchMarket(match: LiveMatch, cardEvent: MatchEvent): Market {
  const warnedSide = cardEvent.side
  const playerName = cardEvent.playerName ?? ''
  const shortName  = playerName ? playerName.split(' ').slice(-1)[0] : null
  const teamCode   = warnedSide === 'home' ? match.homeTeam.code : match.awayTeam.code

  return {
    id: uid(),
    type: 'YELLOW_WATCH',
    question: shortName
      ? `${shortName} on a yellow — does the ref reach for a second?`
      : `${teamCode} player on a yellow. Do they push their luck?`,
    options: [
      { id: 'yes', label: 'Seeing Red', subLabel: shortName ? `${shortName} sent off` : 'Sees second yellow', difficulty: 3 },
      { id: 'no',  label: 'Keeps Cool', subLabel: 'Stays on the pitch', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 75000,
    minuteContext: match.minute,
    context: { warnedSide, playerName },
  }
}

/** After a red card — does the team with the man advantage capitalise? */
export function buildRedAdvantageMarket(match: LiveMatch, cardEvent: MatchEvent): Market {
  const reducedSide   = cardEvent.side
  const advantageSide = reducedSide === 'home' ? 'away' : 'home'
  const reducedCode   = reducedSide   === 'home' ? match.homeTeam.code : match.awayTeam.code
  const advantageCode = advantageSide === 'home' ? match.homeTeam.code : match.awayTeam.code
  const shortName = cardEvent.playerName?.split(' ').slice(-1)[0]

  return {
    id: uid(),
    type: 'RED_ADVANTAGE',
    question: shortName
      ? `${shortName} walks — ${reducedCode} down to 10. Does ${advantageCode} capitalise?`
      : `${reducedCode} reduced to 10 men. Does ${advantageCode} make it count?`,
    options: [
      { id: 'yes', label: 'Exploit It', subLabel: `${advantageCode} scores`, difficulty: 2 },
      { id: 'no',  label: 'Hold Firm',  subLabel: `${reducedCode} weathers the storm`, difficulty: 3 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 75000,
    minuteContext: match.minute,
    context: { advantageSide },
  }
}

/** After a substitution — does the fresh leg make an immediate impact? */
export function buildSubSparkMarket(match: LiveMatch, subEvent: MatchEvent): Market {
  const subbingSide = subEvent.side
  const subName     = subEvent.playerName
  const shortName   = subName?.split(' ').slice(-1)[0]
  const teamCode    = subbingSide === 'home' ? match.homeTeam.code : match.awayTeam.code

  return {
    id: uid(),
    type: 'SUB_SPARK',
    question: shortName
      ? `${shortName} is on for ${teamCode}. Impact sub?`
      : `${teamCode} make a change — fresh legs, fresh threat?`,
    options: [
      { id: 'yes', label: 'Impact!', subLabel: `${teamCode} score next`, difficulty: 3 },
      { id: 'no',  label: 'No Change', subLabel: 'No immediate effect', difficulty: 1 },
    ],
    status: 'OPEN',
    opensAt: Date.now(),
    locksAt: Date.now() + 75000,
    minuteContext: match.minute,
    context: { subbingSide },
  }
}

// ── Market selector: pick the most contextually relevant market ───────────────
export function selectNextMarket(match: LiveMatch, recentlyUsed: MarketType[]): Market {
  const minute = match.minute
  const { homeTeam, awayTeam, stats } = match
  const scoreDiff    = Math.abs(homeTeam.score - awayTeam.score)
  const totalGoals   = homeTeam.score + awayTeam.score
  const totalYellows = (stats?.yellowCards[0] ?? 0) + (stats?.yellowCards[1] ?? 0)

  const pool: { type: MarketType; weight: number }[] = [
    { type: 'NEXT_GOAL',     weight: 35 },
    { type: 'PHASE_CONTROL', weight: 18 },
    { type: 'NEXT_CARD',     weight: 14 },
    { type: 'NEXT_EVENT',    weight: 13 },
    { type: 'NEXT_CORNER',   weight: 8 },
  ]

  // Context-aware additions
  if (minute > 30 && minute < 44 && !recentlyUsed.includes('LEAD_TO_HT')) {
    pool.push({ type: 'LEAD_TO_HT', weight: 35 })
  }

  // Comeback — only when losing by exactly 1, not in dying minutes
  if (scoreDiff === 1 && minute > 20 && minute < 80 && !recentlyUsed.includes('COMEBACK')) {
    pool.push({ type: 'COMEBACK', weight: 30 })
  }

  // Both score — early in match when 0-0
  if (homeTeam.score === 0 && awayTeam.score === 0 && minute < 35 && !recentlyUsed.includes('BOTH_SCORE')) {
    pool.push({ type: 'BOTH_SCORE', weight: 28 })
  }

  // Next sub — after half time, subs become common
  if (minute >= 46 && totalGoals < 4 && !recentlyUsed.includes('NEXT_SUB')) {
    pool.push({ type: 'NEXT_SUB', weight: 22 })
  }

  // Stoppage time drama — triggered late, very high priority
  if (minute >= 87 && !recentlyUsed.includes('STOPPAGE_GOAL')) {
    pool.push({ type: 'STOPPAGE_GOAL', weight: 80 })
  }

  // Red card threat — when cards are accumulating
  if (totalYellows >= 4 && minute < 85 && !recentlyUsed.includes('RED_CARD_THREAT')) {
    pool.push({ type: 'RED_CARD_THREAT', weight: 28 })
  }

  // Boost next goal when level
  if (scoreDiff === 0) {
    const ng = pool.find(p => p.type === 'NEXT_GOAL')
    if (ng) ng.weight += 18
  }

  const filtered = pool.filter(p => !recentlyUsed.slice(-2).includes(p.type))
  const totalWeight = filtered.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * totalWeight
  let chosen = filtered[0].type

  for (const p of filtered) {
    r -= p.weight
    if (r <= 0) { chosen = p.type; break }
  }

  switch (chosen) {
    case 'NEXT_GOAL':      return buildNextGoalMarket(match)
    case 'PHASE_CONTROL':  return buildPhaseControlMarket(match)
    case 'NEXT_CARD':      return buildNextCardMarket(match)
    case 'LEAD_TO_HT':     return buildLeadToHTMarket(match)
    case 'NEXT_CORNER':    return buildNextCornerMarket(match)
    case 'COMEBACK':       return buildComebackMarket(match)
    case 'BOTH_SCORE':     return buildBothScoreMarket(match)
    case 'NEXT_SUB':       return buildNextSubMarket(match)
    case 'STOPPAGE_GOAL':  return buildStoppageGoalMarket(match)
    case 'RED_CARD_THREAT':return buildRedCardThreatMarket(match)
    default:               return buildNextEventMarket(match)
  }
}


// ── Resolution logic ──────────────────────────────────────────────────────────
export function resolveMarket(
  market: Market,
  eventsSinceOpen: MatchEvent[],
  currentMinute: number,
  match?: LiveMatch,
): MarketOutcome | null {
  switch (market.type) {

    case 'NEXT_GOAL': {
      const goal = eventsSinceOpen.find(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL')
      if (!goal) {
        if (currentMinute >= market.minuteContext + 10) return 'none'
        return null
      }
      if (goal.type === 'OWN_GOAL') return goal.side === 'home' ? 'away' : 'home'
      return goal.side
    }

    case 'PHASE_CONTROL': {
      if (currentMinute < market.minuteContext + 5) return null
      const hEvents = eventsSinceOpen.filter(e => e.side === 'home').length
      const aEvents = eventsSinceOpen.filter(e => e.side === 'away').length
      if (hEvents > aEvents + 1) return 'home'
      if (aEvents > hEvents + 1) return 'away'
      return 'even'
    }

    case 'NEXT_CARD': {
      const card = eventsSinceOpen.find(e =>
        e.type === 'CARD_YELLOW' || e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED'
      )
      if (!card) return null
      return card.side
    }

    case 'LEAD_TO_HT': {
      if (currentMinute < 45) return null
      return 'yes'
    }

    case 'NEXT_CORNER': {
      const corner = eventsSinceOpen.find(e => e.type === 'CORNER')
      if (!corner) return null
      return corner.side
    }

    case 'NEXT_EVENT': {
      const goal = eventsSinceOpen.find(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL')
      if (goal) return 'goal'
      const card = eventsSinceOpen.find(e => e.type === 'CARD_YELLOW' || e.type === 'CARD_RED')
      if (card) return 'card'
      const sub = eventsSinceOpen.find(e => e.type === 'SUB')
      if (sub) return 'sub'
      if (currentMinute >= market.minuteContext + 8) return 'nothing'
      return null
    }

    // ── New market resolutions ────────────────────────────────────────────────

    case 'COMEBACK': {
      const trailingSide = market.context?.trailingSide
      const goal = eventsSinceOpen.find(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL')
      if (!goal) {
        // Resolve 'no' if 15 minutes pass without a goal, or the half changes
        if (currentMinute >= market.minuteContext + 15) return 'no'
        return null
      }
      const scoringSide = goal.type === 'OWN_GOAL'
        ? (goal.side === 'home' ? 'away' : 'home')
        : goal.side
      return scoringSide === trailingSide ? 'yes' : 'no'
    }

    case 'BOTH_SCORE': {
      // Resolve at HT (min 45) or FT using the full match score
      if (!match) return null
      const halfOver = currentMinute >= 45
      if (!halfOver) return null
      const homeScored = match.homeTeam.score > 0
      const awayScored = match.awayTeam.score > 0
      return homeScored && awayScored ? 'yes' : 'no'
    }

    case 'NEXT_SUB': {
      const sub = eventsSinceOpen.find(e => e.type === 'SUB')
      if (!sub) {
        // Timeout after 20 minutes with no sub — void (return null, let market expire)
        if (currentMinute >= market.minuteContext + 20) return null
        return null
      }
      return sub.side
    }

    case 'STOPPAGE_GOAL': {
      // Resolve at FT (match.status FT) or when minute goes very high
      const stoppageGoal = eventsSinceOpen.find(e =>
        (e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL')
        && e.minute >= 90
      )
      if (stoppageGoal) return 'yes'
      // Resolve 'no' when match finishes
      if (match && (match.status === 'FT' || match.status === 'ET' || match.status === 'PEN')) return 'no'
      if (currentMinute >= 97) return 'no'
      return null
    }

    case 'RED_CARD_THREAT': {
      const red = eventsSinceOpen.find(e => e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED')
      if (red) return 'yes'
      if (currentMinute >= market.minuteContext + 15) return 'no'
      if (currentMinute >= 45 && market.minuteContext < 45) return 'no'
      if (match && match.status === 'FT') return 'no'
      return null
    }

    // ── Event-triggered resolutions ───────────────────────────────────────────

    case 'GOAL_RESPONSE': {
      const concedingSide = market.context?.concedingSide
      const goal = eventsSinceOpen.find(e =>
        e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL'
      )
      if (!goal) {
        if (currentMinute >= market.minuteContext + 12) return 'no'
        return null
      }
      const goalSide = goal.type === 'OWN_GOAL'
        ? (goal.side === 'home' ? 'away' : 'home')
        : goal.side
      return goalSide === concedingSide ? 'yes' : 'no'
    }

    case 'BRACE_HUNT': {
      const scorerSide = market.context?.scorerSide
      const scorerName = market.context?.scorerName ?? ''
      const goal = eventsSinceOpen.find(e =>
        (e.type === 'GOAL' || e.type === 'PENALTY_GOAL') && e.side === scorerSide
      )
      if (!goal) {
        if (currentMinute >= market.minuteContext + 20) return 'no'
        if (match && (match.status === 'HT' || match.status === 'FT')) return 'no'
        return null
      }
      if (scorerName && goal.playerName) {
        const last = (s: string) => s.split(' ').slice(-1)[0].toLowerCase()
        return last(goal.playerName) === last(scorerName) ? 'yes' : 'no'
      }
      return 'yes'
    }

    case 'YELLOW_WATCH': {
      const warnedSide = market.context?.warnedSide
      const red = eventsSinceOpen.find(e =>
        (e.type === 'CARD_RED' || e.type === 'CARD_YELLOW_RED') && e.side === warnedSide
      )
      if (red) return 'yes'
      if (currentMinute >= market.minuteContext + 25) return 'no'
      if (match && match.status === 'HT' && market.minuteContext < 45) return 'no'
      if (match && match.status === 'FT') return 'no'
      return null
    }

    case 'RED_ADVANTAGE': {
      const advantageSide = market.context?.advantageSide
      const goal = eventsSinceOpen.find(e =>
        (e.type === 'GOAL' || e.type === 'PENALTY_GOAL') && e.side === advantageSide
      )
      if (goal) return 'yes'
      if (currentMinute >= market.minuteContext + 20) return 'no'
      if (match && match.status === 'FT') return 'no'
      return null
    }

    case 'SUB_SPARK': {
      const subbingSide = market.context?.subbingSide
      const goal = eventsSinceOpen.find(e =>
        (e.type === 'GOAL' || e.type === 'PENALTY_GOAL') && e.side === subbingSide
      )
      if (goal) return 'yes'
      if (currentMinute >= market.minuteContext + 20) return 'no'
      if (match && match.status === 'FT') return 'no'
      return null
    }

    default: return null
  }
}
