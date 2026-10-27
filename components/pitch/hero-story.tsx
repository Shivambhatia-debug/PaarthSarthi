'use client'

/* /placement-os hero: a short agent "boot" (AgentLog), then the problem story fades up and
 * Sarthi AI streams today's state pulse (think -> stream -> score -> act). */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, FileText, GraduationCap, Mic, TrendingUp } from 'lucide-react'
import { AgentLog } from '@/components/ai/agent-log'
import { AIBadge } from '@/components/ai/ai-badge'
import { AIOrb } from '@/components/ai/ai-orb'
import { AISurface } from '@/components/ai/ai-surface'
import { CountUp } from '@/components/ai/count-up'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, isDevanagari, type Bi, type Lang } from '@/lib/os/i18n'
import { PREVIEW, REPORTED, WEEK_LABEL } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Copy (numbers always from lib/mock)
// ---------------------------------------------------------------------------

const BOOT_STEPS: Bi[] = [
  {
    en: `Connecting ${PREVIEW.institutions} institutions…`,
    hi: `${PREVIEW.institutions} संस्थानों से जुड़ रहे हैं…`,
    hinglish: `${PREVIEW.institutions} institutions se connect ho rahe hain…`,
  },
  {
    en: `Computing Placement Readiness Index for ${fmtIN(PREVIEW.onboarded)} students…`,
    hi: `${fmtIN(PREVIEW.onboarded)} छात्रों का प्लेसमेंट रेडीनेस इंडेक्स निकाल रहे हैं…`,
    hinglish: `${fmtIN(PREVIEW.onboarded)} students ka Placement Readiness Index compute ho raha hai…`,
  },
  { en: 'Ready', hi: 'तैयार', hinglish: 'Ready' },
]

const BOOT_TITLE: Bi = { en: 'Sarthi AI · state boot', hi: 'सारथी AI · राज्य डेटा' }

const EYEBROW: Bi = {
  en: 'ParthSarthi Placement OS · for DSTTE, Bihar',
  hi: 'ParthSarthi प्लेसमेंट OS · DSTTE, बिहार के लिए',
}

type H1Parts = { a: string; b: string; k: string; c: string }
const H1: Record<Lang, H1Parts> = {
  hinglish: { a: 'Bihar ne har zile mein college bana diya.', b: 'Ab sawaal hai: kaun ', k: 'interview-ready', c: ' hai?' },
  en: { a: 'Bihar has built a college in every district.', b: 'Now the question is: who is ', k: 'interview-ready', c: '?' },
  hi: { a: 'बिहार ने हर ज़िले में कॉलेज बना दिया।', b: 'अब सवाल है: कौन ', k: 'इंटरव्यू के लिए तैयार', c: ' है?' },
}

const seats = REPORTED.seats2026
const seatLo = Math.floor(Math.min(seats.btech.pct, seats.diploma.pct))
const seatHi = Math.floor(Math.max(seats.btech.pct, seats.diploma.pct))

const SUBLINE: Bi = {
  en: `An engineering college in all ${REPORTED.institutions.gec} districts, ${REPORTED.institutions.gp} polytechnics, seats ${seatLo}-${seatHi}% filled. The next battle is readiness.`,
  hi: `सभी ${REPORTED.institutions.gec} ज़िलों में इंजीनियरिंग कॉलेज, ${REPORTED.institutions.gp} पॉलिटेक्निक, ${seatLo}-${seatHi}% सीटें भरी हुईं। अगली लड़ाई तैयारी की है।`,
}

const TAGLINE_HI = 'हर छात्र इंटरव्यू के लिए तैयार। हर ज़िले का लाइव डेटा।'

const PULSE_TITLE: Bi = { en: 'Live state pulse', hi: 'राज्य की लाइव नब्ज़', hinglish: 'Live state pulse' }
const PULSE: Bi = {
  hinglish: `Aaj ${fmtIN(PREVIEW.today.aiInterviews)} students ne AI mock interview diya; ${fmtIN(PREVIEW.today.newlyReady)} naye students interview-ready bane.`,
  en: `Today ${fmtIN(PREVIEW.today.aiInterviews)} students took an AI mock interview; ${fmtIN(PREVIEW.today.newlyReady)} more became interview-ready.`,
  hi: `आज ${fmtIN(PREVIEW.today.aiInterviews)} छात्रों ने AI मॉक इंटरव्यू दिया; ${fmtIN(PREVIEW.today.newlyReady)} नए छात्र इंटरव्यू के लिए तैयार हुए।`,
}
const ILLUSTRATIVE: Bi = { en: 'Illustrative', hi: 'सांकेतिक' }

