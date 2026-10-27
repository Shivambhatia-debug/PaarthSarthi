'use client'

import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { useTypewriter } from '@/lib/ai-sim'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export interface StreamingTextProps {
  /** A string, or a Bi resolved with the effective (officer-aware) language. */
  text: string | Bi
  cps?: number
  startDelay?: number
  onDone?: () => void
  caret?: boolean
  instant?: boolean
  className?: string
  as?: 'p' | 'span' | 'div'
  lang?: string
  /** Optional (additive): reserve the final layout while streaming so cards never jump. Default true. */
  reserve?: boolean
}

const STREAM_CSS = `
@keyframes psai-caret { 0%, 45% { opacity: 1 } 55%, 100% { opacity: 0.15 } }
.psai-caret { animation: psai-caret 0.9s steps(1, end) infinite }
@media (prefers-reduced-motion: reduce) { .psai-caret { animation: none } }
.os-lite .psai-caret { animation: none }
`

/**
 * Streams text at ~45 cps (AI grammar step 2). Click to finish. Completes on the presenter's
 * 'fastforward' and 'finish' events. Instant in Lite mode. Devanagari text gets lang="hi" + font-deva.
 */
export function StreamingText({
  text,
  cps,
  startDelay,
  onDone,
  caret = true,
  instant,
  className,
  as = 'p',
  lang,
  reserve = true,
}: StreamingTextProps) {
  const { state, t } = useDemo()
  const str = typeof text === 'string' ? text : text == null ? '' : t(text)
  const { output, done, finish } = useTypewriter(str, {
    cps,
    startDelay,
    enabled: !(instant || state.lite),
    onDone,
  })
  useDemoEvent('fastforward', finish)
  useDemoEvent('finish', finish)

  const deva = isDevanagari(str)
  const rest = done ? '' : str.slice(output.length)
  const Tag = as

  return (
    <Tag
      lang={lang ?? (deva ? 'hi' : 'en')}
      className={cn('whitespace-pre-line break-words', deva && 'font-deva', !done && 'cursor-pointer', className)}
      onClick={done ? undefined : finish}
      aria-busy={!done || undefined}
      title={done ? undefined : 'Click to show the full text'}
    >
      <style href="psai-stream" precedence="default">
        {STREAM_CSS}
      </style>
      {output}
      {!done && caret && (
        <span
          aria-hidden
          className="psai-caret -mr-[3px] ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.16em] rounded-full bg-gradient-to-b from-cyan-300 to-emerald-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
        />
      )}
      {!done && reserve && rest && (
        <span aria-hidden className="pointer-events-none select-none opacity-0">
          {rest}
        </span>
      )}
    </Tag>
  )
}
