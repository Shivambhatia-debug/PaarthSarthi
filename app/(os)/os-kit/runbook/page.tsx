'use client'

/* /os-kit/runbook: unlinked presenter runbook for the 28 Oct DSTTE pitch. Pre-flight checklists,
 * the 10-minute click path with timings, the 3-minute fallback, drop order, Q&A crib, hotkeys and the
 * printable T2 cue card (printed alone via printOnly). Checklist ticks and rehearsal laps are kept in
 * this browser only (localStorage, best effort). */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Circle, Flag, Printer, RotateCcw, Timer } from 'lucide-react'
import { CUE_CARD } from '@/components/placement/interview/script'
import { printOnly } from '@/lib/os/print'
import { cn } from '@/lib/utils'

const STORE_KEY = 'ps_os_runbook_v1'
const CARD = 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'
const BTN =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-100 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-cyan-300'

// ---------------------------------------------------------------------------
// Content (plan section 8)
// ---------------------------------------------------------------------------

const T12: string[] = [
  'Production build green (next build). next/font needs internet at build time.',
  'Deploy the frontend; confirm the public URL opens /placement-os/.',
  'QR in public/os/qr-placement-os.png resolves to the live /placement-os/ (scan with a phone).',
  'Record two full runs at 1440 × 900 (scripted voice and live voice); desktop + cloud copy.',
  'Print: the 2-page leave-behind from /pilot and the T2 cue card below.',
  'Native speaker proofreads the Hindi strings.',
  'Three full rehearsals, sections timed; the 3-minute fallback once.',
]

const T30: string[] = [
  'Start the existing build only (next start). Do not rebuild.',
  'Open /placement-os/?preflight=1&presenter=1 and run the pre-flight.',
  'Click "Unlock audio". Grant mic + camera on localhost AND on the deployed origin (second tab).',
  'Confirm a hi-IN voice; run "Test Hindi voice".',
  'Recognition test: say "matlab ESP32 aur MQTT"; ESP32, MQTT and filler chips light.',
  'Reset demo (Shift+R).',
  'Browser zoom 110% (Ctrl +). No CSS zoom.',
  'Low speaker volume or a wired earphone mic. Phone hotspot ready. Backup video on the desktop.',
  'Verify the Minister and Secretary names on state.bihar.gov.in/dst. Speak names only; never on screen.',
]

interface Seg {
  t: string
  route: string
  href: string
  say?: string
  steps: string[]
  key?: string
}

