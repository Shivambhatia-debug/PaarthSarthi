'use client'

// No fragments in this file: it imports recharts (react-is 18 under React 19 drops fragment children).
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Radar as RadarIcon } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { tr, type Bi, type Lang } from '@/lib/os/i18n'
import { PILLAR_KEYS, PILLAR_LABELS, PILLAR_WEIGHTS } from '@/lib/os/scoring'
import type { PillarKey, Pillars } from '@/lib/mock/types'
import { Tr } from '@/components/os/tr-text'
import { COHORT_AVG, PILLAR_SHORT } from '@/components/placement/report/report-data'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Seven pillars vs Bihar cohort', hi: 'सात स्तंभ बनाम बिहार कोहोर्ट', hinglish: 'Saat pillars vs Bihar cohort' },
  you: { en: 'You (today)', hi: 'आप (आज)', hinglish: 'Aap (aaj)' },
  cohort: { en: 'Cohort average', hi: 'कोहोर्ट औसत', hinglish: 'Cohort average' },
  weight: { en: 'weight', hi: 'भार', hinglish: 'weight' },
} satisfies Record<string, Bi>

interface Row {
  key: PillarKey
  axis: string
  you: number
  cohort: number
  weight: number
  name: string
}

function RadarTip({ active, payload, lang }: { active?: boolean; payload?: { payload?: Row }[]; lang: Lang }): ReactNode {
  const row = active && payload && payload[0]?.payload
  if (!row) return null
  const diff = row.you - row.cohort
  return (
    <div className="rounded-lg border border-white/10 bg-[#11161f] px-3 py-2 text-[12px] text-gray-200 shadow-xl">
      <p className="font-semibold text-white">{row.name}</p>
      <p className="mt-1 tabular-nums">
        <span className="text-cyan-300">{tr(TXT.you, lang)}: {row.you}</span>
        <span className="mx-1.5 text-gray-600">·</span>
        <span className="text-gray-400">
          {tr(TXT.cohort, lang)}: {row.cohort}
        </span>
      </p>
      <p className="mt-0.5 tabular-nums text-gray-400">
        {tr(TXT.weight, lang)} {row.weight}%
        <span className={cn('ml-2 font-semibold', diff >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
          {diff >= 0 ? `+${diff}` : diff}
        </span>
      </p>
    </div>
  )
}

const LG_QUERY = '(min-width: 1024px)'
function subscribeLg(cb: () => void) {
  try {
    const mq = window.matchMedia(LG_QUERY)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  } catch {
    return () => {}
  }
}
function isLgNow() {
  try {
    return window.matchMedia(LG_QUERY).matches
  } catch {
    return false
  }
}

export function PillarRadar({ live }: { live: Pillars }) {
  const { lang, lite } = useDemo()
  // Projector (lg+): the radar fills the card with bigger labels; phones keep the compact chart.
  const lg = useSyncExternalStore(subscribeLg, isLgNow, () => false)
  const data: Row[] = useMemo(
    () =>
      PILLAR_KEYS.map((k) => ({
        key: k,
        axis: tr(PILLAR_SHORT[k], lang),
        you: live[k],
        cohort: COHORT_AVG[k],
        weight: PILLAR_WEIGHTS[k],
        name: tr(PILLAR_LABELS[k], lang),
      })),
    [live, lang],
  )
  const above = data.filter((d) => d.you >= d.cohort)
  const below = data.filter((d) => d.you < d.cohort)
  const deva = lang === 'hi'

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <RadarIcon className="h-4 w-4 text-cyan-300" aria-hidden />
        <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
      </div>
      <p className="mt-1.5 text-[13px] text-gray-400">
        <Tr
          b={{
            en: `Above the cohort on ${above.length} of ${data.length} pillars`,
            hi: `${data.length} में से ${above.length} स्तंभों पर कोहोर्ट से ऊपर`,
            hinglish: `${data.length} mein se ${above.length} pillars par cohort se upar`,
          }}
        />
        {below.length > 0 && (
          <span className="text-rose-300/90">
            {' · '}
            <Tr
              b={{
                en: `below on ${below.map((b) => b.name).join(', ')}`,
                hi: `नीचे: ${below.map((b) => b.name).join(', ')}`,
                hinglish: `neeche: ${below.map((b) => b.name).join(', ')}`,
              }}
            />
          </span>
        )}
      </p>

      <div lang={deva ? 'hi' : undefined} className={cn('mt-2 h-[260px] w-full sm:h-[290px] lg:h-auto lg:min-h-[360px] lg:flex-1', deva && 'font-deva')}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={lg ? '80%' : '70%'} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="rgba(255,255,255,0.09)" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#cbd5e1', fontSize: lg ? 13 : 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="cohort"
              dataKey="cohort"
              stroke="#94a3b8"
              strokeDasharray="4 3"
              fill="#64748b"
              fillOpacity={0.14}
              isAnimationActive={!lite}
              animationDuration={700}
            />
            <Radar
              name="you"
              dataKey="you"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="#22d3ee"
              fillOpacity={0.24}
              dot={{ r: 3, fill: '#67e8f9', strokeWidth: 0 }}
              isAnimationActive={!lite}
              animationDuration={900}
            />
            <Tooltip content={(p: { active?: boolean; payload?: { payload?: Row }[] }) => <RadarTip active={p.active} payload={p.payload} lang={lang} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-center gap-4 pt-2 text-[12.5px] text-gray-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" aria-hidden />
          <Tr b={TXT.you} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-slate-400" aria-hidden />
          <Tr b={TXT.cohort} />
        </span>
        <span className="text-[12px] text-gray-500">
          <Tr b={{ en: 'Hover a pillar for its weight', hi: 'भार देखने के लिए स्तंभ पर जाएँ', hinglish: 'Weight dekhne ke liye pillar par hover kijiye' }} />
        </span>
      </div>
    </section>
  )
}
