'use client'

import { Eye, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AIBadge } from '@/components/ai/ai-badge'
import { useDemo, type Signal } from '@/lib/os/demo-store'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { ROUNDS } from '@/lib/os/rounds'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: "Sarthi's notes on you", hi: 'सारथी के नोट्स' },
  desc: {
    en: 'Strengths and gaps Sarthi AI noticed in each round. Every note is reviewed by your T&P officer before it counts.',
    hi: 'हर राउंड में सारथी AI ने जो ताकत और कमियाँ देखीं। हर नोट T&P अधिकारी की समीक्षा के बाद ही गिना जाता है।',
  },
  empty: { en: 'Sarthi AI will note strengths and gaps as you go.', hi: 'आगे बढ़ते हुए सारथी AI आपकी ताकत और कमियाँ नोट करेगा।' },
  strength: { en: 'Strength', hi: 'ताकत' },
  gap: { en: 'Gap', hi: 'कमी' },
  behaviour: { en: 'Behaviour', hi: 'व्यवहार' },
} satisfies Record<string, Bi>

const KIND: Record<Signal['kind'], { Icon: typeof Eye; chip: string; dot: string }> = {
  strength: { Icon: TrendingUp, chip: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200', dot: 'text-emerald-300' },
  gap: { Icon: Target, chip: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-100', dot: 'text-amber-300' },
  behaviour: { Icon: Eye, chip: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-100', dot: 'text-violet-300' },
}

export interface SignalsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Right-hand Sheet listing useDemo().signals grouped by round. */
export function SignalsDrawer({ open, onOpenChange }: SignalsDrawerProps) {
  const { signals, t } = useDemo()
  const list = Array.isArray(signals) ? signals : []
  const groups = ROUNDS.map((r) => ({ round: r, items: list.filter((s) => s.round === r.id) })).filter((g) => g.items.length)

  const lbl = (b: Bi | string, c?: string) => {
    const s = t(b)
    const d = isDevanagari(s)
    return (
      <span lang={d ? 'hi' : 'en'} className={cn(d && 'font-deva', c)}>
        {s}
      </span>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-white/10 bg-[#0d1117] p-0 text-gray-100 sm:max-w-md"
      >
        <SheetHeader className="space-y-2 border-b border-white/10 px-5 pb-4 pt-5 text-left">
          <AIBadge />
          <SheetTitle className="text-lg font-semibold text-white">{lbl(TXT.title)}</SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed text-gray-400">{lbl(TXT.desc)}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 ring-1 ring-violet-400/25">
                <Sparkles className="h-4 w-4 text-violet-300" aria-hidden />
              </span>
              {lbl(TXT.empty, 'max-w-[260px] text-[13px] text-gray-400')}
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <section key={g.round.id}>
                  <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    {lbl(g.round.label)}
                    <span className="rounded-full bg-white/5 px-1.5 text-[12px] font-medium normal-case tracking-normal text-gray-400">
                      {g.items.length}
                    </span>
                  </h3>
                  <ul className="space-y-2">
                    {g.items.map((s, i) => {
                      const k = KIND[s.kind] ?? KIND.gap
                      return (
                        <li
                          key={`${s.id}-${i}`}
                          className={cn('os-rise flex items-start gap-2.5 rounded-lg border px-3 py-2.5', k.chip)}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <k.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', k.dot)} aria-hidden />
                          <div className="min-w-0">
                            {lbl(TXT[s.kind] ?? TXT.gap, 'block text-[12px] font-semibold uppercase tracking-wide opacity-70')}
                            {lbl(s.text, 'block text-[13px] leading-snug')}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