const SCRIPT: Seg[] = [
  {
    t: '0:00-0:50',
    route: '/placement-os',
    href: '/placement-os/',
    say: 'Bihar ne har zile mein college bana diya. Ab sawaal hai: kaun interview-ready hai?',
    steps: [
      'Reported bars grow. 2025-26 bar at the later, lower figure with the whisker: "the two reports differ; we show the later, lower figure."',
      'Point at the engineering-gap callout and the Inputs → Outcomes strip.',
    ],
    key: '1',
  },
  {
    t: '0:50-1:40',
    route: '/placement',
    href: '/placement/',
    say: 'Priya: final-year ECE, Purnea CE, Hindi-medium, first in her family in college.',
    steps: [
      'DigiLocker / APAAR sign-in, OTP auto-fills, consent (point at "pilot conditions"), Hinglish.',
      'AgentLog runs; ring 58, history 42 → 58.',
      'Recommendation streams. Click the "TCS NQT-style" card ("public pattern, not an official paper").',
      'Eligibility → Hall Ticket → Enter exam hall.',
    ],
  },
  {
    t: '1:40-2:30',
    route: 'Aptitude',
    href: '/placement/drive/aptitude/',
    steps: [
      'Answer one right (ladder up), one wrong (ladder down).',
      'Ctrl+Tab to another tab and back: toast "Proctor: tab switch detected (1/3)", integrity 96. "This is live, not a video."',
      'Press F. Result 72, Top 31%.',
    ],
  },
  {
    t: '2:30-3:10',
    route: 'Technical',
    href: '/placement/drive/technical/',
    steps: [
      'Run, Submit: 8/10. Review streams O(n²) → O(n).',
      'Nudge, Apply fix: 10/10, score 78.',
      '"Mechanical, civil and polytechnic students get a core round instead."',
    ],
  },
  {
    t: '3:10-3:30',
    route: 'Communication',
    href: '/placement/drive/communication/',
    steps: [
      'Click Start, then press A.',
      'The diff colours words. 50/80, "cutoff met, just". "This is the round that silently eliminates tier-3 students."',
    ],
  },
  {
    t: '3:30-5:00',
    route: 'Interview (hero)',
    href: '/placement/drive/interview/',
    steps: [
      'Pick Live mic (or Scripted if the mic is unreliable), then Start. Sarthi speaks T1 in Hindi; chip "Using signal from Round 2: brute force (list.remove)".',
      'When she finishes, click Skip (scripted, instant).',
      'T2: read the cue card (about 18 s). Optional: Guest question, chip G, for an invited official.',
      'Watch the transcript, the "matlab" filler, ESP32 + MQTT chips, WPM.',
      'Violet thinking → follow-up "Because you said: ESP32". Click Skip on it: in presenter mode that jumps straight to the split card. Without presenter mode, press F or click "Finish & score (F)".',
      'Split card: Technical 78 (language-neutral) · English delivery 52 → 70. "Hindi-medium students are never marked down for knowledge."',
      'Continue to HR → Start → chip H2 (relocation / shifts). Hesitation flag, then the Hindi tip.',
      'If the mic fails at any point, click "Use scripted answer" silently.',
    ],
  },
  {
    t: '5:00-5:50',
    route: 'Report',
    href: '/placement/report/',
    steps: [
      'Ring 71, "Interview-ready". 42 → 58 → 71 in 22 days. Radar.',
      '"Eligible for 9 drives (was 2)". Watermarked offer band.',
      'CM Pratigya: "after graduation, verify".',
      '"Report nahi, raasta."',
    ],
    key: '2',
  },
  {
    t: '5:50-6:50',
    route: '/tpo',
    href: '/tpo/',
    steps: [
      '"Batch 2027" tiles. At-risk list; Priya shows "Recovered 42 → 71".',
      'Parse a JD with AI: eligible · interview-ready · need a sprint. Export CSV.',
      'Pool drive builder: "The pool campus drive model you already run, now one click."',
      'NAAC export.',
    ],
    key: '3',
  },
  {
    t: '6:50-8:40',
    route: '/state (climax)',
    href: '/state/',
    steps: [
      '"Top band: your numbers, sourced. Below: what this centre shows once the pilot fills it, illustrative today."',
      'Map lights up. Click Purnia → drawer. AI Policy tracker. Inputs → Outcomes: "your MoUs, now with measured outcomes".',
      'Ask chip "पूर्णिया प्रमंडल में संवाद कौशल की कमी कहाँ है, और क्या करें?" → answer + chart stream with the "Simulated" banner.',
      'Generate the brief: sections reveal. Print shows the paper only. "Every Monday, this lands on your desk."',
      'Press L once (हिंदी), then L again. Trust tab, 10 s.',
    ],
    key: '4',
  },
  {
    t: '8:40-9:20',
    route: '/schools',
    href: '/schools/',
    steps: [
      '"With the Education Department, as a feeder." Buttons on this route are Hindi. Click path (7 clicks, ~40 s):',
      '"रिपोर्ट पर जाएँ (डेमो)" (or F ×2): Nusrat\'s Shakti report → "मेरा रास्ता देखें": Polytechnic Electronics via DCECE, 86%.',
      '"सारथी दीदी से पूछें" → "शुरू करें" → 2nd chip "Polytechnic क्या होता है?": answers aloud in Hindi, with sources.',
      '"योजना रडार देखें": scan, eligible schemes first (₹20,000).',
      '"राहुल का प्लेसमेंट डे खोलें": "See where this path leads: a polytechnic final-year like Rahul". Opens the /placement sign-in card as Rahul Kumar, GP Muzaffarpur (not his lobby). Then press 5.',
      'Handoff sets persona = Rahul: press Shift+R before any rerun of the Priya flow.',
      'If you run Rahul\'s Core Mechanical round by hand: MCQ answers m1 A · m2 B · m3 A · m4 A · m5 B · m6 B. Autopilot (A) gives 81; Rahul\'s interview switches the app to हिंदी.',
    ],
    key: '5',
  },
  {
    t: '9:20-10:00',
    route: '/pilot',
    href: '/pilot/',
    steps: [
      '"90 days, zero cost: 10 colleges launching B.Tech AI / M&C plus 5 polytechnics. Independent evaluation on your KPIs."',
      'Read the 4 asks. Hand over the printed leave-behind with the QR code.',
      'Close: "Bihar can be the first Hindi-belt state with an AI Placement OS."',
    ],
  },
]

