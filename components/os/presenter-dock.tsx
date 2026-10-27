'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronDown,
  CornerDownRight,
  FastForward,
  Feather,
  Languages,
  Mic,
  MicOff,
  Navigation,
  Play,
  RotateCcw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { emitDemo, useDemo } from '@/lib/os/demo-store'
import type { Lang } from '@/lib/os/i18n'
import { notifyUrlChange } from '@/hooks/use-query-param'
import { markProctorGrace } from '@/hooks/use-proctor'
import { OS_ROLES, isRoleActive, normPath } from '@/components/os/os-bar'
import { isOfficerPath } from '@/components/os/language-switcher'
import { cn } from '@/lib/utils'

const JUMPS: { label: string; href: string }[] = [
  { label: 'Interview', href: '/placement/drive/interview' },
  { label: 'HR', href: '/placement/drive/hr' },
  { label: 'Report', href: '/placement/report' },
  { label: 'Secretary brief', href: '/state/brief' },
  { label: 'State Trust tab', href: '/state?tab=trust' },
  { label: 'TPO Purnea CE', href: '/tpo?college=pce-purnea' },
  { label: 'Preflight', href: '/placement-os?preflight=1' },
]

const LANG_CYCLE: Lang[] = ['en', 'hi', 'hinglish']
const LANG_SHORT: Record<Lang, string> = { en: 'EN', hi: 'हिं', hinglish: 'Hing' }
const COLLAPSE_KEY = 'ps_os_dock_collapsed'

const IGNORE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-hotkeys-off], [role="listbox"], [role="menu"], [role="textbox"]'

function isTypingTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof Element)) return false
  if (t instanceof HTMLElement && t.isContentEditable) return true
  try {
    return !!t.closest(IGNORE_SELECTOR)
  } catch {
    return false
  }
}

