import type { LiveMatch } from '@/types/match'

// ── Provider abstraction ──────────────────────────────────────────────────────
// Set NEXT_PUBLIC_DATA_PROVIDER=live to use football-data.org
// Default is mock for demo / no-key mode

export type DataProvider = 'mock' | 'live'

export function getProvider(): DataProvider {
  if (process.env.NEXT_PUBLIC_DATA_PROVIDER === 'live') return 'live'
  return 'mock'
}

// Client-side fetch via /api proxy routes (avoids exposing API key)
export async function fetchMatches(): Promise<LiveMatch[]> {
  const res = await fetch('/api/matches')
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

export async function fetchMatchById(id: string): Promise<LiveMatch | null> {
  const res = await fetch(`/api/match/${id}`)
  if (!res.ok) return null
  return res.json()
}
