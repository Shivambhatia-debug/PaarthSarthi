'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Headphones, Loader2, Mic, ShieldCheck } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { emitDemo, useDemo, useDemoEvent, type DemoEventName } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { SPEECH_NOTE } from '@/lib/mock/state'
import { unlockAudio } from '@/hooks/use-speech'
import { cn } from '@/lib/utils'

const START: Bi = { en: 'Start', hi: 'शुरू करें' }
const HINT: Bi = {
  en: 'Use headphones if you can. Allow the microphone when Chrome asks.',
  hi: 'हो सके तो हेडफ़ोन लगाएँ। Chrome पूछे तो माइक्रोफ़ोन की अनुमति दें।',
}

export interface AudioGateProps {
  title: Bi | string
  body?: Bi | string
  startLabel?: Bi | string
  note?: Bi | string
  /** Optional (additive): replaces the default headphones / microphone hint. */
  hint?: Bi | string
  onStart?: () => unknown
  children: ReactNode
  /**
   * Optional (additive): when the gate is opened by an 'autopilot' or 'fastforward' event, re-dispatch that
   * event once the children have mounted, so the content (which was not mounted yet) also receives it.
   * Default true. Handlers for these events should therefore be idempotent.
   */
  replayEvent?: boolean
  className?: string
}

/**
 * Start gate for speech screens. Chrome blocks audio and speech synthesis until a user gesture, so the
 * Start button resumes the shared AudioContext and primes speechSynthesis before the children mount.
 * Autopilot / fast-forward pass the gate automatically. 'started' lives only as long as this component.
 */
export function AudioGate({
  title,
  body,
  startLabel = START,
  note = SPEECH_NOTE,
  hint,
  onStart,
  children,
  replayEvent = true,
  className,
}: AudioGateProps) {
  const { lang, lite } = useDemo()
  const [started, setStarted] = useState(false)
  const [starting, setStarting] = useState(false)
  const busy = useRef(false)
  const pendingReplay = useRef<DemoEventName | null>(null)
  const onStartRef = useRef(onStart)
  onStartRef.current = onStart

  const start = useCallback(async (via?: DemoEventName) => {
    if (busy.current) return
    busy.current = true
    setStarting(true)
    try {
      await Promise.race([unlockAudio(), new Promise<void>((r) => setTimeout(r, 1500))])
    } catch {
      /* audio unlock is best-effort */
    }
    try {
      await onStartRef.current?.()
    } catch {
      /* never block the demo on a start hook */
    }
    if (via) pendingReplay.current = via
    setStarting(false)
    setStarted(true)
  }, [])

  useDemoEvent('autopilot', () => {
    if (!started) void start('autopilot')
  })
  useDemoEvent('fastforward', () => {
    if (!started) void start('fastforward')
  })

  // Re-dispatch the event that opened the gate once the content has mounted (and registered its listeners).
  useEffect(() => {
    if (!started || !replayEvent) return
    const ev = pendingReplay.current
    if (!ev) return
    pendingReplay.current = null
    const id = setTimeout(() => emitDemo(ev), 60)
    return () => clearTimeout(id)
  }, [started, replayEvent])

  if (started) return <>{children}</>

  const T = (b: Bi | string) => tr(b, lang)
  const span = (b: Bi | string, c?: string) => {
    const s = T(b)
    const d = isDevanagari(s)
    return (
      <span lang={d ? 'hi' : 'en'} className={cn(d && 'font-deva', c)}>
        {s}
      </span>
    )
  }

  return (
    <div className={cn('flex min-h-[60vh] w-full items-center justify-center px-1 py-8', className)}>
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 pb-7 pt-8 text-center shadow-[0_30px_80px_-40px_rgba(34,211,238,0.35)] sm:px-10">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto mb-5 flex justify-center">
          <AIOrb state={starting ? 'thinking' : 'idle'} size={112} />
        </div>
        <h2 className="relative text-xl font-semibold leading-snug text-white sm:text-2xl">{span(title)}</h2>
        {body && <p className="relative mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-gray-400">{span(body)}</p>}

        <button
          type="button"
          onClick={() => void start()}
          disabled={starting}
          className={cn(
            'group relative mx-auto mt-7 inline-flex h-14 min-w-[220px] items-center justify-center gap-2.5 rounded-xl px-8 text-base font-semibold text-[#031018]',
            'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 shadow-[0_12px_40px_-12px_rgba(34,211,238,0.8)]',
            'transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-14px_rgba(34,211,238,0.95)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]',
            'disabled:cursor-wait disabled:opacity-80',
          )}
        >
          {!lite && !starting && (
            <span className="pulse-ring pointer-events-none absolute inset-0 rounded-xl border-2 border-cyan-300/70" aria-hidden />
          )}
          {starting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
          {span(startLabel)}
        </button>

        <p className="relative mx-auto mt-4 flex max-w-sm items-start justify-center gap-1.5 text-[12px] leading-snug text-gray-500">
          <Headphones className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {span(hint ?? HINT)}
        </p>
        {note && (
          <p className="relative mx-auto mt-4 flex max-w-sm items-start justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-left text-[12px] leading-snug text-gray-400">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden />
            {span(note)}
          </p>
        )}
      </div>
    </div>
  )
}
