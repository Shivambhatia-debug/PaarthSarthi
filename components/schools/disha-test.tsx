'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Brain, Check, Compass, FastForward, Heart, RotateCcw, Send, Sparkles } from 'lucide-react'
import { useDemoEvent } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { AgentLog } from '@/components/ai/agent-log'
import { AIOrb } from '@/components/ai/ai-orb'
import { cn } from '@/lib/utils'
import { APT_ADAPTIVE, APT_ITEMS, APT_LABELS, RIASEC_CARDS, SCAN_STEPS, type AptItem } from '@/components/schools/school-data'
import { RiasecCards } from '@/components/schools/riasec-cards'
import { GhostButton, PrimaryButton, StepHeading, T, useSchool } from '@/components/schools/school-shell'

type Tile = 'cards' | 'apt'

const UI = {
  title: { en: 'Disha Test', hi: 'दिशा टेस्ट' } as Bi,
  sub: { en: 'Two short parts, about 6 minutes. Answer honestly.', hi: 'दो छोटे हिस्से, लगभग 6 मिनट। जो सच में लगे, वही चुनें।' } as Bi,
  tileA: { en: 'Interest cards', hi: 'रुचि कार्ड' } as Bi,
  tileASub: { en: '12 cards · like / dislike', hi: '12 कार्ड · पसंद / नापसंद' } as Bi,
  tileB: { en: 'Thinking skills', hi: 'सोचने की क्षमता' } as Bi,
  tileBSub: { en: '4-6 NMMS-MAT-style questions', hi: 'NMMS-MAT जैसे 4-6 सवाल' } as Bi,
  q: { en: 'Question', hi: 'सवाल' } as Bi,
  adaptiveHard: {
    en: 'Sarthi AI picked the next question for your level: a little harder',
    hi: 'सारथी AI ने आपके स्तर के हिसाब से अगला सवाल चुना: थोड़ा कठिन',
  } as Bi,
  adaptiveEasy: {
    en: 'Sarthi AI picked the next question for your level: a little easier',
    hi: 'सारथी AI ने आपके स्तर के हिसाब से अगला सवाल चुना: थोड़ा आसान',
  } as Bi,
  aptDone: { en: 'All questions answered', hi: 'सभी सवालों के जवाब दिए' } as Bi,
  submit: { en: 'Submit and see my report', hi: 'जमा करें और रिपोर्ट देखें' } as Bi,
  needBoth: { en: 'Finish both parts to submit', hi: 'जमा करने के लिए दोनों हिस्से पूरे करें' } as Bi,
  fill: { en: 'Fill the rest (demo)', hi: 'बाकी अपने-आप भरें (डेमो)' } as Bi,
  scanning: { en: 'AI is understanding your interests…', hi: 'AI आपकी रुचि समझ रहा है…' } as Bi,
  scanTitle: { en: 'Sarthi AI · Disha analysis', hi: 'सारथी AI · दिशा विश्लेषण' } as Bi,
  doneTitle: { en: 'Disha Test complete', hi: 'दिशा टेस्ट पूरा' } as Bi,
  doneSub: { en: 'Your Shakti report is ready.', hi: 'आपकी शक्ति रिपोर्ट तैयार है।' } as Bi,
  seeReport: { en: 'See my Shakti report', hi: 'मेरी शक्ति रिपोर्ट देखें' } as Bi,
  retake: { en: 'Take the test again', hi: 'टेस्ट फिर से दें' } as Bi,
  next: { en: 'Next part', hi: 'अगला हिस्सा' } as Bi,
}

const LETTERS: Record<'hi' | 'en', string[]> = { hi: ['क', 'ख', 'ग', 'घ'], en: ['A', 'B', 'C', 'D'] }
const APT_TOTAL = APT_ITEMS.length + 1

function buildItems(answers: number[]): { items: AptItem[]; harder: boolean | null } {
  if (answers.length < APT_ITEMS.length) return { items: APT_ITEMS, harder: null }
  const correct = APT_ITEMS.filter((it, i) => answers[i] === it.answer).length
  const harder = correct >= 3
  return { items: [...APT_ITEMS, harder ? APT_ADAPTIVE.harder : APT_ADAPTIVE.easier], harder }
}

