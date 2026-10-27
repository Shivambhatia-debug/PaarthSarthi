'use client'

import { Award, Check, Languages, ListChecks } from 'lucide-react'
import { useDemo, type RoundState, type RoundStatus } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { INTERVIEW_SPLIT, ROUNDS, ROUND_TARGETS, VERSANT_TARGETS, formatRoundScore, type RoundId } from '@/lib/os/rounds'
import { interviewPillar } from '@/lib/os/scoring'
import { isCoreBlueprint } from '@/lib/mock/blueprints'
import { Tr } from '@/components/os/tr-text'
import { OVERALL_RANK, ROUND_CUTOFF, ROUND_TOP_PCT } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Round-by-round', hi: 'राउंड-दर-राउंड', hinglish: 'Round-by-round' },
  round: { en: 'Round', hi: 'राउंड', hinglish: 'Round' },
  score: { en: 'Score', hi: 'स्कोर', hinglish: 'Score' },
  cutoff: { en: 'Cutoff', hi: 'कटऑफ़', hinglish: 'Cutoff' },
  status: { en: 'Status', hi: 'स्थिति', hinglish: 'Status' },
  rank: { en: 'Percentile', hi: 'पर्सेंटाइल', hinglish: 'Percentile' },
  advisory: { en: 'advisory for this drive', hi: 'इस ड्राइव के लिए सलाहकारी', hinglish: 'is drive ke liye advisory' },
  demoNote: {
    en: 'Percentiles are simulated against the illustrative Bihar cohort.',
    hi: 'पर्सेंटाइल उदाहरणात्मक बिहार कोहोर्ट के सापेक्ष सिम्युलेटेड हैं।',
    hinglish: 'Percentiles illustrative Bihar cohort ke against simulated hain.',
  },
} satisfies Record<string, Bi>

