'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, Filter, TrendingDown } from 'lucide-react'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { PanelCard } from '@/components/state/title-strip'
import { funnelSteps, topDropOff } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  title: { en: 'Readiness funnel', hi: 'तैयारी फ़नल' },
  sub: {
    en: 'From onboarding to offers · conversion between steps',
    hi: 'जुड़ने से ऑफ़र तक · हर चरण के बीच रूपांतरण',
  },
  reached: { en: 'reached the next step', hi: 'अगले चरण तक पहुँचे' },
} satisfies Record<string, Bi>

const BAR = [
  'from-blue-500/80 to-blue-400/60',
  'from-blue-400/80 to-cyan-400/60',
  'from-cyan-500/80 to-cyan-300/60',
  'from-cyan-400/80 to-teal-300/60',
  'from-teal-400/80 to-emerald-300/60',
  'from-emerald-500/80 to-emerald-300/60',
  'from-emerald-400/80 to-lime-300/60',
]

export function FunnelPanel({ className, index = 0 }: { className?: string; index?: number }) {
  const { lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const steps = useMemo(() => funnelSteps(), [])
  const drop = useMemo(() => topDropOff(), [])
  const first = steps[0]?.value ?? 0
  const [grown, setGrown] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setGrown(true)
      return
    }
    const id = window.setTimeout(() => setGrown(true), 120)
    return () => window.clearTimeout(id)
  }, [reduced])

  return (
    <PanelCard
      index={index}
      className={className}
      icon={Filter}
      accent="cyan"
      title={T.title}
      subtitle={T.sub}
      right={<IllustrativeChip responsive />}
    >
      {drop && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 text-[12.5px] text-amber-100">
          <TrendingDown aria-hidden className="h-4 w-4 shrink-0 text-amber-300" />
          <Tr
            b={{
              en: `Biggest drop-off: ${drop.from.label.en} → ${drop.to.label.en} (${fmtNum(drop.conv, 0)}% convert, ${fmtIN(drop.lost)} lost)`,
              hi: `सबसे बड़ी गिरावट: ${drop.from.label.hi} → ${drop.to.label.hi} (${fmtNum(drop.conv, 0)}% आगे बढ़े, ${fmtIN(drop.lost)} छूटे)`,
            }}
          />
        </div>
      )}

      <ol className="space-y-1">
        {steps.map((s, i) => {
          const w = first > 0 ? Math.max(2, (s.value / first) * 100) : 0
          const isDrop = !!drop && drop.to.id === s.id
          return (
            <li key={s.id}>
              {s.conv != null && (
                <div className="flex items-center gap-2 py-1 pl-1 text-[12px]">
                  <ArrowDown aria-hidden className={cn('h-3.5 w-3.5', isDrop ? 'text-amber-300' : 'text-gray-600')} />
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 tabular-nums',
                      isDrop ? 'bg-amber-400/15 font-semibold text-amber-200 ring-1 ring-amber-400/30' : 'bg-white/[0.05] text-gray-400',
                    )}
                  >
                    {fmtNum(s.conv, 0)}%
                  </span>
                  <Tr b={T.reached} className="text-gray-500" />
                </div>
              )}
              <div className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
                <Tr b={s.label} className="truncate text-[13px] text-gray-300" />
                <div className="relative h-8 overflow-hidden rounded-lg bg-white/[0.04]">
                  <div
                    className={cn(
                      'h-full rounded-lg bg-gradient-to-r transition-[width] duration-700 ease-out',
                      BAR[i % BAR.length],
                    )}
                    style={{ width: grown ? `${w}%` : '0%', transitionDelay: reduced ? '0ms' : `${i * 70}ms` }}
                  />
                  {/* Narrow bars: the number sits just outside the bar end instead of straddling it. */}
                  <span
                    className={cn(
                      'absolute inset-y-0 flex items-center whitespace-nowrap text-[13px] font-semibold tabular-nums',
                      w < 28 ? 'text-gray-200' : 'left-2.5 text-white drop-shadow',
                    )}
                    style={w < 28 ? { left: `calc(${grown ? w : 0}% + 8px)` } : undefined}
                  >
                    {fmtIN(s.value)}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </PanelCard>
  )
}
