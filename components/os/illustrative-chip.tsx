'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { AlertTriangle, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { SIMULATED_RANKING_NOTE } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

const DEFAULT_LABEL: Bi = { en: 'Illustrative pilot data', hi: 'सांकेतिक पायलट डेटा' }
const TIP: Bi = {
  en: 'All numbers except those marked As reported are illustrative',
  hi: '"रिपोर्टेड" चिह्नित आँकड़ों को छोड़कर सभी संख्याएँ सांकेतिक हैं',
}

export interface IllustrativeChipProps {
  label?: Bi | string
  /** Icon only. */
  compact?: boolean
  /** Optional (additive): icon only below the sm breakpoint, full label from sm up. */
  responsive?: boolean
  className?: string
}

/** Amber outline chip: 'Illustrative pilot data', with an explanatory tooltip. */
export function IllustrativeChip({ label = DEFAULT_LABEL, compact, responsive, className }: IllustrativeChipProps) {
  const lang = useLang()
  const text = tr(label, lang)
  const tip = tr(TIP, lang)
  const deva = isDevanagari(text)
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={compact ? text : undefined}
            className={cn(
              'inline-flex h-7 shrink-0 cursor-help items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/[0.06] text-[12px] font-medium text-amber-300',
              'outline-none transition-colors hover:border-amber-300/70 hover:bg-amber-400/10 focus-visible:ring-2 focus-visible:ring-amber-300/60',
              compact ? 'w-7 justify-center' : responsive ? 'w-7 justify-center sm:w-auto sm:px-2.5' : 'px-2.5',
              className,
            )}
          >
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {!compact && (
              <span
                lang={deva ? 'hi' : 'en'}
                className={cn('whitespace-nowrap leading-none', deva && 'font-deva', responsive && 'hidden sm:inline')}
              >
                {text}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side="bottom"
            className="max-w-[260px] border-amber-400/30 bg-[#161b22] text-[12px] leading-snug text-gray-200"
          >
            <span lang={isDevanagari(tip) ? 'hi' : 'en'} className={cn(isDevanagari(tip) && 'font-deva')}>
              {tip}
            </span>
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  )
}

export interface SimulatedNoticeProps {
  text?: Bi
  className?: string
}

/** Amber banner strip. Defaults to 'Simulated ranking, not an assessment of any institution'. */
export function SimulatedNotice({ text = SIMULATED_RANKING_NOTE, className }: SimulatedNoticeProps) {
  const lang = useLang()
  const s = tr(text, lang)
  const deva = isDevanagari(s)
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-amber-400/25 bg-gradient-to-r from-amber-400/[0.09] via-amber-400/[0.05] to-transparent px-3 py-2 text-[12px] font-medium text-amber-200/90',
        className,
      )}
    >
      <AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
      <span lang={deva ? 'hi' : 'en'} className={cn('leading-snug', deva && 'font-deva')}>
        {s}
      </span>
    </div>
  )
}
