'use client'

/* "Reported by the Department" band (fix 54): reported placements as slate bars that grow in sequence
 * when scrolled into view; 2025-26 drawn at the later, lower figure with an asymmetric ErrorBar whisker up to
 * the higher report. Recharts children are direct, keyed and never wrapped (no fragments in this file). */

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BookOpenCheck, Building2, Globe2, Landmark, Scale, Sparkles, type LucideIcon } from 'lucide-react'
import { SourceNote } from '@/components/os/source-note'
import { Tr } from '@/components/os/tr-text'
import { useLang } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, tr, type Bi } from '@/lib/os/i18n'
import { REPORTED, SOURCES } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Row {
  year: string
  value: number
  high: number | null
  /** [below, above] for the asymmetric ErrorBar; null = no whisker. */
  err: [number, number] | null
}

const ROWS: Row[] = (Array.isArray(REPORTED.placements) ? REPORTED.placements : []).map((p) => ({
  year: p.year,
  value: p.value,
  high: typeof p.high === 'number' ? p.high : null,
  err: typeof p.high === 'number' && p.high > p.value ? [0, p.high - p.value] : null,
}))

const FIRST = ROWS[0]
const LAST = ROWS[ROWS.length - 1]
const MAX = ROWS.reduce((m, r) => Math.max(m, r.high ?? r.value), 0)
const Y_STEP = 5000
const Y_MAX = Math.max(Y_STEP, Math.ceil((MAX * 1.16) / Y_STEP) * Y_STEP)
const Y_TICKS = Array.from({ length: Math.round(Y_MAX / Y_STEP) + 1 }, (_, i) => i * Y_STEP)
const GROWTH = FIRST && LAST && FIRST.value > 0 ? Math.round(LAST.value / FIRST.value) : 0

const STAGGER_MS = 150
const GROW_MS = 720
const LAST_DONE_MS = (ROWS.length - 1) * STAGGER_MS + GROW_MS

const rangeText = (r: Row) => (r.high != null ? `${fmtIN(r.value)}–${fmtIN(r.high)}` : fmtIN(r.value))

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const BAND_EN = 'Reported by the Department'
const BAND_HI = 'विभाग द्वारा रिपोर्ट'

const CHART_TITLE: Bi = {
  en: 'Placements from government technical institutions',
  hi: 'सरकारी तकनीकी संस्थानों से प्लेसमेंट',
}
const GROWTH_LINE: Bi = {
  en: `≈${GROWTH}× since ${FIRST?.year ?? ''}`,
  hi: `${FIRST?.year ?? ''} से ≈${GROWTH} गुना`,
}
const SOURCES_DIFFER: Bi = { en: '(sources differ)', hi: '(स्रोतों में अंतर)' }
const SOURCE_NOTE: Bi = {
  en: `${LAST?.year ?? ''} sources differ; the bar shows the later, lower figure`,
  hi: `${LAST?.year ?? ''} के स्रोतों में अंतर है; बार बाद वाला, कम आँकड़ा दिखाता है`,
}
const WHISKER: Bi = { en: 'Whisker: higher report', hi: 'ऊपरी रेखा: अधिक वाली रिपोर्ट' }

const seats = REPORTED.seats2026
const policyYears =
  REPORTED.aiPolicy.perYear > 0 ? Math.round(REPORTED.aiPolicy.target5yr / REPORTED.aiPolicy.perYear) : 0
const policyLakh = fmtNum(REPORTED.aiPolicy.target5yr / 100000, 0)

interface Callout {
  id: string
  Icon: LucideIcon
  head: Bi
  sub?: Bi
  tag?: Bi
  tone?: 'gap'
}