export function DishaTest() {
  const { L, testDone, completeTest, goTo, lite } = useSchool()
  const [retake, setRetake] = useState(false)
  const [tile, setTile] = useState<Tile>('cards')
  const [cardAns, setCardAns] = useState<Record<string, boolean>>({})
  const [aptAns, setAptAns] = useState<number[]>([])
  const [scan, setScan] = useState(false)
  const [auto, setAuto] = useState(false)
  const submitted = useRef(false)
  const completed = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, lite ? Math.min(ms, 120) : ms))
  }

  const cardsAnswered = RIASEC_CARDS.filter((c) => cardAns[c.id] !== undefined).length
  const cardsDone = cardsAnswered >= RIASEC_CARDS.length
  const { items, harder } = useMemo(() => buildItems(aptAns), [aptAns])
  const aptDone = aptAns.length >= APT_TOTAL
  const allDone = cardsDone && aptDone

  const answerCard = (id: string, like: boolean) => {
    setCardAns((prev) => (prev[id] !== undefined ? prev : { ...prev, [id]: like }))
  }

  // Move to the second tile once the last card is answered.
  const prevCardsDone = useRef(cardsDone)
  useEffect(() => {
    if (cardsDone && !prevCardsDone.current && !scan) later(() => setTile('apt'), 450)
    prevCardsDone.current = cardsDone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsDone])
  const undoCard = () => {
    setCardAns((prev) => {
      const answered = RIASEC_CARDS.filter((c) => prev[c.id] !== undefined)
      const last = answered[answered.length - 1]
      if (!last) return prev
      const next = { ...prev }
      delete next[last.id]
      return next
    })
  }
  const answerItem = (choice: number) => setAptAns((prev) => (prev.length >= APT_TOTAL ? prev : [...prev, choice]))

  const submit = () => {
    if (submitted.current) return
    submitted.current = true
    setScan(true)
  }

  /** Demo fill: Nusrat's answers for everything left, then submit. */
  const fillAndSubmit = () => {
    if (submitted.current) return
    setCardAns((prev) => {
      const next = { ...prev }
      for (const c of RIASEC_CARDS) if (next[c.id] === undefined) next[c.id] = c.demoLike
      return next
    })
    setAptAns((prev) => {
      const out = [...prev]
      while (out.length < APT_TOTAL) {
        const { items: list } = buildItems(out)
        const item = list[out.length]
        out.push(item ? item.answer : 0)
      }
      return out
    })
    setTile('apt')
    submit()
  }

  const finishScan = () => {
    if (completed.current) return
    completed.current = true
    later(completeTest, 350)
  }

  // Presenter: F fills + submits (or finishes the scan via AgentLog); A answers step by step.
  useDemoEvent('fastforward', () => {
    if (testDone && !retake) {
      goTo(3)
      return
    }
    fillAndSubmit()
  })
  useDemoEvent('autopilot', () => {
    if (testDone && !retake) {
      goTo(3)
      return
    }
    setAuto(true)
  })

  useEffect(() => {
    if (!auto || scan) return
    const nextCard = RIASEC_CARDS.find((c) => cardAns[c.id] === undefined)
    if (nextCard) {
      if (tile !== 'cards') setTile('cards')
      const id = setTimeout(() => answerCard(nextCard.id, nextCard.demoLike), lite ? 80 : 380)
      return () => clearTimeout(id)
    }
    if (!aptDone) {
      if (tile !== 'apt') {
        setTile('apt')
        return
      }
      const item = items[aptAns.length]
      const id = setTimeout(() => answerItem(item ? item.answer : 0), lite ? 120 : 700)
      return () => clearTimeout(id)
    }
    const id = setTimeout(submit, lite ? 100 : 500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, scan, cardAns, aptAns, tile, aptDone, items, lite])

  // -------------------------------------------------------------------------

  if (testDone && !retake && !scan) {
    return (
      <section>
        <StepHeading title={UI.title} sub={UI.sub} icon={Compass} />
        <div className="os-rise rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <p className="text-[16px] font-semibold text-white">
                <T b={UI.doneTitle} />
              </p>
              <p className="text-[14px] text-gray-400">
                <T b={UI.doneSub} />
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => goTo(3)} label={UI.seeReport} arrow />
            <GhostButton
              onClick={() => {
                submitted.current = false
                completed.current = false
                setCardAns({})
                setAptAns([])
                setTile('cards')
                setAuto(false)
                setRetake(true)
              }}
              label={UI.retake}
              icon={RotateCcw}
            />
          </div>
        </div>
      </section>
    )
  }

  if (scan) {
    return (
      <section>
        <StepHeading title={UI.title} sub={UI.sub} icon={Compass} />
        <ScanPanel onDone={finishScan} />
      </section>
    )
  }

  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={Compass} />

      {/* Two tiles only (fix 37) */}
      <div className="grid grid-cols-2 gap-3">
        <TileButton
          active={tile === 'cards'}
          onClick={() => setTile('cards')}
          icon={Heart}
          title={UI.tileA}
          sub={UI.tileASub}
          done={cardsDone}
          value={cardsAnswered}
          total={RIASEC_CARDS.length}
        />
        <TileButton
          active={tile === 'apt'}
          onClick={() => setTile('apt')}
          icon={Brain}
          title={UI.tileB}
          sub={UI.tileBSub}
          done={aptDone}
          value={aptAns.length}
          total={APT_TOTAL}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        {tile === 'cards' ? (
          <>
            <RiasecCards answers={cardAns} onAnswer={answerCard} onUndo={undoCard} />
            {cardsDone && !aptDone && (
              <div className="mt-4 flex justify-center">
                <PrimaryButton onClick={() => setTile('apt')} label={UI.next} arrow />
              </div>
            )}
          </>
        ) : (
          <AptitudePanel items={items} answers={aptAns} harder={harder} onAnswer={answerItem} />
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={fillAndSubmit}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-dashed border-amber-300/35 px-3 text-[13px] font-medium text-amber-200/90 transition-colors hover:border-amber-300/60 hover:bg-amber-300/[0.06]"
        >
          <FastForward className="h-4 w-4" aria-hidden />
          <T b={UI.fill} />
        </button>
        <div className="flex flex-col items-end gap-1">
          <PrimaryButton onClick={submit} disabled={!allDone} label={UI.submit} icon={Send} />
          {!allDone && (
            <span className="text-[12px] text-gray-500">
              <T b={UI.needBoth} />
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------

function TileButton({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
  done,
  value,
  total,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Heart
  title: Bi
  sub: Bi
  done: boolean
  value: number
  total: number
}) {
  const pct = Math.round((Math.min(value, total) / Math.max(1, total)) * 100)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-3 text-left transition-colors sm:p-4',
        active
          ? 'border-cyan-300/45 bg-gradient-to-br from-blue-500/[0.12] via-cyan-400/[0.06] to-emerald-400/[0.10]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            done ? 'bg-emerald-400/15 text-emerald-300' : active ? 'bg-cyan-300/15 text-cyan-200' : 'bg-white/[0.06] text-gray-400',
          )}
        >
          {done ? <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
        </span>
        <span className="text-[12px] tabular-nums text-gray-400">
          {Math.min(value, total)}/{total}
        </span>
      </div>
      <p className="mt-2.5 text-[15px] font-semibold leading-snug text-white">
        <T b={title} />
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-gray-400">
        <T b={sub} />
      </p>
      <span aria-hidden className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          className={cn('block h-full rounded-full transition-[width] duration-500', done ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400')}
          style={{ width: `${pct}%` }}
        />
      </span>
    </button>
  )
}

function AptitudePanel({
  items,
  answers,
  harder,
  onAnswer,
}: {
  items: AptItem[]
  answers: number[]
  harder: boolean | null
  onAnswer: (choice: number) => void
}) {
  const { lang, lite } = useSchool()
  const idx = answers.length
  const item = items[idx]
  const [picked, setPicked] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  useEffect(() => setPicked(null), [idx])

  if (!item) {
    return (
      <div className="os-rise flex flex-col items-center justify-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="mt-3 text-[17px] font-semibold text-white">
          <T b={UI.aptDone} />
        </p>
        <p className="mt-1 text-[13px] text-gray-400">
          {answers.length} / {APT_TOTAL}
        </p>
      </div>
    )
  }

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    timer.current = setTimeout(() => {
      timer.current = null
      onAnswer(i)
    }, lite ? 60 : 300)
  }

  const showAdaptive = idx === APT_ITEMS.length && harder !== null

  return (
    <div key={item.id} className={cn(!lite && 'os-rise')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium tabular-nums text-gray-300">
          <T b={UI.q} /> {idx + 1} / {APT_TOTAL}
        </span>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-gray-400">
          <T b={item.kind} />
        </span>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-2.5 py-1 text-[12px] text-cyan-200/90">
          <T b={APT_LABELS[item.skill]} />
        </span>
      </div>

      {showAdaptive && (
        <p className="os-rise mt-3 flex items-start gap-2 rounded-xl border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-[13px] text-violet-100">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
          <T b={harder ? UI.adaptiveHard : UI.adaptiveEasy} />
        </p>
      )}

      <p className="mt-4 text-[18px] font-medium leading-snug text-white">
        <T b={item.prompt} />
      </p>
      {item.display && (
        <p lang="en" className="mt-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-center font-mono text-[24px] font-semibold tracking-wider text-cyan-100">
          {item.display}
        </p>
      )}
      {item.visual === 'gears' && <GearsFigure />}

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {item.options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => choose(i)}
            disabled={picked !== null}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left text-[16px] transition-colors',
              picked === i
                ? 'border-cyan-300/70 bg-cyan-300/15 text-white'
                : 'border-white/10 bg-white/[0.03] text-gray-100 hover:border-white/25 hover:bg-white/[0.06]',
              picked !== null && picked !== i && 'opacity-50',
            )}
          >
            <span
              lang={lang === 'hi' ? 'hi' : 'en'}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[14px] font-semibold',
                lang === 'hi' && 'font-deva',
                picked === i ? 'bg-cyan-300 text-[#04121a]' : 'bg-white/[0.07] text-gray-300',
              )}
            >
              {LETTERS[lang][i]}
            </span>
            <T b={o} />
          </button>
        ))}
      </div>
    </div>
  )
}

