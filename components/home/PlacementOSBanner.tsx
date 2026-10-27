/* Home banner for ParthSarthi Placement OS (P1, fix 45).
 * Pure: no useDemo, aiToast, sonner or demo-store consumers, so it renders on "/" without a
 * DemoProvider or Toaster. Only lucide icons, next/link and the pure AIBadge. */

import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap, School } from 'lucide-react'
import { AIBadge } from '@/components/ai/ai-badge'

export function PlacementOSBanner() {
  return (
    <section aria-label="ParthSarthi Placement OS for Bihar" className="container mx-auto px-4 pb-6 sm:pb-8">
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-500/60 via-cyan-400/50 to-emerald-400/60 p-px shadow-[0_0_40px_-18px_rgba(34,211,238,0.6)]">
        <div className="relative overflow-hidden rounded-[15px] bg-[#0b111c] px-4 py-4 sm:px-5 lg:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/2 h-32 w-56 -translate-y-1/2 rounded-full bg-cyan-400/[0.08] blur-3xl"
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <AIBadge />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                  New · Placement OS for Bihar
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-300 sm:text-[15px]">
                AI mock interviews, a Placement Readiness Index and drive matching for Bihar&apos;s engineering
                colleges and polytechnics.
              </p>
              <Link
                href="/placement-os"
                className="mt-1.5 inline-flex items-center gap-1.5 rounded text-xs font-medium text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                For institutions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:shrink-0">
              <Link
                href="/placement"
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(34,211,238,0.8)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-left">Engineering / Polytechnic: Start Placement Day</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/schools"
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                <School className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                <span className="text-left">Govt School 9-12: Apna career khojo</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
