'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { FastForward, NotebookPen, Play, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { useDemo, emitDemo } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import type { RoundId } from '@/lib/os/rounds'
import { useProctor } from '@/hooks/use-proctor'
import { DriveRail } from '@/components/os/drive-rail'
import { ProctorPanel } from '@/components/os/proctor-panel'
import { SignalsDrawer } from '@/components/os/signals-drawer'
import { cn } from '@/lib/utils'

const TXT = {
  notes: { en: "Sarthi's notes on you", hi: 'सारथी के नोट्स' },
  exit: { en: 'Exit', hi: 'बाहर' },
  skip: { en: 'Skip to result (demo)', hi: 'सीधे परिणाम (डेमो)' },
  autopilot: { en: 'Autopilot (A)', hi: 'ऑटोपायलट (A)' },
  ff: { en: 'Fast-forward (F)', hi: 'फ़ास्ट-फ़ॉरवर्ड (F)' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
  proctor: { en: 'Proctoring', hi: 'प्रॉक्टरिंग' },
  proctorDesc: { en: 'Camera, tab and paste checks for this round.', hi: 'इस राउंड के लिए कैमरा, टैब और पेस्ट जाँच।' },
  tabs: { en: 'tabs', hi: 'टैब' },
} satisfies Record<string, Bi>

// Body scroll lock, ref-counted so moving between rounds (unmount + mount) never leaves it stuck.
let lockCount = 0
let savedOverflow = ''
function lockBody() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}
function unlockBody() {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = savedOverflow === 'hidden' ? '' : savedOverflow
}

// While a shell with a sticky footer is open, the presenter dock sits above the footer (see globals.css).
let footerCount = 0
function markFooter(on: boolean) {
  if (typeof document === 'undefined') return
  footerCount = Math.max(0, footerCount + (on ? 1 : -1))
  if (footerCount > 0) document.body.setAttribute('data-drive-footer', '1')
  else document.body.removeAttribute('data-drive-footer')
}

const LG = '(min-width: 1024px)'
function useIsLg(): boolean {
  const [lg, setLg] = useState<boolean>(() => {
    try {
      return typeof window === 'undefined' ? true : window.matchMedia(LG).matches
    } catch {
      return true
    }
  })
  useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia(LG)
    } catch {
      return
    }
    const on = () => setLg(mq.matches)
    on()
    try {
      mq.addEventListener('change', on)
      return () => mq.removeEventListener('change', on)
    } catch {
      return
    }
  }, [])
  return lg
}

export interface DriveShellProps {
  round: RoundId
  title: Bi | string
  subtitle?: Bi | string
  timer?: ReactNode
  showProctor?: boolean
  detectTabs?: boolean
  children: ReactNode
  footer?: ReactNode
  /** Optional (additive): where Exit goes. Default '/placement'. */
  exitHref?: string
}

