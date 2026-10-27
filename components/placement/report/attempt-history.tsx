'use client'

// No fragments in this file: it imports recharts (react-is 18 under React 19 drops fragment children).
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { History, TrendingUp } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { PILLAR_KEYS, PILLAR_LABELS } from '@/lib/os/scoring'
import { daysBetween } from '@/lib/mock/state'
import type { Attempt, Pillars } from '@/lib/mock/types'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Attempt history', hi: 'प्रयासों का इतिहास', hinglish: 'Attempt history' },
  baseline: { en: 'Baseline set today', hi: 'आज बेसलाइन तय हुई', hinglish: 'Baseline aaj set hua' },
  baselineNote: {
    en: 'Your next Placement Day will draw the trend line from here.',
    hi: 'अगला प्लेसमेंट डे यहीं से प्रगति की रेखा बनाएगा।',
    hinglish: 'Agla Placement Day yahin se trend line banayega.',
  },
  band: { en: 'Interview-ready band (70+)', hi: 'इंटरव्यू-तैयार बैंड (70+)', hinglish: 'Interview-ready band (70+)' },
  pillar: { en: 'Pillar', hi: 'स्तंभ', hinglish: 'Pillar' },
  today: { en: 'Today', hi: 'आज', hinglish: 'Aaj' },
  change: { en: 'Change', hi: 'बदलाव', hinglish: 'Change' },
} satisfies Record<string, Bi>

interface Point {
  id: string
  x: string
  pri: number
  name: string
}

export interface AttemptHistoryProps {
  attempts: Attempt[]
  live: Pillars
  pri: number
}

export function AttemptHistory({ attempts, live, pri }: AttemptHistoryProps) {
  const { lang, t, lite } = useDemo()
  const dLang = lang === 'hi' ? 'hi' : 'en'
  const list = attempts.length ? attempts : []
  const first = list[0]
  const last = list[list.length - 1]
  const single = list.length < 2

  const data: Point[] = useMemo(
    () =>
      list.map((a, i) => ({
        id: a.id,
        x: fmtDate(a.date, dLang),
        pri: i === list.length - 1 ? pri : a.pri,
        name: t(a.label),
      })),
    [list, dLang, pri, t],
  )

  const delta = first ? pri - first.pri : 0
  const days = first && last ? daysBetween(first.date, last.date) : 0
  const minPri = data.reduce((m, d) => Math.min(m, d.pri), 100)
  const yMin = Math.max(0, Math.min(30, Math.floor((minPri - 10) / 10) * 10))

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={TXT.title} as="h2" className="text-[15px] font-semibold text-white" />
        </div>
        {single ? (
          <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] text-gray-200">
            <Tr b={TXT.baseline} />
          </span>
        ) : (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3 text-[13px] font-semibold text-emerald-200">
            <TrendingUp className="h-4 w-4" aria-hidden />
            <Tr
              b={{
                en: `+${delta} in ${days} days`,
                hi: `${days} दिनों में +${delta}`,
                hinglish: `${days} din mein +${delta}`,
              }}
            />
          </span>
        )}
      </div>

      {!single && (
        <p className="mt-1.5 text-[13px] text-gray-400">
          <span className="tabular-nums text-gray-200">{data.map((d) => d.pri).join(' → ')}</span>
          <span className="mx-1.5 text-gray-600">·</span>
          <Tr b={TXT.band} className="text-gray-500" />
        </p>
      )}

      <div className="mt-3 h-[220px] w-full sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 26, right: 16, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="ps-hist-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="55%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <ReferenceArea y1={70} y2={100} fill="#22d3ee" fillOpacity={0.06} stroke="#22d3ee" strokeOpacity={0.18} strokeDasharray="4 4" />
            <XAxis
              dataKey="x"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 28, right: 28 }}
            />
            <YAxis domain={[yMin, 100]} ticks={[yMin, 50, 70, 85, 100].filter((v, i, a) => a.indexOf(v) === i)} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
              contentStyle={{ background: '#11161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#e5e7eb' }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v: number, _n: string, item: { payload?: Point }) => [`PRI ${v}`, item?.payload?.name ?? '']}
            />
            <Line
              type="monotone"
              dataKey="pri"
              stroke="url(#ps-hist-line)"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0d1117', stroke: '#67e8f9', strokeWidth: 2.5 }}
              activeDot={{ r: 7, fill: '#34d399', stroke: '#0d1117', strokeWidth: 2 }}
              label={{ position: 'top', fill: '#f3f4f6', fontSize: 13, fontWeight: 600, offset: 12 }}
              isAnimationActive={!lite}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {single && (
        <p className="mt-1 text-center text-[12.5px] text-gray-500">
          <Tr b={TXT.baselineNote} />
        </p>
      )}

      {/* Per-pillar change, first attempt vs today */}
      <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.07]">
        <table className="w-full text-[13px]">
          <thead className="bg-white/[0.03] text-left text-[12px] uppercase tracking-[0.08em] text-gray-500">
            <tr>
              <th className="px-3 py-2 font-semibold">
                <Tr b={TXT.pillar} />
              </th>
              {!single && first && <th className="px-2 py-2 text-right font-semibold">{fmtDate(first.date, dLang)}</th>}
              <th className="px-2 py-2 text-right font-semibold">
                <Tr b={TXT.today} />
              </th>
              {!single && (
                <th className="px-3 py-2 text-right font-semibold">
                  <Tr b={TXT.change} />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {PILLAR_KEYS.map((k) => {
              const a = first?.pillars[k] ?? 0
              const b = live[k]
              const d = b - a
              return (
                <tr key={k} className="border-t border-white/[0.05]">
                  <td className="px-3 py-1.5 text-gray-200">
                    <Tr b={PILLAR_LABELS[k]} />
                  </td>
                  {!single && <td className="px-2 py-1.5 text-right text-gray-500">{a}</td>}
                  <td className="px-2 py-1.5 text-right font-medium text-white">{b}</td>
                  {!single && (
                    <td className={cn('px-3 py-1.5 text-right font-semibold', d > 0 ? 'text-emerald-300' : d < 0 ? 'text-rose-300' : 'text-gray-500')}>
                      {d > 0 ? `+${d}` : d === 0 ? '0' : String(d)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
