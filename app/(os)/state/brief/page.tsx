'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Languages, Printer, RefreshCw, Sparkles } from 'lucide-react'
import { AIThinking } from '@/components/ai/ai-thinking'
import { AIBadge } from '@/components/ai/ai-badge'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { OfficerScope, emitDemo, useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { printOnly } from '@/lib/os/print'
import { PREVIEW } from '@/lib/mock/state'
import type { Bi } from '@/lib/os/i18n'
import { BriefDocument } from '@/components/state/brief-document'
import { BRIEF_SECTIONS, type BriefVariant } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  back: { en: 'Back to Command Centre', hi: 'कमांड सेंटर पर वापस' },
  title: { en: "Secretary's weekly brief", hi: 'सचिव का साप्ताहिक ब्रीफ़' },
  sub: {
    en: 'Every Monday, this lands on your desk. Drafted by Sarthi AI, reviewed by your team.',
    hi: 'हर सोमवार यह आपकी मेज़ पर होगा। सारथी AI द्वारा तैयार, आपकी टीम द्वारा समीक्षित।',
  },
  thinking: {
    en: `Summarising 7 days across ${PREVIEW.institutions} institutions…`,
    hi: `${PREVIEW.institutions} संस्थानों के 7 दिनों का सारांश बना रहे हैं…`,
  },
  simpler: { en: 'Regenerate in simpler Hindi', hi: 'सरल हिंदी में दोबारा बनाएँ' },
  standard: { en: 'Back to standard Hindi', hi: 'मानक हिंदी पर लौटें' },
  print: { en: 'Print / Save PDF', hi: 'प्रिंट / PDF सहेजें' },
  both: { en: 'Both', hi: 'दोनों' },
  hint: { en: 'Click anywhere to show everything', hi: 'सब कुछ दिखाने के लिए कहीं भी क्लिक करें' },
  regenerated: { en: 'Regenerated in simpler Hindi', hi: 'सरल हिंदी में दोबारा बनाया गया' },
} satisfies Record<string, Bi>

type Mode = 'en' | 'hi' | 'both'

const THINK_MS = 1200
const STEP_MS = 400

export default function BriefPage() {
  return (
    <OfficerScope>
      <BriefView />
    </OfficerScope>
  )
}

function BriefView() {
  const { t, lang, lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const [picked, setPicked] = useState<Mode | null>(null)
  const mode: Mode = picked ?? (lang === 'hi' ? 'hi' : 'en')
  const [simple, setSimple] = useState(false)
  const [run, setRun] = useState(0)
  const [thinking, setThinking] = useState(true)
  const [revealed, setRevealed] = useState(0)
  const paperRef = useRef<HTMLDivElement>(null)

  // Thinking for 1.2 s, then reveal one section about every 400 ms. Re-runs on 'Regenerate'.
  useEffect(() => {
    if (reduced) {
      setThinking(false)
      setRevealed(BRIEF_SECTIONS)
      return
    }
    setThinking(true)
    setRevealed(0)
    const timers: number[] = []
    const think = run === 0 ? THINK_MS : 700
    timers.push(window.setTimeout(() => setThinking(false), think))
    for (let i = 1; i <= BRIEF_SECTIONS; i++) {
      timers.push(window.setTimeout(() => setRevealed((r) => Math.max(r, i)), think + (i - 1) * STEP_MS + 60))
    }
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [run, reduced])

  const finishAll = useCallback(() => {
    setThinking(false)
    setRevealed(BRIEF_SECTIONS)
  }, [])
  useDemoEvent('finish', finishAll)
  useDemoEvent('fastforward', finishAll)

  const done = !thinking && revealed >= BRIEF_SECTIONS

  const onPageClick = () => {
    if (!done) emitDemo('finish')
  }

  const doPrint = () => {
    finishAll()
    window.setTimeout(() => printOnly(paperRef.current), 80)
  }

  const variants: BriefVariant[] =
    mode === 'both' ? ['en', simple ? 'hi-simple' : 'hi'] : mode === 'hi' ? [simple ? 'hi-simple' : 'hi'] : ['en']

  const modeBtn = (m: Mode, label: Bi | string, hiFont?: boolean) => (
    <button
      key={m}
      type="button"
      onClick={() => setPicked(m)}
      aria-pressed={mode === m}
      className={cn(
        'h-8 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
        hiFont && 'font-deva',
        mode === m ? 'bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]' : 'text-gray-400 hover:text-white',
      )}
    >
      {typeof label === 'string' ? label : <Tr b={label} />}
    </button>
  )

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-4 sm:px-6 lg:pt-6" onClick={onPageClick}>
      {/* Controls (never printed) */}
      <div className="no-print mb-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/state"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            <Tr b={T.back} />
          </Link>
          <AIBadge size="md" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent p-4 sm:p-5">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.10] blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[28px]">
                <Tr b={T.title} />
              </h1>
              <Tr as="p" b={T.sub} className="mt-1 block max-w-[60ch] text-[14px] text-gray-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Brief language" className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-black/30 p-1">
                <Languages aria-hidden className="mx-1.5 h-4 w-4 text-gray-500" />
                {modeBtn('hi', 'हिंदी', true)}
                {modeBtn('en', 'English')}
                {modeBtn('both', T.both)}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const next = !simple
                  setSimple(next)
                  if (next && mode === 'en') setPicked('hi')
                  setRun((r) => r + 1)
                  if (next) aiToast(t(T.regenerated), { tone: 'ai' })
                }}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300',
                  simple
                    ? 'border-violet-400/40 bg-violet-500/15 text-violet-100'
                    : 'border-violet-400/25 bg-violet-500/[0.08] text-violet-100 hover:border-violet-300/60',
                )}
              >
                <RefreshCw aria-hidden className="h-4 w-4" />
                <Tr b={simple ? T.standard : T.simpler} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  doPrint()
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 text-[13px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <Printer aria-hidden className="h-4 w-4" />
                <Tr b={T.print} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-[20px] items-center gap-2 text-[12px] text-gray-500">
          {!done && (
            <>
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-violet-300" />
              <Tr b={T.hint} />
            </>
          )}
        </div>
      </div>

      {thinking && (
        <div className="no-print mx-auto mb-5 max-w-[794px]">
          <AIThinking label={T.thinking} lines={3} />
        </div>
      )}

      <div ref={paperRef} className={cn('space-y-6', thinking && 'pointer-events-none')}>
        {variants.map((v, i) => (
          <BriefDocument
            key={`${v}-${run}`}
            variant={v}
            revealed={thinking ? 0 : revealed}
            className={cn('mx-auto', i > 0 && 'print-break')}
          />
        ))}
      </div>
    </div>
  )
}
