'use client'

import { CheckCircle2, Circle, Clock3, FlaskConical, Loader2, ShieldQuestion, Terminal, XCircle } from 'lucide-react'
import { AIThinking } from '@/components/ai/ai-thinking'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import type { HiddenResult, SampleResult, Verdict } from '@/components/placement/technical/problems'

export type ResultsView = 'sample' | 'hidden'

export interface SampleRunView {
  phase: 'compiling' | 'revealing' | 'done'
  results: SampleResult[]
  /** Rows whose verdict is visible. */
  shown: number
}

export interface HiddenRunView {
  phase: 'running' | 'done'
  results: HiddenResult[]
  /** Chips that have flipped. */
  shown: number
  attempt: number
}

const T = {
  sample: { en: 'Sample tests', hi: 'सैंपल टेस्ट', hinglish: 'Sample tests' },
  hidden: { en: 'Hidden tests', hi: 'छिपे टेस्ट', hinglish: 'Hidden tests' },
  idleSample: {
    en: 'Run your code against the sample tests. Ctrl+Enter also runs.',
    hi: 'अपना कोड सैंपल टेस्ट पर चलाएँ। Ctrl+Enter से भी चलता है।',
    hinglish: 'Apna code sample tests par run karo. Ctrl+Enter se bhi chalta hai.',
  },
  idleHidden: {
    en: 'Submit to run the hidden tests. Large inputs check your time complexity.',
    hi: 'छिपे टेस्ट चलाने के लिए सबमिट करें। बड़े इनपुट आपकी time complexity जाँचते हैं।',
    hinglish: 'Hidden tests ke liye Submit karo. Bade inputs time complexity check karte hain.',
  },
  practiceHidden: {
    en: 'Practice problem: hidden tests are graded on Q1 in this demo.',
    hi: 'अभ्यास प्रश्न: इस डेमो में छिपे टेस्ट Q1 पर ही होते हैं।',
    hinglish: 'Practice problem: is demo mein hidden tests Q1 par hi hote hain.',
  },
  compiling: { en: 'Compiling… Running 3 sample tests', hi: 'कंपाइल हो रहा है… 3 सैंपल टेस्ट चल रहे हैं', hinglish: 'Compile ho raha hai… 3 sample tests chal rahe hain' },
  running: { en: 'Running 10 hidden tests…', hi: '10 छिपे टेस्ट चल रहे हैं…', hinglish: '10 hidden tests chal rahe hain…' },
  input: { en: 'Input', hi: 'इनपुट', hinglish: 'Input' },
  expected: { en: 'Expected', hi: 'अपेक्षित', hinglish: 'Expected' },
  stdout: { en: 'Your output', hi: 'आपका आउटपुट', hinglish: 'Your output' },
  passed: { en: 'passed', hi: 'पास', hinglish: 'passed' },
  attempt: { en: 'Attempt', hi: 'प्रयास', hinglish: 'Attempt' },
  sandbox: {
    en: 'Simulated sandbox: verdicts come from a pattern grader; no code is executed.',
    hi: 'सिम्युलेटेड सैंडबॉक्स: नतीजे पैटर्न ग्रेडर से आते हैं; कोई कोड नहीं चलता।',
    hinglish: 'Simulated sandbox: verdicts pattern grader se aate hain; koi code execute nahi hota.',
  },
} satisfies Record<string, Bi>

const VERDICT_LABEL: Record<Verdict, string> = {
  pass: 'Passed',
  tle: 'TLE (> 1.0s)',
  wa: 'Wrong answer',
  re: 'Runtime error',
}
const VERDICT_SHORT: Record<Verdict, string> = { pass: 'AC', tle: 'TLE', wa: 'WA', re: 'RE' }

const VERDICT_CHIP: Record<Verdict, string> = {
  pass: 'border-emerald-400/35 bg-emerald-400/[0.12] text-emerald-200',
  tle: 'border-amber-400/40 bg-amber-400/[0.12] text-amber-200',
  wa: 'border-rose-400/40 bg-rose-400/[0.12] text-rose-200',
  re: 'border-rose-400/40 bg-rose-400/[0.12] text-rose-200',
}

function VerdictIcon({ v, className }: { v: Verdict; className?: string }) {
  if (v === 'pass') return <CheckCircle2 className={cn('text-emerald-400', className)} aria-hidden />
  if (v === 'tle') return <Clock3 className={cn('text-amber-300', className)} aria-hidden />
  return <XCircle className={cn('text-rose-400', className)} aria-hidden />
}

