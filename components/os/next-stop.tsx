'use client'

/* Small "next view" link card that closes a screen, so the demo path never dead-ends:
 * report -> /tpo -> /state -> /state/brief -> /schools -> /pilot. Hidden in print. */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

const NEXT: Bi = { en: 'Next view', hi: 'अगला दृश्य', hinglish: 'Next view' }

export function NextStop({ href, label, sub, className }: { href: string; label: Bi; sub?: Bi; className?: string }) {
  return (
    <div className={cn('no-print mt-10 flex justify-end', className)}>
      <Link
        href={href}
        className="group inline-flex max-w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left outline-none transition-colors hover:border-cyan-400/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <span className="min-w-0">
          <Tr b={NEXT} className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
          <Tr b={label} className="block text-[15px] font-semibold text-white" />
          {sub && <Tr b={sub} className="block text-[12px] text-gray-400" />}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  )
}
