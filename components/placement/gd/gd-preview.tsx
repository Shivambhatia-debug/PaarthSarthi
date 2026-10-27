'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, MessagesSquare, Scale, Sparkles } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { ROUND_TARGETS, nextRoute } from '@/lib/os/rounds'
import { AIBadge } from '@/components/ai/ai-badge'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const TXT = {
  kicker: { en: 'Round 4 · Group discussion', hi: 'राउंड 4 · समूह चर्चा', hinglish: 'Round 4 · Group discussion' },
  topicLabel: { en: 'Topic', hi: 'विषय', hinglish: 'Topic' },
  topic: { en: 'Can Bihar become the next IT hub?', hi: 'क्या बिहार अगला IT हब बन सकता है?' },
  preview: { en: 'Preview · full multi-agent GD in pilot', hi: 'प्रीव्यू · पूरी मल्टी-एजेंट GD पायलट में', hinglish: 'Preview · full multi-agent GD pilot mein' },
  panel: { en: 'Five AI participants, each with a personality', hi: 'पाँच AI प्रतिभागी, हर एक का अलग स्वभाव', hinglish: 'Paanch AI participants, har ek ka alag swabhav' },
  sample: { en: 'Sample transcript', hi: 'नमूना ट्रांसक्रिप्ट', hinglish: 'Sample transcript' },
  rubric: { en: 'How you are scored', hi: 'स्कोर कैसे होता है', hinglish: 'Score kaise hota hai' },
  cont: { en: 'Continue', hi: 'आगे बढ़ें', hinglish: 'Continue' },
  you: { en: 'You', hi: 'आप', hinglish: 'Aap' },
  note: {
    en: 'In the pilot, five AI agents argue in real time and Sarthi scores turn-taking, evidence and listening. Here the round is recorded at your target score so the drive can continue.',
    hi: 'पायलट में पाँच AI एजेंट रियल-टाइम में बहस करते हैं और सारथी बारी लेने, प्रमाण और सुनने को स्कोर करता है। यहाँ ड्राइव जारी रखने के लिए राउंड आपके लक्ष्य स्कोर पर दर्ज होता है।',
    hinglish: 'Pilot mein paanch AI agents real-time mein debate karte hain aur Sarthi turn-taking, evidence aur listening score karta hai. Yahan drive continue karne ke liye round aapke target score par record hota hai.',
  },
} satisfies Record<string, Bi>

interface Bot {
  name: string
  trait: Bi
  ring: string
  dot: string
}

const BOTS: Bot[] = [
  { name: 'Arjun', trait: { en: 'Aggressive', hi: 'आक्रामक' }, ring: 'from-rose-500 to-orange-400', dot: 'bg-rose-400' },
  { name: 'Sneha', trait: { en: 'Data-driven', hi: 'डेटा-आधारित' }, ring: 'from-cyan-500 to-blue-500', dot: 'bg-cyan-400' },
  { name: 'Ravi', trait: { en: 'Quiet', hi: 'शांत' }, ring: 'from-slate-500 to-slate-400', dot: 'bg-slate-400' },
  { name: 'Vikas', trait: { en: 'Off-topic', hi: 'विषय से हटकर' }, ring: 'from-amber-500 to-yellow-400', dot: 'bg-amber-400' },
  { name: 'Meera', trait: { en: 'Consensus', hi: 'सहमति बनाने वाली' }, ring: 'from-emerald-500 to-teal-400', dot: 'bg-emerald-400' },
]

const TRANSCRIPT: { who: string; you?: boolean; text: Bi }[] = [
  {
    who: 'Arjun',
    text: {
      en: 'Honestly, no. Talent leaves Bihar the day after graduation. Without big campuses, it is impossible.',
      hi: 'सच कहूँ तो नहीं। ग्रेजुएशन के अगले दिन ही टैलेंट बिहार छोड़ देता है। बड़े कैंपस के बिना यह असंभव है।',
    },
  },
  {
    who: 'Sneha',
    text: {
      en: 'Patna already has IT parks being set up, and remote work means a Purnea graduate can serve a Bengaluru client.',
      hi: 'पटना में IT पार्क बन रहे हैं, और रिमोट वर्क से पूर्णिया का ग्रेजुएट बेंगलुरु के क्लाइंट के लिए काम कर सकता है।',
    },
  },
  {
    who: 'You',
    you: true,
    text: {
      en: 'Building on Sneha’s point: if colleges add placement-readiness at scale, companies get a pipeline, so the first step is skills, then campuses.',
      hi: 'स्नेहा की बात आगे बढ़ाते हुए: अगर कॉलेज बड़े पैमाने पर प्लेसमेंट-तैयारी जोड़ें, तो कंपनियों को पाइपलाइन मिलती है, इसलिए पहला कदम कौशल, फिर कैंपस।',
    },
  },
]

