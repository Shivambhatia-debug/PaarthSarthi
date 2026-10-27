'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, GitCompareArrows, Info, Loader2, Wand2 } from 'lucide-react'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import type { CodeClass, CodeLang } from '@/components/placement/technical/problems'
import type { ApplyState } from '@/components/placement/technical/hint-ladder'

type Tone = 'warn' | 'ok' | 'info'
interface ReviewLine {
  id: string
  tone: Tone
  text: Bi
}

const OK_SPACE: ReviewLine = { id: 'space', tone: 'ok', text: { en: 'Space: O(1) ✓.', hi: 'स्पेस: O(1) ✓।', hinglish: 'Space: O(1) ✓.' } }

function reviewLines(cls: CodeClass, lang: CodeLang): ReviewLine[] {
  switch (cls) {
    case 'brute':
      return [
        {
          id: 'time',
          tone: 'warn',
          text:
            lang === 'python'
              ? {
                  en: 'Time: O(n²) — list.remove() shifts elements each call; expected O(n).',
                  hi: 'समय: O(n²) — list.remove() हर बार तत्वों को खिसकाता है; अपेक्षित O(n)।',
                  hinglish: 'Time: O(n²) — list.remove() har call par elements shift karta hai; expected O(n).',
                }
              : {
                  en: 'Time: O(n²) — the inner loop shifts the array once per zero; expected O(n).',
                  hi: 'समय: O(n²) — अंदर का लूप हर शून्य पर पूरी array खिसकाता है; अपेक्षित O(n)।',
                  hinglish: 'Time: O(n²) — inner loop har zero par array shift karta hai; expected O(n).',
                },
        },
        OK_SPACE,
        {
          id: 'edge',
          tone: 'warn',
          text: {
            en: 'Edge cases missed: all zeros, n = 10^5.',
            hi: 'छूटे एज केस: सभी शून्य, n = 10^5।',
            hinglish: 'Edge cases missed: all zeros, n = 10^5.',
          },
        },
        { id: 'read', tone: 'info', text: { en: 'Readability 7/10.', hi: 'पठनीयता 7/10।', hinglish: 'Readability 7/10.' } },
      ]
    case 'optimal':
      return [
        {
          id: 'time',
          tone: 'ok',
          text: {
            en: 'Time: O(n) ✓ — one pass with a write pointer.',
            hi: 'समय: O(n) ✓ — write pointer के साथ एक ही पास।',
            hinglish: 'Time: O(n) ✓ — write pointer ke saath ek hi pass.',
          },
        },
        OK_SPACE,
        {
          id: 'edge',
          tone: 'ok',
          text: { en: 'Edge cases: all zeros and n = 10^5 pass ✓.', hi: 'एज केस: सभी शून्य और n = 10^5 पास ✓।', hinglish: 'Edge cases: all zeros aur n = 10^5 pass ✓.' },
        },
        { id: 'read', tone: 'info', text: { en: 'Readability 8/10.', hi: 'पठनीयता 8/10।', hinglish: 'Readability 8/10.' } },
      ]
    case 'empty':
      return [
        {
          id: 'empty',
          tone: 'warn',
          text: {
            en: 'The function does not build the answer yet, so the hidden tests fail.',
            hi: 'फ़ंक्शन अभी उत्तर नहीं बनाता, इसलिए छिपे टेस्ट फ़ेल होते हैं।',
            hinglish: 'Function abhi answer nahi banata, isliye hidden tests fail ho rahe hain.',
          },
        },
        {
          id: 'next',
          tone: 'info',
          text: {
            en: 'Try the Nudge on the hint ladder: it costs only 5 points.',
            hi: 'संकेत सीढ़ी का पहला संकेत लें: सिर्फ़ 5 अंक कटते हैं।',
            hinglish: 'Hint ladder ka Nudge lo: sirf 5 points katte hain.',
          },
        },
      ]
    case 'other':
    default:
      return [
        {
          id: 'correct',
          tone: 'warn',
          text: {
            en: 'Correctness: 4 of 10 hidden tests give a wrong answer.',
            hi: 'सटीकता: 10 में से 4 छिपे टेस्ट गलत उत्तर देते हैं।',
            hinglish: 'Correctness: 10 mein se 4 hidden tests galat answer dete hain.',
          },
        },
        OK_SPACE,
        {
          id: 'edge',
          tone: 'warn',
          text: {
            en: 'Edge cases missed: all zeros, a single element, zeros already at the end.',
            hi: 'छूटे एज केस: सभी शून्य, एक ही तत्व, पहले से अंत में शून्य।',
            hinglish: 'Edge cases missed: all zeros, single element, zeros pehle se end mein.',
          },
        },
        { id: 'read', tone: 'info', text: { en: 'Readability 6/10.', hi: 'पठनीयता 6/10।', hinglish: 'Readability 6/10.' } },
      ]
  }
}