const STATS: { id: string; Icon: typeof Mic; label: Bi; value: number; decimals: number; sub?: Bi; tone: string }[] = [
  {
    id: 'interviews',
    Icon: Mic,
    label: { en: 'AI interviews today', hi: 'आज AI इंटरव्यू', hinglish: 'Aaj AI interviews' },
    value: PREVIEW.today.aiInterviews,
    decimals: 0,
    tone: 'text-violet-300 bg-violet-400/10 ring-violet-400/25',
  },
  {
    id: 'ready',
    Icon: GraduationCap,
    label: { en: 'Newly interview-ready', hi: 'नए तैयार छात्र', hinglish: 'Naye interview-ready' },
    value: PREVIEW.today.newlyReady,
    decimals: 0,
    tone: 'text-cyan-300 bg-cyan-400/10 ring-cyan-400/25',
  },
  {
    id: 'pri',
    Icon: TrendingUp,
    label: { en: 'Avg PRI, state', hi: 'राज्य का औसत PRI', hinglish: 'State avg PRI' },
    value: PREVIEW.avgPri,
    decimals: 1,
    sub: {
      en: `+${fmtNum(PREVIEW.avgPri - PREVIEW.baselinePri, 1)} vs baseline`,
      hi: `बेसलाइन से +${fmtNum(PREVIEW.avgPri - PREVIEW.baselinePri, 1)}`,
    },
    tone: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/25',
  },
]

const CTA_START: Bi = { en: 'Start guided demo', hi: 'गाइडेड डेमो शुरू करें', hinglish: 'Guided demo shuru karein' }
const CTA_PILOT: Bi = { en: 'See pilot proposal', hi: 'पायलट प्रस्ताव देखें', hinglish: 'Pilot proposal dekhein' }

const LIVE: Bi = { en: 'Live', hi: 'लाइव' }
const BOOTING: Bi = { en: 'Booting', hi: 'शुरू हो रहा है' }

