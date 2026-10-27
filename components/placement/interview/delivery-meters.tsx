'use client'

import type { ReactNode } from 'react'
import { Activity, Eye, Gauge, MessageCircle, PauseCircle, Timer } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import type { Meters } from '@/components/placement/interview/use-interview-engine'
import { cn } from '@/lib/utils'

const L = {
  title: { en: 'Delivery analytics', hi: 'डिलीवरी एनालिटिक्स', hinglish: 'Delivery analytics' },
  live: { en: 'live', hi: 'लाइव', hinglish: 'live' },
  result: { en: 'this answer', hi: 'यह उत्तर', hinglish: 'yeh answer' },
  last: { en: 'last answer', hi: 'पिछला उत्तर', hinglish: 'pichhla answer' },
  none: { en: 'waiting', hi: 'प्रतीक्षा', hinglish: 'waiting' },
  pace: { en: 'Pace (words / min)', hi: 'गति (शब्द / मिनट)', hinglish: 'Pace (words / min)' },
  band: { en: 'Target 130–160', hi: 'लक्ष्य 130–160', hinglish: 'Target 130–160' },
  fillers: { en: 'Fillers', hi: 'फ़िलर शब्द', hinglish: 'Fillers' },
  noFillers: { en: 'None yet', hi: 'अभी कोई नहीं', hinglish: 'Abhi koi nahi' },
  fillerNote: {
    en: 'Hindi particles like तो, ना, अच्छा are not counted.',
    hi: 'तो, ना, अच्छा जैसे शब्द फ़िलर नहीं गिने जाते।',
    hinglish: 'तो, ना, अच्छा jaise particles filler nahi gine jaate.',
  },
  pauses: { en: 'Pauses > 2 s', hi: '2 सेकंड से लंबे रुकाव', hinglish: 'Pauses > 2 s' },
  latency: { en: 'First word', hi: 'पहला शब्द', hinglish: 'First word' },
  confidence: { en: 'Confidence', hi: 'आत्मविश्वास', hinglish: 'Confidence' },
  heuristic: { en: 'heuristic', hi: 'अनुमानित', hinglish: 'heuristic' },
  eye: { en: 'Eye contact', hi: 'आई कॉन्टैक्ट', hinglish: 'Eye contact' },
  estimate: { en: 'estimate', hi: 'अनुमान', hinglish: 'estimate' },
  talk: { en: 'Talk ratio', hi: 'बोलने का अनुपात', hinglish: 'Talk ratio' },
  you: { en: 'You', hi: 'आप', hinglish: 'Aap' },
  sarthi: { en: 'Sarthi', hi: 'सारथी', hinglish: 'Sarthi' },
} satisfies Record<string, Bi>

const W_MIN = 60
const W_MAX = 220

/** Point on the gauge arc for a WPM value (semicircle, left = W_MIN, right = W_MAX). */
function pt(wpm: number, r: number, cx = 80, cy = 78) {
  const f = (Math.max(W_MIN, Math.min(W_MAX, wpm)) - W_MIN) / (W_MAX - W_MIN)
  const a = Math.PI * (1 - f)
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}

