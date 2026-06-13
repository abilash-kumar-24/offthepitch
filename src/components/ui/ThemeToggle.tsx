'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, THEME_META, type Theme } from '@/store/themeStore'

const THEMES: Theme[] = ['dark', 'light', 'ultras']

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useThemeStore()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!mounted) return <div className="w-[72px] h-7 rounded-full" style={{ background: 'var(--surface-2)' }} />

  const meta = THEME_META[theme]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
        style={{
          background: open ? 'var(--accent-bg)' : 'var(--surface-2)',
          border: open ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
          color: open ? 'var(--accent)' : 'var(--muted)',
        }}
      >
        <span className="text-sm leading-none">{meta.icon}</span>
        <span className="text-[10px] uppercase tracking-widest font-semibold hidden sm:block">{meta.label}</span>
        <span className="text-[9px] opacity-60">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-[999] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              minWidth: 160,
            }}
          >
            <div className="p-1.5">
              {THEMES.map(t => {
                const m = THEME_META[t]
                const active = t === theme
                return (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left"
                    style={active ? {
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                    } : {
                      background: 'transparent',
                      color: 'var(--muted)',
                    }}
                  >
                    <span className="text-base leading-none">{m.icon}</span>
                    <div className="flex-1">
                      <span className="text-xs font-bold block" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                        {m.label}
                      </span>
                      <span className="text-[10px]" style={{ color: active ? 'var(--accent)' : 'var(--dim)' }}>
                        {m.desc}
                      </span>
                    </div>
                    {active && (
                      <span className="text-[10px] font-black" style={{ color: 'var(--accent)' }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
