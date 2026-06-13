'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeam } from '@/data/teams'
import type { LiveMatch, MatchEvent } from '@/types/match'

interface Props {
  match: LiveMatch
}

const EVENT_ICONS: Partial<Record<MatchEvent['type'], string>> = {
  GOAL: '⚽',
  PENALTY_GOAL: '⚽',
  OWN_GOAL: '⚽',
  CARD_YELLOW: '🟨',
  CARD_RED: '🟥',
  CARD_YELLOW_RED: '🟥',
  SUB: '↕',
  VAR_REVIEW: '📺',
  VAR_OVERTURNED: '✅',
  CORNER: '⚑',
}

const EVENT_LABELS: Partial<Record<MatchEvent['type'], string>> = {
  GOAL: 'Goal',
  PENALTY_GOAL: 'Penalty',
  OWN_GOAL: 'Own Goal',
  CARD_YELLOW: 'Yellow Card',
  CARD_RED: 'Red Card',
  CARD_YELLOW_RED: 'Second Yellow',
  SUB: 'Substitution',
  VAR_REVIEW: 'VAR Review',
  VAR_OVERTURNED: 'VAR Overturned',
}

function EventItem({ event, match, isNew }: { event: MatchEvent; match: LiveMatch; isNew: boolean }) {
  const teamCode = event.side === 'home' ? match.homeTeam.code : match.awayTeam.code
  const team = getTeam(teamCode)
  const isHome = event.side === 'home'
  const isMajor = event.type === 'GOAL' || event.type === 'PENALTY_GOAL' || event.type === 'OWN_GOAL' || event.type === 'CARD_RED'

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: 20, scale: 0.95 } : { opacity: 1 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
        isMajor ? '' : 'border-transparent'
      }`}
      style={isMajor ? { borderColor: `${team.primary}35`, background: `${team.primary}10`, border: `1px solid ${team.primary}35` } : {}}
    >
      {/* Minute */}
      <span className="text-[11px] tabular-nums w-6 text-right flex-shrink-0" style={{ color: 'var(--dim)' }}>
        {event.minute}{event.minuteExtra ? `+${event.minuteExtra}` : ''}'
      </span>

      {/* Color dot */}
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: team.primary }} />

      {/* Icon */}
      <span className="text-sm flex-shrink-0">{EVENT_ICONS[event.type] ?? '•'}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{EVENT_LABELS[event.type] ?? event.type}</span>
          <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--dim)' }}>{teamCode}</span>
        </div>
        {event.type === 'SUB' ? (
          <div className="space-y-0.5 mt-0.5">
            {event.playerName && (
              <span className="text-[11px] truncate block font-medium" style={{ color: 'var(--success)' }}>
                ↑ {event.playerName}
              </span>
            )}
            {event.assistName && (
              <span className="text-[11px] truncate block" style={{ color: 'var(--muted)' }}>
                ↓ {event.assistName}
              </span>
            )}
          </div>
        ) : (
          <>
            {event.playerName && (
              <span className="text-[11px] truncate block" style={{ color: 'var(--muted)' }}>{event.playerName}</span>
            )}
            {event.assistName && (
              <span className="text-[11px] truncate block" style={{ color: 'var(--dim)' }}>
                ↪ {event.assistName}
              </span>
            )}
          </>
        )}
      </div>

      {/* Side indicator */}
      <div
        className="w-0.5 h-4 rounded-full flex-shrink-0"
        style={{ background: team.primary, opacity: 0.5 }}
      />
    </motion.div>
  )
}

export function EventRail({ match }: Props) {
  const events = [...match.events].reverse()
  const latestId = events[0]?.id

  if (events.length === 0) {
    return (
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center py-4">
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>No events yet</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>Match Events</span>
        <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{events.length} events</span>
      </div>
      <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto scrollbar-none">
        <AnimatePresence initial={false}>
          {events.slice(0, 12).map(event => (
            <EventItem
              key={event.id}
              event={event}
              match={match}
              isNew={event.id === latestId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
