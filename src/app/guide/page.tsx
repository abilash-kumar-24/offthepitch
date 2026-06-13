'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TeamBadge } from '@/components/ui/TeamBadge'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
}

const SHOWCASE_TEAMS = ['BRA', 'FRA', 'ARG', 'MAR', 'JPN', 'GER', 'ESP', 'CIV', 'USA', 'KOR', 'NED', 'SEN']

function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-white/[0.05]" />
      {label && <span className="text-[10px] uppercase tracking-[0.2em] text-white/15 font-medium">{label}</span>}
      {!label && <span className="w-1 h-1 rounded-full bg-white/10" />}
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/40 font-medium">
      {children}
    </span>
  )
}

function BigQ({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-5 py-4 my-4">
      <p className="text-sm text-white/60 italic leading-relaxed">{children}</p>
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Nav */}
      <div className="sticky top-0 z-50 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 90%, transparent)' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="transition-colors text-sm" style={{ color: 'var(--dim)' }}>← Back to matches</Link>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>The Guide</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <motion.div {...fadeUp} className="py-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/20 mb-6">OffThePitch</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
            Your football brain<br />
            <span className="text-white/25">finally has a</span><br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #74ACDF, #FFDF00, #009C3B, #FF6200, #C1272D)' }}
            >
              scoreboard.
            </span>
          </h1>
          <p className="text-base text-white/40 leading-relaxed max-w-sm mx-auto">
            You already knew. You always know. Now the world can see it.
          </p>
        </motion.div>

        <Divider />

        {/* ── SECTION 1: THE FEELING ────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">The Thing You Already Know</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            It's the 73rd minute. The striker gets the ball on the edge of the box. And somewhere deep in your gut —
            <span className="text-white"> you just know.</span>
          </h2>
          <p className="text-sm text-white/45 leading-relaxed mb-4">
            You know before he shoots. You know before the keeper dives. You know before it hits the net, flies wide, or bounces embarrassingly off his shin into the car park.
          </p>
          <p className="text-sm text-white/45 leading-relaxed mb-4">
            Football does this to people. It creates a very specific form of temporary genius. You can feel the momentum shift. You can sense the red card brewing. You know the substitute coming on is going to score because the manager only makes attacking changes in the 78th minute when he's been conservative all match. <em className="text-white/60">You just know.</em>
          </p>
          <p className="text-sm text-white/45 leading-relaxed">
            OffThePitch exists because that knowledge deserves a reckoning. A scoreboard. A way to prove — with timestamped, irrefutable evidence — that yes, you called it. You called it before it happened. In real time. On your phone. During a World Cup match. You absolute genius.
          </p>
        </motion.section>

        <Divider label="So what actually is it" />

        {/* ── SECTION 2: WHAT IS IT ─────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">The Actual Product</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            A live second-screen experience for people who talk at the television.
          </h2>

          <p className="text-sm text-white/45 leading-relaxed mb-6">
            Open OffThePitch during any World Cup 2026 match. You get three things:
          </p>

          <div className="space-y-4 mb-8">
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">⚡</span>
                <div>
                  <h3 className="text-sm font-bold text-white/85 mb-1">The Next Event Arena</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Every 30 to 90 seconds, a live conviction call appears. "Who scores next?" "Does this lead hold to half-time?" "Which side owns the next five minutes?" You pick. You back your read with virtual points. You watch the match vindicate or absolutely humiliate you. Then the next call appears. It's addictive. We're not sorry.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">🌡️</span>
                <div>
                  <h3 className="text-sm font-bold text-white/85 mb-1">The Pressure Pulse</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    A real-time visualisation of the match's tension, momentum, and control. It breathes. It glows. When a goal goes in it has a small existential crisis. When a red card appears, one side starts glowing with the furious energy of a ten-man team suddenly playing for their lives. It reacts to the match like a living thing, which is more than can be said for certain managers.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">📈</span>
                <div>
                  <h3 className="text-sm font-bold text-white/85 mb-1">Your Session Score</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    1,000 virtual conviction points to start each match. Every correct call earns you more. Build a streak and your multiplier climbs. Call it wrong three times in a row and you'll briefly question whether you actually understand football at all. (You do. It was just a bad run. Keep going.)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <Divider label="okay but is this gambling" />

        {/* ── SECTION 3: NOT GAMBLING ───────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">A Word From Our Legal Team (Who Don't Exist)</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            No. It is not gambling.<br />
            <span className="text-white/30">Please calm down.</span>
          </h2>

          <BigQ>
            "But you're picking outcomes and winning points based on whether you're right—"
          </BigQ>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            Yes. And so is every pub quiz. Every fantasy league. Every time you told your mate "he's going to score today, I can feel it." You weren't gambling. You were being a football fan.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            There is no real money here. None. You cannot deposit. You cannot withdraw. You cannot ring a helpline because there's nothing to be helped about. The points are virtual. They live in your browser. When you close the tab, they float off into the digital ether like everything you've ever entered into a search engine in a moment of weakness.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-6">
            This is a confidence game. A skill game. A "how well do you actually read football" game. The currency is your instinct, and the only house edge is the chaos of a sport where a goalkeeper can score a last-minute equaliser and nobody can stop it.
          </p>

          <div className="flex flex-wrap gap-2">
            <Pill>No real money</Pill>
            <Pill>No deposits</Pill>
            <Pill>No withdrawals</Pill>
            <Pill>No odds</Pill>
            <Pill>No bookmakers</Pill>
            <Pill>Purely virtual points</Pill>
            <Pill>Just football & feelings</Pill>
          </div>
        </motion.section>

        <Divider label="the world cup" />

        {/* ── SECTION 4: WC 2026 ───────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">World Cup 2026</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            48 teams. 104 matches.<br />Three countries.<br />
            <span className="text-white/30">Absolutely unhinged scheduling.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            The 2026 World Cup is the biggest one ever. 48 nations. USA, Canada and Mexico sharing hosting duties with the combined hospitality of a nation that invented fast food, a country made of hockey and apologies, and a place where the football is religion and the food is the sermon.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            You will watch matches you have no business caring about. A group stage encounter between two nations whose geography you'll need to quietly Google. You will find yourself deeply invested in the result. You will shout at the screen for a team you'd never heard of two hours ago. This is the World Cup. This is what it does.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-8">
            OffThePitch covers every single match. All 104. Every kickoff, every goal, every VAR review that takes six minutes and achieves nothing. Every red card that changes a match completely. Every penalty shootout that gives the entire planet a simultaneous cardiac event.
          </p>

          {/* Team badge showcase */}
          <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-4">All 48 teams. Each one looks like this.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {SHOWCASE_TEAMS.map((code, i) => (
                <motion.div
                  key={code}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <TeamBadge code={code} size="md" />
                </motion.div>
              ))}
              <div className="w-12 h-12 rounded-xl border border-white/[0.06] flex items-center justify-center">
                <span className="text-[10px] text-white/20">+36</span>
              </div>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-4 leading-relaxed">
              Shapes by confederation · Colors by nation · Code by tradition<br />
              No official logos were used or harmed in the making of this app
            </p>
          </div>
        </motion.section>

        <Divider label="how the badges work" />

        {/* ── SECTION 5: BADGE SYSTEM ───────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">The Symbolic Identity System</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            We gave every nation a shape.<br />
            <span className="text-white/30">Lawyers gave us no choice.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed mb-6">
            Official team crests and logos are copyrighted. FIFA's branding is very much FIFA's branding. So we built something cleaner. A minimal geometric language where each confederation gets a shape and each team gets colors.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { shape: '⬡', conf: 'UEFA', label: 'Hexagon', teams: 'Germany, France, Spain…' },
              { shape: '◆', conf: 'CONMEBOL', label: 'Diamond', teams: 'Brazil, Argentina, Uruguay…' },
              { shape: '●', conf: 'CAF', label: 'Circle', teams: 'Morocco, Senegal, Nigeria…' },
              { shape: '■', conf: 'AFC', label: 'Square', teams: 'Japan, Korea, Iran…' },
              { shape: '⬠', conf: 'CONCACAF', label: 'Pentagon', teams: 'USA, Mexico, Canada…' },
              { shape: '○', conf: 'OFC', label: 'Ring', teams: 'New Zealand (solo legend)' },
            ].map(row => (
              <div key={row.conf} className="rounded-xl border border-white/[0.05] bg-black/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{row.shape}</span>
                  <div>
                    <span className="text-[10px] font-bold text-white/60 block">{row.label}</span>
                    <span className="text-[9px] text-white/20">{row.conf}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/25 leading-tight">{row.teams}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/30 leading-relaxed">
            The result is something that looks like a premium sports terminal met a design agency at a cocktail party. We're proud of it. Your phone screen will look excellent.
          </p>
        </motion.section>

        <Divider label="the vocabulary" />

        {/* ── SECTION 6: LANGUAGE ───────────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">Words We Use</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            We don't bet here.<br />
            <span className="text-white/30">We read. We signal. We back our conviction.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed mb-6">
            The language of OffThePitch is deliberately football-brained, not casino-brained. A quick field guide:
          </p>

          <div className="space-y-3 mb-6">
            {[
              { word: 'Conviction', means: 'Your certainty that something is about to happen. Backed with virtual points.' },
              { word: 'Read', means: "Your interpretation of the match state. When it's right, you feel like Arrigo Sacchi. When it's wrong, you feel like a wet Tuesday in November." },
              { word: 'Signal', means: "A pattern in the match data that suggests something's coming. Goal. Card. Pressure shift." },
              { word: 'Streak', means: "Consecutive correct calls. Your multiplier climbs. Your ego also climbs. Try to keep the ego manageable." },
              { word: 'Pulse', means: "The live visual representation of match momentum. It breathes. It throbs. It occasionally has a mild panic attack when VAR gets involved." },
              { word: 'Edge', means: "The feeling that you understand this particular match better than the average person watching. You're probably right." },
            ].map(item => (
              <div key={item.word} className="flex gap-4">
                <span className="text-xs font-black text-white/70 w-20 flex-shrink-0 pt-0.5">{item.word}</span>
                <p className="text-xs text-white/35 leading-relaxed">{item.means}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <Divider label="the 3am match" />

        {/* ── SECTION 7: THE 3AM MATCH ──────────────────────────────────────── */}
        <motion.section {...fadeUp} className="py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-5">A Love Letter</p>
          <h2 className="text-2xl font-black text-white/90 leading-snug mb-6">
            To every match you've watched alone,<br />
            convinced something was about to happen,<br />
            <span className="text-white/30">with no one to tell.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            The World Cup always produces them. The 3am match in a group you didn't plan to follow. A grainy stream on a dodgy connection. Two teams whose kits you can barely tell apart. And somehow — somehow — you're completely gripped. The score is 0-0 in the 88th minute and you cannot move.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            You have opinions. You have reads. You have an absolutely non-negotiable feeling that the left back is about to give away a penalty.
          </p>

          <p className="text-sm text-white/45 leading-relaxed mb-4">
            And he does. And there's nobody there. No one to witness your genius. Your phone sits next to you, dark and indifferent.
          </p>

          <p className="text-sm text-white/45 leading-relaxed">
            OffThePitch is for that night. For that match. For the version of you who always knew, who always called it, who just needed somewhere to put it.
          </p>
        </motion.section>

        <Divider />

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <motion.div {...fadeUp} className="py-16 text-center">
          <p className="text-xs text-white/25 mb-4">No signup. No account. Just open a match and start calling it.</p>
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              Show me today's matches →
            </motion.button>
          </Link>
          <p className="text-[10px] text-white/15 mt-6 leading-relaxed">
            Virtual points only · World Cup 2026 · Made with unreasonable affection for football
          </p>
        </motion.div>

      </div>
    </div>
  )
}
