'use client'

import { ArrowRight, Scale } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import { INTERVIEW_SPLIT } from '@/lib/os/rounds'
import { interviewPillar } from '@/lib/os/scoring'
import type { Bi } from '@/lib/os/i18n'
import type { PersonaRunId } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

const TITLE: Bi = { en: 'Language-fair interview score', hi: 'भाषा-निष्पक्ष इंटरव्यू स्कोर', hinglish: 'Language-fair interview score' }
const CONTENT: Bi = { en: 'Technical content', hi: 'तकनीकी कंटेंट', hinglish: 'Technical content' }
const CONTENT_SUB: Bi = { en: 'language-neutral', hi: 'भाषा से स्वतंत्र', hinglish: 'language-neutral' }
const DELIVERY: Bi = { en: 'English delivery', hi: 'अंग्रेज़ी डिलीवरी', hinglish: 'English delivery' }
const DELIVERY_SUB: Bi = { en: 'scored separately', hi: 'अलग से स्कोर', hinglish: 'alag se score' }
const PILLAR: Bi = { en: 'Interview pillar', hi: 'इंटरव्यू पिलर', hinglish: 'Interview pillar' }
const WEIGHT: Bi = { en: '70% content · 30% delivery', hi: '70% कंटेंट · 30% डिलीवरी', hinglish: '70% content · 30% delivery' }
const PROMISE: Bi = {
  en: 'Hindi-medium students are never marked down for knowledge.',
  hi: 'हिंदी-माध्यम के छात्रों के ज्ञान के अंक कभी नहीं काटे जाते।',
  hinglish: 'Hindi-medium students ke knowledge ke marks kabhi nahi kaate jaate.',
}

export function fairnessLine(personaId: PersonaRunId | string): string {
  const s = INTERVIEW_SPLIT[personaId === 'rahul' ? 'rahul' : 'priya']
  return `Technical content ${s.content} (language-neutral) · English delivery ${s.delivery} (scored separately) → Interview pillar ${interviewPillar(s.content, s.delivery)}`
}

function Bar({ value, tone }: { value: number; tone: 'content' | 'delivery' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          tone === 'content' ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400' : 'bg-gradient-to-r from-amber-400/80 to-amber-300/80',
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function FairnessCard({ personaId, className }: { personaId: PersonaRunId | string; className?: string }) {
  const split = INTERVIEW_SPLIT[personaId === 'rahul' ? 'rahul' : 'priya']
  const pillar = interviewPillar(split.content, split.delivery)

  return (
    <section
      aria-label={fairnessLine(personaId)}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.06] via-white/[0.02] to-cyan-400/[0.05] p-4 sm:p-5',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300">
          <Scale className="h-4 w-4" aria-hidden />
        </span>
        <Tr b={TITLE} as="h3" className="text-sm font-semibold text-white" />
      </div>

      <div className="relative mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
              <span className="text-gray-200">
                <Tr b={CONTENT} /> <Tr b={CONTENT_SUB} className="text-[12px] text-gray-500" />
              </span>
              <span className="font-semibold tabular-nums text-emerald-300">{split.content}</span>
            </div>
            <Bar value={split.content} tone="content" />
          </div>
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
              <span className="text-gray-200">
                <Tr b={DELIVERY} /> <Tr b={DELIVERY_SUB} className="text-[12px] text-gray-500" />
              </span>
              <span className="font-semibold tabular-nums text-amber-300">{split.delivery}</span>
            </div>
            <Bar value={split.delivery} tone="delivery" />
          </div>
        </div>
        <ArrowRight className="mx-auto hidden h-5 w-5 text-gray-500 sm:block" aria-hidden />
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1117]/60 px-4 py-3 sm:flex-col sm:gap-1 sm:text-center">
          <span className="bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-3xl font-bold tabular-nums text-transparent">
            {pillar}
          </span>
          <div className="sm:text-center">
            <Tr b={PILLAR} as="p" className="text-[12px] font-medium text-gray-200" />
            <Tr b={WEIGHT} as="p" className="text-[12px] text-gray-500" />
          </div>
        </div>
      </div>

      <p className="relative mt-4 border-t border-white/[0.06] pt-3 text-[13px] text-emerald-200/90">
        <Tr b={PROMISE} />
      </p>
    </section>
  )
}
