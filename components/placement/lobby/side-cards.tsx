'use client'

// Hub step 8: upcoming drives with countdowns, CM Pratigya teaser, mentor link.

import Link from 'next/link'
import { ArrowRight, CalendarClock, Landmark, MessagesSquare, Users } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { drivesFor } from '@/lib/mock/drives'
import { SCHEMES } from '@/lib/mock/schemes'
import { daysFromToday } from '@/lib/mock/state'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { mockBi } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  drives: { en: 'Your next drives', hi: 'आपकी अगली ड्राइव', hinglish: 'Aapki agli drives' },
  none: { en: 'No open drives right now', hi: 'अभी कोई खुली ड्राइव नहीं' },
  pool: { en: 'pool', hi: 'पूल' },
  today: { en: 'today', hi: 'आज' },
  scheme: { en: 'Scheme match', hi: 'योजना मिलान' },
  verify: { en: 'Verify on the official portal', hi: 'आधिकारिक पोर्टल पर पुष्टि करें' },
  mentor: { en: 'Talk to a mentor', hi: 'मेंटर से बात करें' },
  mentorSub: {
    en: 'Alumni and industry mentors from Bihar',
    hi: 'बिहार के पूर्व छात्र और इंडस्ट्री मेंटर',
    hinglish: 'Bihar ke alumni aur industry mentors',
  },
} satisfies Record<string, Bi>

function countdown(days: number): Bi {
  if (days <= 0) return TXT.today
  if (days === 1) return { en: 'in 1 day', hi: '1 दिन में' }
  return { en: `in ${days} days`, hi: `${days} दिन में`, hinglish: `${days} din mein` }
}

export function SideCards({ className }: { className?: string }) {
  const { personaId, lang } = useDemo()
  const dateLang = lang === 'hi' ? 'hi' : 'en'
  const drives = drivesFor(personaId).slice(0, 3)
  const pratigya = SCHEMES.find((s) => s.id === 'cm-pratigya')
  const note = pratigya?.matchNote?.[personaId]

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drives */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-labelledby="ps-drives-title">
        <h2 id="ps-drives-title" className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-white">
          <CalendarClock className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={TXT.drives} />
        </h2>
        {drives.length === 0 ? (
          <p className="text-[13px] text-gray-500">
            <Tr b={TXT.none} />
          </p>
        ) : (
          <ul className="space-y-2">
            {drives.map((d, i) => {
              const days = daysFromToday(d.date)
              return (
                <li
                  key={d.id}
                  className={cn(
                    'rounded-xl border px-3 py-2.5',
                    i === 0 ? 'border-cyan-300/25 bg-cyan-400/[0.05]' : 'border-white/[0.07] bg-[#0d1117]/50',
                  )}
                >
                  <p className="text-[13px] font-medium leading-snug text-gray-100">
                    <Tr b={d.title} />
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-gray-400">
                    <span>{fmtDate(d.date, dateLang)}</span>
                    <span className="text-gray-600">·</span>
                    <span className={cn('font-medium', days <= 21 ? 'text-cyan-200' : 'text-gray-300')}>
                      <Tr b={countdown(days)} />
                    </span>
                    <span className="text-gray-600">·</span>
                    <span>{d.tier}</span>
                    {d.pool && (
                      <span className="inline-flex items-center gap-1 rounded border border-white/10 px-1.5 text-gray-300">
                        <Users className="h-3 w-3" aria-hidden />
                        <Tr b={TXT.pool} />
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* CM Pratigya */}
      {pratigya && note && (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-4 sm:p-5">
          <p className="mb-1.5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-amber-200/80">
            <Landmark className="h-3.5 w-3.5" aria-hidden />
            <Tr b={TXT.scheme} />
          </p>
          <p className="text-[14px] font-semibold text-white">
            <Tr b={pratigya.name} />
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-100/90">
            <Tr b={note} />
          </p>
          <p className="mt-2 text-[12px] text-gray-500">
            <Tr b={TXT.verify} /> · <Tr b={mockBi(pratigya.portalLabel)} />
          </p>
        </section>
      )}

      {/* Mentor */}
      <Link
        href="/mentorship"
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.05] sm:p-5"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-200">
          <MessagesSquare className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-white">
            <Tr b={TXT.mentor} />
          </span>
          <span className="block text-[12px] text-gray-400">
            <Tr b={TXT.mentorSub} />
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-200" aria-hidden />
      </Link>
    </div>
  )
}
