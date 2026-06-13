import { NextResponse } from 'next/server'
import { getMockMatches, getDemoMatch } from '@/lib/providers/mock'

// Server-side cache: share one ESPN response across all concurrent users
let cache: { data: unknown; at: number } | null = null
const CACHE_TTL = 10_000 // 10 s

export async function GET() {
  const now = Date.now()

  // Return cached response if fresh
  if (cache && now - cache.at < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  // Try ESPN (free, no key)
  let espnMatches: unknown[] = []
  try {
    const { fetchESPNMatches } = await import('@/lib/providers/espn')
    espnMatches = await fetchESPNMatches()
  } catch (e) {
    console.warn('[api/matches] ESPN failed:', (e as Error).message)
  }

  // Always prepend the live demo match so the app is usable between fixtures
  const demo = getDemoMatch()
  const matches = [demo, ...(espnMatches.length > 0 ? espnMatches : getMockMatches())]

  cache = { data: matches, at: now }
  return NextResponse.json(matches)
}
