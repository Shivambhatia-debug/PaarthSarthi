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
import { QrCode, DEMO_LINK_TEXT } from '@/components/pitch/leave-behind'
import { Tr } from '@/components/os/tr-text'
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

      <Reveal ready={ready} i={3} className="mt-12">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center sm:flex-row sm:text-left">
          <QrCode size={104} />
          <div className="min-w-0">
            <Tr
              as="p"
              b={{ en: 'Open this demo on your phone', hi: 'यह डेमो अपने फ़ोन पर खोलें', hinglish: 'Yeh demo apne phone par kholiye' }}
              className="text-[16px] font-semibold text-white"
            />
            <Tr
              as="p"
              b={{ en: 'Every screen in this pitch, with illustrative data.', hi: 'इस प्रस्तुति की हर स्क्रीन, उदाहरण डेटा के साथ।', hinglish: 'Is pitch ki har screen, illustrative data ke saath.' }}
              className="mt-1 text-[14px] text-gray-400"
            />
            <p className="mt-1 break-all font-mono text-[13px] text-cyan-300">{DEMO_LINK_TEXT}</p>
          </div>
        </div>
      </Reveal>

      <Reveal ready={ready} i={4} className="no-print mt-12">
        <LiveTicker />
      </Reveal>
    </div>
  )
}
