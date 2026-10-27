'use client'

import { Check, Loader2 } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { useAgentSteps, useReducedMotion } from '@/lib/ai-sim'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export interface AgentLogProps {
  steps: ReadonlyArray<string | Bi>
  stepMs?: number
  onDone?: () => void
  title?: string | Bi
  className?: string
  /** Optional (additive): hold the log until true. Default true. */
  start?: boolean
}

const DEFAULT_TITLE: Bi = { en: 'Sarthi AI agent', hi: 'सारथी AI एजेंट' }
const DONE: Bi = { en: 'Done', hi: 'पूर्ण' }

const LOG_CSS = `
@keyframes psai-log-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
@keyframes psai-log-text { 0% { background-position: 200% 0 } 100% { background-position: -100% 0 } }
.psai-log-in { animation: psai-log-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both }
.psai-log-live {
  background-image: linear-gradient(90deg, #c4b5fd 0%, #ede9fe 45%, #c4b5fd 60%, #a78bfa 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: psai-log-text 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .psai-log-in, .psai-log-live { animation: none } }
.os-lite .psai-log-in, .os-lite .psai-log-live { animation: none }
`

/**
 * Agentic "thinking out loud" log (AI grammar step 1). One line every ~420 ms:
 * the current line spins violet, finished lines get an emerald check.
 * Completes instantly on the presenter's 'fastforward' and 'finish' events.
 */
export function AgentLog({ steps, stepMs = 420, onDone, title, className, start = true }: AgentLogProps) {
  const { t, state } = useDemo()
  const reduced = useReducedMotion() || !!state.lite
  const list: ReadonlyArray<string | Bi> = Array.isArray(steps) ? steps : []
  const count = list.length
  const { current, done, finish } = useAgentSteps(list, { stepMs, start, onDone })
  useDemoEvent('fastforward', finish)
  useDemoEvent('finish', finish)

  const visible = !start ? 0 : done ? count : Math.min(count, current + 1)
  const progress = count === 0 ? (done ? 1 : 0) : Math.min(1, (done ? count : current) / count)
  const titleText = t(title ?? DEFAULT_TITLE)
  const totalSec = ((count * stepMs) / 1000).toFixed(1)

  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={!done}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-b p-3.5 sm:p-4',
        done
          ? 'border-white/10 from-white/[0.03] to-white/[0.015]'
          : 'border-violet-400/20 from-violet-500/[0.07] to-violet-500/[0.02]',
        'transition-colors duration-500',
        className,
      )}
    >
      <style href="psai-agent-log" precedence="default">
        {LOG_CSS}
      </style>

      <div className="mb-2.5 flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
            done ? 'bg-emerald-500/15' : 'bg-violet-500/15',
          )}
        >
          {done ? (
            <Check className="h-3 w-3 text-emerald-300" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_8px_2px_rgba(167,139,250,0.7)]" />
          )}
        </span>
        <span
          lang={isDevanagari(titleText) ? 'hi' : undefined}
          className={cn('min-w-0 flex-1 truncate text-[12.5px] font-semibold tracking-wide text-gray-200', isDevanagari(titleText) && 'font-deva')}
        >
          {titleText}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-gray-500">
          {done ? `${t(DONE)} · ${totalSec}s` : `${visible}/${count}`}
        </span>
      </div>

      <ol className="space-y-1.5">
        {list.slice(0, visible).map((step, i) => {
          const text = t(step)
          const deva = isDevanagari(text)
          const finished = done || i < current
          return (
            <li key={`${i}-${typeof step === 'string' ? step : step.en}`} className="psai-log-in flex items-start gap-2.5">
              <span aria-hidden className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center">
                {finished ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                ) : (
                  <Loader2 className={cn('h-3.5 w-3.5 text-violet-300', !reduced && 'animate-spin')} />
                )}
              </span>
              <span
                lang={deva ? 'hi' : undefined}
                className={cn(
                  'min-w-0 flex-1 text-[13px] leading-[1.45]',
                  deva && 'font-deva',
                  finished ? 'text-gray-300' : 'psai-log-live font-medium',
                )}
              >
                {text}
              </span>
              {finished && (
                <span aria-hidden className="mt-[2px] shrink-0 font-mono text-[12px] tabular-nums text-gray-600">
                  {((stepMs * (0.8 + ((i * 7) % 5) * 0.1)) / 1000).toFixed(2)}s
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.04]">
        <div
          className={cn(
            'h-full bg-gradient-to-r transition-[width] ease-linear',
            done ? 'from-cyan-400 to-emerald-400' : 'from-violet-500 via-fuchsia-400 to-cyan-300',
          )}
          style={{ width: `${progress * 100}%`, transitionDuration: `${done ? 250 : stepMs}ms` }}
        />
      </div>
    </div>
  )
}
