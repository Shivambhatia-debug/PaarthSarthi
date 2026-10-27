'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Database, Sparkles, TriangleAlert } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { useDemo } from '@/lib/os/demo-store'
import { Tr } from '@/components/os/tr-text'
import { StreamingText } from '@/components/ai/streaming-text'
import { cn } from '@/lib/utils'

const L = {
  title: { en: 'SQL whiteboard', hi: 'SQL व्हाइटबोर्ड', hinglish: 'SQL whiteboard' },
  schema: { en: 'Table: Employee(id, name, salary)', hi: 'टेबल: Employee(id, name, salary)', hinglish: 'Table: Employee(id, name, salary)' },
  check: { en: 'Check with AI', hi: 'AI से जाँचें', hinglish: 'AI se check karein' },
  ok: { en: '✓ Correct: subquery approach', hi: '✓ सही: सब-क्वेरी तरीका', hinglish: '✓ Correct: subquery approach' },
  okRank: { en: '✓ Correct: window-function approach', hi: '✓ सही: विंडो-फ़ंक्शन तरीका', hinglish: '✓ Correct: window-function approach' },
  bad: {
    en: 'Not yet. Hint: take the MAX of the salaries that are below the MAX salary.',
    hi: 'अभी नहीं। संकेत: सबसे बड़ी सैलरी से कम सैलरी में से MAX निकालिए।',
    hinglish: 'Abhi nahi. Hint: MAX salary se kam salaries mein se MAX nikaliye.',
  },
  typing: { en: 'Typing…', hi: 'टाइप हो रहा है…', hinglish: 'Typing…' },
} satisfies Record<string, Bi>

/** What autopilot / scripted mode types. */
const ANSWER_SQL = 'SELECT MAX(salary)\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);'

const REVIEW: Bi = {
  en: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);\n\nWorks even when the top salary repeats, and returns NULL when there is no second salary.\n\nAlternative (Nth highest):\nSELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM Employee) t WHERE r = 2;',
  hi: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);\n\nसबसे ऊँची सैलरी दोहराई जाए तब भी सही, और दूसरी सैलरी न हो तो NULL देता है।\n\nदूसरा तरीका (N-वीं सबसे ऊँची):\nSELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM Employee) t WHERE r = 2;',
  hinglish:
    'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);\n\nTop salary repeat ho tab bhi sahi, aur second salary na ho toh NULL deta hai.\n\nAlternative (Nth highest):\nSELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM Employee) t WHERE r = 2;',
}

type Verdict = null | 'ok' | 'okRank' | 'bad'

function judge(sql: string): Verdict {
  const v = sql.toLowerCase()
  if (v.includes('select') && v.includes('max(') && v.includes('<')) return 'ok'
  if (v.includes('select') && v.includes('dense_rank')) return 'okRank'
  return 'bad'
}

export interface SqlWhiteboardProps {
  /** Engine signal: 'type' = autopilot / scripted typing, 'fill' = instant (skip / fast-forward). */
  sql: { mode: 'type' | 'fill'; key: number } | null
  className?: string
}

export function SqlWhiteboard({ sql, className }: SqlWhiteboardProps) {
  const { lite } = useDemo()
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [checkKey, setCheckKey] = useState(0)
  const [typing, setTyping] = useState(false)
  const liteRef = useRef(lite)
  liteRef.current = lite

  const key = sql?.key ?? 0
  const mode = sql?.mode ?? null

  useEffect(() => {
    if (!mode || !key) return
    if (mode === 'fill' || liteRef.current) {
      setTyping(false)
      setValue(ANSWER_SQL)
      setVerdict('ok')
      setCheckKey((k) => k + 1)
      return
    }
    // Autopilot / scripted: type it in like a student would.
    setVerdict(null)
    setValue('')
    setTyping(true)
    let i = 0
    const id = setInterval(() => {
      i += 2
      if (i >= ANSWER_SQL.length) {
        clearInterval(id)
        setValue(ANSWER_SQL)
        setTyping(false)
        setVerdict('ok')
        setCheckKey((k) => k + 1)
        return
      }
      setValue(ANSWER_SQL.slice(0, i))
    }, 45)
    return () => clearInterval(id)
  }, [key, mode])

  const check = () => {
    setVerdict(judge(value))
    setCheckKey((k) => k + 1)
  }

  const ok = verdict === 'ok' || verdict === 'okRank'

  return (
    <section className={cn('overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e14]', className)} aria-label="SQL whiteboard">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
          <Tr b={L.title} as="h3" className="text-[13px] font-semibold text-gray-100" />
          <Tr b={L.schema} className="hidden truncate font-mono text-[12px] text-gray-500 sm:inline" />
        </div>
        {typing && <Tr b={L.typing} className="shrink-0 text-[12px] text-cyan-300" />}
      </div>
      <textarea
        data-hotkeys-off=""
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (verdict) setVerdict(null)
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={4}
        placeholder="-- Write your SQL here"
        aria-label="SQL answer"
        className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-emerald-100 placeholder:text-gray-600 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
        <button
          type="button"
          onClick={check}
          disabled={!value.trim() || typing}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3 text-[12px] font-semibold text-white shadow-[0_0_18px_-6px_rgba(34,211,238,0.8)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <Tr b={L.check} />
        </button>
        {verdict && (
          <span
            key={`v${checkKey}`}
            className={cn(
              'animate-in fade-in zoom-in-95 inline-flex items-center gap-1.5 text-[13px] font-semibold duration-200',
              ok ? 'text-emerald-300' : 'text-amber-300',
            )}
          >
            {ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <TriangleAlert className="h-4 w-4" aria-hidden />}
            <Tr b={verdict === 'ok' ? L.ok : verdict === 'okRank' ? L.okRank : L.bad} />
          </span>
        )}
      </div>
      {ok && (
        <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <StreamingText
            key={`r${checkKey}`}
            text={REVIEW}
            cps={110}
            startDelay={200}
            className="font-mono text-[12.5px] leading-relaxed text-gray-200"
          />
        </div>
      )}
    </section>
  )
}
