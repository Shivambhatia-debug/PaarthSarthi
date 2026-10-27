'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Lock, Wand2 } from 'lucide-react'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { hintText, type CodeLang, type Hint } from '@/components/placement/technical/problems'

export type ApplyState = 'idle' | 'typing' | 'applied'

const T = {
  title: { en: 'Hint ladder', hi: 'संकेत सीढ़ी', hinglish: 'Hint ladder' },
  sub: {
    en: 'Each rung costs points. Take only what you need.',
    hi: 'हर सीढ़ी के अंक कटते हैं। ज़रूरत भर ही लें।',
    hinglish: 'Har rung ke points katte hain. Zaroorat bhar hi lo.',
  },
  unlock: { en: 'Unlock', hi: 'खोलें', hinglish: 'Unlock' },
  lockedPrev: { en: 'Unlock the previous rung first', hi: 'पहले पिछली सीढ़ी खोलें', hinglish: 'Pehle pichhla rung kholo' },
  apply: { en: 'Apply fix', hi: 'सुधार लागू करें', hinglish: 'Apply fix' },
  applying: { en: 'Typing the two-pointer fix…', hi: 'टू-पॉइंटर सुधार टाइप हो रहा है…', hinglish: 'Two-pointer fix type ho raha hai…' },
  applied: { en: 'Fix applied · Submit again', hi: 'सुधार लागू · फिर सबमिट करें', hinglish: 'Fix applied · phir Submit karo' },
  applyNote: {
    en: 'Sarthi types the fix into your editor so you can read every line before you submit.',
    hi: 'सारथी सुधार आपके एडिटर में टाइप करता है, ताकि सबमिट से पहले आप हर पंक्ति पढ़ सकें।',
    hinglish: 'Sarthi fix aapke editor mein type karta hai, taaki submit se pehle aap har line padh sako.',
  },
  penalty: { en: 'Penalty so far', hi: 'अब तक कटौती', hinglish: 'Penalty ab tak' },
} satisfies Record<string, Bi>

export interface HintLadderProps {
  hints: Hint[]
  codeLang: CodeLang
  /** Number of rungs unlocked (0–3). Rungs unlock in order. */
  unlocked: number
  onUnlock: (level: number) => void
  onApplyFix?: () => void
  applyState: ApplyState
  /** Show 'Apply fix' (the problem has a scripted fix). */
  canApply: boolean
  /** Disable buttons while a sequence is playing. */
  locked?: boolean
  /** Fast-forward: show everything without streaming. */
  instant?: boolean
  className?: string
}

/** Nudge (−5) → Approach (−10) → Pseudo-code (−20). Each unlocked rung streams in an AISurface. */
export function HintLadder({
  hints,
  codeLang,
  unlocked,
  onUnlock,
  onApplyFix,
  applyState,
  canApply,
  locked = false,
  instant = false,
  className,
}: HintLadderProps) {
  const [streamed, setStreamed] = useState<Record<number, boolean>>({})
  const penalty = hints.slice(0, unlocked).reduce((s, h) => s + h.penalty, 0)

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Tr b={T.title} as="h3" className="block text-[14px] font-semibold text-white" />
          <Tr b={T.sub} as="p" className="block text-[12.5px] text-gray-400" />
        </div>
        {unlocked > 0 && (
          <span className="shrink-0 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-[12px] font-medium tabular-nums text-violet-200">
            <Tr b={T.penalty} /> −{penalty}
          </span>
        )}
      </div>

      <ol className="space-y-2">
        {hints.map((h, i) => {
          const isOpen = i < unlocked
          const isNext = i === unlocked
          if (isOpen) {
            const showCode = !!h.code && (instant || streamed[h.level])
            return (
              <li key={h.level}>
                <AISurface
                  tone="violet"
                  title={
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/20 text-[12px] font-semibold text-violet-200">
                        {h.level}
                      </span>
                      <Tr b={h.label} />
                      <span className="text-[12px] font-medium text-violet-300/80">−{h.penalty}</span>
                    </span>
                  }
                  meta={false}
                  bodyClassName="space-y-2"
                >
                  <StreamingText
                    text={hintText(h, codeLang)}
                    instant={instant || !!streamed[h.level]}
                    className="text-[13.5px] leading-relaxed text-gray-200"
                    onDone={() => setStreamed((s) => (s[h.level] ? s : { ...s, [h.level]: true }))}
                  />
                  {showCode && (
                    <pre className="overflow-x-auto rounded-lg border border-white/[0.08] bg-black/30 p-3 font-mono text-[12.5px] leading-6 text-cyan-100 motion-safe:animate-[tile-pop_260ms_ease-out_both]">
                      {h.code}
                    </pre>
                  )}
                </AISurface>
              </li>
            )
          }
          return (
            <li key={h.level}>
              <button
                type="button"
                disabled={!isNext || locked}
                onClick={() => onUnlock(h.level)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                  isNext && !locked
                    ? 'border-violet-400/30 bg-violet-500/[0.06] hover:border-violet-300/50 hover:bg-violet-500/[0.1]'
                    : 'cursor-not-allowed border-white/[0.07] bg-white/[0.02] opacity-60',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold',
                    isNext ? 'border-violet-400/40 text-violet-200' : 'border-white/10 text-gray-500',
                  )}
                >
                  {isNext ? h.level : <Lock className="h-3.5 w-3.5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-gray-100">
                    <Tr b={h.label} />
                  </span>
                  <span className="block text-[12px] text-gray-500">
                    {isNext ? (
                      <>
                        <Tr b={T.unlock} /> · −{h.penalty}
                      </>
                    ) : (
                      <Tr b={T.lockedPrev} />
                    )}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold tabular-nums',
                    isNext ? 'bg-violet-400/15 text-violet-200 group-hover:bg-violet-400/25' : 'text-gray-600',
                  )}
                >
                  −{h.penalty}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {canApply && unlocked > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <button
            type="button"
            onClick={onApplyFix}
            disabled={locked || applyState !== 'idle'}
            className={cn(
              'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13.5px] font-semibold transition-[filter,opacity]',
              applyState === 'applied'
                ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-[#06121a] shadow-[0_10px_30px_-12px_rgba(34,211,238,0.7)] hover:brightness-110 disabled:opacity-60',
            )}
          >
            {applyState === 'typing' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : applyState === 'applied' ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            ) : (
              <Wand2 className="h-4 w-4" aria-hidden />
            )}
            <Tr b={applyState === 'typing' ? T.applying : applyState === 'applied' ? T.applied : T.apply} />
          </button>
          {applyState === 'idle' && <Tr b={T.applyNote} as="p" className="mt-2 block text-[12px] leading-snug text-gray-500" />}
        </div>
      )}
    </div>
  )
}
