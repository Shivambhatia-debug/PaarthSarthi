// Consistency assertions over the whole mock dataset. Rendered on /os-kit and console.asserted
// once in development by DemoProvider. Every row must be green before the pitch.
import { BLUEPRINTS } from '@/lib/mock/blueprints'
import { DISTRICTS, districtPriMap, districtsRanked } from '@/lib/mock/districts'
import { DRIVES, DRIVE_COUNTS, POOL_CONTRIB, driveById, drivesFor, poolReady } from '@/lib/mock/drives'
import { INSTITUTIONS, batchOf, institutionById } from '@/lib/mock/institutions'
import { PERSONAS, PRIYA, RAHUL, latestAttempt } from '@/lib/mock/personas'
import { FIXED_DISTRICT_PRI, PREVIEW, WEEK_LABEL, isoDaysBefore } from '@/lib/mock/state'
import { PCE_BRANCH_SKILL, PCE_BRANCH_STATS, PCE_STUDENTS, studentsFor } from '@/lib/mock/students'
import { TICKER } from '@/lib/mock/ticker'
import { fmtIN, fmtINR } from '@/lib/os/i18n'
import { INTERVIEW_SPLIT, ROUND_TARGETS, VERSANT_TARGETS } from '@/lib/os/rounds'
import {
  INTEGRITY_FLOOR,
  computePRI,
  interviewPillar,
  versantToPillar,
  withLiveIntegrity,
} from '@/lib/os/scoring'
import type { Institution, PersonaRunId } from '@/lib/mock/types'

export interface MockAssert {
  name: string
  ok: boolean
  detail: string
}

const RUN_IDS: PersonaRunId[] = ['priya', 'rahul']

function wmean(list: Institution[], get: (i: Institution) => number): number {
  let s = 0
  let w = 0
  for (const i of list) {
    s += i.onboarded * get(i)
    w += i.onboarded
  }
  return w > 0 ? s / w : NaN
}

