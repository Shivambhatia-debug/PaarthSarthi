'use client'

// Pool campus drive builder: pick a blueprint and the institutions in the pool; the ready pool
// (poolReady) recounts live. Defaults reproduce d2 (core-mech-oem-style, 11 institutions, 412 ready).

import { useMemo, useState } from 'react'
import { CalendarDays, CalendarPlus, Layers, MapPin, Send, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CountUp } from '@/components/ai/count-up'
import { AIThinking } from '@/components/ai/ai-thinking'
import { aiToast } from '@/components/ai/ai-toast'
import { BandBadge } from '@/components/os/band-badge'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { BLUEPRINTS, blueprintById } from '@/lib/mock/blueprints'
import { driveById, poolReady } from '@/lib/mock/drives'
import { institutionById } from '@/lib/mock/institutions'
import { fmtDate, fmtIN, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { TpoCard, btnAi, btnGhost, useAiDelay } from '@/components/tpo/tpo-header'
import { BRANCH_NAME, poolContribution, poolDefaultSelection, poolOptionsFor, poolPinned, poolPreview } from '@/components/tpo/tpo-data'

const DEFAULT_BLUEPRINT = 'core-mech-oem-style'

const UI = {
  title: { en: 'Pool drive builder', hi: 'पूल ड्राइव बिल्डर' },
  sub: {
    en: 'Pool campus drive across colleges: the model you already use, now one click.',
    hi: 'कई कॉलेजों की पूल कैंपस ड्राइव: वही मॉडल जो आप चलाते हैं, अब एक क्लिक में।',
  },
  blueprint: { en: 'Assessment blueprint', hi: 'मूल्यांकन ब्लूप्रिंट' },
  institutions: { en: 'Institutions in the pool', hi: 'पूल में संस्थान' },
  readyPool: { en: 'Interview-ready pool', hi: 'इंटरव्यू-तैयार पूल' },
  date: { en: 'Date', hi: 'तारीख़' },
  venue: { en: 'Venue', hi: 'स्थान' },
  preview: { en: 'AI-ranked preview', hi: 'AI रैंकिंग पूर्वावलोकन' },
  send: { en: 'Send to recruiter', hi: 'रिक्रूटर को भेजें' },
  publish: { en: 'Publish to State calendar', hi: 'राज्य कैलेंडर पर प्रकाशित करें' },
  ranking: { en: 'Sarthi AI is ranking the pool…', hi: 'सारथी AI पूल की रैंकिंग कर रहा है…' },
  none: { en: 'Select at least one institution.', hi: 'कम से कम एक संस्थान चुनें।' },
  host: { en: 'host', hi: 'मेज़बान' },
  pinned: { en: 'Your demo student', hi: 'आपका डेमो छात्र' },
  pinnedNote: { en: '· near-ready, 2-week sprint', hi: '· लगभग तैयार, 2-सप्ताह स्प्रिंट' },
  readySuffix: { en: 'ready', hi: 'तैयार' },
} satisfies Record<string, Bi>

export function PoolDriveBuilder({ collegeId, className }: { collegeId: string; className?: string }) {
  const { t, lang } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const ai = useAiDelay()
  const d2 = driveById('d2')
  const options = useMemo(() => poolOptionsFor(collegeId), [collegeId])
  const [bpId, setBpId] = useState<string>(d2?.blueprintId ?? DEFAULT_BLUEPRINT)
  const [selected, setSelected] = useState<string[]>(() => poolDefaultSelection())

  const ready = poolReady(selected)
  const preview = useMemo(() => poolPreview(selected, 6, collegeId), [selected, collegeId])
  const pinned = useMemo(() => poolPinned(selected), [selected])
  const bp = blueprintById(bpId)
  const host = institutionById(d2?.hostInstitutionId)
  const date = d2?.date
  // Sector blueprints only: a pool drive is pitched to a sector, never to a named recruiter.
  const blueprints = BLUEPRINTS.filter((x) => x.track.startsWith('core'))

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => (on ? (s.includes(id) ? s : [...s, id]) : s.filter((x) => x !== id)))

  const send = () =>
    ai.run('send', 900, () =>
      aiToast(
        t({
          en: `Pool of ${fmtIN(ready)} interview-ready candidates from ${selected.length} institutions sent to the recruiter (simulated)`,
          hi: `${selected.length} संस्थानों के ${fmtIN(ready)} इंटरव्यू-तैयार उम्मीदवारों का पूल रिक्रूटर को भेजा गया (सिम्युलेटेड)`,
        }),
        {
          tone: 'ok',
          description: t({ en: `Ranked for the ${bp.label} blueprint.`, hi: `${bp.label} ब्लूप्रिंट के लिए रैंक किया गया।` }),
        },
      ),
    )
  const publish = () =>
    ai.run('publish', 900, () =>
      aiToast(
        t({
          en: `Published to the State placement calendar for ${date ? fmtDate(date, 'en', { year: true }) : 'the drive date'}`,
          hi: `${date ? fmtDate(date, 'hi', { year: true }) : 'ड्राइव की तारीख़'} के लिए राज्य प्लेसमेंट कैलेंडर पर प्रकाशित`,
        }),
        {
          description: t({
            en: `${selected.length} institutions notified; students see it in their drive lobby.`,
            hi: `${selected.length} संस्थानों को सूचना; छात्र इसे अपनी ड्राइव लॉबी में देखेंगे।`,
          }),
        },
      ),
    )

  return (
    <TpoCard title={UI.title} sub={UI.sub} icon={Layers} tone="ai" className={className}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Setup */}
        <div className="min-w-0 space-y-4 lg:col-span-6">
          <div>
            <Tr as="p" b={UI.blueprint} className="mb-1.5 block text-[12.5px] font-medium text-gray-300" />
            <Select value={bpId} onValueChange={setBpId}>
              <SelectTrigger
                aria-label={t(UI.blueprint)}
                className="h-10 w-full rounded-lg border-white/15 bg-[#0b0f16]/80 text-[13px] text-gray-100 focus:ring-cyan-300/40 focus:ring-offset-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100] border-white/10 bg-[#11161f] text-gray-100">
                {blueprints.map((x) => (
                  <SelectItem key={x.id} value={x.id} className="cursor-pointer text-[13px] focus:bg-white/[0.07] focus:text-white">
                    {x.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2 text-[12.5px] sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <CalendarDays aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <div className="min-w-0">
                <Tr as="p" b={UI.date} className="block text-[12px] text-gray-500" />
                <p className="font-medium text-gray-100">{date ? fmtDate(date, ol, { year: true }) : '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <div className="min-w-0">
                <Tr as="p" b={UI.venue} className="block text-[12px] text-gray-500" />
                <p className="truncate font-medium text-gray-100" title={host?.name}>
                  {host?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Tr as="p" b={UI.institutions} className="block text-[12.5px] font-medium text-gray-300" />
              <span className="text-[12px] tabular-nums text-gray-500">
                {selected.length}/{options.length}
              </span>
            </div>
            <ul className="grid max-h-[268px] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {options.map((id) => {
                const inst = institutionById(id)
                if (!inst) return null
                const on = selected.includes(id)
                const cid = `pool-${id}`
                return (
                  <li key={id}>
                    <label
                      htmlFor={cid}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[12.5px] transition-colors',
                        on ? 'border-cyan-400/30 bg-cyan-400/[0.07] text-gray-100' : 'border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/20',
                      )}
                    >
                      <Checkbox
                        id={cid}
                        checked={on}
                        onCheckedChange={(v) => toggle(id, v === true)}
                        className="border-white/30 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white"
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {inst.short}
                        {id === d2?.hostInstitutionId && (
                          <span className="ml-1.5 text-[12px] font-normal text-cyan-300/80">
                            (<Tr b={UI.host} />)
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 whitespace-nowrap tabular-nums text-[12px] text-emerald-300/90">
                        {poolContribution(id)} <Tr b={UI.readySuffix} />
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Result */}
        <div className="min-w-0 lg:col-span-6">
          <div className="relative overflow-hidden rounded-xl border border-emerald-400/20 bg-gradient-to-br from-blue-500/[0.08] via-cyan-400/[0.05] to-emerald-400/[0.08] p-4 sm:p-5">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />
            <Tr as="p" b={UI.readyPool} className="relative block text-[12.5px] font-medium text-gray-300" />
            <div className="relative mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <CountUp
                value={ready}
                durationMs={700}
                className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-5xl font-semibold leading-none tracking-tight text-transparent"
              />
              <span className="text-[13px] text-gray-300">
                <Tr
                  b={{
                    en: `ready across ${selected.length} institution${selected.length === 1 ? '' : 's'}`,
                    hi: `${selected.length} संस्थानों में तैयार`,
                  }}
                />
              </span>
            </div>
            <p className="relative mt-2 text-[12.5px] text-gray-400">
              {bp.label} · {(d2?.branches ?? []).map((x) => t(BRANCH_NAME[x] ?? x)).join(', ')}
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-gray-300">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-cyan-300" />
              <Tr b={UI.preview} />
            </p>
            {selected.length === 0 ? (
              <Tr as="p" b={UI.none} className="text-[13px] text-amber-300" />
            ) : (
              <>
              <ol className="space-y-1.5">
                {preview.map((r, i) => (
                  <li
                    key={`${r.id}-${i}`}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px]"
                  >
                    <span className="w-4 shrink-0 text-right text-[12px] tabular-nums text-gray-500">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-gray-100">
                      {r.name} <span className="text-gray-400">({r.instShort})</span> · PRI {r.pri}
                    </span>
                    <BandBadge pri={r.pri} className="hidden shrink-0 sm:inline-flex" />
                  </li>
                ))}
              </ol>
              {pinned && (
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2 text-[13px]">
                  <span className="shrink-0 rounded bg-cyan-400/15 px-1.5 py-px text-[12px] font-semibold text-cyan-200">
                    <Tr b={UI.pinned} />
                  </span>
                  <span className="min-w-0 flex-1 text-gray-100">
                    {pinned.name} <span className="text-gray-400">({pinned.instShort})</span> · PRI {pinned.pri}
                    <Tr b={UI.pinnedNote} className="ml-1 text-[12px] text-cyan-200/80" />
                  </span>
                  <BandBadge pri={pinned.pri} className="hidden shrink-0 sm:inline-flex" />
                </div>
              )}
              </>
            )}
          </div>

          <div className="mt-4">
            {ai.busy ? (
              <AIThinking label={UI.ranking} lines={1} />
            ) : (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={send} disabled={selected.length === 0} className={btnAi}>
                  <Send aria-hidden className="h-4 w-4" />
                  <Tr b={UI.send} />
                </button>
                <button type="button" onClick={publish} disabled={selected.length === 0} className={btnGhost}>
                  <CalendarPlus aria-hidden className="h-4 w-4" />
                  <Tr b={UI.publish} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TpoCard>
  )
}
