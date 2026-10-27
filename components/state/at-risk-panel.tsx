'use client'

import { useMemo, useState } from 'react'
import { BellRing, ChevronDown, ShieldAlert, UserCheck } from 'lucide-react'
import { SimulatedNotice } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { aiToast } from '@/components/ai/ai-toast'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, type Bi } from '@/lib/os/i18n'
import { PREVIEW } from '@/lib/mock/state'
import { PanelCard } from '@/components/state/title-strip'
import { AT_RISK_AGG, MIN_CELL, atRiskCohort, atRiskHeadline, atRiskLabel } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  title: { en: 'At-risk cohorts (anonymised)', hi: 'जोखिम वाले समूह (अनाम)' },
  sub: {
    en: 'Division-level cohorts · no names · minimum cell size applies',
    hi: 'प्रमंडल-स्तर के समूह · कोई नाम नहीं · न्यूनतम सेल आकार लागू',
  },
  cohort: { en: 'Cohort', hi: 'समूह' },
  below: { en: 'PRI below 50', hi: 'PRI 50 से कम' },
  students: { en: 'Students', hi: 'छात्र' },
  notify: { en: 'Notify TPO', hi: 'TPO को सूचित करें' },
  notified: { en: 'Notified', hi: 'सूचित' },
  more: { en: 'Show all cohorts', hi: 'सभी समूह दिखाएँ' },
  less: { en: 'Show fewer', hi: 'कम दिखाएँ' },
  vsk: { en: 'Gujarat VSK-style early warning', hi: 'गुजरात VSK-शैली प्रारंभिक चेतावनी' },
} satisfies Record<string, Bi>

const VISIBLE = 6

export function AtRiskPanel({ className, index = 0 }: { className?: string; index?: number }) {
  const { t, lang } = useDemo()
  const L = lang === 'hi' ? 'hi' : 'en'
  const rows = useMemo(
    () => AT_RISK_AGG.filter((r) => r.count >= MIN_CELL).sort((a, b) => b.pctBelow50 - a.pctBelow50 || b.count - a.count),
    [],
  )
  const [all, setAll] = useState(false)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const shown = all ? rows : rows.slice(0, VISIBLE)
  const mentoredPct = PREVIEW.atRisk > 0 ? (PREVIEW.atRiskMentored / PREVIEW.atRisk) * 100 : 0

  return (
    <PanelCard
      index={index}
      className={className}
      icon={ShieldAlert}
      accent="amber"
      title={T.title}
      subtitle={T.sub}
      right={
        <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12px] text-gray-300">
          <Tr b={{ en: `Minimum cell ${MIN_CELL}`, hi: `न्यूनतम सेल ${MIN_CELL}` }} />
        </span>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.08] to-transparent p-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25">
          <UserCheck aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p lang={L} className={cn('text-[16px] font-semibold leading-snug text-white', L === 'hi' && 'font-deva')}>
            {atRiskHeadline(L)}
          </p>
          <Tr as="p" b={T.vsk} className="mt-0.5 block text-[12px] text-amber-200/70" />
        </div>
        <div className="w-full max-w-[220px] sm:w-56">
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" style={{ width: `${Math.min(100, mentoredPct)}%` }} />
          </div>
          <p className="mt-1 text-[12px] tabular-nums text-gray-400">
            <Tr b={{ en: `${Math.round(mentoredPct)}% assigned a mentor`, hi: `${Math.round(mentoredPct)}% को मेंटर मिला` }} />
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[620px] border-collapse text-[13px]">
          <thead className="bg-white/[0.03]">
            <tr className="border-b border-white/10 text-left text-[12px] text-gray-400">
              <th scope="col" className="px-3 py-2.5 font-medium">
                <Tr b={T.cohort} />
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                <Tr b={T.below} />
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                <Tr b={T.students} />
              </th>
              <th scope="col" className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const done = !!sent[r.id]
              return (
                <tr key={r.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]" title={atRiskLabel(r, L)}>
                  <td className="px-3 py-2.5">
                    <span lang={L} className={cn('text-gray-200', L === 'hi' && 'font-deva')}>
                      {atRiskCohort(r, L)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.07]">
                        <span
                          className={cn('block h-full rounded-full', r.pctBelow50 >= 55 ? 'bg-rose-400/80' : 'bg-amber-400/80')}
                          style={{ width: `${Math.min(100, r.pctBelow50)}%` }}
                        />
                      </span>
                      <span className="tabular-nums text-gray-200">{r.pctBelow50}%</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white">{fmtIN(r.count)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => {
                        setSent((s) => ({ ...s, [r.id]: true }))
                        aiToast(lang === 'hi' ? `${r.institutions} संस्थानों के TPO को सूचना भेजी गई` : `Sent to ${r.institutions} TPO${r.institutions === 1 ? '' : 's'}`, {
                          tone: 'ok',
                          description: atRiskCohort(r, L),
                        })
                      }}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
                        done
                          ? 'cursor-default bg-emerald-400/10 text-emerald-300'
                          : 'border border-white/10 bg-white/[0.04] text-gray-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white',
                      )}
                    >
                      <BellRing aria-hidden className="h-3.5 w-3.5" />
                      <Tr b={done ? T.notified : T.notify} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[12.5px] text-cyan-200 hover:bg-white/[0.05]"
        >
          <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform', all && 'rotate-180')} />
          <Tr b={all ? T.less : T.more} />
          <span className="tabular-nums text-gray-500">({rows.length})</span>
        </button>
      )}
      <SimulatedNotice className="mt-3" text={{ en: "Anonymised cohorts · illustrative data", hi: "अनाम समूह · सांकेतिक डेटा" }} />
      <span className="sr-only">{t(T.sub)}</span>
    </PanelCard>
  )
}