export function runMockAsserts(): MockAssert[] {
  const out: MockAssert[] = []
  const check = (name: string, fn: () => [boolean, string]) => {
    try {
      const [ok, detail] = fn()
      out.push({ name, ok: !!ok, detail })
    } catch (e) {
      out.push({ name, ok: false, detail: `threw: ${e instanceof Error ? e.message : String(e)}` })
    }
  }

  // --- roster -------------------------------------------------------------
  check('84 institutions (38 GEC + 46 GP), 38 districts', () => {
    const gec = INSTITUTIONS.filter((i) => i.type === 'GEC').length
    const gp = INSTITUTIONS.filter((i) => i.type === 'GP').length
    const ok = INSTITUTIONS.length === PREVIEW.institutions && gec === 38 && gp === 46 && DISTRICTS.length === 38
    return [ok, `${INSTITUTIONS.length} (${gec} GEC + ${gp} GP), ${DISTRICTS.length} districts`]
  })

  // --- sums ---------------------------------------------------------------
  const sumKeys = [
    ['onboarded', PREVIEW.onboarded],
    ['weeklyActive', PREVIEW.weeklyActive],
    ['interviewReady', PREVIEW.interviewReady],
    ['atRisk', PREVIEW.atRisk],
    ['offers', PREVIEW.offersAndInternships],
  ] as const
  for (const [k, target] of sumKeys) {
    check(`Σ institution ${k} = PREVIEW`, () => {
      const s = INSTITUTIONS.reduce((a, i) => a + i[k], 0)
      return [s === target, `${fmtIN(s)} vs ${fmtIN(target)}`]
    })
  }

  // --- weighted means -----------------------------------------------------
  check('Weighted state PRI = avgPri (±0.05)', () => {
    const m = wmean(INSTITUTIONS, (i) => i.pri)
    return [Math.abs(m - PREVIEW.avgPri) <= 0.05, `${m.toFixed(3)} vs ${PREVIEW.avgPri}`]
  })
  check('Weighted baseline PRI = baselinePri (±0.05)', () => {
    const m = wmean(INSTITUTIONS, (i) => i.priBaseline)
    return [Math.abs(m - PREVIEW.baselinePri) <= 0.05, `${m.toFixed(3)} vs ${PREVIEW.baselinePri}`]
  })
  check('Weighted girls share = girlsPct (±0.05)', () => {
    const m = wmean(INSTITUTIONS, (i) => i.girlsPct)
    return [Math.abs(m - PREVIEW.girlsPct) <= 0.05, `${m.toFixed(3)} vs ${PREVIEW.girlsPct}`]
  })

  // --- districts ----------------------------------------------------------
  check('FIXED_DISTRICT_PRI matches districtPriMap()', () => {
    const map = districtPriMap()
    const bad = Object.entries(FIXED_DISTRICT_PRI).filter(([id, v]) => map[id] !== v)
    const detail = Object.keys(FIXED_DISTRICT_PRI)
      .map((id) => `${id} ${map[id]}`)
      .join(', ')
    return [bad.length === 0, bad.length ? `mismatch: ${bad.map(([id]) => id).join(', ')} · ${detail}` : detail]
  })
  check('Madhubani and Purnia are the two lowest districts', () => {
    const r = districtsRanked()
    const two = new Set([r[0]?.id, r[1]?.id])
    const ok = two.has('madhubani') && two.has('purnia') && (r[2]?.pri ?? 0) > (r[1]?.pri ?? 0)
    return [ok, r.slice(0, 3).map((d) => `${d.id} ${d.pri}`).join(' < ')]
  })
  check('DISTRICTS[].pri equals districtPriMap()', () => {
    const map = districtPriMap()
    const bad = DISTRICTS.filter((d) => map[d.id] !== d.pri)
    return [bad.length === 0, bad.length ? bad.map((d) => d.id).join(', ') : '38/38']
  })
  check('Purnia-division districts: top gap = communication', () => {
    const list = DISTRICTS.filter((d) => d.division === 'Purnia')
    const bad = list.filter((d) => d.topGap !== 'communication')
    return [list.length === 4 && bad.length === 0, list.map((d) => `${d.id}:${d.topGap}`).join(', ')]
  })
  check('Filtered districtPriMap gives null for no match', () => {
    const map = districtPriMap(() => false)
    const nulls = Object.values(map).filter((v) => v === null).length
    return [nulls === 38, `${nulls}/38 null`]
  })

  // --- per institution ----------------------------------------------------
  check('Per institution: weeklyActive ≤ onboarded; ready + atRisk ≤ onboarded', () => {
    const bad = INSTITUTIONS.filter(
      (i) => i.weeklyActive > i.onboarded || i.interviewReady + i.atRisk > i.onboarded || i.onboarded <= 0,
    )
    return [bad.length === 0, bad.length ? bad.map((i) => i.id).join(', ') : `${INSTITUTIONS.length} ok`]
  })
  check('Per institution: Batch 2027 ≤ cohort', () => {
    const keys = ['onboarded', 'weeklyActive', 'interviewReady', 'atRisk', 'offers'] as const
    const bad = INSTITUTIONS.filter((i) => {
      const b = batchOf(i)
      return keys.some((k) => b[k] > i[k] || b[k] < 0) || b.onboarded > b.finalYear
    })
    return [bad.length === 0, bad.length ? bad.map((i) => i.id).join(', ') : `${INSTITUTIONS.length} ok`]
  })
  check('Institution PRI within 44-74; trend ends at pri', () => {
    const bad = INSTITUTIONS.filter(
      (i) => i.pri < 44 - 1e-9 || i.pri > 74 + 1e-9 || i.priTrend.length !== 6 || i.priTrend[5] !== i.pri,
    )
    return [bad.length === 0, bad.length ? bad.map((i) => i.id).join(', ') : 'ok']
  })
  check('Purnea CE Batch 2027 exact (268/241/172/63/37/21, PRI 54, base 43.8)', () => {
    const inst = institutionById('pce-purnea')
    if (!inst) return [false, 'pce-purnea missing']
    const b = batchOf(inst)
    const ok =
      b.finalYear === 268 &&
      b.onboarded === 241 &&
      b.weeklyActive === 172 &&
      b.interviewReady === 63 &&
      b.atRisk === 37 &&
      b.offers === 21 &&
      b.pri === 54 &&
      b.priBaseline === 43.8
    return [ok, `${b.finalYear}/${b.onboarded}/${b.weeklyActive}/${b.interviewReady}/${b.atRisk}/${b.offers} PRI ${b.pri} base ${b.priBaseline}`]
  })
  check('Purnea CE cohort (498/330/104/71/34)', () => {
    const i = institutionById('pce-purnea')
    if (!i) return [false, 'missing']
    const ok = i.onboarded === 498 && i.weeklyActive === 330 && i.interviewReady === 104 && i.atRisk === 71 && i.offers === 34
    return [ok, `${i.onboarded}/${i.weeklyActive}/${i.interviewReady}/${i.atRisk}/${i.offers}`]
  })

  // --- Purnea branch stats --------------------------------------------------
  check('PCE_BRANCH_STATS: finalYear 268, onboarded 241, weighted PRI → 54', () => {
    const rows = Object.values(PCE_BRANCH_STATS)
    const fy = rows.reduce((s, r) => s + r.finalYear, 0)
    const on = rows.reduce((s, r) => s + r.onboarded, 0)
    const avg = rows.reduce((s, r) => s + r.onboarded * r.avgPri, 0) / on
    return [fy === 268 && on === 241 && Math.round(avg) === 54, `${fy} / ${on} / ${avg.toFixed(2)}`]
  })
  check('PCE_BRANCH_SKILL: ECE communication = versantToPillar(44) = 40', () => {
    const r = PCE_BRANCH_SKILL.rows.indexOf('ECE')
    const c = PCE_BRANCH_SKILL.cols.indexOf('communication')
    const v = PCE_BRANCH_SKILL.values[r]?.[c]
    return [v === 40 && versantToPillar(PCE_BRANCH_STATS.ECE.commVersant) === 40, `ECE comm ${v}`]
  })
  check('PCE_STUDENTS: 30 rows, 12 high / 10 medium / 8 low, Priya first 42 → 71', () => {
    const n = PCE_STUDENTS.length
    const h = PCE_STUDENTS.filter((s) => s.risk === 'high').length
    const m = PCE_STUDENTS.filter((s) => s.risk === 'medium').length
    const l = PCE_STUDENTS.filter((s) => s.risk === 'low').length
    const p = PCE_STUDENTS[0]
    const ok = n === 30 && h === 12 && m === 10 && l === 8 && p?.id === 'priya' && p.pri === 71 && p.priPrev === 42
    return [ok, `${n} rows · ${h}/${m}/${l} · first ${p?.id} ${p?.priPrev}→${p?.pri}`]
  })
  check('Student rows: computePRI(pillars) = pri; ids unique', () => {
    const rows = [...PCE_STUDENTS, ...studentsFor('mit-muzaffarpur'), ...studentsFor('gce-gaya'), ...studentsFor('gp-muzaffarpur')]
    const bad = rows.filter((r) => computePRI(r.pillars) !== r.pri)
    const ids = new Set(rows.map((r) => r.id))
    return [bad.length === 0 && ids.size === rows.length, bad.length ? `bad: ${bad.map((r) => r.id).join(', ')}` : `${rows.length} rows ok`]
  })
  check("studentsFor('gp-muzaffarpur')[0] is Rahul (68, new)", () => {
    const r = studentsFor('gp-muzaffarpur')[0]
    return [r?.id === 'rahul' && r.pri === 68 && r.priPrev === 68 && r.status === 'new', `${r?.id} ${r?.pri} ${r?.status}`]
  })

  // --- personas & scoring -------------------------------------------------
  check('computePRI equals pri for every attempt', () => {
    const all = [PRIYA, RAHUL].flatMap((p) => p.attempts)
    const bad = all.filter((a) => computePRI(a.pillars) !== a.pri)
    return [bad.length === 0 && all.length === 4, all.map((a) => `${a.id} ${computePRI(a.pillars)}/${a.pri}`).join(', ')]
  })
  check('Attempt comm/interview pillars follow Versant and content/delivery', () => {
    const all = [PRIYA, RAHUL].flatMap((p) => p.attempts)
    const bad = all.filter(
      (a) =>
        versantToPillar(a.versant) !== a.pillars.communication ||
        interviewPillar(a.content, a.delivery) !== a.pillars.techInterview,
    )
    return [bad.length === 0, bad.length ? bad.map((a) => a.id).join(', ') : `${all.length} ok`]
  })
  check(`Integrity ${INTEGRITY_FLOOR}..100 keeps Priya 71 and Rahul 68`, () => {
    const pa = latestAttempt(PRIYA).pillars
    const ra = latestAttempt(RAHUL).pillars
    const bad: number[] = []
    for (let i = INTEGRITY_FLOOR; i <= 100; i++) {
      if (computePRI(withLiveIntegrity(pa, i)) !== 71 || computePRI(withLiveIntegrity(ra, i)) !== 68) bad.push(i)
    }
    return [bad.length === 0, bad.length ? `breaks at ${bad.join(', ')}` : `${INTEGRITY_FLOOR}-100 ok`]
  })
  check('versantToPillar(VERSANT_TARGETS) = ROUND_TARGETS.communication', () => {
    const d = RUN_IDS.map((p) => `${p} ${versantToPillar(VERSANT_TARGETS[p])}/${ROUND_TARGETS[p].communication}`)
    const ok = RUN_IDS.every((p) => versantToPillar(VERSANT_TARGETS[p]) === ROUND_TARGETS[p].communication)
    return [ok, d.join(', ')]
  })
  check('interviewPillar(INTERVIEW_SPLIT) = ROUND_TARGETS.techInterview', () => {
    const v = (p: PersonaRunId) => interviewPillar(INTERVIEW_SPLIT[p].content, INTERVIEW_SPLIT[p].delivery)
    const ok = RUN_IDS.every((p) => v(p) === ROUND_TARGETS[p].techInterview)
    return [ok, RUN_IDS.map((p) => `${p} ${v(p)}/${ROUND_TARGETS[p].techInterview}`).join(', ')]
  })
  check("ROUND_TARGETS match each persona's latest attempt", () => {
    const bad: string[] = []
    for (const p of RUN_IDS) {
      const a = latestAttempt(PERSONAS[p])
      const t = ROUND_TARGETS[p]
      if (
        t.aptitude !== a.pillars.aptitude ||
        t.technical !== a.pillars.technical ||
        t.communication !== a.pillars.communication ||
        t.techInterview !== a.pillars.techInterview ||
        t.hrInterview !== a.pillars.hr ||
        VERSANT_TARGETS[p] !== a.versant ||
        INTERVIEW_SPLIT[p].content !== a.content ||
        INTERVIEW_SPLIT[p].delivery !== a.delivery
      )
        bad.push(p)
    }
    return [bad.length === 0, bad.length ? bad.join(', ') : 'priya, rahul ok']
  })
  check('Attempt dates derive from DEMO_TODAY (6 Oct, 16 Oct)', () => {
    const ok = isoDaysBefore(22) === '2026-10-06' && isoDaysBefore(12) === '2026-10-16' && PRIYA.attempts[0].date === isoDaysBefore(22)
    return [ok, `${isoDaysBefore(22)}, ${isoDaysBefore(12)} · ${WEEK_LABEL.en}`]
  })

  // --- drives ---------------------------------------------------------------
  check("drivesFor('priya') = 9, drivesFor('rahul') = 3", () => {
    const p = drivesFor('priya').length
    const r = drivesFor('rahul').length
    const ok = p === 9 && r === 3 && DRIVE_COUNTS.priya.now === p && DRIVE_COUNTS.rahul.now === r && DRIVES.length === 13
    return [ok, `priya ${p}, rahul ${r}, ${DRIVES.length} drives`]
  })
  check('d1: 142 eligible, 51 ready', () => {
    const d = driveById('d1')
    return [d?.eligibleCount === 142 && d?.readyCount === 51, `${d?.eligibleCount} / ${d?.readyCount}`]
  })
  check('poolReady(d2) = 412; POOL_CONTRIB ≤ batch interviewReady', () => {
    const d2 = driveById('d2')
    if (!d2) return [false, 'd2 missing']
    const total = poolReady(d2.institutionIds)
    const bad = d2.institutionIds.filter((id) => {
      const inst = institutionById(id)
      return !inst || (POOL_CONTRIB[id] ?? 0) > batchOf(inst).interviewReady
    })
    return [total === 412 && total === d2.readyCount && bad.length === 0 && d2.institutionIds.length === 11, `pool ${total}${bad.length ? ` · over: ${bad.join(', ')}` : ''}`]
  })
  check('Drive references resolve; ready ≤ eligible', () => {
    const bad = DRIVES.filter(
      (d) =>
        !institutionById(d.hostInstitutionId) ||
        d.institutionIds.some((id) => !institutionById(id)) ||
        (d.blueprintId && !BLUEPRINTS.some((b) => b.id === d.blueprintId)) ||
        d.readyCount > d.eligibleCount,
    )
    return [bad.length === 0, bad.length ? bad.map((d) => d.id).join(', ') : `${DRIVES.length} ok`]
  })
  check('No company names in drive titles', () => {
    // One OEM name is split so the repo-wide forbidden-string grep (scripts/os-check) stays clean.
    const names = ['TCS', 'Tata', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Amazon', 'Mar' + 'uti', 'Hero', 'Bajaj', 'Larsen', 'NTPC', 'Siemens', 'Google', 'Microsoft']
    const re = new RegExp(`\\b(${names.join('|')})\\b`, 'i')
    const bad = DRIVES.filter((d) => re.test(d.title.en) || re.test(d.title.hi))
    return [bad.length === 0, bad.length ? bad.map((d) => d.id).join(', ') : 'clean']
  })

  check('9 blueprints; comm eliminatory for IT/product, advisory for core', () => {
    const bad = BLUEPRINTS.filter(
      (b) => (b.track.startsWith('core') ? b.commPolicy !== 'advisory' : b.commPolicy !== 'eliminatory'),
    )
    return [BLUEPRINTS.length === 9 && bad.length === 0, `${BLUEPRINTS.length} blueprints${bad.length ? ` · bad: ${bad.map((b) => b.id).join(', ')}` : ''}`]
  })

  // --- preview internals ------------------------------------------------------
  check('PREVIEW.funnel[0] = onboarded; funnel non-increasing', () => {
    const f = PREVIEW.funnel
    const mono = f.every((s, i) => i === 0 || s.value <= f[i - 1].value)
    const ready = f.find((s) => s.id === 'ready')?.value
    const offer = f.find((s) => s.id === 'offer')?.value
    const ok = f[0]?.value === PREVIEW.onboarded && mono && ready === PREVIEW.interviewReady && offer === PREVIEW.offersAndInternships
    return [ok, f.map((s) => fmtIN(s.value)).join(' → ')]
  })
  check('branchRisk sums to atRisk', () => {
    const s = PREVIEW.branchRisk.reduce((a, r) => a + r.atRisk, 0)
    return [s === PREVIEW.atRisk, `${fmtIN(s)} vs ${fmtIN(PREVIEW.atRisk)}`]
  })
  check('aiTrainedByMonth sums to aiTrainedThisYear', () => {
    const s = PREVIEW.aiTrainedByMonth.reduce((a, r) => a + r.value, 0)
    return [s === PREVIEW.aiTrainedThisYear, `${fmtIN(s)} vs ${fmtIN(PREVIEW.aiTrainedThisYear)}`]
  })
  check('weeklyActivePct matches weeklyActive / onboarded', () => {
    const pct = Math.round((PREVIEW.weeklyActive / PREVIEW.onboarded) * 1000) / 10
    return [pct === PREVIEW.weeklyActivePct, `${pct}%`]
  })
  check('Branch skill: ME and D-ME weakest in CAD', () => {
    const { rows, cols, values } = PREVIEW.branchSkill
    const c = cols.indexOf('cad')
    const ok = (['ME', 'D-ME'] as const).every((b) => {
      const r = values[rows.indexOf(b)]
      return !!r && r[c] === Math.min(...r)
    })
    return [ok, `ME ${values[rows.indexOf('ME')]?.[c]}, D-ME ${values[rows.indexOf('D-ME')]?.[c]}`]
  })

  // --- ticker & formatting ------------------------------------------------------
  check('Ticker: 16 events, valid districts, no personal names', () => {
    const names = [PRIYA.name, RAHUL.name, PERSONAS.nusrat.name, ...PCE_STUDENTS.map((s) => s.name)]
    const firstNames = names.map((n) => n.replace(/^Md\.\s*/, '').split(' ')[0]).filter((n) => n.length > 3)
    const bad = TICKER.filter(
      (t) =>
        !DISTRICTS.some((d) => d.id === t.districtId) ||
        firstNames.some((n) => t.text.en.includes(n)),
    )
    return [TICKER.length === 16 && bad.length === 0, bad.length ? bad.map((t) => t.id).join(', ') : `${TICKER.length} clean`]
  })
  check('Formatting: fmtIN / fmtINR / WEEK_LABEL', () => {
    const a = fmtIN(112480)
    const b = fmtINR(6000)
    const c = fmtINR(400000)
    const d = fmtINR(15000000)
    const ok = a === '1,12,480' && b === '₹6,000' && c === '₹4 lakh' && d === '₹1.5 Cr' && WEEK_LABEL.en === 'Week 44 · 28 Oct 2026'
    return [ok, `${a} · ${b} · ${c} · ${d} · ${WEEK_LABEL.en}`]
  })

  return out
}
