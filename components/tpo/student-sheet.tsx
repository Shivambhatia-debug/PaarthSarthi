'use client'

// Student drill-down for the /tpo Students tab: mini pillar radar, AI signals (Priya's live run when present),
// a streamed 14-day intervention and the attempt history. Opened by a row click in StudentsTab.

import { useMemo } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { Activity, BellRing, Check, CheckCircle2, History, Radar as RadarIcon, Sparkles, TriangleAlert, UserPlus } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { BandBadge } from '@/components/os/band-badge'
import { Sparkline } from '@/components/os/sparkline'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { blueprintById } from '@/lib/mock/blueprints'
import { PILLAR_KEYS, bandClasses } from '@/lib/os/scoring'
import { fmtDate, fmtNum, type Bi } from '@/lib/os/i18n'
import type { Institution, PillarKey, StudentRow } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { btnAi, btnGhost } from '@/components/tpo/tpo-header'
import {
  BRANCH_NAME,
  attemptsForRow,
  interventionFor,
  jdSpecFor,
  priyaDefaultSignals,
  signalsForRow,
  type SheetSignal,
} from '@/components/tpo/tpo-data'

const UI = {
  desc: { en: 'Student readiness profile · Batch 2027', hi: 'छात्र तैयारी प्रोफ़ाइल · बैच 2027' },
  recovered: { en: 'Recovered', hi: 'सुधरी' },
  pillars: { en: 'Readiness pillars', hi: 'तैयारी के स्तंभ' },
  signals: { en: 'AI signals', hi: 'AI संकेत' },
  live: { en: 'Live from her run', hi: 'उनके रन से लाइव' },
  plan: { en: 'Sarthi AI · 14-day intervention', hi: 'सारथी AI · 14-दिन की योजना' },
  advisory: { en: 'Advisory. The TPO decides.', hi: 'केवल सलाह। निर्णय TPO का।' },
  history: { en: 'Attempt history', hi: 'प्रयासों का इतिहास' },
  assign: { en: 'Assign 14-day sprint', hi: '14-दिन स्प्रिंट सौंपें' },
  assigned: { en: 'Assigned', hi: 'सौंपा गया' },
  notify: { en: 'Notify (simulated)', hi: 'सूचना भेजें (सिम्युलेटेड)' },
  cgpa: { en: 'CGPA', hi: 'CGPA' },
  backlogs: { en: 'Active backlogs', hi: 'सक्रिय बैकलॉग' },
  medium: { en: 'Schooling medium', hi: 'स्कूली माध्यम' },
  lastActive: { en: 'Last active', hi: 'पिछली सक्रियता' },
  today: { en: 'Today', hi: 'आज' },
  hindi: { en: 'Hindi', hi: 'हिंदी' },
  english: { en: 'English', hi: 'अंग्रेज़ी' },
  high: { en: 'High risk', hi: 'उच्च जोखिम' },
  medium_r: { en: 'Medium risk', hi: 'मध्यम जोखिम' },
  low: { en: 'Low risk', hi: 'कम जोखिम' },
} satisfies Record<string, Bi>

