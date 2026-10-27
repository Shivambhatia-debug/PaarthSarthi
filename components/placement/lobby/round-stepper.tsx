'use client'

// Hub step 7: vertical round tracker for the current persona's run, plus the report.

import Link from 'next/link'
import { ArrowRight, Check, Flag, FileText, Lock, X } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import type { RoundStatus } from '@/lib/os/demo-store'
import { REPORT_ROUTE, ROUNDS, formatRoundScore } from '@/lib/os/rounds'
import type { Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Placement Day rounds', hi: 'प्लेसमेंट डे के राउंड' },
  report: { en: 'Readiness report', hi: 'रेडीनेस रिपोर्ट' },
  view: { en: 'View report', hi: 'रिपोर्ट देखें' },
  optional: { en: 'optional', hi: 'वैकल्पिक' },
  live: { en: 'live', hi: 'चालू' },
  cleared: { en: 'cleared', hi: 'पास' },
  flagged: { en: 'flagged', hi: 'चिह्नित' },
  eliminated: { en: 'eliminated', hi: 'बाहर' },
  locked: { en: 'locked', hi: 'लॉक' },
  run: { en: 'Run', hi: 'रन' },
} satisfies Record<string, Bi>

const STATUS_STYLE: Record<RoundStatus, { dot: string; text: string }> = {
  locked: { dot: 'border-white/10 bg-white/[0.03] text-gray-600', text: 'text-gray-500' },
  live: { dot: 'border-cyan-300/60 bg-cyan-400/15 text-cyan-200', text: 'text-cyan-200' },
  cleared: { dot: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300', text: 'text-emerald-200' },
  flagged: { dot: 'border-amber-400/50 bg-amber-500/15 text-amber-300', text: 'text-amber-200' },
  eliminated: { dot: 'border-rose-400/50 bg-rose-500/15 text-rose-300', text: 'text-rose-200' },
}

const DONE: RoundStatus[] = ['cleared', 'flagged', 'eliminated']

export function RoundStepper({ className }: { className?: string }) {
  const { rounds, includeGd, persona } = useDemo()
  const list = ROUNDS.filter((r) => r.id !== 'gd' || includeGd)
  const hr = rounds.hrInterview?.status
  const reportReady = hr === 'cleared' || hr === 'flagged'

  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5', className)} aria-labelledby="ps-rounds-title">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="ps-rounds-title" className="text-[15px] font-semibold text-white">
          <Tr b={TXT.title} />
        </h2>
        <span className="text-[12px] text-gray-500">
          <Tr b={TXT.run} />: {persona.name.split(' ')[0]}
        </span>
      </div>

      <ol className="relative">
        {list.map((r, i) => {
          const rs = rounds[r.id] ?? { status: 'locked' as RoundStatus }
          const st = STATUS_STYLE[rs.status] ?? STATUS_STYLE.locked
          const done = DONE.includes(rs.status)
          const clickable = r.id !== 'eligibility' && (done || rs.status === 'live')
          const body = (
            <>
              <span
                className={cn(
                  'relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[12px] font-semibold',
                  st.dot,
                  rs.status === 'live' && 'shadow-[0_0_0_4px_rgba(34,211,238,0.12)]',
                )}
              >
                {rs.status === 'cleared' ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : rs.status === 'flagged' ? (
                  <Flag className="h-3.5 w-3.5" aria-hidden />
                ) : rs.status === 'eliminated' ? (
                  <X className="h-3.5 w-3.5" aria-hidden />
                ) : rs.status === 'locked' ? (
                  <Lock className="h-3 w-3" aria-hidden />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-cyan-300 motion-safe:animate-pulse" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-[13.5px] font-medium', rs.status === 'locked' ? 'text-gray-400' : 'text-gray-100')}>
                  <Tr b={r.label} />
                  {r.optional && (
                    <span className="ml-1.5 text-[12px] font-normal text-violet-300">
                      · <Tr b={TXT.optional} />
                    </span>
                  )}
                </span>
                <span className={cn('block text-[12px]', st.text)}>
                  <Tr b={TXT[rs.status] ?? TXT.locked} />
                </span>
              </span>
              <span className={cn('shrink-0 text-[14px] font-semibold tabular-nums', done ? 'text-white' : 'text-gray-600')}>
                {done ? formatRoundScore(r.id, rs) : '—'}
              </span>
            </>
          )
          return (
            <li key={r.id} className="relative">
              {(
                <span aria-hidden className="absolute left-[13.5px] top-9 h-[calc(100%-28px)] w-px bg-white/10" />
              )}
              {clickable ? (
                <Link
                  href={r.route}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-3 py-2">{body}</div>
              )}
            </li>
          )
        })}
        <li className="flex items-center gap-3 py-2">
          <span
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-full border',
              reportReady ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-gray-600',
            )}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className={cn('text-[13.5px] font-medium', reportReady ? 'text-gray-100' : 'text-gray-400')}>
            <Tr b={TXT.report} />
          </span>
        </li>
      </ol>

      {reportReady && (
        <Link
          href={REPORT_ROUTE}
          className="os-rise mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-[14px] font-semibold text-[#06121a] transition-[filter] hover:brightness-110"
        >
          <Tr b={TXT.view} />
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </section>
  )
}
