'use client'

import { useState } from 'react'
import { useLang } from '@/lib/os/demo-store'
import { fmtNum, isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { seqColor } from '@/lib/os/scoring'
import { cn } from '@/lib/utils'

/** Display labels for SkillKey / pillar ids (anything else renders as-is). */
const KNOWN_LABELS: Record<string, Bi> = {
  aptitude: { en: 'Aptitude', hi: 'अभिरुचि' },
  dsa: { en: 'DSA', hi: 'DSA' },
  sql: { en: 'SQL', hi: 'SQL' },
  python: { en: 'Python', hi: 'Python' },
  core: { en: 'Core', hi: 'कोर' },
  cad: { en: 'CAD', hi: 'CAD' },
  plc: { en: 'PLC', hi: 'PLC' },
  communication: { en: 'Comm.', hi: 'संवाद' },
  excel: { en: 'Excel', hi: 'Excel' },
  technical: { en: 'Technical', hi: 'तकनीकी' },
  techInterview: { en: 'Tech int.', hi: 'तकनीकी इंटरव्यू' },
  hr: { en: 'HR', hi: 'एचआर' },
  resume: { en: 'Resume', hi: 'रिज़्यूमे' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
}

const LEGEND: Bi = { en: 'Skill score', hi: 'कौशल स्कोर' }
const LOW: Bi = { en: 'Weak', hi: 'कमज़ोर' }
const HIGH: Bi = { en: 'Strong', hi: 'मज़बूत' }
const HOVER_HINT: Bi = { en: 'Hover a cell for details', hi: 'विवरण के लिए सेल पर जाएँ' }

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return 0
  const ch = [m[1], m[2], m[3]].map((x) => {
    const c = parseInt(x, 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

export interface HeatmapProps {
  rows: string[]
  cols: string[]
  values: number[][]
  min?: number
  max?: number
  formatValue?: (v: number) => string
  onCellClick?: (row: string, col: string, value: number, rowIndex: number, colIndex: number) => void
  caption?: Bi | string
  /** Optional (additive): display labels overriding rows / cols. */
  rowLabels?: (Bi | string)[]
  colLabels?: (Bi | string)[]
  /** Optional (additive): legend title. */
  legendLabel?: Bi | string
  className?: string
}

/** Branch x skill heatmap: CSS grid, sequential slate -> blue -> cyan -> emerald fill, legend, hover outline. */
export function Heatmap({
  rows,
  cols,
  values,
  min = 30,
  max = 85,
  formatValue,
  onCellClick,
  caption,
  rowLabels,
  colLabels,
  legendLabel = LEGEND,
  className,
}: HeatmapProps) {
  const lang = useLang()
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const R = Array.isArray(rows) ? rows : []
  const C = Array.isArray(cols) ? cols : []
  const span = max - min || 1
  const fmt = (v: number) => {
    try {
      return formatValue ? formatValue(v) : fmtNum(v, 0)
    } catch {
      return String(v)
    }
  }
  const label = (key: string, override?: Bi | string) => tr(override ?? KNOWN_LABELS[key] ?? key, lang)
  const valueAt = (r: number, c: number): number | null => {
    const v = values?.[r]?.[c]
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }

  const cap = caption ? tr(caption, lang) : ''
  const hv = hover ? valueAt(hover.r, hover.c) : null
  const readout = hover
    ? `${label(R[hover.r] ?? '', rowLabels?.[hover.r])} × ${label(C[hover.c] ?? '', colLabels?.[hover.c])}: ${hv == null ? '—' : fmt(hv)}`
    : tr(HOVER_HINT, lang)
  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => seqColor(t))

  return (
    <figure className={cn('min-w-0', className)}>
      {cap && (
        <figcaption
          lang={isDevanagari(cap) ? 'hi' : 'en'}
          className={cn('mb-3 text-[13px] text-gray-400', isDevanagari(cap) && 'font-deva')}
        >
          {cap}
        </figcaption>
      )}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="grid min-w-[520px] gap-1"
          style={{ gridTemplateColumns: `minmax(64px, auto) repeat(${Math.max(1, C.length)}, minmax(44px, 1fr))` }}
          onMouseLeave={() => setHover(null)}
        >
          <div />
          {C.map((c, ci) => {
            const s = label(c, colLabels?.[ci])
            const deva = isDevanagari(s)
            return (
              <div
                key={`h-${c}-${ci}`}
                lang={deva ? 'hi' : 'en'}
                className={cn(
                  'truncate px-0.5 pb-1 text-center text-[12px] font-medium transition-colors',
                  hover?.c === ci ? 'text-white' : 'text-gray-400',
                  deva && 'font-deva',
                )}
                title={s}
              >
                {s}
              </div>
            )
          })}
          {R.map((r, ri) => {
            const rl = label(r, rowLabels?.[ri])
            const rdeva = isDevanagari(rl)
            return [
              <div
                key={`r-${r}-${ri}`}
                lang={rdeva ? 'hi' : 'en'}
                className={cn(
                  'flex items-center truncate pr-2 text-[12px] font-semibold transition-colors',
                  hover?.r === ri ? 'text-white' : 'text-gray-300',
                  rdeva && 'font-deva',
                )}
              >
                {rl}
              </div>,
              ...C.map((c, ci) => {
                const v = valueAt(ri, ci)
                const t = v == null ? 0 : (v - min) / span
                const bg = v == null ? '#1f2937' : seqColor(t)
                const dark = v != null && luminance(bg) > 0.3
                const active = hover?.r === ri && hover?.c === ci
                const clickable = !!onCellClick && v != null
                return (
                  <button
                    key={`c-${r}-${c}-${ri}-${ci}`}
                    type="button"
                    disabled={!clickable}
                    onMouseEnter={() => setHover({ r: ri, c: ci })}
                    onFocus={() => setHover({ r: ri, c: ci })}
                    onClick={() => v != null && onCellClick?.(r, c, v, ri, ci)}
                    aria-label={`${rl} ${label(c, colLabels?.[ci])}: ${v == null ? '—' : fmt(v)}`}
                    className={cn(
                      'tile-pop relative flex h-10 items-center justify-center rounded-md text-[12px] font-semibold tabular-nums outline-none',
                      'transition-[box-shadow,transform] duration-150 disabled:cursor-default',
                      clickable && 'cursor-pointer',
                      active
                        ? 'z-10 scale-[1.06] shadow-[0_0_0_2px_rgba(255,255,255,0.85),0_8px_24px_-8px_rgba(0,0,0,0.8)]'
                        : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
                      'focus-visible:shadow-[0_0_0_2px_rgba(103,232,249,0.9)]',
                      dark ? 'text-slate-950' : 'text-white/90',
                    )}
                    style={{ backgroundColor: bg, animationDelay: `${(ri + ci) * 22}ms` }}
                  >
                    {v == null ? '—' : fmt(v)}
                  </button>
                )
              }),
            ]
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 text-[12px] text-gray-400">
          <span
            lang={isDevanagari(tr(legendLabel, lang)) ? 'hi' : 'en'}
            className={cn(isDevanagari(tr(legendLabel, lang)) && 'font-deva')}
          >
            {tr(legendLabel, lang)}
          </span>
          <span className="tabular-nums text-gray-500">{fmt(min)}</span>
          <span
            className="h-2 w-28 rounded-full ring-1 ring-white/10 sm:w-36"
            style={{ backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})` }}
            aria-hidden
          />
          <span className="tabular-nums text-gray-500">{fmt(max)}</span>
          <span className="hidden text-gray-500 sm:inline">
            (<span lang={lang === 'hi' ? 'hi' : 'en'} className={cn(lang === 'hi' && 'font-deva')}>{tr(LOW, lang)} → {tr(HIGH, lang)}</span>)
          </span>
        </div>
        <div
          aria-live="polite"
          className={cn(
            'min-h-[18px] text-[12px] tabular-nums',
            hover ? 'text-gray-200' : 'text-gray-500',
            isDevanagari(readout) && 'font-deva',
          )}
          lang={isDevanagari(readout) ? 'hi' : 'en'}
        >
          {readout}
        </div>
      </div>
    </figure>
  )
}
