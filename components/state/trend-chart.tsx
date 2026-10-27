'use client'

import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  LabelList,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SourceNote } from '@/components/os/source-note'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { fmtIN, type Bi } from '@/lib/os/i18n'
import { PREVIEW, REPORTED, SOURCES } from '@/lib/mock/state'
import { PanelCard } from '@/components/state/title-strip'

const T = {
  title: { en: 'Placements over time', hi: 'वर्षवार प्लेसमेंट' },
  sub: {
    en: 'Department-reported placements, with an illustrative readiness scenario',
    hi: 'विभाग द्वारा रिपोर्ट किए गए प्लेसमेंट, एक उदाहरणात्मक परिदृश्य के साथ',
  },
  reported: { en: 'Reported placements', hi: 'रिपोर्ट किए गए प्लेसमेंट' },
  range: { en: 'Range across sources', hi: 'स्रोतों के बीच अंतर' },
  scenario: { en: 'Scenario', hi: 'परिदृश्य' },
} satisfies Record<string, Bi>

interface Row {
  year: string
  /** Reported value, or [low, high] for the scenario year (drawn as a ghost range bar). */
  value: number | [number, number] | null
  scLabel?: string
  err: [number, number] | null
  band: [number, number] | null
  high: number | null
  last: boolean
  projected: boolean
}

function nextYear(label: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(label)
  if (!m) return `${label}+1`
  const a = Number(m[1]) + 1
  const b = (Number(m[2]) + 1) % 100
  return `${a}-${String(b).padStart(2, '0')}`
}

const AXIS_TICK = { fill: '#9ca3af', fontSize: 12 }

/** ComposedChart: slate bars for REPORTED.placements, an asymmetric whisker on 2025-26 up to the higher
 *  source, and a dashed illustrative projection band (fix 54). No fragments inside the chart. */
export function TrendChart({ className, index = 0 }: { className?: string; index?: number }) {
  const { t, lang, lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const pts = REPORTED.placements
  const last = pts[pts.length - 1]
  const proj = PREVIEW.projection2026
  const projYear = nextYear(last.year)

  const data = useMemo<Row[]>(() => {
    const rows: Row[] = pts.map((p, i) => {
      const isLast = i === pts.length - 1
      const high = typeof p.high === 'number' ? p.high : null
      return {
        year: p.year,
        value: p.value,
        err: isLast && high != null ? [0, high - p.value] : null,
        band: isLast ? [p.value, high ?? p.value] : null,
        high,
        last: isLast,
        projected: false,
      }
    })
    rows.push({
      year: projYear,
      value: [proj.low, proj.high],
      scLabel: t(T.scenario),
      err: null,
      band: [proj.low, proj.high],
      high: null,
      last: false,
      projected: true,
    })
    return rows
  }, [pts, proj.low, proj.high, projYear, t])

  const growth = pts.length > 1 ? last.value / pts[0].value : null

  return (
    <PanelCard
      index={index}
      className={className}
      icon={TrendingUp}
      accent="slate"
      title={T.title}
      subtitle={T.sub}
      right={
        growth != null ? (
          <span className="inline-flex h-7 items-center rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 text-[12px] font-medium tabular-nums text-slate-200">
            <Tr
              b={{
                en: `${pts[0].year} → ${last.year}: ${growth.toFixed(1)}×`,
                hi: `${pts[0].year} → ${last.year}: ${growth.toFixed(1)} गुना`,
              }}
            />
          </span>
        ) : null
      }
    >
      <div className="h-[260px] w-full sm:h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="state-proj-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={4}
              tickFormatter={(v: string) => (v === projYear ? `${v}*` : v)}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v: number) => fmtIN(v)}
              domain={[0, (max: number) => Math.ceil((max * 1.06) / 5000) * 5000]}
            />
            <RTooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const r = payload[0]?.payload as Row | undefined
                if (!r) return null
                let line: string
                if (r.projected) line = `${t(T.scenario)}: ${fmtIN(proj.low)}–${fmtIN(proj.high)}`
                else if (r.high != null) line = `${fmtIN(typeof r.value === 'number' ? r.value : 0)}–${fmtIN(r.high)} (${t(T.range).toLowerCase()})`
                else line = fmtIN(typeof r.value === 'number' ? r.value : 0)
                return (
                  <div className="rounded-lg border border-white/10 bg-[#11161f] px-3 py-2 text-[12px] shadow-xl">
                    <div className="font-semibold text-white">{r.year}</div>
                    <div
                      lang={lang === 'hi' ? 'hi' : 'en'}
                      className={lang === 'hi' ? 'font-deva text-gray-300' : 'text-gray-300'}
                    >
                      {line}
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={46} isAnimationActive={!reduced} animationDuration={800}>
              {data.map((r) =>
                r.projected ? (
                  <Cell key={`c-${r.year}`} fill="url(#state-proj-fill)" stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="5 4" />
                ) : (
                  <Cell key={`c-${r.year}`} fill={r.last ? '#94a3b8' : '#475569'} />
                ),
              )}
              <ErrorBar dataKey="err" width={12} strokeWidth={2.5} stroke="#fbbf24" direction="y" />
              <LabelList dataKey="scLabel" position="top" fill="#67e8f9" fontSize={12} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
          <Tr b={T.reported} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-[3px] rounded-full bg-amber-400" />
          <Tr
            b={{
              en: `${T.range.en} ${last.year}: ${fmtIN(last.value)}–${fmtIN(last.high ?? last.value)}`,
              hi: `${T.range.hi} ${last.year}: ${fmtIN(last.value)}–${fmtIN(last.high ?? last.value)}`,
            }}
            className="tabular-nums"
          />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-4 rounded-sm border border-dashed border-cyan-300/80 bg-cyan-400/15" />
          <Tr
            b={{
              en: `${projYear}*: ${fmtIN(proj.low)}–${fmtIN(proj.high)}`,
              hi: `${projYear}*: ${fmtIN(proj.low)}–${fmtIN(proj.high)}`,
            }}
            className="tabular-nums"
          />
        </span>
      </div>
      <Tr as="p" b={{ en: `* ${proj.label.en}`, hi: `* ${proj.label.hi}` }} className="mt-1.5 block text-[12px] text-cyan-200/70" />

      <SourceNote className="mt-3" sources={[SOURCES.pp, SOURCES.im]} note={{
          en: last.note ?? '',
          hi: `स्रोतों में अंतर: ${fmtIN(last.value)} (${SOURCES.pp.label}, बाद की रिपोर्ट) बनाम ${fmtIN(last.high ?? last.value)} (${SOURCES.im.label})`,
        }} />
    </PanelCard>
  )
}
