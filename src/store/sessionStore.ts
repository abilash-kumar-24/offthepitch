'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MarketResult } from '@/types/market'

const STARTING_POINTS = 1000

interface SessionStore {
  nickname: string
  points: number
  streak: number
  bestStreak: number
  totalCalls: number
  correctCalls: number
  matchHistory: MarketResult[]

  setNickname: (name: string) => void
  applyResults: (results: MarketResult[]) => void
  resetForMatch: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      nickname: '',
      points: STARTING_POINTS,
      streak: 0,
      bestStreak: 0,
      totalCalls: 0,
      correctCalls: 0,
      matchHistory: [],

      setNickname: (name) => set({ nickname: name }),

      applyResults: (results) => {
        const { points, streak, bestStreak, totalCalls, correctCalls, matchHistory } = get()

        let newPoints = points
        let newStreak = streak
        let newBestStreak = bestStreak
        let newTotal = totalCalls
        let newCorrect = correctCalls

        for (const r of results) {
          newPoints = newPoints - r.conviction + r.pointsWon
          newTotal++
          if (r.correct) {
            newCorrect++
            newStreak++
            if (newStreak > newBestStreak) newBestStreak = newStreak
          } else {
            newStreak = 0
          }
        }

        set({
          points: Math.max(0, newPoints),
          streak: newStreak,
          bestStreak: newBestStreak,
          totalCalls: newTotal,
          correctCalls: newCorrect,
          matchHistory: [...matchHistory, ...results],
        })
      },

      resetForMatch: () => set({
        points: STARTING_POINTS,
        streak: 0,
        totalCalls: 0,
        correctCalls: 0,
        matchHistory: [],
      }),
    }),
    { name: 'offthepitch-session' }
  )
)
