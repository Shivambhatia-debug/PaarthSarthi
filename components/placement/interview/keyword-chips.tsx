'use client'

import { Check, KeyRound } from 'lucide-react'
import type { KeywordSpec } from '@/lib/ai-sim'
import type { Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { labelOf } from '@/components/placement/interview/script'
import { cn } from '@/lib/utils'

const TITLE: Bi = { en: 'Keywords Sarthi listens for', hi: 'सारथी किन कीवर्ड को सुन रहा है', hinglish: 'Keywords Sarthi sun raha hai' }
const DEVA = /[\u0900-\u097F]/

/** The note's example comes from this question's own keywords (Rahul: "बीएमएस" = BMS), falling back to ESP32. */
function noteFor(keywords: ReadonlyArray<KeywordSpec>): Bi {
  let ex = { alias: 'ईएसपी 32', label: 'ESP32' }
  for (const k of keywords) {
    if (typeof k === 'string') continue
    const alias = k.aliases?.find((a) => DEVA.test(a))
    if (alias) {
      ex = { alias, label: k.label }
      break
    }
  }
  const e = `"${ex.alias}" = ${ex.label}`
  return {
    en: `Matched in English or Devanagari (e.g. ${e}).`,
    hi: `अंग्रेज़ी या देवनागरी, दोनों में पहचान (जैसे ${e})।`,
    hinglish: `English ya Devanagari dono mein match (jaise ${e}).`,
  }
}

export interface KeywordChipsProps {
  keywords: ReadonlyArray<KeywordSpec>
  /** Labels detected so far (detectKeywords output). */
  hit: ReadonlyArray<string>
  className?: string
}

export function KeywordChips({ keywords, hit, className }: KeywordChipsProps) {
  const labels = Array.from(new Set(keywords.map(labelOf)))
  const hitSet = new Set(hit)
  const count = labels.filter((l) => hitSet.has(l)).length

  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <KeyRound className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
          <Tr b={TITLE} as="h3" className="truncate text-[13px] font-semibold text-gray-100" />
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums',
            count > 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.05] text-gray-400',
          )}
          aria-live="polite"
        >
          {count}/{labels.length}
        </span>
      </div>
      {labels.length === 0 ? (
        <p className="text-[12px] text-gray-500">—</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {labels.map((l) => {
            const on = hitSet.has(l)
            return (
              <li
                key={`${l}:${on ? 1 : 0}`}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors',
                  on
                    ? 'animate-in zoom-in-75 fade-in border-emerald-400/40 bg-emerald-400/15 text-emerald-200 shadow-[0_0_14px_-4px_rgba(52,211,153,0.7)] duration-300'
                    : 'border-white/10 bg-white/[0.02] text-gray-400',
                )}
              >
                {on && <Check className="h-3 w-3" aria-hidden />}
                {l}
              </li>
            )
          })}
        </ul>
      )}
      <Tr b={noteFor(keywords)} as="p" className="mt-3 text-[12px] leading-snug text-gray-500" />
    </section>
  )
}
