'use client'

import { useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Building2, GraduationCap, Landmark, MapPin, Sparkles, TriangleAlert, Users } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { SimulatedNotice } from '@/components/os/illustrative-chip'
import { BandBadge } from '@/components/os/band-badge'
import { Sparkline } from '@/components/os/sparkline'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, fmtPct, type Bi } from '@/lib/os/i18n'
import { bandClasses } from '@/lib/os/scoring'
import { districtById } from '@/lib/mock/districts'
import { TPO_SUPPORTED_COLLEGES, institutionsByDistrict } from '@/lib/mock/institutions'
import { SKILL_LABEL, districtRec, priGain, signed } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  division: { en: 'division', hi: 'प्रमंडल' },
  aspirational: { en: 'Aspirational district', hi: 'आकांक्षी ज़िला' },
  pri: { en: 'District PRI', hi: 'ज़िला PRI' },
  assessed: { en: 'Students assessed', hi: 'आकलित छात्र' },
  atRisk: { en: 'At risk', hi: 'जोखिम में' },
  girls: { en: 'Girls', hi: 'छात्राएँ' },
  institutions: { en: 'Institutions', hi: 'संस्थान' },
  sinceBaseline: { en: 'since baseline', hi: 'बेसलाइन से' },
  topGap: { en: 'Top gap', hi: 'मुख्य कमी' },
  gec: { en: 'Engineering', hi: 'इंजीनियरिंग' },
  gp: { en: 'Polytechnic', hi: 'पॉलिटेक्निक' },
  rec: { en: 'Sarthi recommends', hi: 'सारथी का सुझाव' },
  openTpo: { en: 'Open T&P view', hi: 'T&P दृश्य खोलें' },
  desc: {
    en: 'District drill-down · simulated readiness, illustrative data',
    hi: 'ज़िले का विवरण · सिम्युलेटेड तैयारी, सांकेतिक डेटा',
  },
  none: { en: 'No institutions in this district.', hi: 'इस ज़िले में कोई संस्थान नहीं।' },
} satisfies Record<string, Bi>

function Stat({ icon: Icon, label, children }: { icon: typeof Users; label: Bi; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
        <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
        <Tr b={label} className="truncate" />
      </div>
      <div className="mt-1.5 text-[22px] font-semibold leading-none tabular-nums text-white">{children}</div>
    </div>
  )
}

