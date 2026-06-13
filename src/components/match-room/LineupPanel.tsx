'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeam } from '@/data/teams'
import type { LiveMatch, LineupPlayer } from '@/types/match'

interface Props {
  match: LiveMatch
}

const POS_ORDER = ['G', 'GK', 'CD-L', 'CD-R', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LM', 'RM', 'AM-L', 'AM-R', 'LW', 'RW', 'F', 'CF', 'ST']

function posSort(a: LineupPlayer, b: LineupPlayer): number {
  const ai = POS_ORDER.indexOf(a.position ?? '')
  const bi = POS_ORDER.indexOf(b.position ?? '')
  if (ai === -1 && bi === -1) return 0
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

function PlayerRow({ player, color }: { player: LineupPlayer; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
      style={player.subbedIn ? { background: 'rgba(34,197,94,0.06)' } : player.subbedOut ? { background: 'rgba(239,68,68,0.04)' } : {}}
    >
      {player.jersey && (
        <span
          className="text-[10px] font-black tabular-nums w-5 text-center flex-shrink-0 rounded"
          style={{ color, opacity: 0.8 }}
        >
          {player.jersey}
        </span>
      )}
      <span
        className="text-[11px] font-medium truncate flex-1"
        style={{ color: player.subbedOut ? 'var(--dim)' : 'var(--text)' }}
      >
        {player.name}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {player.position && (
          <span
            className="text-[9px] font-bold uppercase px-1 py-0.5 rounded"
            style={{ background: 'var(--surface-2)', color: 'var(--dim)', border: '1px solid var(--border)' }}
          >
            {player.position}
          </span>
        )}
        {player.subbedIn && <span className="text-[10px]" style={{ color: 'var(--success)' }}>↑</span>}
        {player.subbedOut && <span className="text-[10px]" style={{ color: 'var(--live)' }}>↓</span>}
      </div>
    </div>
  )
}

function Squad({ players, teamCode }: { players: LineupPlayer[]; teamCode: string }) {
  const team = getTeam(teamCode)
  const starters = [...players.filter(p => p.starter)].sort(posSort)
  const bench = players.filter(p => !p.starter)

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: team.primary }}>
          {teamCode}
        </span>
        <div className="flex-1 h-px" style={{ background: team.primary + '30' }} />
      </div>

      {starters.length > 0 && (
        <div className="mb-3">
          <span className="text-[9px] uppercase tracking-widest font-semibold px-2 mb-1 block" style={{ color: 'var(--dim)' }}>
            Starting XI
          </span>
          <div className="space-y-0.5">
            {starters.map(p => <PlayerRow key={p.name + p.jersey} player={p} color={team.primary} />)}
          </div>
        </div>
      )}

      {bench.length > 0 && (
        <div>
          <span className="text-[9px] uppercase tracking-widest font-semibold px-2 mb-1 block" style={{ color: 'var(--dim)' }}>
            Bench
          </span>
          <div className="space-y-0.5">
            {bench.map(p => <PlayerRow key={p.name + p.jersey} player={p} color={team.primary} />)}
          </div>
        </div>
      )}

      {starters.length === 0 && bench.length === 0 && (
        <p className="text-[11px] px-2 py-3" style={{ color: 'var(--dim)' }}>Lineup not yet available</p>
      )}
    </div>
  )
}

export function LineupPanel({ match }: Props) {
  const [open, setOpen] = useState(false)
  const lineups = match.lineups
  const hasLineups = lineups && (lineups.home.length > 0 || lineups.away.length > 0)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--dim)' }}>
          Lineups {!hasLineups && '· Awaiting'}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-3 grid grid-cols-2 gap-4">
              <Squad players={lineups?.home ?? []} teamCode={match.homeTeam.code} />
              <Squad players={lineups?.away ?? []} teamCode={match.awayTeam.code} />
            </div>
            {!hasLineups && (
              <p className="text-center text-[11px] py-4 pb-5" style={{ color: 'var(--muted)' }}>
                Lineups are announced ~1 hour before kickoff
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
