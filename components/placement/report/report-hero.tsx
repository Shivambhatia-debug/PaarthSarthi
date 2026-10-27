'use client'

import { useMemo, useState } from 'react'
import { Building2, Calculator, Check, ChevronDown, FileBadge2, Send, ShieldCheck, TrendingUp } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { fmtDate, fmtNum, type Bi } from '@/lib/os/i18n'
import { PILLAR_KEYS, PILLAR_LABELS, PILLAR_WEIGHTS, INTEGRITY_FLOOR } from '@/lib/os/scoring'
import { DEMO_TODAY } from '@/lib/mock/state'
import { institutionById } from '@/lib/mock/institutions'
import type { Attempt, Pillars } from '@/lib/mock/types'
import { ScoreRing } from '@/components/ai/score-ring'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { BandBadge } from '@/components/os/band-badge'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { DRIVE_COUNTS, drivesFor } from '@/lib/mock/drives'
import { buildSummary, offerBandForPersona } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  report: { en: 'Placement readiness report', hi: 'प्लेसमेंट तैयारी रिपोर्ट', hinglish: 'Placement readiness report' },
  summaryTitle: { en: 'Your readiness, in one read', hi: 'आपकी तैयारी, एक नज़र में', hinglish: 'Aapki readiness, ek nazar mein' },
  why: { en: 'Why', hi: 'क्यों', hinglish: 'Kyun' },
  share: { en: 'Share with my TPO', hi: 'मेरे TPO को भेजें', hinglish: 'Mere TPO ko bhejiye' },
  shared: { en: 'Shared with TPO', hi: 'TPO को भेजा गया', hinglish: 'TPO ko bhej diya' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा', hinglish: 'Integrity' },
  live: { en: 'live', hi: 'लाइव', hinglish: 'live' },
  pillar: { en: 'Pillar', hi: 'स्तंभ', hinglish: 'Pillar' },
  weight: { en: 'Weight', hi: 'भार', hinglish: 'Weight' },
  score: { en: 'Score', hi: 'स्कोर', hinglish: 'Score' },
  contrib: { en: 'Points', hi: 'अंक', hinglish: 'Points' },
  total: { en: 'PRI (rounded)', hi: 'PRI (पूर्णांक)', hinglish: 'PRI (rounded)' },
  floor: { en: `live, floor ${INTEGRITY_FLOOR}`, hi: `लाइव, न्यूनतम ${INTEGRITY_FLOOR}`, hinglish: `live, floor ${INTEGRITY_FLOOR}` },
  whyNote: {
    en: 'PRI = Σ pillar × weight ÷ 100. Every score has evidence and human review; no automated selection.',
    hi: 'PRI = Σ स्तंभ × भार ÷ 100। हर स्कोर के साथ प्रमाण और मानवीय समीक्षा; कोई स्वचालित चयन नहीं।',
    hinglish: 'PRI = Σ pillar × weight ÷ 100. Har score ke saath evidence aur human review; koi automated selection nahi.',
  },
} satisfies Record<string, Bi>

export interface ReportHeroProps {
  live: Pillars
  pri: number
  attempt: Attempt
  first: Attempt
  prev: Attempt | null
}

