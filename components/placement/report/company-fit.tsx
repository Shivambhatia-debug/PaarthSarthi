'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, Building2, CalendarDays, ChevronDown, Lock, Sparkles, Users } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { daysFromToday } from '@/lib/mock/state'
import { blueprintById } from '@/lib/mock/blueprints'
import { institutionById } from '@/lib/mock/institutions'
import { DRIVE_COUNTS, driveById, drivesFor, stretchDrivesFor } from '@/lib/mock/drives'
import type { Attempt, Drive } from '@/lib/mock/types'
import { CountUp } from '@/components/ai/count-up'
import { Tr } from '@/components/os/tr-text'
import { SHORTLISTED_DRIVE } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Company fit', hi: 'कंपनी फ़िट', hinglish: 'Company fit' },
  eligible: { en: 'upcoming drives you are eligible for', hi: 'आगामी ड्राइव के लिए आप पात्र हैं', hinglish: 'upcoming drives ke liye aap eligible hain' },
  pool: { en: 'Pool', hi: 'पूल', hinglish: 'Pool' },
  showAll: { en: 'Show all', hi: 'सभी दिखाएँ', hinglish: 'Sab dikhaiye' },
  showLess: { en: 'Show fewer', hi: 'कम दिखाएँ', hinglish: 'Kam dikhaiye' },
  none: {
    en: 'No upcoming drives match yet. Your plan below targets the gaps that unlock them.',
    hi: 'अभी कोई आगामी ड्राइव मेल नहीं खाती। नीचे की योजना उन्हें खोलने वाली कमियों पर केंद्रित है।',
    hinglish: 'Abhi koi upcoming drive match nahi karti. Neeche ka plan unhe unlock karne wale gaps par focus karta hai.',
  },
  note: {
    en: 'Drives are sector-level and illustrative; no company names. Eligibility follows each blueprint’s criteria.',
    hi: 'ड्राइव क्षेत्र-स्तर की और उदाहरणात्मक हैं; कोई कंपनी नाम नहीं। पात्रता हर ब्लूप्रिंट के मानदंड से।',
    hinglish: 'Drives sector-level aur illustrative hain; koi company naam nahi. Eligibility har blueprint ke criteria se.',
  },
} satisfies Record<string, Bi>

const COLLAPSED = 4

export interface CompanyFitProps {
  /** First attempt (the 'was N on <date>' anchor). */
  first: Attempt
}

