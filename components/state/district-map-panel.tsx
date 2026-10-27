'use client'

import { useMemo, useState } from 'react'
import { Map as MapIcon, MousePointerClick, X } from 'lucide-react'
import { BiharTileMap } from '@/components/os/bihar-tile-map'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { InsightCard } from '@/components/ai/insight-card'
import { useDemo } from '@/lib/os/demo-store'
import { type Bi } from '@/lib/os/i18n'
import { districtPriMap } from '@/lib/mock/districts'
import { PanelCard } from '@/components/state/title-strip'
import { DistrictSheet } from '@/components/state/district-sheet'
import { filterKey, filterLabel, filterPredicate, isDefaultFilter, mapCaption, type StateFilter } from '@/components/state/state-data'

const T = {
  title: { en: 'District readiness map', hi: 'ज़िलावार तैयारी मानचित्र' },
  sub: {
    en: 'Simulated PRI by district · click a district to drill down',
    hi: 'ज़िलावार सिम्युलेटेड PRI · विवरण के लिए ज़िले पर क्लिक करें',
  },
  metric: { en: 'PRI (simulated)', hi: 'PRI (सिम्युलेटेड)' },
  noMatch: { en: 'No matching institutions in this view', hi: 'इस दृश्य में कोई संस्थान नहीं' },
  focus: { en: 'Highlighted from Ask Sarthi', hi: 'सारथी से पूछें से हाइलाइट' },
  clear: { en: 'Clear', hi: 'हटाएँ' },
  hint: { en: 'Click any district', hi: 'किसी भी ज़िले पर क्लिक करें' },
  empty: { en: 'No district matches this filter.', hi: 'इस फ़िल्टर से कोई ज़िला मेल नहीं खाता।' },
} satisfies Record<string, Bi>

export interface DistrictMapPanelProps {
  filter: StateFilter
  /** District that the live ticker last mentioned. */
  pulseId?: string | null
  /** Districts highlighted by the current Ask Sarthi answer. */
  focusIds?: string[] | null
  onClearFocus?: () => void
  className?: string
  index?: number
}

export function DistrictMapPanel({ filter, pulseId, focusIds, onClearFocus, className, index = 0 }: DistrictMapPanelProps) {
  const { lang } = useDemo()
  const key = filterKey(filter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = useMemo(() => districtPriMap(filterPredicate(filter)), [key])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const caption = useMemo(() => mapCaption(filter), [key])
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const scope = filterLabel(filter)
  const focus = focusIds && focusIds.length ? focusIds : null

  return (
    <PanelCard
      index={index}
      className={className}
      icon={MapIcon}
      accent="cyan"
      title={T.title}
      subtitle={T.sub}
      right={
        <>
          {!isDefaultFilter(filter) && (
            <span className="inline-flex h-7 max-w-full items-center truncate rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-2.5 text-[12px] font-medium text-cyan-100">
              <Tr b={scope} className="truncate" />
            </span>
          )}
          <IllustrativeChip responsive />
        </>
      }
    >
      {focus && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-[12.5px] text-cyan-100">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" aria-hidden />
          <Tr b={T.focus} />
          {onClearFocus && (
            <button
              type="button"
              onClick={onClearFocus}
              className="ml-auto inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[12px] text-cyan-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
              <Tr b={T.clear} />
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <BiharTileMap
          size="lg"
          values={values}
          metricLabel={T.metric}
          selected={open ? selected : null}
          onSelect={(id) => {
            setSelected(id)
            setOpen(true)
          }}
          highlight={focus}
          pulseId={pulseId ?? null}
          disabledTooltip={T.noMatch}
          legendExtra={
            <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
              <MousePointerClick aria-hidden className="h-3.5 w-3.5" />
              <Tr b={T.hint} />
            </span>
          }
        />
      </div>

      {caption ? (
        <InsightCard
          key={`${key}-${lang}`}
          className="mt-4"
          severity="warn"
          title={caption.title}
          body={caption.body}
          evidence={caption.evidence}
          confidence={0.82}
        />
      ) : (
        <Tr as="p" b={T.empty} className="mt-4 block text-[13px] text-gray-500" />
      )}

      <DistrictSheet districtId={selected} open={open} onOpenChange={setOpen} />
    </PanelCard>
  )
}
