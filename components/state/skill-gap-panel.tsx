'use client'

import { useMemo } from 'react'
import { Grid3x3 } from 'lucide-react'
import { Heatmap } from '@/components/os/heatmap'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { InsightCard } from '@/components/ai/insight-card'
import { aiToast } from '@/components/ai/ai-toast'
import { useDemo } from '@/lib/os/demo-store'
import { fmtNum, type Bi } from '@/lib/os/i18n'
import { PREVIEW } from '@/lib/mock/state'
import type { SkillKey } from '@/lib/mock/types'
import { PanelCard } from '@/components/state/title-strip'
import { SKILL_LABEL, skillGapInsight } from '@/components/state/state-data'

const T = {
  title: { en: 'Skill gaps by branch', hi: 'शाखावार कौशल की कमी' },
  sub: {
    en: 'Average pillar score per branch and skill · 50 is the readiness line',
    hi: 'हर शाखा और कौशल का औसत स्तंभ स्कोर · 50 तैयारी रेखा है',
  },
  legend: { en: 'Pillar score (0–100)', hi: 'स्तंभ स्कोर (0–100)' },
  caption: { en: 'Branch × skill readiness (pillar scale)', hi: 'शाखा × कौशल तैयारी (स्तंभ पैमाना)' },
  below: { en: 'below the readiness line', hi: 'तैयारी रेखा से नीचे' },
  above: { en: 'at or above the readiness line', hi: 'तैयारी रेखा पर या ऊपर' },
} satisfies Record<string, Bi>

export function SkillGapPanel({ className, index = 0 }: { className?: string; index?: number }) {
  const { t, lang } = useDemo()
  const bs = PREVIEW.branchSkill
  const insight = useMemo(() => skillGapInsight(), [])
  const colLabels = useMemo(() => bs.cols.map((c: SkillKey) => SKILL_LABEL[c] ?? c), [bs.cols])

  return (
    <PanelCard
      index={index}
      className={className}
      icon={Grid3x3}
      accent="violet"
      title={T.title}
      subtitle={T.sub}
      right={<IllustrativeChip responsive />}
    >
      <Heatmap
        rows={bs.rows}
        cols={bs.cols}
        values={bs.values}
        min={0}
        max={100}
        colLabels={colLabels}
        legendLabel={T.legend}
        caption={T.caption}
        formatValue={(v) => fmtNum(v, 0)}
        onCellClick={(row, col, value) => {
          const skill = SKILL_LABEL[col as SkillKey] ?? { en: col, hi: col }
          aiToast(`${row} × ${t(skill)}: ${fmtNum(value, 0)}`, {
            tone: value < 50 ? 'warn' : 'ai',
            description: t(value < 50 ? T.below : T.above),
          })
        }}
      />
      <InsightCard
        key={lang}
        className="mt-4"
        severity="warn"
        title={insight.title}
        body={insight.body}
        evidence={insight.evidence}
        confidence={0.8}
      />
    </PanelCard>
  )
}
