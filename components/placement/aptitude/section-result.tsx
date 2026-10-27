'use client'

// Round 1 result: agent log → score ring (persona target) → percentile → sectional cutoffs → difficulty ladder
// → time per topic → streamed AI insight with Why? → signals written to the store. Recharts children are direct
// children of their chart (no fragments, no wrappers).

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { AlertOctagon, CheckCircle2, Flag, NotebookPen, RotateCcw, TrendingUp, TriangleAlert } from 'lucide-react'
import { emitDemo, useDemo } from '@/lib/os/demo-store'
import { ROUND_TARGETS } from '@/lib/os/rounds'
import { PREVIEW } from '@/lib/mock/state'
import { bySex, fmtIN, type Bi } from '@/lib/os/i18n'
import { AgentLog } from '@/components/ai/agent-log'
import { ScoreRing } from '@/components/ai/score-ring'
import { InsightCard } from '@/components/ai/insight-card'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'
import {
  APT_CUTOFF,
  APT_RESULT,
  APT_SECTIONS,
  APT_SIGNALS,
  DIFFICULTY_LABEL,
  ELIMINATION_VARIANT,
  TOPIC_TIMES,
  buildLadder,
  simulatedSteps,
  topicLabel,
  type LadderStep,
} from '@/components/placement/aptitude/questions'
import { DifficultyLadder, LADDER_TITLE } from '@/components/placement/aptitude/difficulty-ladder'
import type { ExamSummary } from '@/components/placement/aptitude/exam-shell'

const TXT = {
  logTitle: { en: 'Sarthi AI · scoring Round 1', hi: 'सारथी AI · राउंड 1 का मूल्यांकन' },
  scoring: { en: 'Scoring responses…', hi: 'उत्तरों का मूल्यांकन हो रहा है…', hinglish: 'Responses score ho rahe hain…' },
  gaps: { en: 'Detecting topic gaps…', hi: 'टॉपिक की कमियाँ खोजी जा रही हैं…', hinglish: 'Topic gaps detect ho rahe hain…' },
  ring: { en: 'Aptitude', hi: 'अभिरुचि' },
  ringSub: { en: 'Round 1 · Online assessment', hi: 'राउंड 1 · ऑनलाइन परीक्षा' },
  sections: { en: 'Sectional scores', hi: 'सेक्शन-वार अंक' },
  cutoff: { en: 'cutoff', hi: 'कटऑफ़' },
  met: { en: 'met', hi: 'पार' },
  allMet: { en: `Sectional cutoff ${APT_CUTOFF} met in all 3 sections`, hi: `तीनों सेक्शन में ${APT_CUTOFF} का कटऑफ़ पार` },
  variant: { en: 'Show elimination variant', hi: 'एलिमिनेशन वैरिएंट दिखाएँ' },
  variantNote: { en: 'Display only. Not saved to your record.', hi: 'केवल प्रदर्शन के लिए। आपके रिकॉर्ड में सेव नहीं।' },
  eliminated: { en: 'Eliminated', hi: 'बाहर' },
  ladderCap: { en: 'correct', hi: 'सही' },
  endedAt: { en: 'ended at', hi: 'अंतिम स्तर' },
  time: { en: 'Time per topic (seconds per question)', hi: 'हर टॉपिक पर समय (प्रति प्रश्न सेकंड)' },
  you: { en: 'You', hi: 'आप' },
  avg: { en: 'Bihar 2027 cohort average', hi: 'बिहार 2027 बैच औसत' },
  timeNote: { en: 'Full-length pattern estimate · illustrative', hi: 'पूर्ण-लंबाई पैटर्न अनुमान · सांकेतिक' },
  insightTitle: {
    en: 'Time & Work is costing you time',
    hi: 'टाइम एंड वर्क में ज़्यादा समय लग रहा है',
    hinglish: 'Time & Work mein time zyada lag raha hai',
  },
  action: { en: 'Open practice set 1', hi: 'प्रैक्टिस सेट 1 खोलें', hinglish: 'Practice set 1 kholein' },
  notes: { en: "Added to Sarthi's notes on you", hi: 'सारथी के नोट्स में जोड़ा गया' },
  strength: { en: 'Strength', hi: 'मज़बूती' },
  gap: { en: 'Gap', hi: 'कमी' },
  flagged: {
    en: 'Flagged for human review: 3 or more tab switches were logged. Your score is kept; a T&P officer reviews the proctor log.',
    hi: 'मानवीय समीक्षा हेतु चिह्नित: 3 या अधिक टैब स्विच दर्ज हुए। आपका स्कोर बना रहेगा; T&P अधिकारी प्रॉक्टर लॉग देखेंगे।',
  },
  retake: { en: 'Retake (demo)', hi: 'दोबारा दें (डेमो)' },
} satisfies Record<string, Bi>

