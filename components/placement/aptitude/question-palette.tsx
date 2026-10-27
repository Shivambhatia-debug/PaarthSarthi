'use client'

// iON-style question palette: Answered (emerald) / Marked (violet) / Not visited (grey) / Not answered / Current (ring).
// A section locks when its time ends or when the candidate moves on.

import type { ReactNode } from 'react'
import { Bookmark, Lock } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { cn } from '@/lib/utils'
import { APT_SECTIONS, slotsOfSection } from '@/components/placement/aptitude/questions'

export interface PaletteSlot {
  visited: boolean
  saved: number | null
  marked: boolean
}

export interface QuestionPaletteProps {
  slots: PaletteSlot[]
  current: number
  activeSection: number
  lockedSections: boolean[]
  onGoto: (slot: number) => void
  disabled?: boolean
  className?: string
}

const TXT = {
  title: { en: 'Question palette', hi: 'प्रश्न पैलेट' },
  answered: { en: 'Answered', hi: 'उत्तर दिया' },
  marked: { en: 'Marked', hi: 'चिह्नित' },
  notVisited: { en: 'Not visited', hi: 'नहीं देखा' },
  notAnswered: { en: 'Not answered', hi: 'उत्तर नहीं' },
  current: { en: 'Current', hi: 'वर्तमान' },
  locked: { en: 'Locked', hi: 'बंद' },
  adaptive: {
    en: 'Adaptive: the next item is chosen after you save. Sections run in order.',
    hi: 'अनुकूली: सेव करने के बाद अगला प्रश्न चुना जाता है। सेक्शन क्रम से चलते हैं।',
  },
}

type Kind = 'answered' | 'marked' | 'notVisited' | 'notAnswered'

function kindOf(s: PaletteSlot): Kind {
  if (s.marked) return 'marked'
  if (s.saved !== null) return 'answered'
  if (s.visited) return 'notAnswered'
  return 'notVisited'
}

const KIND_CLS: Record<Kind, string> = {
  answered: 'border-emerald-400/50 bg-emerald-500/80 text-[#04150e]',
  marked: 'border-violet-300/60 bg-violet-500/80 text-white',
  notVisited: 'border-dashed border-white/20 bg-transparent text-gray-500',
  notAnswered: 'border-rose-400/40 bg-rose-500/[0.12] text-rose-100',
}

export function QuestionPalette({
  slots,
  current,
  activeSection,
  lockedSections,
  onGoto,
  disabled,
  className,
}: QuestionPaletteProps) {
  const { t } = useDemo()
  const count = (k: Kind) => slots.filter((s) => kindOf(s) === k).length

  return (
    <section
      aria-label={t(TXT.title)}
      className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', className)}
    >
      <h3 className="mb-3 text-[13px] font-semibold text-white">
        <Tr b={TXT.title} />
      </h3>

      <div className="space-y-3">
        {APT_SECTIONS.map((sec, si) => {
          const locked = !!lockedSections[si]
          const active = si === activeSection && !locked
          return (
            <div key={sec.id} className={cn('flex items-center gap-3', locked && 'opacity-60')}>
              <span
                className={cn(
                  'inline-flex w-[92px] shrink-0 items-center gap-1.5 text-[12px] font-medium',
                  active ? 'text-cyan-200' : 'text-gray-400',
                )}
              >
                {locked && <Lock className="h-3 w-3 shrink-0" aria-hidden />}
                <Tr b={sec.label} className="truncate" />
              </span>
              <div className="flex gap-2">
                {slotsOfSection(si).map((idx) => {
                  const s = slots[idx]
                  if (!s) return null
                  const k = kindOf(s)
                  const isCurrent = idx === current && active
                  const clickable = !disabled && active && s.visited && idx !== current
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => clickable && onGoto(idx)}
                      disabled={!clickable}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={`${idx + 1}: ${t(TXT[k])}${locked ? ` · ${t(TXT.locked)}` : ''}`}
                      className={cn(
                        'relative grid h-10 w-10 place-items-center rounded-lg border text-[13px] font-semibold tabular-nums transition-all',
                        KIND_CLS[k],
                        isCurrent && 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#0d1117]',
                        clickable ? 'cursor-pointer hover:brightness-125' : 'cursor-default',
                      )}
                    >
                      {idx + 1}
                      {k === 'marked' && s.saved !== null && (
                        <span
                          aria-hidden
                          className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0d1117] bg-emerald-400"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/[0.06] pt-3 text-[12px] text-gray-400">
        <Legend cls="bg-emerald-500/80 border-emerald-400/50" label={TXT.answered} n={count('answered')} />
        <Legend
          cls="bg-violet-500/80 border-violet-300/60"
          label={TXT.marked}
          n={count('marked')}
          icon={<Bookmark className="h-2.5 w-2.5 text-white" aria-hidden />}
        />
        <Legend cls="border-dashed border-white/25" label={TXT.notVisited} n={count('notVisited')} />
        <Legend cls="bg-rose-500/[0.12] border-rose-400/40" label={TXT.notAnswered} n={count('notAnswered')} />
        <span className="col-span-2 inline-flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-3.5 rounded-[4px] ring-2 ring-cyan-300 ring-offset-1 ring-offset-[#0d1117]" />
          <Tr b={TXT.current} />
        </span>
      </div>
      <p className="mt-3 text-[12px] leading-snug text-gray-500">
        <Tr b={TXT.adaptive} />
      </p>
    </section>
  )
}

function Legend({ cls, label, n, icon }: { cls: string; label: { en: string; hi: string }; n: number; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={cn('grid h-3.5 w-3.5 place-items-center rounded-[4px] border', cls)}>
        {icon}
      </span>
      <Tr b={label} />
      <span className="ml-auto tabular-nums text-gray-500">{n}</span>
    </span>
  )
}
