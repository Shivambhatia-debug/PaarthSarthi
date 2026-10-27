'use client'

import { ArrowUpRight, FileText } from 'lucide-react'
import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import type { SourceRef } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

const AS_REPORTED: Bi = { en: 'As reported', hi: 'जैसा रिपोर्ट हुआ' }
const SOURCE: Bi = { en: 'Source', hi: 'स्रोत' }

export interface SourceNoteProps {
  sources: SourceRef[]
  note?: Bi | string
  className?: string
}

/** Slate "As reported · Source: …" footnote for department-reported figures. */
export function SourceNote({ sources, note, className }: SourceNoteProps) {
  const lang = useLang()
  const list = Array.isArray(sources) ? sources.filter(Boolean) : []
  const tag = tr(AS_REPORTED, lang)
  const src = tr(SOURCE, lang)
  const noteText = note ? tr(note, lang) : ''
  const hiTag = isDevanagari(tag)
  return (
    <p className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-snug text-slate-400', className)}>
      <span
        lang={hiTag ? 'hi' : 'en'}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-slate-500/30 bg-slate-500/10 px-1.5 py-0.5 font-medium text-slate-300',
          hiTag && 'font-deva',
        )}
      >
        <FileText className="h-3 w-3" aria-hidden />
        {tag}
      </span>
      {list.length > 0 && (
        <span lang={isDevanagari(src) ? 'hi' : 'en'} className={cn(isDevanagari(src) && 'font-deva')}>
          {src}:
        </span>
      )}
      {list.map((s, i) => (
        <span key={`${s.label}-${i}`} className="inline-flex items-center">
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-slate-300 underline decoration-slate-500/50 underline-offset-2 transition-colors hover:text-white hover:decoration-slate-300"
            >
              {s.label}
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </a>
          ) : (
            <span className="text-slate-300">{s.label}</span>
          )}
          {i < list.length - 1 && <span className="ml-1.5 text-slate-600">·</span>}
        </span>
      ))}
      {noteText && (
        <span
          lang={isDevanagari(noteText) ? 'hi' : 'en'}
          className={cn('text-slate-500', isDevanagari(noteText) && 'font-deva')}
        >
          {list.length > 0 ? '· ' : ''}
          {noteText}
        </span>
      )}
    </p>
  )
}
