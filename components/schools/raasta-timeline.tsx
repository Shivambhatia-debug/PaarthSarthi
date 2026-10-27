'use client'

import { useState } from 'react'
import { Check, Flame, Route } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { aiToast } from '@/components/ai/ai-toast'
import { cn } from '@/lib/utils'
import { MICRO_TASKS, STREAK_DAYS, TIMELINE } from '@/components/schools/school-data'
import { SpeakButton, T, useSchool } from '@/components/schools/school-shell'

const UI = {
  title: { en: 'Raasta: your step-by-step road', hi: 'रास्ता: कदम-दर-कदम' } as Bi,
  sub: {
    en: 'Class 10 → DCECE → Diploma → B.Tech or a job',
    hi: 'कक्षा 10 → DCECE → डिप्लोमा → B.Tech या नौकरी',
  } as Bi,
  now: { en: 'You are here', hi: 'आप यहाँ हैं' } as Bi,
  week: { en: 'This week’s small tasks', hi: 'इस हफ़्ते के छोटे काम' } as Bi,
  streak: { en: 'day streak', hi: 'दिन लगातार' } as Bi,
  done: { en: 'done', hi: 'पूरे' } as Bi,
  allDone: { en: 'All tasks done this week. Well done!', hi: 'इस हफ़्ते के सारे काम पूरे। शाबाश!' } as Bi,
  days: { en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], hi: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'] },
}

export function RaastaTimeline() {
  const { L, lang } = useSchool()
  const [tasks, setTasks] = useState(() => MICRO_TASKS.map((t) => ({ ...t })))
  const doneCount = tasks.filter((t) => t.done).length
  const streak = STREAK_DAYS + (doneCount > MICRO_TASKS.filter((t) => t.done).length ? 1 : 0)
  const days = lang === 'hi' ? UI.days.hi : UI.days.en

  const toggle = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    setTasks(next)
    if (next.every((t) => t.done) && !tasks.every((t) => t.done)) {
      aiToast(L(UI.allDone), { tone: 'ok', id: 'school-tasks' })
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-cyan-400/10 to-emerald-400/15 text-cyan-200">
          <Route className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-semibold leading-snug text-white">
            <T b={UI.title} />
          </h3>
          <p className="mt-0.5 text-[14px] leading-relaxed text-gray-400">
            <T b={UI.sub} />
          </p>
        </div>
        <SpeakButton text={`${L(UI.title)}। ${TIMELINE.map((s) => L(s.title)).join('। ')}`} />
      </div>

      {/* Vertical timeline */}
      <ol className="relative ml-1">
        {TIMELINE.map((s, i) => {
          const current = i === 0
          const last = i === TIMELINE.length - 1
          return (
            <li key={s.id} className="relative flex gap-3.5 pb-5 last:pb-0">
              {!last && (
                <span
                  aria-hidden
                  className={cn('absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px', current ? 'bg-gradient-to-b from-cyan-300/70 to-white/10' : 'bg-white/10')}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
                  current
                    ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[#04121a] shadow-[0_0_18px_rgba(34,211,238,0.55)]'
                    : 'border border-white/15 bg-[#0d1117] text-gray-400',
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-gray-500">
                  <T b={s.when} />
                  {current && (
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[12px] font-semibold text-cyan-200">
                      <T b={UI.now} />
                    </span>
                  )}
                </p>
                <p className={cn('mt-0.5 text-[15px] font-semibold leading-snug', current ? 'text-white' : 'text-gray-200')}>
                  <T b={s.title} />
                </p>
                <p className="text-[14px] leading-snug text-gray-400">
                  <T b={s.detail} />
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Weekly micro-tasks + streak */}
      <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-gray-200">
            <T b={UI.week} />
            <span className="ml-2 text-[13px] font-normal tabular-nums text-gray-400">
              {doneCount}/{tasks.length} <T b={UI.done} />
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[13px] font-semibold text-amber-200">
              <Flame className="h-4 w-4" aria-hidden />
              <span className="tabular-nums">{streak}</span>
              <T b={UI.streak} />
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5" aria-hidden>
          {days.map((d, i) => (
            <span key={i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'h-2.5 w-7 rounded-full sm:w-9',
                  i < streak ? 'bg-gradient-to-r from-amber-300 to-orange-400' : 'bg-white/[0.08]',
                )}
              />
              <span lang={lang === 'hi' ? 'hi' : undefined} className={cn('text-[12px] text-gray-500', lang === 'hi' && 'font-deva')}>
                {d}
              </span>
            </span>
          ))}
        </div>

        <ul className="mt-3 space-y-1.5">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={t.done}
                className={cn(
                  'flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] transition-colors hover:bg-white/[0.04]',
                  t.done ? 'text-gray-400' : 'text-gray-100',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                    t.done ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-200' : 'border-white/20 bg-white/[0.02]',
                  )}
                >
                  {t.done && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className={cn('min-w-0 flex-1', t.done && 'line-through decoration-white/30')}>
                  <T b={t.label} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
