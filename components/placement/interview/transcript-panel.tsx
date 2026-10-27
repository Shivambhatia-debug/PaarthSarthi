'use client'

import { useEffect, useRef } from 'react'
import { MessagesSquare, Sparkles, UserRound } from 'lucide-react'
import { markFillers } from '@/lib/ai-sim'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import type { IQ } from '@/components/placement/interview/script'
import { cn } from '@/lib/utils'

const L = {
  title: { en: 'Live transcript', hi: 'लाइव ट्रांसक्रिप्ट', hinglish: 'Live transcript' },
  live: { en: 'Browser speech', hi: 'ब्राउज़र स्पीच', hinglish: 'Browser speech' },
  scripted: { en: 'Scripted answer', hi: 'स्क्रिप्टेड उत्तर', hinglish: 'Scripted answer' },
  empty: { en: 'Sarthi’s questions and your answers appear here.', hi: 'सारथी के सवाल और आपके जवाब यहाँ दिखेंगे।', hinglish: 'Sarthi ke sawaal aur aapke jawab yahan dikhenge.' },
  listening: { en: 'Listening… speak in Hindi, English or Hinglish', hi: 'सुन रहा है… हिंदी, अंग्रेज़ी या हिंग्लिश में बोलिए', hinglish: 'Sun raha hai… Hindi, English ya Hinglish mein boliye' },
  you: { en: 'You', hi: 'आप', hinglish: 'Aap' },
  sarthi: { en: 'Sarthi', hi: 'सारथी', hinglish: 'Sarthi' },
  fillerKey: { en: 'filler', hi: 'फ़िलर', hinglish: 'filler' },
} satisfies Record<string, Bi>

export interface TranscriptEntry {
  q: IQ
  /** Question text as shown (may be partial while Sarthi speaks). */
  question: string
  answer: { final: string; interim: string } | null
  source: 'live' | 'scripted' | null
  active: boolean
  listening: boolean
}

function FillerText({ text }: { text: string }) {
  const parts = markFillers(text)
  return (
    <>
      {parts.map((p, i) =>
        p.filler ? (
          <span key={i} className="rounded-sm bg-amber-400/10 text-amber-100 underline decoration-amber-400 decoration-2 underline-offset-[5px]">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}

function Answer({ final, interim }: { final: string; interim: string }) {
  const deva = isDevanagari(`${final} ${interim}`)
  return (
    <p lang={deva ? 'hi' : 'en'} className={cn('whitespace-pre-line break-words text-[14px] leading-relaxed text-white', deva && 'font-deva')}>
      <FillerText text={final} />
      {interim && (
        <span className="text-gray-400">
          {final ? ' ' : ''}
          {interim}
        </span>
      )}
    </p>
  )
}

export function TranscriptPanel({ entries, className }: { entries: TranscriptEntry[]; className?: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  const last = entries[entries.length - 1]
  const tailKey = `${entries.length}:${last?.question.length ?? 0}:${last?.answer?.final.length ?? 0}:${last?.answer?.interim.length ?? 0}`

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    // Scroll only the panel (never the page / drive shell).
    el.scrollTop = el.scrollHeight
  }, [tailKey])

  const source = last?.source

  return (
    <section className={cn('flex flex-col rounded-2xl border border-white/10 bg-white/[0.03]', className)} aria-label="Transcript">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={L.title} as="h3" className="text-[13px] font-semibold text-gray-100" />
        </div>
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <span className="hidden items-center gap-1 sm:inline-flex">
            <span className="h-0.5 w-3 rounded bg-amber-400" aria-hidden />
            <Tr b={L.fillerKey} />
          </span>
          {source && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-medium',
                source === 'live' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.05] text-gray-400',
              )}
            >
              <Tr b={source === 'live' ? L.live : L.scripted} />
            </span>
          )}
        </div>
      </div>

      <div ref={scroller} className="max-h-[300px] min-h-[160px] flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 lg:max-h-[340px]" aria-live="polite">
        {entries.length === 0 && <Tr b={L.empty} as="p" className="text-[13px] text-gray-500" />}
        {entries.map((e) => {
          const qDeva = isDevanagari(e.question)
          const follow = e.q.kind === 'followup'
          return (
            <div key={e.q.id} className={cn('space-y-2 transition-opacity', !e.active && 'opacity-75')}>
              {/* Sarthi */}
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full',
                    follow ? 'bg-gradient-to-br from-violet-400 to-fuchsia-400' : 'bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400',
                  )}
                  aria-hidden
                >
                  <Sparkles className="h-3 w-3 text-[#0d1117]" />
                </span>
                <div
                  className={cn(
                    'min-w-0 max-w-[92%] rounded-2xl rounded-tl-sm border px-3 py-2',
                    follow ? 'border-violet-400/25 bg-violet-500/[0.08]' : 'border-cyan-400/15 bg-cyan-400/[0.05]',
                  )}
                >
                  <p className="mb-0.5 text-[12px] font-semibold text-gray-400">
                    <Tr b={L.sarthi} /> · {e.q.id}
                  </p>
                  <p lang={qDeva ? 'hi' : 'en'} className={cn('break-words text-[14px] leading-relaxed text-gray-100', qDeva && 'font-deva')}>
                    {e.question}
                  </p>
                </div>
              </div>

              {/* Student */}
              {(e.answer && (e.answer.final || e.answer.interim)) || e.listening ? (
                <div className="flex items-start justify-end gap-2">
                  <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/[0.05] px-3 py-2">
                    <p className="mb-0.5 text-right text-[12px] font-semibold text-gray-400">
                      <Tr b={L.you} />
                    </p>
                    {e.answer && (e.answer.final || e.answer.interim) ? (
                      <Answer final={e.answer.final} interim={e.answer.interim} />
                    ) : (
                      <p className="flex items-center gap-2 text-[13px] text-gray-400">
                        <span className="flex gap-1" aria-hidden>
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
                        </span>
                        <Tr b={L.listening} />
                      </p>
                    )}
                  </div>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-gray-300" aria-hidden>
                    <UserRound className="h-3.5 w-3.5" />
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
