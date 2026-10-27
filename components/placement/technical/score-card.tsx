'use client'

import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Gauge, Lightbulb, Sparkles } from 'lucide-react'
import { ScoreRing } from '@/components/ai/score-ring'
import { CountUp } from '@/components/ai/count-up'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export type ScoreChipTone = 'ok' | 'warn' | 'info' | 'penalty' | 'time'

export interface ScoreChip {
  id: string
  label: Bi | string
  tone?: ScoreChipTone
}

const CHIP_CLASS: Record<ScoreChipTone, string> = {
  ok: 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200',
  warn: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-200',
  info: 'border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-100',
  penalty: 'border-violet-400/25 bg-violet-400/[0.08] text-violet-200',
  time: 'border-white/10 bg-white/[0.04] text-gray-300',
}

const CHIP_ICON: Record<ScoreChipTone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  info: Gauge,
  penalty: Lightbulb,
  time: Clock3,
}

const T = {
  round: { en: 'Round score', hi: 'राउंड स्कोर', hinglish: 'Round score' },
  outOf: { en: 'out of 100', hi: '100 में से', hinglish: '100 mein se' },
} satisfies Record<string, Bi>

export interface ScoreCardProps {
  score: number
  title?: Bi | string
  subtitle?: Bi | string
  chips: ScoreChip[]
  /** Extra controls (e.g. the Next round CTA) under the chips. */
  actions?: ReactNode
  /** Skip the count-up (fast-forward / revisit). */
  instant?: boolean
  className?: string
}

/** Round result: ring + "Round score N" + evidence chips (tests, efficiency, hints, time). */
export function ScoreCard({ score, title, subtitle, chips, actions, instant = false, className }: ScoreCardProps) {
  const safe = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0
  return (
    <section
      aria-live="polite"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] via-cyan-300/[0.04] to-blue-500/[0.05] p-4 sm:p-6',
        'shadow-[0_24px_60px_-30px_rgba(16,185,129,0.45)]',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
        <ScoreRing
          value={safe}
          size={124}
          stroke={10}
          showBand={false}
          durationMs={instant ? 1 : 1200}
          label={T.round}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] text-gray-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
            {title ? <Tr b={title} /> : <Tr b={{ en: 'Scored by Sarthi AI', hi: 'सारथी AI द्वारा स्कोर', hinglish: 'Sarthi AI ne score kiya' }} />}
          </div>
          <h3 className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 text-2xl font-semibold tracking-tight text-white sm:justify-start sm:text-[28px]">
            <Tr b={T.round} />
            {instant ? (
              <span className="ai-gradient-text tabular-nums">{safe}</span>
            ) : (
              <CountUp value={safe} durationMs={1100} className="ai-gradient-text" />
            )}
            <Tr b={T.outOf} className="text-[13px] font-normal text-gray-500" />
          </h3>
          {subtitle && <Tr b={subtitle} as="p" className="mt-1 block text-[13.5px] leading-relaxed text-gray-400" />}
          <ul className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {chips.map((c, i) => {
              const tone = c.tone ?? 'info'
              const Icon = CHIP_ICON[tone]
              return (
                <li
                  key={c.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-medium',
                    !instant && 'motion-safe:animate-[tile-pop_420ms_ease-out_both]',
                    CHIP_CLASS[tone],
                  )}
                  style={instant ? undefined : { animationDelay: `${300 + i * 110}ms` }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <Tr b={c.label} />
                </li>
              )
            })}
          </ul>
          {actions && <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
