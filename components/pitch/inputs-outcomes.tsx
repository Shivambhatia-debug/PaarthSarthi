'use client'

/* Inputs -> ParthSarthi Placement OS -> Outcomes. "You already have the content.
 * We are the layer that measures, simulates and matches." */

import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Cpu,
  FlaskConical,
  Gauge,
  GraduationCap,
  Handshake,
  Map as MapIcon,
  Mic,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { Tr } from '@/components/os/tr-text'
import { fmtIN, type Bi } from '@/lib/os/i18n'
import { PREVIEW, REPORTED } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const TITLE: Bi = {
  en: 'You bought the inputs. We measure the outcomes.',
  hi: 'इनपुट आपने खरीदे। नतीजे हम मापते हैं।',
  hinglish: 'Inputs aapne khareede. Outcomes hum measure karte hain.',
}
const INPUTS_H: Bi = { en: 'Inputs the State already funds', hi: 'राज्य पहले से ये इनपुट दे रहा है' }
const OUTCOMES_H: Bi = { en: 'Outcomes the Department reports', hi: 'विभाग जो नतीजे रिपोर्ट करता है' }
const CORE_SUB: Bi = { en: 'The readiness layer', hi: 'तैयारी की परत' }
const CAPTION: Bi = {
  en: 'You already have the content. We are the layer that measures, simulates and matches.',
  hi: 'सामग्री आपके पास पहले से है। हम वह परत हैं जो मापती है, अभ्यास कराती है और मिलान करती है।',
  hinglish: 'Content aapke paas pehle se hai. Hum woh layer hain jo measure, simulate aur match karti hai.',
}

const INPUTS: { id: string; Icon: LucideIcon; label: Bi; sub: Bi }[] = [
  {
    id: 'fsp',
    Icon: GraduationCap,
    label: PREVIEW.inputs.fsp.label,
    sub: { en: 'MoU · nodal officer per college', hi: 'MoU · हर कॉलेज में नोडल अधिकारी' },
  },
  {
    id: 'st',
    Icon: BookOpen,
    label: PREVIEW.inputs.st.label,
    sub: { en: 'MoU · course certificates', hi: 'MoU · कोर्स प्रमाणपत्र' },
  },
  {
    id: 'google',
    Icon: Sparkles,
    label: { en: 'Google teacher-AI training', hi: 'Google शिक्षक-AI प्रशिक्षण' },
    sub: { en: 'Faculty AI skilling', hi: 'फ़ैकल्टी के लिए AI प्रशिक्षण' },
  },
  {
    id: 'coe',
    Icon: FlaskConical,
    label: PREVIEW.inputs.coe.label,
    sub: {
      en: `${fmtIN(REPORTED.coeTrained)} trained (as reported)`,
      hi: `${fmtIN(REPORTED.coeTrained)} प्रशिक्षित (रिपोर्ट के अनुसार)`,
    },
  },
  {
    id: 'labs',
    Icon: Cpu,
    label: { en: `₹${REPORTED.aiLabLakhPerCollege} lakh AI labs`, hi: `₹${REPORTED.aiLabLakhPerCollege} लाख की AI लैब` },
    sub: { en: 'Per college', hi: 'प्रति कॉलेज' },
  },
  {
    id: 'internship',
    Icon: Handshake,
    label: { en: 'internship.bihar.gov.in', hi: 'internship.bihar.gov.in' },
    sub: { en: 'State internship portal', hi: 'राज्य इंटर्नशिप पोर्टल' },
  },
]

const PILLS: { id: string; Icon: LucideIcon; label: Bi; line: Bi; cls: string }[] = [
  {
    id: 'measure',
    Icon: Gauge,
    label: { en: 'Measure', hi: 'मापें' },
    line: { en: 'Readiness Index for every student', hi: 'हर छात्र का रेडीनेस इंडेक्स' },
    cls: 'border-blue-400/30 bg-blue-400/[0.08] text-blue-200',
  },
  {
    id: 'simulate',
    Icon: Mic,
    label: { en: 'Simulate', hi: 'अभ्यास' },
    line: { en: 'The real hiring day, in Hindi too', hi: 'असली भर्ती दिवस, हिंदी में भी' },
    cls: 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200',
  },
  {
    id: 'match',
    Icon: Briefcase,
    label: { en: 'Match', hi: 'मिलान' },
    line: { en: 'Drives, internships, schemes', hi: 'ड्राइव, इंटर्नशिप, योजनाएँ' },
    cls: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200',
  },
]

const trainedPct = PREVIEW.aiTrainedTargetYear > 0 ? (PREVIEW.aiTrainedThisYear / PREVIEW.aiTrainedTargetYear) * 100 : 0

const OUTCOMES: { id: string; Icon: LucideIcon; label: Bi; sub: Bi }[] = [
  {
    id: 'offers',
    Icon: Award,
    label: { en: 'Offers & internships', hi: 'ऑफ़र और इंटर्नशिप' },
    sub: { en: 'Against the previous batch, from college records', hi: 'पिछले बैच की तुलना में, कॉलेज रिकॉर्ड से' },
  },
  {
    id: 'pri',
    Icon: MapIcon,
    label: { en: 'PRI by district', hi: 'ज़िलेवार PRI' },
    sub: { en: 'Every college and district, every week', hi: 'हर कॉलेज और ज़िला, हर सप्ताह' },
  },
  {
    id: 'ai',
    Icon: BadgeCheck,
    label: { en: 'AI-trained vs AI Policy 2026', hi: 'AI-प्रशिक्षित बनाम AI नीति 2026' },
    sub: {
      en: `Preview: ${fmtIN(PREVIEW.aiTrainedThisYear)} of ${fmtIN(PREVIEW.aiTrainedTargetYear)} this year (illustrative)`,
      hi: `झलक: इस वर्ष ${fmtIN(PREVIEW.aiTrainedTargetYear)} में से ${fmtIN(PREVIEW.aiTrainedThisYear)} (सांकेतिक)`,
    },
  },
]

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

