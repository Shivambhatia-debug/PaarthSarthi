'use client'

// PRI distribution for Batch 2027: current buckets (coloured by band) over a dashed ghost series
// "before pilot" (the same students at their diagnostic). Buckets come from histogramFor(b):
// they sum to b.onboarded and the 70+ buckets sum to b.interviewReady.
// Recharts rule: chart children are direct children or keyed arrays, never fragments.

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { bandFor } from '@/lib/os/scoring'
import { fmtIN, fmtPct, type Bi } from '@/lib/os/i18n'
import type { BatchMetrics } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { chartTipClass } from '@/components/tpo/tpo-header'
import { histogramFor, type HistBucket } from '@/components/tpo/tpo-data'

const UI = {
  now: { en: 'Now', hi: 'अभी' },
  before: { en: 'Before pilot (diagnostic)', hi: 'पायलट से पहले (डायग्नोस्टिक)' },
  students: { en: 'students', hi: 'छात्र' },
  pri: { en: 'PRI', hi: 'PRI' },
} satisfies Record<string, Bi>

function TipBox({ active, payload, lang }: { active?: boolean; payload?: { payload?: HistBucket }[]; lang: 'en' | 'hi' }) {
  const d = payload?.[0]?.payload
  if (!active || !d) return null
  const band = bandFor(d.lo)
  const L = (b: Bi) => (lang === 'hi' ? b.hi : b.en)
  return (
    <div className={chartTipClass}>
      <div className="mb-1 flex items-center gap-2 font-semibold text-white">
        <span className="h-2 w-2 rounded-full" style={{ background: band.hex }} />
        PRI {d.label}
        <span lang={lang} className={cn('font-normal text-gray-400', lang === 'hi' && 'font-deva')}>
          · {L(band.label)}
        </span>
      </div>
      <div lang={lang} className={cn('tabular-nums', lang === 'hi' && 'font-deva')}>
        {L(UI.now)}: <span className="font-semibold text-white">{fmtIN(d.now)}</span>
      </div>
      <div lang={lang} className={cn('tabular-nums text-gray-400', lang === 'hi' && 'font-deva')}>
        {L(UI.before)}: {fmtIN(d.before)}
      </div>
    </div>
  )
}

export function ReadinessHistogram({ b, className }: { b: BatchMetrics; className?: string }) {
  const { lang, state } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const data = useMemo(() => histogramFor(b), [b])
  const animate = !state.lite

  const readyNow = data.filter((d) => d.lo >= 70).reduce((s, d) => s + d.now, 0)
  const readyBefore = data.filter((d) => d.lo >= 70).reduce((s, d) => s + d.before, 0)
  const lowNow = data.filter((d) => d.lo < 50).reduce((s, d) => s + d.now, 0)
  const lowBefore = data.filter((d) => d.lo < 50).reduce((s, d) => s + d.before, 0)
  const total = Math.max(1, b.onboarded)

  const chips: { key: string; b: Bi; cls: string }[] = [
    {
      key: 'ready',
      cls: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
      b: {
        en: `Interview-ready (70+): ${fmtIN(readyNow)} · was ${fmtIN(readyBefore)}`,
        hi: `इंटरव्यू के लिए तैयार (70+): ${fmtIN(readyNow)} · पहले ${fmtIN(readyBefore)}`,
      },
    },
    {
      key: 'low',
      cls: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
      b: {
        en: `Below 50: ${fmtPct((lowNow / total) * 100, 0)} · was ${fmtPct((lowBefore / total) * 100, 0)}`,
        hi: `50 से कम: ${fmtPct((lowNow / total) * 100, 0)} · पहले ${fmtPct((lowBefore / total) * 100, 0)}`,
      },
    },
    {
      key: 'sum',
      cls: 'border-white/10 bg-white/[0.04] text-gray-300',
      b: { en: `${fmtIN(b.onboarded)} onboarded students`, hi: `${fmtIN(b.onboarded)} ऑनबोर्ड छात्र` },
    },
  ]

  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c.key} className={cn('inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-medium tabular-nums', c.cls)}>
            <Tr b={c.b} />
          </span>
        ))}
      </div>

      <div className="h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: -12 }} barCategoryGap="16%">
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              xAxisId="now"
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              tickLine={false}
            />
            <XAxis xAxisId="ghost" dataKey="label" hide />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.035)' }} content={<TipBox lang={ol} />} />
            <Bar
              xAxisId="ghost"
              dataKey="before"
              maxBarSize={58}
              fill="rgba(148,163,184,0.07)"
              stroke="rgba(148,163,184,0.55)"
              strokeDasharray="4 3"
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
            <Bar xAxisId="now" dataKey="now" maxBarSize={30} radius={[6, 6, 0, 0]} isAnimationActive={animate} animationDuration={700}>
              {data.map((d) => (
                <Cell key={`c-${d.id}`} fill={bandFor(d.lo).hex} fillOpacity={0.9} />
              ))}
              <LabelList dataKey="now" position="top" fill="#e5e7eb" fontSize={12} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex gap-0.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
          </span>
          <Tr b={{ en: 'Now, coloured by PRI band', hi: 'अभी, PRI बैंड के रंग में' }} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-4 rounded-sm border border-dashed border-slate-400/70 bg-slate-400/10" />
          <Tr b={UI.before} />
        </span>
        <span className="ml-auto text-gray-500">
          <Tr b={{ en: 'Students per PRI bucket', hi: 'हर PRI समूह में छात्र' }} />
        </span>
      </div>
    </div>
  )
}