export function CompanyFit({ first }: CompanyFitProps) {
  const { personaId, lang } = useDemo()
  const dLang = lang === 'hi' ? 'hi' : 'en'
  const [expanded, setExpanded] = useState(false)

  const drives = useMemo(() => drivesFor(personaId), [personaId])
  const stretch = useMemo(() => stretchDrivesFor(personaId), [personaId])
  const counts = DRIVE_COUNTS[personaId] ?? { before: null, now: drives.length }
  const shortlistId = SHORTLISTED_DRIVE[personaId]
  const shortlist = shortlistId ? (driveById(shortlistId) ?? null) : null
  const before = counts.before
  const visible = expanded ? drives : drives.slice(0, COLLAPSED)

  return (
    <section id="company-fit" className="relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.08] blur-3xl" />

      <div className="relative flex items-center gap-2">
        <Building2 className="h-4 w-4 text-cyan-300" aria-hidden />
        <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
      </div>

      {/* Headline count */}
      <div className="relative mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-[44px] font-bold leading-none tabular-nums text-transparent">
          <CountUp value={counts.now} from={before ?? 0} />
        </span>
        <div className="min-w-0 pb-1">
          <Tr
            b={{
              en: `Eligible for ${counts.now} upcoming drives`,
              hi: `${counts.now} आगामी ड्राइव के लिए पात्र`,
              hinglish: `${counts.now} upcoming drives ke liye eligible`,
            }}
            as="p"
            className="text-[14px] font-semibold text-white"
          />
          {before !== null && (
            <Tr
              b={{
                en: `(was ${before} on ${fmtDate(first.date, 'en')})`,
                hi: `(${fmtDate(first.date, 'hi')} को ${before} थीं)`,
                hinglish: `(${fmtDate(first.date, 'en')} ko ${before} thi)`,
              }}
              as="p"
              className="text-[12.5px] text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Rahul: already shortlisted */}
      {shortlist && (
        <div className="relative mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-3.5 py-3">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
          <Tr
            b={{
              en: `Shortlisted · ${shortlist.title.en}, ${fmtDate(shortlist.date, 'en')}`,
              hi: `शॉर्टलिस्ट · ${shortlist.title.hi}, ${fmtDate(shortlist.date, 'hi')}`,
              hinglish: `Shortlisted · ${shortlist.title.en}, ${fmtDate(shortlist.date, 'en')}`,
            }}
            as="p"
            className="min-w-0 text-[13.5px] font-medium leading-snug text-emerald-100"
          />
        </div>
      )}

      {/* Stretch: unlocks after a gap closes */}
      {stretch.map((d) => {
        const s = (d.stretchFor ?? []).find((x) => x.persona === personaId)
        if (!s) return null
        return (
          <div
            key={`stretch-${d.id}`}
            className="relative mt-3 flex items-start gap-2.5 rounded-xl border border-violet-400/25 bg-violet-500/[0.07] px-3.5 py-3"
          >
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
            <div className="min-w-0">
              <Tr
                b={{
                  en: `${s.reason.en}: ${d.title.en}`,
                  hi: `${s.reason.hi}: ${d.title.hi}`,
                  hinglish: `${s.reason.en}: ${d.title.en}`,
                }}
                as="p"
                className="text-[13.5px] font-medium leading-snug text-violet-50"
              />
              <p className="mt-0.5 text-[12px] text-violet-200/70">
                {fmtDate(d.date, dLang)} · {blueprintById(d.blueprintId).label}
              </p>
            </div>
          </div>
        )
      })}

      {/* Drive cards */}
      {drives.length === 0 ? (
        <Tr b={TXT.none} as="p" className="relative mt-4 text-[13px] leading-snug text-gray-400" />
      ) : (
        <ul className="relative mt-4 grid gap-2 sm:grid-cols-2">
          {visible.map((d, i) => (
            <DriveCard key={d.id} d={d} index={i} highlight={d.id === shortlist?.id} dLang={dLang} />
          ))}
        </ul>
      )}

      {drives.length > COLLAPSED && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="relative mt-3 inline-flex h-10 items-center justify-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-[13px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:text-white"
        >
          <Tr b={expanded ? TXT.showLess : TXT.showAll} />
          {!expanded && <span className="tabular-nums text-gray-400">({drives.length})</span>}
          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
        </button>
      )}

      <Tr b={TXT.note} as="p" className="relative mt-auto pt-3 text-[12px] leading-snug text-gray-500" />
    </section>
  )
}

function DriveCard({ d, index, highlight, dLang }: { d: Drive; index: number; highlight: boolean; dLang: 'en' | 'hi' }) {
  const host = institutionById(d.hostInstitutionId)
  const inDays = daysFromToday(d.date)
  const bp = blueprintById(d.blueprintId)
  return (
    <li
      className={cn(
        'os-rise flex min-w-0 flex-col gap-1.5 rounded-xl border px-3 py-2.5',
        highlight ? 'border-emerald-400/35 bg-emerald-400/[0.06]' : 'border-white/[0.08] bg-black/20',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="flex items-start gap-2">
        <Tr b={d.title} as="p" className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white" />
        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[12px] leading-none text-gray-300">
          {d.tier}
        </span>
      </div>
      <p className="truncate text-[12px] text-cyan-200/80" title={bp.label}>
        {bp.label}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular-nums">{fmtDate(d.date, dLang)}</span>
          {inDays >= 0 && <span className="tabular-nums text-gray-500">· {inDays === 0 ? (dLang === 'hi' ? 'आज' : 'today') : `${inDays}d`}</span>}
        </span>
        {d.pool && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <Tr b={TXT.pool} />
          </span>
        )}
        {host?.short && <span className="truncate">{host.short}</span>}
        {highlight && (
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <Tr b={{ en: 'Shortlisted', hi: 'शॉर्टलिस्ट' }} />
          </span>
        )}
      </div>
    </li>
  )
}
