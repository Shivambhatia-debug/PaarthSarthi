'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DemoProvider, useDemo } from '@/lib/os/demo-store'
import { OSBar } from '@/components/os/os-bar'
import { OSPageSkeleton } from '@/components/os/os-skeleton'
import { PresenterDock } from '@/components/os/presenter-dock'
import { TrustStrip } from '@/components/os/trust-strip'
import { cn } from '@/lib/utils'

/** Client chrome for every app/(os) route: demo store, OS bar, trust strip, presenter dock, toasts. */
export function OSChrome({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <TooltipProvider delayDuration={150}>
        <ChromeInner>{children}</ChromeInner>
      </TooltipProvider>
    </DemoProvider>
  )
}

function ChromeInner({ children }: { children: ReactNode }) {
  const { state, hydrated, presenter, setPresenter } = useDemo()
  const presenterParamRead = useRef(false)

  // ?presenter=1 turns presenter mode on (persisted), ?presenter=0 turns it off.
  // Runs after hydration so the stored flag never overrides the URL.
  useEffect(() => {
    if (!hydrated || presenterParamRead.current) return
    presenterParamRead.current = true
    try {
      const p = new URLSearchParams(window.location.search).get('presenter')
      if (p === '1') setPresenter(true)
      else if (p === '0') setPresenter(false)
    } catch {
      /* ignore */
    }
  }, [hydrated, setPresenter])

  return (
    <div className={cn('os-root min-h-screen bg-[#0d1117] text-gray-100', state.lite && 'os-lite')}>
      <OSBar />
      <main className="pb-24">{hydrated ? children : <OSPageSkeleton />}</main>
      <TrustStrip />
      {presenter && <PresenterDock />}
      <Toaster
        position="top-right"
        closeButton
        offset={{ top: 56, right: 20 }}
        mobileOffset={{ top: 56, left: 12, right: 12 }}
      />
    </div>
  )
}
