'use client'

import { useState } from 'react'
import { BookOpenCheck, Check, ClipboardCheck, Languages, Lightbulb } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { AIBadge } from '@/components/ai/ai-badge'
import { AIThinking } from '@/components/ai/ai-thinking'
import { StreamingText } from '@/components/ai/streaming-text'
import { tipFor, type Gender, type IQ } from '@/components/placement/interview/script'
import type { AnswerResult, Stage, Star } from '@/components/placement/interview/use-interview-engine'
import { cn } from '@/lib/utils'

const L = {
  title: { en: 'Answer scorecard', hi: 'उत्तर स्कोरकार्ड', hinglish: 'Answer scorecard' },
  waiting: { en: 'Scores appear as soon as you finish answering.', hi: 'जवाब पूरा होते ही स्कोर दिखेंगे।', hinglish: 'Jawab poora hote hi score dikhenge.' },
  thinking: { en: 'Analysing your answer…', hi: 'आपके उत्तर का विश्लेषण हो रहा है…', hinglish: 'Aapke answer ka analysis ho raha hai…' },
  correctness: { en: 'Correctness', hi: 'सही होना', hinglish: 'Correctness' },
  depth: { en: 'Depth', hi: 'गहराई', hinglish: 'Depth' },
  clarity: { en: 'Clarity', hi: 'स्पष्टता', hinglish: 'Clarity' },
  star: { en: 'STAR structure', hi: 'STAR ढाँचा', hinglish: 'STAR structure' },
  content: { en: 'Content', hi: 'कंटेंट', hinglish: 'Content' },
  contentSub: { en: 'language-neutral', hi: 'भाषा से स्वतंत्र', hinglish: 'language-neutral' },
  delivery: { en: 'Delivery', hi: 'डिलीवरी', hinglish: 'Delivery' },
  deliverySub: { en: 'scored separately', hi: 'अलग से स्कोर', hinglish: 'alag se score' },
  fair: {
    en: 'Language-fair scoring: content scored separately from English delivery',
    hi: 'भाषा-निष्पक्ष स्कोरिंग: कंटेंट का स्कोर अंग्रेज़ी डिलीवरी से अलग',
    hinglish: 'Language-fair scoring: content ka score English delivery se alag',
  },
  tip: { en: 'Sarthi’s tip', hi: 'सारथी की सलाह', hinglish: 'Sarthi ki tip' },
  model: { en: 'Show model answer', hi: 'मॉडल उत्तर देखें', hinglish: 'Model answer dekhein' },
  hideModel: { en: 'Hide model answer', hi: 'मॉडल उत्तर छिपाएँ', hinglish: 'Model answer chhupayein' },
  modelTitle: { en: 'Model answer', hi: 'मॉडल उत्तर', hinglish: 'Model answer' },
} satisfies Record<string, Bi>

const STAR_LABEL: Record<keyof Star, Bi> = {
  S: { en: 'Situation', hi: 'स्थिति', hinglish: 'Situation' },
  T: { en: 'Task', hi: 'काम', hinglish: 'Task' },
  A: { en: 'Action', hi: 'कदम', hinglish: 'Action' },
  R: { en: 'Result', hi: 'नतीजा', hinglish: 'Result' },
}

function ScoreBar({ label, value }: { label: Bi; value: number }) {
  const pct = Math.max(0, Math.min(10, value)) * 10
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <Tr b={label} className="text-gray-300" />
        <span className="font-semibold tabular-nums text-white">
          {value}
          <span className="text-gray-500">/10</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="animate-in slide-in-from-left-full h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StarTicks({ star }: { star: Star }) {
  return (
    <div>
      <Tr b={L.star} as="p" className="mb-1.5 text-[12px] font-medium text-gray-400" />
      <div className="grid grid-cols-4 gap-1.5">
        {(Object.keys(STAR_LABEL) as (keyof Star)[]).map((k) => {
          const on = star[k]
          return (
            <div
              key={k}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition-colors duration-300',
                on ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200' : 'border-white/[0.08] bg-white/[0.02] text-gray-500',
              )}
            >
              <span className="flex items-center gap-1 text-[13px] font-bold">
                {on && <Check className="h-3 w-3" aria-hidden />}
                {k}
              </span>
              <Tr b={STAR_LABEL[k]} className="text-[12px] leading-tight" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface AnswerScorecardProps {
  q: IQ
  result: AnswerResult | undefined
  stage: Stage
  liveStar: Star
  gender: Gender
  showLangFair: boolean
  className?: string
}

export function AnswerScorecard({ q, result, stage, liveStar, gender, showLangFair, className }: AnswerScorecardProps) {
  const [showModel, setShowModel] = useState(false)
  const tip = tipFor(q.tip, gender)

  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', className)} aria-label="Answer scorecard">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-cyan-300" aria-hidden />
          <Tr b={L.title} as="h3" className="text-[13px] font-semibold text-gray-100" />
        </div>
        <AIBadge />
      </div>

      {showLangFair && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-2 text-[12px] leading-snug text-emerald-200">
          <Languages className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          <Tr b={L.fair} />
        </div>
      )}

      {!result ? (
        stage === 'thinking' ? (
          <AIThinking label={L.thinking} lines={3} />
        ) : (
          <div className="space-y-3">
            <StarTicks star={liveStar} />
            <Tr b={L.waiting} as="p" className="text-[12px] text-gray-500" />
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="space-y-2.5">
            <ScoreBar label={L.correctness} value={result.scores.correctness} />
            <ScoreBar label={L.depth} value={result.scores.depth} />
            <ScoreBar label={L.clarity} value={result.scores.clarity} />
          </div>

          <StarTicks star={result.star} />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-2">
              <p className="text-2xl font-bold tabular-nums text-emerald-300">{result.content}</p>
              <p className="text-[12px] leading-tight text-gray-300">
                <Tr b={L.content} />
              </p>
              <Tr b={L.contentSub} as="p" className="text-[12px] leading-tight text-gray-500" />
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2">
              <p className="text-2xl font-bold tabular-nums text-amber-300">{result.delivery}</p>
              <p className="text-[12px] leading-tight text-gray-300">
                <Tr b={L.delivery} />
              </p>
              <Tr b={L.deliverySub} as="p" className="text-[12px] leading-tight text-gray-500" />
            </div>
          </div>

          <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-violet-200">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden />
              <Tr b={L.tip} />
            </p>
            <StreamingText key={`tip:${q.id}`} text={tip} cps={70} startDelay={250} className="text-[13px] leading-relaxed text-gray-100" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowModel((v) => !v)}
              aria-expanded={showModel}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.06] px-3 text-[12px] font-medium text-cyan-100 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/10"
            >
              <BookOpenCheck className="h-3.5 w-3.5" aria-hidden />
              <Tr b={showModel ? L.hideModel : L.model} />
            </button>
            {showModel && (
              <div className="animate-in fade-in slide-in-from-top-1 mt-2 rounded-xl border border-white/10 bg-[#0d1117]/60 p-3 duration-200">
                <Tr b={L.modelTitle} as="p" className="mb-1 text-[12px] font-semibold text-gray-400" />
                <StreamingText text={q.modelAnswer} cps={90} startDelay={150} className="text-[13px] leading-relaxed text-gray-100" />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