function oneLine(s: string): string {
  return s.replace(/\n/g, ' / ')
}

export interface TestResultsProps {
  view: ResultsView
  onViewChange: (v: ResultsView) => void
  sample: SampleRunView | null
  hidden: HiddenRunView | null
  /** False for practice problems (no hidden suite in the demo). */
  scripted: boolean
  hiddenCount: number
  className?: string
}

/** Bottom-right pane: sample run (3 rows) and hidden suite (10 chips that flip every 120 ms). */
export function TestResults({ view, onViewChange, sample, hidden, scripted, hiddenCount, className }: TestResultsProps) {
  const samplePassed = sample ? sample.results.filter((r, i) => i < sample.shown && r.verdict === 'pass').length : 0
  const sampleTotal = sample?.results.length ?? 0
  const hiddenPassed = hidden ? hidden.results.filter((r, i) => i < hidden.shown && r.verdict === 'pass').length : 0
  const hiddenTotal = hidden?.results.length ?? hiddenCount
  const tleIds = hidden ? hidden.results.filter((r) => r.verdict === 'tle').map((r) => r.id) : []
  const failed = hidden && hidden.phase === 'done' ? hidden.results.filter((r) => r.verdict !== 'pass') : []

  const tabCls = (on: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors',
      on ? 'bg-white/[0.07] text-white' : 'text-gray-400 hover:text-gray-200',
    )

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]', className)}>
      <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.07] bg-white/[0.02] px-2 py-1.5" role="tablist" aria-label="Test results">
        <button type="button" role="tab" aria-selected={view === 'sample'} className={tabCls(view === 'sample')} onClick={() => onViewChange('sample')}>
          <Terminal className="h-3.5 w-3.5" aria-hidden />
          <Tr b={T.sample} />
          {sample && sample.phase === 'done' && (
            <span
              className={cn(
                'ml-0.5 rounded px-1.5 text-[12px] font-semibold tabular-nums',
                samplePassed === sampleTotal ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300',
              )}
            >
              {samplePassed}/{sampleTotal}
            </span>
          )}
        </button>
        <button type="button" role="tab" aria-selected={view === 'hidden'} className={tabCls(view === 'hidden')} onClick={() => onViewChange('hidden')}>
          <ShieldQuestion className="h-3.5 w-3.5" aria-hidden />
          <Tr b={T.hidden} />
          {hidden && hidden.phase === 'done' && (
            <span
              className={cn(
                'ml-0.5 rounded px-1.5 text-[12px] font-semibold tabular-nums',
                hiddenPassed === hiddenTotal ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-200',
              )}
            >
              {hiddenPassed}/{hiddenTotal}
            </span>
          )}
        </button>
        <span className="ml-auto hidden items-center gap-1 pr-1 text-[12px] text-gray-500 xl:inline-flex">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          <Tr b={{ en: 'Simulated sandbox', hi: 'सिम्युलेटेड सैंडबॉक्स', hinglish: 'Simulated sandbox' }} />
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-3.5">
        {view === 'sample' ? (
          !sample ? (
            <IdleNote text={T.idleSample} />
          ) : sample.phase === 'compiling' ? (
            <AIThinking label={T.compiling} lines={2} />
          ) : (
            <ul className="space-y-2">
              {sample.results.map((r, i) => {
                const on = i < sample.shown
                return (
                  <li
                    key={`${r.idx}-${r.verdict}`}
                    className={cn(
                      'rounded-lg border px-3 py-2 transition-colors duration-300',
                      on
                        ? r.verdict === 'pass'
                          ? 'border-emerald-400/25 bg-emerald-400/[0.05]'
                          : 'border-rose-400/25 bg-rose-400/[0.05]'
                        : 'border-white/[0.07] bg-white/[0.02]',
                    )}
                  >
                    <div className="flex items-center gap-2 text-[13px]">
                      {on ? <VerdictIcon v={r.verdict} className="h-4 w-4 shrink-0" /> : <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-500" aria-hidden />}
                      <span className="font-medium text-gray-200">#{r.idx}</span>
                      <span className={cn('font-medium', on ? (r.verdict === 'pass' ? 'text-emerald-300' : 'text-rose-300') : 'text-gray-500')}>
                        {on ? VERDICT_LABEL[r.verdict] : '…'}
                      </span>
                      {on && <span className="ml-auto font-mono text-[12px] tabular-nums text-gray-500">{r.ms} ms</span>}
                    </div>
                    <div className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1 font-mono text-[12px] leading-5 sm:grid-cols-3">
                      <div className="min-w-0 truncate">
                        <span className="text-gray-500">
                          <Tr b={T.input} />:{' '}
                        </span>
                        <span className="text-gray-300">{oneLine(r.input)}</span>
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="text-gray-500">
                          <Tr b={T.expected} />:{' '}
                        </span>
                        <span className="text-gray-300">{r.expected}</span>
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="text-gray-500">
                          <Tr b={T.stdout} />:{' '}
                        </span>
                        <span className={cn(on ? (r.verdict === 'pass' ? 'text-emerald-200' : 'text-rose-200') : 'text-gray-600')}>
                          {on ? r.got || '∅' : '…'}
                        </span>
                      </div>
                    </div>
                    {on && r.note && <p className="mt-1 break-words font-mono text-[12px] text-rose-300/90">{r.note}</p>}
                  </li>
                )
              })}
            </ul>
          )
        ) : !scripted ? (
          <IdleNote text={T.practiceHidden} />
        ) : !hidden ? (
          <IdleNote text={T.idleHidden} />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[13px]">
              {hidden.phase === 'running' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-violet-300" aria-hidden />
                  <Tr b={T.running} className="text-violet-200" />
                </>
              ) : (
                <>
                  {hiddenPassed === hiddenTotal ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                  ) : (
                    <Clock3 className="h-4 w-4 text-amber-300" aria-hidden />
                  )}
                  <span className={cn('font-semibold tabular-nums', hiddenPassed === hiddenTotal ? 'text-emerald-300' : 'text-amber-200')}>
                    {hiddenPassed}/{hiddenTotal}
                  </span>
                  <Tr b={T.passed} className="text-gray-300" />
                  {tleIds.length > 0 && (
                    <span className="text-gray-400">
                      · Tests {tleIds.join('-')}: TLE (&gt; 1.0s) at N = 10⁵
                    </span>
                  )}
                </>
              )}
              <span className="ml-auto text-[12px] text-gray-500">
                <Tr b={T.attempt} /> {hidden.attempt}
              </span>
            </div>
            <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {hidden.results.map((r, i) => {
                const on = i < hidden.shown
                return (
                  <li
                    key={`${hidden.attempt}-${r.id}`}
                    title={on ? `#${r.id} ${r.label}: ${VERDICT_LABEL[r.verdict]}${r.ms ? ` · ${r.ms} ms` : ''}` : `#${r.id}`}
                    className={cn(
                      'flex h-11 flex-col items-center justify-center rounded-lg border text-[12px] font-semibold tabular-nums transition-all duration-200 [transform-style:preserve-3d]',
                      on ? cn(VERDICT_CHIP[r.verdict], 'motion-safe:animate-[tile-pop_220ms_ease-out_both]') : 'border-white/[0.08] bg-white/[0.02] text-gray-500',
                    )}
                  >
                    <span className="leading-none">#{r.id}</span>
                    <span className="mt-1 flex items-center gap-1 leading-none">
                      {on ? VERDICT_SHORT[r.verdict] : <Circle className="h-2.5 w-2.5 animate-pulse" aria-hidden />}
                    </span>
                  </li>
                )
              })}
            </ol>
            {failed.length > 0 && (
              <ul className="space-y-1 rounded-lg border border-white/[0.07] bg-black/20 p-2.5 font-mono text-[12px] leading-5">
                {failed.map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <VerdictIcon v={r.verdict} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="text-gray-400">#{r.id}</span>
                    <span className="min-w-0 flex-1 text-gray-300">{r.label}</span>
                    <span className={r.verdict === 'tle' ? 'text-amber-200' : 'text-rose-300'}>{VERDICT_LABEL[r.verdict]}</span>
                  </li>
                ))}
              </ul>
            )}
            {hidden.phase === 'done' && <Tr b={T.sandbox} as="p" className="block text-[12px] leading-snug text-gray-500" />}
          </div>
        )}
      </div>
    </div>
  )
}

function IdleNote({ text }: { text: Bi }) {
  return (
    <div className="flex h-full min-h-[96px] items-center justify-center rounded-lg border border-dashed border-white/10 px-4 py-6 text-center">
      <Tr b={text} as="p" className="block max-w-sm text-[13px] leading-relaxed text-gray-400" />
    </div>
  )
}