const FALLBACK: { label: string; href: string; secs: string; note: string }[] = [
  { label: '/placement-os', href: '/placement-os/', secs: '30 s', note: 'Reported band only.' },
  { label: '/state', href: '/state/', secs: '90 s', note: 'Map, Ask in Hindi, brief.' },
  { label: 'Interview', href: '/placement/drive/interview/', secs: '45 s', note: 'Start, skip T1, live T2, split card.' },
  { label: '/pilot', href: '/pilot/', secs: '15 s', note: 'The four asks.' },
]

const HOTKEYS: [string, string][] = [
  ['0-5', 'Overview · Student · College T&P · State · School · Pilot'],
  ['F', 'Fast-forward the current round (drive rounds)'],
  ['A', 'Autopilot (communication, scripted answers)'],
  ['L', 'Cycle language EN → हिं → Hinglish (on /tpo and /state: हिंदी ↔ EN)'],
  ['Shift+R', 'Reset demo and return to /placement-os'],
]

const QA: [string, string][] = [
  ['Is this real data?', 'Department figures are as reported, with sources. Everything else is illustrative; the pilot replaces it in 90 days.'],
  ['Will AI reject Hindi-medium students?', 'There is no automated selection. Content is scored language-neutral, delivery separately, and every score has Why? and human review.'],
  ['Does the voice go to Google?', "In this demo, Chrome's built-in speech service processes the audio and we store none of it. Production uses Bhashini, India-hosted, as a pilot condition."],
  ['Are these college rankings real?', 'No. Simulated, not an assessment of any institution. In the pilot, rankings go to the Department first and are never published without approval.'],
  ['Cost?', 'The pilot is free. At state scale, ₹300-600 per student per year; school students free.'],
  ['Does this replace NASSCOM, Spoken Tutorial or the T&P Cell?', 'No. We are the measurement and practice layer and will import their completions (planned).'],
  ['DPDP?', 'DSTTE owns the data. Purpose-specific consent and verifiable parental consent for minors, a named Grievance Officer, RBAC, audit log, a CERT-In-empanelled audit before go-live, MeghRaj/NIC or MeitY-empanelled hosting, and exit with full export and deletion. All are pilot conditions.'],
  ['Maithili / Urdu?', "Maithili is in beta. Urdu, Bihar's second official language, is planned through Bhashini."],
  ['CM Pratigya for current students?', 'Shown as "after graduation (verify)". The platform tells students when they become eligible.'],
]

// ---------------------------------------------------------------------------
// Local (per-browser) state: checklist ticks + rehearsal laps
// ---------------------------------------------------------------------------

interface Saved {
  checks: Record<string, boolean>
  laps: { label: string; ms: number }[][]
}

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<Saved>
      return { checks: p.checks && typeof p.checks === 'object' ? p.checks : {}, laps: Array.isArray(p.laps) ? p.laps.slice(-5) : [] }
    }
  } catch {
    /* ignore */
  }
  return { checks: {}, laps: [] }
}

function save(s: Saved) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// UI bits
// ---------------------------------------------------------------------------

