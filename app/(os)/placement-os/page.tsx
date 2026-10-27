'use client'

/* /placement-os: the pitch opener and QR landing page. A short problem story (HeroStory), the
 * Department's reported numbers, the inputs -> outcomes strip, then five view cards and the live ticker.
 * ?preflight=1 shows the presenter pre-flight checklist first. */

import { useCallback, useState, type ReactNode } from 'react'
import { HeroStory } from '@/components/pitch/hero-story'
import { ReportedBars } from '@/components/pitch/reported-bars'
import { InputsOutcomes } from '@/components/pitch/inputs-outcomes'
import { ViewCards } from '@/components/pitch/view-cards'
import { PreflightPanel } from '@/components/pitch/preflight-panel'
import { LiveTicker } from '@/components/ai/live-ticker'
import { useQueryParam } from '@/hooks/use-query-param'
import { cn } from '@/lib/utils'

function Reveal({ ready, i, className, children }: { ready: boolean; i: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn('min-w-0', ready ? 'os-rise' : 'opacity-0', className)}
      style={ready ? { animationDelay: `${i * 60}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default function PlacementOSPage() {
  const preflight = useQueryParam('preflight') === '1'
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-8 pt-6 sm:pt-10">
      {preflight && <PreflightPanel className="mb-10" />}

      <HeroStory onReady={onReady} />

      <Reveal ready={ready} i={1} className="mt-14 sm:mt-16">
        <ReportedBars active={ready} />
      </Reveal>

      <Reveal ready={ready} i={2} className="mt-14 sm:mt-16">
        <InputsOutcomes />
      </Reveal>

      <div className="mt-14 sm:mt-16">
        <ViewCards active={ready} />
      </div>

      <Reveal ready={ready} i={3} className="no-print mt-12">
        <LiveTicker />
      </Reveal>
    </div>
  )
}
