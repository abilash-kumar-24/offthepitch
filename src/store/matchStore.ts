'use client'
import { create } from 'zustand'
import type { LiveMatch, PressureState } from '@/types/match'
import { computePressure } from '@/lib/match-engine'

interface MatchStore {
  matches: LiveMatch[]
  currentMatch: LiveMatch | null
  pressure: PressureState | null
  lastGoalFlash: number
  isPolling: boolean
  setMatches: (matches: LiveMatch[]) => void
  setCurrentMatch: (match: LiveMatch) => void
  updateCurrentMatch: (match: LiveMatch) => void
  setPolling: (v: boolean) => void
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: [],
  currentMatch: null,
  pressure: null,
  lastGoalFlash: 0,
  isPolling: false,

  setMatches: (matches) => set({ matches }),

  setCurrentMatch: (match) => {
    const pressure = computePressure(match, null)
    set({ currentMatch: match, pressure })
  },

  updateCurrentMatch: (match) => {
    const prev = get()
    const prevEvents = prev.currentMatch?.events ?? []
    const newEvents = match.events

    // Detect new goals for flash effect
    const prevGoalCount = prevEvents.filter(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL').length
    const newGoalCount = newEvents.filter(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL').length
    const hadNewGoal = newGoalCount > prevGoalCount

    const pressure = computePressure(match, prev.pressure)
    set({
      currentMatch: match,
      pressure,
      lastGoalFlash: hadNewGoal ? Date.now() : prev.lastGoalFlash,
    })
  },

  setPolling: (v) => set({ isPolling: v }),
}))
