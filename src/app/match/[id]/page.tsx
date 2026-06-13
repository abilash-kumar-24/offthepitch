import { notFound } from 'next/navigation'
import { MatchRoomClient } from './MatchRoomClient'
import type { LiveMatch } from '@/types/match'
import { getMockMatch, getDemoMatch } from '@/lib/providers/mock'

interface Props {
  params: Promise<{ id: string }>
}

async function getInitialMatch(id: string): Promise<LiveMatch | null> {
  // Demo match — always live, always advancing
  if (id === 'wc-demo') return getDemoMatch()

  // Numeric ID → ESPN live data
  if (/^\d+$/.test(id)) {
    try {
      const { fetchESPNMatch } = await import('@/lib/providers/espn')
      const match = await fetchESPNMatch(id)
      if (match) return match
    } catch (e) {
      console.warn(`[page] ESPN server fetch failed for ${id}:`, e)
    }
  }
  // Mock fallback (wc-xxx IDs)
  return getMockMatch(id)
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params
  const match = await getInitialMatch(id)
  if (!match) notFound()
  return <MatchRoomClient initialMatch={match} />
}
