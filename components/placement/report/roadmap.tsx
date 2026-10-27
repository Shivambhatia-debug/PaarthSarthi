'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarCheck2, Flag, Flame, Plug, RefreshCw, Route, Sparkles } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { INTERVIEW_SPLIT, ROUND_TARGETS, VERSANT_TARGETS } from '@/lib/os/rounds'
import { driveById, drivesFor, stretchDrivesFor } from '@/lib/mock/drives'
import { useReducedMotion } from '@/lib/ai-sim'
import { AIBadge } from '@/components/ai/ai-badge'
import { AIThinking } from '@/components/ai/ai-thinking'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import {
  RESCORE_ISO,
  SHORTLISTED_DRIVE,
  STREAK,
  buildPlan,
  type PlanCtx,
  type PlanTask,
} from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Your 30-day plan', hi: 'आपकी 30-दिन की योजना', hinglish: 'Aapka 30-day plan' },
  sub: {
    en: 'Every task is tied to a signal from today’s rounds.',
    hi: 'हर काम आज के राउंड के किसी संकेत से जुड़ा है।',
    hinglish: 'Har task aaj ke rounds ke kisi signal se juda hai.',
  },
  regenLight: { en: 'Regenerate for 2 hrs/day', hi: '2 घंटे/दिन के लिए दोबारा बनाएँ', hinglish: '2 hrs/day ke liye regenerate' },
  regenFull: { en: 'Back to the full plan', hi: 'पूरी योजना पर लौटें', hinglish: 'Full plan par wapas' },
  thinking: { en: 'Re-planning around your time…', hi: 'आपके समय के अनुसार दोबारा योजना…', hinglish: 'Aapke time ke hisaab se re-plan…' },
  streak: { en: 'day streak', hi: 'दिन लगातार', hinglish: 'day streak' },
  light: { en: '2 hrs/day plan', hi: '2 घंटे/दिन योजना', hinglish: '2 hrs/day plan' },
  full: { en: 'Full plan', hi: 'पूरी योजना', hinglish: 'Full plan' },
  external: { en: 'NASSCOM FSP / Spoken Tutorial (integration-ready)', hi: 'NASSCOM FSP / Spoken Tutorial (इंटीग्रेशन-तैयार)' },
  open: { en: 'Open', hi: 'खोलें', hinglish: 'Open' },
  footer: {
    en: 'External modules are integration-ready, not live. The plan is regenerated after every attempt; a mentor or TPO can edit it.',
    hi: 'बाहरी मॉड्यूल इंटीग्रेशन-तैयार हैं, लाइव नहीं। हर प्रयास के बाद योजना दोबारा बनती है; मेंटर या TPO इसे बदल सकते हैं।',
    hinglish: 'External modules integration-ready hain, live nahi. Har attempt ke baad plan regenerate hota hai; mentor ya TPO edit kar sakte hain.',
  },
} satisfies Record<string, Bi>

const DEFAULT_TECH_CHIP: Record<'priya' | 'rahul', string> = {
  priya: 'brute force first, then two-pointer',
  rahul: 'CNC case: missed coolant / feed rate',
}

const TASK_MS = 260

