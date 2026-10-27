'use client'

// Hub step 5: animated eligibility check against the picked blueprint's criteria.
// AIThinking first, then one row every 450 ms; ends 'Eligible ✓' and clears the eligibility round.

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Check, CircleDashed, ShieldCheck, X } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import type { Blueprint, Persona } from '@/lib/mock/types'
import type { Bi } from '@/lib/os/i18n'
import { AIThinking } from '@/components/ai/ai-thinking'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const THINK_MS = 800
const ROW_MS = 450

const TXT = {
  title: { en: 'Eligibility check', hi: 'पात्रता जाँच' },
  thinking: {
    en: 'Sarthi AI is matching your verified records to the drive criteria…',
    hi: 'सारथी AI आपके सत्यापित रिकॉर्ड को ड्राइव मानदंडों से मिला रहा है…',
    hinglish: 'Sarthi AI aapke verified records ko drive criteria se match kar raha hai…',
  },
  eligible: { en: 'Eligible ✓', hi: 'पात्र ✓' },
  eligibleNote: {
    en: 'All criteria met from verified records. Hall ticket generated.',
    hi: 'सत्यापित रिकॉर्ड से सभी मानदंड पूरे। हॉल टिकट तैयार।',
    hinglish: 'Verified records se saare criteria poore. Hall ticket ready.',
  },
  notEligible: { en: 'Not eligible for this blueprint', hi: 'इस ब्लूप्रिंट के लिए पात्र नहीं' },
  notEligibleNote: {
    en: 'Pick another blueprint; Sarthi will suggest a bridge plan.',
    hi: 'दूसरा ब्लूप्रिंट चुनें; सारथी एक ब्रिज प्लान सुझाएगा।',
  },
  source: { en: 'from DigiLocker records (demo)', hi: 'DigiLocker रिकॉर्ड से (डेमो)' },
} satisfies Record<string, Bi>

interface Row {
  id: string
  label: Bi
  need: string
  value: string
  ok: boolean
}

function rowsFor(p: Persona, b: Blueprint): Row[] {
  const e = b.eligibility
  const rows: Row[] = []
  if (p.kind === 'polytechnic') {
    const min = e.minDiplomaPct ?? 60
    const v = p.diplomaPct ?? 0
    rows.push({ id: 'diploma', label: { en: 'Diploma %', hi: 'डिप्लोमा %' }, need: `≥ ${min}%`, value: `${v}%`, ok: v >= min })
  } else {
    const v = p.cgpa ?? 0
    rows.push({ id: 'cgpa', label: { en: 'CGPA', hi: 'CGPA' }, need: `≥ ${e.minCgpa.toFixed(1)}`, value: v.toFixed(1), ok: v >= e.minCgpa })
  }
  const bl = p.activeBacklogs ?? 0
  rows.push({
    id: 'backlogs',
    label: { en: 'Active backlogs', hi: 'सक्रिय बैकलॉग' },
    need: `≤ ${e.maxActiveBacklogs}`,
    value: String(bl),
    ok: bl <= e.maxActiveBacklogs,
  })
  const tenth = p.tenth ?? 0
  rows.push({ id: '10th', label: { en: '10th marks', hi: '10वीं के अंक' }, need: `≥ ${e.min10th}%`, value: `${tenth}%`, ok: tenth >= e.min10th })
  if (p.kind !== 'polytechnic') {
    const tw = p.twelfth ?? 0
    rows.push({ id: '12th', label: { en: '12th marks', hi: '12वीं के अंक' }, need: `≥ ${e.min12th}%`, value: `${tw}%`, ok: tw >= e.min12th })
  }
  const gap = p.gapYears ?? 0
  rows.push({
    id: 'gap',
    label: { en: 'Education gap', hi: 'पढ़ाई में अंतराल' },
    need: `≤ ${e.maxGapYears} yr`,
    value: `${gap} yr`,
    ok: gap <= e.maxGapYears,
  })
  return rows
}

interface Props {
  blueprint: Blueprint
  /** Skip the animation (fast-forward or the round was already cleared). */
  instant?: boolean
  onDone?: (eligible: boolean) => void
  className?: string
}

export const EligibilityCheck = forwardRef<HTMLElement, Props>(function EligibilityCheck(
  { blueprint, instant = false, onDone, className },
  ref,
) {
  const { persona, setRound, lite } = useDemo()
  const rows = useMemo(() => rowsFor(persona, blueprint), [persona, blueprint])
  const quick = instant || lite

  // -1 = thinking; n = rows revealed.
  const [shown, setShown] = useState(quick ? rows.length : -1)
  const done = shown >= rows.length
  const eligible = rows.every((r) => r.ok)

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => setShown((n) => Math.min(rows.length, n + 1)), shown < 0 ? THINK_MS : ROW_MS)
    return () => clearTimeout(id)
  }, [shown, done, rows.length])

  useDemoEvent('fastforward', () => setShown(rows.length))

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const fired = useRef(false)
  useEffect(() => {
    if (!done || fired.current) return
    fired.current = true
    if (eligible) setRound('eligibility', { status: 'cleared', score: 100 })
    onDoneRef.current?.(eligible)
  }, [done, eligible, setRound])

  return (
    <section
      ref={ref}
      className={cn('os-rise scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5', className)}
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden />
        <h2 className="text-[15px] font-semibold text-white">
          <Tr b={TXT.title} />
        </h2>
        <span className="truncate text-[12px] text-gray-500">· {blueprint.label}</span>
      </div>

      {shown < 0 ? (
        <AIThinking label={TXT.thinking} lines={2} />
      ) : (
        <ul className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-[#0d1117]/60">
          {rows.map((r, i) => {
            const vis = i < shown
            return (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                <span
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors duration-300',
                    !vis ? 'bg-white/[0.04] text-gray-600' : r.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
                  )}
                >
                  {!vis ? (
                    <CircleDashed className="h-3.5 w-3.5" aria-hidden />
                  ) : r.ok ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <X className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <span className={cn('min-w-0 flex-1', vis ? 'text-gray-200' : 'text-gray-500')}>
                  <Tr b={r.label} /> <span className="text-gray-500">{r.need}</span>
                </span>
                <span
                  className={cn(
                    'shrink-0 tabular-nums font-semibold transition-opacity duration-300',
                    vis ? 'opacity-100' : 'opacity-0',
                    r.ok ? 'text-emerald-200' : 'text-rose-200',
                  )}
                >
                  {r.value}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {done && (
        <div
          className={cn(
            'os-rise mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-3.5 py-2.5',
            eligible ? 'border-emerald-400/30 bg-emerald-500/[0.08]' : 'border-rose-400/30 bg-rose-500/[0.08]',
          )}
        >
          <span className={cn('text-[15px] font-semibold', eligible ? 'text-emerald-200' : 'text-rose-200')}>
            <Tr b={eligible ? TXT.eligible : TXT.notEligible} />
          </span>
          <span className="text-[12.5px] text-gray-300">
            <Tr b={eligible ? TXT.eligibleNote : TXT.notEligibleNote} />
          </span>
          <span className="text-[12px] text-gray-500 sm:ml-auto">
            <Tr b={TXT.source} />
          </span>
        </div>
      )}
    </section>
  )
})