function arc(from: number, to: number, r: number) {
  const a = pt(from, r)
  const b = pt(to, r)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

function WpmGauge({ wpm }: { wpm: number }) {
  const has = wpm > 0
  const inBand = wpm >= 130 && wpm <= 160
  const needle = pt(has ? wpm : W_MIN, 52)
  const tone = !has ? 'text-gray-500' : inBand ? 'text-emerald-300' : wpm < 130 ? 'text-amber-300' : 'text-rose-300'
  return (
    <div className="relative mx-auto w-full max-w-[200px]">
      <svg viewBox="0 0 160 92" className="w-full" role="img" aria-label={has ? `${wpm} words per minute` : 'No pace yet'}>
        <defs>
          <linearGradient id="iv-wpm-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path d={arc(W_MIN, W_MAX, 62)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" strokeLinecap="round" />
        <path d={arc(130, 160, 62)} fill="none" stroke="rgba(52,211,153,0.28)" strokeWidth="10" />
        {has && (
          <path
            d={arc(W_MIN, wpm, 62)}
            fill="none"
            stroke="url(#iv-wpm-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        )}
        <line
          x1="80"
          y1="78"
          x2={needle.x.toFixed(2)}
          y2={needle.y.toFixed(2)}
          stroke={has ? '#e5e7eb' : 'rgba(255,255,255,0.2)'}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: 'all 500ms ease-out' }}
        />
        <circle cx="80" cy="78" r="4" fill={has ? '#e5e7eb' : 'rgba(255,255,255,0.25)'} />
        <text x="14" y="90" fill="#6b7280" fontSize="9" textAnchor="middle">
          {W_MIN}
        </text>
        <text x="146" y="90" fill="#6b7280" fontSize="9" textAnchor="middle">
          {W_MAX}
        </text>
      </svg>
      <div className="-mt-1 text-center">
        <span className={cn('text-2xl font-bold tabular-nums', tone)}>{has ? wpm : '—'}</span>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
  sub,
  className = 'py-2',
}: {
  icon: ReactNode
  label: Bi
  sub?: Bi
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-2 text-[13px] text-gray-300">
        <span className="shrink-0 text-gray-500">{icon}</span>
        <Tr b={label} className="truncate" />
        {sub && (
          <span className="shrink-0 rounded border border-white/10 px-1 text-[12px] leading-[18px] text-gray-500">
            <Tr b={sub} />
          </span>
        )}
      </div>
      <div className="shrink-0 text-right text-[14px] font-semibold tabular-nums text-white">{children}</div>
    </div>
  )
}

export function DeliveryMeters({ meters, className }: { meters: Meters; className?: string }) {
  const fillerEntries = Object.entries(meters.fillers.byWord).sort((a, b) => b[1] - a[1])
  const conf = meters.confidence
  const ratio = meters.talkRatio
  const youPct = ratio == null ? null : Math.round(ratio * 100)
  const status = L[meters.from]

  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', className)} aria-label="Delivery analytics">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={L.title} as="h3" className="text-[13px] font-semibold text-gray-100" />
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium',
            meters.from === 'live' ? 'bg-rose-500/15 text-rose-200' : 'bg-white/[0.05] text-gray-400',
          )}
        >
          {meters.from === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" aria-hidden />}
          <Tr b={status} />
        </span>
      </div>

      {/* Pace gauge */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117]/50 px-3 pb-2 pt-3">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
            <Tr b={L.pace} />
          </span>
          <span className="text-emerald-300/80">
            <Tr b={L.band} />
          </span>
        </div>
        <WpmGauge wpm={meters.wpm} />
      </div>

      {/* Fillers */}
      <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#0d1117]/50 p-3">
        <div className="flex items-center justify-between">
          <Tr b={L.fillers} className="text-[13px] text-gray-300" />
          <span className={cn('text-xl font-bold tabular-nums', meters.fillers.total > 0 ? 'text-amber-300' : 'text-gray-200')}>
            {meters.fillers.total}
          </span>
        </div>
        <div className="mt-2 flex min-h-[26px] flex-wrap gap-1.5">
          {fillerEntries.length === 0 ? (
            <Tr b={L.noFillers} className="text-[12px] text-gray-500" />
          ) : (
            fillerEntries.map(([w, n]) => (
              <span
                key={w}
                className="animate-in zoom-in-75 fade-in inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[12px] text-amber-200 duration-300"
              >
                <Tr b={w} />
                <span className="tabular-nums text-amber-300/80">×{n}</span>
              </span>
            ))
          )}
        </div>
        <Tr b={L.fillerNote} as="p" className="mt-2 text-[12px] leading-snug text-gray-500" />
      </div>

      <div className="mt-2 divide-y divide-white/[0.06]">
        <Row icon={<PauseCircle className="h-3.5 w-3.5" />} label={L.pauses}>
          {meters.pauses}
        </Row>
        <Row icon={<Timer className="h-3.5 w-3.5" />} label={L.latency}>
          {meters.firstLatencyMs == null ? '—' : `${(meters.firstLatencyMs / 1000).toFixed(1)} s`}
        </Row>
        <div className="py-2">
          <Row icon={<Gauge className="h-3.5 w-3.5" />} label={L.confidence} sub={L.heuristic} className="pb-1.5">
            {conf == null ? '—' : conf}
          </Row>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 transition-[width] duration-500"
              style={{ width: `${conf ?? 0}%` }}
            />
          </div>
        </div>
        <Row icon={<Eye className="h-3.5 w-3.5" />} label={L.eye} sub={L.estimate}>
          {meters.eyeContact}%
        </Row>
        <div className="py-2">
          <Row icon={<MessageCircle className="h-3.5 w-3.5" />} label={L.talk} className="pb-1.5">
            {youPct == null ? '—' : `${youPct}%`}
          </Row>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full bg-emerald-400/80 transition-[width] duration-500" style={{ width: `${youPct ?? 0}%` }} />
            <div
              className="h-full bg-violet-400/60 transition-[width] duration-500"
              style={{ width: `${youPct == null ? 0 : 100 - youPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              <Tr b={L.you} />
            </span>
            <span className="flex items-center gap-1">
              <Tr b={L.sarthi} />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
