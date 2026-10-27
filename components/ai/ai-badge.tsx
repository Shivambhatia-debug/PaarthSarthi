import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AIBadgeProps {
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * The "Sarthi AI" mark. PURE: no store, no toasts, no hooks, so it is safe on the
 * home page and inside server components.
 */
export function AIBadge({ label = 'Sarthi AI', size = 'sm', className }: AIBadgeProps) {
  const md = size === 'md'
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-px align-middle',
        'bg-gradient-to-r from-blue-500/80 via-cyan-400/70 to-emerald-400/80',
        'shadow-[0_0_14px_-4px_rgba(34,211,238,0.55)]',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-[#0b111c] font-semibold leading-none tracking-wide',
          md ? 'h-7 gap-1.5 px-3 text-[13px]' : 'h-6 gap-1 px-2.5 text-[12px]',
        )}
      >
        <Sparkles aria-hidden className={cn('shrink-0 text-cyan-300', md ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
        <span className="whitespace-nowrap bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
          {label}
        </span>
      </span>
    </span>
  )
}
