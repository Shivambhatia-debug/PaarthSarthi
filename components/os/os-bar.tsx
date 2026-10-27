'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, GraduationCap, Landmark, LayoutGrid, Mic, MicOff, Rocket, School, Sparkles } from 'lucide-react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { LanguageSwitcher } from '@/components/os/language-switcher'
import { useDemo } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export const OS_ROLES: { key: string; href: string; label: Bi; Icon: typeof Sparkles }[] = [
  { key: '0', href: '/placement-os', label: { en: 'Overview', hi: 'अवलोकन' }, Icon: LayoutGrid },
  { key: '1', href: '/placement', label: { en: 'Student', hi: 'छात्र' }, Icon: GraduationCap },
  { key: '2', href: '/tpo', label: { en: 'College T&P', hi: 'कॉलेज T&P' }, Icon: Building2 },
  { key: '3', href: '/state', label: { en: 'DSTTE State', hi: 'DSTTE राज्य' }, Icon: Landmark },
  { key: '4', href: '/schools', label: { en: 'School', hi: 'स्कूल' }, Icon: School },
  { key: '5', href: '/pilot', label: { en: 'Pilot', hi: 'पायलट' }, Icon: Rocket },
]

/** Trailing-slash-normalised pathname. */
export function normPath(p: string | null | undefined): string {
  if (!p) return '/'
  const q = p.split(/[?#]/)[0]
  return q.length > 1 && q.endsWith('/') ? q.slice(0, -1) : q
}

/** Active by prefix on a path-segment boundary, so /placement-os never marks /placement active. */
export function isRoleActive(pathname: string | null | undefined, href: string): boolean {
  const p = normPath(pathname)
  return p === href || p.startsWith(href + '/')
}

/** Scroll-aware edge fade for a horizontally scrolling strip; also centres the `active` child on change. */
function useScrollStrip<T extends HTMLElement>(activeSelector: string, dep: unknown) {
  const ref = useRef<T | null>(null)
  const [edges, setEdges] = useState<{ l: boolean; r: boolean }>({ l: false, r: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const l = el.scrollLeft > 2
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      setEdges((p) => (p.l === l && p.r === r ? p : { l, r }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      ro.observe(el)
    }
    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const a = el.querySelector<HTMLElement>(activeSelector)
    if (!a) return
    const er = el.getBoundingClientRect()
    const ar = a.getBoundingClientRect()
    const left = el.scrollLeft + (ar.left - er.left) - (el.clientWidth - ar.width) / 2
    el.scrollLeft = Math.max(0, left)
  }, [activeSelector, dep])

  const mask =
    edges.l && edges.r
      ? 'linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 28px), transparent)'
      : edges.r
        ? 'linear-gradient(to right, #000 calc(100% - 28px), transparent)'
        : edges.l
          ? 'linear-gradient(to right, transparent, #000 24px)'
          : undefined
  const style = mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined
  return { ref, style }
}

const MIC_TIP: Bi = {
  en: 'Live: real browser speech recognition. Scripted: canned answers, no microphone.',
  hi: 'लाइव: ब्राउज़र की असली स्पीच पहचान। स्क्रिप्टेड: पहले से तय उत्तर, माइक नहीं।',
}

/** Sticky OS sub-bar under the site header: brand, role switcher, honesty chip, language, mic mode. */
export function OSBar() {
  const pathname = usePathname()
  const { state, set, presenter, hydrated, lang } = useDemo()
  const live = state.voiceMode !== 'scripted'
  const strip = useScrollStrip<HTMLElement>('[aria-current="page"]', normPath(pathname))

  return (
    <div className="os-chrome no-print sticky top-12 z-40 h-11 border-b border-white/[0.06] bg-[#0d1117]/85 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-500/0 via-cyan-400/40 to-emerald-400/0"
        aria-hidden
      />
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          href="/placement-os"
          className="group flex shrink-0 items-center gap-2 rounded-md pr-1 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          aria-label="ParthSarthi Placement OS"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-px shadow-[0_0_16px_-4px_rgba(34,211,238,0.7)]">
            <span className="grid h-full w-full place-items-center rounded-[7px] bg-[#0d1117] transition-colors group-hover:bg-[#0d1117]/70">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
            </span>
          </span>
          <span className="hidden whitespace-nowrap text-[13px] font-semibold tracking-tight text-white sm:inline">
            <span className="hidden xl:inline">ParthSarthi </span>
            <span className="ai-gradient-text">Placement OS</span>
          </span>
        </Link>

        <span className="hidden h-5 w-px shrink-0 bg-white/10 sm:block" aria-hidden />

        <nav
          ref={strip.ref}
          style={strip.style}
          aria-label="Placement OS roles"
          className="flex h-full min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-hide"
        >
          {OS_ROLES.map((r) => {
            const active = isRoleActive(pathname, r.href)
            const s = tr(r.label, lang)
            const deva = isDevanagari(s)
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors sm:text-[13px]',
                  active ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-100',
                )}
              >
                <r.Icon className={cn('hidden h-3.5 w-3.5 shrink-0 2xl:block', active ? 'text-cyan-300' : 'text-gray-500')} aria-hidden />
                <span lang={deva ? 'hi' : 'en'} className={cn('whitespace-nowrap', deva && 'font-deva')}>
                  {s}
                </span>
                {presenter && (
                  <kbd className="hidden rounded border border-white/10 bg-white/5 px-1 font-mono text-[12px] leading-4 text-gray-500 lg:inline">
                    {r.key}
                  </kbd>
                )}
                {active && (
                  <span
                    className="absolute inset-x-2 -bottom-[5px] h-[2px] rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400"
                    aria-hidden
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className={cn('flex shrink-0 items-center gap-1.5 transition-opacity duration-300 sm:gap-2', hydrated ? 'opacity-100' : 'opacity-0')}>
          <IllustrativeChip responsive />
          <LanguageSwitcher compact />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => set({ voiceMode: live ? 'scripted' : 'live' })}
                  aria-pressed={live}
                  className={cn(
                    'hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors sm:inline-flex',
                    live
                      ? 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200 hover:bg-cyan-400/15'
                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-200',
                  )}
                >
                  {live ? <Mic className="h-3.5 w-3.5" aria-hidden /> : <MicOff className="h-3.5 w-3.5" aria-hidden />}
                  {live ? 'Live' : 'Scripted'}
                </button>
              </TooltipTrigger>
              <TooltipPrimitive.Portal>
                <TooltipContent side="bottom" className="max-w-[260px] border-white/10 bg-[#161b22] text-[12px] leading-snug text-gray-200">
                  <span lang={lang === 'hi' ? 'hi' : 'en'} className={cn(lang === 'hi' && 'font-deva')}>
                    {tr(MIC_TIP, lang)}
                  </span>
                </TooltipContent>
              </TooltipPrimitive.Portal>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
