'use client'

/* Unlinked QA gallery for the Placement OS foundation: every components/ai and components/os export,
 * the mock-data checks, recharts compatibility tests (no fragments in this file) and speech tests. */

import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Gauge,
  GraduationCap,
  Layers,
  Mic,
  Square,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react'

import { AIOrb } from '@/components/ai/ai-orb'
import { StreamingText } from '@/components/ai/streaming-text'
import { AgentLog } from '@/components/ai/agent-log'
import { AIThinking } from '@/components/ai/ai-thinking'
import { AISurface } from '@/components/ai/ai-surface'
import { AIBadge } from '@/components/ai/ai-badge'
import { ScoreRing } from '@/components/ai/score-ring'
import { CountUp } from '@/components/ai/count-up'
import { Waveform } from '@/components/ai/waveform'
import { InsightCard } from '@/components/ai/insight-card'
import { LiveTicker } from '@/components/ai/live-ticker'
import { aiToast } from '@/components/ai/ai-toast'

import { OSPageSkeleton } from '@/components/os/os-skeleton'
import { IllustrativeChip, SimulatedNotice } from '@/components/os/illustrative-chip'
import { SourceNote } from '@/components/os/source-note'
import { KpiTile } from '@/components/os/kpi-tile'
import { Sparkline } from '@/components/os/sparkline'
import { Heatmap } from '@/components/os/heatmap'
import { BiharTileMap } from '@/components/os/bihar-tile-map'
import { BandBadge } from '@/components/os/band-badge'
import { DriveShell } from '@/components/os/drive-shell'
import { DriveRail } from '@/components/os/drive-rail'
import { ProctorPanel } from '@/components/os/proctor-panel'
import { SignalsDrawer } from '@/components/os/signals-drawer'
import { TrustStrip } from '@/components/os/trust-strip'
import { IntegrationChip } from '@/components/os/integration-chip'
import { AudioGate } from '@/components/os/audio-gate'
import { LanguageSwitcher } from '@/components/os/language-switcher'
import { Tr } from '@/components/os/tr-text'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useDemo } from '@/lib/os/demo-store'
import { printOnly } from '@/lib/os/print'
import { fmtIN, fmtNum, isDevanagari, tr, type Bi, type Lang } from '@/lib/os/i18n'
import { PILLAR_KEYS, PILLAR_LABELS, bandClasses } from '@/lib/os/scoring'
import { PREVIEW, REPORTED, SOURCES } from '@/lib/mock/state'
import { districtPriMap } from '@/lib/mock/districts'
import { INSTITUTIONS, institutionById } from '@/lib/mock/institutions'
import { PRIYA, latestAttempt, previousAttempt } from '@/lib/mock/personas'
import { runMockAsserts, type MockAssert } from '@/lib/mock/checks'
import { countFillers, detectKeywords } from '@/lib/ai-sim'
import { isAudioUnlocked, splitForSpeech, unlockAudio, useSpeak, useSpeechRecognition } from '@/hooks/use-speech'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Layout helpers (no fragments in this file: it imports recharts)
// ---------------------------------------------------------------------------

function Section({ id, title, desc, children, className }: { id: string; title: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6', className)}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {desc && <p className="text-[13px] text-gray-500">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function Cell2({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-4', className)}>
      <p className="font-mono text-[12px] text-gray-500">{label}</p>
      {children}
    </div>
  )
}

const btn =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50'

// ---------------------------------------------------------------------------
// Sample content
// ---------------------------------------------------------------------------

const STREAM_SAMPLE: Bi = {
  en: 'Priya, your communication pillar moved up since the diagnostic. Next: two Versant-style sprints focused on fluency, then one mock HR round in Hinglish.',
  hi: 'प्रिया, डायग्नोस्टिक के बाद आपका संवाद स्तंभ बेहतर हुआ है। अगला कदम: धाराप्रवाह बोलने पर दो छोटे अभ्यास, फिर हिंग्लिश में एक मॉक HR राउंड।',
  hinglish:
    'Priya, diagnostic ke baad aapka communication pillar improve hua hai. Next: fluency pe do Versant-style sprints, phir Hinglish mein ek mock HR round.',
}