export interface DistrictSheetProps {
  districtId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Drawer for one district: KPIs, institutions (no stars), streamed recommendation, T&P deep link (fix 34). */
export function DistrictSheet({ districtId, open, onOpenChange }: DistrictSheetProps) {
  const { t, lang } = useDemo()
  const router = useRouter()
  const d = districtById(districtId)
  const insts = useMemo(() => (d ? [...institutionsByDistrict(d.id)].sort((a, b) => b.pri - a.pri) : []), [d])
  const tpo = insts.find((i) => TPO_SUPPORTED_COLLEGES.includes(i.id))
  const rec = d ? districtRec(d) : null
  const hiName = lang === 'hi'

  const tpoTip: Bi = {
    en: `T&P demo available for ${TPO_SUPPORTED_COLLEGES.length} colleges`,
    hi: `T&P डेमो ${TPO_SUPPORTED_COLLEGES.length} कॉलेजों के लिए उपलब्ध है`,
  }

  return (
    <Sheet open={open && !!d} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-white/10 bg-[#0d1117] p-0 text-white sm:max-w-[560px]"
      >
        {d && (
          <>
            <div className="relative overflow-hidden border-b border-white/10 px-5 pb-5 pt-6 sm:px-6">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/[0.10] blur-3xl" />
              <SheetHeader className="relative space-y-1.5 pr-8 text-left">
                <SheetTitle className="text-[22px] font-semibold leading-tight text-white">
                  {hiName ? (
                    <span lang="hi" className="font-deva">
                      {d.nameHi}
                    </span>
                  ) : (
                    d.name
                  )}
                  <span
                    lang={hiName ? undefined : 'hi'}
                    className={cn('ml-2 text-[15px] font-normal text-gray-400', !hiName && 'font-deva')}
                  >
                    {hiName ? d.name : d.nameHi}
                  </span>
                </SheetTitle>
                <SheetDescription asChild>
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden className="h-3.5 w-3.5" />
                      <Tr b={{ en: `${d.division} division`, hi: `${d.divisionHi} प्रमंडल` }} />
                    </span>
                    {d.aspirational && (
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-400/10 px-2 text-[12px] font-medium text-amber-200 ring-1 ring-amber-400/30">
                        <Landmark aria-hidden className="h-3 w-3" />
                        <Tr b={T.aspirational} />
                      </span>
                    )}
                    <Tr b={T.desc} className="w-full text-gray-500" />
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="relative mt-4 grid grid-cols-2 gap-2.5">
                <Stat icon={GraduationCap} label={T.pri}>
                  <span className="flex flex-wrap items-center gap-2">
                    <span style={{ color: bandClasses(d.pri).hex }}>{fmtNum(d.pri)}</span>
                    <span className="text-[12px] font-medium text-emerald-300">
                      {signed(priGain(d))} <Tr b={T.sinceBaseline} className="text-gray-500" />
                    </span>
                  </span>
                </Stat>
                <Stat icon={Users} label={T.assessed}>
                  {fmtIN(d.studentsAssessed)}
                </Stat>
                <Stat icon={TriangleAlert} label={T.atRisk}>
                  <span className="text-amber-200">{fmtIN(d.atRisk)}</span>
                </Stat>
                <Stat icon={Users} label={T.girls}>
                  {fmtPct(d.girlsPct)}
                </Stat>
              </div>
              <SimulatedNotice className="relative mt-3" />
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <section>
                <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  <Building2 aria-hidden className="h-3.5 w-3.5" />
                  <Tr b={T.institutions} /> <span className="tabular-nums text-gray-500">· {insts.length}</span>
                </h3>
                {insts.length === 0 && <Tr as="p" b={T.none} className="block text-[13px] text-gray-500" />}
                <ul className="space-y-2.5">
                  {insts.map((i, k) => {
                    const gain = priGain(i)
                    return (
                      <li
                        key={i.id}
                        style={{ animationDelay: `${k * 60}ms` }}
                        className="os-rise flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-[14px] font-medium text-white">{i.name}</span>
                            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[12px] text-gray-400">
                              <Tr b={i.type === 'GEC' ? T.gec : T.gp} />
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-400">
                            <BandBadge pri={i.pri} showValue />
                            <span className={cn('tabular-nums', gain >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                              {signed(gain)} <Tr b={T.sinceBaseline} className="text-gray-500" />
                            </span>
                            <span>
                              <Tr b={T.topGap} />: <Tr b={SKILL_LABEL[i.topGap]} className="text-gray-200" />
                            </span>
                          </div>
                        </div>
                        <Sparkline data={i.priTrend} width={84} height={30} stroke={bandClasses(i.pri).hex} className="shrink-0" />
                      </li>
                    )
                  })}
                </ul>
              </section>

              {rec && (
                <AISurface
                  title={
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles aria-hidden className="h-3.5 w-3.5 text-cyan-300" />
                      <Tr b={T.rec} />
                    </span>
                  }
                >
                  <StreamingText
                    key={`${d.id}-${lang}`}
                    text={rec}
                    className="whitespace-pre-line text-[14px] leading-relaxed text-gray-200"
                  />
                </AISurface>
              )}

              <div className="flex flex-wrap items-center gap-3 pb-2">
                {tpo ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      router.push(`/tpo?college=${encodeURIComponent(tpo.id)}`)
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 text-[14px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    <Tr b={T.openTpo} />
                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                        <button
                          type="button"
                          disabled
                          aria-disabled
                          className="pointer-events-none inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-semibold text-gray-500"
                        >
                          <Tr b={T.openTpo} />
                          <ArrowUpRight aria-hidden className="h-4 w-4" />
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Tr b={tpoTip} />
                    </TooltipContent>
                  </Tooltip>
                )}
                {tpo ? (
                  <span className="text-[12px] text-gray-500">{tpo.short}</span>
                ) : (
                  <Tr b={tpoTip} className="text-[12px] text-gray-500" />
                )}
              </div>
              <span className="sr-only">{t(T.desc)}</span>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