const STATUS: Record<RoundStatus, { label: Bi; cls: string }> = {
  cleared: { label: { en: 'Cleared', hi: 'पास' }, cls: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200' },
  flagged: { label: { en: 'Flagged', hi: 'फ़्लैग' }, cls: 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200' },
  eliminated: { label: { en: 'Eliminated', hi: 'बाहर' }, cls: 'border-rose-400/30 bg-rose-400/[0.08] text-rose-200' },
  live: { label: { en: 'In progress', hi: 'जारी' }, cls: 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200' },
  locked: { label: { en: 'Not taken', hi: 'नहीं दिया' }, cls: 'border-white/10 bg-white/[0.03] text-gray-400' },
}

/** Below an advisory (non-eliminating) cutoff, e.g. Communication in a core drive: never shown as 'Cleared'. */
const ADVISORY_STATUS: { label: Bi; cls: string } = {
  label: { en: 'Advisory', hi: 'सलाहकारी' },
  cls: 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200',
}

/** A round with no recorded score falls back to today's attempt (persona targets), so the report renders cold. */
function effectiveRound(id: RoundId, rs: RoundState | undefined, personaId: 'priya' | 'rahul'): RoundState {
  const hasScore = typeof rs?.score === 'number' || rs?.detail?.versant !== undefined
  if (rs && hasScore && rs.status !== 'locked' && rs.status !== 'live') return rs
  const base: RoundState = { status: 'cleared', score: ROUND_TARGETS[personaId][id] }
  if (id === 'communication') base.detail = { versant: VERSANT_TARGETS[personaId] }
  return base
}

export function RoundTable() {
  const { rounds, personaId, persona, blueprint, includeGd } = useDemo()
  const core = isCoreBlueprint(blueprint?.id)
  const showGd = includeGd || rounds?.gd?.status === 'cleared'
  const list = ROUNDS.filter((r) => r.id !== 'gd' || showGd)
  const elig = blueprint?.eligibility
  const rank = OVERALL_RANK[personaId]

  const eligText =
    persona.kind === 'polytechnic'
      ? `Diploma ≥ ${elig?.minDiplomaPct ?? 60}% · ${elig?.maxActiveBacklogs ?? 0} backlogs`
      : `CGPA ≥ ${elig?.minCgpa ?? 6.5} · ${elig?.maxActiveBacklogs ?? 0} backlogs`

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
        </div>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-400/30 bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-emerald-400/10 px-3 text-[12.5px] font-semibold text-cyan-100">
          <Award className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr
            b={{
              en: `Top ${rank.topPct}% in ${rank.cohort.en}`,
              hi: `${rank.cohort.hi} में शीर्ष ${rank.topPct}%`,
              hinglish: `${rank.cohort.en} mein Top ${rank.topPct}%`,
            }}
          />
        </span>
      </div>

      <div className="-mx-1 mt-3 overflow-x-auto px-1">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-gray-500">
              <th className="pb-2 pr-2 font-semibold">
                <Tr b={TXT.round} />
              </th>
              <th className="pb-2 pr-2 text-right font-semibold">
                <Tr b={TXT.score} />
              </th>
              <th className="hidden pb-2 pr-2 font-semibold sm:table-cell">
                <Tr b={TXT.cutoff} />
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <Tr b={TXT.status} />
              </th>
              <th className="hidden pb-2 text-right font-semibold sm:table-cell">
                <Tr b={TXT.rank} />
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const rs = effectiveRound(r.id, rounds?.[r.id], personaId)
              const cut = ROUND_CUTOFF[r.id]
              const top = ROUND_TOP_PCT[personaId]?.[r.id]
              const isComm = r.id === 'communication'
              const commScore = isComm ? Number(rs.detail?.versant ?? rs.score) : NaN
              const belowAdvisory = isComm && core && cut !== undefined && Number.isFinite(commScore) && commScore < cut
              const st = belowAdvisory ? ADVISORY_STATUS : (STATUS[rs.status] ?? STATUS.cleared)
              return (
                <tr key={r.id} className="border-t border-white/[0.06] align-middle">
                  <td className="py-2.5 pr-2">
                    <Tr b={r.label} className="font-medium text-gray-100" />
                  </td>
                  <td className="py-2.5 pr-2 text-right text-[14px] font-semibold tabular-nums text-white">
                    {r.id === 'eligibility' ? (
                      <Check className="ml-auto h-4 w-4 text-emerald-300" aria-label="Eligible" />
                    ) : (
                      formatRoundScore(r.id, rs)
                    )}
                    {r.id !== 'eligibility' && cut !== undefined && (
                      <span className="block text-[12px] font-normal text-gray-500 sm:hidden">
                        <Tr b={TXT.cutoff} /> {isComm ? `${cut}/80` : cut}
                      </span>
                    )}
                  </td>
                  <td className="hidden py-2.5 pr-2 text-gray-400 sm:table-cell">
                    {r.id === 'eligibility' ? (
                      <span className="text-[12.5px]">{eligText}</span>
                    ) : isComm ? (
                      <span className="flex flex-col gap-1">
                        <span className="tabular-nums">{cut}/80</span>
                        {core && (
                          <span className="w-fit rounded-md border border-amber-400/30 bg-amber-400/[0.07] px-1.5 py-0.5 text-[12px] leading-tight text-amber-200">
                            <Tr b={TXT.advisory} />
                          </span>
                        )}
                      </span>
                    ) : cut !== undefined ? (
                      <span className="tabular-nums">{cut}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 pr-2">
                    <span className={cn('inline-flex h-6 items-center rounded-full border px-2 text-[12px] font-medium', st.cls)}>
                      <Tr b={st.label} />
                    </span>
                  </td>
                  <td className="hidden py-2.5 text-right tabular-nums text-gray-300 sm:table-cell">{top !== undefined ? `Top ${top}%` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-auto pt-3 text-[12px] text-gray-500">
        <Tr b={TXT.demoNote} />
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Language-fair scoring card (INTERVIEW_SPLIT)
// ---------------------------------------------------------------------------

export function LanguageFair() {
  const { rounds, personaId, persona } = useDemo()
  const split = INTERVIEW_SPLIT[personaId]
  const d = rounds?.techInterview?.detail
  const content = typeof d?.content === 'number' ? d.content : split.content
  const delivery = typeof d?.delivery === 'number' ? d.delivery : split.delivery
  const pillar = interviewPillar(content, delivery)

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/[0.08] blur-3xl" />
      <div className="relative flex items-center gap-2">
        <Languages className="h-4 w-4 text-emerald-300" aria-hidden />
        <Tr b={{ en: 'Language-fair scoring', hi: 'भाषा-निष्पक्ष स्कोरिंग', hinglish: 'Language-fair scoring' }} as="h2" className="text-[15px] font-semibold text-white" />
      </div>
      <p className="relative mt-1.5 text-[13px] leading-snug text-gray-400">
        <Tr
          b={{
            en: `Technical interview: content and English delivery are scored separately → pillar ${pillar}.`,
            hi: `तकनीकी इंटरव्यू: कंटेंट और अंग्रेज़ी डिलीवरी अलग-अलग स्कोर → स्तंभ ${pillar}।`,
            hinglish: `Technical interview: content aur English delivery alag score hote hain → pillar ${pillar}.`,
          }}
        />
      </p>

      <div className="relative mt-4 space-y-4">
        <Bar
          label={{ en: 'Technical content', hi: 'तकनीकी कंटेंट', hinglish: 'Technical content' }}
          tag={{ en: 'language-neutral', hi: 'भाषा-निरपेक्ष', hinglish: 'language-neutral' }}
          value={content}
          weight={70}
          tone="emerald"
        />
        <Bar
          label={{ en: 'English delivery', hi: 'अंग्रेज़ी डिलीवरी', hinglish: 'English delivery' }}
          tag={{ en: 'scored separately', hi: 'अलग से स्कोर', hinglish: 'alag se score' }}
          value={delivery}
          weight={30}
          tone="amber"
        />
      </div>

      <div className="relative mt-auto pt-4">
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-[13px] leading-snug text-emerald-100">
          <Tr
            b={
              persona.medium === 'Hindi'
                ? {
                    en: 'Hindi-medium students are never marked down for knowledge.',
                    hi: 'हिंदी-माध्यम के छात्रों के ज्ञान के अंक कभी नहीं कटते।',
                    hinglish: 'Hindi-medium students ke knowledge ke marks kabhi nahi katte.',
                  }
                : {
                    en: 'Knowledge is never marked down for the language it is spoken in.',
                    hi: 'ज्ञान के अंक कभी भाषा के कारण नहीं कटते।',
                  }
            }
          />
        </p>
      </div>
    </section>
  )
}

function Bar({ label, tag, value, weight, tone }: { label: Bi; tag: Bi; value: number; weight: number; tone: 'emerald' | 'amber' }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <span className="text-[13.5px] font-medium text-gray-100">
          <Tr b={label} />
          <span className="ml-1.5 text-[12px] font-normal text-gray-500">
            (<Tr b={tag} />)
          </span>
        </span>
        <span className="text-[15px] font-semibold tabular-nums text-white">
          {value}
          <span className="ml-1 text-[12px] font-normal text-gray-500">× {weight}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', tone === 'emerald' ? 'from-cyan-400 to-emerald-400' : 'from-amber-500 to-amber-300')}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
