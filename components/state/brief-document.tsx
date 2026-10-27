'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Gavel, MessageSquareText, Sparkles, TrendingUp, X } from 'lucide-react'
import { SimulatedNotice } from '@/components/os/illustrative-chip'
import { SIMULATED_RANKING_NOTE } from '@/lib/mock/state'
import { isDevanagari } from '@/lib/os/i18n'
import { BRIEF, BRIEF_ASK_KEY, askById, type AskQA, type BriefDoc, type BriefTableRow, type BriefVariant } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

export interface BriefDocumentProps {
  variant: BriefVariant
  /** Number of sections shown (0..BRIEF_SECTIONS). Hidden sections keep their space so the paper never jumps. */
  revealed: number
  className?: string
}

function Section({ shown, children, className }: { shown: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden={!shown}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out print:break-inside-avoid print:!translate-y-0 print:!opacity-100',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

function H({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 border-b border-gray-200 pb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-gray-600">
      {icon}
      {children}
    </h3>
  )
}

function Table({ title, cols, rows, tone }: { title: string; cols: string[]; rows: BriefTableRow[]; tone: 'good' | 'warn' }) {
  return (
    <div className="min-w-0">
      <p className={cn('mb-1 text-[12px] font-semibold', tone === 'good' ? 'text-emerald-700' : 'text-amber-700')}>{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-500">
              {cols.map((c) => (
                <th key={c} scope="col" className="py-1 pr-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                {r.cells.map((c, i) => (
                  <td key={`${r.id}-${i}`} className={cn('py-1 pr-2 text-gray-800', i >= 2 && i <= 4 && 'tabular-nums', i === 0 && 'font-medium')}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DivisionBars({ doc }: { doc: BriefDoc }) {
  const max = (Math.max(doc.chart.ref, ...doc.chart.rows.map((r) => r.value)) || 1) * 1.15
  const refPct = (doc.chart.ref / max) * 100
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[12px] font-semibold text-gray-700">{doc.sec.chart}</p>
      <div className="relative space-y-1">
        {doc.chart.rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 text-[12px]">
            <span className="truncate text-gray-700">{r.name}</span>
            <span className="relative h-3.5">
              <span
                className={cn('absolute inset-y-0 left-0 rounded-sm', r.value < doc.chart.ref ? 'bg-amber-400' : 'bg-cyan-600')}
                style={{ width: `${(r.value / max) * 100}%` }}
              />
              <span
                className="absolute inset-y-0 z-10 pl-1.5 text-[12px] leading-[14px] tabular-nums text-gray-800"
                style={{ left: `${(r.value / max) * 100}%` }}
              >
                <span className="rounded bg-white px-1 shadow-[0_0_0_1px_rgba(229,231,235,1)]">{r.label}</span>
              </span>
            </span>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-[calc(6.5rem+0.5rem)] right-0 z-0" aria-hidden>
          <span className="absolute inset-y-0 border-l border-dashed border-violet-500" style={{ left: `${refPct}%` }} />
        </div>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-violet-700">
        <span className="inline-block h-3 border-l border-dashed border-violet-500" aria-hidden />
        {doc.chart.refLabel}
      </p>
    </div>
  )
}

interface BriefAsk {
  item: AskQA
  question: string
}

function readBriefAsk(): BriefAsk | null {
  try {
    const raw = window.sessionStorage.getItem(BRIEF_ASK_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { id?: string; question?: string }
    const item = askById(String(v?.id ?? ''))
    return item ? { item, question: String(v?.question ?? '') } : null
  } catch {
    return null
  }
}

/** Two short lines from an answer: its first plain sentence and its first two bullets. */
function answerSummary(text: string): string[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const bullets = lines.filter((l) => l.startsWith('•')).map((l) => l.replace(/^•\s*/, ''))
  const plain = lines.filter((l) => !l.startsWith('•') && !/^\d+\./.test(l) && !l.endsWith(':'))
  const out = [plain[0], bullets.length ? bullets.slice(0, 2).join('; ') : plain[1]].filter((l): l is string => !!l)
  return out.slice(0, 2)
}

function AskAdded({ ask, lang, onRemove }: { ask: BriefAsk; lang: 'en' | 'hi'; onRemove: () => void }) {
  const hi = lang === 'hi'
  const qHi = isDevanagari(ask.question) ? ask.question : ask.item.q.hi
  const qEn = isDevanagari(ask.question) ? ask.item.q.en : ask.question || ask.item.q.en
  const summary = answerSummary(ask.item.answer()[lang])
  return (
    <>
      <H icon={<MessageSquareText aria-hidden className="h-3.5 w-3.5 text-violet-600" />}>
        <span className="flex-1">{hi ? 'सारथी से पूछें से जोड़ा गया' : 'Added from Ask Sarthi'}</span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] font-medium normal-case tracking-normal text-gray-400 hover:bg-gray-100 hover:text-gray-700 print:hidden"
        >
          <X aria-hidden className="h-3 w-3" />
          {hi ? 'हटाएँ' : 'Remove'}
        </button>
      </H>
      <div className="rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2.5">
        <p lang="hi" className="font-deva text-[14px] font-semibold text-gray-900">
          “{qHi}”
        </p>
        {!hi && <p className="text-[12px] italic text-gray-600">{qEn}</p>}
        <div className="mt-1.5 space-y-0.5 text-gray-800">
          {summary.map((l, i) => (
            <p key={`s-${i}`}>{l}</p>
          ))}
        </div>
        <ol className="mt-2 flex flex-wrap gap-1.5">
          {ask.item.actions.slice(0, 3).map((a, i) => (
            <li key={a.en} className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-[12px] text-gray-800">
              <span className="font-bold text-violet-700">{i + 1}</span>
              {a[lang]}
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}

/** One A4 'print-page' of the Secretary's weekly brief (fix 38). Content comes from BRIEF.build(variant). */
export function BriefDocument({ variant, revealed, className }: BriefDocumentProps) {
  const doc = useMemo(() => BRIEF.build(variant), [variant])
  const hi = doc.lang === 'hi'
  const s = (i: number) => revealed > i
  const [ask, setAsk] = useState<BriefAsk | null>(null)
  useEffect(() => {
    setAsk(readBriefAsk())
  }, [])
  const removeAsk = () => {
    try {
      window.sessionStorage.removeItem(BRIEF_ASK_KEY)
    } catch {
      // ignore
    }
    setAsk(null)
  }

  return (
    <article
      lang={doc.lang}
      className={cn(
        'print-page relative w-full overflow-hidden p-5 text-[13px] leading-relaxed sm:p-10',
        hi && 'font-deva',
        className,
      )}
    >
      {/* 0 · Header */}
      <Section shown={s(0)}>
        <header className="border-b-2 border-gray-900 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-cyan-700">DSTTE Bihar · ParthSarthi Placement OS</p>
              <h2 className="mt-1 text-[22px] font-bold leading-tight text-gray-900 sm:text-[26px]">{doc.title}</h2>
              <p className="mt-0.5 text-[13px] font-medium text-gray-600">{doc.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-600/40 bg-cyan-50 px-2.5 py-1 text-[12px] font-semibold text-cyan-800">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              Sarthi AI
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-0.5 text-[12px] text-gray-700 sm:grid-cols-3">
            <div>
              <dt className="inline font-semibold">{hi ? 'प्रति: ' : 'To: '}</dt>
              <dd className="inline">{doc.meta.to}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{hi ? 'द्वारा: ' : 'From: '}</dt>
              <dd className="inline">{doc.meta.from}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{hi ? 'अवधि: ' : 'Period: '}</dt>
              <dd className="inline tabular-nums">{doc.meta.period}</dd>
            </div>
          </dl>
        </header>
      </Section>

      {/* 1 · Six headline numbers */}
      <Section shown={s(1)} className="mt-5">
        <H icon={<TrendingUp aria-hidden className="h-3.5 w-3.5" />}>{doc.sec.headlines}</H>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {doc.headlines.map((h) => (
            <div key={h.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="truncate text-[12px] text-gray-600">{h.label}</p>
              <p className="text-[20px] font-bold leading-tight tabular-nums text-gray-900">{h.value}</p>
              <p className="text-[12px] font-semibold tabular-nums text-emerald-700">{h.delta}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 2 · Wins + risks */}
      <Section shown={s(2)} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <H icon={<CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-emerald-600" />}>{doc.sec.wins}</H>
          <ul className="space-y-1.5">
            {doc.wins.map((w, i) => (
              <li key={`w-${i}`} className="flex gap-2 text-gray-800">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <H icon={<AlertTriangle aria-hidden className="h-3.5 w-3.5 text-amber-600" />}>{doc.sec.risks}</H>
          <ul className="space-y-1.5">
            {doc.risks.map((r, i) => (
              <li key={`r-${i}`} className="flex gap-2 text-gray-800">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3 · Added from Ask Sarthi (only when an answer was added on /state) */}
      {ask && (
        <Section shown={s(3)} className="mt-5">
          <AskAdded ask={ask} lang={doc.lang === 'hi' ? 'hi' : 'en'} onRemove={removeAsk} />
        </Section>
      )}

      {/* 4 · Decisions */}
      <Section shown={s(4)} className="mt-5">
        <H icon={<Gavel aria-hidden className="h-3.5 w-3.5 text-cyan-700" />}>{doc.sec.decisions}</H>
        <ol className="space-y-1.5">
          {doc.decisions.map((d, i) => (
            <li key={`d-${i}`} className="flex gap-2.5 rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-gray-900">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-700 text-[12px] font-bold text-white">{i + 1}</span>
              <span className="min-w-0 flex-1">{d}</span>
              <span className="hidden shrink-0 self-center text-[12px] text-gray-400 sm:inline">☐ {hi ? 'स्वीकृत' : 'Approved'}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5 · Districts table + chart */}
      <Section shown={s(5)} className="mt-5">
        <H>{doc.sec.table}</H>
        <SimulatedNotice
          text={{ en: SIMULATED_RANKING_NOTE[doc.lang], hi: SIMULATED_RANKING_NOTE[doc.lang] }}
          className="mb-3 border-amber-300 from-amber-50 via-amber-50 to-white text-amber-900"
        />
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4">
            <Table title={doc.sec.top} cols={doc.cols} rows={doc.top} tone="good" />
            <Table title={doc.sec.bottom} cols={doc.cols} rows={doc.bottom} tone="warn" />
          </div>
          <DivisionBars doc={doc} />
        </div>
      </Section>

      {/* 6 · Footer */}
      <Section shown={s(6)} className="mt-6">
        <footer className="space-y-1 border-t border-gray-300 pt-3 text-[12px] leading-snug text-gray-600">
          <p>{doc.footer.reported}</p>
          <p>{doc.footer.sources}</p>
          <p>{doc.footer.note}</p>
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3 text-[13px] text-gray-800">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-cyan-700" />
              {doc.footer.drafted}
            </span>
            <span className="font-medium">{doc.footer.reviewed}</span>
          </div>
        </footer>
      </Section>
    </article>
  )
}
