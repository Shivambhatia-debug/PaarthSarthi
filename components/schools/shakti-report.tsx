'use client'

import { useId, useRef, useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { ChevronDown, Info, Printer, Sparkles, UserCheck, Zap } from 'lucide-react'
import { useDemoEvent } from '@/lib/os/demo-store'
import { fmtDate, isDevanagari, type Bi } from '@/lib/os/i18n'
import { DEMO_TODAY } from '@/lib/mock/state'
import { NUSRAT, NUSRAT_PROFILE } from '@/lib/mock/personas'
import { printOnly } from '@/lib/os/print'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { ScoreRing } from '@/components/ai/score-ring'
import { CountUp } from '@/components/ai/count-up'
import { cn } from '@/lib/utils'
import {
  APT_DISTRICT_AVG,
  APT_KEYS,
  APT_LABELS,
  APT_STATE_AVG,
  PATHS,
  REPORT_CONFIDENCE,
  RIASEC_KEYS,
  RIASEC_LABELS,
  SCHOOL_NAME,
  reportEvidence,
  strengthsFor,
} from '@/components/schools/school-data'
import { GhostButton, StepHeading, StepNav, T, useSchool } from '@/components/schools/school-shell'
import { useEffect } from 'react'

const UI = {
  title: { en: 'My Shakti Report', hi: 'मेरी शक्ति रिपोर्ट' } as Bi,
  sub: { en: 'Your interests and strengths at a glance', hi: 'आपकी रुचियाँ और ताकतें, एक नज़र में' } as Bi,
  share: { en: 'Share with parent', hi: 'अभिभावक से साझा करें' } as Bi,
  shareHint: { en: 'Print, or save as PDF for WhatsApp', hi: 'प्रिंट करें, या PDF बनाकर WhatsApp पर भेजें' } as Bi,
  radar: { en: 'Interest map (RIASEC)', hi: 'रुचि का नक्शा (RIASEC)' } as Bi,
  code: { en: 'Your top two interests', hi: 'आपकी दो सबसे बड़ी रुचियाँ' } as Bi,
  apt: { en: 'Abilities vs district and state', hi: 'क्षमता: ज़िले और राज्य से तुलना' } as Bi,
  you: { en: 'You', hi: 'आप' } as Bi,
  district: { en: 'District avg.', hi: 'ज़िला औसत' } as Bi,
  state: { en: 'State avg.', hi: 'राज्य औसत' } as Bi,
  illus: { en: 'Illustrative comparison · pilot data', hi: 'उदाहरणात्मक तुलना · पायलट डेटा' } as Bi,
  saw: { en: 'What Sarthi AI noticed', hi: 'सारथी AI ने क्या देखा' } as Bi,
  why: { en: 'Why?', hi: 'क्यों?' } as Bi,
  evidence: { en: 'Evidence', hi: 'आधार' } as Bi,
  confidence: { en: 'Confidence', hi: 'विश्वसनीयता' } as Bi,
  review: { en: 'Human review: school counsellor', hi: 'मानवीय समीक्षा: स्कूल काउंसलर' } as Bi,
  topMatch: { en: 'Best-matching path', hi: 'सबसे मेल खाता रास्ता' } as Bi,
  fit: { en: 'fit %', hi: 'मेल %' } as Bi,
  footer: {
    en: 'Illustrative demo data · Advice only: the decision is yours and your family’s',
    hi: 'उदाहरणात्मक डेमो डेटा · यह केवल सलाह है: फ़ैसला आपका और आपके परिवार का',
  } as Bi,
  generated: { en: 'Generated', hi: 'तैयार' } as Bi,
  next: { en: 'See my path', hi: 'मेरा रास्ता देखें' } as Bi,
  classLine: { en: 'Class 10', hi: 'कक्षा 10' } as Bi,
}

export function ShaktiReport() {
  const { L, lang, lite, goTo } = useSchool()
  const reportRef = useRef<HTMLElement>(null)
  const p = NUSRAT_PROFILE
  const strengths = strengthsFor(p)
  const evidence = reportEvidence(p)
  const [shown, setShown] = useState(1)
  const [instantAll, setInstantAll] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)
  const allShown = shown > strengths.length
  const top2 = [...RIASEC_KEYS].sort((a, b) => p.riasec[b] - p.riasec[a]).slice(0, 2)
  const best = PATHS[0]
  const date = fmtDate(DEMO_TODAY, lang, { year: true })

  useDemoEvent('fastforward', () => {
    setInstantAll(true)
    setShown(strengths.length + 1)
  })
  useDemoEvent('finish', () => {
    setInstantAll(true)
    setShown(strengths.length + 1)
  })

  const share = () => printOnly(reportRef.current)

  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={Zap} />

      <AISurface
        ref={reportRef}
        title={L(UI.title)}
        meta={`${L(UI.generated)} · ${date}`}
        actions={
          <button
            type="button"
            onClick={share}
            className="no-print inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[12px] font-medium text-gray-200 transition-colors hover:border-cyan-300/40 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            <T b={UI.share} />
          </button>
        }
        bodyClassName="space-y-5"
      >
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[15px] font-bold text-[#04121a]">
            {NUSRAT.avatarInitials}
          </span>
          <div className="min-w-[12rem] flex-1">
            <p className="text-[17px] font-semibold text-white">
              <T b={{ en: NUSRAT.name, hi: NUSRAT.nameHi }} />
            </p>
            <p className="text-[13px] text-gray-400">
              <T b={UI.classLine} /> · <T b={SCHOOL_NAME} />
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/[0.07] px-3 py-1 text-[13px] font-semibold text-cyan-100">
            <span lang="en" className="font-mono tracking-wider">
              {top2.join('')}
            </span>
            <span className="text-gray-400">·</span>
            <T b={UI.code} />
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
            <h4 className="text-[14px] font-semibold text-gray-200">
              <T b={UI.radar} />
            </h4>
            <RiasecRadar />
            <div className="mt-1 flex flex-wrap gap-2">
              {top2.map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[13px] text-gray-200">
                  <span lang="en" className="font-mono font-bold text-cyan-300">
                    {k}
                  </span>
                  <T b={RIASEC_LABELS[k].long} />
                  <span className="font-semibold tabular-nums text-white">{p.riasec[k]}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
            <h4 className="text-[14px] font-semibold text-gray-200">
              <T b={UI.apt} />
            </h4>
            <AptBars />
          </div>
        </div>

        {/* Strengths, streamed one line at a time */}
        <div className="rounded-xl border border-cyan-300/15 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-emerald-400/[0.05] p-4">
          <h4 className="flex items-center gap-2 text-[14px] font-semibold text-gray-200">
            <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden />
            <T b={UI.saw} />
          </h4>
          <ol className="mt-3 space-y-2.5">
            {strengths.slice(0, shown).map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-[3px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[12px] font-bold text-[#04121a]">
                  {i + 1}
                </span>
                <StreamingText
                  as="span"
                  text={L(s)}
                  instant={instantAll}
                  startDelay={i === 0 ? 500 : 150}
                  onDone={() => setShown((n) => Math.max(n, i + 2))}
                  className="min-w-0 flex-1 text-[16px] leading-relaxed text-gray-100"
                />
              </li>
            ))}
          </ol>

          {allShown && (
            <div className="os-rise mt-4 border-t border-white/[0.06] pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWhyOpen((v) => !v)}
                  aria-expanded={whyOpen}
                  className="no-print inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-cyan-300/40"
                >
                  <Info className="h-4 w-4 text-cyan-300" aria-hidden />
                  <T b={UI.why} />
                  <ChevronDown className={cn('h-4 w-4 transition-transform', whyOpen && 'rotate-180')} aria-hidden />
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-1 text-[12px] text-emerald-200">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden />
                  <T b={UI.review} />
                </span>
              </div>
              <div className={cn('mt-3 space-y-2', whyOpen ? 'block' : 'hidden', 'print:block')}>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                  <T b={UI.evidence} />
                </p>
                <ul className="space-y-1.5">
                  {evidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-gray-300">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      <T b={e} />
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[13px] text-gray-400">
                    <T b={UI.confidence} />
                  </span>
                  <span className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.08]">
                    <span className="block h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${REPORT_CONFIDENCE}%` }} />
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-white">{REPORT_CONFIDENCE}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Best match */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
          <ScoreRing value={best.fit} size={88} stroke={8} showBand={false} label={L(UI.fit)} durationMs={lite ? 0 : 1200} />
          <div className="min-w-0 flex-1 basis-48">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-300/90">
              <T b={UI.topMatch} />
            </p>
            <p className="mt-0.5 text-[19px] font-semibold leading-snug text-white">
              <T b={best.title} />
            </p>
            <p className="text-[14px] text-gray-400">
              <T b={best.via} />
            </p>
          </div>
          <button
            type="button"
            onClick={() => goTo(4)}
            className="no-print inline-flex h-11 items-center gap-1.5 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 text-[14px] font-semibold text-emerald-100 transition-colors hover:bg-emerald-400/15"
          >
            <T b={UI.next} />
            <span aria-hidden>→</span>
          </button>
        </div>

        <p className="text-[12px] leading-snug text-gray-500">
          <T b={UI.footer} />
        </p>
      </AISurface>

      <StepNav
        next={4}
        nextLabel={UI.next}
        extra={<GhostButton onClick={share} label={UI.share} icon={Printer} />}
      />
      <p className="mt-2 text-right text-[12px] text-gray-500">
        <T b={UI.shareHint} />
      </p>
    </section>
  )
}

// -----------------------------------------------------------------------------

type TickProps = { x?: number | string; y?: number | string; cx?: number; cy?: number; textAnchor?: string; payload?: { value?: string } }

function RiasecRadar() {
  const { L, lite } = useSchool()
  const gid = `riasec-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const data = RIASEC_KEYS.map((k) => ({ axis: L(RIASEC_LABELS[k].short), value: NUSRAT_PROFILE.riasec[k], key: k }))

  const renderTick = (props: TickProps) => {
    const x = Number(props.x ?? 0)
    const y = Number(props.y ?? 0)
    const cy = Number(props.cy ?? 0)
    const label = String(props.payload?.value ?? '')
    const row = data.find((d) => d.axis === label)
    const up = y < cy - 12
    const down = y > cy + 12
    const deva = isDevanagari(label)
    return (
      <text
        x={x}
        y={y}
        textAnchor={(props.textAnchor as 'start' | 'middle' | 'end') ?? 'middle'}
        fontSize={12}
        fill="#cbd5e1"
        style={deva ? { fontFamily: 'var(--font-deva), sans-serif' } : undefined}
      >
        <tspan x={x} dy={up ? -16 : down ? 8 : -5}>
          {label}
        </tspan>
        <tspan x={x} dy={14} fill="#67e8f9" fontWeight={700} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
          {row ? `${row.key} ${row.value}` : ''}
        </tspan>
      </text>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="66%" margin={{ top: 18, right: 16, bottom: 10, left: 16 }}>
          <defs>
            <radialGradient id={gid} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="rgba(148,163,184,0.22)" />
          <PolarAngleAxis dataKey="axis" tick={renderTick} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            fill={`url(#${gid})`}
            fillOpacity={1}
            dot={{ r: 3, fill: '#67e8f9', stroke: '#0d1117', strokeWidth: 1 }}
            isAnimationActive={!lite}
            animationDuration={900}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AptBars() {
  const { lite } = useSchool()
  const [grown, setGrown] = useState(lite)
  useEffect(() => {
    if (lite) {
      setGrown(true)
      return
    }
    const id = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(id)
  }, [lite])

  return (
    <div className="mt-3">
      <div className="space-y-3.5">
        {APT_KEYS.map((k, i) => {
          const v = NUSRAT_PROFILE.aptitude[k]
          const d = APT_DISTRICT_AVG[k]
          const s = APT_STATE_AVG[k]
          return (
            <div key={k} className="grid grid-cols-[5.75rem_1fr_2.25rem] items-center gap-3">
              <span className="truncate text-[13px] text-gray-300">
                <T b={APT_LABELS[k]} />
              </span>
              <div className="relative h-3 rounded-full bg-white/[0.06]">
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400', !lite && 'transition-[width] duration-[900ms] ease-out')}
                  style={{ width: grown ? `${v}%` : '0%', transitionDelay: lite ? undefined : `${i * 70}ms` }}
                />
                <span aria-hidden className="absolute -top-1 h-5 w-[3px] -translate-x-1/2 rounded-full bg-slate-300 ring-2 ring-[#0d1117]" style={{ left: `${d}%` }} />
                <span aria-hidden className="absolute -top-1 h-5 w-[3px] -translate-x-1/2 rounded-full bg-amber-300 ring-2 ring-[#0d1117]" style={{ left: `${s}%` }} />
              </div>
              <CountUp value={v} durationMs={lite ? 0 : 900} className="text-right text-[15px] font-semibold text-white" />
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" />
          <T b={UI.you} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3.5 w-[3px] rounded-full bg-slate-300" />
          <T b={UI.district} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3.5 w-[3px] rounded-full bg-amber-300" />
          <T b={UI.state} />
        </span>
      </div>
      <p className="mt-2 text-[12px] text-gray-500">
        <T b={UI.illus} />
      </p>
    </div>
  )
}
