import type { LiveMatch } from '@/types/match'
import { normalizeFDMatch, normalizeFDMatchList } from '@/lib/normalizer'

const BASE = 'https://api.football-data.org/v4'
const WC_CODE = 'WC'

function headers() {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY not set')
  return { 'X-Auth-Token': key }
}

export async function fetchTodayMatches(): Promise<LiveMatch[]> {
  const today = new Date().toISOString().split('T')[0]
  const res = await fetch(
    `${BASE}/competitions/${WC_CODE}/matches?dateFrom=${today}&dateTo=${today}`,
    { headers: headers(), next: { revalidate: 30 } }
  )
  if (!res.ok) throw new Error(`football-data.org: ${res.status}`)
  const data = await res.json()
  return normalizeFDMatchList(data)
}

export async function fetchMatch(id: string): Promise<LiveMatch> {
  const res = await fetch(
    `${BASE}/matches/${id}`,
    { headers: headers(), next: { revalidate: 0 } }
  )
  if (!res.ok) throw new Error(`football-data.org match ${id}: ${res.status}`)
  const data = await res.json()
  return normalizeFDMatch(data)
}
