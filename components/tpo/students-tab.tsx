'use client'

// Students: 30 sample students of the batch, at-risk first (High is the default filter),
// bulk AI actions (900 ms thinking → toast with counts from the selection) and a row sheet.
// Assigned ids persist in the demo store (state.tpoAssigned).

import { useMemo, useState, type KeyboardEvent } from 'react'
import {
  AlertTriangle,
  BellRing,
  CalendarPlus,
  Check,
  ChevronRight,
  Search,
  Sparkles,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AIThinking } from '@/components/ai/ai-thinking'
import { aiToast } from '@/components/ai/ai-toast'
import { BandBadge } from '@/components/os/band-badge'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { studentsFor } from '@/lib/mock/students'
import { blueprintById } from '@/lib/mock/blueprints'
import { BANDS, bandFor, PILLAR_LABELS, type BandId } from '@/lib/os/scoring'
import { fmtDate, fmtIN, type Bi } from '@/lib/os/i18n'
import type { BatchMetrics, Institution, StudentRow } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { StudentSheet } from '@/components/tpo/student-sheet'
import { TpoCard, btnGhost, btnSmall, useAiDelay } from '@/components/tpo/tpo-header'
import { BRANCH_NAME, MOCK_DRIVE_DATE, aiActionFor, jdSpecFor, weakestPillar } from '@/components/tpo/tpo-data'

type RiskFilter = 'all' | 'high' | 'medium' | 'low'
type BulkKey = 'sprint' | 'mock' | 'mentor' | 'notify'

const RISK_ORDER: Record<StudentRow['risk'], number> = { high: 0, medium: 1, low: 2 }

const UI = {
  title: { en: 'Students · Batch 2027', hi: 'छात्र · बैच 2027' },
  search: { en: 'Search by name', hi: 'नाम से खोजें' },
  allBranches: { en: 'All branches', hi: 'सभी शाखाएँ' },
  allBands: { en: 'All bands', hi: 'सभी बैंड' },
  branch: { en: 'Branch', hi: 'शाखा' },
  band: { en: 'Band', hi: 'बैंड' },
  riskLabel: { en: 'Risk', hi: 'जोखिम' },
  all: { en: 'All', hi: 'सभी' },
  high: { en: 'High', hi: 'उच्च' },
  medium: { en: 'Medium', hi: 'मध्यम' },
  low: { en: 'Low', hi: 'कम' },
  colName: { en: 'Name', hi: 'नाम' },
  colBranch: { en: 'Branch', hi: 'शाखा' },
  colPri: { en: 'PRI', hi: 'PRI' },
  colWeak: { en: 'Weakest pillar', hi: 'सबसे कमज़ोर स्तंभ' },
  colReasons: { en: 'Risk reasons', hi: 'जोखिम के कारण' },
  colActive: { en: 'Last active', hi: 'पिछली सक्रियता' },
  colAi: { en: 'AI action', hi: 'AI सुझाव' },
  colAssign: { en: 'Assign', hi: 'सौंपें' },
  assign: { en: 'Assign', hi: 'सौंपें' },
  assigned: { en: 'Assigned', hi: 'सौंपा गया' },
  today: { en: 'Today', hi: 'आज' },
  yesterday: { en: 'Yesterday', hi: 'कल' },
  none: { en: 'None', hi: 'कोई नहीं' },
  hindiMedium: { en: 'Hindi-medium', hi: 'हिंदी माध्यम' },
  englishMedium: { en: 'English-medium', hi: 'अंग्रेज़ी माध्यम' },
  pinned: { en: 'Pinned', hi: 'पिन' },
  selectAtRisk: { en: 'Select all at-risk shown', hi: 'दिखाए गए सभी जोखिम-ग्रस्त चुनें' },
  clear: { en: 'Clear', hi: 'हटाएँ' },
  pick: { en: 'Select students to act on them together', hi: 'साथ में कार्रवाई के लिए छात्र चुनें' },
  empty: { en: 'No students match these filters.', hi: 'इन फ़िल्टर से कोई छात्र मेल नहीं खाता।' },
  reset: { en: 'Reset filters', hi: 'फ़िल्टर रीसेट करें' },
  rowHint: { en: 'Click a row for the student profile and an AI plan', hi: 'छात्र प्रोफ़ाइल और AI योजना के लिए पंक्ति पर क्लिक करें' },
  selectAll: { en: 'Select all shown', hi: 'दिखाए गए सभी चुनें' },
  selectRow: { en: 'Select', hi: 'चुनें' },
} satisfies Record<string, Bi>