/** Fades its content up once the boot log is done (60 ms stagger). Invisible, but laid out, before. */
function Rise({ i, ready, className, children }: { i: number; ready: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(ready ? 'os-rise' : 'opacity-0', className)}
      style={ready ? { animationDelay: `${i * 60}ms` } : undefined}
      aria-hidden={ready ? undefined : true}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface HeroStoryProps {
  /** Called once when the boot log finishes (or after a safety timeout). */
  onReady?: () => void
  className?: string
}

export function HeroStory({ onReady, className }: HeroStoryProps) {
  const router = useRouter()
  const { lang, presenter } = useDemo()
  const [ready, setReady] = useState(false)
  const [streamed, setStreamed] = useState(false)
  const firedRef = useRef(false)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  const markReady = useCallback(() => {
    setReady(true)
    if (!firedRef.current) {
      firedRef.current = true
      onReadyRef.current?.()
    }
  }, [])

  // Safety net: never leave the story hidden (e.g. a throttled background tab).
  useEffect(() => {
    const id = setTimeout(markReady, 4000)
    return () => clearTimeout(id)
  }, [markReady])

  const h1 = H1[lang] ?? H1.en
  const h1Deva = isDevanagari(h1.a)

  const startDemo = () => {
    if (presenter) {
      aiToast('Presenter: F fast-forwards, A autopilots', { tone: 'ai', id: 'presenter-hint', duration: 5000 })
    }
    router.push('/placement')
  }

  return (
    <section aria-label="ParthSarthi Placement OS" className={cn('relative isolate', className)}>
      {/* Ambient glow (clipped so it never causes horizontal scroll) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-[8%] h-72 w-[46%] rounded-full bg-blue-500/[0.07] blur-3xl" />
        <div className="absolute -top-10 right-[4%] h-64 w-[34%] rounded-full bg-emerald-400/[0.06] blur-3xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-x-10 lg:gap-y-5">
        {/* 1 · Boot console (top on mobile, right column on desktop) */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 shadow-[0_24px_60px_-34px_rgba(34,211,238,0.35)] sm:p-4">
            <div className="mb-3 flex items-center gap-3">
              <AIOrb state={ready ? 'idle' : 'thinking'} size={40} label="" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AIBadge />
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium ring-1',
                      ready
                        ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25'
                        : 'bg-violet-400/10 text-violet-200 ring-violet-400/25',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('h-1.5 w-1.5 rounded-full', ready ? 'bg-emerald-400' : 'animate-pulse bg-violet-300')}
                    />
                    <Tr b={ready ? LIVE : BOOTING} />
                  </span>
                </div>
                <Tr as="p" b={WEEK_LABEL} className="mt-1 truncate text-[12px] text-gray-500" />
              </div>
            </div>
            <AgentLog steps={BOOT_STEPS} stepMs={420} onDone={markReady} title={BOOT_TITLE} />
          </div>
        </div>

        {/* 2 · Story */}
        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
          <Rise i={0} ready={ready}>
            <Tr b={EYEBROW} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90" />
          </Rise>

          <Rise i={1} ready={ready} className="mt-3">
            <h1
              lang={h1Deva ? 'hi' : 'en'}
              className={cn(
                'text-[30px] font-semibold leading-[1.12] tracking-tight text-white sm:text-[40px] lg:text-[46px]',
                h1Deva && 'font-deva leading-[1.3]',
              )}
            >
              <span className="block text-gray-300">{h1.a}</span>
              <span className="mt-1 block">
                {h1.b}
                <span className="ai-gradient-text">{h1.k}</span>
                {h1.c}
              </span>
            </h1>
          </Rise>

          <Rise i={2} ready={ready} className="mt-5">
            <Tr as="p" b={SUBLINE} className="max-w-xl text-[15px] leading-relaxed text-gray-300 sm:text-[16px]" />
          </Rise>
          <Rise i={3} ready={ready} className="mt-3">
            <Tr as="p" b={TAGLINE_HI} className="text-[16px] font-medium text-emerald-200/90 sm:text-[17px]" />
          </Rise>

          {/* CTAs */}
          <Rise i={4} ready={ready} className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startDemo}
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 px-5 text-[14px] font-semibold text-white shadow-[0_10px_34px_-12px_rgba(34,211,238,0.75)] outline-none ring-1 ring-white/15 transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_14px_40px_-12px_rgba(34,211,238,0.9)] focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Tr b={CTA_START} />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              {presenter && (
                <kbd className="ml-0.5 rounded border border-white/30 bg-black/20 px-1.5 font-mono text-[12px] leading-5 text-white/90">
                  1
                </kbd>
              )}
            </button>
            <Link
              href="/pilot"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-5 text-[14px] font-medium text-gray-200 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <FileText className="h-4 w-4 text-gray-400" aria-hidden />
              <Tr b={CTA_PILOT} />
              {presenter && (
                <kbd className="ml-0.5 rounded border border-white/15 bg-white/5 px-1.5 font-mono text-[12px] leading-5 text-gray-400">5</kbd>
              )}
            </Link>
          </Rise>
        </div>

        {/* 3 · Streaming pulse */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-2">
          {ready ? (
            <AISurface
              title={PULSE_TITLE}
              meta={false}
              actions={<IllustrativeChip label={ILLUSTRATIVE} />}
              className="os-rise"
            >
              <StreamingText text={PULSE} className="text-[15px] leading-relaxed text-gray-100" onDone={() => setStreamed(true)} />
              <div
                className={cn(
                  'mt-4 grid grid-cols-3 gap-2 transition-opacity duration-500',
                  streamed ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden={!streamed}
              >
                {STATS.map((s) => (
                  <div key={s.id} className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1', s.tone)}>
                        <s.Icon className="h-3 w-3" aria-hidden />
                      </span>
                      <Tr b={s.label} className="min-w-0 truncate text-[12px] text-gray-400" />
                    </div>
                    <div className="mt-1 text-[20px] font-semibold leading-none tracking-tight text-white">
                      {streamed ? (
                        <CountUp value={s.value} decimals={s.decimals} />
                      ) : (
                        <span className="tabular-nums">0</span>
                      )}
                    </div>
                    {s.sub && <Tr b={s.sub} className="mt-1 block truncate text-[12px] text-emerald-300/90" />}
                  </div>
                ))}
              </div>
            </AISurface>
          ) : (
            <div aria-hidden className="h-[176px] rounded-2xl border border-white/[0.06] bg-white/[0.015]" />
          )}
        </div>
      </div>
    </section>
  )
}