const IO_CSS = `
@keyframes io-flow-x { from { transform: translateX(-110%) } to { transform: translateX(320%) } }
@keyframes io-flow-y { from { transform: translateY(-110%) } to { transform: translateY(320%) } }
.io-flow-x::after, .io-flow-y::after { content: ''; position: absolute; border-radius: 9999px; }
.io-flow-x::after { top: 0; left: 0; height: 100%; width: 32%; background: linear-gradient(90deg, transparent, #67e8f9, transparent); animation: io-flow-x 1.9s linear infinite; }
.io-flow-y::after { left: 0; top: 0; width: 100%; height: 32%; background: linear-gradient(180deg, transparent, #67e8f9, transparent); animation: io-flow-y 1.9s linear infinite; }
.io-flow-x.io-late::after, .io-flow-y.io-late::after { animation-delay: 0.95s; }
@media (prefers-reduced-motion: reduce) { .io-flow-x::after, .io-flow-y::after { animation: none; opacity: 0; } }
.os-lite .io-flow-x::after, .os-lite .io-flow-y::after { animation: none; opacity: 0; }
`

function Connector({ late }: { late?: boolean }) {
  return (
    <div aria-hidden className="flex items-center justify-center">
      {/* desktop: horizontal */}
      <div className="hidden w-full items-center lg:flex">
        <span
          className={cn(
            'io-flow-x relative h-[2px] flex-1 overflow-hidden rounded-full bg-gradient-to-r from-slate-500/30 to-cyan-400/40',
            late && 'io-late',
          )}
        />
        <ChevronRight className="-ml-1 h-4 w-4 shrink-0 text-cyan-300/80" />
      </div>
      {/* mobile: vertical */}
      <div className="flex flex-col items-center lg:hidden">
        <span
          className={cn(
            'io-flow-y relative h-7 w-[2px] overflow-hidden rounded-full bg-gradient-to-b from-slate-500/30 to-cyan-400/40',
            late && 'io-late',
          )}
        />
        <ChevronDown className="-mt-1 h-4 w-4 text-cyan-300/80" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InputsOutcomes({ className }: { className?: string }) {
  return (
    <section aria-label="Inputs and outcomes" className={cn('min-w-0', className)}>
      <style href="ps-inputs-outcomes" precedence="default">
        {IO_CSS}
      </style>
      <Tr as="h2" b={TITLE} className="text-[22px] font-semibold tracking-tight text-white sm:text-[26px]" />

      <div className="mt-5 grid items-stretch gap-2 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,0.92fr)_52px_minmax(0,1fr)] lg:gap-0">
        {/* Inputs */}
        <div className="min-w-0 rounded-xl border border-slate-500/20 bg-slate-500/[0.05] p-4">
          <Tr as="h3" b={INPUTS_H} className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-400" />
          <ul className="space-y-1.5">
            {INPUTS.map((it) => (
              <li key={it.id} className="flex min-w-0 items-center gap-2.5 rounded-lg bg-white/[0.025] px-2.5 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/20">
                  <it.Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <Tr as="p" b={it.label} className="truncate text-[13px] font-medium text-gray-100" />
                  <Tr as="p" b={it.sub} className="truncate text-[12px] text-gray-500" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Connector />

        {/* Core */}
        <div className="relative min-w-0 rounded-2xl bg-[linear-gradient(135deg,rgba(96,165,250,0.6),rgba(34,211,238,0.3)_40%,rgba(255,255,255,0.06)_65%,rgba(52,211,153,0.55))] p-px shadow-[0_24px_60px_-30px_rgba(34,211,238,0.5)]">
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[15px] bg-[#0d1117] px-4 py-6 text-center">
            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-cyan-400/[0.12] blur-3xl" />
            <AIOrb state="idle" size={68} label="" />
            <p className="relative mt-3 text-[18px] font-semibold leading-tight text-white">
              ParthSarthi <span className="ai-gradient-text">Placement OS</span>
            </p>
            <Tr as="p" b={CORE_SUB} className="relative mt-0.5 text-[12px] uppercase tracking-[0.14em] text-gray-500" />
            <div className="relative mt-4 flex w-full flex-col gap-2">
              {PILLS.map((p) => (
                <div key={p.id} className={cn('flex min-w-0 items-start gap-2.5 rounded-lg border px-3 py-2 text-left', p.cls)}>
                  <p.Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <Tr b={p.label} className="text-[13px] font-semibold leading-tight" />
                    <Tr b={p.line} className="text-[12px] leading-snug text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Connector late />

        {/* Outcomes */}
        <div className="min-w-0 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
          <Tr as="h3" b={OUTCOMES_H} className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-emerald-300/80" />
          <ul className="space-y-2">
            {OUTCOMES.map((o) => (
              <li key={o.id} className="rounded-lg bg-white/[0.025] px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/25">
                    <o.Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <Tr as="p" b={o.label} className="min-w-0 text-[14px] font-semibold text-gray-100" />
                </div>
                <Tr as="p" b={o.sub} className="mt-1 pl-[38px] text-[12px] leading-snug text-gray-400" />
                {o.id === 'ai' && (
                  <div className="ml-[38px] mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400"
                      style={{ width: `${Math.min(100, Math.max(0, trainedPct))}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Tr
        as="p"
        b={CAPTION}
        className="mx-auto mt-5 max-w-3xl text-balance text-center text-[15px] font-medium leading-relaxed text-gray-300 sm:text-[16px]"
      />
    </section>
  )
}