const FINAL: Bi = { en: 'Now O(n) time, O(1) space ✓', hi: 'अब O(n) समय, O(1) स्पेस ✓', hinglish: 'Ab O(n) time, O(1) space ✓' }

const T = {
  title: { en: 'Sarthi AI code review', hi: 'सारथी AI कोड रिव्यू', hinglish: 'Sarthi AI code review' },
  diff: { en: 'Suggested change · brute force → two-pointer', hi: 'सुझाया बदलाव · brute force → टू-पॉइंटर', hinglish: 'Suggested change · brute force → two-pointer' },
  apply: { en: 'Apply fix', hi: 'सुधार लागू करें', hinglish: 'Apply fix' },
  applied: { en: 'Applied', hi: 'लागू', hinglish: 'Applied' },
  unchanged: { en: 'unchanged lines', hi: 'अपरिवर्तित पंक्तियाँ', hinglish: 'unchanged lines' },
} satisfies Record<string, Bi>

// -----------------------------------------------------------------------------
// Line diff (LCS) with collapsed context
// -----------------------------------------------------------------------------

type DiffRow = { kind: ' ' | '-' | '+'; text: string } | { kind: 'gap'; count: number }

function lineDiff(before: string, after: string, ctx = 1): DiffRow[] {
  const a = before.replace(/\s+$/, '').split('\n')
  const b = after.replace(/\s+$/, '').split('\n')
  const n = a.length
  const m = b.length
  if (n * m > 40000) return [...a.map((t) => ({ kind: '-' as const, text: t })), ...b.map((t) => ({ kind: '+' as const, text: t }))]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops: { kind: ' ' | '-' | '+'; text: string }[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: ' ', text: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: '-', text: a[i++] })
    } else {
      ops.push({ kind: '+', text: b[j++] })
    }
  }
  while (i < n) ops.push({ kind: '-', text: a[i++] })
  while (j < m) ops.push({ kind: '+', text: b[j++] })

  // Keep changed lines plus `ctx` lines of context; collapse the rest.
  const keep = ops.map(() => false)
  ops.forEach((o, k) => {
    if (o.kind === ' ') return
    for (let d = -ctx; d <= ctx; d++) if (k + d >= 0 && k + d < ops.length) keep[k + d] = true
  })
  const rows: DiffRow[] = []
  let gap = 0
  ops.forEach((o, k) => {
    if (keep[k]) {
      if (gap) rows.push({ kind: 'gap', count: gap })
      gap = 0
      rows.push(o)
    } else gap++
  })
  if (gap) rows.push({ kind: 'gap', count: gap })
  return rows
}

function ToneIcon({ tone }: { tone: Tone }) {
  if (tone === 'ok') return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
  if (tone === 'warn') return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
}

export interface CodeReviewProps {
  /** Grader class of the code that was reviewed (first submit). */
  cls: CodeClass
  codeLang: CodeLang
  /** The reviewed code (left side of the diff). */
  before: string
  /** The two-pointer solution (right side of the diff); null hides the diff. */
  after: string | null
  /** 10/10 reached: stream the closing line. */
  fixed: boolean
  instant?: boolean
  /** Called once when the review lines and the diff are on screen. */
  onStreamDone?: () => void
  onApplyFix?: () => void
  applyState?: ApplyState
  locked?: boolean
  className?: string
}