const RUBRIC: { label: Bi; w: number; bar: string }[] = [
  { label: { en: 'Content', hi: 'विषय-वस्तु' }, w: 30, bar: 'from-blue-500 to-cyan-400' },
  { label: { en: 'Communication', hi: 'संवाद' }, w: 25, bar: 'from-cyan-500 to-cyan-300' },
  { label: { en: 'Listening', hi: 'सुनना' }, w: 20, bar: 'from-cyan-400 to-emerald-400' },
  { label: { en: 'Leadership without dominance', hi: 'हावी हुए बिना नेतृत्व' }, w: 15, bar: 'from-emerald-500 to-emerald-300' },
  { label: { en: 'Time', hi: 'समय' }, w: 10, bar: 'from-violet-500 to-violet-300' },
]

export function GdPreview() {
  const router = useRouter()
  const { personaId, persona, setRound, lang, t } = useDemo()
  const href = nextRoute('gd', true)
  const target = ROUND_TARGETS[personaId]?.gd ?? ROUND_TARGETS.priya.gd

  const onContinue = () => {
    setRound('gd', { status: 'cleared', score: target })
    aiToast(`Group discussion recorded · ${target}`, { tone: 'ok', id: 'gd-preview' })
    router.push(href)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-violet-500/[0.10] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 right-0 h-72 w-80 rounded-full bg-cyan-400/[0.07] blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-7">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/30">
          <MessagesSquare className="h-5 w-5 text-violet-300" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <Tr b={TXT.kicker} as="p" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-300" />
          <Tr b={TXT.panel} as="p" className="mt-0.5 text-[13px] text-gray-400" />
        </div>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 text-[12px] font-medium text-violet-100">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" aria-hidden />
          <Tr b={TXT.preview} />
        </span>
      </div>

      <div className="relative space-y-6 px-5 py-6 sm:px-7">
        {/* Topic */}
        <div>
          <Tr b={TXT.topicLabel} as="p" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
          <Tr b={TXT.topic} as="h1" className="mt-1 text-[22px] font-semibold leading-tight text-white sm:text-[28px]" />
          {/* Bilingual: always show the other language too */}
          <Tr b={lang === 'hi' ? TXT.topic.en : TXT.topic.hi} as="p" className="mt-1 text-[14px] text-gray-400" />
        </div>

        {/* Bots */}
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BOTS.map((b, i) => (
            <li key={b.name} className="tile-pop flex flex-col items-center gap-1.5 text-center" style={{ animationDelay: `${i * 70}ms` }}>
              <span className={cn('grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br p-[2px]', b.ring)}>
                <span className="relative grid h-full w-full place-items-center rounded-full bg-[#0d1117] text-[16px] font-bold text-white">
                  {b.name.charAt(0)}
                  <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-[#0d1117]', b.dot)} aria-hidden />
                </span>
              </span>
              <span className="text-[13px] font-semibold text-white">{b.name}</span>
              <Tr b={b.trait} className="text-[12px] leading-tight text-gray-400" />
            </li>
          ))}
          <li className="tile-pop flex flex-col items-center gap-1.5 text-center" style={{ animationDelay: `${BOTS.length * 70}ms` }}>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-[2px]">
              <span className="grid h-full w-full place-items-center rounded-full bg-[#0d1117] text-[15px] font-bold text-white">
                {persona.avatarInitials}
              </span>
            </span>
            <Tr b={TXT.you} className="text-[13px] font-semibold text-cyan-200" />
            <span className="text-[12px] leading-tight text-gray-400">{persona.name.split(' ')[0]}</span>
          </li>
        </ul>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Transcript */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Tr b={TXT.sample} as="h2" className="text-[14px] font-semibold text-white" />
              <AIBadge />
            </div>
            <ol className="space-y-2.5">
              {TRANSCRIPT.map((line, i) => (
                <li
                  key={i}
                  className={cn(
                    'os-rise rounded-xl px-3 py-2 text-[13.5px] leading-relaxed',
                    line.you ? 'ml-6 border border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-50' : 'mr-6 bg-white/[0.04] text-gray-200',
                  )}
                  style={{ animationDelay: `${300 + i * 220}ms` }}
                >
                  <span className={cn('mr-1.5 text-[12px] font-semibold', line.you ? 'text-cyan-300' : 'text-violet-300')}>
                    {line.you ? t(TXT.you) : line.who}:
                  </span>
                  <Tr b={line.text} />
                </li>
              ))}
            </ol>
          </div>

          {/* Rubric */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-cyan-300" aria-hidden />
              <Tr b={TXT.rubric} as="h2" className="text-[14px] font-semibold text-white" />
            </div>
            <ul className="space-y-2.5">
              {RUBRIC.map((r) => (
                <li key={r.label.en}>
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <Tr b={r.label} className="min-w-0 text-gray-200" />
                    <span className="shrink-0 font-semibold tabular-nums text-white">{r.w}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className={cn('h-full rounded-full bg-gradient-to-r', r.bar)} style={{ width: `${(r.w / 30) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
          <Tr b={TXT.note} as="p" className="min-w-0 flex-1 text-[12.5px] leading-snug text-gray-500" />
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-6 text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(34,211,238,0.85)] transition-[filter,transform] hover:-translate-y-px hover:brightness-110"
          >
            <Tr b={TXT.cont} />
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}