/** Full-screen exam shell (z-60) with top bar, round rail, Sarthi's notes and the proctor panel. */
export function DriveShell({
  round,
  title,
  subtitle,
  timer,
  showProctor = true,
  detectTabs = false,
  children,
  footer,
  exitHref = '/placement',
}: DriveShellProps) {
  const { presenter, blueprint, signals, integrity, lang } = useDemo()
  const [notesOpen, setNotesOpen] = useState(false)
  const [proctorOpen, setProctorOpen] = useState(false)
  const isLg = useIsLg()

  // Tab / paste detection must run even while the mobile proctor sheet is closed.
  useProctor({ active: showProctor || detectTabs, detectTabs })

  useEffect(() => {
    lockBody()
    return () => unlockBody()
  }, [])

  useEffect(() => {
    if (isLg) setProctorOpen(false)
  }, [isLg])

  const hasFooter = footer != null && footer !== false
  useEffect(() => {
    if (!hasFooter) return
    markFooter(true)
    return () => markFooter(false)
  }, [hasFooter])

  const tt = (b: Bi | string) => tr(b, lang)
  const span = (b: Bi | string, c?: string) => {
    const s = tt(b)
    const d = isDevanagari(s)
    return (
      <span lang={d ? 'hi' : 'en'} className={cn(d && 'font-deva', c)}>
        {s}
      </span>
    )
  }

  const nSignals = Array.isArray(signals) ? signals.length : 0
  const score = Math.round(integrity?.score ?? 100)
  const bpLabel = blueprint?.label ?? ''

  return (
    <div
      role="region"
      aria-label={tt(title)}
      data-drive-shell=""
      className="fixed inset-0 z-[60] flex flex-col overflow-auto overscroll-contain bg-[#0d1117] text-gray-100"
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(34,211,238,0.09),transparent_70%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#0d1117]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:px-5">
          <span className="relative hidden h-9 w-9 shrink-0 place-items-center sm:grid rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-px shadow-[0_0_24px_-6px_rgba(34,211,238,0.7)]">
            <span className="grid h-full w-full place-items-center rounded-[11px] bg-[#0d1117]">
              <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            {bpLabel && <p className="hidden truncate text-[12px] leading-tight text-gray-500 sm:block">{bpLabel}</p>}
            <h1 className="line-clamp-2 break-words text-[14px] font-semibold leading-[1.2] text-white sm:line-clamp-1 sm:text-base sm:leading-tight">{span(title)}</h1>
          </div>

          {timer != null && timer !== false && (
            <div className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[13px] font-semibold tabular-nums text-gray-100">
              {timer}
            </div>
          )}

          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="relative inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-2.5 text-[13px] font-medium text-violet-100 transition-colors hover:border-violet-300/50 hover:bg-violet-500/15"
            aria-label={tt(TXT.notes)}
          >
            <NotebookPen className="h-4 w-4 text-violet-300" aria-hidden />
            {span(TXT.notes, 'hidden md:inline')}
            {nSignals > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-violet-400 px-1 text-[12px] font-bold leading-none text-[#1b1035]">
                {nSignals}
              </span>
            )}
          </button>

          <Link
            href={exitHref}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[13px] font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
            {span(TXT.exit, 'hidden sm:inline')}
          </Link>
        </div>

        <div className="border-t border-white/[0.05]">
          <div className="mx-auto flex h-11 max-w-[1400px] items-center gap-3 px-3 sm:px-5">
            <DriveRail current={round} compact className="flex-1" />
            <div className="flex shrink-0 items-center gap-1.5">
              {presenter && (
                <>
                  <button
                    type="button"
                    onClick={() => emitDemo('autopilot')}
                    className="hidden h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white sm:inline-flex"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden />
                    {span(TXT.autopilot)}
                  </button>
                  <button
                    type="button"
                    onClick={() => emitDemo('fastforward')}
                    className="hidden h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white sm:inline-flex"
                  >
                    <FastForward className="h-3.5 w-3.5" aria-hidden />
                    {span(TXT.ff)}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => emitDemo('fastforward')}
                aria-label={tt(TXT.skip)}
                title={tt(TXT.skip)}
                className="inline-flex h-7 items-center whitespace-nowrap rounded-md px-1.5 text-[12px] text-gray-500 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-gray-200"
              >
                <FastForward className="h-4 w-4 sm:hidden" aria-hidden />
                {span(TXT.skip, 'hidden sm:inline')}
              </button>
              {showProctor && !isLg && (
                <button
                  type="button"
                  onClick={() => setProctorOpen(true)}
                  aria-label={tt(TXT.proctor)}
                  className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2 text-[12px] font-medium text-gray-200"
                >
                  <ShieldCheck className={cn('h-3.5 w-3.5', score >= 96 ? 'text-emerald-300' : 'text-amber-300')} aria-hidden />
                  <span className="tabular-nums text-white">{score}</span>
                  {detectTabs && <span className="tabular-nums text-gray-400">· {integrity?.tabSwitches ?? 0}/3</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'relative mx-auto w-full max-w-[1400px] flex-1 px-3 py-5 sm:px-5 sm:py-6',
          showProctor && isLg && 'grid grid-cols-[minmax(0,1fr)_280px] gap-6',
        )}
      >
        <div className="min-w-0">
          {subtitle && <p className="mb-4 text-[13px] text-gray-400">{span(subtitle)}</p>}
          {children}
        </div>
        {showProctor && isLg && (
          <aside className="sticky top-[120px] self-start">
            <ProctorPanel detectTabs={detectTabs} />
          </aside>
        )}
      </div>

      {hasFooter && (
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/[0.08] bg-[#0d1117]/90 backdrop-blur-xl">
          <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-5">{footer}</div>
        </div>
      )}

      {showProctor && !isLg && (
        <>
          <Sheet open={proctorOpen} onOpenChange={setProctorOpen}>
            <SheetContent
              side="bottom"
              className="max-h-[88vh] overflow-y-auto rounded-t-2xl border-white/10 bg-[#0d1117] px-4 pb-6 pt-5 text-gray-100"
            >
              <SheetTitle className="mb-1 text-base font-semibold text-white">{span(TXT.proctor)}</SheetTitle>
              <SheetDescription className="mb-3 text-[12px] text-gray-400">{span(TXT.proctorDesc)}</SheetDescription>
              {proctorOpen && <ProctorPanel compact detectTabs={detectTabs} />}
            </SheetContent>
          </Sheet>
        </>
      )}

      <SignalsDrawer open={notesOpen} onOpenChange={setNotesOpen} />
    </div>
  )
}