/** Streams the AI review line by line, then a −/+ line diff (brute → two-pointer). */
export function CodeReview({
  cls,
  codeLang,
  before,
  after,
  fixed,
  instant = false,
  onStreamDone,
  onApplyFix,
  applyState = 'idle',
  locked = false,
  className,
}: CodeReviewProps) {
  const lines = useMemo(() => reviewLines(cls, codeLang), [cls, codeLang])
  const [step, setStep] = useState(0)
  const allDone = instant || step >= lines.length
  const showDiff = allDone && !!after && cls !== 'optimal'
  const rows = useMemo(() => (showDiff && after ? lineDiff(before, after) : []), [showDiff, before, after])

  const doneRef = useRef(false)
  const cbRef = useRef(onStreamDone)
  cbRef.current = onStreamDone
  useEffect(() => {
    if (allDone && !doneRef.current) {
      doneRef.current = true
      cbRef.current?.()
    }
  }, [allDone])

  return (
    <AISurface title={<Tr b={T.title} />} className={className} bodyClassName="space-y-3">
      <ul className="space-y-2">
        {lines.map((l, i) =>
          instant || i <= step ? (
            <li key={l.id} className="flex items-start gap-2">
              <ToneIcon tone={l.tone} />
              <StreamingText
                text={l.text}
                instant={instant || i < step}
                caret={i === step && !allDone}
                className={cn(
                  'min-w-0 flex-1 text-[13.5px] leading-relaxed',
                  l.tone === 'warn' ? 'text-amber-100' : l.tone === 'ok' ? 'text-emerald-100' : 'text-gray-200',
                )}
                onDone={() => setStep((s) => (s === i ? i + 1 : s))}
              />
            </li>
          ) : null,
        )}
      </ul>

      {showDiff && (
        <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0e14] motion-safe:animate-[tile-pop_280ms_ease-out_both]">
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
            <GitCompareArrows className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
            <Tr b={T.diff} className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-gray-300" />
            {onApplyFix && (
              <button
                type="button"
                onClick={onApplyFix}
                disabled={locked || applyState !== 'idle'}
                className={cn(
                  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors',
                  applyState === 'applied'
                    ? 'bg-emerald-400/10 text-emerald-300'
                    : 'bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25 disabled:opacity-50',
                )}
              >
                {applyState === 'typing' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : applyState === 'applied' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" aria-hidden />
                )}
                <Tr b={applyState === 'applied' ? T.applied : T.apply} />
              </button>
            )}
          </div>
          <div className="overflow-x-auto py-1.5">
            <pre className="min-w-max font-mono text-[12px] leading-[1.6]">
              {rows.map((r, k) =>
                r.kind === 'gap' ? (
                  <div key={k} className="select-none px-3 py-0.5 text-gray-600">
                    ⋯ {r.count} <Tr b={T.unchanged} />
                  </div>
                ) : (
                  <div
                    key={k}
                    className={cn(
                      'flex px-3',
                      r.kind === '-' && 'bg-rose-500/[0.12] text-rose-200',
                      r.kind === '+' && 'bg-emerald-500/[0.12] text-emerald-200',
                      r.kind === ' ' && 'text-gray-400',
                    )}
                  >
                    <span className={cn('w-4 shrink-0 select-none', r.kind === '-' ? 'text-rose-400' : r.kind === '+' ? 'text-emerald-400' : 'text-gray-600')}>
                      {r.kind === ' ' ? ' ' : r.kind === '-' ? '−' : '+'}
                    </span>
                    <span className="whitespace-pre">{r.text || ' '}</span>
                  </div>
                ),
              )}
            </pre>
          </div>
        </div>
      )}

      {fixed && cls !== 'optimal' && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
          <StreamingText text={FINAL} instant={instant} className="text-[13.5px] font-semibold text-emerald-100" />
        </div>
      )}
    </AISurface>
  )
}