/** Three meshed gears (A, B, C) with a clockwise arrow on A. Pure SVG, deterministic. */
function GearsFigure() {
  const gears = [
    { id: 'A', cx: 56, r: 30, teeth: 10 },
    { id: 'B', cx: 56 + 30 + 22 + 4, r: 22, teeth: 8 },
    { id: 'C', cx: 56 + 30 + 22 + 4 + 22 + 30 + 4, r: 30, teeth: 10 },
  ]
  const cy = 62
  const path = (cx: number, r: number, n: number) => {
    const h = 6
    const step = (Math.PI * 2) / n
    const pts: string[] = []
    for (let i = 0; i < n; i++) {
      const a = i * step
      const p = (rad: number, ang: number) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`
      pts.push(p(r - 1, a - step * 0.5), p(r - 1, a - step * 0.24), p(r + h, a - step * 0.16), p(r + h, a + step * 0.16), p(r - 1, a + step * 0.24))
    }
    return `M${pts.join('L')}Z`
  }
  const A = gears[0]
  const arrowR = A.r + 14
  const a0 = -Math.PI * 0.85
  const a1 = -Math.PI * 0.2
  const ax0 = A.cx + arrowR * Math.cos(a0)
  const ay0 = cy + arrowR * Math.sin(a0)
  const ax1 = A.cx + arrowR * Math.cos(a1)
  const ay1 = cy + arrowR * Math.sin(a1)
  return (
    <figure className="mt-3 flex justify-center rounded-xl border border-white/[0.08] bg-black/25 px-2 py-3">
      <svg viewBox="0 0 260 124" className="h-auto w-full max-w-[340px]" role="img" aria-label="Gears A, B, C in a row; A turns clockwise">
        <defs>
          <marker id="gear-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#67e8f9" />
          </marker>
        </defs>
        {gears.map((g) => (
          <g key={g.id}>
            <path d={path(g.cx, g.r, g.teeth)} fill="rgba(255,255,255,0.05)" stroke="rgba(103,232,249,0.65)" strokeWidth={1.5} strokeLinejoin="round" />
            <circle cx={g.cx} cy={cy} r={g.r * 0.32} fill="#0d1117" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
            <text x={g.cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#e5e7eb">
              {g.id}
            </text>
          </g>
        ))}
        <path
          d={`M${ax0.toFixed(2)},${ay0.toFixed(2)} A${arrowR},${arrowR} 0 0 1 ${ax1.toFixed(2)},${ay1.toFixed(2)}`}
          fill="none"
          stroke="#67e8f9"
          strokeWidth={2}
          markerEnd="url(#gear-arrow)"
        />
      </svg>
    </figure>
  )
}

function ScanPanel({ onDone }: { onDone: () => void }) {
  const { L, lite } = useSchool()
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-5 sm:p-6">
      {/* Faint card grid being "read" */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4 gap-3 p-5 opacity-[0.18] sm:grid-cols-6">
        {RIASEC_CARDS.map((c) => (
          <span key={c.id} className="flex aspect-square items-center justify-center rounded-xl border border-white/20 text-cyan-200">
            <c.Icon className="h-6 w-6" />
          </span>
        ))}
      </div>
      {!lite && (
        <div aria-hidden className="scan-sweep pointer-events-none absolute inset-x-0 h-1/3">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-400/15 to-cyan-300/30" />
          <div className="h-[2px] w-full bg-cyan-200 shadow-[0_0_16px_4px_rgba(103,232,249,0.65)]" />
        </div>
      )}

      <div className="relative flex flex-col items-center text-center">
        <AIOrb state="thinking" size={88} />
        <p className="mt-4 text-[18px] font-semibold text-violet-100">
          <T b={UI.scanning} />
        </p>
      </div>
      <AgentLog className="relative mx-auto mt-5 max-w-md bg-[#0d1117]/80" title={L(UI.scanTitle)} steps={SCAN_STEPS.map((s) => L(s))} stepMs={420} onDone={onDone} />
    </div>
  )
}
