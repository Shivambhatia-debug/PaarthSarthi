'use client'

import { useCountUp } from '@/lib/ai-sim'
import { fmtIN } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export interface CountUpProps {
  value: number
  durationMs?: number
  decimals?: number
  /** Formats the animated value. Default fmtIN(n, decimals) (Indian grouping). */
  format?: (n: number) => string
  className?: string
  /** Optional (additive): start value. Default 0. */
  from?: number
}

/** A number that counts up (900 ms ease-out). Later value changes animate from the shown value. */
export function CountUp({ value, durationMs = 900, decimals = 0, format, className, from = 0 }: CountUpProps) {
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0
  const v = useCountUp(safe, { durationMs, decimals, from })
  let text: string
  try {
    text = format ? format(v) : fmtIN(v, decimals)
  } catch {
    text = fmtIN(v, decimals)
  }
  return <span className={cn('tabular-nums', className)}>{text}</span>
}