const CALLOUTS: Callout[] = [
  {
    id: 'institutions',
    Icon: Building2,
    head: {
      en: `${REPORTED.institutions.gec} GECs + ${REPORTED.institutions.gp} polytechnics`,
      hi: `${REPORTED.institutions.gec} सरकारी इंजीनियरिंग कॉलेज + ${REPORTED.institutions.gp} पॉलिटेक्निक`,
    },
    sub: {
      en: 'A government engineering college in every district',
      hi: 'हर ज़िले में एक सरकारी इंजीनियरिंग कॉलेज',
    },
  },
  {
    id: 'seats',
    Icon: BookOpenCheck,
    head: {
      en: `${fmtNum(seats.btech.pct, 2)}% B.Tech / ${fmtNum(seats.diploma.pct, 2)}% diploma seats filled (2026-27)`,
      hi: `${fmtNum(seats.btech.pct, 2)}% B.Tech / ${fmtNum(seats.diploma.pct, 2)}% डिप्लोमा सीटें भरीं (2026-27)`,
    },
    sub: {
      en: `Engineering was about ${REPORTED.engEnrolment2022Pct}% in 2022-23`,
      hi: `2022-23 में इंजीनियरिंग लगभग ${REPORTED.engEnrolment2022Pct}% थी`,
    },
  },
  {
    id: 'gap',
    Icon: Scale,
    tone: 'gap',
    head: {
      en: `Engineering placements ≈${fmtIN(REPORTED.split2025.engineering)}–${fmtIN(REPORTED.split2025.altEngineering)} vs ≈${fmtIN(seats.btech.total)} B.Tech seats a year`,
      hi: `इंजीनियरिंग प्लेसमेंट ≈${fmtIN(REPORTED.split2025.engineering)}–${fmtIN(REPORTED.split2025.altEngineering)}, जबकि हर साल ≈${fmtIN(seats.btech.total)} B.Tech सीटें`,
    },
    tag: {
      en: 'Our reading of reported figures, not an official rate',
      hi: 'रिपोर्ट किए गए आँकड़ों की हमारी व्याख्या, आधिकारिक दर नहीं',
    },
  },
  {
    id: 'policy',
    Icon: Sparkles,
    head: {
      en: `AI Policy 2026 (draft): ${policyLakh} lakh AI-trained in ${policyYears} years`,
      hi: `AI नीति 2026 (मसौदा): ${policyYears} वर्षों में ${policyLakh} लाख AI-प्रशिक्षित`,
    },
    sub: {
      en: `₹${REPORTED.aiLabLakhPerCollege} lakh AI lab per college`,
      hi: `हर कॉलेज में ₹${REPORTED.aiLabLakhPerCollege} लाख की AI लैब`,
    },
  },
]

const NATIONAL_H: Bi = { en: 'National context', hi: 'राष्ट्रीय संदर्भ' }
const NATIONAL: { id: string; text: Bi }[] = [
  {
    id: 'apna',
    text: {
      en: `Only ${REPORTED.freshersReadyPct}% of freshers feel interview-ready (Apna 2025)`,
      hi: `केवल ${REPORTED.freshersReadyPct}% फ्रेशर्स खुद को इंटरव्यू के लिए तैयार मानते हैं (Apna 2025)`,
    },
  },
  {
    id: 'isr',
    text: {
      en: `Polytechnic employability ${fmtNum(REPORTED.polytechnicEmployabilityPct, 2)}% (ISR 2026)`,
      hi: `पॉलिटेक्निक रोज़गार-योग्यता ${fmtNum(REPORTED.polytechnicEmployabilityPct, 2)}% (ISR 2026)`,
    },
  },
]

// ---------------------------------------------------------------------------
// Chart pieces
// ---------------------------------------------------------------------------

const CHART_CSS = `
@keyframes rb-grow { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes rb-fade { from { opacity: 0; transform: translateY(3px) } to { opacity: 1; transform: none } }
.rb-chart .rb-bar { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); }
.rb-chart .rb-label, .rb-chart .recharts-errorBars { opacity: 0; }
.rb-chart.rb-run .rb-bar { animation: rb-grow ${GROW_MS}ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.rb-chart.rb-run .rb-label { animation: rb-fade 320ms ease-out both; }
.rb-chart.rb-run .recharts-errorBars { animation: rb-fade 420ms ease-out ${LAST_DONE_MS - 120}ms both; }
@media (prefers-reduced-motion: reduce) {
  .rb-chart .rb-bar, .rb-chart .rb-label, .rb-chart .recharts-errorBars { animation: none !important; transform: none; opacity: 1; }
}
.os-lite .rb-chart .rb-bar, .os-lite .rb-chart .rb-label, .os-lite .rb-chart .recharts-errorBars { animation: none !important; transform: none; opacity: 1; }
@media print {
  .rb-chart .rb-bar, .rb-chart .rb-label, .rb-chart .recharts-errorBars { animation: none !important; transform: none; opacity: 1; }
}
`

