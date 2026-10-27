'use client'

/* /pilot: the closing screen. Sober, light motion. Scope, 90-day timeline, KPI targets, the 4-point ask,
 * trust commitments, economics (collapsed, for Q&A), QR + contact, and the printable two-page bilingual
 * leave-behind (printed alone via printOnly). Every button is no-print. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Handshake, Printer, QrCode as QrIcon, Target } from 'lucide-react'
import { StreamingText } from '@/components/ai/streaming-text'
import { AIBadge } from '@/components/ai/ai-badge'
import { Tr } from '@/components/os/tr-text'
import { PilotScope } from '@/components/pitch/pilot-scope'
import { PilotTimeline, PILOT_ASKS, PILOT_DAYS, PILOT_KPIS } from '@/components/pitch/pilot-timeline'
import { TrustPanel } from '@/components/pitch/trust-panel'
import { EconomicsPanel } from '@/components/pitch/economics-panel'
import { LeaveBehind, QrCode, CONTACT_LINE, DEMO_LINK_TEXT } from '@/components/pitch/leave-behind'
import { useLang } from '@/lib/os/demo-store'
import { printOnly } from '@/lib/os/print'
import { tr, type Bi } from '@/lib/os/i18n'
import { PUBLIC_DEMO_URL } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

const SUBLINE: Bi = {
  en: `${PILOT_DAYS} days · zero cost to the State · measured on your KPIs`,
  hi: `${PILOT_DAYS} दिन · राज्य पर शून्य लागत · आपके KPI पर मापा गया`,
}
const KPI_TITLE: Bi = { en: 'KPI targets', hi: 'KPI लक्ष्य' }
const KPI_SUB: Bi = {
  en: 'Measured by an evaluator the Department nominates.',
  hi: 'विभाग द्वारा नामित मूल्यांकनकर्ता द्वारा मापा जाएगा।',
}
const COLS: { metric: Bi; target: Bi; how: Bi } = {
  metric: { en: 'Metric', hi: 'मापदंड' },
  target: { en: 'Target', hi: 'लक्ष्य' },
  how: { en: 'How measured', hi: 'कैसे मापा जाएगा' },
}
const ASK_TITLE: Bi = { en: 'The ask', hi: 'हमारा अनुरोध' }
const ASK_SUB: Bi = { en: 'Four decisions to start the pilot.', hi: 'पायलट शुरू करने के लिए चार निर्णय।' }
const QR_TITLE: Bi = { en: 'Scan to open the demo', hi: 'डेमो खोलने के लिए स्कैन करें' }
const QR_SUB: Bi = {
  en: 'Every screen you saw today, on any phone.',
  hi: 'आज दिखाई गई हर स्क्रीन, किसी भी फ़ोन पर।',
}
const PRINT: Bi = { en: 'Print leave-behind', hi: 'लीव-बिहाइंड प्रिंट करें' }
const PREVIEW_LB: Bi = { en: 'Preview leave-behind', hi: 'लीव-बिहाइंड देखें' }
const PREVIEW_NOTE: Bi = {
  en: 'Two A4 pages: English and Hindi, with the QR code.',
  hi: 'दो A4 पेज: अंग्रेज़ी और हिंदी, QR कोड के साथ।',
}
const BACK: Bi = { en: 'Overview', hi: 'अवलोकन' }
const CLOSING: Bi = {
  en: 'Bihar can be the first Hindi-belt state with an AI Placement OS.',
  hi: 'बिहार AI प्लेसमेंट OS वाला पहला हिंदी-पट्टी राज्य बन सकता है।',
}

const CARD = 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'

/** Streams the closing line once, when it first scrolls into view. */
function ClosingLine() {
  const lang = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  const text = tr(CLOSING, lang)
  return (
    <div ref={ref} className="relative mx-auto max-w-3xl px-2 text-center">
      <div className="mb-4 flex justify-center">
        <AIBadge />
      </div>
      {seen ? (
        <StreamingText
          text={CLOSING}
          as="p"
          cps={38}
          className="text-[24px] font-semibold leading-snug tracking-tight text-white sm:text-[30px]"
        />
      ) : (
        <p aria-hidden className="invisible text-[24px] font-semibold leading-snug tracking-tight sm:text-[30px]">
          {text}
        </p>
      )}
      <div aria-hidden className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-blue-400/0 via-cyan-300/70 to-emerald-400/0" />
    </div>
  )
}

