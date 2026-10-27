'use client'

import { Check, ClipboardList, KeyRound, Minus, Plug, ScrollText, ShieldCheck, X } from 'lucide-react'
import { CountUp } from '@/components/ai/count-up'
import { IntegrationChip } from '@/components/os/integration-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { CONSENT_TEXT, PREVIEW, TRUST_COMMITMENTS } from '@/lib/mock/state'
import type { TrustItem } from '@/lib/mock/types'
import { PanelCard } from '@/components/state/title-strip'
import { AUDIT_LOG, auditLine, type AuditScope } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  consent: { en: 'Consent coverage', hi: 'सहमति कवरेज' },
  consentSub: { en: 'DPDP Act 2023 · purpose-specific consent', hi: 'DPDP अधिनियम 2023 · उद्देश्य-विशिष्ट सहमति' },
  of: { en: 'of onboarded students', hi: 'जुड़े छात्रों में' },
  vpc: {
    en: 'Verifiable parental consent for under-18 (school track), mocked',
    hi: '18 वर्ष से कम (स्कूल ट्रैक) के लिए सत्यापित अभिभावक सहमति, डेमो में नकली',
  },
  college: { en: 'College students', hi: 'कॉलेज छात्र' },
  school: { en: 'School track', hi: 'स्कूल ट्रैक' },
  rbac: { en: 'Role-based access', hi: 'भूमिका-आधारित पहुँच' },
  rbacSub: { en: 'Who can see what · enforced per request', hi: 'कौन क्या देख सकता है · हर अनुरोध पर लागू' },
  audit: { en: 'Audit log', hi: 'ऑडिट लॉग' },
  auditSub: { en: 'Last 10 access events · immutable', hi: 'पिछली 10 पहुँच घटनाएँ · अपरिवर्तनीय' },
  commit: { en: 'Trust commitments', hi: 'विश्वास प्रतिबद्धताएँ' },
  commitSub: { en: 'Conditions for the pilot, shown identically everywhere', hi: 'पायलट की शर्तें, हर जगह एक जैसी' },
  integr: { en: 'Integrations', hi: 'इंटीग्रेशन' },
  integrSub: { en: 'Connects to existing state and national systems', hi: 'मौजूदा राज्य और राष्ट्रीय प्रणालियों से जुड़ता है' },
} satisfies Record<string, Bi>

type Access = 'yes' | 'no' | 'partial'

const COLS: Bi[] = [
  { en: 'Own scores', hi: 'अपने स्कोर' },
  { en: 'Names in college', hi: 'कॉलेज में नाम' },
  { en: 'District aggregates', hi: 'ज़िला सारांश' },
  { en: 'State aggregates', hi: 'राज्य सारांश' },
  { en: 'Export', hi: 'निर्यात' },
]

const RBAC: { role: Bi; cells: { a: Access; note?: Bi }[] }[] = [
  {
    role: { en: 'Student', hi: 'छात्र' },
    cells: [
      { a: 'yes' },
      { a: 'no' },
      { a: 'no' },
      { a: 'partial', note: { en: 'benchmarks only', hi: 'केवल तुलना' } },
      { a: 'partial', note: { en: 'own report', hi: 'अपनी रिपोर्ट' } },
    ],
  },
  {
    role: { en: 'College TPO', hi: 'कॉलेज TPO' },
    cells: [
      { a: 'partial', note: { en: 'own college', hi: 'अपना कॉलेज' } },
      { a: 'yes', note: { en: 'own college', hi: 'अपना कॉलेज' } },
      { a: 'no' },
      { a: 'yes' },
      { a: 'partial', note: { en: 'shortlists, logged', hi: 'शॉर्टलिस्ट, लॉग सहित' } },
    ],
  },
  {
    role: { en: 'State (DSTTE)', hi: 'राज्य (DSTTE)' },
    cells: [
      { a: 'no' },
      { a: 'no' },
      { a: 'yes' },
      { a: 'yes' },
      { a: 'partial', note: { en: 'aggregates only, logged', hi: 'केवल सारांश, लॉग सहित' } },
    ],
  },
]

