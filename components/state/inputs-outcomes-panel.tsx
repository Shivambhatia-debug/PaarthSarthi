'use client'

import { ArrowRight, FileText, Handshake, Sparkles } from 'lucide-react'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { PREVIEW, SOURCES } from '@/lib/mock/state'
import { PanelCard } from '@/components/state/title-strip'
import { cn } from '@/lib/utils'

const T = {
  title: { en: 'Inputs → Outcomes', hi: 'इनपुट → परिणाम' },
  sub: {
    en: 'Each programme linked to measured readiness',
    hi: 'हर कार्यक्रम मापी गई तैयारी से जुड़ा',
  },
  caption: { en: 'Your MoUs, now with measured outcomes.', hi: 'आपके MoU, अब मापे गए परिणामों के साथ।' },
  uplift: { en: 'PRI uplift vs non-participants', hi: 'गैर-प्रतिभागियों की तुलना में PRI बढ़त' },
  coverage: { en: 'coverage', hi: 'कवरेज' },
  reported: { en: 'As reported', hi: 'रिपोर्ट के अनुसार' },
  illustrative: { en: 'Illustrative', hi: 'सांकेतिक' },
  pending: { en: 'Outcome link after pilot', hi: 'पायलट के बाद परिणाम जुड़ेंगे' },
} satisfies Record<string, Bi>

export function InputsOutcomesPanel({ className, index = 0 }: { className?: string; index?: number }) {
  const rows = [PREVIEW.inputs.fsp, PREVIEW.inputs.st, PREVIEW.inputs.google, PREVIEW.inputs.coe]
  const maxUplift = Math.max(0, ...rows.map((r) => r.upliftPri ?? 0))

  return (
    <PanelCard
      index={index}
      className={className}
      icon={Handshake}
      accent="emerald"
      title={T.title}
      subtitle={T.sub}
      right={<IllustrativeChip responsive />}
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-gradient-to-r from-blue-500/[0.08] via-cyan-400/[0.06] to-emerald-400/[0.06] px-3 py-2.5">
        <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-cyan-300" />
        <Tr b={T.caption} className="text-[14px] font-semibold text-white" />
      </div>

      <ul className="space-y-2.5">
        {rows.map((r) => {
          const reported = r.tag === 'reported'
          const top = r.upliftPri != null && r.upliftPri === maxUplift && maxUplift > 0
          const share = r.total ? (r.value / r.total) * 100 : null
          return (
            <li
              key={r.id}
              className={cn(
                'grid grid-cols-1 items-center gap-3 rounded-xl border bg-white/[0.025] p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,13rem)]',
                top ? 'border-emerald-400/30' : 'border-white/10',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Tr b={r.label} className="text-[14px] font-medium text-white" />
                  <span
                    className={cn(
                      'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium ring-1',
                      reported ? 'bg-slate-400/10 text-slate-300 ring-slate-400/25' : 'bg-amber-400/10 text-amber-200 ring-amber-400/25',
                    )}
                  >
                    {reported && <FileText aria-hidden className="h-3 w-3" />}
                    <Tr b={reported ? T.reported : T.illustrative} />
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[13px] text-gray-400">
                  <span className="text-[18px] font-semibold tabular-nums text-gray-100">
                    {fmtIN(r.value)}
                    {r.total ? <span className="text-gray-500"> / {fmtIN(r.total)}</span> : null}
                    {reported ? '+' : ''}
                  </span>
                  <Tr b={r.unit} />
                </div>
                {share != null && (
                  <div className="mt-1.5 h-1.5 max-w-[220px] overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${Math.min(100, share)}%` }} />
                  </div>
                )}
              </div>
              <ArrowRight aria-hidden className="hidden h-4 w-4 text-gray-600 sm:block" />
              <div className="min-w-0">
                {r.upliftPri != null ? (
                  <div>
                    <span
                      className={cn(
                        'text-[22px] font-semibold tabular-nums',
                        top ? 'bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent' : 'text-emerald-300',
                      )}
                    >
                      +{fmtNum(r.upliftPri)}
                    </span>
                    <Tr as="p" b={T.uplift} className="block text-[12px] leading-snug text-gray-500" />
                  </div>
                ) : share != null ? (
                  <div>
                    <span className="text-[22px] font-semibold tabular-nums text-cyan-200">{fmtNum(share, 0)}%</span>
                    <Tr as="p" b={T.coverage} className="block text-[12px] text-gray-500" />
                  </div>
                ) : (
                  <Tr as="p" b={T.pending} className="block text-[12.5px] text-gray-500" />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[12px] text-gray-500">
        <Tr b={{ en: 'Centres of Excellence figure:', hi: 'सेंटर ऑफ़ एक्सीलेंस आँकड़ा:' }} /> {SOURCES.budget.label}
      </p>
    </PanelCard>
  )
}
