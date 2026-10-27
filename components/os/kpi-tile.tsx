'use client'

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, FileText, Info, Minus, type LucideIcon } from 'lucide-react'
import { CountUp } from '@/components/ai/count-up'
import { useLang } from '@/lib/os/demo-store'
import { fmtIN, fmtINR, fmtNum, fmtPct, isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

type Format = 'int' | 'pct' | 'decimal' | 'inr'
type Tone = 'default' | 'ai' | 'warn' | 'good'

export interface KpiTileProps {
  label: Bi | string
  value?: number
  /** Takes precedence over value, e.g. a reported range built with fmtIN(low) + '–' + fmtIN(high). */
  valueText?: string
  /** Subcaption next to the value, e.g. '(64.2%)'. */
  sub?: Bi | string
  format?: Format
  decimals?: number
  delta?: number
  deltaLabel?: Bi | string
  /** Optional (additive): how to format delta. Default: same as format ('pct' renders 'pp'). 'pp' = percentage points. */
  deltaFormat?: Format | 'pp'
  /** Optional (additive): decimals for delta. Default: decimals, or 1 for 'pp'. */
  deltaDecimals?: number
  tag?: 'reported' | 'illustrative'
  sourceLabel?: string
  icon?: LucideIcon
  tone?: Tone
  /** Optional (additive). */
  className?: string
  /** Optional (additive): extra content at the bottom (e.g. a Sparkline). */
  children?: ReactNode
  /** Optional (additive): count-up duration; 0 renders the final value at once. */
  durationMs?: number
}

const TONE: Record<Tone, { icon: string; value: string; card: string; line: string }> = {
  default: {
    icon: 'bg-white/[0.06] text-gray-300 ring-white/10',
    value: 'text-white',
    card: 'border-white/10 hover:border-white/20',
    line: 'from-white/0 via-white/10 to-white/0',
  },
  ai: {
    icon: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25',
    value: 'ai-gradient-text',
    card: 'border-cyan-400/20 hover:border-cyan-300/40 shadow-[0_0_40px_-22px_rgba(34,211,238,0.6)]',
    line: 'from-blue-400/0 via-cyan-300/70 to-emerald-400/0',
  },
  warn: {
    icon: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
    value: 'text-amber-200',
    card: 'border-amber-400/20 hover:border-amber-300/40',
    line: 'from-amber-400/0 via-amber-300/50 to-amber-400/0',
  },
  good: {
    icon: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
    value: 'text-emerald-200',
    card: 'border-emerald-400/20 hover:border-emerald-300/40',
    line: 'from-emerald-400/0 via-emerald-300/50 to-emerald-400/0',
  },
}

const TAG: Record<'reported' | 'illustrative', Bi> = {
  reported: { en: 'As reported', hi: 'रिपोर्टेड' },
  illustrative: { en: 'Illustrative', hi: 'सांकेतिक' },
}
const SOURCE: Bi = { en: 'Source', hi: 'स्रोत' }

function defaultDecimals(format: Format): number {
  return format === 'int' || format === 'inr' ? 0 : 1
}

function formatValue(n: number, format: Format, decimals: number): string {
  switch (format) {
    case 'pct':
      return fmtPct(n, decimals)
    case 'decimal':
      return fmtNum(n, decimals)
    case 'inr':
      return fmtINR(n)
    default:
      return fmtIN(n, decimals)
  }
}

function formatDelta(n: number, format: Format | 'pp', decimals: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '±'
  const a = Math.abs(n)
  switch (format) {
    case 'pp':
    case 'pct':
      return `${sign}${fmtNum(a, decimals)} pp`
    case 'decimal':
      return `${sign}${fmtNum(a, decimals)}`
    case 'inr':
      return `${sign}${fmtINR(a)}`
    default:
      return `${sign}${fmtIN(a, Number.isInteger(a) ? 0 : decimals)}`
  }
}

function L({ b, className }: { b: Bi | string; className?: string }) {
  const lang = useLang()
  const s = tr(b, lang)
  const deva = isDevanagari(s)
  return (
    <span lang={deva ? 'hi' : 'en'} className={cn(deva && 'font-deva', className)}>
      {s}
    </span>
  )
}

/** Headline KPI tile: label, count-up value (text-3xl tabular), delta pill, honesty tag, source. */
export function KpiTile({
  label,
  value,
  valueText,
  sub,
  format = 'int',
  decimals,
  delta,
  deltaLabel,
  deltaFormat,
  deltaDecimals,
  tag,
  sourceLabel,
  icon: Icon,
  tone = 'default',
  className,
  children,
  durationMs = 900,
}: KpiTileProps) {
  const t = TONE[tone] ?? TONE.default
  const dec = typeof decimals === 'number' ? decimals : defaultDecimals(format)
  const hasValue = typeof value === 'number' && Number.isFinite(value)
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
  const up = hasDelta && (delta as number) > 0
  const down = hasDelta && (delta as number) < 0
  const DeltaIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white/[0.03] p-4 transition-colors duration-300 sm:p-5',
        t.card,
        className,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r', t.line)} aria-hidden />
      {tone === 'ai' && (
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1', t.icon)}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          )}
          <L b={label} className="min-w-0 text-[13px] font-medium leading-snug text-gray-400" />
        </div>
        {tag && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[12px] font-medium leading-none',
              tag === 'reported'
                ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                : 'border-amber-400/30 bg-amber-400/[0.07] text-amber-300',
            )}
          >
            {tag === 'reported' ? <FileText className="h-3 w-3" aria-hidden /> : <Info className="h-3 w-3" aria-hidden />}
            <L b={TAG[tag]} />
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={cn('text-3xl font-semibold leading-none tracking-tight tabular-nums', t.value)}>
          {valueText ? (
            valueText
          ) : hasValue ? (
            durationMs > 0 ? (
              <CountUp
                value={value as number}
                durationMs={durationMs}
                decimals={dec}
                format={(n) => formatValue(n, format, dec)}
              />
            ) : (
              formatValue(value as number, format, dec)
            )
          ) : (
            '—'
          )}
        </span>
        {sub && <L b={sub} className="text-[13px] font-medium text-gray-400" />}
      </div>

      {hasDelta && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px]">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums',
              up && 'bg-emerald-400/10 text-emerald-300',
              down && 'bg-rose-400/10 text-rose-300',
              !up && !down && 'bg-white/5 text-gray-400',
            )}
          >
            <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
            {formatDelta(
              delta as number,
              deltaFormat ?? format,
              typeof deltaDecimals === 'number' ? deltaDecimals : deltaFormat === 'pp' ? 1 : dec,
            )}
          </span>
          {deltaLabel && <L b={deltaLabel} className="text-gray-500" />}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}

      {sourceLabel && (
        <div className="mt-auto pt-3">
          <p className="truncate text-[12px] text-slate-500">
            <L b={SOURCE} />: <span className="text-slate-400">{sourceLabel}</span>
          </p>
        </div>
      )}
    </div>
  )
}