/** Rounded-top bar path. */
function topRounded(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h))
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}

interface ShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
  fill?: string
  payload?: Row
}

function makeBarShape(narrow: boolean, lastLabel: string, lastSub: string) {
  return function BarShape(raw: unknown) {
    const p = (raw ?? {}) as ShapeProps
    const x = Number(p.x) || 0
    const y = Number(p.y) || 0
    const w = Math.max(0, Number(p.width) || 0)
    const h = Math.max(0, Number(p.height) || 0)
    const i = typeof p.index === 'number' ? p.index : 0
    const row = p.payload ?? ROWS[i]
    const isLast = i === ROWS.length - 1
    const delay = i * STAGGER_MS
    const cx = x + w / 2

    // Whisker top in px (same scale as the bar): value -> h, so 1 unit = h / value.
    let topY = y
    if (isLast && row && row.high != null && row.value > 0 && h > 0) {
      topY = y - ((row.high - row.value) * h) / row.value
    }

    return (
      <g>
        <path
          className="rb-bar"
          d={topRounded(x, y, w, h, Math.min(7, w / 3))}
          fill={p.fill || '#475569'}
          style={{ animationDelay: `${delay}ms` }}
        />
        {isLast ? (
          <g className="rb-label" style={{ animationDelay: `${LAST_DONE_MS}ms` }}>
            <text
              x={x + w + 2}
              y={topY - (narrow ? 24 : 26)}
              textAnchor="end"
              fill="#e2e8f0"
              fontSize={narrow ? 12 : 13}
              fontWeight={700}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {lastLabel}
            </text>
            <text x={x + w + 2} y={topY - 10} textAnchor="end" fill="#94a3b8" fontSize={12}>
              {lastSub}
            </text>
          </g>
        ) : (
          <text
            className="rb-label"
            x={cx}
            y={y - 7}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize={12}
            fontWeight={600}
            style={{ animationDelay: `${delay + GROW_MS - 200}ms`, fontVariantNumeric: 'tabular-nums' }}
          >
            {narrow && row ? `${fmtNum(row.value / 1000, 1)}k` : row ? fmtIN(row.value) : ''}
          </text>
        )}
      </g>
    )
  }
}

interface TipProps {
  active?: boolean
  payload?: { payload?: Row }[]
}

