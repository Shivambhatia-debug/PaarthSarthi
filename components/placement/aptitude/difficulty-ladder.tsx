'use client'

// Adaptive difficulty ladder: step line of the difficulty each question was asked at, plus an ability
// estimate with a confidence band that narrows as evidence builds. Recharts rule: every chart child is a
// direct child of ComposedChart (no wrappers, no fragments).

import { memo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDemo } from '@/lib/os/demo-store'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'
import { DIFFICULTY_LABEL, type Difficulty, type LadderPoint } from '@/components/placement/aptitude/questions'

const TXT = {
  title: { en: 'Adaptive difficulty ladder', hi: 'अनुकूली कठिनाई सीढ़ी', hinglish: 'Adaptive difficulty ladder' },
  diff: { en: 'Difficulty asked', hi: 'पूछी गई कठिनाई' },
  ability: { en: 'Ability estimate', hi: 'क्षमता अनुमान' },
  band: { en: 'Confidence band', hi: 'विश्वास सीमा' },
  right: { en: 'correct', hi: 'सही' },
  wrong: { en: 'wrong', hi: 'गलत' },
}

interface DotProps {
  cx?: number
  cy?: number
  index?: number
  payload?: LadderPoint
}

function renderDiffDot(props: DotProps) {
  const { cx, cy, payload, index } = props
  const key = `dd-${index ?? 0}`
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload || payload.difficulty == null) {
    return <g key={key} />
  }
  const fill = payload.correct === null ? '#a78bfa' : payload.correct ? '#34d399' : '#fb7185'
  return (
    <g key={key}>
      <circle cx={cx} cy={cy} r={7} fill={fill} opacity={0.18} />
      <circle cx={cx} cy={cy} r={3.6} fill={fill} stroke="#0d1117" strokeWidth={1.2} />
    </g>
  )
}

interface TipProps {
  active?: boolean
  payload?: { payload?: LadderPoint }[]
}

export interface DifficultyLadderProps {
  data: LadderPoint[]
  height?: number
  compact?: boolean
  className?: string
}

function LadderImpl({ data, height = 210, compact = false, className }: DifficultyLadderProps) {
  const { t } = useDemo()
  const diffTick = (v: number) => {
    const lvl = Math.round(v) as Difficulty
    return DIFFICULTY_LABEL[lvl] ? t(DIFFICULTY_LABEL[lvl]) : ''
  }

  const renderTip = (p: TipProps) => {
    const row = p.payload?.[0]?.payload
    if (!p.active || !row || row.ability == null) return null
    const lvl = (row.difficulty ?? 2) as Difficulty
    return (
      <div className="rounded-lg border border-white/10 bg-[#11161f]/95 px-3 py-2 text-[12px] text-gray-200 shadow-xl backdrop-blur">
        <div className="mb-1 font-semibold text-white">{row.name}</div>
        <div className="text-violet-200">
          {t(TXT.diff)}: {t(DIFFICULTY_LABEL[lvl])}
          {row.correct !== null && (
            <span className={row.correct ? 'text-emerald-300' : 'text-rose-300'}> · {t(row.correct ? TXT.right : TXT.wrong)}</span>
          )}
        </div>
        <div className="text-cyan-200">
          {t(TXT.ability)}: {Math.round(row.ability)}
          {row.band && (
            <span className="text-gray-400">
              {' '}
              (±{Math.round((row.band[1] - row.band[0]) / 2)})
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: compact ? 4 : 8, bottom: 0, left: compact ? -6 : 0 }}>
            <defs>
              <linearGradient id="ps-apt-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v: string) => (v === 'Start' ? (compact ? 'S' : 'Start') : v)}
            />
            <YAxis
              yAxisId="d"
              domain={[0.6, 3.4]}
              ticks={[1, 2, 3]}
              tick={{ fill: '#c4b5fd', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={compact ? 50 : 56}
              tickFormatter={diffTick}
            />
            <YAxis
              yAxisId="a"
              orientation="right"
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fill: '#67e8f9', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={compact ? 26 : 30}
            />
            <RTooltip content={renderTip} cursor={{ stroke: 'rgba(255,255,255,0.12)' }} />
            <Area
              yAxisId="a"
              type="monotone"
              dataKey="band"
              stroke="none"
              fill="url(#ps-apt-band)"
              isAnimationActive={false}
              connectNulls={false}
              activeDot={false}
            />
            <Line
              yAxisId="a"
              type="monotone"
              dataKey="ability"
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 2.5, fill: '#22d3ee', stroke: '#0d1117', strokeWidth: 1 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              yAxisId="d"
              type="stepAfter"
              dataKey="difficulty"
              stroke="#a78bfa"
              strokeWidth={2.5}
              dot={renderDiffDot}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 rounded-full bg-violet-400" />
          <Tr b={TXT.diff} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0 w-4 border-t-2 border-dashed border-cyan-400" />
          <Tr b={TXT.ability} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-4 rounded-sm bg-cyan-400/20" />
          <Tr b={TXT.band} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-400" />
          <Tr b={TXT.right} />
          <span aria-hidden className="ml-1 h-2 w-2 rounded-full bg-rose-400" />
          <Tr b={TXT.wrong} />
        </span>
      </div>
    </div>
  )
}

/** Memoised: the exam re-renders every second for the timers; the chart only needs to change per answer. */
export const DifficultyLadder = memo(LadderImpl)

export const LADDER_TITLE = TXT.title
