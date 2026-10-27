'use client'

// Overview: readiness histogram, PRI trend, branch × skill heatmap and the two AI insight cards.
// Insight copy is BUILT from PCE_BRANCH_STATS (or the college's own generated branch stats), never typed.

import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, BrainCircuit, Grid3x3, LineChart as LineIcon } from 'lucide-react'
import { AgentLog } from '@/components/ai/agent-log'
import { InsightCard } from '@/components/ai/insight-card'
import { aiToast } from '@/components/ai/ai-toast'
import { AIBadge } from '@/components/ai/ai-badge'
import { Heatmap } from '@/components/os/heatmap'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { branchSkillFor } from '@/lib/mock/students'
import { versantToPillar, PILLAR_LABELS } from '@/lib/os/scoring'
import { fmtDate, fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import type { BatchMetrics, Institution, SkillKey } from '@/lib/mock/types'
import { ReadinessHistogram } from '@/components/tpo/readiness-histogram'
import { TpoCard, chartTipClass } from '@/components/tpo/tpo-header'
import {
  BRANCH_NAME,
  MOCK_DRIVE_DATE,
  branchStatsFor,
  collegeCommAvg,
  commBottleneck,
  riskBranch,
  trendSeries,
} from '@/components/tpo/tpo-data'

const SKILL_NAME: Record<SkillKey, Bi> = {
  aptitude: { en: 'Aptitude', hi: 'अभिरुचि' },
  dsa: { en: 'DSA', hi: 'DSA' },
  sql: { en: 'SQL', hi: 'SQL' },
  python: { en: 'Python', hi: 'Python' },
  core: { en: 'Core subjects', hi: 'कोर विषय' },
  cad: { en: 'CAD', hi: 'CAD' },
  plc: { en: 'PLC', hi: 'PLC' },
  communication: PILLAR_LABELS.communication,
  excel: { en: 'Excel', hi: 'Excel' },
}

const UI = {
  histTitle: { en: 'Readiness distribution · Batch 2027', hi: 'तैयारी का वितरण · बैच 2027' },
  histSub: { en: 'PRI buckets now vs the same students before the pilot', hi: 'अभी के PRI समूह बनाम पायलट से पहले वही छात्र' },
  trendTitle: { en: 'Average PRI, weekly', hi: 'औसत PRI, साप्ताहिक' },
  trendSub: { en: 'Batch 2027 · since the diagnostic week', hi: 'बैच 2027 · डायग्नोस्टिक सप्ताह से' },
  heatTitle: { en: 'Branch × skill heatmap', hi: 'शाखा × कौशल हीटमैप' },
  aiTitle: { en: 'Sarthi AI · what to do this week', hi: 'सारथी AI · इस हफ़्ते क्या करें' },
  aiSub: { en: 'Advisory. The TPO decides.', hi: 'केवल सलाह। निर्णय TPO का।' },
  baseline: { en: 'Baseline', hi: 'आधार-रेखा' },
  assignSprint: { en: 'Assign sprint', hi: 'स्प्रिंट सौंपें' },
  scheduleMock: { en: 'Schedule mock drive', hi: 'मॉक ड्राइव तय करें' },
  logTitle: { en: 'Sarthi AI · scanning Batch 2027', hi: 'सारथी AI · बैच 2027 का विश्लेषण' },
} satisfies Record<string, Bi>

export interface OverviewTabProps {
  collegeId: string
  inst: Institution
  b: BatchMetrics
  /** First visit for this college: play the agent log, then stream the insights. */
  firstView: boolean
  onSeen: () => void
}

export function OverviewTab({ collegeId, inst, b, firstView, onSeen }: OverviewTabProps) {
  const { lang, t, state } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  // Captured once at mount so a parent re-render never cuts a stream short.
  const [animate] = useState(firstView)
  const [showCards, setShowCards] = useState(!firstView)

  const stats = useMemo(() => branchStatsFor(collegeId), [collegeId])
  const matrix = useMemo(() => branchSkillFor(collegeId), [collegeId])
  const trend = useMemo(() => trendSeries(inst, ol), [inst, ol])
  const collegeAvg = collegeCommAvg(stats)
  const comm = commBottleneck(stats)
  const risk = riskBranch(stats)
  const priDec = Number.isInteger(Math.round(b.pri * 10) / 10) ? 0 : 1

  const steps: Bi[] = [
    { en: `Reading ${fmtIN(b.onboarded)} Batch 2027 profiles…`, hi: `बैच 2027 की ${fmtIN(b.onboarded)} प्रोफ़ाइल पढ़ रहे हैं…` },
    {
      en: `Comparing ${matrix.rows.length} branches on ${matrix.cols.length} skills…`,
      hi: `${matrix.rows.length} शाखाओं की ${matrix.cols.length} कौशलों पर तुलना…`,
    },
    { en: 'Ranking bottlenecks by impact on PRI…', hi: 'PRI पर असर के हिसाब से बाधाओं की रैंकिंग…' },
    { en: 'Drafting interventions for the TPO…', hi: 'TPO के लिए सुझाव तैयार कर रहे हैं…' },
  ]

  // ---- insight 1: communication bottleneck (warn) ----
  const commCard = comm
    ? (() => {
        const name = BRANCH_NAME[comm.branch] ?? { en: comm.branch, hi: comm.branch }
        const pillar = versantToPillar(comm.commVersant)
        return {
          title: {
            en: `${name.en} 2027: Communication is the bottleneck (Versant-style ${comm.commVersant}/80, pillar ${pillar})`,
            hi: `${name.hi} 2027: संवाद सबसे बड़ी बाधा है (Versant-शैली ${comm.commVersant}/80, स्तंभ ${pillar})`,
          },
          body: {
            en: 'Recommend 2 Versant-style sessions a week + 1 batch mock drive; projected +9 PRI in 30 days.',
            hi: 'सुझाव: हर हफ़्ते 2 Versant-शैली सत्र + 1 बैच मॉक ड्राइव; 30 दिनों में PRI +9 का अनुमान।',
          },
          evidence: [
            { en: `${comm.onboarded} ${name.en} students onboarded`, hi: `${comm.onboarded} ${name.hi} छात्र ऑनबोर्ड` },
            {
              en: `Versant-style ${comm.commVersant}/80 vs college ${collegeAvg}/80`,
              hi: `Versant-शैली ${comm.commVersant}/80 बनाम कॉलेज ${collegeAvg}/80`,
            },
            { en: `Last 14 days: ${comm.inactive14d} inactive`, hi: `पिछले 14 दिन: ${comm.inactive14d} निष्क्रिय` },
          ] as Bi[],
          onAction: () =>
            aiToast(
              t({
                en: `Communication sprint assigned to ${comm.onboarded} ${name.en} students`,
                hi: `${comm.onboarded} ${name.hi} छात्रों को संवाद स्प्रिंट सौंपा गया`,
              }),
              {
                tone: 'ok',
                description: t({
                  en: '2 Versant-style sessions a week + 1 batch mock drive. Mentors and students notified in the app.',
                  hi: 'हर हफ़्ते 2 Versant-शैली सत्र + 1 बैच मॉक ड्राइव। मेंटर और छात्रों को ऐप में सूचना भेजी गई।',
                }),
              },
            ),
        }
      })()
    : null

  // ---- insight 2: risk branch (risk) ----
  const riskCard = risk
    ? (() => {
        const name = BRANCH_NAME[risk.branch] ?? { en: risk.branch, hi: risk.branch }
        const when = fmtDate(MOCK_DRIVE_DATE, ol)
        return {
          title: {
            en: `${name.en} 2027: ${risk.below50Pct}% below PRI 50 → 4-week core + aptitude sprint; schedule a mock drive on ${fmtDate(MOCK_DRIVE_DATE, 'en')}.`,
            hi: `${name.hi} 2027: ${risk.below50Pct}% छात्र PRI 50 से नीचे → 4-सप्ताह कोर + अभिरुचि स्प्रिंट; ${fmtDate(MOCK_DRIVE_DATE, 'hi')} को मॉक ड्राइव तय करें।`,
          },
          body: {
            en: `Core subjects and aptitude pull the ${name.en} average down to PRI ${risk.avgPri}. A 4-week sprint with a mock drive on ${when} gives every student one full rehearsal before the season peaks.`,
            hi: `कोर विषय और अभिरुचि ${name.hi} का औसत PRI ${risk.avgPri} तक खींचते हैं। 4-सप्ताह स्प्रिंट और ${when} की मॉक ड्राइव से हर छात्र को सीज़न से पहले एक पूरा अभ्यास मिलेगा।`,
          },
          evidence: [
            { en: `${risk.onboarded} ${name.en} students onboarded`, hi: `${risk.onboarded} ${name.hi} छात्र ऑनबोर्ड` },
            {
              en: `Average PRI ${risk.avgPri} vs college ${fmtNum(b.pri, priDec)}`,
              hi: `औसत PRI ${risk.avgPri} बनाम कॉलेज ${fmtNum(b.pri, priDec)}`,
            },
            { en: `Last 14 days: ${risk.inactive14d} inactive`, hi: `पिछले 14 दिन: ${risk.inactive14d} निष्क्रिय` },
          ] as Bi[],
          onAction: () =>
            aiToast(
              t({ en: `Mock drive scheduled for ${name.en} 2027 on ${fmtDate(MOCK_DRIVE_DATE, 'en')}`, hi: `${name.hi} 2027 के लिए मॉक ड्राइव ${fmtDate(MOCK_DRIVE_DATE, 'hi')} को तय` }),
              {
                tone: 'ok',
                description: t({
                  en: `${risk.onboarded} students invited · 4-week core + aptitude sprint starts Monday`,
                  hi: `${risk.onboarded} छात्रों को आमंत्रण · 4-सप्ताह कोर + अभिरुचि स्प्रिंट सोमवार से`,
                }),
              },
            ),
        }
      })()
    : null

  const commPillar = comm ? versantToPillar(comm.commVersant) : null
  const heatCaption: Bi | undefined =
    comm && commPillar !== null
      ? {
          en: `Pillar scale 0-100. Communication uses the same scale as the insight: ${comm.branch} ${commPillar} = Versant-style ${comm.commVersant}/80.`,
          hi: `स्तंभ पैमाना 0-100। संवाद उसी पैमाने पर है जिस पर सुझाव: ${comm.branch} ${commPillar} = Versant-शैली ${comm.commVersant}/80।`,
        }
      : undefined

  const yMin = Math.floor(Math.min(...trend.map((p) => p.pri), b.priBaseline) - 3)
  const yMax = Math.ceil(Math.max(...trend.map((p) => p.pri)) + 3)
  const gain = b.pri - b.priBaseline

  return (
    <div className="grid grid-cols-12 gap-4">
      <TpoCard
        className="col-span-12 lg:col-span-7"
        icon={BarChart3}
        title={UI.histTitle}
        sub={UI.histSub}
      >
        <ReadinessHistogram b={b} />
      </TpoCard>

      <TpoCard className="col-span-12 lg:col-span-5" icon={LineIcon} title={UI.trendTitle} sub={UI.trendSub} tone="ai">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="ai-gradient-text text-3xl font-semibold tabular-nums tracking-tight">{fmtNum(b.pri, priDec)}</span>
          <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-emerald-300">
            +{fmtNum(gain, 1)}
          </span>
          <Tr
            className="text-[12.5px] text-gray-400"
            b={{ en: `from baseline ${fmtNum(b.priBaseline, 1)}`, hi: `आधार-रेखा ${fmtNum(b.priBaseline, 1)} से` }}
          />
        </div>
        <div className="h-[220px] w-full sm:h-[236px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 16, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[yMin, yMax]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                content={({ active, payload, label }) =>
                  active && payload && payload.length ? (
                    <div className={chartTipClass}>
                      <div className="text-gray-400">{label}</div>
                      <div className="font-semibold tabular-nums text-white">PRI {fmtNum(Number(payload[0]?.value ?? 0), 1)}</div>
                    </div>
                  ) : null
                }
              />
              <ReferenceLine
                y={b.priBaseline}
                stroke="#94a3b8"
                strokeOpacity={0.55}
                strokeDasharray="4 4"
                label={(p: { viewBox?: { x?: number; y?: number; width?: number } }) => (
                  <text
                    x={(p.viewBox?.x ?? 0) + (p.viewBox?.width ?? 0) - 4}
                    y={(p.viewBox?.y ?? 0) + 15}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize={12}
                    lang={ol}
                  >
                    {`${t(UI.baseline)} ${fmtNum(b.priBaseline, 1)}`}
                  </text>
                )}
              />
              <Line
                type="monotone"
                dataKey="pri"
                stroke="#22d3ee"
                strokeWidth={2.75}
                dot={{ r: 3.5, fill: '#0d1117', stroke: '#22d3ee', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#34d399', stroke: '#0d1117', strokeWidth: 2 }}
                isAnimationActive={!state.lite}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TpoCard>

      <TpoCard
        className="col-span-12 lg:col-span-7"
        icon={Grid3x3}
        title={UI.heatTitle}
        sub={{ en: `${inst.short} · Batch 2027`, hi: `${inst.short} · बैच 2027` }}
      >
        <Heatmap
          rows={matrix.rows}
          cols={matrix.cols}
          values={matrix.values}
          min={35}
          max={65}
          caption={heatCaption}
          onCellClick={(row, col, v) => {
            const skill = SKILL_NAME[col as SkillKey] ?? { en: col, hi: col }
            const weak = v < 45
            aiToast(t({ en: `${row} × ${skill.en}: ${v}`, hi: `${row} × ${skill.hi}: ${v}` }), {
              tone: weak ? 'warn' : 'ai',
              description: t(
                weak
                  ? { en: 'Below the readiness floor: add a 2-week skill sprint for this branch.', hi: 'तैयारी की न्यूनतम सीमा से नीचे: इस शाखा के लिए 2-सप्ताह का कौशल स्प्रिंट जोड़ें।' }
                  : { en: 'On track for the next drive. Keep weekly practice.', hi: 'अगली ड्राइव के लिए सही राह पर। साप्ताहिक अभ्यास जारी रखें।' },
              ),
            })
          }}
        />
      </TpoCard>

      <section className="col-span-12 flex min-w-0 flex-col gap-3 lg:col-span-5">
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/25">
            <BrainCircuit aria-hidden className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <Tr as="h2" b={UI.aiTitle} className="block text-[15px] font-semibold leading-snug text-white" />
            <Tr as="p" b={UI.aiSub} className="block text-[12.5px] text-gray-400" />
          </div>
          <AIBadge />
        </div>

        {!showCards && (
          <AgentLog
            title={UI.logTitle}
            steps={steps}
            stepMs={380}
            onDone={() => {
              setShowCards(true)
              onSeen()
            }}
          />
        )}

        {showCards && commCard && (
          <InsightCard
            key={`comm-${collegeId}`}
            severity="warn"
            title={commCard.title}
            body={commCard.body}
            evidence={commCard.evidence}
            confidence={81}
            actionLabel={UI.assignSprint}
            onAction={commCard.onAction}
            stream={animate}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          />
        )}
        {showCards && riskCard && (
          <InsightCard
            key={`risk-${collegeId}`}
            severity="risk"
            title={riskCard.title}
            body={riskCard.body}
            evidence={riskCard.evidence}
            confidence={76}
            actionLabel={UI.scheduleMock}
            onAction={riskCard.onAction}
            stream={animate}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          />
        )}
      </section>
    </div>
  )
}
