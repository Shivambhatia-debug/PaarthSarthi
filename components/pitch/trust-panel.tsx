'use client'

/* Trust & governance (fix 51): every TRUST_COMMITMENTS item with an honest status chip,
 * the DPIIT certificate link and integration chips (never 'Live'). */

import { BadgeCheck, ExternalLink, Plug, ShieldCheck } from 'lucide-react'
import { IntegrationChip } from '@/components/os/integration-chip'
import { Tr } from '@/components/os/tr-text'
import { useLang } from '@/lib/os/demo-store'
import { tr, type Bi } from '@/lib/os/i18n'
import { PREVIEW, TRUST_COMMITMENTS } from '@/lib/mock/state'
import type { TrustItem } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

export const TRUST_STATUS: Record<TrustItem['status'], { label: Bi; chip: string; dot: string; print: string }> = {
  'pilot-condition': {
    label: { en: 'Pilot condition', hi: 'पायलट शर्त' },
    chip: 'border-amber-400/35 bg-amber-400/[0.08] text-amber-200',
    dot: 'bg-amber-400',
    print: 'text-amber-700',
  },
  'in-place': {
    label: { en: 'In demo', hi: 'डेमो में' },
    chip: 'border-cyan-400/35 bg-cyan-400/[0.08] text-cyan-200',
    dot: 'bg-cyan-300',
    print: 'text-cyan-700',
  },
  planned: {
    label: { en: 'Planned', hi: 'प्रस्तावित' },
    chip: 'border-slate-400/30 bg-slate-400/[0.08] text-slate-300',
    dot: 'bg-slate-400',
    print: 'text-slate-600',
  },
}

const ORDER: TrustItem['status'][] = ['pilot-condition', 'in-place', 'planned']

const TITLE: Bi = { en: 'Trust & governance', hi: 'विश्वास और शासन' }
const SUB: Bi = {
  en: 'The same commitments appear on the consent cards and the State Trust tab',
  hi: 'यही प्रतिबद्धताएँ सहमति कार्ड और राज्य के ट्रस्ट टैब पर भी हैं',
}
const DPIIT: Bi = { en: 'DPIIT-recognised startup · certificate (PDF)', hi: 'DPIIT-मान्यता प्राप्त स्टार्टअप · प्रमाणपत्र (PDF)' }
const INTEGRATIONS: Bi = { en: 'Integrations', hi: 'इंटीग्रेशन' }
const INTEGRATIONS_NOTE: Bi = {
  en: 'Integration-ready or planned. Nothing is shown as live.',
  hi: 'इंटीग्रेशन-तैयार या प्रस्तावित। कुछ भी लाइव नहीं दिखाया गया है।',
}

export function TrustStatusChip({ status, className }: { status: TrustItem['status']; className?: string }) {
  const s = TRUST_STATUS[status] ?? TRUST_STATUS.planned
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-medium',
        s.chip,
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      <Tr b={s.label} />
    </span>
  )
}

export function TrustPanel({ className }: { className?: string }) {
  const lang = useLang()
  const items = Array.isArray(TRUST_COMMITMENTS) ? TRUST_COMMITMENTS : []
  const counts = ORDER.map((st) => ({ st, n: items.filter((i) => i.status === st).length }))

  return (
    <section aria-label={tr(TITLE, lang)} className={cn('min-w-0', className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            <Tr as="h2" b={TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
          </div>
          <Tr as="p" b={SUB} className="mt-0.5 text-[13px] text-gray-400" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {counts.map(({ st, n }) => (
            <span key={st} className="inline-flex items-center gap-1.5">
              <TrustStatusChip status={st} />
              <span className="text-[12px] tabular-nums text-gray-500">×{n}</span>
            </span>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-3">
              <Tr as="h3" b={it.label} className="min-w-0 text-[14px] font-semibold leading-snug text-white" />
              <TrustStatusChip status={it.status} />
            </div>
            <Tr as="p" b={it.detail} className="text-[13px] leading-relaxed text-gray-400" />
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)]">
        <a
          href="/DPIIT%20CERTIFICATE.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/[0.04]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
            <BadgeCheck className="h-[18px] w-[18px] text-emerald-300" aria-hidden />
          </span>
          <Tr b={DPIIT} className="min-w-0 flex-1 text-[13px] font-medium text-gray-200" />
          <ExternalLink className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-emerald-300" aria-hidden />
        </a>

        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Plug className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
            <Tr b={INTEGRATIONS} className="text-[13px] font-semibold text-white" />
            <Tr b={INTEGRATIONS_NOTE} className="text-[12px] text-gray-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {PREVIEW.integrations.map((ig) => (
              <IntegrationChip key={ig.id} name={ig.name} status={ig.status} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
