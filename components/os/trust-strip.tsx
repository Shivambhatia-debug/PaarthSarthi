'use client'

import { BadgeCheck, Database, Handshake, KeyRound, Lock } from 'lucide-react'
import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

const ITEMS: { id: string; Icon: typeof Lock; label: Bi; href?: string }[] = [
  {
    id: 'dpiit',
    Icon: BadgeCheck,
    label: { en: 'DPIIT-recognised startup', hi: 'DPIIT-मान्यता प्राप्त स्टार्टअप' },
    href: '/DPIIT%20CERTIFICATE.pdf',
  },
  { id: 'dpdp', Icon: Lock, label: { en: 'DPDP-aligned consent (pilot conditions)', hi: 'DPDP-अनुरूप सहमति (पायलट शर्तें)' } },
  { id: 'rbac', Icon: KeyRound, label: { en: 'Role-based access', hi: 'भूमिका-आधारित पहुँच' } },
  {
    id: 'alongside',
    Icon: Handshake,
    label: {
      en: 'Works alongside internship.bihar.gov.in & the State T&P Cell',
      hi: 'internship.bihar.gov.in और राज्य T&P सेल के साथ काम करता है',
    },
  },
  { id: 'illustrative', Icon: Database, label: { en: 'Illustrative pilot data', hi: 'सांकेतिक पायलट डेटा' } },
]

/** Honesty + trust footer for every OS page (never printed). */
export function TrustStrip({ className }: { className?: string }) {
  const lang = useLang()
  return (
    <footer className={cn('no-print border-t border-white/[0.06] bg-[#0b0f15]', className)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-1 gap-y-2 px-4 py-4 text-[12px] text-gray-500">
        {ITEMS.map((it, i) => {
          const s = tr(it.label, lang)
          const deva = isDevanagari(s)
          const body = (
            <span className="inline-flex items-center gap-1.5">
              <it.Icon
                className={cn('h-3.5 w-3.5 shrink-0', it.id === 'illustrative' ? 'text-amber-400/80' : 'text-gray-500')}
                aria-hidden
              />
              <span lang={deva ? 'hi' : 'en'} className={cn(deva && 'font-deva')}>
                {s}
              </span>
            </span>
          )
          return (
            <span key={it.id} className="inline-flex items-center">
              {it.href ? (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-1 text-gray-400 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-white"
                >
                  {body}
                </a>
              ) : (
                <span className="px-1">{body}</span>
              )}
              {i < ITEMS.length - 1 && <span className="mx-1 hidden text-gray-700 sm:inline">·</span>}
            </span>
          )
        })}
      </div>
    </footer>
  )
}
