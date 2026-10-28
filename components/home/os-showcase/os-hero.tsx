'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Languages, LockKeyhole, Play, ShieldCheck } from 'lucide-react'
import { AIBadge } from '@/components/ai/ai-badge'
import { DemoDialog } from './demo-dialog'
import { ProductFilm } from './product-film'
import { GRADIENT_TEXT, HonestyChip, ShowcaseStyles } from './shared'

const TRUST = [
  { icon: ShieldCheck, label: 'DPIIT certified', tone: 'text-emerald-400' },
  { icon: Languages, label: 'Hindi-first', tone: 'text-cyan-300' },
  { icon: LockKeyhole, label: 'DPDP-aligned by design', tone: 'text-blue-400' },
]

/** First section on "/": the ParthSarthi AI Placement & Career OS, with the product film. */
export function OSHero() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section id="placement-os" aria-labelledby="os-hero-title" className="relative scroll-mt-16 overflow-hidden">
      <ShowcaseStyles />

      {/* Backdrop: soft spotlight + faint grid, masked to the top */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[560px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.13),rgba(59,130,246,0.06)_55%,transparent)]" />
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-[1160px] pb-14 pt-7 sm:pt-12 lg:pb-20 lg:pt-14">
          {/* Header: headline left, pitch + CTAs right (stacked on mobile). The film runs full width below. */}
          <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-gray-300 backdrop-blur">
                <AIBadge className="shrink-0" />
                <span className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 py-px text-xs font-bold tracking-wide text-emerald-300">
                  NEW
                </span>
                <span className="truncate">
                  AI Placement &amp; Career OS<span className="hidden sm:inline"> for Bihar</span>
                </span>
              </div>

              <h1
                id="os-hero-title"
                className="mt-4 text-[2.3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:mt-5 sm:text-5xl lg:text-[3.4rem] xl:text-[3.85rem]"
              >
                <span className="block">Har student</span>
                <span className={`block pb-1 ${GRADIENT_TEXT}`}>interview-ready.</span>
                <span className="mt-1.5 block text-[1.3rem] font-medium leading-tight tracking-[-0.015em] text-gray-300 sm:mt-2 sm:text-[1.6rem] xl:text-[1.8rem]">
                  Bihar&apos;s AI Placement &amp; Career OS
                </span>
              </h1>
            </div>

            <div className="min-w-0 lg:pb-1.5">
              <p lang="hi" className="text-base text-gray-300 sm:text-lg">
                हर छात्र के साथ एक AI कोच, हिंदी में भी।
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-400 sm:text-base">
                <span className="sm:hidden">Aptitude, DSA, AI voice interview, readiness index.</span>
                <span className="hidden sm:inline">
                  Aptitude, DSA and an AI voice interview in Hindi, English or Hinglish, then a Placement Readiness Index
                  and the drives you qualify for.
                </span>
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <Link
                  href="/placement/"
                  className="group relative inline-flex h-12 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3 text-[14px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(34,211,238,0.8)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a13] sm:px-6 sm:text-[15px]"
                >
                  <span
                    aria-hidden
                    className="psx-sheen pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.28)_50%,transparent_65%)]"
                  />
                  <span className="relative truncate">Start Placement Day</span>
                  <ArrowRight className="relative hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="group inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] pl-2 pr-3 text-[14px] font-semibold text-gray-100 transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:gap-2.5 sm:pr-5 sm:text-[15px]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#060a13] transition-transform group-hover:scale-105">
                    <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden />
                  </span>
                  <span className="truncate">
                    <span className="hidden sm:inline">Watch </span>70-sec demo
                  </span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <Link
                  href="/placement-os/"
                  className="group inline-flex items-center gap-1 rounded text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  For colleges &amp; DSTTE
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  href="/schools/"
                  className="group inline-flex items-center gap-1 rounded text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Govt school (9–12)
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Product film: wide, so the recorded UI reads at near-native size */}
          <div className="mt-8 min-w-0 sm:mt-10 lg:mt-12">
            <ProductFilm externalPause={demoOpen} />
          </div>

          {/* Trust row */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[13px] text-gray-400">
            {TRUST.map((t) => (
              <li key={t.label} className="inline-flex items-center gap-1.5">
                <t.icon className={`h-4 w-4 ${t.tone}`} aria-hidden />
                {t.label}
              </li>
            ))}
            <li>
              <HonestyChip />
            </li>
          </ul>
        </div>
      </div>

      <DemoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  )
}