function Section({ id, title, sub, children, className }: { id: string; title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn('mt-8 scroll-mt-24', className)}>
      <h2 id={`${id}-h`} className="text-[20px] font-semibold tracking-tight text-white">
        {title}
      </h2>
      {sub && <p className="mt-1 text-[14px] text-gray-400">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Checklist({ id, items, checks, onToggle }: { id: string; items: string[]; checks: Record<string, boolean>; onToggle: (k: string) => void }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => {
        const k = `${id}-${i}`
        const on = !!checks[k]
        return (
          <li key={k}>
            <button
              type="button"
              onClick={() => onToggle(k)}
              aria-pressed={on}
              className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-[14px] outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {on ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              )}
              <span className={cn('min-w-0', on ? 'text-gray-500 line-through' : 'text-gray-200')}>{it}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RunbookPage() {
  const [saved, setSaved] = useState<Saved>({ checks: {}, laps: [] })
  const [run, setRun] = useState<{ start: number; laps: { label: string; ms: number }[] } | null>(null)
  const [now, setNow] = useState(0)
  const cueRef = useRef<HTMLDivElement>(null)

  useEffect(() => setSaved(load()), [])

  useEffect(() => {
    if (!run) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [run])

  const update = useCallback((fn: (s: Saved) => Saved) => {
    setSaved((s) => {
      const n = fn(s)
      save(n)
      return n
    })
  }, [])

  const toggle = useCallback((k: string) => update((s) => ({ ...s, checks: { ...s.checks, [k]: !s.checks[k] } })), [update])

  const lapIdx = run ? run.laps.length : 0
  const nextLabel = SCRIPT[lapIdx]?.route
  const elapsed = run ? Math.max(0, now - run.start) : 0

  const startRun = () => {
    const t = Date.now()
    setNow(t)
    setRun({ start: t, laps: [] })
  }
  const lap = () => {
    if (!run) return
    const t = Date.now()
    const used = run.laps.reduce((a, l) => a + l.ms, 0)
    const laps = [...run.laps, { label: SCRIPT[run.laps.length]?.route ?? `Lap ${run.laps.length + 1}`, ms: t - run.start - used }]
    if (laps.length >= SCRIPT.length) {
      update((s) => ({ ...s, laps: [...s.laps, laps].slice(-5) }))
      setRun(null)
    } else {
      setRun({ ...run, laps })
    }
  }
  const stopRun = () => {
    if (run && run.laps.length) update((s) => ({ ...s, laps: [...s.laps, run.laps].slice(-5) }))
    setRun(null)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <meta name="robots" content="noindex, nofollow" />

      <header className="no-print flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300">Presenter only · unlinked</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-white">Presenter runbook</h1>
          <p className="mt-1 text-[14px] text-gray-400">DSTTE Bihar pitch · 10 minutes · Chrome, local production build, 1440 × 900, zoom 110%.</p>
        </div>
        <nav aria-label="Runbook sections" className="flex flex-wrap gap-1.5 text-[13px]">
          {[
            ['#preflight', 'Pre-flight'],
            ['#script', '10-min path'],
            ['#fallback', 'Fallback'],
            ['#qa', 'Q&A'],
            ['#cue', 'Cue card'],
          ].map(([h, l]) => (
            <a key={h} href={h} className="rounded-md border border-white/10 px-2.5 py-1 text-gray-300 hover:border-white/25 hover:text-white">
              {l}
            </a>
          ))}
        </nav>
      </header>

      <div className="no-print">
        <Section id="preflight" title="Pre-flight" sub="Ticks are saved in this browser only.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className={CARD}>
              <h3 className="mb-2 text-[15px] font-semibold text-white">Tonight (T−12 h)</h3>
              <Checklist id="t12" items={T12} checks={saved.checks} onToggle={toggle} />
            </div>
            <div className={CARD}>
              <h3 className="mb-2 text-[15px] font-semibold text-white">T−30 min</h3>
              <Checklist id="t30" items={T30} checks={saved.checks} onToggle={toggle} />
              <Link href="/placement-os/?preflight=1&presenter=1" className={cn(BTN, 'mt-3')}>
                Open pre-flight <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Section>

        <Section id="hotkeys" title="Hotkeys" sub="Presenter mode only (?presenter=1). Ignored while typing.">
          <div className={cn(CARD, 'grid gap-x-6 gap-y-1.5 sm:grid-cols-2')}>
            {HOTKEYS.map(([k, d]) => (
              <div key={k} className="flex items-baseline gap-3 text-[14px]">
                <kbd className="min-w-[64px] rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 text-center font-mono text-[12px] text-white">{k}</kbd>
                <span className="text-gray-300">{d}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="script" title="The 10-minute click path" sub="Timings from the plan. Use the rehearsal timer to log section laps.">
          <div className={cn(CARD, 'mb-4 flex flex-wrap items-center gap-3')}>
            <Timer className="h-5 w-5 text-cyan-300" aria-hidden />
            <span className="font-mono text-[22px] tabular-nums text-white">{fmt(elapsed)}</span>
            {run ? (
              <>
                <button type="button" onClick={lap} className={BTN}>
                  <Flag className="h-4 w-4" aria-hidden /> Lap: {nextLabel ?? 'done'}
                </button>
                <button type="button" onClick={stopRun} className={BTN}>
                  Stop
                </button>
                <span className="text-[13px] text-gray-400">
                  {run.laps.map((l) => `${l.label} ${fmt(l.ms)}`).join(' · ')}
                </span>
              </>
            ) : (
              <button type="button" onClick={startRun} className={BTN}>
                <Timer className="h-4 w-4" aria-hidden /> Start rehearsal
              </button>
            )}
            {saved.laps.length > 0 && (
              <button type="button" onClick={() => update((s) => ({ ...s, laps: [] }))} className={cn(BTN, 'ml-auto')}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Clear log
              </button>
            )}
          </div>
          {saved.laps.length > 0 && (
            <div className={cn(CARD, 'mb-4 overflow-x-auto')}>
              <h3 className="mb-2 text-[14px] font-semibold text-white">Rehearsal log (last {saved.laps.length})</h3>
              <ol className="space-y-1 text-[13px] text-gray-300">
                {saved.laps.map((r, i) => (
                  <li key={i}>
                    <span className="font-mono text-white">{fmt(r.reduce((a, l) => a + l.ms, 0))}</span>{' '}
                    <span className="text-gray-400">{r.map((l) => `${l.label} ${fmt(l.ms)}`).join(' · ')}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <ol className="space-y-3">
            {SCRIPT.map((s, i) => (
              <li key={s.t} className={cn(CARD, run && i === lapIdx && 'border-cyan-400/50')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 font-mono text-[13px] tabular-nums text-cyan-200">{s.t}</span>
                  <Link href={s.href} className="inline-flex items-center gap-1 text-[16px] font-semibold text-white hover:text-cyan-200">
                    {s.route} <ArrowUpRight className="h-4 w-4 opacity-60" aria-hidden />
                  </Link>
                  {s.key && (
                    <span className="ml-auto text-[13px] text-gray-400">
                      then press <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 font-mono text-white">{s.key}</kbd>
                    </span>
                  )}
                </div>
                {s.say && <p className="mt-2 text-[14px] italic text-amber-200/90">Say: “{s.say}”</p>}
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-gray-300">
                  {s.steps.map((st) => (
                    <li key={st}>{st}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="fallback" title="3-minute fallback" sub="Also on the dock's Jump menu.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FALLBACK.map((f, i) => (
              <Link key={f.href} href={f.href} className={cn(CARD, 'block transition-colors hover:border-cyan-400/40')}>
                <div className="flex items-center justify-between text-[12px] text-gray-400">
                  <span>Step {i + 1}</span>
                  <span className="font-mono">{f.secs}</span>
                </div>
                <div className="mt-1 text-[16px] font-semibold text-white">{f.label}</div>
                <p className="mt-1 text-[13px] text-gray-400">{f.note}</p>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-gray-300">
            <span className="font-semibold text-white">Drop order if running late:</span> schools, then the HR phase, then communication.
          </p>
          <p className="mt-2 text-[14px] text-gray-300">
            <span className="font-semibold text-white">Guest question:</span> on the interview, chip <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 font-mono text-white">G</kbd> invites an official to answer; generic keywords (farmer, water, school, app, solar) light up.
          </p>
        </Section>

        <Section id="qa" title="Q&A crib">
          <dl className={cn(CARD, 'divide-y divide-white/10 p-0 sm:p-0')}>
            {QA.map(([q, a]) => (
              <div key={q} className="grid gap-1 px-4 py-3 sm:grid-cols-[260px_1fr] sm:gap-4 sm:px-5">
                <dt className="text-[14px] font-semibold text-white">{q}</dt>
                <dd className="text-[14px] text-gray-300">{a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      <section id="cue" aria-labelledby="cue-h" className="mt-8 scroll-mt-24">
        <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="cue-h" className="text-[20px] font-semibold tracking-tight text-white">T2 cue card</h2>
            <p className="mt-1 text-[14px] text-gray-400">Read in about 18 s. Prints alone on one A4 page.</p>
          </div>
          <button type="button" onClick={() => printOnly(cueRef.current)} className={BTN}>
            <Printer className="h-4 w-4" aria-hidden /> Print cue card
          </button>
        </div>
        <div ref={cueRef} className="print-page">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500">Interview · T2 · Priya · read aloud</p>
          <p className="mt-4 text-[30px] font-medium leading-[1.45] text-gray-900 sm:text-[34px]">{CUE_CARD.hinglish}</p>
          <hr className="my-6 border-gray-300" />
          <p className="text-[18px] leading-relaxed text-gray-700">{CUE_CARD.hi}</p>
          <p className="mt-4 text-[14px] leading-relaxed text-gray-500">{CUE_CARD.en}</p>
          <p className="mt-6 text-[13px] text-gray-500">
            Keywords that must light: matlab (filler) · ESP32 · MQTT. Mic fails → click “Use scripted answer” silently.
          </p>
        </div>
      </section>
    </div>
  )
}
