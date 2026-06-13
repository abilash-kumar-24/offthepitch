'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'ultras'

const THEMES: Theme[] = ['dark', 'light', 'ultras']

export const THEME_META: Record<Theme, { icon: string; label: string; desc: string }> = {
  dark:   { icon: '🌙', label: 'Night',  desc: 'Night Stadium' },
  light:  { icon: '☀️', label: 'Day',    desc: 'Match Day' },
  ultras: { icon: '⚡', label: 'Ultras', desc: 'Ultras Mode' },
}

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  cycleTheme: () => void
}

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      cycleTheme: () => {
        const current = get().theme
        const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'otp-theme',
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