const BULK: Record<BulkKey, { label: Bi; thinking: Bi; Icon: typeof Zap }> = {
  sprint: {
    label: { en: 'Assign 4-week sprint', hi: '4-सप्ताह स्प्रिंट सौंपें' },
    thinking: { en: 'Sarthi AI is drafting personal 4-week sprints…', hi: 'सारथी AI व्यक्तिगत 4-सप्ताह स्प्रिंट बना रहा है…' },
    Icon: Zap,
  },
  mock: {
    label: { en: 'Schedule batch mock drive', hi: 'बैच मॉक ड्राइव तय करें' },
    thinking: { en: 'Sarthi AI is finding a slot and a test pattern…', hi: 'सारथी AI समय और टेस्ट पैटर्न तय कर रहा है…' },
    Icon: CalendarPlus,
  },
  mentor: {
    label: { en: 'Assign mentor', hi: 'मेंटर सौंपें' },
    thinking: { en: 'Sarthi AI is matching mentors by branch and language…', hi: 'सारथी AI शाखा और भाषा के अनुसार मेंटर मिला रहा है…' },
    Icon: UserPlus,
  },
  notify: {
    label: { en: 'Notify via WhatsApp/SMS (simulated)', hi: 'WhatsApp/SMS से सूचित करें (सिम्युलेटेड)' },
    thinking: { en: 'Sarthi AI is writing Hindi and English messages…', hi: 'सारथी AI हिंदी और अंग्रेज़ी संदेश लिख रहा है…' },
    Icon: BellRing,
  },
}

const RISK_CHIP: Record<RiskFilter, string> = {
  all: 'data-[on=true]:border-white/25 data-[on=true]:bg-white/[0.09] data-[on=true]:text-white',
  high: 'data-[on=true]:border-rose-400/40 data-[on=true]:bg-rose-500/15 data-[on=true]:text-rose-100',
  medium: 'data-[on=true]:border-amber-400/40 data-[on=true]:bg-amber-500/15 data-[on=true]:text-amber-100',
  low: 'data-[on=true]:border-emerald-400/40 data-[on=true]:bg-emerald-500/15 data-[on=true]:text-emerald-100',
}
const RISK_DOT: Record<RiskFilter, string> = {
  all: 'bg-gray-400',
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
}

function lastActive(days: number): Bi {
  if (days <= 0) return UI.today
  if (days === 1) return UI.yesterday
  return { en: `${days} days ago`, hi: `${days} दिन पहले` }
}

function branchSummary(rows: StudentRow[]): string {
  const m = new Map<string, number>()
  for (const r of rows) m.set(r.branch, (m.get(r.branch) ?? 0) + 1)
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, n]) => `${k} ${n}`)
    .join(' · ')
}

export interface StudentsTabProps {
  collegeId: string
  inst: Institution
  b: BatchMetrics
}

