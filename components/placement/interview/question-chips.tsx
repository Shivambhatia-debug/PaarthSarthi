'use client'

import { Check, CornerDownRight, UserRound } from 'lucide-react'
import { tr, type Bi } from '@/lib/os/i18n'
import { useLang } from '@/lib/os/demo-store'
import { Tr } from '@/components/os/tr-text'
import type { IQ } from '@/components/placement/interview/script'
import { cn } from '@/lib/utils'

const GUEST: Bi = { en: 'G · Guest question', hi: 'G · अतिथि प्रश्न', hinglish: 'G · Guest question' }
const GUEST_HINT: Bi = {
  en: 'For an invited official: ask the student a question about their district',
  hi: 'आमंत्रित अधिकारी के लिए: छात्र से उनके ज़िले के बारे में एक सवाल',
  hinglish: 'Invited official ke liye: student se unke zile ke baare mein ek sawaal',
}

export interface QuestionChipsProps {
  queue: IQ[]
  index: number
  results: Record<string, unknown>
  guestId: string
  onJump: (id: string) => void
  onGuest: () => void
  disabled?: boolean
  className?: string
}

export function QuestionChips({ queue, index, results, guestId, onJump, onGuest, disabled, className }: QuestionChipsProps) {
  const lang = useLang()
  const guestInQueue = queue.some((q) => q.id === guestId)

  return (
    <nav aria-label="Questions" className={cn('-mx-1 overflow-x-auto px-1 pb-1', className)}>
      <ul className="flex w-max items-center gap-1.5">
        {queue.map((q, i) => {
          const active = i === index
          const done = !!results[q.id]
          const follow = q.kind === 'followup'
          const guest = q.kind === 'guest'
          const title = tr(q.topic, lang)
          return (
            <li key={q.id} className="flex items-center">
              {follow && <CornerDownRight className="mr-0.5 h-3.5 w-3.5 text-violet-400/70" aria-hidden />}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onJump(q.id)}
                title={title}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12px] font-semibold transition-all',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  active
                    ? follow
                      ? 'border-violet-300/60 bg-violet-500/20 text-violet-50 shadow-[0_0_18px_-4px_rgba(167,139,250,0.8)]'
                      : 'border-cyan-300/60 bg-cyan-400/15 text-white shadow-[0_0_18px_-4px_rgba(34,211,238,0.8)]'
                    : done
                      ? 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200 hover:border-emerald-300/50'
                      : follow
                        ? 'animate-in zoom-in-75 fade-in border-violet-400/30 bg-violet-500/10 text-violet-200 duration-300 hover:border-violet-300/50'
                        : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:text-white',
                )}
              >
                {done && !active && <Check className="h-3 w-3" aria-hidden />}
                {guest ? <Tr b={GUEST} /> : q.id}
                {!guest && <Tr b={q.topic} className="hidden max-w-[140px] truncate font-normal opacity-70 xl:inline" />}
              </button>
            </li>
          )
        })}
        {!guestInQueue && (
          <li className="ml-1 flex items-center">
            <button
              type="button"
              disabled={disabled}
              onClick={onGuest}
              title={tr(GUEST_HINT, lang)}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-amber-300/40 bg-amber-300/[0.06] px-3 text-[12px] font-semibold text-amber-200 transition-colors hover:border-amber-200/70 hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              <Tr b={GUEST} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