const SHORT: Record<PillarKey, Bi> = {
  aptitude: { en: 'Aptitude', hi: 'अभिरुचि' },
  technical: { en: 'Technical', hi: 'तकनीकी' },
  communication: { en: 'Comm.', hi: 'संवाद' },
  techInterview: { en: 'Tech int.', hi: 'टेक इंटरव्यू' },
  hr: { en: 'HR', hi: 'एचआर' },
  resume: { en: 'Resume', hi: 'रिज़्यूमे' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
}

const KIND_STYLE: Record<SheetSignal['kind'], { dot: string; icon: typeof Check; label: Bi }> = {
  strength: { dot: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25', icon: CheckCircle2, label: { en: 'Strength', hi: 'मज़बूती' } },
  gap: { dot: 'bg-amber-400/10 text-amber-300 ring-amber-400/25', icon: TriangleAlert, label: { en: 'Gap', hi: 'कमी' } },
  behaviour: { dot: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25', icon: Activity, label: { en: 'Behaviour', hi: 'व्यवहार' } },
}

export interface StudentSheetProps {
  row: StudentRow | null
  inst: Institution
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentSheet({ row, inst, open, onOpenChange }: StudentSheetProps) {
  return (
    <Sheet open={open && !!row} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-white/10 bg-[#0d1117] p-0 text-gray-100 sm:max-w-[540px]"
      >
        {row ? <SheetBody row={row} inst={inst} /> : <SheetTitle className="sr-only">Student</SheetTitle>}
      </SheetContent>
    </Sheet>
  )
}

function SheetBody({ row, inst }: { row: StudentRow; inst: Institution }) {
  const { t, lang, state, set } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const blueprintLabel = blueprintById(jdSpecFor(inst.id).blueprintId).label
  const assigned = (state.tpoAssigned ?? []).includes(row.id)
  const branch = BRANCH_NAME[row.branch] ?? { en: row.branch, hi: row.branch }
  const band = bandClasses(row.pri)

  const runSignals = state.runs?.priya?.signals
  const isPriya = row.id === 'priya'
  const liveSignals = isPriya && Array.isArray(runSignals) && runSignals.length > 0
  const signals: SheetSignal[] = useMemo(() => {
    if (isPriya) {
      if (liveSignals && runSignals) {
        return runSignals.slice(-6).map((s) => ({ id: s.id, kind: s.kind, round: s.round, text: s.text }))
      }
      return priyaDefaultSignals()
    }
    return signalsForRow(row)
  }, [isPriya, liveSignals, runSignals, row])

  const radar = PILLAR_KEYS.map((k) => ({ pillar: t(SHORT[k]), value: row.pillars[k] ?? 0 }))
  const attempts = useMemo(() => attemptsForRow(row), [row])
  const plan = useMemo(() => interventionFor(row, blueprintLabel), [row, blueprintLabel])
  const first = row.name.replace(/^Md\.\s*/, '').split(' ')[0] || row.name

  const assign = () => {
    set((s) => ({ tpoAssigned: Array.from(new Set([...(s.tpoAssigned ?? []), row.id])) }))
    aiToast(t({ en: `14-day sprint assigned to ${row.name}`, hi: `${row.name} को 14-दिन स्प्रिंट सौंपा गया` }), {
      description: t({ en: 'Mentor check-in every Friday. Progress shows on this console.', hi: 'हर शुक्रवार मेंटर से बातचीत। प्रगति इसी कंसोल पर दिखेगी।' }),
      tone: 'ok',
    })
  }
  const notify = () =>
    aiToast(t({ en: `WhatsApp/SMS nudge queued for ${first} (simulated)`, hi: `${first} के लिए WhatsApp/SMS संदेश कतार में (सिम्युलेटेड)` }), {
      description: t({ en: 'No real message is sent in this demo.', hi: 'इस डेमो में कोई असली संदेश नहीं भेजा जाता।' }),
    })

  const riskLabel = row.risk === 'high' ? UI.high : row.risk === 'medium' ? UI.medium_r : UI.low
  const riskCls =
    row.risk === 'high'
      ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
      : row.risk === 'medium'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
        : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'

  return (
    <>
      <SheetHeader className="relative space-y-0 border-b border-white/10 px-5 pb-4 pt-5 text-left sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-400/0 via-cyan-300/60 to-emerald-400/0" />
        <SheetDescription className="pr-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-cyan-300/90">
          <Tr b={UI.desc} />
        </SheetDescription>
        <SheetTitle className="mt-1.5 pr-8 text-[20px] font-semibold leading-tight text-white">{row.name}</SheetTitle>
        <p className="mt-1 text-[13px] text-gray-400">
          <Tr b={branch} /> · {inst.short}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <BandBadge pri={row.pri} showValue size="md" />
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] tabular-nums text-gray-300">
            PRI {row.priPrev} <span aria-hidden>→</span> <span className="font-semibold text-white">{row.pri}</span>
          </span>
          {row.status === 'recovered' && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 text-[12.5px] font-semibold text-emerald-300">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              <Tr b={UI.recovered} /> {row.priPrev} → {row.pri}
            </span>
          )}
          <span className={cn('inline-flex h-7 items-center rounded-full border px-2.5 text-[12.5px] font-medium', riskCls)}>
            <Tr b={riskLabel} />
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-[12.5px] sm:grid-cols-4">
          {[
            { k: UI.cgpa, v: fmtNum(row.cgpa, 1) },
            { k: UI.backlogs, v: String(row.activeBacklogs) },
            { k: UI.medium, v: t(row.medium === 'Hindi' ? UI.hindi : UI.english) },
            {
              k: UI.lastActive,
              v: row.lastActiveDays === 0 ? t(UI.today) : t({ en: `${row.lastActiveDays} d ago`, hi: `${row.lastActiveDays} दिन पहले` }),
            },
          ].map((f, i) => (
            <div key={i} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
              <Tr as="dt" b={f.k} className="block text-[12px] text-gray-500" />
              <dd className="mt-0.5 font-semibold text-gray-100">{f.v}</dd>
            </div>
          ))}
        </dl>
      </SheetHeader>

      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
        {/* Pillars */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
            <RadarIcon aria-hidden className="h-4 w-4 text-cyan-300" />
            <Tr b={UI.pillars} />
          </h3>
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_190px]">
            <div className="h-[220px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="66%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke={band.hex} fill={band.hex} fillOpacity={0.22} strokeWidth={2} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-1">
              {PILLAR_KEYS.map((k) => {
                const v = row.pillars[k] ?? 0
                return (
                  <li key={k} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2 text-[12px]">
                      <Tr b={SHORT[k]} className="truncate text-gray-400" />
                      <span className="font-semibold tabular-nums text-gray-100">{v}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, v))}%`, background: bandClasses(v).hex }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Signals */}
        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <Activity aria-hidden className="h-4 w-4 text-violet-300" />
              <Tr b={UI.signals} />
            </h3>
            {liveSignals && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[12px] text-violet-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                <Tr b={UI.live} />
              </span>
            )}
          </div>
          <ul className="space-y-2">
            {signals.map((s) => {
              const k = KIND_STYLE[s.kind] ?? KIND_STYLE.behaviour
              const Icon = k.icon
              return (
                <li key={s.id} className="flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                  <span className={cn('mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md ring-1', k.dot)} title={t(k.label)}>
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                  </span>
                  <Tr b={s.text} className="min-w-0 text-[13px] leading-snug text-gray-200" />
                </li>
              )
            })}
          </ul>
        </section>

        {/* Intervention */}
        <AISurface title={t(UI.plan)} meta={t(UI.advisory)}>
          <StreamingText key={`${row.id}-${ol}`} text={plan} cps={90} className="text-[13.5px] leading-relaxed text-gray-200" />
          <div className="mt-4 flex flex-wrap gap-2">
            {assigned ? (
              <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-400/10 px-3 text-[13px] font-medium text-emerald-300 ring-1 ring-emerald-400/25">
                <Check aria-hidden className="h-4 w-4" />
                <Tr b={UI.assigned} />
              </span>
            ) : (
              <button type="button" onClick={assign} className={btnAi}>
                <UserPlus aria-hidden className="h-4 w-4" />
                <Tr b={UI.assign} />
              </button>
            )}
            <button type="button" onClick={notify} className={btnGhost}>
              <BellRing aria-hidden className="h-4 w-4" />
              <Tr b={UI.notify} />
            </button>
          </div>
        </AISurface>

        {/* Attempts */}
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <History aria-hidden className="h-4 w-4 text-gray-400" />
              <Tr b={UI.history} />
            </h3>
            {attempts.length > 1 && <Sparkline data={attempts.map((a) => a.pri)} width={120} height={28} stroke={band.hex} />}
          </div>
          <ol className="relative space-y-2 border-l border-white/10 pl-4">
            {attempts.map((a, i) => (
              <li key={a.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0d1117]"
                  style={{ background: bandClasses(a.pri).hex }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-[13px] font-medium text-gray-100">
                    <Tr b={a.label} />
                    <span className="ml-2 text-[12px] font-normal text-gray-500">{fmtDate(a.date, ol)}</span>
                  </span>
                  <span className="text-[13px] tabular-nums text-gray-300">
                    PRI <span className="font-semibold text-white">{a.pri}</span>
                    {i > 0 && attempts[i - 1] && (
                      <span className={cn('ml-1.5 text-[12px]', a.pri >= attempts[i - 1].pri ? 'text-emerald-300' : 'text-rose-300')}>
                        {a.pri >= attempts[i - 1].pri ? '+' : '−'}
                        {Math.abs(a.pri - attempts[i - 1].pri)}
                      </span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
