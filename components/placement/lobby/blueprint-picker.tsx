'use client'

// Hub step 4: recruiter-style test blueprints. Picking one writes blueprintId; the picked card's Test Blueprint
// table opens under the grid.

import { forwardRef, useMemo } from 'react'
import { Boxes, Building2, Check, Clock3, Code2, Cog, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { BLUEPRINTS } from '@/lib/mock/blueprints'
import type { Blueprint } from '@/lib/mock/types'
import type { Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const TRACK_ICON: Record<Blueprint['track'], LucideIcon> = {
  it: Code2,
  product: Boxes,
  'core-mech': Cog,
  'core-elec': Zap,
  'core-civil': Building2,
}

const TXT = {
  title: { en: 'Choose a test blueprint', hi: 'टेस्ट ब्लूप्रिंट चुनें', hinglish: 'Test blueprint chunein' },
  sub: {
    en: 'Recruiter-style patterns. Pick one to check eligibility and get your hall ticket.',
    hi: 'भर्ती-शैली के पैटर्न। पात्रता जाँचने और हॉल टिकट पाने के लिए एक चुनें।',
    hinglish: 'Recruiter-style patterns. Eligibility check aur hall ticket ke liye ek chunein.',
  },
  min: { en: 'min', hi: 'मिनट' },
  neg: { en: 'Negative marking', hi: 'नेगेटिव मार्किंग' },
  noNeg: { en: 'No negative marking', hi: 'नेगेटिव मार्किंग नहीं' },
  elim: { en: 'eliminatory', hi: 'एलिमिनेटरी' },
  calibrated: { en: 'AI-calibrated to Bihar 2026-27 cohort', hi: 'बिहार 2026-27 बैच के लिए AI-कैलिब्रेटेड' },
  commElim: { en: 'Communication: eliminatory', hi: 'संवाद: एलिमिनेटरी' },
  commAdv: { en: 'Communication: advisory', hi: 'संवाद: सलाहकारी' },
  aiPick: { en: 'Sarthi AI pick', hi: 'सारथी AI की पसंद' },
  selected: { en: 'Selected', hi: 'चयनित' },
  table: { en: 'Test Blueprint', hi: 'टेस्ट ब्लूप्रिंट' },
  section: { en: 'Section', hi: 'सेक्शन' },
  qs: { en: 'Questions', hi: 'प्रश्न' },
  minutes: { en: 'Minutes', hi: 'मिनट' },
  cutoff: { en: 'Cutoff', hi: 'कटऑफ़' },
  negative: { en: 'Negative', hi: 'नेगेटिव' },
  revisit: { en: 'Revisit', hi: 'दोबारा देखें' },
  eliminatory: { en: 'Eliminatory', hi: 'एलिमिनेटरी' },
  yes: { en: 'Yes', hi: 'हाँ' },
  no: { en: 'No', hi: 'नहीं' },
  total: { en: 'Total', hi: 'कुल' },
} satisfies Record<string, Bi>

export function totalMinutes(b: Blueprint): number {
  return b.sections.reduce((s, x) => s + (Number.isFinite(x.minutes) ? x.minutes : 0), 0)
}

interface Props {
  selectedId: string
  recommendedId?: string
  /** True once the student has picked: the selected card's table opens. */
  picked: boolean
  onPick: (id: string) => void
  className?: string
}

export function BlueprintPicker({ selectedId, recommendedId, picked, onPick, className }: Props) {
  const { t } = useDemo()

  // Sarthi's pick first, then the rest in catalogue order.
  const list = useMemo(() => {
    const rec = BLUEPRINTS.find((b) => b.id === recommendedId)
    return rec ? [rec, ...BLUEPRINTS.filter((b) => b.id !== rec.id)] : BLUEPRINTS
  }, [recommendedId])

  const selected = BLUEPRINTS.find((b) => b.id === selectedId)

  return (
    <section className={cn('os-rise', className)} aria-labelledby="ps-bp-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="ps-bp-title" className="text-lg font-semibold text-white">
            <Tr b={TXT.title} />
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-400">
            <Tr b={TXT.sub} />
          </p>
        </div>
      </div>

      <div role="radiogroup" aria-label={t(TXT.title)} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((b) => {
          const Icon = TRACK_ICON[b.track] ?? Code2
          const isSel = picked && b.id === selectedId
          const isRec = b.id === recommendedId
          const neg = b.sections.some((s) => s.negativeMarking)
          const elim = b.sections.filter((s) => s.eliminatory).length
          return (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              data-blueprint={b.id}
              onClick={() => onPick(b.id)}
              className={cn(
                'group relative flex flex-col rounded-xl border p-3.5 text-left transition-all duration-200',
                isSel
                  ? 'border-cyan-300/60 bg-cyan-400/[0.07] shadow-[0_0_0_1px_rgba(103,232,249,0.25),0_18px_40px_-24px_rgba(34,211,238,0.7)]'
                  : isRec && !picked
                    ? 'border-cyan-300/35 bg-white/[0.035] hover:border-cyan-300/60'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.045]',
              )}
            >
              {isRec && !picked && (
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-cyan-300/40 motion-safe:animate-pulse" />
              )}
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-lg border',
                    isSel ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-white/[0.04] text-gray-300',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug text-white">{b.label}</p>
                  <p className="mt-0.5 truncate text-[12px] text-gray-500">{b.typicalBand}</p>
                </div>
                {isSel ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-400 text-[#06121a]">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                ) : isRec ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/25 to-emerald-400/25 px-2 py-0.5 text-[12px] font-medium text-cyan-100">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    <span className="hidden sm:inline">
                      <Tr b={TXT.aiPick} />
                    </span>
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-300">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                  {totalMinutes(b)} <Tr b={TXT.min} />
                </span>
                <span className={neg ? 'text-amber-200' : 'text-gray-400'}>
                  <Tr b={neg ? TXT.neg : TXT.noNeg} />
                </span>
                {elim > 0 && (
                  <span className="text-rose-200">
                    {elim} <Tr b={TXT.elim} />
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-violet-400/25 bg-violet-500/[0.08] px-1.5 py-0.5 text-[12px] text-violet-200">
                  <Tr b={TXT.calibrated} />
                </span>
                <span
                  className={cn(
                    'rounded-md border px-1.5 py-0.5 text-[12px]',
                    b.commPolicy === 'eliminatory'
                      ? 'border-rose-400/25 bg-rose-500/[0.08] text-rose-200'
                      : 'border-sky-400/25 bg-sky-500/[0.08] text-sky-200',
                  )}
                >
                  <Tr b={b.commPolicy === 'eliminatory' ? TXT.commElim : TXT.commAdv} />
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {picked && selected && <BlueprintTable key={selected.id} blueprint={selected} />}
    </section>
  )
}

export const BlueprintTable = forwardRef<HTMLDivElement, { blueprint: Blueprint }>(function BlueprintTable(
  { blueprint: b },
  ref,
) {
  const yes = <Tr b={TXT.yes} />
  const no = <span className="text-gray-500">—</span>
  const qTotal = b.sections.reduce((s, x) => s + x.questions, 0)
  return (
    <div ref={ref} id="ps-bp-table" className="os-rise mt-4 scroll-mt-24 rounded-xl border border-cyan-300/20 bg-[#0d1117]/70 p-3.5 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-[14px] font-semibold text-white">
          <Tr b={TXT.table} /> · {b.label}
        </h3>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[12px] text-gray-300">
          {b.demoPaceNote}
        </span>
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-[12.5px]">
          <thead>
            <tr className="text-[12px] text-gray-500">
              {[TXT.section, TXT.qs, TXT.minutes, TXT.cutoff, TXT.negative, TXT.revisit, TXT.eliminatory].map((h, i) => (
                <th key={h.en} className={cn('border-b border-white/10 px-2 py-2 font-medium', i > 0 && 'text-center')}>
                  <Tr b={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.sections.map((s) => (
              <tr key={s.name} className="text-gray-200">
                <td className="border-b border-white/[0.05] px-2 py-2 font-medium text-white">{s.name}</td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center tabular-nums">{s.questions}</td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center tabular-nums">{s.minutes}</td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center tabular-nums">
                  {typeof s.sectionalCutoff === 'number' ? `${s.sectionalCutoff}%` : no}
                </td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center">
                  {s.negativeMarking ? <span className="text-amber-200">{yes}</span> : no}
                </td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center">{s.canRevisit ? yes : no}</td>
                <td className="border-b border-white/[0.05] px-2 py-2 text-center">
                  {s.eliminatory ? <span className="text-rose-200">{yes}</span> : no}
                </td>
              </tr>
            ))}
            <tr className="text-[12px] text-gray-400">
              <td className="px-2 pt-2 font-medium">
                <Tr b={TXT.total} />
              </td>
              <td className="px-2 pt-2 text-center tabular-nums">{qTotal}</td>
              <td className="px-2 pt-2 text-center tabular-nums">{totalMinutes(b)}</td>
              <td colSpan={4} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] italic text-gray-500">{b.footnote}</p>
    </div>
  )
})
