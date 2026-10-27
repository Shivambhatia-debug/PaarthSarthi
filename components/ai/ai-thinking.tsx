'use client'

import { useDemo } from '@/lib/os/demo-store'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { AIOrb } from '@/components/ai/ai-orb'

export interface AIThinkingProps {
  label?: string | Bi
  lines?: number
  /** Optional (additive). */
  className?: string
}

const THINK_CSS = `
@keyframes psai-think-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
.psai-think-bar {
  background-image: linear-gradient(90deg, rgba(139,92,246,0.10) 0%, rgba(167,139,250,0.30) 22%, rgba(196,181,253,0.18) 34%, rgba(139,92,246,0.10) 50%, rgba(139,92,246,0.10) 100%);
  background-size: 200% 100%;
  animation: psai-think-shimmer 1.6s linear infinite;
}
.psai-think-text {
  background-image: linear-gradient(90deg, #a78bfa 0%, #ede9fe 40%, #a78bfa 60%, #a78bfa 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: psai-think-shimmer 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .psai-think-bar, .psai-think-text { animation: none } }
.os-lite .psai-think-bar, .os-lite .psai-think-text { animation: none }
`

const WIDTHS = ['100%', '91%', '76%', '86%', '62%', '94%', '70%']

const DEFAULT_LABEL: Bi = { en: 'Sarthi AI is thinking…', hi: 'सारथी AI सोच रहा है…' }

/** Violet "Sarthi AI is thinking…" shimmer with skeleton lines (AI grammar step 1). */
export function AIThinking({ label = DEFAULT_LABEL, lines = 3, className }: AIThinkingProps) {
  const { t } = useDemo()
  const text = t(label)
  const deva = isDevanagari(text)
  const n = Math.max(0, Math.min(8, Math.floor(Number.isFinite(lines) ? lines : 3)))

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] via-violet-500/[0.03] to-transparent p-4',
        className,
      )}
    >
      <style href="psai-thinking" precedence="default">
        {THINK_CSS}
      </style>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl"
      />
      <div className="relative flex items-center gap-2.5">
        <AIOrb state="thinking" size={22} label="" className="shrink-0" />
        <span lang={deva ? 'hi' : 'en'} className={cn('psai-think-text text-[13.5px] font-semibold', deva && 'font-deva')}>
          {text}
        </span>
      </div>
      {n > 0 && (
        <div aria-hidden className="relative mt-3.5 space-y-2.5">
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              className="psai-think-bar h-2.5 rounded-full"
              style={{ width: WIDTHS[i % WIDTHS.length], animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
