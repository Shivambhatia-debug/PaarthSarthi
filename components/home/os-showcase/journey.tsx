'use client'

/* Placement Day journey: a scroll-driven vertical rail. The progress line fills as the section scrolls;
 * steps light up in turn. From xl a large sticky browser-frame preview crossfades to the active step. */

import { useEffect, useRef, useState, type ComponentType } from 'react'
import Link from 'next/link'
import { ArrowRight, AudioLines, Award, Bot, Brain, Code2, Handshake, Lock, Sparkles, Ticket } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { ScoreRing } from '@/components/ai/score-ring'
import { Waveform } from '@/components/ai/waveform'
import { cn } from '@/lib/utils'
import { GRADIENT_TEXT, Eyebrow, HonestyChip, Reveal, SafeImg, useInView, ShowcaseStyles } from './shared'
import { SITE_HOST, STORY, shotUrl, type ShotId } from './media'

interface Step {
  id: string
  round: string
  title: string
  ai: string
  metric: string
  icon: ComponentType<{ className?: string }>
  route: string
  shot?: ShotId
  visual?: 'wave' | 'orb'
}

const STEPS: Step[] = [
  {
    id: 'hall',
    route: '/placement/',
    round: 'Start',
    title: 'Hall ticket & eligibility',
    ai: 'Checks eligibility, sets your readiness baseline and issues the hall ticket.',
    metric: `PRI ${STORY.priMid} · Eligible`,
    icon: Ticket,
    shot: 'lobby',
  },
  {
    id: 'aptitude',
    route: '/placement/drive/aptitude/',
    round: 'Round 1',
    title: 'Aptitude (proctored)',
    ai: 'Adaptive questions, proctored right in your browser.',
    metric: 'Integrity 96',
    icon: Brain,
    shot: 'aptitude',
  },
  {
    id: 'dsa',
    route: '/placement/drive/technical/',
    round: 'Round 2',
    title: 'DSA / Coding',
    ai: 'AI code review explains the complexity and the fix.',
    metric: 'O(n²) → O(n)',
    icon: Code2,
    shot: 'coding',
  },
  {
    id: 'comm',
    route: '/placement/drive/communication/',
    round: 'Round 3',
    title: 'Communication',
    ai: 'Versant-style speaking and listening, scored in seconds.',
    metric: `${STORY.versant}/80`,
    icon: AudioLines,
    shot: 'communication',
  },
  {
    id: 'tech',
    route: '/placement/drive/interview/',
    round: 'Round 4',
    title: 'AI technical interview',
    ai: 'A voice interview that follows up on your own project.',
    metric: 'Because you said: ESP32',
    icon: Bot,
    shot: 'interview',
  },
  {
    id: 'hr',
    route: '/placement/drive/hr/',
    round: 'Round 5',
    title: 'HR interview',
    ai: 'STAR-structured feedback on clarity, tone and confidence.',
    metric: 'STAR feedback',
    icon: Handshake,
    shot: 'hr',
  },
  {
    id: 'report',
    route: '/placement/report/',
    round: 'Result',
    title: 'Readiness report & offer',
    ai: 'Your Placement Readiness Index, gaps and matched drives.',
    metric: `PRI ${STORY.priStart} → ${STORY.priNow}`,
    icon: Award,
    shot: 'report',
  },
]

const N = STEPS.length
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function StepVisual({ step, lit }: { step: Step; lit: boolean }) {
  const dim = lit ? '' : '[filter:grayscale(0.7)_brightness(0.65)]'
  if (step.shot) {
    return (
      <SafeImg
        src={shotUrl(step.shot)}
        alt={`${step.title}: screenshot`}
        fallbackLabel={step.title}
        className={cn(
          'h-full w-full object-cover object-top transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.07]',
          dim,
        )}
      />
    )
  }
  if (step.visual === 'wave') {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_50%_40%,rgba(59,130,246,0.22),transparent_65%),linear-gradient(160deg,#0c1527,#070b14)] px-3 transition-[filter] duration-700',
          dim,
        )}
      >
        <Waveform active={lit} bars={12} className="h-8" />
        <span className="hidden text-xs font-medium text-gray-300 sm:block">Speak · Listen · Repeat</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_40%_45%,rgba(139,92,246,0.2),transparent_65%),linear-gradient(160deg,#0f1426,#070b14)] px-3 transition-[filter] duration-700',
        dim,
      )}
    >
      <AIOrb state={lit ? 'speaking' : 'idle'} size={40} label="" />
      <span aria-hidden className="flex w-1/2 max-w-[90px] flex-col gap-1.5">
        <span className="h-1.5 w-full rounded-full bg-white/25" />
        <span className="h-1.5 w-4/5 rounded-full bg-white/15" />
        <span className="h-1.5 w-3/5 rounded-full bg-violet-300/30" />
      </span>
    </div>
  )
}