/** Presenter-only floating dock (z-70) with role jumps, demo controls and global hotkeys. */
export function PresenterDock() {
  const router = useRouter()
  const pathname = usePathname()
  const { state, set, reset, presenter } = useDemo()
  // Lazy initialiser is safe: the dock only mounts client-side, after the demo store hydrates.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggleCollapsed = (v: boolean) => {
    setCollapsed(v)
    try {
      window.localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  const pathRef = useRef(pathname)
  pathRef.current = pathname

  const jump = useCallback(
    (href: string) => {
      const same = normPath(href.split('?')[0]) === normPath(pathRef.current)
      try {
        router.push(href)
      } catch {
        if (typeof window !== 'undefined') window.location.assign(href)
      }
      if (same) {
        notifyUrlChange()
        setTimeout(notifyUrlChange, 120)
      }
    },
    [router],
  )

  const cycleLang = useCallback(() => {
    // Officer routes render Hinglish as English, so L toggles हिंदी <-> EN there (first press always visibly switches).
    const officer = isOfficerPath(pathRef.current)
    set((s) => {
      if (officer) return { lang: s.lang === 'hi' ? 'en' : 'hi' }
      const i = LANG_CYCLE.indexOf(s.lang)
      return { lang: LANG_CYCLE[(i + 1) % LANG_CYCLE.length] }
    })
  }, [set])

  const toggleVoice = useCallback(() => {
    set((s) => ({ voiceMode: s.voiceMode === 'scripted' ? 'live' : 'scripted' }))
  }, [set])

  const toggleLite = useCallback(() => set((s) => ({ lite: !s.lite })), [set])

  const doReset = useCallback(() => {
    markProctorGrace()
    let ok = false
    try {
      ok = window.confirm('Reset the demo? All runs, language and settings go back to defaults. Presenter mode stays on.')
    } catch {
      ok = false
    }
    if (!ok) return
    reset()
    emitDemo('reset')
    jump('/placement-os')
  }, [reset, jump])

  // Global hotkeys (presenter mode only; this component only mounts in presenter mode).
  const handlers = useRef({ jump, cycleLang, doReset })
  handlers.current = { jump, cycleLang, doReset }
  useEffect(() => {
    if (!presenter) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return
      const k = e.key
      if (/^[0-5]$/.test(k) && !e.shiftKey) {
        const role = OS_ROLES.find((r) => r.key === k)
        if (role) {
          e.preventDefault()
          handlers.current.jump(role.href)
        }
        return
      }
      const lk = k.length === 1 ? k.toLowerCase() : ''
      if (lk === 'r' && e.shiftKey) {
        e.preventDefault()
        handlers.current.doReset()
      } else if (lk === 'f' && !e.shiftKey) {
        e.preventDefault()
        emitDemo('fastforward')
      } else if (lk === 'a' && !e.shiftKey) {
        e.preventDefault()
        emitDemo('autopilot')
      } else if (lk === 'l' && !e.shiftKey) {
        e.preventDefault()
        handlers.current.cycleLang()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [presenter])

  const live = state.voiceMode !== 'scripted'

  if (collapsed) {
    return (
      <div className="ps-dock os-chrome no-print fixed bottom-4 right-4 z-[70] transition-[bottom] duration-300">
        <button
          type="button"
          onClick={() => toggleCollapsed(false)}
          aria-label="Open presenter dock"
          title="Presenter dock"
          className="group grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-[#0b0f17]/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] backdrop-blur transition-transform hover:scale-110"
        >
          <span className="relative flex h-3 w-3">
            {!state.lite && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-40" />}
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          </span>
        </button>
      </div>
    )
  }

  const icon =
    'inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60'
  const kbd = 'rounded border border-white/10 bg-white/5 px-1 font-mono text-[12px] leading-4 text-gray-500'
  const sep = <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-white/10 sm:block" aria-hidden />

  return (
    <div className="ps-dock os-chrome no-print fixed bottom-4 right-4 z-[70] transition-[bottom] duration-300">
      <div
        role="toolbar"
        aria-label="Presenter controls"
        className="relative flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17]/[0.93] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl"
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-blue-500/0 via-cyan-300/60 to-emerald-400/0" aria-hidden />
        <span className="flex shrink-0 items-center gap-1.5 pl-1.5 pr-1 text-[12px] font-semibold uppercase tracking-wider text-gray-500" title="Presenter mode">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          <span className="hidden xl:inline">Presenter</span>
        </span>

        {/* Role jumps 0-5 */}
        <div className="flex shrink-0 items-center gap-0.5">
          {OS_ROLES.map((r) => {
            const active = isRoleActive(pathname, r.href)
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => jump(r.href)}
                title={`${r.key} · ${r.label.en}`}
                aria-label={`${r.label.en} (${r.key})`}
                className={cn(
                  icon,
                  'w-8 px-0 font-mono text-[13px] font-semibold',
                  active ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/40' : 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                {r.key}
              </button>
            )
          })}
        </div>
        {sep}

        <button
          type="button"
          onClick={() => emitDemo('fastforward')}
          title="Fast-forward (F)"
          className={cn(icon, 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20')}
        >
          <FastForward className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden 2xl:inline">Fast-fwd</span>
          <span className={kbd}>F</span>
        </button>
        <button
          type="button"
          onClick={() => emitDemo('autopilot')}
          title="Autopilot (A)"
          className={cn(icon, 'border border-violet-400/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20')}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden 2xl:inline">Autopilot</span>
          <span className={kbd}>A</span>
        </button>
        {sep}

        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={live}
          title={live ? 'Mic: Live (click for Scripted)' : 'Mic: Scripted (click for Live)'}
          className={cn(icon, live ? 'text-cyan-200 hover:bg-cyan-400/10' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]')}
        >
          {live ? <Mic className="h-3.5 w-3.5" aria-hidden /> : <MicOff className="h-3.5 w-3.5" aria-hidden />}
          {live ? 'Live' : 'Scripted'}
        </button>
        <button
          type="button"
          onClick={toggleLite}
          aria-pressed={state.lite}
          title={state.lite ? 'Lite mode on (reduced motion)' : 'Lite mode off'}
          className={cn(icon, state.lite ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30' : 'text-gray-400 hover:bg-white/[0.06] hover:text-white')}
        >
          <Feather className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden 2xl:inline">Lite</span>
        </button>
        <button
          type="button"
          onClick={cycleLang}
          title="Cycle language (L)"
          className={cn(icon, 'text-gray-300 hover:bg-white/[0.06] hover:text-white')}
        >
          <Languages className="h-3.5 w-3.5" aria-hidden />
          <span lang={state.lang === 'hi' ? 'hi' : 'en'} className={cn(state.lang === 'hi' && 'font-deva')}>
            {LANG_SHORT[isOfficerPath(pathname) && state.lang === 'hinglish' ? 'en' : state.lang] ?? 'EN'}
          </span>
        </button>
        {sep}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" title="Jump to a demo moment" className={cn(icon, 'text-gray-200 hover:bg-white/[0.06]')}>
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden 2xl:inline">Jump</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-64 border-white/10 bg-[#11161f] text-gray-200">
            <DropdownMenuLabel className="text-[12px] font-medium uppercase tracking-wide text-gray-500">Jump to</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            {JUMPS.map((j) => (
              <DropdownMenuItem
                key={j.href}
                onSelect={() => jump(j.href)}
                className="flex cursor-pointer items-center justify-between gap-3 text-[13px] focus:bg-white/[0.06] focus:text-white"
              >
                <span className="flex items-center gap-2">
                  <CornerDownRight className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                  {j.label}
                </span>
                <span className="truncate font-mono text-[12px] text-gray-500">{j.href}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={doReset}
          title="Reset demo (Shift+R)"
          aria-label="Reset demo"
          className={cn(icon, 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200')}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          <span className={cn(kbd, 'hidden sm:inline')}>⇧R</span>
        </button>
        <button
          type="button"
          onClick={() => toggleCollapsed(true)}
          aria-label="Collapse presenter dock"
          title="Collapse to a dot"
          className={cn(icon, 'w-8 px-0 text-gray-500 hover:bg-white/[0.06] hover:text-white')}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