const AGENT_STEPS: Bi[] = [
  { en: 'Reading the round transcript', hi: 'राउंड ट्रांसक्रिप्ट पढ़ रहे हैं' },
  { en: 'Matching keywords to the project', hi: 'प्रोजेक्ट से कीवर्ड मिला रहे हैं' },
  { en: 'Scoring content and delivery', hi: 'कंटेंट और डिलीवरी का स्कोर' },
  { en: 'Drafting the next question', hi: 'अगला प्रश्न तैयार कर रहे हैं' },
]

const HINDI_SAMPLE = 'नमस्ते! मैं सारथी हूँ। आज आपका प्लेसमेंट डे है। पहले राउंड में अभिरुचि के छह प्रश्न होंगे। आराम से जवाब दीजिए।'

const LONG_SAMPLE =
  'Welcome to the Placement OS speech test. This paragraph is intentionally long, so the speech queue has to split it into several chunks. ' +
  'Each chunk stays under the safe length for Chrome voices, which otherwise stop speaking after roughly fifteen seconds. ' +
  'If you can hear this whole paragraph without a cut, chunking works, and the interview round will read long questions in full, ' +
  'including the follow-up that names your own project keyword, like ESP32 or MQTT.'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OSKitPage() {
  const demo = useDemo()
  const { t, lang, presenter, setPresenter, addSignal, set, state } = demo

  const [replay, setReplay] = useState(0)
  const [driveOpen, setDriveOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [gateKey, setGateKey] = useState(0)
  const [selected, setSelected] = useState<string | null>('purnia')
  const [pulse, setPulse] = useState<string | null>(null)
  const [mapFilter, setMapFilter] = useState<'all' | 'GEC' | 'GP' | 'women'>('all')
  const [shellLang, setShellLang] = useState('python')
  const surfaceRef = useRef<HTMLElement | null>(null)

  // Mock checks (pages mount after hydration, so this runs client-side only).
  const checks = useMemo<MockAssert[]>(() => {
    try {
      return runMockAsserts()
    } catch (e) {
      return [{ name: 'runMockAsserts()', ok: false, detail: e instanceof Error ? e.message : String(e) }]
    }
  }, [])
  const passed = checks.filter((c) => c.ok).length

  const mapValues = useMemo(() => {
    if (mapFilter === 'all') return districtPriMap()
    if (mapFilter === 'women') return districtPriMap((i) => i.women)
    return districtPriMap((i) => i.type === mapFilter)
  }, [mapFilter])
  const pilotHighlight = useMemo(
    () => Array.from(new Set(INSTITUTIONS.filter((i) => i.aiProgram2026).map((i) => i.districtId))),
    [],
  )

  const pce = institutionById('pce-purnea')
  const latest = latestAttempt(PRIYA)
  const prev = previousAttempt(PRIYA)
  const firstPri = PRIYA.attempts?.[0]?.pri ?? 0

  // Recharts data
  const placements = REPORTED.placements.map((p) => ({
    year: p.year,
    value: p.value,
    err: typeof p.high === 'number' ? [0, p.high - p.value] : [0, 0],
  }))
  const radar = PILLAR_KEYS.map((k) => ({
    pillar: tr(PILLAR_LABELS[k], 'en'),
    latest: latest?.pillars?.[k] ?? 0,
    previous: prev?.pillars?.[k] ?? 0,
  }))
  const radial = [
    { name: 'Aptitude', value: latest?.pillars?.aptitude ?? 0, fill: '#60a5fa' },
    { name: 'Technical', value: latest?.pillars?.technical ?? 0, fill: '#22d3ee' },
    { name: 'Communication', value: latest?.pillars?.communication ?? 0, fill: '#34d399' },
  ]
  const trend = (pce?.priTrend ?? []).map((v, i) => ({ step: `W${i + 1}`, pri: v }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <AIBadge label="OS Kit" />
            <IllustrativeChip />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Placement OS <span className="ai-gradient-text">component kit</span>
          </h1>
          <p className="mt-1 max-w-2xl text-[14px] text-gray-400">
            Unlinked QA gallery: every foundation component, the mock-data checks, recharts compatibility and speech plumbing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold',
              passed === checks.length
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-rose-400/30 bg-rose-400/10 text-rose-200',
            )}
          >
            {passed === checks.length ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
            {passed}/{checks.length} data checks
          </span>
          <button type="button" className={btn} onClick={() => setPresenter(!presenter)}>
            <Gauge className="h-4 w-4" aria-hidden />
            Presenter {presenter ? 'on' : 'off'}
          </button>
          <button type="button" className={btn} onClick={() => setReplay((n) => n + 1)}>
            <Activity className="h-4 w-4" aria-hidden />
            Replay animations
          </button>
        </div>
      </header>

      <nav className="mb-8 flex flex-wrap gap-1.5 text-[13px]">
        {[
          ['checks', 'Data checks'],
          ['ai', 'AI primitives'],
          ['kpi', 'KPIs & honesty'],
          ['map', 'Tile map & heatmap'],
          ['drive', 'Drive shell'],
          ['charts', 'Recharts'],
          ['speech', 'Speech'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-md border border-white/10 px-2.5 py-1 text-gray-400 transition-colors hover:text-white">
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {/* ------------------------------------------------------------------ */}
        <Section id="checks" title="runMockAsserts()" desc="Every row must be green before the pitch.">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-[#11161f] text-[12px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="w-10 px-3 py-2" />
                    <th className="px-3 py-2">Check</th>
                    <th className="px-3 py-2">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((c, i) => (
                    <tr
                      key={`${c.name}-${i}`}
                      className={cn('border-t border-white/[0.06]', c.ok ? 'bg-emerald-400/[0.03]' : 'bg-rose-500/10')}
                    >
                      <td className="px-3 py-2">
                        {c.ok ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="pass" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" aria-label="fail" />
                        )}
                      </td>
                      <td className={cn('px-3 py-2 font-medium [overflow-wrap:anywhere]', c.ok ? 'text-gray-200' : 'text-rose-200')}>{c.name}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-gray-500 [overflow-wrap:anywhere]">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section id="ai" title="AI primitives" desc="components/ai · one grammar: think, stream, score, explain, act">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Cell2 label="AIOrb · idle / listening / thinking / speaking" className="xl:col-span-2">
              <div className="flex flex-wrap items-center justify-around gap-4">
                <AIOrb state="idle" size={84} />
                <AIOrb state="listening" level={0.5} size={84} />
                <AIOrb state="thinking" size={84} />
                <AIOrb state="speaking" level={0.6} size={84} />
              </div>
            </Cell2>
            <Cell2 label="ScoreRing · Priya first → latest, and null">
              <div className="flex items-center justify-around gap-3">
                <ScoreRing key={`ring-${replay}`} value={latest?.pri ?? null} from={firstPri} size={120} label="PRI" sublabel="Today" />
                <ScoreRing value={null} size={84} label="PRI" showBand={false} />
              </div>
            </Cell2>
            <Cell2 label="CountUp · Waveform · AIBadge">
              <div className="text-3xl font-semibold text-white">
                <CountUp key={`cu-${replay}`} value={PREVIEW.aiInterviews} />
              </div>
              <Waveform active level={undefined} />
              <div className="flex flex-wrap gap-2">
                <AIBadge />
                <AIBadge size="md" label="Sarthi AI · Hinglish" />
              </div>
            </Cell2>
            <Cell2 label="StreamingText (click to finish)" className="xl:col-span-2">
              <StreamingText key={`st-${replay}`} text={STREAM_SAMPLE} className="text-[15px] leading-relaxed text-gray-200" />
            </Cell2>
            <Cell2 label="AgentLog">
              <AgentLog key={`al-${replay}`} title="Sarthi AI · evaluating" steps={AGENT_STEPS} />
            </Cell2>
            <Cell2 label="AIThinking">
              <AIThinking />
            </Cell2>
            <Cell2 label="AISurface + InsightCard" className="md:col-span-2">
              <AISurface
                ref={surfaceRef}
                title="Why this score"
                meta="Generated in 0.8s"
                actions={
                  <button
                    type="button"
                    data-testid="kit-print"
                    onClick={() => printOnly(surfaceRef.current)}
                    className="no-print rounded-md border border-white/10 px-2 py-0.5 text-[12px] text-gray-400 transition-colors hover:border-white/25 hover:text-white"
                  >
                    printOnly
                  </button>
                }
              >
                <p className="text-[14px] text-gray-300">
                  <Tr b={{ en: 'Content was strong; delivery pulled the score down.', hi: 'कंटेंट अच्छा था; डिलीवरी ने स्कोर कम किया।' }} />
                </p>
              </AISurface>
              <InsightCard
                key={`ic-${replay}`}
                severity="warn"
                title={{ en: 'Communication is the top gap', hi: 'संवाद सबसे बड़ी कमी है' }}
                body={{
                  en: 'Purnia and Kosi colleges trail on spoken English. A two-week Versant-style sprint is recommended.',
                  hi: 'पूर्णिया और कोसी के कॉलेज बोली जाने वाली अंग्रेज़ी में पीछे हैं। दो सप्ताह का अभ्यास सुझाया गया है।',
                }}
                evidence={['Communication pillar below 45 in 6 of 9 branches', 'Filler rate above 6 per minute']}
                confidence={0.82}
                actionLabel="Assign sprint"
                onAction={() => aiToast('Sprint assigned (demo)', { tone: 'ok' })}
              />
            </Cell2>
            <Cell2 label="aiToast · tones" className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => aiToast('Sarthi AI drafted your 30-day plan', { description: 'Two sprints, one mock drive.' })}>
                  ai
                </button>
                <button type="button" className={btn} onClick={() => aiToast('Communication below cutoff', { tone: 'warn' })}>
                  warn
                </button>
                <button type="button" className={btn} onClick={() => aiToast('Proctor: tab switch detected (1/3), logged', { tone: 'risk' })}>
                  risk
                </button>
                <button type="button" className={btn} onClick={() => aiToast('Round cleared', { tone: 'ok' })}>
                  ok
                </button>
              </div>
              <LiveTicker onEvent={(e) => setPulse(e.districtId)} />
            </Cell2>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section id="kpi" title="KPIs & honesty chrome" desc="KpiTile · Sparkline · BandBadge · chips · notes · language">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              key={`k1-${replay}`}
              label={PREVIEW.onboardedLabel}
              value={PREVIEW.onboarded}
              delta={PREVIEW.weekDelta.onboarded}
              deltaLabel={{ en: 'this week', hi: 'इस सप्ताह' }}
              icon={GraduationCap}
              tag="illustrative"
            />
            <KpiTile
              key={`k2-${replay}`}
              label={{ en: 'Average PRI', hi: 'औसत PRI' }}
              value={PREVIEW.avgPri}
              format="decimal"
              delta={PREVIEW.weekDelta.avgPri}
              deltaLabel={{ en: `from ${fmtNum(PREVIEW.baselinePri)} baseline`, hi: `${fmtNum(PREVIEW.baselinePri)} आधार से` }}
              icon={BrainCircuit}
              tone="ai"
            >
              <Sparkline data={pce?.priTrend ?? []} width={220} height={32} />
            </KpiTile>
            <KpiTile
              key={`k3-${replay}`}
              label={{ en: 'Weekly active', hi: 'साप्ताहिक सक्रिय' }}
              value={PREVIEW.weeklyActive}
              sub={`(${fmtNum(PREVIEW.weeklyActivePct)}%)`}
              delta={PREVIEW.weekDelta.weeklyActivePp}
              format="int"
              deltaFormat="pp"
              deltaLabel={{ en: 'this week', hi: 'इस सप्ताह' }}
              icon={Activity}
              tone="good"
            />
            <KpiTile
              label={{ en: 'Campus placements 2025-26', hi: 'कैंपस प्लेसमेंट 2025-26' }}
              valueText={(() => {
                const p = REPORTED.placements[REPORTED.placements.length - 1]
                return typeof p?.high === 'number' ? `${fmtIN(p.value)}–${fmtIN(p.high)}` : fmtIN(p?.value ?? 0)
              })()}
              sub={{ en: 'sources differ', hi: 'स्रोतों में अंतर' }}
              tag="reported"
              sourceLabel="Patna Press · Indian Masterminds"
              icon={Trophy}
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <Cell2 label="Sparkline variants">
              <div className="flex flex-wrap items-center gap-5">
                <Sparkline data={pce?.priTrend ?? []} />
                <Sparkline data={PRIYA.attempts.map((a) => a.pri)} stroke="#34d399" width={120} height={32} />
                <Sparkline data={[5, 3, 4, 2, 3, 1]} stroke="#fb7185" showDot={false} />
                <Sparkline data={[]} />
              </div>
            </Cell2>
            <Cell2 label="BandBadge · four bands">
              <div className="flex flex-wrap gap-2">
                {[44, 61, 76, 90].map((v) => (
                  <BandBadge key={v} pri={v} showValue />
                ))}
                <BandBadge pri={latest?.pri} size="md" />
              </div>
              <p className={cn('text-[12px]', bandClasses(latest?.pri).text)}>bandClasses(latest PRI).text</p>
            </Cell2>
            <Cell2 label="IllustrativeChip · SimulatedNotice · SourceNote">
              <div className="flex flex-wrap items-center gap-2">
                <IllustrativeChip />
                <IllustrativeChip compact />
                <IllustrativeChip responsive />
              </div>
              <SimulatedNotice />
              <SourceNote
                sources={[SOURCES.pp, SOURCES.im]}
                note={{ en: '2025-26 sources differ; the bar shows the later, lower figure', hi: '2025-26 के स्रोतों में अंतर; बार बाद वाला, कम आँकड़ा दिखाता है' }}
              />
            </Cell2>
            <Cell2 label="IntegrationChip (never green, never Live)" className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {PREVIEW.integrations.map((it) => (
                  <IntegrationChip key={it.id} name={it.name} status={it.status} />
                ))}
              </div>
            </Cell2>
            <Cell2 label="LanguageSwitcher · Tr">
              <LanguageSwitcher />
              <LanguageSwitcher compact />
              <div className="space-y-1 text-[14px] text-gray-300">
                <Tr as="p" b={{ en: 'This line follows the store language.', hi: 'यह पंक्ति चुनी गई भाषा में दिखती है।', hinglish: 'Yeh line chuni hui bhasha follow karti hai.' }} />
                <p className="text-[12px] text-gray-500">
                  lang = {lang} · t() sample: <span lang={isDevanagari(t(PILLAR_LABELS.communication)) ? 'hi' : 'en'}>{t(PILLAR_LABELS.communication)}</span>
                </p>
              </div>
            </Cell2>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section id="map" title="BiharTileMap & Heatmap" desc="38 districts · seqColor scale · pulse follows LiveTicker">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {(['all', 'GEC', 'GP', 'women'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setMapFilter(f)}
                    className={cn(
                      'h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors',
                      mapFilter === f ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-gray-400 hover:text-white',
                    )}
                  >
                    {f === 'all' ? 'All institutions' : f === 'GEC' ? 'Engineering' : f === 'GP' ? 'Polytechnic' : "Women's polytechnics"}
                  </button>
                ))}
                <span className="ml-auto text-[12px] text-gray-500">
                  selected: <span className="text-gray-300">{selected ?? '—'}</span> · pulse: <span className="text-gray-300">{pulse ?? '—'}</span>
                </span>
              </div>
              <BiharTileMap
                key={`map-${replay}`}
                size="lg"
                values={mapValues}
                metricLabel={{ en: 'PRI (simulated)', hi: 'PRI (सिम्युलेटेड)' }}
                selected={selected}
                onSelect={(id) => setSelected((s) => (s === id ? null : id))}
                pulseId={pulse}
              />
            </div>
            <div className="min-w-0 space-y-6">
              <Cell2 label="size md · highlight = AI Programme 2026 districts">
                <BiharTileMap values={districtPriMap()} metricLabel="PRI" size="md" highlight={pilotHighlight} />
              </Cell2>
              <Cell2 label="size sm · showLabels false (view-card thumbnail)">
                <BiharTileMap values={districtPriMap()} metricLabel="PRI" size="sm" showLabels={false} />
              </Cell2>
            </div>
          </div>
          <div className="mt-6">
            <Heatmap
              key={`hm-${replay}`}
              rows={PREVIEW.branchSkill.rows}
              cols={PREVIEW.branchSkill.cols}
              values={PREVIEW.branchSkill.values}
              caption={{ en: 'Branch × skill readiness (pillar scale)', hi: 'शाखा × कौशल तैयारी (स्तंभ पैमाना)' }}
              onCellClick={(r, c, v) => aiToast(`${r} × ${c}: ${fmtNum(v, 0)}`, { tone: 'ai' })}
            />
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section id="drive" title="Drive shell, rail, proctoring, signals, audio gate" desc="Overlays must open ABOVE the DriveShell (z-100 vs z-60)">
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(btn, 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100')}
              onClick={() => setDriveOpen(true)}
            >
              <Layers className="h-4 w-4" aria-hidden />
              Open DriveShell demo
            </button>
            <button type="button" className={btn} onClick={() => setNotesOpen(true)}>
              Open SignalsDrawer
            </button>
            <button
              type="button"
              className={btn}
              onClick={() =>
                addSignal({
                  round: 'technical',
                  kind: 'strength',
                  text: { en: 'Explained the two-pointer approach clearly', hi: 'टू-पॉइंटर तरीका साफ़ समझाया' },
                })
              }
            >
              Add sample signal
            </button>
            <button type="button" className={btn} onClick={() => set({ includeGd: !state.includeGd })}>
              GD round {state.includeGd ? 'on' : 'off'}
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              <Cell2 label="DriveRail (full)">
                <DriveRail current="technical" />
              </Cell2>
              <Cell2 label="DriveRail compact">
                <DriveRail current="aptitude" compact />
              </Cell2>
              <Cell2 label="AudioGate">
                <div key={`gate-${gateKey}`} className="rounded-xl border border-white/[0.06]">
                  <AudioGate
                    title={{ en: 'AI Interview with Sarthi', hi: 'सारथी के साथ AI इंटरव्यू' }}
                    body={{ en: 'Sarthi will ask 4 questions. Answer in Hindi, English or Hinglish.', hi: 'सारथी 4 प्रश्न पूछेगा। हिंदी, अंग्रेज़ी या हिंग्लिश में उत्तर दें।' }}
                    startLabel={{ en: 'Start interview', hi: 'इंटरव्यू शुरू करें' }}
                    onStart={() => aiToast('Audio unlocked', { tone: 'ok' })}
                  >
                    <div className="flex flex-col items-center gap-3 p-8 text-center">
                      <AIOrb state="speaking" level={0.5} size={96} />
                      <p className="text-[14px] text-gray-300">Gate passed. Children render now.</p>
                      <button type="button" className={btn} onClick={() => setGateKey((k) => k + 1)}>
                        Reset gate
                      </button>
                    </div>
                  </AudioGate>
                </div>
              </Cell2>
              <Cell2 label="OSPageSkeleton">
                <div className="max-h-[260px] overflow-hidden rounded-lg border border-white/[0.06]">
                  <OSPageSkeleton />
                </div>
              </Cell2>
              <Cell2 label="TrustStrip (also mounted by OSChrome)">
                <TrustStrip className="rounded-lg" />
              </Cell2>
            </div>
            <ProctorPanel />
          </div>
          <SignalsDrawer open={notesOpen} onOpenChange={setNotesOpen} />

          {driveOpen && (
            <DriveShell
              round="technical"
              title={{ en: 'DriveShell demo · overlay test', hi: 'ड्राइव शेल डेमो · ओवरले टेस्ट' }}
              subtitle="Select, Sheet and Tooltip must open above this shell."
              timer="12:00"
              detectTabs={false}
              footer={
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-gray-500">Footer slot</span>
                  <button type="button" className={cn(btn, 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100')} onClick={() => setDriveOpen(false)}>
                    Close demo
                  </button>
                </div>
              }
            >
              <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5" data-proctored="">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={shellLang} onValueChange={setShellLang}>
                    <SelectTrigger className="w-44 border-white/10 bg-white/[0.04] text-gray-100">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#11161f] text-gray-100">
                      <SelectItem value="python">Python 3</SelectItem>
                      <SelectItem value="cpp">C++ 17</SelectItem>
                      <SelectItem value="java">Java 17</SelectItem>
                    </SelectContent>
                  </Select>

                  <Sheet>
                    <SheetTrigger asChild>
                      <button type="button" className={btn}>
                        Open Sheet
                      </button>
                    </SheetTrigger>
                    <SheetContent className="border-white/10 bg-[#0d1117] text-gray-100">
                      <SheetHeader>
                        <SheetTitle className="text-white">Sheet above DriveShell</SheetTitle>
                        <SheetDescription className="text-gray-400">If you can read this, the z-[100] fix works.</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={btn}>
                        Hover for Tooltip
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="border-white/10 bg-[#161b22] text-[12px] text-gray-200">Tooltip above DriveShell</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-[14px] text-gray-400">
                  This block is <code className="text-cyan-300">data-proctored</code>: paste, copy and right-click are blocked and logged in the proctor panel.
                </p>
                <textarea
                  className="h-28 w-full rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[13px] text-gray-200 outline-none focus:border-cyan-400/40"
                  defaultValue={'def solve(nums):\n    # try pasting here\n    return nums'}
                />
              </div>
            </DriveShell>
          )}
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section id="charts" title="Recharts compatibility (react-is 18 under React 19)" desc="No fragments; Cells, ErrorBar, ReferenceArea, RadialBar and Radar must all render">
          <div className="grid gap-4 lg:grid-cols-2">
            <Cell2 label="BarChart + Cell colours + asymmetric ErrorBar (2025-26)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placements} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={52} tickFormatter={(v: number) => fmtIN(v)} />
                    <RTooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{ background: '#11161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => fmtIN(v)}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {placements.map((p, i) => (
                        <Cell key={`c-${p.year}`} fill={i === placements.length - 1 ? '#22d3ee' : '#475569'} />
                      ))}
                      <ErrorBar dataKey="err" width={10} strokeWidth={2} stroke="#fbbf24" direction="y" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[12px] text-gray-500">Expect: slate bars, a cyan last bar, and an amber whisker rising above it to the higher reported figure.</p>
            </Cell2>
            <Cell2 label="LineChart + ReferenceArea (Interview-ready band)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="step" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[30, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                    <ReferenceArea y1={70} y2={100} fill="#22d3ee" fillOpacity={0.08} stroke="#22d3ee" strokeOpacity={0.25} />
                    <Line type="monotone" dataKey="pri" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: '#34d399' }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[12px] text-gray-500">Expect: a cyan shaded band from 70 to 100 behind an emerald line.</p>
            </Cell2>
            <Cell2 label="RadialBarChart (Priya today)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart data={radial} innerRadius="35%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={14}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={8} isAnimationActive={false} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 text-[12px] text-gray-400">
                {radial.map((r) => (
                  <span key={r.name} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.fill }} />
                    {r.name} {r.value}
                  </span>
                ))}
              </div>
            </Cell2>
            <Cell2 label="RadarChart (Priya: previous vs today)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar} outerRadius="62%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Previous" dataKey="previous" stroke="#64748b" fill="#64748b" fillOpacity={0.15} isAnimationActive={false} />
                    <Radar name="Today" dataKey="latest" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[12px] text-gray-500">Expect: two polygons (slate previous, cyan today) on a 7-spoke grid.</p>
            </Cell2>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <SpeechLab />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Speech lab
// ---------------------------------------------------------------------------

function SpeechLab() {
  const { speak, cancel, speaking, hasHindiVoice, hasIndianEnglish, voices } = useSpeak()
  const [recLang, setRecLang] = useState<Lang>('hinglish')
  const rec = useSpeechRecognition({ lang: recLang })
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return isAudioUnlocked()
    } catch {
      return false
    }
  })
  const [typed, setTyped] = useState('matlab ESP32 aur MQTT se data cloud pe jaata hai, basically')
  const chunks = useMemo(() => splitForSpeech(LONG_SAMPLE), [])

  const heard = [rec.finalText, rec.interim].filter(Boolean).join(' ').trim()
  const source = heard || typed
  const hits = detectKeywords(source, ['ESP32', 'MQTT'])
  const fillers = countFillers(source)

  return (
    <Section id="speech" title="Speech plumbing" desc="Chrome: unlock first, then speak; recognition uses hi-IN for Hindi and Hinglish">
      <div className="grid gap-4 lg:grid-cols-2">
        <Cell2 label="Synthesis">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(btn, unlocked && 'border-emerald-400/30 text-emerald-200')}
              onClick={async () => {
                await unlockAudio()
                setUnlocked(isAudioUnlocked())
              }}
            >
              <Volume2 className="h-4 w-4" aria-hidden />
              {unlocked ? 'Audio unlocked' : 'Unlock audio'}
            </button>
            <button type="button" className={btn} onClick={() => void speak(HINDI_SAMPLE, 'hi')}>
              Speak Hindi sample
            </button>
            <button type="button" className={btn} onClick={() => void speak(LONG_SAMPLE, 'en')}>
              Speak long text ({LONG_SAMPLE.length} chars, {chunks.length} chunks)
            </button>
            <button type="button" className={btn} onClick={cancel} disabled={!speaking}>
              <Square className="h-4 w-4" aria-hidden />
              Stop
            </button>
          </div>
          <p lang="hi" className="font-deva text-[14px] text-gray-300">
            {HINDI_SAMPLE}
          </p>
          <ul className="space-y-1 text-[12px] text-gray-500">
            <li>speaking: {String(speaking)}</li>
            <li>hi-IN voice: {String(hasHindiVoice)} · en-IN voice: {String(hasIndianEnglish)} · voices: {voices.length}</li>
            <li>chunk lengths: {chunks.map((c) => c.length).join(', ')}</li>
          </ul>
        </Cell2>
        <Cell2 label="Recognition · detectKeywords(ESP32, MQTT) · countFillers">
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher value={recLang} onChange={setRecLang} showPlanned={false} size="sm" />
            <button
              type="button"
              className={cn(btn, rec.listening && 'border-rose-400/40 bg-rose-500/10 text-rose-100')}
              disabled={!rec.supported}
              onClick={() => (rec.listening ? rec.stop() : rec.start())}
            >
              <Mic className="h-4 w-4" aria-hidden />
              {rec.supported ? (rec.listening ? 'Stop listening' : 'Start listening') : 'Not supported'}
            </button>
            <button type="button" className={btn} onClick={rec.reset}>
              Clear
            </button>
          </div>
          {rec.error && <p className="text-[12px] text-rose-300">error: {rec.error}</p>}
          <div className="min-h-[52px] rounded-lg border border-white/10 bg-black/30 p-3 text-[14px] text-gray-200">
            {heard ? (
              <span lang={isDevanagari(heard) ? 'hi' : 'en'} className={cn(isDevanagari(heard) && 'font-deva')}>
                {rec.finalText} <span className="text-gray-500">{rec.interim}</span>
              </span>
            ) : (
              <span className="text-gray-500">Say: matlab ESP32 aur MQTT. Or edit the text below.</span>
            )}
          </div>
          <textarea
            data-hotkeys-off=""
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="h-20 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-[13px] text-gray-200 outline-none focus:border-cyan-400/40"
          />
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            {['ESP32', 'MQTT'].map((k) => (
              <span
                key={k}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium',
                  hits.includes(k) ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-gray-500',
                )}
              >
                {hits.includes(k) ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <XCircle className="h-3.5 w-3.5" aria-hidden />}
                {k}
              </span>
            ))}
            <span className="ml-auto text-gray-400">
              fillers: <span className="font-semibold text-amber-300">{fillers.total}</span>{' '}
              <span className="text-gray-500">
                {Object.entries(fillers.byWord)
                  .filter(([, n]) => n > 0)
                  .map(([w, n]) => `${w}×${n}`)
                  .join(' ')}
              </span>
            </span>
          </div>
        </Cell2>
      </div>
    </Section>
  )
}