export function ReportHero({ live, pri, attempt, first, prev }: ReportHeroProps) {
  const { persona, personaId, integrity, lang, t } = useDemo()
  const [whyOpen, setWhyOpen] = useState(false)
  const [shared, setShared] = useState(false)
  const inst = institutionById(persona.institutionId)
  const instShort = inst?.short ?? ''
  const baseline = first.id === attempt.id
  const dLang = lang === 'hi' ? 'hi' : 'en'

  const summary = useMemo(
    () => buildSummary({ personaId, live, first, attempt, baseline }),
    [personaId, live, first, attempt, baseline],
  )

  const rows = PILLAR_KEYS.map((k) => ({ k, w: PILLAR_WEIGHTS[k], v: live[k], pts: (live[k] * PILLAR_WEIGHTS[k]) / 100 }))
  const sum = rows.reduce((s, r) => s + r.pts, 0)
  const integrityScore = Math.round(integrity?.score ?? 100)
  const driveCount = useMemo(() => DRIVE_COUNTS[personaId] ?? { before: null, now: drivesFor(personaId).length }, [personaId])
  const offerShort = offerBandForPersona(persona.kind, pri).short

  const share = () => {
    aiToast(`TPO notified · ${instShort || 'your college'}`, {
      tone: 'ok',
      description: t({
        en: `PRI ${pri} report and 30-day plan sent to your Training & Placement officer.`,
        hi: `PRI ${pri} रिपोर्ट और 30-दिन की योजना आपके T&P अधिकारी को भेजी गई।`,
        hinglish: `PRI ${pri} report aur 30-day plan aapke T&P officer ko bhej diya.`,
      }),
    })
    setShared(true)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/[0.10] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-80 w-96 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      {/* Identity row */}
      <div className="relative flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-7">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-px">
          <span className="grid h-full w-full place-items-center rounded-full bg-[#0d1117] text-[14px] font-bold text-white">
            {persona.avatarInitials}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <Tr b={{ en: persona.name, hi: persona.nameHi }} as="h1" className="text-[18px] font-semibold leading-tight text-white sm:text-[20px]" />
          <p className="mt-0.5 truncate text-[12.5px] text-gray-400">
            {persona.branchLabel}
            {inst ? ` · ${inst.name}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-gray-300">
            <Tr b={TXT.report} />
            <span className="mx-1.5 text-gray-600">·</span>
            <span className="tabular-nums">{fmtDate(DEMO_TODAY, dLang, { year: true })}</span>
          </span>
          <IllustrativeChip responsive />
        </div>
      </div>

      <div className="relative grid gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        {/* Ring column */}
        <div className="flex flex-col items-center gap-3">
          <ScoreRing value={pri} from={prev?.pri ?? 0} size={180} stroke={12} label="PRI" showBand={false} />
          <BandBadge pri={pri} size="md" />
          <div className="flex flex-wrap justify-center gap-2">
            <span
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px]',
                integrityScore >= 96
                  ? 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200'
                  : 'border-amber-400/30 bg-amber-400/[0.07] text-amber-200',
              )}
              title={`${integrity?.tabSwitches ?? 0} tab switches · ${integrity?.pasteBlocks ?? 0} paste blocks`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              <Tr b={TXT.integrity} />
              <span className="font-semibold tabular-nums">{integrityScore}</span>
              <span className="text-[12px] opacity-60">
                <Tr b={TXT.live} />
              </span>
            </span>
            {prev ? (
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/[0.06] px-2.5 text-[12px] text-cyan-100">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                <span className="font-semibold tabular-nums">
                  {pri - prev.pri >= 0 ? '+' : ''}
                  {pri - prev.pri}
                </span>
                <Tr
                  b={{
                    en: `since ${fmtDate(prev.date, 'en')}`,
                    hi: `${fmtDate(prev.date, 'hi')} से`,
                    hinglish: `${fmtDate(prev.date, 'en')} se`,
                  }}
                />
              </span>
            ) : (
              <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-gray-300">
                <Tr b={{ en: 'Baseline set today', hi: 'आज बेसलाइन तय', hinglish: 'Baseline aaj set' }} />
              </span>
            )}
          </div>
        </div>

        {/* Summary column */}
        <div className="min-w-0 space-y-4">
          <AISurface title={TXT.summaryTitle} bodyClassName="text-[15px] leading-[1.75] text-gray-100">
            <StreamingText text={summary} as="div" cps={60} startDelay={250} />
          </AISurface>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWhyOpen((o) => !o)}
              aria-expanded={whyOpen}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-[13px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:text-white"
            >
              <Calculator className="h-4 w-4 text-cyan-300" aria-hidden />
              <Tr b={{ en: `Why ${pri}?`, hi: `${pri} क्यों?`, hinglish: `${pri} kyun?` }} />
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', whyOpen && 'rotate-180')} aria-hidden />
            </button>
            <button
              type="button"
              onClick={share}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition-all',
                shared
                  ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30'
                  : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] hover:brightness-110',
              )}
            >
              {shared ? <Check className="h-4 w-4" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              <Tr b={shared ? TXT.shared : TXT.share} />
              {instShort && <span className="hidden font-normal opacity-80 sm:inline">· {instShort}</span>}
            </button>
          </div>

          {/* Headline outcomes, above the fold: anchors to the full cards below */}
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="#company-fit"
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-3.5 py-2.5 transition-colors hover:border-emerald-300/50 hover:bg-emerald-400/10"
            >
              <Building2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-emerald-300/80">
                  <Tr b={{ en: 'Eligible drives', hi: 'पात्र ड्राइव', hinglish: 'Eligible drives' }} />
                </span>
                <span className="block text-[15px] font-semibold text-white">
                  <span className="tabular-nums">{driveCount.now}</span>{' '}
                  <Tr b={{ en: 'drives', hi: 'ड्राइव', hinglish: 'drives' }} />
                  {driveCount.before !== null && (
                    <span className="font-normal text-gray-300">
                      {' · '}
                      <Tr
                        b={{
                          en: `was ${driveCount.before} on ${fmtDate(first.date, 'en')}`,
                          hi: `${fmtDate(first.date, 'hi')} को ${driveCount.before}`,
                          hinglish: `${fmtDate(first.date, 'en')} ko ${driveCount.before} thi`,
                        }}
                      />
                    </span>
                  )}
                </span>
              </span>
            </a>
            <a
              href="#offer"
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] px-3.5 py-2.5 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/10"
            >
              <FileBadge2 className="h-5 w-5 shrink-0 text-cyan-300" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-cyan-300/80">
                  <Tr b={{ en: 'Offer band (simulated)', hi: 'ऑफ़र बैंड (सिम्युलेटेड)', hinglish: 'Offer band (simulated)' }} />
                </span>
                <Tr b={offerShort} className="block text-[15px] font-semibold text-white" />
              </span>
            </a>
          </div>

          <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', whyOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden">
              <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3 sm:p-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-[0.1em] text-gray-500">
                      <th className="pb-2 font-semibold">
                        <Tr b={TXT.pillar} />
                      </th>
                      <th className="pb-2 text-right font-semibold">
                        <Tr b={TXT.score} />
                      </th>
                      <th className="pb-2 text-right font-semibold">
                        <Tr b={TXT.weight} />
                      </th>
                      <th className="pb-2 text-right font-semibold">
                        <Tr b={TXT.contrib} />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {rows.map((r) => (
                      <tr key={r.k} className="border-t border-white/[0.05]">
                        <td className="py-1.5 pr-2 text-gray-200">
                          <Tr b={PILLAR_LABELS[r.k]} />
                          {r.k === 'integrity' && (
                            <span className="ml-1.5 text-[12px] text-gray-500">
                              (<Tr b={TXT.floor} />)
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 text-right text-white">{r.v}</td>
                        <td className="py-1.5 text-right text-gray-400">× {r.w}%</td>
                        <td className="py-1.5 text-right text-cyan-200">{fmtNum(r.pts, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/15">
                      <td className="pt-2 font-semibold text-white" colSpan={3}>
                        <Tr b={TXT.total} />
                        <span className="ml-2 text-[12px] font-normal tabular-nums text-gray-500">Σ {fmtNum(sum, 1)}</span>
                      </td>
                      <td className="pt-2 text-right text-[16px] font-bold tabular-nums text-white">{pri}</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="mt-2.5 text-[12px] leading-snug text-gray-500">
                  <Tr b={TXT.whyNote} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
