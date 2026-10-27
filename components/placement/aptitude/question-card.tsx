'use client'

// One exam question, iON-style: large radio targets, EN/HI toggle, difficulty + section chips.
// Text is not selectable (the round is proctored; copy and paste are blocked by the foundation proctor).

import { Bookmark, Check, Languages } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { cn } from '@/lib/utils'
import {
  APT_SECTIONS,
  DIFFICULTY_LABEL,
  TOTAL_SLOTS,
  sectionOfSlot,
  topicLabel,
  type AptQuestion,
  type Difficulty,
} from '@/components/placement/aptitude/questions'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

const TXT = {
  question: { en: 'Question', hi: 'प्रश्न' },
  of: { en: 'of', hi: '/' },
  marked: { en: 'Marked for review', hi: 'समीक्षा हेतु चिह्नित' },
  adjusting: { en: 'Sarthi AI adjusting difficulty', hi: 'सारथी AI कठिनाई बदल रहा है', hinglish: 'Sarthi AI adjusting difficulty' },
  holding: { en: 'Sarthi AI holding difficulty at', hi: 'सारथी AI कठिनाई बनाए रख रहा है:', hinglish: 'Sarthi AI holding difficulty at' },
  qlang: { en: 'Question language', hi: 'प्रश्न की भाषा' },
  pick: { en: 'Choose one answer', hi: 'एक उत्तर चुनें' },
}

const DIFF_CHIP: Record<Difficulty, string> = {
  1: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  2: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  3: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

export interface AdjustInfo {
  from: Difficulty
  to: Difficulty
}

export interface QuestionCardProps {
  question: AptQuestion | undefined
  slot: number
  selected: number | null
  marked: boolean
  qLang: 'en' | 'hi'
  onQLang: (l: 'en' | 'hi') => void
  onSelect: (option: number) => void
  /** When set, the adaptive engine is choosing the next item (700 ms pill). */
  adjust: AdjustInfo | null
  disabled?: boolean
}

/** Violet pill shown for 700 ms between questions while the adaptive engine picks the next item. */
export function AdjustPill({ adjust }: { adjust: AdjustInfo }) {
  const { t } = useDemo()
  const changed = adjust.to !== adjust.from
  const up = adjust.to > adjust.from
  const head = t(changed ? TXT.adjusting : TXT.holding)
  const lvl = t(DIFFICULTY_LABEL[adjust.to])
  return (
    <div
      role="status"
      aria-live="polite"
      className="os-rise inline-flex items-center gap-2.5 rounded-full border border-violet-400/40 bg-violet-500/[0.14] py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-violet-100 shadow-[0_0_30px_-6px_rgba(139,92,246,0.65)]"
    >
      <AIOrb state="thinking" size={22} label="" />
      <span>
        <Tr b={head} />{' '}
        <span className={cn('font-semibold', up ? 'text-rose-200' : changed ? 'text-emerald-200' : 'text-violet-50')}>
          {changed ? '→ ' : ''}
          <Tr b={lvl} />
        </span>
      </span>
    </div>
  )
}

export function QuestionCard({
  question,
  slot,
  selected,
  marked,
  qLang,
  onQLang,
  onSelect,
  adjust,
  disabled,
}: QuestionCardProps) {
  const { t } = useDemo()
  const section = APT_SECTIONS[sectionOfSlot(slot)]
  const showHi = qLang === 'hi'
  const text = question ? (showHi ? question.q.hi || question.q.en : question.q.en) : ''
  const opts = question ? (showHi && question.optionsHi ? question.optionsHi : question.options) : []
  const level = (question?.difficulty ?? 2) as Difficulty

  return (
    <section
      aria-label={`${t(TXT.question)} ${slot + 1}`}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-40px_rgba(34,211,238,0.35)]"
    >
      {/* header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] px-4 py-3 sm:px-5">
        <span className="text-[13px] font-semibold text-white">
          <Tr b={TXT.question} /> <span className="tabular-nums">{slot + 1}</span>
          <span className="text-gray-500">
            {' '}
            / <span className="tabular-nums">{TOTAL_SLOTS}</span>
          </span>
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[12px] text-gray-300">
          <Tr b={section.label} />
        </span>
        {question && (
          <span className={cn('rounded-full border px-2 py-0.5 text-[12px] font-medium', DIFF_CHIP[level])}>
            <Tr b={DIFFICULTY_LABEL[level]} />
          </span>
        )}
        {question && (
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[12px] text-gray-400 sm:inline">
            <Tr b={topicLabel(question.topic)} />
          </span>
        )}
        {marked && (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[12px] text-violet-200">
            <Bookmark className="h-3 w-3" aria-hidden />
            <Tr b={TXT.marked} />
          </span>
        )}
        <div
          role="radiogroup"
          aria-label={t(TXT.qlang)}
          className="ml-auto inline-flex h-8 items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
        >
          <Languages className="mx-1.5 h-3.5 w-3.5 text-gray-500" aria-hidden />
          {(['en', 'hi'] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={qLang === l}
              onClick={() => onQLang(l)}
              lang={l === 'hi' ? 'hi' : 'en'}
              className={cn(
                'h-full rounded-md px-2.5 text-[12px] font-semibold transition-colors',
                l === 'hi' && 'font-deva pt-[2px]',
                qLang === l ? 'bg-white/[0.12] text-white' : 'text-gray-400 hover:text-gray-100',
              )}
            >
              {l === 'en' ? 'EN' : 'हिं'}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="relative min-h-[340px] px-4 py-5 sm:px-6 sm:py-6">
        {adjust ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-5">
            <AdjustPill adjust={adjust} />
            <div aria-hidden className="w-full max-w-lg space-y-3">
              {[92, 78, 64].map((w) => (
                <div key={w} className="ai-shimmer h-3 rounded-full" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <div key={question?.id ?? 'none'} className="os-rise">
            <p
              lang={showHi ? 'hi' : 'en'}
              className={cn(
                'select-none whitespace-pre-line text-base leading-relaxed text-gray-50 sm:text-[17px]',
                showHi && 'font-deva',
              )}
            >
              {text}
            </p>
            <p className="mt-4 text-[12px] uppercase tracking-[0.12em] text-gray-500">
              <Tr b={TXT.pick} />
            </p>
            <div role="radiogroup" aria-label={text} className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {opts.map((o, i) => {
                const active = selected === i
                const deva = showHi && !!question?.optionsHi
                return (
                  <button
                    key={`${question?.id}-${i}`}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={disabled}
                    onClick={() => onSelect(i)}
                    className={cn(
                      'group flex min-h-[56px] w-full select-none items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-base transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
                      active
                        ? 'border-cyan-300/70 bg-cyan-400/[0.12] text-white shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_10px_30px_-12px_rgba(34,211,238,0.55)]'
                        : 'border-white/10 bg-white/[0.02] text-gray-200 hover:border-white/25 hover:bg-white/[0.05]',
                      disabled && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[13px] font-bold transition-colors',
                        active
                          ? 'border-cyan-300 bg-cyan-300 text-[#0b1220]'
                          : 'border-white/15 bg-white/[0.04] text-gray-300 group-hover:border-white/30',
                      )}
                    >
                      {active ? <Check className="h-4 w-4" strokeWidth={3} /> : LETTERS[i]}
                    </span>
                    <span lang={deva ? 'hi' : 'en'} className={cn('min-w-0 flex-1 leading-snug', deva && 'font-deva')}>
                      {o}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