export default function PilotPage() {
  const lang = useLang()
  const lbRef = useRef<HTMLDivElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const print = () => printOnly(lbRef.current)

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-10 pt-6 sm:pt-10 print:overflow-visible">
      {/* 1 · Header */}
      <header className="os-rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/placement-os"
            className="no-print mb-4 inline-flex items-center gap-1.5 rounded text-[13px] text-gray-400 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <Tr b={BACK} />
          </Link>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-[38px]">
            Pilot proposal <span className="text-gray-500">·</span>{' '}
            <span lang="hi" className="font-deva text-gray-300">
              प्रायोगिक प्रस्ताव
            </span>
          </h1>
          <Tr as="p" b={SUBLINE} className="mt-2 text-[15px] text-emerald-200/90 sm:text-[17px]" />
        </div>
        <div className="no-print flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={print}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 px-5 text-[14px] font-semibold text-white shadow-[0_10px_34px_-14px_rgba(34,211,238,0.7)] outline-none ring-1 ring-white/15 transition-[transform,box-shadow] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Printer className="h-4 w-4" aria-hidden />
            <Tr b={PRINT} />
          </button>
          <a
            href="#qr"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[14px] font-medium text-gray-200 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <QrIcon className="h-4 w-4 text-gray-400" aria-hidden />
            QR
          </a>
        </div>
      </header>

      {/* 2 · Scope */}
      <PilotScope className="mt-10" />

      {/* 3 · Timeline */}
      <PilotTimeline className="mt-12" />

      {/* 4 + 5 · KPIs and the ask */}
      <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section aria-label={tr(KPI_TITLE, lang)} className={cn(CARD, 'min-w-0')}>
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/25">
              <Target className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <Tr as="h2" b={KPI_TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
              <Tr as="p" b={KPI_SUB} className="mt-0.5 text-[13px] text-gray-400" />
            </div>
          </div>
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-[12px] uppercase tracking-[0.08em] text-gray-500">
                <th scope="col" className="w-[58%] py-2 pr-3 font-medium sm:w-[38%]">
                  <Tr b={COLS.metric} />
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  <Tr b={COLS.target} />
                </th>
                <th scope="col" className="hidden py-2 font-medium sm:table-cell sm:w-[34%]">
                  <Tr b={COLS.how} />
                </th>
              </tr>
            </thead>
            <tbody>
              {PILOT_KPIS.map((k) => (
                <tr key={k.id} className="border-b border-white/[0.06] align-top last:border-0">
                  <td className="py-2.5 pr-3">
                    <Tr b={k.metric} className="block text-[14px] text-gray-100" />
                    <Tr b={k.how} className="mt-0.5 block text-[12px] text-gray-500 sm:hidden" />
                  </td>
                  <td className="py-2.5 pr-3">
                    <Tr b={k.target} className="block text-[14px] font-semibold tabular-nums text-emerald-300" />
                  </td>
                  <td className="hidden py-2.5 sm:table-cell">
                    <Tr b={k.how} className="block text-[13px] text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-label={tr(ASK_TITLE, lang)} className="ai-border relative min-w-0 rounded-2xl">
          <div className="h-full rounded-2xl bg-[#0d1117] p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/25">
                <Handshake className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <Tr as="h2" b={ASK_TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
                <Tr as="p" b={ASK_SUB} className="mt-0.5 text-[13px] text-gray-400" />
              </div>
            </div>
            <ol className="space-y-3">
              {PILOT_ASKS.map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 text-[13px] font-bold text-white tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <Tr b={a.title} className="block text-[15px] font-semibold text-white" />
                    <Tr b={a.detail} className="mt-0.5 block text-[13px] leading-relaxed text-gray-400" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* 6 · Trust */}
      <TrustPanel className="mt-12" />

      {/* 7 · Economics (collapsed, for Q&A) */}
      <EconomicsPanel className="mt-10" />

      {/* 8 · QR + contact */}
      <section id="qr" aria-label={tr(QR_TITLE, lang)} className={cn(CARD, 'mt-10 scroll-mt-24')}>
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="shrink-0 rounded-xl bg-white p-2">
            <QrCode size={160} tone="paper" />
          </div>
          <div className="min-w-0">
            <Tr as="h2" b={QR_TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
            <Tr as="p" b={QR_SUB} className="mt-1 text-[14px] text-gray-400" />
            <a
              href={PUBLIC_DEMO_URL}
              className="mt-3 inline-block break-all font-mono text-[14px] text-cyan-300 underline-offset-4 hover:underline"
            >
              {DEMO_LINK_TEXT}
            </a>
            <div className="mt-1 text-[13px] text-gray-300">{CONTACT_LINE}</div>
          </div>
        </div>
      </section>

      {/* 9 · Leave-behind (preview collapsed; printing works either way) */}
      <section aria-label={tr(PREVIEW_LB, lang)} className="mt-10">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <button
            type="button"
            onClick={() => setPreviewOpen((o) => !o)}
            aria-expanded={previewOpen}
            className="inline-flex items-center gap-2 rounded-lg text-[14px] font-medium text-gray-100 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', previewOpen && 'rotate-180')} aria-hidden />
            <Tr b={PREVIEW_LB} />
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <Tr b={PREVIEW_NOTE} className="text-[12px] text-gray-500" />
            <button
              type="button"
              onClick={print}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-100 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Printer className="h-4 w-4" aria-hidden />
              <Tr b={PRINT} />
            </button>
          </div>
        </div>
        <LeaveBehind ref={lbRef} open={previewOpen} className={cn(previewOpen && 'mt-4')} />
      </section>

      {/* 10 · Closing line */}
      <div className="mt-16">
        <ClosingLine />
      </div>
    </div>
  )
}
