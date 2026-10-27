'use client'

import { useMemo } from 'react'
import { BadgeIndianRupee, ExternalLink, FileText, Gift, ShieldAlert } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { SCHEMES, schemesFor } from '@/lib/mock/schemes'
import type { Scheme } from '@/lib/mock/types'
import { IntegrationChip } from '@/components/os/integration-chip'
import { Tr } from '@/components/os/tr-text'
import { mockBi } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Opportunities & schemes', hi: 'अवसर और योजनाएँ', hinglish: 'Opportunities & schemes' },
  sub: {
    en: 'Matched to your profile. Amounts and rules change; always confirm on the official portal.',
    hi: 'आपकी प्रोफ़ाइल से मिलान। राशि और नियम बदलते हैं; हमेशा आधिकारिक पोर्टल पर पुष्टि करें।',
    hinglish: 'Aapki profile se match. Amount aur rules badalte hain; hamesha official portal par confirm karein.',
  },
  verify: { en: 'verify on official portal', hi: 'आधिकारिक पोर्टल पर पुष्टि करें', hinglish: 'official portal par verify karein' },
  docs: { en: 'Keep ready', hi: 'तैयार रखें', hinglish: 'Taiyaar rakhein' },
  also: { en: 'Also matched', hi: 'ये भी मेल खाती हैं', hinglish: 'Ye bhi match' },
  internships: { en: 'State internship portal', hi: 'राज्य इंटर्नशिप पोर्टल', hinglish: 'State internship portal' },
  deadline: { en: 'Deadline', hi: 'अंतिम तिथि', hinglish: 'Deadline' },
} satisfies Record<string, Bi>

const STATUS: Record<Scheme['status'], { label: Bi; cls: string }> = {
  open: { label: { en: 'Open', hi: 'खुली' }, cls: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200' },
  upcoming: { label: { en: 'Upcoming', hi: 'आगामी' }, cls: 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200' },
  paused: { label: { en: 'Paused', hi: 'रुकी हुई' }, cls: 'border-white/10 bg-white/[0.04] text-gray-400' },
}

export function Opportunities() {
  const { personaId, lang } = useDemo()
  const dLang = lang === 'hi' ? 'hi' : 'en'
  const cm = SCHEMES.find((s) => s.id === 'cm-pratigya')
  const note = cm?.matchNote?.[personaId]
  const others = useMemo(() => schemesFor(personaId).filter((s) => s.id !== 'cm-pratigya'), [personaId])

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-emerald-400/[0.07] blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[15rem] flex-1">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-300" aria-hidden />
            <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
          </div>
          <Tr b={TXT.sub} as="p" className="mt-1 text-[12.5px] leading-snug text-gray-400" />
        </div>
        <IntegrationChip name="internship.bihar.gov.in" status="Planned" />
      </div>

      <div className="relative mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* CM Pratigya */}
        {cm && (
          <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[0.08] via-cyan-400/[0.04] to-transparent p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
                <BadgeIndianRupee className="h-5 w-5 text-emerald-300" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <Tr b={cm.name} as="h3" className="text-[15px] font-semibold leading-snug text-white" />
                {note && <Tr b={note} as="p" className="mt-1 text-[14px] font-medium leading-snug text-emerald-100" />}
              </div>
            </div>
            <Tr b={cm.amount} as="p" className="text-[12.5px] leading-relaxed text-gray-300" />
            <Tr b={cm.rule} as="p" className="text-[12px] leading-snug text-gray-400" />
            {cm.docs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  <Tr b={TXT.docs} />:
                </span>
                {cm.docs.map((d, i) => (
                  <Tr
                    key={i}
                    b={d}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[12px] text-gray-300"
                  />
                ))}
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              <VerifyChip />
              <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <Tr b={mockBi(cm.portalLabel)} />
              </span>
            </div>
          </article>
        )}

        {/* Other matched schemes */}
        <div className="min-w-0">
          <Tr b={TXT.also} as="p" className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
          {others.length === 0 ? (
            <p className="text-[12.5px] text-gray-500">—</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {others.map((s, i) => {
                const st = STATUS[s.status] ?? STATUS.open
                const n = s.matchNote?.[personaId]
                return (
                  <li
                    key={s.id}
                    className="os-rise flex min-w-0 flex-col gap-1.5 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-2">
                      <Tr b={s.name} as="p" className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white" />
                      <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[12px] leading-none', st.cls)}>
                        <Tr b={st.label} />
                      </span>
                    </div>
                    <Tr b={n ?? s.amount} as="p" className="text-[12px] leading-snug text-gray-300" />
                    <div className="flex flex-wrap items-center gap-2">
                      <VerifyChip />
                      {s.deadline && (
                        <span className="text-[12px] tabular-nums text-gray-500">
                          <Tr b={TXT.deadline} /> {fmtDate(s.deadline, dLang)}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function VerifyChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.07] px-2 py-0.5 text-[12px] text-amber-200">
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
      <Tr b={TXT.verify} />
    </span>
  )
}
