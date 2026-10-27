'use client'

// Offer tracker (Reports tab): 10 recent offers with status and placement-rule badges. Sector names only.

import { useMemo } from 'react'
import { BadgeIndianRupee, Gavel } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { TpoCard } from '@/components/tpo/tpo-header'
import { BRANCH_NAME, offersFor, type OfferStatus, type OfferTier } from '@/components/tpo/tpo-data'

export const OFFER_STATUS: Record<OfferStatus, { label: Bi; cls: string; dot: string }> = {
  Accepted: { label: { en: 'Accepted', hi: 'स्वीकृत' }, cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', dot: 'bg-emerald-400' },
  Pending: { label: { en: 'Pending', hi: 'लंबित' }, cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300', dot: 'bg-amber-400' },
  Declined: { label: { en: 'Declined', hi: 'अस्वीकृत' }, cls: 'border-rose-400/30 bg-rose-400/10 text-rose-300', dot: 'bg-rose-400' },
  Upgraded: { label: { en: 'Upgraded', hi: 'अपग्रेड' }, cls: 'border-violet-400/30 bg-violet-400/10 text-violet-200', dot: 'bg-violet-400' },
}

export const OFFER_TIER: Record<OfferTier, Bi> = {
  Regular: { en: 'Regular', hi: 'नियमित' },
  Dream: { en: 'Dream', hi: 'ड्रीम' },
  'Super-Dream': { en: 'Super-Dream', hi: 'सुपर-ड्रीम' },
  Core: { en: 'Core', hi: 'कोर' },
}

const UI = {
  title: { en: 'Offer tracker · Batch 2027', hi: 'ऑफ़र ट्रैकर · बैच 2027' },
  sub: { en: 'Latest 10 offers. Sector names only; package shown as a band.', hi: 'नवीनतम 10 ऑफ़र। केवल सेक्टर; पैकेज बैंड के रूप में।' },
  student: { en: 'Student', hi: 'छात्र' },
  branch: { en: 'Branch', hi: 'शाखा' },
  sector: { en: 'Employer sector', hi: 'नियोक्ता सेक्टर' },
  tier: { en: 'Tier', hi: 'टियर' },
  band: { en: 'Package band', hi: 'पैकेज बैंड' },
  status: { en: 'Status', hi: 'स्थिति' },
  rules: { en: 'Rules applied', hi: 'लागू नियम' },
  date: { en: 'Date', hi: 'तारीख़' },
  policy: {
    en: 'One student, one job · one Dream upgrade · Super-Dream is final · respond within 7 days (configurable per college)',
    hi: 'एक छात्र, एक नौकरी · एक ड्रीम अपग्रेड · सुपर-ड्रीम अंतिम · 7 दिन में जवाब (हर कॉलेज के लिए बदला जा सकता है)',
  },
} satisfies Record<string, Bi>

export function OfferTracker({ collegeId, className }: { collegeId: string; className?: string }) {
  const { lang } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const offers = useMemo(() => offersFor(collegeId), [collegeId])
  const counts = useMemo(() => {
    const c: Record<OfferStatus, number> = { Accepted: 0, Pending: 0, Declined: 0, Upgraded: 0 }
    offers.forEach((o) => (c[o.status] += 1))
    return c
  }, [offers])

  return (
    <TpoCard title={UI.title} sub={UI.sub} icon={BadgeIndianRupee} tone="good" className={className} actions={<IllustrativeChip compact />}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(OFFER_STATUS) as OfferStatus[]).map((s) => (
          <span key={s} className={cn('inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium', OFFER_STATUS[s].cls)}>
            <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', OFFER_STATUS[s].dot)} />
            <Tr b={OFFER_STATUS[s].label} />
            <span className="tabular-nums">{counts[s]}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
        <Table className="min-w-[920px] text-[13px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {[UI.student, UI.branch, UI.sector, UI.tier, UI.band, UI.status, UI.rules, UI.date].map((h, i) => (
                <TableHead key={i} className="h-9 whitespace-nowrap px-3 text-[12px] font-medium text-gray-400">
                  <Tr b={h} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => {
              const st = OFFER_STATUS[o.status]
              return (
                <TableRow key={o.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                  <TableCell className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-100">{o.name}</TableCell>
                  <TableCell className="px-3 py-2.5 text-gray-300">
                    <Tr b={BRANCH_NAME[o.branch] ?? o.branch} />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-gray-300">
                    <Tr b={o.sector} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={cn(
                        'rounded px-1.5 py-px text-[12px] font-medium',
                        o.tier === 'Super-Dream'
                          ? 'bg-violet-400/15 text-violet-200'
                          : o.tier === 'Dream'
                            ? 'bg-cyan-400/10 text-cyan-200'
                            : 'bg-white/[0.06] text-gray-300',
                      )}
                    >
                      <Tr b={OFFER_TIER[o.tier]} />
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2.5 tabular-nums text-gray-200">{o.band}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-medium', st.cls)}>
                      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                      <Tr b={st.label} />
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex max-w-[300px] flex-wrap gap-1">
                      {o.rules.map((r, i) => (
                        <span key={i} className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-px text-[12px] text-gray-400">
                          <Tr b={r} />
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2.5 text-gray-400">{fmtDate(o.date, ol)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-gray-400">
        <Gavel aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
        <Tr b={UI.policy} />
      </p>
    </TpoCard>
  )
}
