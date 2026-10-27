'use client'

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLang } from '@/lib/os/demo-store'
import { fmtNum, isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { seqColor } from '@/lib/os/scoring'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import type { DistrictGeo, DistrictId } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

/** Schematic tile map of Bihar's 38 districts (8 x 6 grid, not to scale). */

const CODES: Record<string, string> = {
  'west-champaran': 'WCH',
  'east-champaran': 'ECH',
  sheohar: 'SHE',
  sitamarhi: 'SIT',
  madhubani: 'MDB',
  supaul: 'SUP',
  araria: 'ARR',
  kishanganj: 'KIS',
  siwan: 'SIW',
  gopalganj: 'GOP',
  muzaffarpur: 'MUZ',
  darbhanga: 'DAR',
  saharsa: 'SAH',
  madhepura: 'MDP',
  purnia: 'PUR',
  katihar: 'KAT',
  saran: 'SAR',
  vaishali: 'VAI',
  samastipur: 'SAM',
  begusarai: 'BEG',
  khagaria: 'KHA',
  buxar: 'BUX',
  bhojpur: 'BHO',
  patna: 'PAT',
  nalanda: 'NAL',
  lakhisarai: 'LAK',
  munger: 'MUN',
  bhagalpur: 'BGP',
  kaimur: 'KAI',
  rohtas: 'ROH',
  arwal: 'ARW',
  jehanabad: 'JEH',
  sheikhpura: 'SKP',
  jamui: 'JAM',
  banka: 'BAN',
  aurangabad: 'AUR',
  gaya: 'GAY',
  nawada: 'NAW',
}

const SHORT_EN: Record<string, string> = {
  'west-champaran': 'W. Champaran',
  'east-champaran': 'E. Champaran',
}

const NO_DATA: Bi = { en: 'No matching institutions', hi: 'कोई मेल खाता संस्थान नहीं' }
const NO_DATA_LEGEND: Bi = { en: 'No data', hi: 'डेटा नहीं' }
const HIGHLIGHT_LEGEND: Bi = { en: 'Highlighted', hi: 'चिह्नित' }
const DIVISION: Bi = { en: 'division', hi: 'प्रमंडल' }
const RIVER: Bi = { en: 'Ganga', hi: 'गंगा' }

const COLS = 8
const ROWS = 6

type LabelMode = 'full' | 'code' | 'value' | 'none'

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return 0
  const ch = [m[1], m[2], m[3]].map((x) => {
    const c = parseInt(x, 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function modeFor(tileW: number, showLabels: boolean): LabelMode {
  if (!showLabels) return 'none'
  if (tileW >= 64) return 'full'
  if (tileW >= 36) return 'code'
  if (tileW >= 26) return 'value'
  return 'none'
}

const SIZE = {
  sm: { box: 'w-[184px]', gap: 2, radius: 'rounded-[4px]', guessW: 21 },
  md: { box: 'w-full max-w-[440px]', gap: 4, radius: 'rounded-md', guessW: 50 },
  lg: { box: 'w-full max-w-[820px]', gap: 6, radius: 'rounded-lg', guessW: 92 },
} as const

export interface BiharTileMapProps {
  values: Record<DistrictId, number | null>
  metricLabel: Bi | string
  selected?: DistrictId | null
  onSelect?: (id: DistrictId) => void
  /** Districts to emphasise; others are dimmed. */
  highlight?: DistrictId[] | ReadonlySet<DistrictId> | null
  pulseId?: DistrictId | null
  /** true dims every tile that is not highlighted or selected; an array dims those districts. */
  dim?: boolean | DistrictId[]
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  min?: number
  max?: number
  /** Tooltip for districts with no value. Default 'No matching institutions'. */
  disabledTooltip?: Bi | string
  /** Optional (additive). */
  formatValue?: (v: number) => string
  /** Optional (additive): legend under the map. Default: shown for md and lg. */
  showLegend?: boolean
  /** Optional (additive): show the Ganga line. Default: md and lg. */
  showRiver?: boolean
  /** Optional (additive): extra legend content (right side). */
  legendExtra?: ReactNode
  className?: string
}

export function BiharTileMap({
  values,
  metricLabel,
  selected,
  onSelect,
  highlight,
  pulseId,
  dim,
  size = 'md',
  showLabels = true,
  min,
  max,
  disabledTooltip = NO_DATA,
  formatValue,
  showLegend,
  showRiver,
  legendExtra,
  className,
}: BiharTileMapProps) {
  const lang = useLang()
  const cfg = SIZE[size] ?? SIZE.md
  const gridRef = useRef<HTMLDivElement>(null)
  const gangaId = `ganga-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [tileW, setTileW] = useState<number>(cfg.guessW)

  useEffect(() => {
    const el = gridRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const w = el.clientWidth
      if (w > 0) setTileW((w - cfg.gap * (COLS - 1)) / COLS)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cfg.gap])

  const vals = values ?? {}
  const nums = useMemo(
    () =>
      DISTRICT_GEO.map((g) => vals[g.id]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values],
  )
  const lo = typeof min === 'number' ? min : nums.length ? Math.floor(Math.min(...nums)) : 0
  const hiRaw = typeof max === 'number' ? max : nums.length ? Math.ceil(Math.max(...nums)) : 100
  const hi = hiRaw > lo ? hiRaw : lo + 1
  const hasNull = DISTRICT_GEO.some((g) => !(typeof vals[g.id] === 'number' && Number.isFinite(vals[g.id] as number)))

  const hlSet = useMemo(() => {
    if (!highlight) return null
    const s = new Set<string>(Array.isArray(highlight) ? highlight : Array.from(highlight as ReadonlySet<string>))
    return s.size ? s : null
  }, [highlight])
  const dimSet = useMemo(() => (Array.isArray(dim) ? new Set<string>(dim) : null), [dim])

  const mode = modeFor(tileW, showLabels)
  const legendOn = showLegend ?? size !== 'sm'
  const riverOn = (showRiver ?? size !== 'sm') && mode !== 'none'
  const withTips = size !== 'sm'
  const interactive = typeof onSelect === 'function'
  const fmt = (v: number) => {
    try {
      return formatValue ? formatValue(v) : fmtNum(v, 1)
    } catch {
      return String(v)
    }
  }
  const metric = tr(metricLabel, lang)
  const noData = tr(disabledTooltip, lang)
  const big = tileW >= 78

  const renderTile = (g: DistrictGeo, index: number) => {
    const raw = vals[g.id]
    const v = typeof raw === 'number' && Number.isFinite(raw) ? raw : null
    const t = v == null ? 0 : (v - lo) / (hi - lo)
    const bg = v == null ? '#1f2530' : seqColor(t)
    const darkText = v != null && luminance(bg) > 0.3
    const isSel = !!selected && selected === g.id
    const isHl = !!hlSet && hlSet.has(g.id)
    const dimmed =
      (!!hlSet && !isHl && !isSel) || (dim === true && !isHl && !isSel) || (!!dimSet && dimSet.has(g.id) && !isSel)
    const pulsing = !!pulseId && pulseId === g.id
    const name = lang === 'hi' ? g.nameHi : SHORT_EN[g.id] ?? g.name
    const nameDeva = lang === 'hi'
    const disabled = v == null

    const inner = (
      <>
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.14] via-white/0 to-black/[0.12]"
          aria-hidden
        />
        {pulsing && (
          <span
            key={`pulse-${g.id}`}
            className="pulse-ring pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-cyan-300"
            aria-hidden
          />
        )}
        {mode === 'full' && (
          <span className={cn('relative flex h-full w-full flex-col justify-between text-left', big ? 'p-2' : 'p-1.5')}>
            <span
              lang={nameDeva ? 'hi' : 'en'}
              className={cn(
                'block truncate text-[12px] font-medium leading-tight',
                darkText ? 'text-slate-900/80' : 'text-white/80',
                nameDeva && 'font-deva',
              )}
            >
              {name}
            </span>
            <span
              className={cn(
                'block font-semibold leading-none tabular-nums',
                big ? 'text-[16px]' : 'text-[14px]',
                darkText ? 'text-slate-950' : 'text-white',
              )}
            >
              {v == null ? '—' : fmt(v)}
            </span>
          </span>
        )}
        {mode === 'code' && (
          <span className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 leading-none">
            <span className={cn('text-[12px] font-medium tracking-wide', darkText ? 'text-slate-900/75' : 'text-white/70')}>
              {CODES[g.id] ?? g.name.slice(0, 3).toUpperCase()}
            </span>
            <span className={cn('text-[12px] font-semibold tabular-nums', darkText ? 'text-slate-950' : 'text-white')}>
              {v == null ? '—' : fmt(v)}
            </span>
          </span>
        )}
        {mode === 'value' && (
          <span
            className={cn(
              'relative flex h-full w-full items-center justify-center text-[12px] font-semibold tabular-nums',
              darkText ? 'text-slate-950' : 'text-white',
            )}
          >
            {v == null ? '—' : fmt(v)}
          </span>
        )}
      </>
    )

    const tileClass = cn(
      'tile-pop group/tile relative block aspect-square min-w-0 outline-none',
      cfg.radius,
      'transition-[opacity,filter,box-shadow,transform,background-color] duration-500 ease-out',
      'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]',
      disabled && 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_4px,transparent_4px_8px)]',
      dimmed && 'opacity-30 saturate-[0.35]',
      isHl && 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_0_0_2px_rgba(110,231,183,0.85),0_0_18px_-2px_rgba(52,211,153,0.55)]',
      isSel &&
        'z-10 -translate-y-0.5 shadow-[0_0_0_2px_#0d1117,0_0_0_4px_rgba(103,232,249,0.95),0_10px_28px_-8px_rgba(34,211,238,0.6)]',
      pulsing && !isSel && 'z-10 shadow-[0_0_22px_-2px_rgba(34,211,238,0.7)]',
      interactive && !disabled && 'cursor-pointer hover:z-20 hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.85),0_10px_24px_-10px_rgba(0,0,0,0.9)]',
      interactive && disabled && 'cursor-not-allowed',
      !interactive && withTips && 'cursor-default hover:shadow-[0_0_0_2px_rgba(255,255,255,0.6)]',
      'focus-visible:shadow-[0_0_0_2px_#0d1117,0_0_0_4px_rgba(103,232,249,0.9)]',
    )
    const style = {
      gridRow: g.row + 1,
      gridColumn: g.col + 1,
      backgroundColor: bg,
      animationDelay: `${index * 25}ms`,
    }
    const aria = `${g.name} (${g.nameHi}): ${v == null ? noData : `${metric} ${fmt(v)}`}`

    const tile = interactive ? (
      <button
        key={g.id}
        type="button"
        className={tileClass}
        style={style}
        aria-label={aria}
        aria-pressed={isSel}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) onSelect?.(g.id)
        }}
      >
        {inner}
      </button>
    ) : (
      <div
        key={g.id}
        className={tileClass}
        style={style}
        role={withTips ? 'img' : undefined}
        aria-label={withTips ? aria : undefined}
        tabIndex={withTips ? 0 : undefined}
      >
        {inner}
      </div>
    )

    if (!withTips) return tile

    return (
      <Tooltip key={g.id}>
        <TooltipTrigger asChild>{tile}</TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side="top"
            sideOffset={6}
            className="pointer-events-none min-w-[168px] border-white/10 bg-[#11161f]/95 px-3 py-2.5 text-gray-100 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur"
          >
            <div className="flex items-baseline gap-1.5">
              <span lang="en" className="text-[13px] font-semibold text-white">
                {g.name}
              </span>
              <span lang="hi" className="font-deva text-[13px] text-gray-300">
                {g.nameHi}
              </span>
            </div>
            <div lang={lang === 'hi' ? 'hi' : 'en'} className={cn('mt-0.5 text-[12px] text-gray-500', lang === 'hi' && 'font-deva')}>
              {lang === 'hi' ? `${g.divisionHi} ${tr(DIVISION, 'hi')}` : `${g.division} ${tr(DIVISION, 'en')}`}
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/10 pt-2">
              <span
                lang={isDevanagari(v == null ? noData : metric) ? 'hi' : 'en'}
                className={cn('text-[12px] text-gray-400', isDevanagari(v == null ? noData : metric) && 'font-deva')}
              >
                {v == null ? noData : metric}
              </span>
              <span className="flex items-center gap-1.5 text-[14px] font-semibold tabular-nums text-white">
                <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-white/20" style={{ backgroundColor: bg }} aria-hidden />
                {v == null ? '—' : fmt(v)}
              </span>
            </div>
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    )
  }

  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1].map((s) => seqColor(s))
  const metricDeva = isDevanagari(metric)

  return (
    <TooltipProvider delayDuration={80} skipDelayDuration={200}>
      <div className={cn(cfg.box, 'min-w-0', className)}>
        <div className="relative">
          {riverOn && (
            <>
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 800 600"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id={gangaId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,306 C60,292 120,318 190,302 S320,288 400,300 S540,314 610,298 S740,288 800,304"
                  fill="none"
                  stroke={`url(#${gangaId})`}
                  strokeWidth={size === 'lg' ? 5 : 3.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span
                lang={lang === 'hi' ? 'hi' : 'en'}
                className={cn(
                  'pointer-events-none absolute left-0 select-none text-[12px] font-medium italic text-sky-300/70',
                  lang === 'hi' && 'font-deva not-italic',
                )}
                style={{ top: 'calc(50% - 22px)', width: `${100 / COLS}%`, textAlign: 'center' }}
                aria-hidden
              >
                {tr(RIVER, lang)}
              </span>
            </>
          )}
          <div
            ref={gridRef}
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, auto)`,
              gap: cfg.gap,
            }}
          >
            {DISTRICT_GEO.map((g, i) => renderTile(g, i))}
          </div>
        </div>

        {legendOn && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-400">
            <div className="flex min-w-0 items-center gap-2">
              <span lang={metricDeva ? 'hi' : 'en'} className={cn('truncate', metricDeva && 'font-deva')}>
                {metric}
              </span>
              <span className="tabular-nums text-gray-500">{fmt(lo)}</span>
              <span
                className="h-2 w-24 shrink-0 rounded-full ring-1 ring-white/10 sm:w-32"
                style={{ backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})` }}
                aria-hidden
              />
              <span className="tabular-nums text-gray-500">{fmt(hi)}</span>
            </div>
            {hasNull && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-[3px] bg-[#1f2530] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_2px,transparent_2px_4px)] ring-1 ring-white/10"
                  aria-hidden
                />
                <span lang={lang === 'hi' ? 'hi' : 'en'} className={cn(lang === 'hi' && 'font-deva')}>
                  {tr(NO_DATA_LEGEND, lang)}
                </span>
              </span>
            )}
            {hlSet && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] ring-2 ring-emerald-300/90" aria-hidden />
                <span lang={lang === 'hi' ? 'hi' : 'en'} className={cn(lang === 'hi' && 'font-deva')}>
                  {tr(HIGHLIGHT_LEGEND, lang)}
                </span>
              </span>
            )}
            {legendExtra}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
