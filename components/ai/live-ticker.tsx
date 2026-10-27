'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Award, BadgeCheck, Briefcase, GraduationCap, MapPin, Mic, type LucideIcon } from 'lucide-react'
import { useDemo, useLang } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { isDevanagari, tr } from '@/lib/os/i18n'
import { TICKER } from '@/lib/mock/ticker'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import type { TickerEvent } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

export interface LiveTickerProps {
  events?: ReadonlyArray<TickerEvent>
  intervalMs?: number
  onEvent?: (e: TickerEvent) => void
  className?: string
}

const KIND: Record<TickerEvent['kind'], { Icon: LucideIcon; cls: string }> = {
  interview: { Icon: Mic, cls: 'bg-violet-400/10 text-violet-300 ring-violet-400/25' },
  ready: { Icon: BadgeCheck, cls: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25' },
  drive: { Icon: Briefcase, cls: 'bg-blue-400/10 text-blue-300 ring-blue-400/25' },
  offer: { Icon: Award, cls: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25' },
  school: { Icon: GraduationCap, cls: 'bg-amber-400/10 text-amber-300 ring-amber-400/25' },
}

const TICKER_CSS = `
@keyframes psai-tick-in { from { opacity: 0; transform: translateY(70%) } to { opacity: 1; transform: none } }
@keyframes psai-tick-bar { from { transform: scaleX(0) } to { transform: scaleX(1) } }
.psai-tick-in { animation: psai-tick-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both }
.psai-tick-bar { animation-name: psai-tick-bar; animation-timing-function: linear; animation-fill-mode: both; transform-origin: left }
@media (prefers-reduced-motion: reduce) { .psai-tick-in, .psai-tick-bar { animation: none } }
.os-lite .psai-tick-in { animation: none }
`

const DISTRICT_NAME = new Map(DISTRICT_GEO.map((d) => [d.id, d] as const))

/**
 * One live event at a time, rotating every ~4.5 s (pauses on hover). Calls onEvent for each
 * event shown, so pages can pulse the matching district. Never printed (no-print).
 */
export function LiveTicker({ events = TICKER, intervalMs = 4500, onEvent, className }: LiveTickerProps) {
  const lang = useLang()
  const { state } = useDemo()
  const reduced = useReducedMotion() || !!state.lite
  const list = useMemo<TickerEvent[]>(() => (Array.isArray(events) ? (events as TickerEvent[]).filter(Boolean) : []), [events])
  const n = list.length
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const every = Math.max(1500, Number.isFinite(intervalMs) ? intervalMs : 4500)

  useEffect(() => {
    if (n <= 1 || paused) return
    const id = setInterval(() => setIdx((i) => (i + 1) % n), every)
    return () => clearInterval(id)
  }, [n, paused, every])

  const safeIdx = n ? idx % n : 0
  const ev = n ? list[safeIdx] : null

  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  useEffect(() => {
    if (ev) onEventRef.current?.(ev)
    // fire once per event shown
  }, [ev?.id, safeIdx])

  const text = ev ? tr(ev.text, lang) : lang === 'hi' ? 'गतिविधि की प्रतीक्षा…' : 'Waiting for activity…'
  const deva = isDevanagari(text)
  const kind = ev ? KIND[ev.kind] ?? KIND.ready : KIND.ready
  const Icon = kind.Icon
  const geo = ev ? DISTRICT_NAME.get(ev.districtId) : undefined
  const place = geo ? (lang === 'hi' ? geo.nameHi : geo.name) : ''

  return (
    <div
      className={cn(
        'no-print relative flex h-11 items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] pl-3 pr-3 sm:pr-4',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
      aria-atomic="true"
    >
      <style href="psai-ticker" precedence="default">
        {TICKER_CSS}
      </style>

      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 ring-1 ring-emerald-400/25">
        <span className="relative flex h-2 w-2">
          {!reduced && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[12px] font-semibold tracking-[0.14em] text-emerald-300">LIVE</span>
      </span>

      <div key={ev ? `${ev.id}-${safeIdx}` : 'empty'} className="psai-tick-in flex min-w-0 flex-1 items-center gap-2.5">
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1', kind.cls)}>
          <Icon aria-hidden className="h-3.5 w-3.5" />
        </span>
        <span
          lang={deva ? 'hi' : 'en'}
          title={text}
          className={cn('min-w-0 flex-1 truncate text-[13px] text-gray-200', deva && 'font-deva')}
        >
          {text}
        </span>
        {place && (
          <span
            lang={lang === 'hi' ? 'hi' : 'en'}
            className={cn('hidden shrink-0 items-center gap-1 text-[12px] text-gray-500 sm:inline-flex', lang === 'hi' && 'font-deva')}
          >
            <MapPin aria-hidden className="h-3 w-3" />
            {place}
          </span>
        )}
      </div>

      {n > 1 && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.04]">
          <span
            key={`bar-${safeIdx}-${paused ? 'p' : 'r'}`}
            className="psai-tick-bar block h-full bg-gradient-to-r from-blue-400/70 via-cyan-300/70 to-emerald-400/70"
            style={{ animationDuration: `${every}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </span>
      )}
    </div>
  )
}
