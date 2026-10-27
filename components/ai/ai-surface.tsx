'use client'

import { isValidElement, type ReactNode, type Ref } from 'react'
import { Zap } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { AIBadge } from '@/components/ai/ai-badge'

type TextLike = ReactNode | Bi

export interface AISurfaceProps {
  title?: TextLike
  /** Right-aligned meta, e.g. 'Generated in 0.8s'. Pass false to hide. */
  meta?: TextLike | false
  children?: ReactNode
  className?: string
  tone?: 'default' | 'violet'
  /** Optional (additive): extra controls on the right of the header (e.g. a language toggle). */
  actions?: ReactNode
  /** Optional (additive): classes for the body wrapper. */
  bodyClassName?: string
  /** Optional (additive, React 19 ref-as-prop): e.g. a printOnly() target. */
  ref?: Ref<HTMLElement>
}

const SURFACE_CSS = `
@keyframes psai-surface-sweep { 0% { transform: translateX(-120%) skewX(-18deg); opacity: 0 } 15% { opacity: 1 } 100% { transform: translateX(260%) skewX(-18deg); opacity: 0 } }
.psai-surface-sweep { animation: psai-surface-sweep 1.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s 1 both }
@media (prefers-reduced-motion: reduce) { .psai-surface-sweep { display: none } }
.os-lite .psai-surface-sweep { display: none }
@media print {
  .psai-surface :is(.text-white, .text-gray-50, .text-gray-100, .text-gray-200, .text-gray-300, .text-slate-200, .text-slate-300) { color: #111827 !important }
  .psai-surface :is(.text-gray-400, .text-gray-500, .text-slate-400, .text-slate-500) { color: #4b5563 !important }
  .psai-surface .psai-deco { display: none !important }
}
`

const DEFAULT_META: Bi = { en: 'Generated in 0.8s', hi: '0.8 सेकंड में तैयार' }

function isBi(x: unknown): x is Bi {
  return !!x && typeof x === 'object' && !isValidElement(x) && !Array.isArray(x) && typeof (x as Bi).en === 'string'
}

function useText() {
  const { t } = useDemo()
  return (node: TextLike | undefined, className?: string): ReactNode => {
    if (node === undefined || node === null || node === false) return null
    if (typeof node === 'string' || isBi(node)) {
      const s = typeof node === 'string' ? node : t(node)
      const deva = isDevanagari(s)
      return (
        <span lang={deva ? 'hi' : undefined} className={cn(className, deva && 'font-deva')}>
          {s}
        </span>
      )
    }
    return node as ReactNode
  }
}

/**
 * Wrapper for anything AI-generated: 1px gradient border, a soft top glow, and a header row
 * (Sarthi AI badge + title + meta). Plays a one-time light sweep on mount.
 */
export function AISurface({
  title,
  meta = DEFAULT_META,
  children,
  className,
  tone = 'default',
  actions,
  bodyClassName,
  ref,
}: AISurfaceProps) {
  const text = useText()
  const reduced = useReducedMotion()
  const violet = tone === 'violet'

  return (
    <section
      ref={ref}
      className={cn(
        'psai-surface relative rounded-2xl p-px',
        violet
          ? 'bg-[linear-gradient(135deg,rgba(167,139,250,0.65),rgba(232,121,249,0.28)_35%,rgba(255,255,255,0.07)_62%,rgba(129,140,248,0.5))]'
          : 'bg-[linear-gradient(135deg,rgba(96,165,250,0.6),rgba(34,211,238,0.3)_35%,rgba(255,255,255,0.07)_62%,rgba(52,211,153,0.5))]',
        'shadow-[0_20px_50px_-30px_rgba(34,211,238,0.35)]',
        'print:bg-none print:shadow-none',
        className,
      )}
    >
      <style href="psai-surface" precedence="default">
        {SURFACE_CSS}
      </style>
      <div className="relative overflow-hidden rounded-[15px] bg-[#0d1117] print:border print:border-gray-300 print:bg-white">
        {/* inner tint + glow */}
        <div aria-hidden className="psai-deco pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent" />
        <div
          aria-hidden
          className={cn(
            'psai-deco pointer-events-none absolute -top-20 left-[12%] h-36 w-[70%] rounded-full blur-3xl',
            violet ? 'bg-violet-500/[0.14]' : 'bg-cyan-400/[0.10]',
          )}
        />
        {!reduced && (
          <div aria-hidden className="psai-deco pointer-events-none absolute inset-y-0 left-0 w-1/3 overflow-visible">
            <div className="psai-surface-sweep h-full w-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          </div>
        )}

        <header className="relative flex min-h-[48px] flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <AIBadge />
          {title !== undefined && title !== null && (
            <h3 className="min-w-[9rem] flex-1 text-[14px] font-semibold leading-snug text-white print:text-gray-900">
              {text(title)}
            </h3>
          )}
          {(title === undefined || title === null) && <span className="flex-1" />}
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          {meta !== false && meta !== undefined && meta !== null && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[12px] text-gray-500">
              <Zap aria-hidden className={cn('h-3 w-3', violet ? 'text-violet-300/80' : 'text-cyan-300/80')} />
              {text(meta)}
            </span>
          )}
        </header>

        <div
          className={cn(
            'relative px-4 py-4 text-[14px] leading-relaxed text-gray-200 sm:px-5 print:text-gray-900',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
