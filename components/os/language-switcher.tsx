'use client'

import { usePathname } from 'next/navigation'
import { Languages } from 'lucide-react'
import { useDemo, useLang } from '@/lib/os/demo-store'
import { LANG_LABEL, PLANNED_LANGS, type Lang } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

const DEFAULT_OPTIONS: Lang[] = ['hi', 'en', 'hinglish']
const SHORT: Record<Lang, string> = { hi: 'हि', en: 'EN', hinglish: 'HG' }

/** Officer screens (/tpo, /state, /state/brief) render Hinglish as English: only हिंदी and EN are offered there. */
export function isOfficerPath(path: string | null | undefined): boolean {
  return /^\/(tpo|state)(\/|$)/.test(path ?? '')
}
const COMPACT: Record<Lang, string> = { hi: 'हिंदी', en: 'EN', hinglish: 'Hinglish' }

export interface LanguageSwitcherProps {
  value?: Lang
  onChange?: (lang: Lang) => void
  options?: Lang[]
  showPlanned?: boolean
  size?: 'sm' | 'md'
  /** Optional (additive): tight labels for the OS bar (हिंदी · EN · Hinglish; shorter below sm), no planned chips. */
  compact?: boolean
  className?: string
}

/** Segmented language control. Defaults to the store language; planned languages render as disabled chips. */
export function LanguageSwitcher({
  value,
  onChange,
  options,
  showPlanned = true,
  size = 'md',
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const { set } = useDemo()
  const effective = useLang()
  const path = usePathname()
  const officer = value == null && !options && isOfficerPath(path)
  const current: Lang = officer && effective === 'hinglish' ? 'en' : value ?? effective
  const opts = (Array.isArray(options) && options.length ? options : officer ? (['hi', 'en'] as Lang[]) : DEFAULT_OPTIONS).filter(
    (o, i, a) => (o === 'en' || o === 'hi' || o === 'hinglish') && a.indexOf(o) === i,
  )
  const sm = size === 'sm' || compact
  const planned = showPlanned && !compact

  const pick = (l: Lang) => {
    if (onChange) onChange(l)
    else set({ lang: l })
  }

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)}>
      <div
        role="radiogroup"
        aria-label="Language"
        className={cn(
          'inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5',
          sm ? 'h-8' : 'h-10',
        )}
      >
        {!compact && <Languages className={cn('mx-1.5 shrink-0 text-gray-500', sm ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden />}
        {opts.map((l) => {
          const active = current === l
          const label = compact ? COMPACT[l] : LANG_LABEL[l]
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={LANG_LABEL[l]}
              onClick={() => pick(l)}
              lang={l === 'hi' ? 'hi' : 'en'}
              className={cn(
                'relative h-full whitespace-nowrap rounded-md font-medium transition-all duration-200',
                sm ? 'px-2 text-[12px]' : 'px-3 text-[13px]',
                // Noto Sans Devanagari has deep descender metrics, so its glyphs sit high in a fixed-height pill.
                l === 'hi' && 'font-deva pt-[3px]',
                active
                  ? 'bg-gradient-to-b from-white/[0.14] to-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_2px_8px_-2px_rgba(0,0,0,0.6)]'
                  : 'text-gray-400 hover:text-gray-100',
              )}
            >
              {compact ? (
                <>
                  <span className="sm:hidden">{SHORT[l]}</span>
                  <span className="hidden sm:inline">{label}</span>
                </>
              ) : (
                label
              )}
            </button>
          )
        })}
      </div>
      {planned &&
        PLANNED_LANGS.map((p) => (
          <span
            key={p.id}
            aria-disabled="true"
            title={p.status === 'beta' ? 'Beta: coming in the pilot' : 'Planned'}
            className={cn(
              'inline-flex shrink-0 cursor-not-allowed select-none items-center gap-1 rounded-lg border border-dashed border-white/15 text-gray-500',
              sm ? 'h-8 px-2 text-[12px]' : 'h-10 px-2.5 text-[13px]',
            )}
          >
            <span lang={p.lang} dir={p.dir} className={cn(p.lang === 'mai' && 'font-deva')}>
              {p.label}
            </span>
            <span lang="en" className="text-[12px] text-gray-600">
              ({p.status})
            </span>
          </span>
        ))}
    </div>
  )
}
