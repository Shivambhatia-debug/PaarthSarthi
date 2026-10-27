'use client'

import { useMemo } from 'react'
import { BrainCircuit } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CountUp } from '@/components/ai/count-up'
import { SourceNote } from '@/components/os/source-note'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { fmtIN, fmtNum, tr, type Bi } from '@/lib/os/i18n'
import { SOURCES } from '@/lib/mock/state'
import { PanelCard } from '@/components/state/title-strip'
import { aiPolicyInsight, aiPolicyStats, aiPolicyTargetLine } from '@/components/state/state-data'

const T = {
  title: { en: 'AI Policy tracker', hi: 'AI नीति ट्रैकर' },
  sub: { en: 'Students trained in AI skills this year', hi: 'इस वर्ष AI कौशल में प्रशिक्षित छात्र' },
  ofTarget: { en: 'of target', hi: 'लक्ष्य का' },
  trained: { en: 'trained', hi: 'प्रशिक्षित' },
  target: { en: 'target', hi: 'लक्ष्य' },
  monthly: { en: 'Trained per month', hi: 'प्रति माह प्रशिक्षित' },
} satisfies Record<string, Bi>

export function AiPolicyTracker({ className, index = 0 }: { className?: string; index?: number }) {
  const { t, lang, lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const s = useMemo(() => aiPolicyStats(), [])
  const radial = useMemo(() => [{ name: 'done', value: Math.min(100, s.pct), fill: '#22d3ee' }], [s.pct])
  const months = useMemo(
    () => s.months.map((m, i) => ({ id: m.month, label: tr(m.label, lang), value: m.value, last: i === s.months.length - 1 })),
    [s.months, lang],
  )
  // Even ticks (0, 4k, 8k, 12k, 16k for the current data) instead of recharts' auto ticks.
  const yMax = Math.max(4000, Math.ceil(Math.max(0, ...s.months.map((m) => m.value)) / 4000) * 4000)
  const yTicks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax]
  const insight = aiPolicyInsight()

  return (
    <PanelCard
      index={index}
      className={className}
      icon={BrainCircuit}
      accent="violet"
      title={T.title}
      subtitle={T.sub}
    >
      <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart data={radial} innerRadius="74%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={14}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                background={{ fill: 'rgba(255,255,255,0.06)' }}
                cornerRadius={8}
                isAnimationActive={!reduced}
                animationDuration={1000}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-semibold tabular-nums text-white">
              <CountUp value={s.pct} decimals={1} format={(n) => `${fmtNum(n)}%`} />
            </span>
            <Tr b={T.ofTarget} className="mt-1 max-w-[88px] text-center text-[12px] leading-tight text-gray-400" />
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl font-semibold tabular-nums text-white">
              <CountUp value={s.done} />
            </span>
            <span className="text-[13px] text-gray-400">
              <Tr b={T.trained} /> / {fmtIN(s.target)} <Tr b={T.target} />
            </span>
          </div>
          <p
            lang={lang === 'hi' ? 'hi' : 'en'}
            className={lang === 'hi' ? 'font-deva text-[13px] font-medium text-violet-200' : 'text-[13px] font-medium text-violet-200'}
          >
            {aiPolicyTargetLine(lang === 'hi' ? 'hi' : 'en')}
          </p>
          {t(insight) && <Tr as="p" b={insight} className="block text-[12.5px] leading-relaxed text-gray-400" />}
        </div>
      </div>

      <div className="mt-4">
        <Tr as="p" b={T.monthly} className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.12em] text-gray-500" />
        <div className="h-[130px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                domain={[0, yMax]}
                ticks={yTicks}
                interval={0}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => fmtIN(v)}
              />
              <RTooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#11161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#c4b5fd' }}
                formatter={(v: number) => [fmtIN(v), t(T.trained)]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={!reduced} animationDuration={800}>
                {months.map((m) => (
                  <Cell key={`m-${m.id}`} fill={m.last ? '#a78bfa' : 'rgba(167,139,250,0.45)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SourceNote className="mt-3" sources={[SOURCES.aipolicy]} />
    </PanelCard>
  )
}