const ELIM_BANNER: Bi = {
  en: `Eliminated in Verbal: ${ELIMINATION_VARIANT.score}% < ${APT_CUTOFF}% sectional cutoff (Accenture/Capgemini-style eliminatory rule)`,
  hi: `भाषिक सेक्शन में बाहर: ${ELIMINATION_VARIANT.score}% < ${APT_CUTOFF}% सेक्शनल कटऑफ़ (Accenture/Capgemini-शैली एलिमिनेशन नियम)`,
}

function insightFor(gender: 'F' | 'M'): Bi {
  return {
    en: 'You take about 40% longer than the average student on Time & Work. Shortcut: the LCM method. I have added 3 practice sets to your plan.',
    hi: `टाइम एंड वर्क में आप औसत से लगभग 40% ज़्यादा समय ले ${bySex(gender, 'रही', 'रहे')} हैं। शॉर्टकट: LCM तरीका — आपकी योजना में 3 प्रैक्टिस सेट जोड़ दिए हैं।`,
    hinglish: `Time & Work mein aap average se 40% zyada time le ${bySex(gender, 'rahi', 'rahe')} hain. Shortcut: LCM method — 3 practice sets plan mein jod diye.`,
  }
}

const EVIDENCE: Bi[] = [
  {
    en: 'Time & Work: 96 s per question against a 69 s Bihar cohort average',
    hi: 'टाइम एंड वर्क: प्रति प्रश्न 96 सेकंड, जबकि बिहार बैच का औसत 69 सेकंड',
  },
  {
    en: 'Accuracy is fine when attempted; the gap is speed, which costs later questions',
    hi: 'प्रयास करने पर सटीकता ठीक है; कमी गति की है, जिससे बाद के प्रश्न छूटते हैं',
  },
  {
    en: 'Series and percentages are faster than average: keep them as time banks',
    hi: 'सीरीज़ और प्रतिशत औसत से तेज़ हैं: इनसे बचा समय आगे काम आएगा',
  },
]

const COLORS = { slow: '#fb7185', fast: '#34d399', ok: '#22d3ee', avg: '#475569' }

export interface SectionResultProps {
  summary: ExamSummary | null
  /** Fast-forward: finish the scoring log at once. */
  instant?: boolean
  onRevealed?: () => void
  onRetake?: () => void
}

