'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const ease = [0.25, 0.46, 0.45, 0.94] as const
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
})

function Q({ emoji, q, a }: { emoji: string; q: string; a: React.ReactNode }) {
  return (
    <div className="space-y-2 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
        <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text)' }}>{q}</h3>
      </div>
      <div className="pl-10 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{a}</div>
    </div>
  )
}

export default function WTHPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--dim)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
          >
            ← Back
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <motion.div {...fade(0)} className="text-center py-8">
          <div className="text-5xl mb-4">🤔⚽</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-3">
            <span className="text-gradient">What the hell</span>{' '}
            <span className="text-gradient-accent">is this?</span>
          </h1>
          <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            Fair question. Here's the short version — and for the long, beautifully written version,{' '}
            <Link href="/guide" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              read The Guide
            </Link>.
          </p>
        </motion.div>

        {/* One-liner card */}
        <motion.div
          {...fade(0.05)}
          className="rounded-2xl p-6 text-center mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--accent-glow)' }}
        >
          <p className="text-lg sm:text-xl font-bold leading-relaxed" style={{ color: 'var(--text)' }}>
            A live{' '}
            <span style={{ color: 'var(--accent)' }}>second-screen game</span>{' '}
            for the World Cup. You watch the match, you back your instincts with virtual points, and we track whether
            you actually read football as well as you think you do.
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--dim)' }}>
            No real money. No signup. No ads. Just football.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.div {...fade(0.1)} className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 pt-5 pb-0 space-y-6">

            <Q
              emoji="🎯"
              q="So what do I actually do?"
              a={
                <ol className="space-y-1.5 list-none">
                  {[
                    'Open any live match',
                    'A conviction call appears — "Who scores next?", "Will both teams score?", "Can they claw it back?"',
                    'Pick your read and back it with virtual conviction points',
                    'Watch the match. If you\'re right, your streak grows and your multiplier climbs',
                    'New calls keep appearing throughout the match',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black mt-0.5"
                        style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
                      >
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              }
            />

            <Q
              emoji="💸"
              q="Is this gambling?"
              a={
                <>
                  No. The points are purely virtual — they live in your browser. Think of it like a fantasy league
                  or a pub quiz: you're backing your read on what happens, not wagering real money.
                  There's no deposit, no withdrawal, no real stakes. Just your football brain vs a live match.
                </>
              }
            />

            <Q
              emoji="📊"
              q="What are community reads?"
              a={
                <>
                  After each call settles, you'll see how the global player base split their choices — as a % bar
                  across all options. You can instantly see whether you were in the majority or backed the contrarian
                  read. It's the social layer without needing a social network.
                </>
              }
            />

            <Q
              emoji="⚡"
              q="What types of calls are there?"
              a={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {[
                    ['Who scores next?', 'The classic'],
                    ['Can they claw it back?', 'Comeback call (when a team is trailing)'],
                    ['Will both teams score?', 'Early-match read'],
                    ['Who makes the next change?', 'Managerial move'],
                    ['Seeing red?', 'Card tension call'],
                    ['Late drama incoming?', 'Stoppage time — triggered at 88\''],
                    ['Who controls next 5 mins?', 'Momentum read'],
                    ['Which side gets booked?', 'Discipline call'],
                  ].map(([title, sub]) => (
                    <div key={title} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span className="text-[10px] mt-0.5" style={{ color: 'var(--accent)' }}>⚽</span>
                      <div>
                        <span className="text-[11px] font-bold block" style={{ color: 'var(--text)' }}>{title}</span>
                        <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />

            <Q
              emoji="🌡️"
              q="What's the Pressure Pulse?"
              a={
                <>
                  A live momentum tracker that shows which team is actually controlling the game — not just the scoreline,
                  but shots, possession, corners, and intensity. It updates in real time and breathes with the match.
                  A team can be losing but completely dominating; the Pulse shows that.
                </>
              }
            />

            <Q
              emoji="🌍"
              q="Which matches are covered?"
              a={
                <>
                  All 104 matches of{' '}
                  <strong style={{ color: 'var(--text)' }}>FIFA World Cup 2026</strong>{' '}
                  — group stage through to the final, across USA, Canada, and Mexico.
                  Live matches get full real-time data, updated every 8 seconds.
                  There's also always a demo match running so you can try it anytime.
                </>
              }
            />

            <Q
              emoji="🎨"
              q="What are the themes?"
              a={
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { icon: '🌙', name: 'Night', desc: 'Dark stadium energy' },
                    { icon: '☀️', name: 'Day', desc: 'Bright afternoon match' },
                    { icon: '⚡', name: 'Ultras', desc: "Full send, max colour" },
                  ].map(t => (
                    <div key={t.name} className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-[11px] font-black" style={{ color: 'var(--text)' }}>{t.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--dim)' }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              }
            />

            {/* Last Q — no border */}
            <div className="space-y-2 pb-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">🧠</span>
                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Why does this exist?</h3>
              </div>
              <div className="pl-10 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Because watching football is better when you're{' '}
                <em>in</em> it. Every corner kick suddenly matters. Every defensive line shape is a signal.
                You start actually watching the game instead of staring at your phone.
                And it turns any match into a social game — play with mates, compare reads, see who really knows football.
                <br /><br />
                For the full story —{' '}
                <Link href="/guide" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  The Guide
                </Link>{' '}
                has everything.
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fade(0.2)} className="text-center py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-opacity"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 32px var(--accent-glow)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            ⚽ Enter the Arena
          </Link>
          <p className="text-[10px] mt-4 uppercase tracking-[0.15em]" style={{ color: 'var(--dim)' }}>
            Virtual points only · No real money · World Cup 2026
          </p>
        </motion.div>

      </main>
    </div>
  )
}