export function Roadmap({ pri }: { pri: number }) {
  const { personaId, rounds, signals, lang, lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const [light, setLight] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [shown, setShown] = useState(0)
  const regenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dLang = lang === 'hi' ? 'hi' : 'en'

  // Context read from the recorded rounds and signals, with persona-target fallbacks (cold render).
  const ctx: PlanCtx = useMemo(() => {
    const cd = rounds?.communication?.detail
    const versant = typeof cd?.versant === 'number' ? cd.versant : (VERSANT_TARGETS[personaId] ?? 50)
    const td = rounds?.technical?.detail
    const techChip = typeof td?.signalChip === 'string' && td.signalChip ? td.signalChip : DEFAULT_TECH_CHIP[personaId]
    const list = Array.isArray(signals) ? signals : []
    const aptGap = list.find((s) => s.round === 'aptitude' && s.kind === 'gap')?.text ?? null
    const hrFlag = list.find((s) => s.round === 'hrInterview' && s.kind !== 'strength')?.text ?? null
    const id = rounds?.techInterview?.detail
    const split = INTERVIEW_SPLIT[personaId] ?? INTERVIEW_SPLIT.priya
    const content = typeof id?.content === 'number' ? id.content : split.content
    const delivery = typeof id?.delivery === 'number' ? id.delivery : split.delivery
    const hrScore = typeof rounds?.hrInterview?.score === 'number' ? rounds.hrInterview.score : ROUND_TARGETS[personaId].hrInterview
    const sd = stretchDrivesFor(personaId)[0]
    const sf = sd?.stretchFor?.find((x) => x.persona === personaId)
    const shortId = SHORTLISTED_DRIVE[personaId]
    return {
      personaId,
      versant,
      techChip,
      aptGap,
      hrFlag,
      content,
      delivery,
      hrScore,
      pri,
      stretch: sd && sf ? { title: sd.title, reason: sf.reason } : null,
      drives: drivesFor(personaId),
      shortlist: shortId ? (driveById(shortId) ?? null) : null,
    }
  }, [rounds, signals, personaId, pri])

  const weeks = useMemo(() => buildPlan(ctx, light), [ctx, light])
  const total = weeks.reduce((n, w) => n + w.tasks.length, 0)
  const planKey = `${personaId}-${light ? 'l' : 'f'}`

  // Stream tasks in, one at a time. Restarts when the plan variant changes (not on every context tick).
  useEffect(() => {
    if (thinking) return
    if (reduced) {
      setShown(999)
      return
    }
    setShown(0)
    let n = 0
    const id = setInterval(() => {
      n += 1
      setShown(n)
      if (n >= 16) clearInterval(id)
    }, TASK_MS)
    return () => clearInterval(id)
  }, [planKey, reduced, thinking])

  const finish = useCallback(() => setShown(999), [])
  useDemoEvent('fastforward', finish)
  useDemoEvent('finish', finish)

  useEffect(
    () => () => {
      if (regenTimer.current) clearTimeout(regenTimer.current)
    },
    [],
  )

  const regenerate = () => {
    if (thinking) return
    const next = !light
    setThinking(true)
    if (regenTimer.current) clearTimeout(regenTimer.current)
    regenTimer.current = setTimeout(
      () => {
        setLight(next)
        setThinking(false)
        aiToast(next ? 'Plan regenerated · 2 hrs/day' : 'Full plan restored', {
          tone: 'ai',
          description: next ? 'Same signals, fewer tasks per week. Rescore date unchanged.' : 'All tasks back on the plan.',
          id: 'roadmap-regen',
        })
      },
      reduced ? 150 : 1100,
    )
  }

  const streak = STREAK[personaId] ?? STREAK.priya
  let cursor = 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.08] blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Route className="h-4 w-4 text-cyan-300" aria-hidden />
            <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
            <AIBadge />
            <span
              className={cn(
                'inline-flex h-6 items-center rounded-full border px-2 text-[12px]',
                light ? 'border-violet-400/30 bg-violet-500/10 text-violet-200' : 'border-white/10 bg-white/[0.04] text-gray-300',
              )}
            >
              <Tr b={light ? TXT.light : TXT.full} />
            </span>
          </div>
          <Tr b={TXT.sub} as="p" className="mt-1 text-[12.5px] leading-snug text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Streak counter */}
          <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3">
            <Flame className="h-4 w-4 text-amber-300" aria-hidden />
            <span className="text-[15px] font-bold tabular-nums text-amber-100">{streak.days}</span>
            <Tr b={TXT.streak} className="text-[12px] text-amber-200/80" />
            <span className="ml-1 flex items-center gap-[3px]" aria-hidden>
              {streak.week.map((on, i) => (
                <span key={i} className={cn('h-2 w-2 rounded-full', on ? 'bg-amber-300' : 'bg-white/10')} />
              ))}
            </span>
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={thinking}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3.5 text-[13px] font-semibold text-violet-100 transition-colors hover:border-violet-300/60 hover:bg-violet-500/20 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw className={cn('h-4 w-4 text-violet-300', thinking && !reduced && 'animate-spin')} aria-hidden />
            <Tr b={light ? TXT.regenFull : TXT.regenLight} />
          </button>
        </div>
      </div>

      {thinking ? (
        <AIThinking label={TXT.thinking} lines={4} className="relative mt-4" />
      ) : (
        <ol className="relative mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {weeks.map((w) => {
            const start = cursor
            cursor += w.tasks.length
            const weekVisible = shown > start || (w.tasks.length === 0 && shown >= start)
            return (
              <li
                key={`${planKey}-${w.id}`}
                className={cn(
                  'flex min-w-0 flex-col rounded-xl border bg-black/20 p-3 transition-colors duration-300',
                  weekVisible ? 'border-white/[0.09]' : 'border-white/[0.05]',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <Tr b={w.label} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-cyan-300" />
                  <Tr b={w.range} className="truncate text-[12px] tabular-nums text-gray-500" />
                </div>
                <Tr b={w.focus} as="h3" className="mt-1 text-[14px] font-semibold leading-snug text-white" />

                <ul className="mt-2.5 flex flex-1 flex-col gap-2">
                  {w.tasks.map((task, ti) => {
                    const idx = start + ti
                    return idx < shown ? (
                      <TaskItem key={`${planKey}-${task.id}`} task={task} />
                    ) : (
                      <li key={`${planKey}-${task.id}-skel`} aria-hidden className="h-[92px] rounded-lg ai-shimmer opacity-60" />
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ol>
      )}

      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-500">
        <span className="inline-flex items-center gap-1.5 text-gray-300">
          <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          <Tr
            b={{
              en: `Rescore on ${fmtDate(RESCORE_ISO, 'en', { year: true })}`,
              hi: `${fmtDate(RESCORE_ISO, 'hi', { year: true })} को दोबारा स्कोर`,
              hinglish: `${fmtDate(RESCORE_ISO, 'en', { year: true })} ko rescore`,
            }}
          />
        </span>
        <span className="tabular-nums">
          {total} {dLang === 'hi' ? 'काम' : 'tasks'}
        </span>
        <Tr b={TXT.footer} as="p" className="basis-full leading-snug" />
      </div>
    </section>
  )
}

function TaskItem({ task }: { task: PlanTask }) {
  const milestone = !!task.milestone
  return (
    <li
      className={cn(
        'os-rise flex flex-col gap-1.5 rounded-lg border px-2.5 py-2',
        milestone ? 'border-emerald-400/30 bg-emerald-400/[0.07]' : 'border-white/[0.07] bg-white/[0.025]',
      )}
    >
      <div className="flex items-start gap-1.5">
        {milestone ? (
          <Flag className="mt-[3px] h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
        ) : (
          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
        )}
        <Tr b={task.title} as="p" className={cn('min-w-0 flex-1 text-[13px] font-medium leading-snug', milestone ? 'text-emerald-50' : 'text-gray-100')} />
        {task.href && (
          <Link
            href={task.href}
            className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md border border-white/10 px-1.5 text-[12px] text-cyan-200 transition-colors hover:border-cyan-300/50 hover:text-white"
          >
            <Tr b={TXT.open} />
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        )}
      </div>
      <Tr b={task.effort} as="p" className="pl-5 text-[12px] tabular-nums text-gray-400" />
      <span className="ml-5 inline-flex max-w-full items-start gap-1 self-start rounded-md border border-violet-400/20 bg-violet-500/[0.08] px-1.5 py-1 text-[12px] leading-snug text-violet-100">
        <Sparkles className="mt-[2px] h-3 w-3 shrink-0 text-violet-300" aria-hidden />
        <Tr b={task.reason} className="min-w-0" />
      </span>
      {task.external && (
        <span className="ml-5 inline-flex max-w-full items-start gap-1 self-start text-[12px] leading-snug text-gray-500">
          <Plug className="mt-[2px] h-3 w-3 shrink-0" aria-hidden />
          <Tr b={TXT.external} className="min-w-0" />
        </span>
      )}
    </li>
  )
}