/** xl+: large browser-frame preview of the active step (Ken Burns + metric overlay). */
function StepPreview({ active }: { active: number }) {
  const cur = STEPS[active]
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(closest-side,rgba(34,211,238,0.12),transparent)] blur-2xl"
      />
      <div className="rounded-[16px] bg-gradient-to-b from-white/20 via-white/[0.07] to-white/[0.03] p-px shadow-[0_40px_100px_-40px_rgba(34,211,238,0.45)]">
        <div className="overflow-hidden rounded-[15px] bg-[#0a101c]">
          <div className="flex h-9 items-center gap-3 border-b border-white/[0.06] bg-[#0d1525] px-3.5">
            <div aria-hidden className="flex shrink-0 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex min-w-0 items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400 ring-1 ring-inset ring-white/[0.04]">
              <Lock className="h-3 w-3 shrink-0 text-emerald-400/80" aria-hidden />
              <span className="truncate">
                {SITE_HOST}
                <span className="text-gray-200">{cur.route}</span>
              </span>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-[#070b14]">
            {STEPS.map((step, i) => {
              const on = i === active
              return (
                <div
                  key={step.id}
                  aria-hidden={!on}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-700 ease-out',
                    on ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <div
                    className="psx-anim h-full w-full ease-out"
                    style={{
                      transform: on ? 'scale(1.07) translate3d(-1%,-1%,0)' : 'scale(1.01)',
                      transition: on ? 'transform 9s cubic-bezier(.2,.6,.3,1)' : 'transform 1.2s ease-out',
                    }}
                  >
                    <StepVisual step={step} lit />
                  </div>
                </div>
              )
            })}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(3,6,12,0.75))]"
            />
            <div
              key={cur.id}
              className="psx-anim absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4"
              style={{
                animation: 'psx-pop .55s cubic-bezier(.2,.8,.2,1) both',
              }}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                  {String(active + 1).padStart(2, '0')} · {cur.round}
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-white">{cur.title}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#0b1322]/90 px-3 py-2 text-[13px] font-semibold text-white shadow-2xl shadow-black/50 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-200" aria-hidden />
                {cur.metric}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepNode({ step, lit, active }: { step: Step; lit: boolean; active: boolean }) {
  const Icon = step.icon
  return (
    <span
      className={cn(
        'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
        lit
          ? 'border-transparent bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 text-white shadow-[0_0_24px_-4px_rgba(34,211,238,0.7)]'
          : 'border-white/[0.12] bg-[#0b111c] text-gray-500',
      )}
    >
      {active && (
        <span
          aria-hidden
          className="psx-anim absolute inset-0 rounded-full border border-cyan-300/60"
          style={{ animation: 'psx-ping 1.8s ease-out infinite' }}
        />
      )}
      <Icon className="h-4 w-4" />
    </span>
  )
}

function MetricChip({ text, lit }: { text: string; lit: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full rounded-md border px-2 py-1 text-xs font-medium leading-snug transition-colors duration-500',
        lit
          ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200'
          : 'border-white/[0.08] bg-white/[0.03] text-gray-400',
      )}
    >
      {text}
    </span>
  )
}