const ACCESS_STYLE: Record<Access, { cls: string; Icon: typeof Check; label: Bi }> = {
  yes: { cls: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25', Icon: Check, label: { en: 'Allowed', hi: 'अनुमति' } },
  no: { cls: 'bg-rose-400/10 text-rose-300 ring-rose-400/25', Icon: X, label: { en: 'Not allowed', hi: 'अनुमति नहीं' } },
  partial: { cls: 'bg-amber-400/10 text-amber-200 ring-amber-400/25', Icon: Minus, label: { en: 'Limited', hi: 'सीमित' } },
}

const STATUS: Record<TrustItem['status'], { cls: string; label: Bi }> = {
  'in-place': { cls: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25', label: { en: 'In place', hi: 'लागू' } },
  'pilot-condition': { cls: 'bg-amber-400/10 text-amber-200 ring-amber-400/25', label: { en: 'Pilot condition', hi: 'पायलट की शर्त' } },
  planned: { cls: 'bg-slate-400/10 text-slate-300 ring-slate-400/25', label: { en: 'Planned', hi: 'प्रस्तावित' } },
}

const SCOPE: Record<AuditScope, { cls: string; label: Bi }> = {
  names: { cls: 'bg-amber-400/10 text-amber-200', label: { en: 'Names', hi: 'नाम' } },
  aggregate: { cls: 'bg-cyan-400/10 text-cyan-200', label: { en: 'Aggregate', hi: 'सारांश' } },
  own: { cls: 'bg-emerald-400/10 text-emerald-300', label: { en: 'Own data', hi: 'अपना डेटा' } },
  system: { cls: 'bg-slate-400/10 text-slate-300', label: { en: 'System', hi: 'सिस्टम' } },
}

export function TrustTab({ className }: { className?: string }) {
  const { t, lang } = useDemo()
  const L = lang === 'hi' ? 'hi' : 'en'
  const pct = PREVIEW.consentPct

  return (
    <div className={cn('grid grid-cols-1 gap-4 xl:grid-cols-12', className)}>
      <PanelCard index={0} className="xl:col-span-4" icon={ShieldCheck} accent="emerald" title={T.consent} subtitle={T.consentSub}>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums text-white">
            <CountUp value={pct} decimals={1} format={(n) => `${fmtNum(n)}%`} />
          </span>
          <Tr b={T.of} className="text-[13px] text-gray-400" />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <p className="mt-1.5 text-[12px] tabular-nums text-gray-500">
          {fmtIN(Math.round((PREVIEW.onboarded * pct) / 100))} / {fmtIN(PREVIEW.onboarded)}
        </p>
        <div className="mt-4 space-y-2.5">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <Tr as="p" b={T.college} className="block text-[12px] font-medium uppercase tracking-[0.1em] text-gray-500" />
            <Tr as="p" b={CONSENT_TEXT.college} className="mt-1 block text-[13px] leading-relaxed text-gray-300" />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <Tr as="p" b={T.school} className="block text-[12px] font-medium uppercase tracking-[0.1em] text-gray-500" />
            <Tr as="p" b={CONSENT_TEXT.school} className="mt-1 block text-[13px] leading-relaxed text-gray-300" />
            <p className="mt-2 flex items-start gap-1.5 text-[12px] text-amber-200/90">
              <KeyRound aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <Tr b={T.vpc} />
            </p>
          </div>
        </div>
      </PanelCard>

      <PanelCard index={1} className="xl:col-span-8" icon={KeyRound} accent="cyan" title={T.rbac} subtitle={T.rbacSub}>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead className="bg-white/[0.03]">
              <tr className="border-b border-white/10">
                <th scope="col" className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-400" />
                {COLS.map((c) => (
                  <th key={c.en} scope="col" className="px-2 py-2.5 text-center text-[12px] font-medium text-gray-400">
                    <Tr b={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RBAC.map((r) => (
                <tr key={r.role.en} className="border-b border-white/[0.05] last:border-0">
                  <th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-medium text-white">
                    <Tr b={r.role} />
                  </th>
                  {r.cells.map((c, i) => {
                    const s = ACCESS_STYLE[c.a]
                    return (
                      <td key={`${r.role.en}-${COLS[i].en}`} className="px-2 py-3 text-center">
                        <span className="inline-flex flex-col items-center gap-1">
                          <span
                            className={cn('grid h-7 w-7 place-items-center rounded-full ring-1', s.cls)}
                            role="img"
                            aria-label={t(s.label)}
                          >
                            <s.Icon aria-hidden className="h-3.5 w-3.5" />
                          </span>
                          {c.note && <Tr b={c.note} className="text-[12px] leading-tight text-gray-500" />}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard index={2} className="xl:col-span-7" icon={ScrollText} accent="slate" title={T.audit} subtitle={T.auditSub}>
        <ol className="space-y-1.5">
          {AUDIT_LOG.slice(0, 10).map((e) => {
            const sc = SCOPE[e.scope] ?? SCOPE.system
            return (
              <li
                key={e.id}
                className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-[12.5px]"
              >
                <span className={cn('mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-sans text-[12px] font-medium', sc.cls)}>
                  <Tr b={sc.label} />
                </span>
                <span lang={L} className={cn('min-w-0 leading-relaxed text-gray-300', L === 'hi' && 'font-deva')}>
                  {auditLine(e, L)}
                </span>
              </li>
            )
          })}
        </ol>
      </PanelCard>

      <PanelCard index={3} className="xl:col-span-5" icon={Plug} accent="violet" title={T.integr} subtitle={T.integrSub}>
        <ul className="space-y-2">
          {PREVIEW.integrations.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <IntegrationChip name={it.name} status={it.status} />
              <Tr b={it.note} className="text-[12px] text-gray-500" />
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard index={4} className="xl:col-span-12" icon={ClipboardList} accent="emerald" title={T.commit} subtitle={T.commitSub}>
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {TRUST_COMMITMENTS.map((c) => {
            const st = STATUS[c.status] ?? STATUS.planned
            return (
              <li key={c.id} className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <Tr b={c.label} className="text-[14px] font-medium leading-snug text-white" />
                  <span className={cn('inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[12px] font-medium ring-1', st.cls)}>
                    <Tr b={st.label} />
                  </span>
                </div>
                <Tr as="p" b={c.detail} className="block text-[12.5px] leading-relaxed text-gray-400" />
              </li>
            )
          })}
        </ul>
      </PanelCard>
    </div>
  )
}
