'use client'

// "New drive from JD": paste a JD, Sarthi AI parses eligibility, counts the Batch 2027 match against d1,
// ranks the top 15 with a "Why ranked #n" breakdown, and exports the full ranked shortlist as CSV.

import { useMemo, useState, type ReactNode } from 'react'
import { Download, FileText, Info, RotateCcw, ScanSearch, Scale, Sparkles, Wand2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { AgentLog } from '@/components/ai/agent-log'
import { AIBadge } from '@/components/ai/ai-badge'
import { CountUp } from '@/components/ai/count-up'
import { aiToast } from '@/components/ai/ai-toast'
import { BandBadge } from '@/components/os/band-badge'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { blueprintById } from '@/lib/mock/blueprints'
import { fmtIN, type Bi } from '@/lib/os/i18n'
import type { BatchMetrics, Institution } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { btnAi, btnGhost, btnSmall } from '@/components/tpo/tpo-header'
import {
  BRANCH_NAME,
  downloadText,
  jdCountsFor,
  jdShortlistFor,
  jdSpecFor,
  slugFor,
  toCsv,
  type JdCandidate,
  type JdCriterion,
} from '@/components/tpo/tpo-data'

const UI = {
  title: { en: 'New drive from JD', hi: 'JD से नई ड्राइव' },
  desc: {
    en: 'Paste a job description. Sarthi AI extracts eligibility and ranks your Batch 2027.',
    hi: 'जॉब डिस्क्रिप्शन पेस्ट करें। सारथी AI पात्रता निकालकर बैच 2027 की रैंकिंग करता है।',
  },
  jd: { en: 'Job description', hi: 'जॉब डिस्क्रिप्शन' },
  parse: { en: 'Parse with AI', hi: 'AI से पार्स करें' },
  parsing: { en: 'Parsing…', hi: 'पार्स हो रहा है…' },
  reparse: { en: 'Parse again', hi: 'फिर से पार्स करें' },
  reset: { en: 'Reset JD', hi: 'JD रीसेट करें' },
  log: { en: 'Sarthi AI · JD parser', hi: 'सारथी AI · JD पार्सर' },
  criteria: { en: 'Eligibility extracted', hi: 'निकाली गई पात्रता' },
  highlighted: { en: 'Where the AI found it', hi: 'AI ने कहाँ पाया' },
  eligible: { en: 'eligible', hi: 'पात्र' },
  ready: { en: 'interview-ready', hi: 'इंटरव्यू के लिए तैयार' },
  sprint: { en: 'need a 2-week sprint', hi: 'को 2-हफ़्ते का स्प्रिंट चाहिए' },
  top: { en: 'AI-ranked top 15', hi: 'AI रैंकिंग: शीर्ष 15' },
  rank: { en: '#', hi: '#' },
  name: { en: 'Student', hi: 'छात्र' },
  branch: { en: 'Branch', hi: 'शाखा' },
  fit: { en: 'Blueprint fit', hi: 'ब्लूप्रिंट फ़िट' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
  score: { en: 'AI score', hi: 'AI स्कोर' },
  why: { en: 'Why', hi: 'क्यों' },
  export: { en: 'Export shortlist CSV', hi: 'शॉर्टलिस्ट CSV निर्यात करें' },
  note: {
    en: 'One-student-one-job and Dream/Super-Dream tiers apply (configurable). AI recommends; the TPO decides.',
    hi: 'एक छात्र-एक नौकरी और ड्रीम/सुपर-ड्रीम टियर लागू (बदले जा सकते हैं)। AI सुझाता है; निर्णय TPO का।',
  },
  readyTag: { en: 'Ready', hi: 'तैयार' },
  sprintTag: { en: 'Sprint', hi: 'स्प्रिंट' },
  sampleTag: { en: 'sample roll', hi: 'नमूना सूची' },
  idleHint: {
    en: 'Edit the JD if you like, then press Parse with AI. Nothing leaves this browser.',
    hi: 'चाहें तो JD बदलें, फिर "AI से पार्स करें" दबाएँ। कुछ भी इस ब्राउज़र से बाहर नहीं जाता।',
  },
} satisfies Record<string, Bi>

type Phase = 'idle' | 'parsing' | 'done'

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Splits the JD into plain text and <mark> runs for each criterion phrase it contains. */
function highlightJd(text: string, criteria: readonly JdCriterion[]): ReactNode[] {
  const phrases = criteria.map((c) => c.match).filter(Boolean)
  if (!phrases.length) return [text]
  const re = new RegExp(`(${phrases.map(escapeRe).join('|')})`, 'gi')
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-cyan-400/15 px-0.5 text-cyan-100 ring-1 ring-cyan-400/30">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export interface JdShortlistDialogProps {
  collegeId: string
  inst: Institution
  b: BatchMetrics
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JdShortlistDialog({ collegeId, inst, b, open, onOpenChange }: JdShortlistDialogProps) {
  const { t } = useDemo()
  const spec = useMemo(() => jdSpecFor(collegeId), [collegeId])
  const counts = useMemo(() => jdCountsFor(collegeId), [collegeId])
  const blueprint = blueprintById(spec.blueprintId)

  const [text, setText] = useState(spec.text)
  const [phase, setPhase] = useState<Phase>('idle')
  const [runId, setRunId] = useState(0)

  const ranked = useMemo(() => (phase === 'done' ? jdShortlistFor(collegeId) : []), [phase, collegeId])
  const top = ranked.slice(0, 15)

  const steps: Bi[] = [
    { en: 'Reading JD…', hi: 'JD पढ़ रहे हैं…' },
    { en: 'Extracting eligibility…', hi: 'पात्रता निकाल रहे हैं…' },
    { en: `Matching ${fmtIN(b.onboarded)} profiles…`, hi: `${fmtIN(b.onboarded)} प्रोफ़ाइल से मिलान…` },
    { en: `Ranking against the ${blueprint.label} blueprint…`, hi: `${blueprint.label} ब्लूप्रिंट पर रैंकिंग…` },
  ]

  const parse = () => {
    setRunId((n) => n + 1)
    setPhase('parsing')
  }

  const reset = () => {
    setText(spec.text)
    setPhase('idle')
  }

  const exportCsv = () => {
    const header = ['Rank', 'Name', 'Branch', 'PRI', 'Blueprint fit', 'Integrity', 'AI score', 'Status']
    const rows = ranked.map((c) => [
      c.rank,
      c.name,
      c.branch,
      c.pri,
      c.fit,
      c.integrity,
      c.score,
      c.ready ? 'Interview-ready' : 'Needs 2-week sprint',
    ])
    const ok = downloadText(`${slugFor(inst)}-jd-shortlist-batch-2027.csv`, toCsv(header, rows))
    aiToast(
      t(
        ok
          ? { en: `Shortlist exported: ${fmtIN(rows.length)} ranked students`, hi: `शॉर्टलिस्ट निर्यात: ${fmtIN(rows.length)} रैंक किए गए छात्र` }
          : { en: 'Download blocked by the browser', hi: 'ब्राउज़र ने डाउनलोड रोका' },
      ),
      { tone: ok ? 'ok' : 'warn', description: ok ? t({ en: 'CSV saved to your downloads.', hi: 'CSV आपके डाउनलोड में सहेजी गई।' }) : undefined },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#0d1117] p-0 text-gray-100 sm:rounded-2xl">
        <DialogHeader className="relative border-b border-white/10 px-4 pb-4 pt-5 text-left sm:px-6">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-400/0 via-cyan-300/60 to-emerald-400/0" />
          <DialogTitle className="flex items-center gap-2 pr-8 text-[18px] font-semibold text-white">
            <Wand2 aria-hidden className="h-5 w-5 text-cyan-300" />
            <Tr b={UI.title} />
            <AIBadge className="ml-1" />
          </DialogTitle>
          <DialogDescription className="pr-8 text-[13px] text-gray-400">
            <Tr b={UI.desc} />
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* JD input */}
            <div className="min-w-0 lg:col-span-7">
              <label htmlFor="tpo-jd" className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-gray-300">
                <FileText aria-hidden className="h-3.5 w-3.5 text-gray-400" />
                <Tr b={UI.jd} />
                <span className="text-gray-500">· {blueprint.label}</span>
              </label>
              <Textarea
                id="tpo-jd"
                data-hotkeys-off=""
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                spellCheck={false}
                className="min-h-[190px] resize-y rounded-xl border-white/10 bg-[#0b0f16] text-[13px] leading-relaxed text-gray-200 placeholder:text-gray-600 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={parse} disabled={phase === 'parsing' || !text.trim()} className={btnAi}>
                  <Sparkles aria-hidden className="h-4 w-4" />
                  <Tr b={phase === 'parsing' ? UI.parsing : phase === 'done' ? UI.reparse : UI.parse} />
                </button>
                <button type="button" onClick={reset} className={btnGhost}>
                  <RotateCcw aria-hidden className="h-4 w-4" />
                  <Tr b={UI.reset} />
                </button>
              </div>
            </div>

            {/* Agent log / criteria */}
            <div className="min-w-0 lg:col-span-5">
              {phase === 'idle' ? (
                <div className="flex h-full min-h-[120px] flex-col justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                  <ScanSearch aria-hidden className="h-5 w-5 text-cyan-300/80" />
                  <Tr as="p" b={UI.idleHint} className="text-[13px] leading-snug text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  <AgentLog key={runId} title={UI.log} steps={steps} stepMs={520} onDone={() => setPhase('done')} />
                  {phase === 'done' && (
                    <div>
                      <Tr as="p" b={UI.criteria} className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400" />
                      <ul className="flex flex-wrap gap-1.5">
                        {spec.criteria.map((c, i) => (
                          <li
                            key={`${runId}-${c.id}`}
                            className="animate-in fade-in-0 zoom-in-95 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[12.5px] font-medium text-cyan-100 duration-300"
                            style={{ animationDelay: `${i * 110}ms`, animationFillMode: 'both' }}
                          >
                            <Tr b={c.label} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {phase === 'done' && (
            <div className="mt-5 space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              {/* Highlighted JD */}
              <div>
                <Tr as="p" b={UI.highlighted} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400" />
                <p className="whitespace-pre-line break-words rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[12.5px] leading-relaxed text-gray-300">
                  {highlightJd(text, spec.criteria)}
                </p>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { v: counts.eligible, l: UI.eligible, cls: 'text-cyan-200', ring: 'border-cyan-400/25 bg-cyan-400/[0.06]' },
                  { v: counts.ready, l: UI.ready, cls: 'text-emerald-300', ring: 'border-emerald-400/25 bg-emerald-400/[0.06]' },
                  { v: counts.sprint, l: UI.sprint, cls: 'text-amber-300', ring: 'border-amber-400/25 bg-amber-400/[0.06]' },
                ].map((c, i) => (
                  <div key={i} className={cn('rounded-xl border px-4 py-3', c.ring)}>
                    <CountUp value={c.v} className={cn('block text-3xl font-semibold leading-none tracking-tight', c.cls)} />
                    <Tr as="p" b={c.l} className="mt-1.5 block text-[13px] text-gray-300" />
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-gray-300">
                <Tr
                  b={{
                    en: `${fmtIN(counts.eligible)} eligible · ${fmtIN(counts.ready)} interview-ready · ${fmtIN(counts.sprint)} need a 2-week sprint`,
                    hi: `${fmtIN(counts.eligible)} पात्र · ${fmtIN(counts.ready)} इंटरव्यू के लिए तैयार · ${fmtIN(counts.sprint)} को 2-हफ़्ते का स्प्रिंट चाहिए`,
                  }}
                  className="font-medium text-white"
                />
              </p>

              {/* Top 15 */}
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-[14px] font-semibold text-white">
                    <Scale aria-hidden className="h-4 w-4 text-cyan-300" />
                    <Tr b={UI.top} />
                  </h3>
                  <button type="button" onClick={exportCsv} className={btnAi}>
                    <Download aria-hidden className="h-4 w-4" />
                    <Tr b={UI.export} />
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <Table className="min-w-[680px] text-[13px]">
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        {[UI.rank, UI.name, UI.branch, null, UI.fit, UI.integrity, UI.score, UI.why].map((h, i) => (
                          <TableHead key={i} className="h-9 whitespace-nowrap px-3 text-[12px] font-medium text-gray-400">
                            {h ? <Tr b={h} /> : 'PRI'}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top.map((c) => (
                        <CandidateRow key={c.id} c={c} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <p className="flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[12.5px] leading-snug text-gray-400">
                <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
                <Tr b={UI.note} />
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CandidateRow({ c }: { c: JdCandidate }) {
  const branch = BRANCH_NAME[c.branch] ?? { en: c.branch, hi: c.branch }
  const parts: { l: Bi; v: number; w: number; bar: string }[] = [
    { l: { en: 'PRI', hi: 'PRI' }, v: c.pri, w: 50, bar: 'bg-cyan-400' },
    { l: UI.fit, v: c.fit, w: 35, bar: 'bg-blue-400' },
    { l: UI.integrity, v: c.integrity, w: 15, bar: 'bg-emerald-400' },
  ]
  return (
    <TableRow className="border-white/[0.06] hover:bg-white/[0.03]">
      <TableCell className="px-3 py-2.5 font-semibold tabular-nums text-gray-400">{c.rank}</TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="font-medium text-gray-100">{c.name}</span>
        {c.sample && (
          <span className="ml-2 rounded-full border border-white/10 px-1.5 py-px text-[12px] text-gray-500">
            <Tr b={UI.sampleTag} />
          </span>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5 text-gray-300">
        <Tr b={branch} />
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="inline-flex items-center gap-2">
          <BandBadge pri={c.pri} showValue />
          <span
            className={cn(
              'rounded px-1.5 py-px text-[12px] font-medium',
              c.ready ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300',
            )}
          >
            <Tr b={c.ready ? UI.readyTag : UI.sprintTag} />
          </span>
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5 tabular-nums text-gray-300">{c.fit}</TableCell>
      <TableCell className="px-3 py-2.5 tabular-nums text-gray-300">{c.integrity}</TableCell>
      <TableCell className="px-3 py-2.5 font-semibold tabular-nums text-white">{c.score.toFixed(1)}</TableCell>
      <TableCell className="px-3 py-2.5">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={btnSmall}>
              <Info aria-hidden className="h-3.5 w-3.5" />
              <Tr b={{ en: `Why ranked #${c.rank}`, hi: `#${c.rank} क्यों` }} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="z-[100] w-72 border-white/10 bg-[#11161f] p-4 text-gray-200 shadow-2xl">
            <p className="text-[13px] font-semibold text-white">
              <Tr b={{ en: `Why ${c.name} is #${c.rank}`, hi: `${c.name} #${c.rank} पर क्यों` }} />
            </p>
            <ul className="mt-3 space-y-2.5">
              {parts.map((p, i) => (
                <li key={i}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="text-gray-400">
                      <Tr b={p.l} /> <span className="text-gray-500">× {p.w}%</span>
                    </span>
                    <span className="font-semibold tabular-nums text-gray-100">{p.v}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className={cn('h-full rounded-full', p.bar)} style={{ width: `${Math.max(2, Math.min(100, p.v))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-white/10 pt-2.5 text-[12.5px] text-gray-300">
              <Tr
                b={{
                  en: `AI score ${c.score.toFixed(1)} · ${c.ready ? 'interview-ready (PRI ≥ 70) ranks first' : 'needs a 2-week sprint before the drive'}`,
                  hi: `AI स्कोर ${c.score.toFixed(1)} · ${c.ready ? 'इंटरव्यू के लिए तैयार (PRI ≥ 70) पहले' : 'ड्राइव से पहले 2-हफ़्ते का स्प्रिंट ज़रूरी'}`,
                }}
              />
            </p>
            <p className="mt-1.5 text-[12px] text-gray-500">
              <Tr b={{ en: 'AI recommends; the TPO decides.', hi: 'AI सुझाता है; निर्णय TPO का।' }} />
            </p>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  )
}