export function Journey() {
  const mobSeg = useRef<(HTMLSpanElement | null)[]>([])
  const mobNodes = useRef<(HTMLSpanElement | null)[]>([])
  const [lit, setLit] = useState(0)
  const [ringRef, ringIn] = useInView<HTMLDivElement>({
    rootMargin: '0px 0px -15% 0px',
  })

  useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const vh = window.innerHeight || 800
      let P = -1
      {
        const anchor = vh * 0.62
        const centers = mobNodes.current.map((n) => {
          if (!n) return Number.POSITIVE_INFINITY
          const r = n.getBoundingClientRect()
          return r.top + r.height / 2
        })
        if (anchor >= centers[0]) {
          let i = 0
          while (i < N - 1 && anchor >= centers[i + 1]) i++
          P = i >= N - 1 ? N - 1 : i + clamp((anchor - centers[i]) / Math.max(1, centers[i + 1] - centers[i]), 0, 1)
        }
        mobSeg.current.forEach((s, i) => {
          if (s) s.style.transform = `scaleY(${clamp(P - i, 0, 1).toFixed(4)})`
        })
      }
      const count = P < 0 ? 0 : Math.min(N, Math.floor(P + 1e-6) + 1)
      setLit((c) => (c === count ? c : count))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const active = lit - 1

  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="relative scroll-mt-16 overflow-clip py-16 sm:py-24"
    >
      <ShowcaseStyles />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[min(900px,120vw)] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-[110px]"
      />
      <div className="container relative mx-auto px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Placement Day</Eyebrow>
          <h2
            id="journey-title"
            className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.6rem]"
          >
            Ek din. Paanch round. <span className={GRADIENT_TEXT}>Ek AI coach.</span>
          </h2>
          <p className="text-balance mt-4 text-[15px] leading-relaxed text-gray-400 sm:text-base">
            From hall ticket to offer letter, Sarthi runs every round like a real campus drive, explains every score and
            tells you exactly what to fix next.
          </p>
        </Reveal>

        <div className="mt-10 xl:mt-14 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-12">
          {/* xl+: sticky preview of the active step */}
          <div className="hidden min-w-0 xl:block">
            <div className="sticky top-24">
              <StepPreview active={Math.max(0, active)} />
            </div>
          </div>

          {/* Vertical rail */}
          <ol className="mx-auto max-w-3xl xl:mx-0 xl:max-w-none">
            {STEPS.map((step, i) => {
              const isLit = i < lit
              const isActive = i === active
              return (
                <li key={step.id} className="group relative flex gap-3 pb-4 last:pb-0 sm:gap-4">
                  <div className="relative flex w-9 shrink-0 justify-center">
                    <span
                      ref={(el) => {
                        mobNodes.current[i] = el
                      }}
                      className="mt-4 block"
                    >
                      <StepNode step={step} lit={isLit} active={isActive} />
                    </span>
                    {i < N - 1 && (
                      <span
                        aria-hidden
                        className="absolute -bottom-4 left-1/2 top-[52px] w-0.5 -translate-x-1/2 overflow-hidden bg-white/[0.08]"
                      >
                        <span
                          ref={(el) => {
                            mobSeg.current[i] = el
                          }}
                          className="block h-full w-full origin-top bg-gradient-to-b from-blue-400 via-cyan-300 to-emerald-400"
                          style={{ transform: 'scaleY(0)' }}
                        />
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex min-w-0 flex-1 items-start gap-3 rounded-2xl border p-3.5 transition-all duration-500 sm:gap-5 sm:p-4',
                      isActive
                        ? 'border-cyan-300/40 bg-cyan-400/[0.05] shadow-[0_16px_40px_-20px_rgba(34,211,238,0.5)]'
                        : isLit
                          ? 'border-white/[0.1] bg-white/[0.03]'
                          : 'border-white/[0.06] bg-white/[0.015]',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
                          isLit ? 'text-cyan-300' : 'text-gray-500',
                        )}
                      >
                        {step.round}
                      </p>
                      <h3 className="mt-1 text-[15px] font-semibold leading-snug text-white sm:text-base">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-gray-400 sm:text-sm">{step.ai}</p>
                      <div className="mt-2.5">
                        <MetricChip text={step.metric} lit={isLit} />
                      </div>
                    </div>
                    <div className="relative aspect-[16/10] w-[104px] shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0f1a] sm:w-[190px] xl:hidden">
                      <StepVisual step={step} lit={isLit} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Outcome */}
        <Reveal className="mt-12 sm:mt-16">
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 text-center sm:flex-row sm:gap-10 sm:p-8 sm:text-left">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl"
            />
            <div ref={ringRef} className="relative flex min-h-[188px] w-[150px] shrink-0 items-center justify-center">
              {ringIn ? (
                <ScoreRing
                  value={STORY.priNow}
                  from={STORY.priStart}
                  size={148}
                  stroke={11}
                  label="PRI"
                  durationMs={1600}
                />
              ) : null}
            </div>
            <div className="relative min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Placement Day complete
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                PRI {STORY.priStart} → {STORY.priNow} · <span className={GRADIENT_TEXT}>Interview-ready</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-[15px]">
                {STORY.name}, {STORY.branch}: three attempts, every gap explained, and drives she now qualifies for.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <HonestyChip label="Illustrative persona" />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/placement/"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#060a13] transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Start Placement Day
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  href="/placement/report/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-gray-100 transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  See the readiness report
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
