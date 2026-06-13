import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKickoff(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Starting soon'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function hitRate(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}
