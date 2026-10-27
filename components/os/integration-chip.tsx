'use client'

import { Clock3, Plug } from 'lucide-react'
import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export type IntegrationStatus = 'Integration-ready' | 'Planned'

const STATUS_LABEL: Record<IntegrationStatus, Bi> = {
  'Integration-ready': { en: 'Integration-ready', hi: 'इंटीग्रेशन-तैयार' },
  Planned: { en: 'Planned', hi: 'प्रस्तावित' },
}

export interface IntegrationChipProps {
  name: Bi | string
  status: IntegrationStatus
  className?: string
}

/** Integration status chip. Never green, never 'Live'. */
export function IntegrationChip({ name, status, className }: IntegrationChipProps) {
  const lang = useLang()
  const ready = status === 'Integration-ready'
  const n = tr(name, lang)
  const s = tr(STATUS_LABEL[status] ?? STATUS_LABEL.Planned, lang)
  const Icon = ready ? Plug : Clock3
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] leading-none',
        ready
          ? 'border-sky-400/30 bg-sky-400/[0.06] text-sky-200'
          : 'border-dashed border-slate-500/40 bg-white/[0.02] text-slate-300',
        className,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5 shrink-0', ready ? 'text-sky-300' : 'text-slate-400')} aria-hidden />
      <span lang={isDevanagari(n) ? 'hi' : 'en'} className={cn('truncate font-medium', isDevanagari(n) && 'font-deva')}>
        {n}
      </span>
      <span
        lang={isDevanagari(s) ? 'hi' : 'en'}
        className={cn(
          'shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-semibold',
          ready ? 'bg-sky-400/15 text-sky-300' : 'bg-slate-500/15 text-slate-400',
          isDevanagari(s) && 'font-deva',
        )}
      >
        {s}
      </span>
    </span>
  )
}
