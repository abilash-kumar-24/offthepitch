import { NextResponse } from 'next/server'
import { getMockMatch, getDemoMatch } from '@/lib/providers/mock'

// Per-match cache (keyed by event ID)
const cache = new Map<string, { data: unknown; at: number }>()
const CACHE_TTL = 8_000 // 8 s — matches live poll interval

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const now = Date.now()

  const hit = cache.get(id)
  if (hit && now - hit.at < CACHE_TTL) {
    return NextResponse.json(hit.data)
  }

  // Demo match — always live, always advancing
  if (id === 'wc-demo') {
    const demo = getDemoMatch()
    return NextResponse.json(demo)
  }

  // ESPN works for numeric IDs (all real WC 2026 event IDs)
  if (/^\d+$/.test(id)) {
    try {
      const { fetchESPNMatch } = await import('@/lib/providers/espn')
      const match = await fetchESPNMatch(id)
      if (match) {
        cache.set(id, { data: match, at: now })
        return NextResponse.json(match)
      }
    } catch (e) {
      console.warn(`[api/match/${id}] ESPN failed:`, (e as Error).message)
    }
  }

  // Mock fallback (handles wc-a1 style IDs)
  const mock = getMockMatch(id)
  if (!mock) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mock)
}
