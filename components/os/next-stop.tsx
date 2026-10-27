'use client'

/* Small "next view" link card that closes a screen, so the demo path never dead-ends:
 * report -> /tpo -> /state -> /state/brief -> /schools -> /pilot. Hidden in print. */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import { tr, isDevanagari, type Bi, type Lang } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

const NEXT: Bi = { en: 'Next view', hi: 'अगला दृश्य', hinglish: 'Next view' }

export function NextStop({
  href,
  label,
  sub,
  className,
  lang,
}: {
  href: string
  label: Bi
  sub?: Bi
  className?: string
  /** Optional (additive): render in this language instead of the global one (e.g. the school flow's own lang). */
  lang?: Lang
}) {
  const T = ({ b, className: c }: { b: Bi; className?: string }) => {
    if (!lang) return <Tr b={b} className={c} />
    const s = tr(b, lang)
    const d = isDevanagari(s)
    return (
      <span lang={d ? 'hi' : 'en'} className={cn(d && 'font-deva', c)}>
        {s}
      </span>
    )
  }
  return (
    <div className={cn('no-print mt-10 flex justify-end', className)}>
      <Link
        href={href}
        className="group inline-flex max-w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left outline-none transition-colors hover:border-cyan-400/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <span className="min-w-0">
          <T b={NEXT} className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
          <T b={label} className="block text-[15px] font-semibold text-white" />
          {sub && <T b={sub} className="block text-[12px] text-gray-400" />}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  )
}