export function SectionResult({ summary, instant, onRevealed, onRetake }: SectionResultProps) {
  const { personaId, persona, integrity, setRound, addSignal, t } = useDemo()
  const score = ROUND_TARGETS[personaId].aptitude
  const spec = APT_RESULT[personaId]
  const [revealed, setRevealed] = useState(false)
  const [variant, setVariant] = useState(false)
  const [grow, setGrow] = useState(false)

  const steps: LadderStep[] = useMemo(
    () => (summary && summary.steps.length > 0 ? summary.steps : simulatedSteps()),
    [summary],
  )
  const ladder = useMemo(() => buildLadder(steps), [steps])
  const correct = steps.filter((s) => s.correct).length
  const endLevel = summary?.endLevel ?? 3

  const logSteps = useMemo<Bi[]>(
    () => [
      TXT.scoring,
      {
        en: `Comparing with ${fmtIN(PREVIEW.onboarded)} Bihar students…`,
        hi: `बिहार के ${fmtIN(PREVIEW.onboarded)} छात्रों से तुलना हो रही है…`,
        hinglish: `${fmtIN(PREVIEW.onboarded)} Bihar students se compare ho raha hai…`,
      },
      TXT.gaps,
    ],
    [],
  )

  // Fast-forward: the scoring log completes immediately (AgentLog listens for 'finish').
  useEffect(() => {
    if (!instant) return
    const id = setTimeout(() => emitDemo('finish'), 0)
    return () => clearTimeout(id)
  }, [instant])

  // Write the round outcome and signals once the result is revealed.
  const wrote = useRef(false)
  useEffect(() => {
    if (!revealed || wrote.current) return
    wrote.current = true
    for (const s of APT_SIGNALS) addSignal({ round: 'aptitude', kind: s.kind, text: s.text })
    setRound('aptitude', { status: integrity.tabSwitches >= 3 ? 'flagged' : 'cleared', score })
    onRevealed?.()
    const id = requestAnimationFrame(() => setGrow(true))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  // Keep the status honest if a tab switch lands after the result (e.g. the candidate leaves the tab).
  useEffect(() => {
    if (!revealed) return
    if (integrity.tabSwitches >= 3) setRound('aptitude', { status: 'flagged', score })
  }, [revealed, integrity.tabSwitches, setRound, score])

  const flagged = integrity.tabSwitches >= 3

  const topicData = useMemo(
    () =>
      TOPIC_TIMES.map((r) => ({
        ...r,
        label: t(topicLabel(r.topic)),
        color: r.you > r.avg * 1.25 ? COLORS.slow : r.you < r.avg * 0.88 ? COLORS.fast : COLORS.ok,
      })),
    [t],
  )

  return (
    <div className="space-y-5">
      <AgentLog title={TXT.logTitle} steps={logSteps} onDone={() => setRevealed(true)} className="max-w-2xl" />

      {revealed && (
        <div className="space-y-5">
          {flagged && (
            <div className="os-rise flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[0.08] px-4 py-3 text-[13px] text-amber-100">
              <Flag className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              <Tr b={TXT.flagged} />
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            {/* Score */}
            <section className="os-rise rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <ScoreRing value={score} size={150} label={TXT.ring} sublabel={TXT.ringSub} />
                <div className="w-full min-w-0 flex-1">
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-cyan-300/30 bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-emerald-400/15 px-3 py-1.5 text-[13px] font-semibold text-cyan-50">
                    <TrendingUp className="h-4 w-4 text-cyan-300" aria-hidden />
                    <Tr
                      b={{
                        en: `Top ${spec.topPct}% in Bihar 2027 cohort (demo)`,
                        hi: `बिहार 2027 बैच में शीर्ष ${spec.topPct}% (डेमो)`,
                      }}
                    />
                  </div>

                  <h3 className="mb-2.5 mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    <Tr b={TXT.sections} />
                  </h3>
                  <div className="space-y-3">
                    {APT_SECTIONS.map((sec, i) => {
                      const elim = variant && sec.id === ELIMINATION_VARIANT.section
                      const v = elim ? ELIMINATION_VARIANT.score : spec.sections[sec.id]
                      const ok = v >= APT_CUTOFF
                      return (
                        <div key={sec.id}>
                          <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                            <span className="text-gray-200">
                              <Tr b={sec.label} />
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className={cn('font-semibold tabular-nums', ok ? 'text-white' : 'text-rose-300')}>{v}</span>
                              {ok ? (
                                <span className="inline-flex items-center gap-1 text-[12px] text-emerald-300">
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                  <Tr b={TXT.met} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[12px] text-rose-300">
                                  <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
                                  <Tr b={TXT.eliminated} />
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="relative h-2.5 rounded-full bg-white/[0.06]">
                            <div
                              className={cn(
                                'h-full rounded-full transition-[width] duration-700 ease-out',
                                ok ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400',
                              )}
                              style={{ width: grow ? `${v}%` : '0%', transitionDelay: `${i * 90}ms` }}
                            />
                            <span
                              aria-hidden
                              className="absolute -top-1 h-[18px] w-0.5 rounded bg-amber-300/90"
                              style={{ left: `${APT_CUTOFF}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-gray-500">
                    <span aria-hidden className="h-3 w-0.5 rounded bg-amber-300/90" />
                    <Tr b={TXT.cutoff} /> {APT_CUTOFF}
                  </p>

                  {!variant ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      <Tr b={TXT.allMet} />
                    </p>
                  ) : (
                    <div className="os-rise mt-3 flex items-start gap-2.5 rounded-xl border border-rose-400/40 bg-rose-500/[0.12] px-3.5 py-2.5 text-[13px] leading-snug text-rose-100">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden />
                      <Tr b={ELIM_BANNER} />
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={variant}
                      onClick={() => setVariant((v) => !v)}
                      className="inline-flex items-center gap-2 text-[12.5px] text-gray-300 hover:text-white"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
                          variant ? 'border-rose-400/60 bg-rose-500/40' : 'border-white/15 bg-white/[0.06]',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                            variant ? 'translate-x-[18px]' : 'translate-x-[3px]',
                          )}
                        />
                      </span>
                      <Tr b={TXT.variant} />
                    </button>
                    {variant && (
                      <span className="text-[12px] text-gray-500">
                        <Tr b={TXT.variantNote} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Ladder */}
            <section
              className="os-rise rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.05] to-transparent p-5"
              style={{ animationDelay: '90ms' }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="text-[14px] font-semibold text-white">
                  <Tr b={LADDER_TITLE} />
                </h3>
                <span className="ml-auto text-[12px] text-gray-400">
                  <span className="tabular-nums text-gray-200">
                    {correct}/{steps.length}
                  </span>{' '}
                  <Tr b={TXT.ladderCap} /> · <Tr b={TXT.endedAt} /> <Tr b={DIFFICULTY_LABEL[endLevel]} className="text-violet-200" />
                </span>
              </div>
              <DifficultyLadder data={ladder} height={230} />
            </section>
          </div>

          {/* Time per topic */}
          <section className="os-rise rounded-2xl border border-white/10 bg-white/[0.03] p-5" style={{ animationDelay: '160ms' }}>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <h3 className="text-[14px] font-semibold text-white">
                <Tr b={TXT.time} />
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
                  <Tr b={TXT.you} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-slate-600" />
                  <Tr b={TXT.avg} />
                </span>
              </div>
              <span className="text-[12px] text-gray-500 sm:ml-auto">
                <Tr b={TXT.timeNote} />
              </span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barGap={2} barCategoryGap="22%">
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 110]} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={118}
                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar
                    dataKey="you"
                    radius={[0, 5, 5, 0]}
                    barSize={11}
                    isAnimationActive={false}
                    label={{ position: 'right', fill: '#e5e7eb', fontSize: 12, formatter: (v: unknown) => `${v}s` }}
                  >
                    {topicData.map((r) => (
                      <Cell key={`you-${r.topic}`} fill={r.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="avg" radius={[0, 5, 5, 0]} barSize={7} fill={COLORS.avg} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* AI insight */}
          <div className="os-rise" style={{ animationDelay: '220ms' }}>
          <InsightCard
            severity="warn"
            title={TXT.insightTitle}
            body={insightFor(persona.gender)}
            evidence={EVIDENCE}
            confidence={0.82}
            actionLabel={TXT.action}
            onAction={() => aiToast('Practice set 1 of 3 unlocked: Time & Work with the LCM method (demo)', { tone: 'ok' })}
          />
          </div>

          {/* Signals written */}
          <section className="os-rise rounded-2xl border border-violet-400/20 bg-violet-500/[0.04] p-4" style={{ animationDelay: '280ms' }}>
            <p className="mb-2.5 inline-flex items-center gap-2 text-[13px] font-semibold text-violet-100">
              <NotebookPen className="h-4 w-4 text-violet-300" aria-hidden />
              <Tr b={TXT.notes} />
            </p>
            <div className="flex flex-wrap gap-2">
              {APT_SIGNALS.map((s) => (
                <span
                  key={s.text.en}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]',
                    s.kind === 'strength'
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                      : 'border-amber-400/30 bg-amber-500/10 text-amber-100',
                  )}
                >
                  <span className="text-[12px] font-semibold uppercase tracking-wide opacity-70">
                    <Tr b={s.kind === 'strength' ? TXT.strength : TXT.gap} />
                  </span>
                  <Tr b={s.text} />
                </span>
              ))}
            </div>
          </section>

          {onRetake && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                <Tr b={TXT.retake} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
