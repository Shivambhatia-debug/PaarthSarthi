'use client'

import type { ReactNode } from 'react'
import { BookOpenText, Gauge, Layers, Sparkles, Tag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import type { Difficulty, Problem, ProblemId } from '@/components/placement/technical/problems'

export type LeftTab = 'problem' | 'coach'

const T = {
  problem: { en: 'Problem', hi: 'प्रश्न', hinglish: 'Problem' },
  coach: { en: 'Sarthi AI coach', hi: 'सारथी AI कोच', hinglish: 'Sarthi AI coach' },
  input: { en: 'Input', hi: 'इनपुट', hinglish: 'Input' },
  output: { en: 'Output', hi: 'आउटपुट', hinglish: 'Output' },
  inputFormat: { en: 'Input format', hi: 'इनपुट प्रारूप', hinglish: 'Input format' },
  outputFormat: { en: 'Output format', hi: 'आउटपुट प्रारूप', hinglish: 'Output format' },
  constraints: { en: 'Constraints', hi: 'सीमाएँ', hinglish: 'Constraints' },
  example: { en: 'Example', hi: 'उदाहरण', hinglish: 'Example' },
  expected: { en: 'Expected', hi: 'अपेक्षित', hinglish: 'Expected' },
  time: { en: 'time', hi: 'समय', hinglish: 'time' },
  space: { en: 'extra space', hi: 'अतिरिक्त मेमोरी', hinglish: 'extra space' },
  hidden: { en: 'hidden tests on Submit', hi: 'छिपे टेस्ट सबमिट पर', hinglish: 'hidden tests Submit par' },
  seenIn: { en: 'Pattern seen in', hi: 'यह पैटर्न यहाँ दिखता है', hinglish: 'Pattern seen in' },
  footnote: {
    en: 'Pattern-inspired by publicly reported formats. Not an actual company question; no affiliation.',
    hi: 'सार्वजनिक रूप से बताए गए प्रारूपों से प्रेरित। किसी कंपनी का असली प्रश्न नहीं; कोई संबद्धता नहीं।',
    hinglish: 'Publicly reported formats se inspired. Kisi company ka asli question nahi; koi affiliation nahi.',
  },
  practice: { en: 'Practice', hi: 'अभ्यास', hinglish: 'Practice' },
  graded: { en: 'Graded', hi: 'मूल्यांकित', hinglish: 'Graded' },
} satisfies Record<string, Bi>

const DIFF_CLASS: Record<Difficulty, string> = {
  Easy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  Medium: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  'Medium-Hard': 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}
const DIFF_DOT: Record<Difficulty, string> = {
  Easy: 'bg-emerald-400',
  Medium: 'bg-amber-400',
  'Medium-Hard': 'bg-rose-400',
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500">{children}</h4>
}

export interface ProblemPanelProps {
  problems: Problem[]
  problemId: ProblemId
  onProblemChange: (id: ProblemId) => void
  tab: LeftTab
  onTabChange: (t: LeftTab) => void
  /** Coach content (AI review + hint ladder). Omit to hide the coach tab (mobile renders it separately). */
  coach?: ReactNode
  /** Pulsing dot on the coach tab when there is something new. */
  coachBadge?: boolean
  /** Disable problem switching while a sequence plays. */
  locked?: boolean
  className?: string
}

/** Left pane of the coding IDE: problem tabs, statement, I/O, constraints, samples and pattern tags. */
export function ProblemPanel({
  problems,
  problemId,
  onProblemChange,
  tab,
  onTabChange,
  coach,
  coachBadge = false,
  locked = false,
  className,
}: ProblemPanelProps) {
  const problem = problems.find((p) => p.id === problemId) ?? problems[0]
  const hasCoach = coach !== undefined && coach !== null
  const value: LeftTab = hasCoach ? tab : 'problem'

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]', className)}>
      <Tabs value={value} onValueChange={(v) => onTabChange(v as LeftTab)} className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
          <TabsList className="h-9 gap-1 bg-transparent p-0">
            <TabsTrigger
              value="problem"
              className="h-8 gap-1.5 rounded-md px-2.5 text-[13px] text-gray-400 data-[state=active]:bg-white/[0.07] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <BookOpenText className="h-3.5 w-3.5" aria-hidden />
              <Tr b={T.problem} />
            </TabsTrigger>
            {hasCoach && (
              <TabsTrigger
                value="coach"
                className="relative h-8 gap-1.5 rounded-md px-2.5 text-[13px] text-gray-400 data-[state=active]:bg-violet-500/[0.12] data-[state=active]:text-violet-100 data-[state=active]:shadow-none"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-300" aria-hidden />
                <Tr b={T.coach} />
                {coachBadge && (
                  <span className="relative ml-0.5 flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-300" />
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent
          value="problem"
          forceMount
          className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
        >
          <div className="space-y-5 px-4 pb-6 pt-4 sm:px-5">
            {/* Problem switcher */}
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-hide" role="tablist" aria-label="Problems">
              {problems.map((p) => {
                const active = p.id === problem.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={locked && !active}
                    onClick={() => onProblemChange(p.id)}
                    className={cn(
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-medium transition-colors disabled:opacity-40',
                      active
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-gray-200',
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', DIFF_DOT[p.difficulty])} aria-hidden />
                    Q{p.num}
                    <span className="hidden max-w-[9rem] truncate sm:inline">
                      · <Tr b={p.title} />
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[19px] font-semibold leading-snug text-white">
                  {problem.num}. <Tr b={problem.title} />
                </h2>
                <span className={cn('rounded-full border px-2 py-0.5 text-[12px] font-semibold', DIFF_CLASS[problem.difficulty])}>
                  {problem.difficulty}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[12px] font-medium',
                    problem.scripted ? 'border-cyan-400/25 text-cyan-200' : 'border-white/10 text-gray-400',
                  )}
                >
                  <Tr b={problem.scripted ? T.graded : T.practice} />
                </span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                  {problem.tag}
                </span>
                <span aria-hidden className="text-gray-600">
                  ·
                </span>
                <span>
                  {problem.hiddenCount} <Tr b={T.hidden} />
                </span>
              </p>
            </div>

            <Tr b={problem.statement} as="p" className="block text-[14px] leading-relaxed text-gray-200" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <SectionTitle>
                  <Tr b={T.inputFormat} />
                </SectionTitle>
                <Tr b={problem.inputFormat} as="p" className="block text-[13px] leading-relaxed text-gray-300" />
              </div>
              <div>
                <SectionTitle>
                  <Tr b={T.outputFormat} />
                </SectionTitle>
                <Tr b={problem.outputFormat} as="p" className="block text-[13px] leading-relaxed text-gray-300" />
              </div>
            </div>

            <div>
              <SectionTitle>
                <Tr b={T.constraints} />
              </SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {problem.constraints.map((c) => (
                  <span key={c} className="rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 font-mono text-[12.5px] text-gray-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {problem.samples.map((s, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/20">
                  <div className="border-b border-white/[0.06] px-3 py-1.5 text-[12px] font-semibold text-gray-400">
                    <Tr b={T.example} /> {i + 1}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                    <div className="min-w-0 px-3 py-2">
                      <div className="mb-1 text-[12px] text-gray-500">
                        <Tr b={T.input} />
                      </div>
                      <pre className="overflow-x-auto whitespace-pre font-mono text-[13px] leading-5 text-gray-100">{s.input}</pre>
                    </div>
                    <div className="min-w-0 px-3 py-2">
                      <div className="mb-1 text-[12px] text-gray-500">
                        <Tr b={T.output} />
                      </div>
                      <pre className="overflow-x-auto whitespace-pre font-mono text-[13px] leading-5 text-emerald-200">{s.output}</pre>
                    </div>
                  </div>
                  {s.explain && (
                    <div className="border-t border-white/[0.06] px-3 py-2 text-[12.5px] leading-snug text-gray-400">
                      <Tr b={s.explain} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2 text-[12.5px] text-cyan-100">
              <Gauge className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              <span className="font-semibold">
                <Tr b={T.expected} />:
              </span>
              <span className="font-mono">{problem.expected.time}</span>
              <Tr b={T.time} className="text-cyan-200/80" />
              <span aria-hidden className="text-cyan-200/40">
                ·
              </span>
              <span className="font-mono">{problem.expected.space}</span>
              <Tr b={T.space} className="text-cyan-200/80" />
            </div>

            <div>
              <SectionTitle>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  <Tr b={T.seenIn} />
                </span>
              </SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {problem.patternSeenIn.map((p) => (
                  <span key={p} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-gray-300">
                    {p}
                  </span>
                ))}
              </div>
              <Tr b={T.footnote} as="p" className="mt-2 block text-[12px] leading-snug text-gray-500" />
            </div>
          </div>
        </TabsContent>

        {hasCoach && (
          <TabsContent
            value="coach"
            forceMount
            className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
          >
            <div className="space-y-4 px-3 pb-6 pt-3 sm:px-4">{coach}</div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
