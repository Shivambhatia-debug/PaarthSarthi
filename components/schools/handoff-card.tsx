'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Briefcase, Fingerprint, GraduationCap, Loader2, School } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { NUSRAT } from '@/lib/mock/personas'
import { cn } from '@/lib/utils'
import { HANDOFF } from '@/components/schools/school-data'
import { T, useSchool } from '@/components/schools/school-shell'

const NODES: { Icon: typeof School; label: Bi }[] = [
  { Icon: School, label: { en: 'School', hi: 'स्कूल' } },
  { Icon: GraduationCap, label: { en: 'Polytechnic / Engineering', hi: 'पॉलिटेक्निक / इंजीनियरिंग' } },
  { Icon: Briefcase, label: { en: 'Placement', hi: 'प्लेसमेंट' } },
]

const UI = {
  kicker: { en: 'One student journey', hi: 'एक छात्र, एक सफ़र' } as Bi,
  consent: { en: 'Shared only with consent', hi: 'केवल सहमति से साझा' } as Bi,
}

/** fix 47: the school → polytechnic → placement handoff. Opens /placement as Rahul (his own run). */
export function HandoffCard({ className }: { className?: string }) {
  const { setPersona } = useDemo()
  const { lite } = useSchool()
  const router = useRouter()
  const [going, setGoing] = useState(false)

  const go = () => {
    if (going) return
    setGoing(true)
    setPersona('rahul')
    router.push('/placement/')
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/[0.10] via-[#0d1117] to-emerald-400/[0.08] p-4 shadow-[0_24px_60px_-36px_rgba(34,211,238,0.6)] sm:p-6',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">
          <T b={UI.kicker} />
        </p>
        <h2 className="mt-1 text-[19px] font-semibold leading-snug text-white sm:text-[22px]">
          <T b={HANDOFF.title} />
        </h2>

        {/* School → Polytechnic → Placement */}
        <ol className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-1.5 sm:gap-3">
          {NODES.map(({ Icon, label }, i) => (
            <li key={i} className="contents">
              {i > 0 && (
                <span aria-hidden className="mt-5 flex items-center justify-center text-cyan-300/70">
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
              <span className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl border sm:h-12 sm:w-12',
                    i === 0
                      ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                      : i === 1
                        ? 'border-sky-300/30 bg-sky-300/[0.08] text-sky-100'
                        : 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-[12px] leading-tight text-gray-300 sm:text-[13px]">
                  <T b={label} />
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-gray-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-gray-300">
            <Fingerprint className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
            {NUSRAT.apaarMasked}
          </span>
          <span>
            <T b={UI.consent} />
          </span>
        </div>

        <p className="mt-4 text-[16px] leading-relaxed text-gray-100">
          <T b={HANDOFF.body} />
        </p>

        <button
          type="button"
          onClick={go}
          disabled={going}
          className={cn(
            'mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-[#04121a] sm:w-auto',
            'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.75)]',
            !lite && 'transition-transform duration-200 hover:-translate-y-0.5',
            'disabled:cursor-wait disabled:opacity-80',
          )}
        >
          <T b={HANDOFF.cta} />
          {going ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden /> : <ArrowRight className="h-[18px] w-[18px]" aria-hidden />}
        </button>
      </div>
    </section>
  )
}