function ChartTip({ active, payload, lang }: TipProps & { lang: 'en' | 'hi' }) {
  const row = active && Array.isArray(payload) ? payload[0]?.payload : undefined
  if (!row) return null
  return (
    <div className="min-w-[180px] rounded-lg border border-white/10 bg-[#11161f]/95 px-3 py-2.5 text-[12px] text-gray-300 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur">
      <div className="mb-1 text-[13px] font-semibold text-white">{row.year}</div>
      {row.high != null ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span>{SOURCES.pp.label}</span>
            <span className="font-semibold tabular-nums text-white">{fmtIN(row.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{SOURCES.im.label}</span>
            <span className="font-semibold tabular-nums text-white">{fmtIN(row.high)}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <span lang={lang} className={cn(lang === 'hi' && 'font-deva')}>
            {lang === 'hi' ? 'प्लेसमेंट' : 'Placements'}
          </span>
          <span className="font-semibold tabular-nums text-white">{fmtIN(row.value)}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ReportedBarsProps {
  /** Hold the bar animation until the page reveals this section. Default true. */
  active?: boolean
  className?: string
}

export function ReportedBars({ active = true, className }: ReportedBarsProps) {
  const lang = useLang()
  const l: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const gid = `rb-last-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [width, setWidth] = useState(0)

  // Grow the bars when the chart scrolls into view (once).
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const run = inView && active
  const narrow = width > 0 && width < 460
  const shape = useMemo(
    () => makeBarShape(narrow, LAST ? rangeText(LAST) : '', tr(SOURCES_DIFFER, l)),
    [narrow, l],
  )

  return (
    <section aria-label={`${BAND_EN} · ${BAND_HI}`} className={cn('min-w-0', className)}>
      <style href="ps-reported-bars" precedence="default">
        {CHART_CSS}
      </style>
      {/* Grey band */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-500/25 bg-gradient-to-r from-slate-500/[0.14] via-slate-500/[0.07] to-transparent px-4 py-2.5">
        <Landmark className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
        <span lang="en" className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-200">
          {BAND_EN}
        </span>
        <span aria-hidden className="text-slate-500">
          ·
        </span>
        <span lang="hi" className="font-deva text-[14px] font-medium text-slate-300">
          {BAND_HI}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.42fr)_minmax(0,1fr)]">
        {/* Chart card */}
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <Tr as="h2" b={CHART_TITLE} className="text-[16px] font-semibold leading-snug text-white" />
              <p className="mt-0.5 text-[12px] text-gray-500">
                {FIRST?.year} – {LAST?.year}
              </p>
            </div>
            {GROWTH > 1 && (
              <span className="inline-flex items-center rounded-full border border-slate-400/25 bg-slate-400/10 px-2.5 py-1 text-[12px] font-semibold text-slate-200">
                <Tr b={GROWTH_LINE} />
              </span>
            )}
          </div>

          <div ref={wrapRef} className={cn('rb-chart relative mt-3 h-[260px] sm:h-[280px]', run && 'rb-run')}>
            <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
              <defs>
                <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="55%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROWS} margin={{ top: 12, right: 6, bottom: 0, left: narrow ? -4 : 0 }} barCategoryGap="22%">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="year"
                  interval={0}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(v: string) => (narrow && typeof v === 'string' ? v.replace(/^20/, '’') : v)}
                  axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, Y_MAX]}
                  ticks={Y_TICKS}
                  hide={narrow}
                  width={44}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(v: number) => (v === 0 ? '0' : `${fmtIN(v / 1000)}k`)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={(props: unknown) => <ChartTip {...((props ?? {}) as TipProps)} lang={l} />}
                  isAnimationActive={false}
                />
                <Bar dataKey="value" isAnimationActive={false} shape={shape} maxBarSize={64}>
                  {ROWS.map((r, i) => (
                    <Cell key={`cell-${r.year}`} fill={i === ROWS.length - 1 ? `url(#${gid})` : '#475569'} />
                  ))}
                  <ErrorBar dataKey="err" width={9} strokeWidth={2} stroke="#cbd5e1" direction="y" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
              <Tr b={{ en: 'As reported', hi: 'जैसा रिपोर्ट हुआ' }} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-blue-500 via-cyan-400 to-emerald-400" />
              <span className="tabular-nums">{LAST?.year}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="relative inline-block h-3 w-2.5">
                <span className="absolute inset-x-0 top-0 h-[2px] bg-slate-300" />
                <span className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 bg-slate-300" />
              </span>
              <Tr b={WHISKER} />
            </span>
          </div>
          <SourceNote sources={[SOURCES.pp, SOURCES.im]} note={SOURCE_NOTE} className="mt-2" />
        </div>

        {/* Callouts */}
        <div className="flex min-w-0 flex-col gap-3">
          {CALLOUTS.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex min-w-0 items-start gap-3 rounded-xl border p-3.5',
                c.tone === 'gap'
                  ? 'border-amber-400/30 bg-gradient-to-r from-amber-400/[0.08] to-amber-400/[0.02]'
                  : 'border-slate-500/20 bg-slate-500/[0.05]',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1',
                  c.tone === 'gap' ? 'bg-amber-400/10 text-amber-300 ring-amber-400/25' : 'bg-slate-400/10 text-slate-300 ring-slate-400/20',
                )}
              >
                <c.Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <Tr as="p" b={c.head} className="text-[14px] font-semibold leading-snug text-gray-100" />
                {c.sub && <Tr as="p" b={c.sub} className="mt-0.5 text-[12px] leading-snug text-gray-400" />}
                {c.tag && (
                  <Tr
                    as="p"
                    b={c.tag}
                    className="mt-1.5 inline-flex rounded-md border border-amber-400/30 bg-amber-400/[0.07] px-1.5 py-0.5 text-[12px] font-medium text-amber-200"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <Globe2 className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <Tr b={NATIONAL_H} className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400" />
            </div>
            <ul className="space-y-1">
              {NATIONAL.map((n) => (
                <li key={n.id} className="flex items-baseline gap-2 text-[13px] leading-snug text-gray-300">
                  <span aria-hidden className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                  <Tr b={n.text} />
                </li>
              ))}
            </ul>
          </div>
          <SourceNote sources={[SOURCES.aipolicy, SOURCES.apna, SOURCES.isr]} />
        </div>
      </div>
    </section>
  )
}