export function StudentsTab({ collegeId, inst, b }: StudentsTabProps) {
  const { t, state, set } = useDemo()
  const ai = useAiDelay()
  const all = useMemo(() => studentsFor(collegeId), [collegeId])
  const pinId = useMemo(
    () => (all.some((r) => r.id === 'rahul') ? 'rahul' : all.some((r) => r.id === 'priya') ? 'priya' : null),
    [all],
  )
  const branches = useMemo(() => Array.from(new Set(all.map((r) => r.branch))), [all])
  const blueprintLabel = blueprintById(jdSpecFor(collegeId).blueprintId).label

  const [risk, setRisk] = useState<RiskFilter>('high')
  const [branch, setBranch] = useState<string>('all')
  const [band, setBand] = useState<'all' | BandId>('all')
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState<string[]>([])
  const [sheetRow, setSheetRow] = useState<StudentRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const assigned = useMemo(() => new Set(state.tpoAssigned ?? []), [state.tpoAssigned])

  const counts = useMemo(
    () => ({
      all: all.length,
      high: all.filter((r) => r.risk === 'high').length,
      medium: all.filter((r) => r.risk === 'medium').length,
      low: all.filter((r) => r.risk === 'low').length,
    }),
    [all],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter(
        (r) =>
          // The pinned demo student (Rahul / Priya) stays visible under every chip filter; search still narrows.
          (r.id === pinId && !q) ||
          ((risk === 'all' || r.risk === risk) &&
            (branch === 'all' || r.branch === branch) &&
            (band === 'all' || bandFor(r.pri).id === band) &&
            (!q || r.name.toLowerCase().includes(q))),
      )
      .sort(
        (a, c) =>
          Number(c.id === pinId) - Number(a.id === pinId) ||
          RISK_ORDER[a.risk] - RISK_ORDER[c.risk] ||
          a.pri - c.pri ||
          a.name.localeCompare(c.name),
      )
  }, [all, risk, branch, band, query, pinId])

  const highShown = rows.filter((r) => r.risk === 'high').length
  const selSet = useMemo(() => new Set(sel), [sel])
  const visibleSelected = rows.filter((r) => selSet.has(r.id)).length
  const headerChecked: boolean | 'indeterminate' =
    rows.length > 0 && visibleSelected === rows.length ? true : visibleSelected > 0 ? 'indeterminate' : false
  const selRows = all.filter((r) => selSet.has(r.id))

  const toggle = (id: string, on: boolean) => setSel((s) => (on ? (s.includes(id) ? s : [...s, id]) : s.filter((x) => x !== id)))
  const toggleAllVisible = (on: boolean) =>
    setSel((s) => {
      const ids = rows.map((r) => r.id)
      return on ? Array.from(new Set([...s, ...ids])) : s.filter((x) => !ids.includes(x))
    })
  const selectAtRisk = () => setSel(rows.filter((r) => r.risk === 'high').map((r) => r.id))

  const markAssigned = (ids: string[]) =>
    set((s) => ({ tpoAssigned: Array.from(new Set([...(s.tpoAssigned ?? []), ...ids])) }))

  const runBulk = (key: BulkKey) => {
    const picked = selRows
    if (picked.length === 0 || ai.busy) return
    ai.run(key, 900, () => {
      const n = picked.length
      const ids = picked.map((r) => r.id)
      const hindi = picked.filter((r) => r.medium === 'Hindi').length
      const summary = branchSummary(picked)
      if (key === 'sprint') {
        markAssigned(ids)
        aiToast(t({ en: `4-week sprint assigned to ${n} students`, hi: `${n} छात्रों को 4-सप्ताह स्प्रिंट सौंपा गया` }), {
          tone: 'ok',
          description: t({
            en: `${summary} · ${hindi} get Hindi-first content · progress shows here weekly`,
            hi: `${summary} · ${hindi} को हिंदी-प्रथम सामग्री · प्रगति हर हफ़्ते यहाँ दिखेगी`,
          }),
        })
      } else if (key === 'mock') {
        markAssigned(ids)
        const nb = new Set(picked.map((r) => r.branch)).size
        aiToast(
          t({
            en: `Batch mock drive on ${fmtDate(MOCK_DRIVE_DATE, 'en')} for ${n} students`,
            hi: `${fmtDate(MOCK_DRIVE_DATE, 'hi')} को ${n} छात्रों के लिए बैच मॉक ड्राइव`,
          }),
          {
            tone: 'ok',
            description: t({
              en: `${blueprintLabel} pattern · ${nb} branches · invites sent in the app`,
              hi: `${blueprintLabel} पैटर्न · ${nb} शाखाएँ · ऐप में आमंत्रण भेजे गए`,
            }),
          },
        )
      } else if (key === 'mentor') {
        markAssigned(ids)
        const mentors = Math.max(1, Math.ceil(n / 4))
        aiToast(t({ en: `${n} students matched to ${mentors} mentors`, hi: `${n} छात्रों को ${mentors} मेंटर मिले` }), {
          tone: 'ok',
          description: t({
            en: `About 4 students per mentor, matched by branch and language · first call within 48 hours`,
            hi: `हर मेंटर के पास लगभग 4 छात्र, शाखा और भाषा के अनुसार · पहली कॉल 48 घंटे में`,
          }),
        })
      } else {
        aiToast(
          t({ en: `WhatsApp/SMS sent to ${n} students (simulated)`, hi: `${n} छात्रों को WhatsApp/SMS भेजा गया (सिम्युलेटेड)` }),
          {
            tone: 'ai',
            description: t({
              en: `Hindi message for ${hindi} · English for ${n - hindi} · no real message was sent`,
              hi: `${hindi} को हिंदी संदेश · ${n - hindi} को अंग्रेज़ी · कोई असली संदेश नहीं भेजा गया`,
            }),
          },
        )
      }
      setSel([])
    })
  }

  const assignOne = (row: StudentRow) => {
    markAssigned([row.id])
    aiToast(t({ en: `${t(aiActionFor(row))}: assigned to ${row.name}`, hi: `${t(aiActionFor(row))}: ${row.name} को सौंपा गया` }), {
      tone: 'ok',
      description: t({
        en: 'Mentor notified · the plan appears in the student app today',
        hi: 'मेंटर को सूचना · योजना आज छात्र ऐप में दिखेगी',
      }),
    })
  }

  const openRow = (row: StudentRow) => {
    setSheetRow(row)
    setSheetOpen(true)
  }

  const onRowKey = (e: KeyboardEvent<HTMLTableRowElement>, row: StudentRow) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openRow(row)
    }
  }

  const resetFilters = () => {
    setRisk('all')
    setBranch('all')
    setBand('all')
    setQuery('')
  }

  const caption: Bi = { en: `${all.length} sample students of ${fmtIN(b.onboarded)}`, hi: `${fmtIN(b.onboarded)} में से ${all.length} नमूना छात्र` }
  const riskCaption: Bi = {
    en: `${highShown} of ${fmtIN(b.atRisk)} at-risk shown`,
    hi: `${fmtIN(b.atRisk)} जोखिम-ग्रस्त में से ${highShown} दिखाए गए`,
  }

  return (
    <TpoCard
      icon={Users}
      title={UI.title}
      sub={{ en: `${inst.short} · names visible only to the college T&P cell`, hi: `${inst.short} · नाम केवल कॉलेज T&P प्रकोष्ठ को दिखते हैं` }}
      actions={
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 font-medium tabular-nums text-gray-200">
            <Tr b={caption} />
          </span>
          {risk === 'high' && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 font-medium tabular-nums text-rose-200">
              <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
              <Tr b={riskCaption} />
            </span>
          )}
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t(UI.riskLabel)}>
          {(['all', 'high', 'medium', 'low'] as RiskFilter[]).map((k) => (
            <button
              key={k}
              type="button"
              data-on={risk === k}
              aria-pressed={risk === k}
              onClick={() => setRisk(k)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[12.5px] font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-gray-200',
                RISK_CHIP[k],
              )}
            >
              <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', RISK_DOT[k])} />
              <Tr b={UI[k]} />
              <span className="tabular-nums opacity-70">{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <label className="relative col-span-2 sm:col-span-1">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              data-hotkeys-off=""
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(UI.search)}
              aria-label={t(UI.search)}
              className="h-9 w-full rounded-lg border border-white/10 bg-black/20 pl-8 pr-3 text-[13px] text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-400/40 sm:w-48"
            />
          </label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger aria-label={t(UI.branch)} className="h-9 w-full border-white/10 bg-black/20 text-[13px] text-gray-200 focus:ring-cyan-300/40 focus:ring-offset-0 sm:w-40">
              <SelectValue>{branch === 'all' ? t(UI.allBranches) : t(BRANCH_NAME[branch as StudentRow['branch']] ?? branch)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="z-[100] border-white/10 bg-[#11161f] text-gray-100">
              <SelectItem value="all" className="focus:bg-white/[0.07] focus:text-white">
                <Tr b={UI.allBranches} />
              </SelectItem>
              {branches.map((br) => (
                <SelectItem key={br} value={br} className="focus:bg-white/[0.07] focus:text-white">
                  <Tr b={BRANCH_NAME[br] ?? br} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={band} onValueChange={(v) => setBand(v as 'all' | BandId)}>
            <SelectTrigger aria-label={t(UI.band)} className="h-9 w-full border-white/10 bg-black/20 text-[13px] text-gray-200 focus:ring-cyan-300/40 focus:ring-offset-0 sm:w-44">
              <SelectValue>{band === 'all' ? t(UI.allBands) : t(BANDS.find((x) => x.id === band)?.label ?? band)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="z-[100] border-white/10 bg-[#11161f] text-gray-100">
              <SelectItem value="all" className="focus:bg-white/[0.07] focus:text-white">
                <Tr b={UI.allBands} />
              </SelectItem>
              {BANDS.map((x) => (
                <SelectItem key={x.id} value={x.id} className="focus:bg-white/[0.07] focus:text-white">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: x.hex }} />
                    <Tr b={x.label} />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk bar */}
      <div
        className={cn(
          'mt-4 rounded-xl border p-2.5 transition-colors',
          sel.length > 0 ? 'border-cyan-400/25 bg-cyan-400/[0.05]' : 'border-white/[0.07] bg-black/10',
        )}
      >
        {ai.busy ? (
          <AIThinking label={BULK[ai.busy as BulkKey]?.thinking} lines={0} className="border-violet-400/25 p-3" />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center gap-2 px-1.5 text-[13px] text-gray-300">
              {sel.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-100">
                  <Check aria-hidden className="h-4 w-4 text-cyan-300" />
                  <Tr b={{ en: `${sel.length} selected`, hi: `${sel.length} चुने गए` }} />
                </span>
              ) : (
                <Tr b={UI.pick} className="text-gray-400" />
              )}
            </span>
            {sel.length === 0 && highShown > 0 && (
              <button type="button" onClick={selectAtRisk} className={cn(btnSmall, 'border-rose-400/30 text-rose-100 hover:border-rose-300/50')}>
                <AlertTriangle aria-hidden className="h-3.5 w-3.5 text-rose-300" />
                <Tr b={{ en: `${UI.selectAtRisk.en} (${highShown})`, hi: `${UI.selectAtRisk.hi} (${highShown})` }} />
              </button>
            )}
            {sel.length > 0 && (
              <button type="button" onClick={() => setSel([])} className={btnSmall}>
                <X aria-hidden className="h-3.5 w-3.5" />
                <Tr b={UI.clear} />
              </button>
            )}
            <div className="flex w-full flex-wrap gap-2 lg:ml-auto lg:w-auto">
              {(Object.keys(BULK) as BulkKey[]).map((k) => {
                const { Icon, label } = BULK[k]
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={sel.length === 0}
                    onClick={() => runBulk(k)}
                    className={cn(btnSmall, k === 'sprint' && sel.length > 0 && 'border-cyan-400/40 bg-cyan-400/10 text-cyan-50 hover:bg-cyan-400/15')}
                  >
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                    <Tr b={label} />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
        <Table className="min-w-[1000px] text-[13px]">
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/[0.07] hover:bg-transparent">
              <TableHead className="h-10 w-10 px-3">
                <Checkbox
                  aria-label={t(UI.selectAll)}
                  checked={headerChecked}
                  onCheckedChange={(v) => toggleAllVisible(v === true)}
                  className="border-white/30 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-slate-950 data-[state=indeterminate]:border-cyan-400"
                />
              </TableHead>
              {[UI.colName, UI.colBranch, UI.colPri, UI.colWeak, UI.colReasons, UI.colActive, UI.colAi, UI.colAssign].map((h, i) => (
                <TableHead key={i} className="h-10 whitespace-nowrap px-3 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  <Tr b={h} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="px-3 py-10 text-center">
                  <Tr as="p" b={UI.empty} className="text-[13px] text-gray-400" />
                  <button type="button" onClick={resetFilters} className={cn(btnGhost, 'mt-3')}>
                    <Tr b={UI.reset} />
                  </button>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const checked = selSet.has(row.id)
              const isAssigned = assigned.has(row.id)
              const pinned = row.id === pinId
              const weak = weakestPillar(row)
              const delta = row.pri - row.priPrev
              const reasons = row.riskReasons ?? []
              return (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  data-state={checked ? 'selected' : undefined}
                  onClick={() => openRow(row)}
                  onKeyDown={(e) => onRowKey(e, row)}
                  className={cn(
                    'group cursor-pointer border-white/[0.06] outline-none transition-colors hover:bg-white/[0.035] focus-visible:bg-white/[0.05] data-[state=selected]:bg-cyan-400/[0.06]',
                    pinned && 'bg-emerald-400/[0.04]',
                  )}
                >
                  <TableCell className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      aria-label={`${t(UI.selectRow)} ${row.name}`}
                      checked={checked}
                      onCheckedChange={(v) => toggle(row.id, v === true)}
                      className="border-white/30 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-slate-950"
                    />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex min-w-[170px] flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-white">{row.name}</span>
                        {row.status === 'recovered' && (
                          <span className="inline-flex h-6 items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2 text-[12px] font-semibold tabular-nums text-emerald-200">
                            <Tr b={{ en: `Recovered ${row.priPrev} → ${row.pri}`, hi: `सुधार ${row.priPrev} → ${row.pri}` }} />
                          </span>
                        )}
                        {pinned && row.status !== 'recovered' && (
                          <span className="inline-flex h-6 items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 text-[12px] font-medium text-cyan-200">
                            <Tr b={UI.pinned} />
                          </span>
                        )}
                        {isAssigned && (
                          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 text-[12px] font-medium text-cyan-200">
                            <Check aria-hidden className="h-3 w-3" />
                            <Tr b={UI.assigned} />
                          </span>
                        )}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        <Tr b={row.medium === 'Hindi' ? UI.hindiMedium : UI.englishMedium} /> · CGPA {row.cgpa.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3 font-medium text-gray-300">{row.branch}</TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="whitespace-nowrap tabular-nums">
                        <span className="text-gray-500">{row.priPrev}</span>
                        <span className="mx-1 text-gray-600">→</span>
                        <span className="font-semibold text-white">{row.pri}</span>
                        <span
                          className={cn(
                            'ml-1.5 text-[12px] font-semibold',
                            delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-rose-300' : 'text-gray-500',
                          )}
                        >
                          {delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '±0'}
                        </span>
                      </span>
                      <BandBadge pri={row.pri} />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex min-w-[120px] flex-col gap-1">
                      <span className="whitespace-nowrap text-gray-200">
                        <Tr b={PILLAR_LABELS[weak]} /> <span className="tabular-nums text-gray-400">{row.pillars[weak]}</span>
                      </span>
                      <span aria-hidden className="h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                        <span className="block h-full rounded-full" style={{ width: `${row.pillars[weak]}%`, background: bandFor(row.pillars[weak]).hex }} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {reasons.length === 0 ? (
                      <Tr b={UI.none} className="text-gray-600" />
                    ) : (
                      <div className="flex min-w-[150px] max-w-[200px] flex-wrap gap-1">
                        {reasons.slice(0, 2).map((r, i) => (
                          <span
                            key={i}
                            className={cn(
                              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[12px] leading-snug',
                              row.risk === 'high' ? 'border-rose-400/25 bg-rose-500/[0.08] text-rose-200' : 'border-amber-400/25 bg-amber-500/[0.08] text-amber-200',
                            )}
                          >
                            <Tr b={r} />
                          </span>
                        ))}
                        {reasons.length > 2 && <span className="text-[12px] text-gray-500">+{reasons.length - 2}</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'whitespace-nowrap px-3 py-3 tabular-nums',
                      row.lastActiveDays >= 14 ? 'text-rose-300' : row.lastActiveDays >= 7 ? 'text-amber-300' : 'text-gray-400',
                    )}
                  >
                    <Tr b={lastActive(row.lastActiveDays)} />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <span className="inline-flex min-w-[130px] items-start gap-1.5 text-cyan-100">
                      <Sparkles aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                      <Tr b={aiActionFor(row)} className="leading-snug" />
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {isAssigned ? (
                      <span className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md bg-emerald-400/10 px-2.5 text-[12.5px] font-medium text-emerald-300 ring-1 ring-emerald-400/25">
                        <Check aria-hidden className="h-3.5 w-3.5" />
                        <Tr b={UI.assigned} />
                      </span>
                    ) : (
                      <button type="button" onClick={() => assignOne(row)} className={btnSmall}>
                        <UserPlus aria-hidden className="h-3.5 w-3.5" />
                        <Tr b={UI.assign} />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-gray-500">
        <ChevronRight aria-hidden className="h-3.5 w-3.5" />
        <Tr b={UI.rowHint} />
      </p>

      <StudentSheet row={sheetRow} inst={inst} open={sheetOpen} onOpenChange={setSheetOpen} />
    </TpoCard>
  )
}
