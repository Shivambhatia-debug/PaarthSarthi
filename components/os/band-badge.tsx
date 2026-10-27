'use client'

import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr } from '@/lib/os/i18n'
import { bandFor, type BandId } from '@/lib/os/scoring'
import { cn } from '@/lib/utils'

// Literal class strings so Tailwind generates them (lib/ is not in the content globs).
const BAND_STYLE: Record<BandId, { chip: string; dot: string }> = {
  foundation: { chip: 'border-rose-500/30 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]' },
  developing: { chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' },
  ready: { chip: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300', dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' },
  'drive-ready': {
    chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  },
}

// Also referenced by bandClasses() in lib/os/scoring.ts; listed here so Tailwind always emits them.
export const BAND_SAFELIST =
  'text-rose-400 text-amber-400 text-cyan-400 text-emerald-400 bg-rose-500/10 bg-amber-500/10 bg-cyan-500/10 bg-emerald-500/10 border-rose-500/30 border-amber-500/30 border-cyan-500/30 border-emerald-500/30'

export interface BandBadgeProps {
  pri: number | null | undefined
  /** Optional (additive): prefix the PRI number, e.g. '71 · Interview-ready'. */
  showValue?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** PRI band pill: colour dot + band label (Needs foundation / Developing / Interview-ready / Drive-ready). */
export function BandBadge({ pri, showValue, size = 'sm', className }: BandBadgeProps) {
  const lang = useLang()
  const band = bandFor(pri)
  const style = BAND_STYLE[band.id]
  const label = tr(band.label, lang)
  const deva = isDevanagari(label)
  const hasValue = typeof pri === 'number' && Number.isFinite(pri)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium leading-none',
        size === 'md' ? 'h-7 px-3 text-[13px]' : 'h-6 px-2.5 text-[12px]',
        style.chip,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden />
      {showValue && hasValue && <span className="tabular-nums font-semibold">{Math.round(pri as number)}</span>}
      {showValue && hasValue && <span className="opacity-50">·</span>}
      <span lang={deva ? 'hi' : 'en'} className={cn(deva && 'font-deva')}>
        {label}
      </span>
    </span>
  )
}
