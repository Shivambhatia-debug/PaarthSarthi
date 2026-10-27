// DSTTE State Command Centre: copy templates and derived aggregates.
// RULE (fix 24): no headline number is typed here. Every number in copy is read from
// PREVIEW / REPORTED / DISTRICTS / INSTITUTIONS / DRIVES at module load and formatted.
// Pure module (no React, no browser APIs). Class strings never live here (Tailwind does not need them).

import { fmtDate, fmtIN, fmtNum, fmtPct, isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { detectKeywords, matchCanned, normalizeText, type KeywordSpec } from '@/lib/ai-sim'
import { DEMO_TODAY, PREVIEW, REPORTED, SOURCES, WEEK_LABEL, daysFromToday, isoDaysBefore } from '@/lib/mock/state'
import { DISTRICT_GEO, DIVISIONS } from '@/lib/mock/geo'
import { DISTRICTS, districtById, districtsRanked } from '@/lib/mock/districts'
import { INSTITUTIONS, institutionById, institutionsByDistrict } from '@/lib/mock/institutions'
import { DRIVES, POOL_CONTRIB, driveById } from '@/lib/mock/drives'
import type { BranchCode, District, Drive, Institution, SkillKey } from '@/lib/mock/types'

export type OfficerLang = 'en' | 'hi'

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function bi(en: string, hi: string): Bi {
  return { en, hi }
}

function pctOf(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0
}

function sum(list: readonly number[]): number {
  let s = 0
  for (const n of list) s += n
  return s
}

/** '+11.2' / '−0.4' with a real minus sign. */
export function signed(n: number, decimals = 1): string {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '±'
  return `${sign}${fmtNum(Math.abs(n), decimals)}`
}

/** 500000 -> '5 lakh' / '5 लाख'. */
export function lakh(n: number, lang: OfficerLang): string {
  const v = n / 1e5
  const s = Number.isInteger(v) ? String(v) : fmtNum(v, 1)
  return lang === 'hi' ? `${s} लाख` : `${s} lakh`
}

const HI_COUNT_WORD: Record<number, string> = { 2: 'दोनों', 3: 'तीनों', 4: 'चारों', 5: 'पाँचों' }

const GEO_BY_ID = new Map(DISTRICT_GEO.map((g) => [g.id, g] as const))

export function districtName(id: string, lang: OfficerLang): string {
  const g = GEO_BY_ID.get(id)
  if (!g) return id
  return lang === 'hi' ? g.nameHi : g.name
}

export function divisionName(id: string, lang: OfficerLang): string {
  const g = GEO_BY_ID.get(id)
  if (!g) return ''
  return lang === 'hi' ? g.divisionHi : g.division
}

export function divisionOfDistrict(id: string): string {
  return GEO_BY_ID.get(id)?.division ?? ''
}

/** PRI change since baseline for an institution or district. */
export function priGain(x: { pri: number; priBaseline: number }): number {
  return x.pri - x.priBaseline
}

// ---------------------------------------------------------------------------
// Skill labels and remedies
// ---------------------------------------------------------------------------

export const SKILL_LABEL: Record<SkillKey, Bi> = {
  aptitude: bi('Aptitude', 'अभिरुचि'),
  dsa: bi('DSA', 'DSA'),
  sql: bi('SQL', 'SQL'),
  python: bi('Python', 'Python'),
  core: bi('Core subjects', 'कोर विषय'),
  cad: bi('CAD', 'CAD'),
  plc: bi('PLC', 'PLC'),
  communication: bi('Communication', 'संवाद'),
  excel: bi('Excel', 'Excel'),
}

/** What Sarthi recommends for each top gap. */
export const GAP_FIX: Record<SkillKey, Bi> = {
  communication: bi('a Versant-style speaking sprint', 'Versant-शैली बोलचाल अभ्यास'),
  dsa: bi('a DSA coding sprint', 'DSA कोडिंग अभ्यास'),
  aptitude: bi('an aptitude sprint', 'एप्टीट्यूड अभ्यास'),
  core: bi('a core-subject lab sprint', 'कोर विषय लैब अभ्यास'),
  cad: bi('the FutureSkills Prime CAD module', 'फ्यूचरस्किल्स प्राइम CAD मॉड्यूल'),
  sql: bi('a SQL practice sprint', 'SQL अभ्यास'),
  python: bi('a Python practice sprint', 'Python अभ्यास'),
  plc: bi('a PLC lab sprint', 'PLC लैब अभ्यास'),
  excel: bi('an Excel skills sprint', 'Excel कौशल अभ्यास'),
}

/** Most common district top gap, weighted by students assessed. */
export function stateTopGap(): SkillKey {
  const acc = new Map<SkillKey, number>()
  for (const d of DISTRICTS) acc.set(d.topGap, (acc.get(d.topGap) ?? 0) + d.studentsAssessed)
  let best: SkillKey = 'communication'
  let bestW = -1
  for (const [k, w] of acc) {
    if (w > bestW) {
      best = k
      bestW = w
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Filters (title strip -> map + leaderboard; KPI tiles never change)
// ---------------------------------------------------------------------------

export interface StateFilter {
  type: 'all' | 'GEC' | 'GP'
  region: 'all' | 'north' | 'south'
  aspirational: boolean
}

export const DEFAULT_FILTER: StateFilter = { type: 'all', region: 'all', aspirational: false }

export function isDefaultFilter(f: StateFilter): boolean {
  return f.type === 'all' && f.region === 'all' && !f.aspirational
}

export function filterKey(f: StateFilter): string {
  return `${f.type}|${f.region}|${f.aspirational ? 'asp' : 'any'}`
}

/** Institution predicate, or undefined for the unfiltered view (so the fixed district values hold exactly). */
export function filterPredicate(f: StateFilter): ((i: Institution) => boolean) | undefined {
  if (isDefaultFilter(f)) return undefined
  return (i: Institution) => {
    if (f.type !== 'all' && i.type !== f.type) return false
    const g = GEO_BY_ID.get(i.districtId)
    if (!g) return false
    if (f.region === 'north' && !g.northOfGanga) return false
    if (f.region === 'south' && g.northOfGanga) return false
    if (f.aspirational && !g.aspirational) return false
    return true
  }
}

export function filterLabel(f: StateFilter): Bi {
  const parts: Bi[] = []
  parts.push(
    f.type === 'GEC'
      ? bi('Engineering colleges', 'इंजीनियरिंग कॉलेज')
      : f.type === 'GP'
        ? bi('Polytechnics', 'पॉलिटेक्निक')
        : bi('All institutions', 'सभी संस्थान'),
  )
  if (f.region === 'north') parts.push(bi('North of Ganga', 'गंगा के उत्तर'))
  if (f.region === 'south') parts.push(bi('South of Ganga', 'गंगा के दक्षिण'))
  if (f.aspirational) parts.push(bi('Aspirational districts', 'आकांक्षी ज़िले'))
  if (parts.length === 1 && f.type === 'all') parts.push(bi('whole state', 'पूरा राज्य'))
  return bi(parts.map((p) => p.en).join(' · '), parts.map((p) => p.hi).join(' · '))
}

// ---------------------------------------------------------------------------
// Map caption (AI insight under the tile map)
// ---------------------------------------------------------------------------

export interface MapCaption {
  title: Bi
  body: Bi
  evidence: Bi[]
  ids: string[]
}

export function mapCaption(f: StateFilter): MapCaption | null {
  const ranked = districtsRanked(filterPredicate(f))
  if (ranked.length === 0) return null
  const scope = filterLabel(f)
  const statewide = stateTopGap()
  if (ranked.length === 1) {
    const d = ranked[0]
    return {
      title: bi('Where to act first', 'पहले कहाँ ध्यान दें'),
      body: bi(
        `${d.name} needs support first (simulated PRI ${fmtNum(d.pri)}); ${SKILL_LABEL[d.topGap].en} is its top gap. Recommend ${GAP_FIX[d.topGap].en} and one pool drive.`,
        `${d.nameHi} को सबसे पहले सहायता चाहिए (सिम्युलेटेड PRI ${fmtNum(d.pri)}); सबसे बड़ी कमी ${SKILL_LABEL[d.topGap].hi} है। सुझाव: ${GAP_FIX[d.topGap].hi} और एक पूल ड्राइव।`,
      ),
      evidence: [
        bi(
          `${d.name}: ${fmtIN(d.studentsAssessed)} students assessed · ${fmtIN(d.atRisk)} at risk`,
          `${d.nameHi}: ${fmtIN(d.studentsAssessed)} छात्रों का आकलन · ${fmtIN(d.atRisk)} जोखिम में`,
        ),
        bi(`View: ${scope.en}`, `दृश्य: ${scope.hi}`),
      ],
      ids: [d.id],
    }
  }
  const d0 = ranked[0]
  const d1 = ranked[1]
  const same = d0.topGap === d1.topGap
  // Communication first when present: it is the remedy the State already funds (Versant-style practice).
  const gaps: SkillKey[] = same ? [d0.topGap] : d1.topGap === 'communication' ? [d1.topGap, d0.topGap] : [d0.topGap, d1.topGap]
  const gapEn = same
    ? `${SKILL_LABEL[d0.topGap].en} is the top gap in both`
    : `top gaps are ${SKILL_LABEL[d0.topGap].en} in ${d0.name} and ${SKILL_LABEL[d1.topGap].en} in ${d1.name}`
  const gapHi = same
    ? `दोनों में सबसे बड़ी कमी ${SKILL_LABEL[d0.topGap].hi} है`
    : `${d0.nameHi} में सबसे बड़ी कमी ${SKILL_LABEL[d0.topGap].hi} और ${d1.nameHi} में ${SKILL_LABEL[d1.topGap].hi} है`
  const fixEn = gaps.map((g) => GAP_FIX[g].en).join(' and ')
  const fixHi = gaps.map((g) => GAP_FIX[g].hi).join(' और ')
  const fixJoinEn = gaps.length > 1 ? `${fixEn}, plus one pool drive` : `${fixEn} and one pool drive`
  const fixJoinHi = gaps.length > 1 ? `${fixHi}, साथ में एक पूल ड्राइव` : `${fixHi} और एक पूल ड्राइव`
  return {
    title: bi('Where to act first', 'पहले कहाँ ध्यान दें'),
    body: bi(
      `${d0.name} and ${d1.name} need support first (simulated PRI ${fmtNum(d0.pri)}, ${fmtNum(d1.pri)}); ${gapEn}. Recommend ${fixJoinEn}.`,
      `${d0.nameHi} और ${d1.nameHi} को सबसे पहले सहायता चाहिए (सिम्युलेटेड PRI ${fmtNum(d0.pri)}, ${fmtNum(d1.pri)}); ${gapHi}। सुझाव: ${fixJoinHi}।`,
    ),
    evidence: [
      bi(
        `${d0.name}: ${fmtIN(d0.studentsAssessed)} students assessed · ${fmtIN(d0.atRisk)} at risk · top gap ${SKILL_LABEL[d0.topGap].en}`,
        `${d0.nameHi}: ${fmtIN(d0.studentsAssessed)} छात्रों का आकलन · ${fmtIN(d0.atRisk)} जोखिम में · कमी: ${SKILL_LABEL[d0.topGap].hi}`,
      ),
      bi(
        `${d1.name}: ${fmtIN(d1.studentsAssessed)} students assessed · ${fmtIN(d1.atRisk)} at risk · top gap ${SKILL_LABEL[d1.topGap].en}`,
        `${d1.nameHi}: ${fmtIN(d1.studentsAssessed)} छात्रों का आकलन · ${fmtIN(d1.atRisk)} जोखिम में · कमी: ${SKILL_LABEL[d1.topGap].hi}`,
      ),
      bi(
        `State average PRI ${fmtNum(PREVIEW.avgPri)}; statewide, ${SKILL_LABEL[statewide].en} is the most common top gap`,
        `राज्य औसत PRI ${fmtNum(PREVIEW.avgPri)}; राज्य में सबसे आम कमी: ${SKILL_LABEL[statewide].hi}`,
      ),
      bi(`View: ${scope.en} · ranked by simulated PRI`, `दृश्य: ${scope.hi} · सिम्युलेटेड PRI के क्रम में`),
    ],
    ids: [d0.id, d1.id],
  }
}

// ---------------------------------------------------------------------------
// District recommendations (district sheet)
// ---------------------------------------------------------------------------

function institutionsLine(d: District, lang: OfficerLang): string {
  const n = d.institutionIds.length
  return lang === 'hi' ? `${n} संस्थानों` : `${n} institution${n === 1 ? '' : 's'}`
}

function driveLine(dr: Drive | undefined, lang: OfficerLang): string {
  if (!dr) return ''
  return lang === 'hi' ? `${fmtDate(dr.date, 'hi')} की ${dr.title.hi}` : `the ${dr.title.en} on ${fmtDate(dr.date, 'en')}`
}

function hostDrive(districtId: string): Drive | undefined {
  return DRIVES.filter(
    (dr) => dr.date >= DEMO_TODAY && institutionById(dr.hostInstitutionId)?.districtId === districtId,
  ).sort((a, b) => a.date.localeCompare(b.date))[0]
}

/** Generic district recommendation (used when DISTRICT_RECS has no entry). */
export function genericDistrictRec(d: District): Bi {
  const gain = fmtNum(priGain(d))
  const dr = hostDrive(d.id)
  const driveEn = dr ? ` Line up candidates for ${driveLine(dr, 'en')}.` : ' Pair the district with the nearest pool drive.'
  const driveHi = dr ? ` ${driveLine(dr, 'hi')} के लिए उम्मीदवार तैयार करें।` : ' ज़िले को नज़दीकी पूल ड्राइव से जोड़ें।'
  return bi(
    `${d.name} is at simulated PRI ${fmtNum(d.pri)} (+${gain} since baseline) across ${institutionsLine(d, 'en')}, with ${fmtIN(d.atRisk)} students at risk. Top gap: ${SKILL_LABEL[d.topGap].en}. Recommend ${GAP_FIX[d.topGap].en} for the at-risk group, mentor assignment through the T&P cell, and a nodal-officer review in 4 weeks.${driveEn}`,
    `${d.nameHi} का सिम्युलेटेड PRI ${fmtNum(d.pri)} है (बेसलाइन से +${gain}), ${institutionsLine(d, 'hi')} में ${fmtIN(d.atRisk)} छात्र जोखिम में हैं। सबसे बड़ी कमी: ${SKILL_LABEL[d.topGap].hi}। सुझाव: जोखिम वाले छात्रों के लिए ${GAP_FIX[d.topGap].hi}, T&P सेल के माध्यम से मेंटर, और 4 सप्ताह बाद नोडल अधिकारी समीक्षा।${driveHi}`,
  )
}

function purniaRec(d: District): Bi {
  const d10 = driveById('d10')
  const pool = d10 ? d10.institutionIds.length : 0
  const insts = institutionsByDistrict(d.id)
  const sameGap = insts.filter((i) => i.topGap === d.topGap).length
  const inEn = sameGap === insts.length ? (insts.length === 2 ? 'in both institutions' : `in all ${insts.length} institutions`) : `in ${sameGap} of ${insts.length} institutions`
  const inHi = sameGap === insts.length ? `${HI_COUNT_WORD[insts.length] ?? 'सभी'} संस्थानों में` : `${insts.length} में से ${sameGap} संस्थानों में`
  return bi(
    `${d.name} is at simulated PRI ${fmtNum(d.pri)} (+${fmtNum(priGain(d))} since baseline); ${fmtIN(d.atRisk)} students are at risk and ${SKILL_LABEL[d.topGap].en} is the top gap ${inEn}. Recommend a 4-week Versant-style speaking sprint for ECE and CSE, ${d10 ? `then a mock round ahead of ${driveLine(d10, 'en')} (${pool} colleges in the pool)` : 'then one pool drive'}, and a monthly nodal-officer review.`,
    `${d.nameHi} का सिम्युलेटेड PRI ${fmtNum(d.pri)} है (बेसलाइन से +${fmtNum(priGain(d))}); ${fmtIN(d.atRisk)} छात्र जोखिम में हैं और ${inHi} सबसे बड़ी कमी ${SKILL_LABEL[d.topGap].hi} है। सुझाव: ECE और CSE के लिए 4 सप्ताह का Versant-शैली बोलचाल अभ्यास, ${d10 ? `फिर ${driveLine(d10, 'hi')} से पहले एक मॉक राउंड (पूल में ${pool} कॉलेज)` : 'फिर एक पूल ड्राइव'}, और मासिक नोडल अधिकारी समीक्षा।`,
  )
}

function muzaffarpurRec(d: District): Bi {
  const d2 = driveById('d2')
  return bi(
    `${d.name} is a strong district (simulated PRI ${fmtNum(d.pri)}) and hosts ${d2 ? `${driveLine(d2, 'en')}: ${fmtIN(d2.readyCount)} interview-ready students across ${d2.institutionIds.length} institutions` : 'a regional pool drive'}. Recommend confirming the pool shortlist this week and lending two mentors to the Purnia division for the communication sprint.`,
    `${d.nameHi} एक मज़बूत ज़िला है (सिम्युलेटेड PRI ${fmtNum(d.pri)}) और ${d2 ? `${driveLine(d2, 'hi')} की मेज़बानी करता है: ${d2.institutionIds.length} संस्थानों के ${fmtIN(d2.readyCount)} छात्र इंटरव्यू के लिए तैयार` : 'एक क्षेत्रीय पूल ड्राइव की मेज़बानी करता है'}। सुझाव: इस सप्ताह पूल शॉर्टलिस्ट की पुष्टि करें और संवाद अभ्यास के लिए पूर्णिया प्रमंडल को दो मेंटर दें।`,
  )
}

function gayaRec(d: District): Bi {
  const d5 = driveById('d5')
  return bi(
    `${d.name} is at simulated PRI ${fmtNum(d.pri)}, close to the state average of ${fmtNum(PREVIEW.avgPri)}. ${fmtIN(d.atRisk)} students are at risk; top gap: ${SKILL_LABEL[d.topGap].en}. Recommend ${GAP_FIX[d.topGap].en} for the Magadh cluster ahead of ${d5 ? driveLine(d5, 'en') : 'the next cluster drive'}.`,
    `${d.nameHi} का सिम्युलेटेड PRI ${fmtNum(d.pri)} है, जो राज्य औसत ${fmtNum(PREVIEW.avgPri)} के क़रीब है। ${fmtIN(d.atRisk)} छात्र जोखिम में हैं; सबसे बड़ी कमी: ${SKILL_LABEL[d.topGap].hi}। सुझाव: ${d5 ? driveLine(d5, 'hi') : 'अगली क्लस्टर ड्राइव'} से पहले मगध क्लस्टर के लिए ${GAP_FIX[d.topGap].hi}।`,
  )
}

function patnaRec(d: District): Bi {
  return bi(
    `${d.name} leads the state (simulated PRI ${fmtNum(d.pri)}) with ${fmtIN(d.interviewReady)} interview-ready students. Recommend using its ${institutionsLine(d, 'en')} as practice hubs: weekly peer mock interviews with colleges in the districts that need support first.`,
    `${d.nameHi} राज्य में सबसे आगे है (सिम्युलेटेड PRI ${fmtNum(d.pri)}), ${fmtIN(d.interviewReady)} छात्र इंटरव्यू के लिए तैयार हैं। सुझाव: इसके ${institutionsLine(d, 'hi')} को अभ्यास केंद्र बनाएँ: सहायता की ज़रूरत वाले ज़िलों के कॉलेजों के साथ साप्ताहिक मॉक इंटरव्यू।`,
  )
}

function madhubaniRec(d: District): Bi {
  const d7 = driveById('d7')
  return bi(
    `${d.name} needs support first (simulated PRI ${fmtNum(d.pri)}, +${fmtNum(priGain(d))} since baseline). ${fmtIN(d.atRisk)} students are at risk; top gap: ${SKILL_LABEL[d.topGap].en}. Recommend ${GAP_FIX[d.topGap].en}, mentors from the Darbhanga division, and preparation for ${d7 ? driveLine(d7, 'en') : 'the next IT drive'}.`,
    `${d.nameHi} को सबसे पहले सहायता चाहिए (सिम्युलेटेड PRI ${fmtNum(d.pri)}, बेसलाइन से +${fmtNum(priGain(d))})। ${fmtIN(d.atRisk)} छात्र जोखिम में हैं; सबसे बड़ी कमी: ${SKILL_LABEL[d.topGap].hi}। सुझाव: ${GAP_FIX[d.topGap].hi}, दरभंगा प्रमंडल से मेंटर, और ${d7 ? driveLine(d7, 'hi') : 'अगली IT ड्राइव'} की तैयारी।`,
  )
}

export const DISTRICT_RECS: Record<string, (d: District) => Bi> = {
  purnia: purniaRec,
  muzaffarpur: muzaffarpurRec,
  gaya: gayaRec,
  patna: patnaRec,
  madhubani: madhubaniRec,
}

export function districtRec(d: District): Bi {
  const fn = DISTRICT_RECS[d.id]
  return fn ? fn(d) : genericDistrictRec(d)
}

// ---------------------------------------------------------------------------
// Audit log (Trust tab). Timestamps derive from DEMO_TODAY.
// ---------------------------------------------------------------------------

export type AuditScope = 'names' | 'aggregate' | 'own' | 'system'

export interface AuditEvent {
  id: string
  date: string
  time: string
  actor: Bi
  action: Bi
  scope: AuditScope
}

function buildAuditLog(): AuditEvent[] {
  const d1 = driveById('d1')
  const d2 = driveById('d2')
  const gpm = POOL_CONTRIB['gp-muzaffarpur'] ?? 0
  const pce = institutionById('pce-purnea')
  const gpMuz = institutionById('gp-muzaffarpur')
  const mit = institutionById('mit-muzaffarpur')
  const yesterday = isoDaysBefore(1)
  const twoDays = isoDaysBefore(2)
  const threeDays = isoDaysBefore(3)
  return [
    {
      id: 'a1',
      date: DEMO_TODAY,
      time: '10:42',
      actor: bi(`TPO ${pce?.short ?? ''}`, `TPO ${pce?.short ?? ''}`),
      action: bi(
        `exported drive shortlist (${fmtIN(d1?.readyCount ?? 0)} rows)`,
        `ड्राइव शॉर्टलिस्ट निर्यात की (${fmtIN(d1?.readyCount ?? 0)} पंक्तियाँ)`,
      ),
      scope: 'names',
    },
    {
      id: 'a2',
      date: DEMO_TODAY,
      time: '10:15',
      actor: bi('State analyst, DSTTE', 'राज्य विश्लेषक, DSTTE'),
      action: bi('viewed district aggregates (minimum cell 20)', 'ज़िला-स्तरीय कुल आँकड़े देखे (न्यूनतम सेल 20)'),
      scope: 'aggregate',
    },
    {
      id: 'a3',
      date: DEMO_TODAY,
      time: '09:58',
      actor: bi(`TPO ${gpMuz?.short ?? ''}`, `TPO ${gpMuz?.short ?? ''}`),
      action: bi(
        `added ${fmtIN(gpm)} students to the ${d2?.title.en ?? 'pool drive'}`,
        `${d2?.title.hi ?? 'पूल ड्राइव'} में ${fmtIN(gpm)} छात्र जोड़े`,
      ),
      scope: 'names',
    },
    {
      id: 'a4',
      date: DEMO_TODAY,
      time: '09:31',
      actor: bi('Sarthi AI', 'सारथी AI'),
      action: bi(
        `flagged ${fmtIN(PREVIEW.today.newlyReady)} newly interview-ready students for TPO review (advisory)`,
        `${fmtIN(PREVIEW.today.newlyReady)} नए इंटरव्यू-तैयार छात्रों को TPO समीक्षा के लिए चिह्नित किया (सलाह मात्र)`,
      ),
      scope: 'system',
    },
    {
      id: 'a5',
      date: yesterday,
      time: '18:20',
      actor: bi('Student (self)', 'छात्र (स्वयं)'),
      action: bi('downloaded own readiness report', 'अपनी तैयारी रिपोर्ट डाउनलोड की'),
      scope: 'own',
    },
    {
      id: 'a6',
      date: yesterday,
      time: '16:05',
      actor: bi('State analyst, DSTTE', 'राज्य विश्लेषक, DSTTE'),
      action: bi(
        `exported state aggregates (${fmtIN(DISTRICTS.length)} district rows, no names)`,
        `राज्य के कुल आँकड़े निर्यात किए (${fmtIN(DISTRICTS.length)} ज़िला पंक्तियाँ, कोई नाम नहीं)`,
      ),
      scope: 'aggregate',
    },
    {
      id: 'a7',
      date: yesterday,
      time: '11:47',
      actor: bi('Student (self)', 'छात्र (स्वयं)'),
      action: bi('withdrew consent; deletion queued (1 record)', 'सहमति वापस ली; डेटा हटाना कतार में (1 रिकॉर्ड)'),
      scope: 'own',
    },
    {
      id: 'a8',
      date: twoDays,
      time: '15:30',
      actor: bi('Grievance desk', 'शिकायत डेस्क'),
      action: bi('acknowledged a grievance within 48 hours', '48 घंटे के भीतर शिकायत की पावती दी'),
      scope: 'system',
    },
    {
      id: 'a9',
      date: twoDays,
      time: '12:10',
      actor: bi(`TPO ${mit?.short ?? ''}`, `TPO ${mit?.short ?? ''}`),
      action: bi('viewed own college at-risk list', 'अपने कॉलेज की जोखिम सूची देखी'),
      scope: 'names',
    },
    {
      id: 'a10',
      date: threeDays,
      time: '09:05',
      actor: bi('Platform admin', 'प्लेटफ़ॉर्म एडमिन'),
      action: bi('completed the role-access review (3 roles)', 'भूमिका-आधारित पहुँच की समीक्षा पूरी की (3 भूमिकाएँ)'),
      scope: 'system',
    },
  ]
}

export const AUDIT_LOG: AuditEvent[] = buildAuditLog()

/** `${fmtDate(date)} ${time} · ${actor} ${action}` */
export function auditLine(e: AuditEvent, lang: OfficerLang): string {
  return `${fmtDate(e.date, lang)} ${e.time} · ${tr(e.actor, lang)} ${tr(e.action, lang)}`
}

// ---------------------------------------------------------------------------
// At-risk aggregates: division-level, pseudonymous, every cell >= 20 (minimum cell)
// ---------------------------------------------------------------------------

export const MIN_CELL = 20

export interface AtRiskRow {
  id: string
  type: 'GEC' | 'GP'
  divisionId: string
  division: Bi
  branch: BranchCode
  branchLabel: Bi
  pctBelow50: number
  count: number
  institutions: number
}

function divisionPri(divisionId: string): number {
  const div = DIVISIONS.find((v) => v.id === divisionId)
  if (!div) return PREVIEW.avgPri
  const list = INSTITUTIONS.filter((i) => div.districts.includes(i.districtId))
  const w = sum(list.map((i) => i.onboarded))
  return w > 0 ? sum(list.map((i) => i.onboarded * i.pri)) / w : PREVIEW.avgPri
}

function buildAtRisk(): AtRiskRow[] {
  const rows: AtRiskRow[] = []
  const types: ('GEC' | 'GP')[] = ['GEC', 'GP']
  for (const type of types) {
    const branchRows = PREVIEW.branchRisk.filter((b) => (type === 'GP' ? b.branch.startsWith('D-') : !b.branch.startsWith('D-')))
    const stateTypeRisk = sum(INSTITUTIONS.filter((i) => i.type === type).map((i) => i.atRisk))
    // Never allocate more than the type's at-risk pool: normalise by the larger of the two totals.
    const denom = Math.max(sum(branchRows.map((b) => b.atRisk)), stateTypeRisk, 1)
    for (const div of DIVISIONS) {
      const insts = INSTITUTIONS.filter((i) => i.type === type && div.districts.includes(i.districtId))
      if (insts.length === 0) continue
      const divRisk = sum(insts.map((i) => i.atRisk))
      const shift = (PREVIEW.avgPri - divisionPri(div.id)) * 2
      for (const b of branchRows) {
        const count = Math.round((divRisk * b.atRisk) / denom)
        if (count < MIN_CELL) continue
        rows.push({
          id: `${type}-${div.id}-${b.branch}`,
          type,
          divisionId: div.id,
          division: bi(div.name, div.nameHi),
          branch: b.branch,
          branchLabel: b.label,
          pctBelow50: Math.min(95, Math.max(5, Math.round(b.below50Pct + shift))),
          count,
          institutions: insts.length,
        })
      }
    }
  }
  return rows.sort((a, b) => b.count - a.count || b.pctBelow50 - a.pctBelow50).slice(0, 8)
}

export const AT_RISK_AGG: AtRiskRow[] = buildAtRisk()

/** 'Engineering college · Magadh division · Civil' (the cohort label, no numbers). */
export function atRiskCohort(r: AtRiskRow, lang: OfficerLang): string {
  if (lang === 'hi') {
    return `${r.type === 'GEC' ? 'इंजीनियरिंग कॉलेज' : 'पॉलिटेक्निक'} · ${r.division.hi} प्रमंडल · ${r.branchLabel.hi}`
  }
  return `${r.type === 'GEC' ? 'Engineering college' : 'Polytechnic'} · ${r.division.en} division · ${r.branchLabel.en}`
}

/** 'Engineering college · Magadh division · Civil · 61% · 42' */
export function atRiskLabel(r: AtRiskRow, lang: OfficerLang): string {
  return `${atRiskCohort(r, lang)} · ${r.pctBelow50}% · ${fmtIN(r.count)}`
}

// ---------------------------------------------------------------------------
// Panel copy templates
// ---------------------------------------------------------------------------

/** Mechanical rows (ME, D-ME): weakest skill and its average. */
export function mechanicalWeakest(): { skill: SkillKey; avg: number; rows: { branch: string; value: number }[] } {
  const bs = PREVIEW.branchSkill
  const idx = bs.rows.map((r, i) => (r === 'ME' || r === 'D-ME' ? i : -1)).filter((i) => i >= 0)
  let best: SkillKey = bs.cols[0]
  let bestAvg = Infinity
  bs.cols.forEach((c, ci) => {
    const avg = idx.length ? sum(idx.map((ri) => bs.values[ri][ci])) / idx.length : Infinity
    if (avg < bestAvg) {
      bestAvg = avg
      best = c
    }
  })
  const ci = bs.cols.indexOf(best)
  return { skill: best, avg: bestAvg, rows: idx.map((ri) => ({ branch: bs.rows[ri], value: bs.values[ri][ci] })) }
}

export function mechDrives(): Drive[] {
  return DRIVES.filter((d) => d.blueprintId === 'core-mech-oem-style' && d.date >= DEMO_TODAY).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

export function skillGapInsight(): { title: Bi; body: Bi; evidence: Bi[] } {
  const m = mechanicalWeakest()
  const drives = mechDrives()
  const skill = SKILL_LABEL[m.skill]
  const allPool = drives.length > 0 && drives.every((d) => d.pool)
  const dates = (lang: OfficerLang) => drives.map((d) => fmtDate(d.date, lang)).join(', ')
  return {
    title: bi(`Mechanical: ${skill.en} is the weakest skill`, `मैकेनिकल: ${skill.hi} सबसे कमज़ोर कौशल`),
    body: bi(
      `Mechanical students are weakest in ${skill.en} (avg ${fmtNum(m.avg)}). Map to the FutureSkills Prime ${skill.en} module + ${drives.length} auto-OEM-style ${allPool ? 'pool drives' : 'drives'}.`,
      `मैकेनिकल छात्र ${skill.hi} में सबसे कमज़ोर हैं (औसत ${fmtNum(m.avg)})। सुझाव: फ्यूचरस्किल्स प्राइम ${skill.hi} मॉड्यूल + ${drives.length} ऑटो-OEM-शैली ${allPool ? 'पूल ड्राइव' : 'ड्राइव'}।`,
    ),
    evidence: [
      ...m.rows.map((r) => bi(`${r.branch} · ${skill.en} ${fmtNum(r.value, 0)} (pillar scale)`, `${r.branch} · ${skill.hi} ${fmtNum(r.value, 0)} (स्तंभ पैमाना)`)),
      bi(`Auto-OEM-style drives on ${dates('en')}`, `ऑटो-OEM-शैली ड्राइव: ${dates('hi')}`),
      bi('Readiness line is 50 on the pillar scale', 'स्तंभ पैमाने पर तैयारी रेखा 50 है'),
    ],
  }
}

export interface FunnelStep {
  id: string
  label: Bi
  value: number
  /** % of the previous stage that reached this stage (null for the first stage). */
  conv: number | null
}

export function funnelSteps(): FunnelStep[] {
  return PREVIEW.funnel.map((s, i) => ({
    id: s.id,
    label: s.stage,
    value: s.value,
    conv: i === 0 ? null : pctOf(s.value, PREVIEW.funnel[i - 1].value),
  }))
}

export function topDropOff(): { from: FunnelStep; to: FunnelStep; conv: number; lost: number } | null {
  const steps = funnelSteps()
  let best: { from: FunnelStep; to: FunnelStep; conv: number; lost: number } | null = null
  for (let i = 1; i < steps.length; i++) {
    const c = steps[i].conv ?? 100
    if (!best || c < best.conv) best = { from: steps[i - 1], to: steps[i], conv: c, lost: steps[i - 1].value - steps[i].value }
  }
  return best
}

export function aiPolicyStats() {
  const done = PREVIEW.aiTrainedThisYear
  const target = PREVIEW.aiTrainedTargetYear
  const months = PREVIEW.aiTrainedByMonth
  const last = months[months.length - 1]
  const first = months[0]
  const remaining = Math.max(0, target - done)
  const monthsAtPace = last && last.value > 0 ? remaining / last.value : null
  return { done, target, pct: pctOf(done, target), months, last, first, remaining, monthsAtPace }
}

export function aiPolicyInsight(): Bi {
  const s = aiPolicyStats()
  if (!s.last || s.monthsAtPace == null) return bi('', '')
  return bi(
    `At ${s.last.label.en}'s pace (${fmtIN(s.last.value)}/month), the remaining ${fmtIN(s.remaining)} take about ${fmtNum(s.monthsAtPace)} months.`,
    `${s.last.label.hi} की रफ़्तार (${fmtIN(s.last.value)}/माह) से शेष ${fmtIN(s.remaining)} में लगभग ${fmtNum(s.monthsAtPace)} महीने लगेंगे।`,
  )
}

/** '5 lakh in 5 years' */
export function aiPolicyTargetShort(lang: OfficerLang): string {
  const years = Math.round(REPORTED.aiPolicy.target5yr / REPORTED.aiPolicy.perYear)
  return lang === 'hi'
    ? `${years} वर्षों में ${lakh(REPORTED.aiPolicy.target5yr, 'hi')}`
    : `${lakh(REPORTED.aiPolicy.target5yr, 'en')} in ${years} years`
}

/** '5 lakh in 5 years (draft AI Policy 2026, as reported)' */
export function aiPolicyTargetLine(lang: OfficerLang): string {
  return lang === 'hi'
    ? `${aiPolicyTargetShort('hi')} (मसौदा AI नीति 2026, रिपोर्ट के अनुसार)`
    : `${aiPolicyTargetShort('en')} (draft AI Policy 2026, as reported)`
}

export function atRiskHeadline(lang: OfficerLang): string {
  return lang === 'hi'
    ? `${fmtIN(PREVIEW.atRisk)} जोखिम में; इस सप्ताह ${fmtIN(PREVIEW.atRiskMentored)} स्वतः मेंटर को सौंपे गए`
    : `${fmtIN(PREVIEW.atRisk)} at risk; ${fmtIN(PREVIEW.atRiskMentored)} auto-assigned to mentors this week`
}

// ---------------------------------------------------------------------------
// Ask Sarthi: canned Q&A, every answer a function over foundation data
// ---------------------------------------------------------------------------

export interface AskChartRow {
  id: string
  name: Bi
  value: number
  hl?: boolean
}

export interface AskChart {
  data: AskChartRow[]
  unit: Bi
  ref?: { value: number; label: Bi }
  decimals?: number
  suffix?: string
}

export interface AskWhy {
  filters: Bi
  n: number
  nLabel: Bi
  confidence: number
}

export interface AskQA {
  id: string
  q: Bi
  /** Language the chip is shown and answered in by default. */
  qLang: OfficerLang
  keywords: KeywordSpec[]
  answer: () => Bi
  chart: () => AskChart
  actions: Bi[]
  why: () => AskWhy
  /** Districts to highlight on the map while this answer is open. */
  focus?: () => string[]
}

function purniaDivision() {
  const div = DIVISIONS.find((v) => v.id === 'purnia')
  const ids = div?.districts ?? []
  const ds = ids.map((id) => districtById(id)).filter((d): d is District => !!d).sort((a, b) => a.pri - b.pri)
  const insts = INSTITUTIONS.filter((i) => ids.includes(i.districtId))
  return { div, ids, ds, insts }
}

function lowestCommBranches(n: number): { branch: string; value: number }[] {
  const bs = PREVIEW.branchSkill
  const ci = bs.cols.indexOf('communication')
  if (ci < 0) return []
  return bs.rows
    .map((r, ri) => ({ branch: r as string, value: bs.values[ri][ci] }))
    .sort((a, b) => a.value - b.value)
    .slice(0, n)
}

function weakestSkillOf(branch: string): { skill: SkillKey; value: number } | null {
  const bs = PREVIEW.branchSkill
  const ri = bs.rows.indexOf(branch as BranchCode)
  if (ri < 0) return null
  let ci = 0
  bs.values[ri].forEach((v, i) => {
    if (v < bs.values[ri][ci]) ci = i
  })
  return { skill: bs.cols[ci], value: bs.values[ri][ci] }
}

function upcomingDrives(days: number): Drive[] {
  return DRIVES.filter((d) => {
    const n = daysFromToday(d.date)
    return n >= 0 && n <= days
  }).sort((a, b) => a.date.localeCompare(b.date))
}

function topImprovers(n: number): Institution[] {
  return [...INSTITUTIONS].sort((a, b) => priGain(b) - priGain(a) || a.id.localeCompare(b.id)).slice(0, n)
}

function divisionPriRows(): AskChartRow[] {
  return DIVISIONS.map((v) => ({ id: v.id, name: bi(v.name, v.nameHi), value: Math.round(divisionPri(v.id) * 10) / 10 })).sort(
    (a, b) => a.value - b.value,
  )
}

export const DIVISION_PRI_ROWS: AskChartRow[] = divisionPriRows()

const Q_PURNIA: AskQA = {
  id: 'purnia-comm',
  qLang: 'hi',
  q: bi(
    'Where is the communication-skill gap in Purnia division, and what should we do?',
    'पूर्णिया प्रमंडल में संवाद कौशल की कमी कहाँ है, और क्या करें?',
  ),
  keywords: [
    { label: 'purnia', aliases: ['purnia', 'purnea', 'पूर्णिया', 'पुर्णिया', 'पूर्णियाँ'] },
    { label: 'communication', aliases: ['communication', 'संवाद', 'कम्युनिकेशन', 'speaking', 'spoken', 'बोलचाल', 'english', 'अंग्रेज़ी', 'अंग्रेजी'] },
    { label: 'division', aliases: ['division', 'प्रमंडल', 'araria', 'अररिया', 'kishanganj', 'किशनगंज', 'katihar', 'कटिहार'] },
  ],
  answer: () => {
    const { ds, insts } = purniaDivision()
    const d10 = driveById('d10')
    const n = ds.length
    const comm = ds.filter((d) => d.topGap === 'communication').length
    const low = lowestCommBranches(2)
    const lowEn = low.map((b) => `${b.branch} (${fmtNum(b.value, 0)})`).join(' and ')
    const lowHi = low.map((b) => `${b.branch} (${fmtNum(b.value, 0)})`).join(' और ')
    const linesEn = ds.map((d) => `• ${d.name}: PRI ${fmtNum(d.pri)} · top gap ${SKILL_LABEL[d.topGap].en}`).join('\n')
    const linesHi = ds.map((d) => `• ${d.nameHi}: PRI ${fmtNum(d.pri)} · सबसे बड़ी कमी ${SKILL_LABEL[d.topGap].hi}`).join('\n')
    const allEn = comm === n ? `in all ${n} districts` : `in ${comm} of ${n} districts`
    const allHi = comm === n ? `सभी ${n} ज़िलों में` : `${n} में से ${comm} ज़िलों में`
    const poolEn = d10 ? `${driveLine(d10, 'en')} (${d10.institutionIds.length} colleges of the division)` : 'one division pool drive'
    const poolHi = d10 ? `${driveLine(d10, 'hi')} (प्रमंडल के ${d10.institutionIds.length} कॉलेज)` : 'प्रमंडल की एक पूल ड्राइव'
    return bi(
      `Purnia division, district level (simulated PRI; state average ${fmtNum(PREVIEW.avgPri)}):\n${linesEn}\nCommunication is the top gap ${allEn}. At branch level, the weakest communication scores statewide are ${lowEn}.\nWhat to do:\n1. A 4-week Versant-style speaking sprint in the division's ${insts.length} colleges.\n2. One pool drive: ${poolEn}.\n3. A monthly review with the division's nodal officers.`,
      `पूर्णिया प्रमंडल, ज़िला स्तर पर (सिम्युलेटेड PRI; राज्य औसत ${fmtNum(PREVIEW.avgPri)}):\n${linesHi}\n${allHi} संवाद कौशल सबसे बड़ी कमी है। शाखा स्तर पर, राज्य में संवाद स्कोर सबसे कम ${lowHi} में है।\nक्या करें:\n1. प्रमंडल के ${insts.length} कॉलेजों में 4 सप्ताह का Versant-शैली बोलचाल अभ्यास।\n2. एक पूल ड्राइव: ${poolHi}।\n3. प्रमंडल के नोडल अधिकारियों के साथ मासिक समीक्षा।`,
    )
  },
  chart: () => {
    const { ds } = purniaDivision()
    return {
      data: ds.map((d, i) => ({ id: d.id, name: bi(d.name, d.nameHi), value: d.pri, hl: i === 0 })),
      unit: bi('Simulated PRI', 'सिम्युलेटेड PRI'),
      ref: { value: PREVIEW.avgPri, label: bi('State avg', 'राज्य औसत') },
      decimals: 1,
    }
  },
  actions: [
    bi('Launch 4-week speaking sprint', '4 सप्ताह का बोलचाल अभ्यास शुरू करें'),
    bi('Prepare pool-drive shortlist', 'पूल ड्राइव शॉर्टलिस्ट तैयार करें'),
    bi('Schedule nodal-officer review', 'नोडल अधिकारी समीक्षा तय करें'),
  ],
  why: () => {
    const { ds, insts } = purniaDivision()
    return {
      filters: bi(
        `Purnia division · ${ds.length} districts · ${insts.length} institutions · all types`,
        `पूर्णिया प्रमंडल · ${ds.length} ज़िले · ${insts.length} संस्थान · सभी प्रकार`,
      ),
      n: sum(ds.map((d) => d.studentsAssessed)),
      nLabel: bi('student records', 'छात्र रिकॉर्ड'),
      confidence: 0.84,
    }
  },
  focus: () => purniaDivision().ids,
}

const Q_BRANCH: AskQA = {
  id: 'branch-risk',
  qLang: 'hi',
  q: bi('Which branch has the most students at risk?', 'किस ब्रांच में सबसे ज़्यादा छात्र जोखिम में हैं?'),
  keywords: [
    { label: 'branch', aliases: ['branch', 'branches', 'ब्रांच', 'शाखा', 'civil', 'सिविल', 'mechanical', 'मैकेनिकल'] },
    { label: 'risk', aliases: ['risk', 'at risk', 'जोखिम', 'खतरे', 'ख़तरे', 'weak', 'कमज़ोर'] },
  ],
  answer: () => {
    const rows = [...PREVIEW.branchRisk].sort((a, b) => b.atRisk - a.atRisk)
    const [a, b, c] = rows
    if (!a) return bi('', '')
    const top3 = sum(rows.slice(0, 3).map((r) => r.atRisk))
    const share = fmtPct(pctOf(top3, PREVIEW.atRisk))
    const weak = weakestSkillOf(a.branch)
    const d6 = DRIVES.find((d) => d.date >= DEMO_TODAY && d.blueprintId === 'core-civil-style')
    const weakEn = weak ? ` Its weakest skill is ${SKILL_LABEL[weak.skill].en} (${fmtNum(weak.value, 0)}).` : ''
    const weakHi = weak ? ` इसका सबसे कमज़ोर कौशल ${SKILL_LABEL[weak.skill].hi} (${fmtNum(weak.value, 0)}) है।` : ''
    return bi(
      `${a.label.en} (${a.branch}) has the most students at risk: ${fmtIN(a.atRisk)}, with ${a.below50Pct}% below PRI 50.${weakEn}\nNext: ${b ? `${b.label.en} ${fmtIN(b.atRisk)} (${b.below50Pct}%)` : ''}${c ? ` and ${c.label.en} ${fmtIN(c.atRisk)} (${c.below50Pct}%)` : ''}. Together these three are ${share} of the state's ${fmtIN(PREVIEW.atRisk)} at-risk students.\nWhat to do:\n1. Direct ${a.label.en} HoDs to run a 4-week ${weak ? SKILL_LABEL[weak.skill].en.toLowerCase() : 'readiness'} + core sprint.\n2. Auto-assign mentors to these three branches first.\n3. ${d6 ? `Prepare ${a.label.en} students for ${driveLine(d6, 'en')}.` : 'Line up one core drive for these branches.'}`,
      `${a.label.hi} (${a.branch}) में सबसे ज़्यादा छात्र जोखिम में हैं: ${fmtIN(a.atRisk)}, और ${a.below50Pct}% का PRI 50 से कम है।${weakHi}\nइसके बाद: ${b ? `${b.label.hi} ${fmtIN(b.atRisk)} (${b.below50Pct}%)` : ''}${c ? ` और ${c.label.hi} ${fmtIN(c.atRisk)} (${c.below50Pct}%)` : ''}। ये तीनों मिलकर राज्य के ${fmtIN(PREVIEW.atRisk)} जोखिम वाले छात्रों का ${share} हैं।\nक्या करें:\n1. ${a.label.hi} विभागाध्यक्ष 4 सप्ताह का ${weak ? SKILL_LABEL[weak.skill].hi : 'तैयारी'} + कोर अभ्यास चलाएँ।\n2. इन तीन शाखाओं के छात्रों को पहले मेंटर सौंपें।\n3. ${d6 ? `${driveLine(d6, 'hi')} के लिए ${a.label.hi} छात्रों को तैयार करें।` : 'इन शाखाओं के लिए एक कोर ड्राइव तय करें।'}`,
    )
  },
  chart: () => ({
    data: [...PREVIEW.branchRisk]
      .sort((a, b) => b.atRisk - a.atRisk)
      .map((r, i) => ({ id: r.branch, name: bi(r.branch, r.branch), value: r.atRisk, hl: i === 0 })),
    unit: bi('Students at risk', 'जोखिम में छात्र'),
    decimals: 0,
  }),
  actions: [
    bi('Direct Civil HoDs: 4-week sprint', 'सिविल विभागाध्यक्ष: 4 सप्ताह का अभ्यास'),
    bi('Assign mentors to top-3 branches', 'शीर्ष 3 शाखाओं को मेंटर सौंपें'),
    bi('Add Civil core-drive preparation', 'सिविल कोर ड्राइव की तैयारी जोड़ें'),
  ],
  why: () => ({
    filters: bi(
      `All ${PREVIEW.institutions} institutions · branch level · PRI below 50`,
      `सभी ${PREVIEW.institutions} संस्थान · शाखा स्तर · PRI 50 से कम`,
    ),
    n: PREVIEW.atRisk,
    nLabel: bi('at-risk students', 'जोखिम वाले छात्र'),
    confidence: 0.88,
  }),
}

const Q_GIRLS: AskQA = {
  id: 'girls',
  qLang: 'hi',
  q: bi('How ready are girls?', 'लड़कियों की तैयारी कैसी है?'),
  keywords: [
    {
      label: 'girls',
      aliases: ['girls', 'girl', 'women', 'female', 'gender', 'लड़कियों', 'लड़कियाँ', 'लड़कियां', 'लड़की', 'छात्राएँ', 'छात्राओं', 'महिला'],
    },
  ],
  answer: () => {
    const inc = PREVIEW.inclusion
    const women = INSTITUTIONS.filter((i) => i.women).length
    const gapPp = fmtNum(PREVIEW.girlsTargetPct - PREVIEW.girlsPct)
    const gapPri = fmtNum(inc.boysPri - inc.girlsPri)
    return bi(
      `Girls are ${fmtPct(PREVIEW.girlsPct)} of students onboarded, below the ≥${PREVIEW.girlsTargetPct}% target (gap ${gapPp} pp).\nReadiness is close: girls' average PRI ${fmtNum(inc.girlsPri)} vs boys' ${fmtNum(inc.boysPri)} (gap ${gapPri}). The rural-urban gap is larger: ${fmtNum(inc.ruralPri)} vs ${fmtNum(inc.urbanPri)}.\nWhat to do:\n1. Girls-only mock drives at the ${women} women's polytechnics.\n2. Daytime practice slots in college labs.\n3. Track the ${PREVIEW.girlsTargetPct}% participation target weekly in the Secretary's brief.`,
      `कुल जुड़े छात्रों में लड़कियाँ ${fmtPct(PREVIEW.girlsPct)} हैं, जो ≥${PREVIEW.girlsTargetPct}% लक्ष्य से कम है (अंतर ${gapPp} pp)।\nतैयारी लगभग बराबर है: लड़कियों का औसत PRI ${fmtNum(inc.girlsPri)}, लड़कों का ${fmtNum(inc.boysPri)} (अंतर ${gapPri})। ग्रामीण-शहरी अंतर ज़्यादा है: ${fmtNum(inc.ruralPri)} बनाम ${fmtNum(inc.urbanPri)}।\nक्या करें:\n1. ${women} महिला पॉलिटेक्निक में केवल छात्राओं के लिए मॉक ड्राइव।\n2. कॉलेज लैब में दिन के समय अभ्यास स्लॉट।\n3. सचिव के साप्ताहिक ब्रीफ़ में ${PREVIEW.girlsTargetPct}% भागीदारी लक्ष्य की हर सप्ताह निगरानी।`,
    )
  },
  chart: () => {
    const inc = PREVIEW.inclusion
    return {
      data: [
        { id: 'girls', name: bi('Girls', 'लड़कियाँ'), value: inc.girlsPri, hl: true },
        { id: 'boys', name: bi('Boys', 'लड़के'), value: inc.boysPri },
        { id: 'rural', name: bi('Rural', 'ग्रामीण'), value: inc.ruralPri },
        { id: 'urban', name: bi('Urban', 'शहरी'), value: inc.urbanPri },
      ],
      unit: bi('Average PRI', 'औसत PRI'),
      ref: { value: PREVIEW.avgPri, label: bi('State avg', 'राज्य औसत') },
      decimals: 1,
    }
  },
  actions: [
    bi("Girls-only mock drives", 'छात्राओं के लिए मॉक ड्राइव'),
    bi('Daytime lab practice slots', 'दिन में लैब अभ्यास स्लॉट'),
    bi(`Track ${PREVIEW.girlsTargetPct}% target weekly`, `${PREVIEW.girlsTargetPct}% लक्ष्य की साप्ताहिक निगरानी`),
  ],
  why: () => ({
    filters: bi('Gender and location split · all institutions', 'लिंग और स्थान के अनुसार · सभी संस्थान'),
    n: PREVIEW.onboarded,
    nLabel: bi('student records', 'छात्र रिकॉर्ड'),
    confidence: 0.8,
  }),
  focus: () => Array.from(new Set(INSTITUTIONS.filter((i) => i.women).map((i) => i.districtId))),
}

const Q_DRIVES: AskQA = {
  id: 'drives',
  qLang: 'hi',
  q: bi('Drives vs ready students next month?', 'अगले महीने ड्राइव बनाम तैयार छात्र?'),
  keywords: [
    { label: 'drive', aliases: ['drive', 'drives', 'ड्राइव', 'recruitment', 'भर्ती', 'campus'] },
    { label: 'month', aliases: ['next month', 'month', 'महीने', 'महीना', '30 days', '30 दिन'] },
    { label: 'demand', aliases: ['demand', 'supply', 'vacancies', 'roles', 'मांग', 'माँग', 'पद'] },
  ],
  answer: () => {
    const up = upcomingDrives(30)
    const elig = sum(up.map((d) => d.eligibleCount))
    const ready = sum(up.map((d) => d.readyCount))
    const ds = PREVIEW.demandSupply.map((r) => ({ ...r, ratio: pctOf(r.ready, r.roles) }))
    const biggest = [...ds].sort((a, b) => b.roles - a.roles)[0]
    const worst = [...ds].sort((a, b) => a.ratio - b.ratio)[0]
    const best = [...ds].sort((a, b) => b.ratio - a.ratio)[0]
    const next = up[0]
    const line = (r: (typeof ds)[number], lang: OfficerLang) =>
      lang === 'hi'
        ? `${r.sector.hi}: ${fmtIN(r.roles)} पद बनाम ${fmtIN(r.ready)} तैयार (${fmtNum(r.ratio, 0)}%)`
        : `${r.sector.en}: ${fmtIN(r.roles)} roles vs ${fmtIN(r.ready)} ready (${fmtNum(r.ratio, 0)}%)`
    return bi(
      `In the next 30 days there are ${up.length} drives with ${fmtIN(elig)} eligible and ${fmtIN(ready)} interview-ready students.${next ? ` Next: ${driveLine(next, 'en')}.` : ''}\nBy sector (illustrative demand):\n• ${line(biggest, 'en')}\n• ${line(worst, 'en')}, the biggest shortfall\n• ${line(best, 'en')}, a surplus\nWhat to do:\n1. Fast-track ${worst.sector.en} readiness sprints.\n2. Open surplus ${best.sector.en} candidates to other drives.\n3. Publish a 30-day drive calendar to every TPO.`,
      `अगले 30 दिनों में ${up.length} ड्राइव हैं: ${fmtIN(elig)} पात्र और ${fmtIN(ready)} इंटरव्यू के लिए तैयार छात्र।${next ? ` अगली: ${driveLine(next, 'hi')}।` : ''}\nक्षेत्रवार (सांकेतिक माँग):\n• ${line(biggest, 'hi')}\n• ${line(worst, 'hi')}, सबसे बड़ी कमी\n• ${line(best, 'hi')}, अधिशेष\nक्या करें:\n1. ${worst.sector.hi} के लिए तैयारी अभ्यास तेज़ करें।\n2. ${best.sector.hi} के अतिरिक्त उम्मीदवारों को दूसरी ड्राइव से जोड़ें।\n3. हर TPO को 30 दिनों का ड्राइव कैलेंडर भेजें।`,
    )
  },
  chart: () => {
    const rows = PREVIEW.demandSupply.map((r) => ({ id: r.id, name: r.sector, value: Math.round(pctOf(r.ready, r.roles)) }))
    const minV = Math.min(...rows.map((r) => r.value))
    return {
      data: rows.sort((a, b) => a.value - b.value).map((r) => ({ ...r, hl: r.value === minV })),
      unit: bi('Ready as % of roles', 'पदों के मुक़ाबले तैयार (%)'),
      ref: { value: 100, label: bi('Demand met', 'माँग पूरी') },
      decimals: 0,
      suffix: '%',
    }
  },
  actions: [
    bi('Fast-track shortfall sprints', 'कमी वाले क्षेत्रों का अभ्यास तेज़ करें'),
    bi('Route surplus candidates', 'अतिरिक्त उम्मीदवारों को जोड़ें'),
    bi('Publish 30-day drive calendar', '30 दिनों का ड्राइव कैलेंडर भेजें'),
  ],
  why: () => {
    const up = upcomingDrives(30)
    const end = isoDaysBefore(-30)
    return {
      filters: bi(
        `Drives ${fmtDate(DEMO_TODAY, 'en')} – ${fmtDate(end, 'en')} · sector demand (illustrative)`,
        `ड्राइव ${fmtDate(DEMO_TODAY, 'hi')} – ${fmtDate(end, 'hi')} · क्षेत्रवार माँग (सांकेतिक)`,
      ),
      n: sum(up.map((d) => d.eligibleCount)),
      nLabel: bi('eligible students', 'पात्र छात्र'),
      confidence: 0.76,
    }
  },
}

const Q_AI: AskQA = {
  id: 'ai-policy',
  qLang: 'hi',
  q: bi('Progress on the AI policy target?', 'AI नीति लक्ष्य की प्रगति?'),
  keywords: [
    { label: 'policy', aliases: ['policy', 'नीति', 'ai policy', 'ai नीति'] },
    { label: 'target', aliases: ['target', 'लक्ष्य', '5 lakh', '5 लाख', 'ai trained', 'प्रशिक्षित'] },
    { label: 'progress', aliases: ['progress', 'प्रगति'] },
  ],
  answer: () => {
    const s = aiPolicyStats()
    const ai = INSTITUTIONS.filter((i) => i.aiProgram2026).length
    const ins = aiPolicyInsight()
    return bi(
      `AI-trained this year: ${fmtIN(s.done)} of ${fmtIN(s.target)} (${fmtPct(s.pct)}). The draft AI Policy 2026 targets ${aiPolicyTargetShort('en')} (as reported).\nMonthly progress rose from ${fmtIN(s.first?.value ?? 0)} in ${s.first?.label.en ?? ''} to ${fmtIN(s.last?.value ?? 0)} in ${s.last?.label.en ?? ''}. ${ins.en}\nWhat to do:\n1. Add the AI module to the ${ai} colleges launching B.Tech AI.\n2. Report the AI-trained count weekly in the Secretary's brief.\n3. Use the ₹${REPORTED.aiLabLakhPerCollege} lakh AI labs for hands-on hours.`,
      `इस वर्ष AI-प्रशिक्षित: ${fmtIN(s.target)} में से ${fmtIN(s.done)} (${fmtPct(s.pct)})। मसौदा AI नीति 2026 का लक्ष्य: ${aiPolicyTargetShort('hi')} (रिपोर्ट के अनुसार)।\nमासिक प्रगति ${s.first?.label.hi ?? ''} में ${fmtIN(s.first?.value ?? 0)} से बढ़कर ${s.last?.label.hi ?? ''} में ${fmtIN(s.last?.value ?? 0)} हुई। ${ins.hi}\nक्या करें:\n1. B.Tech AI शुरू करने वाले ${ai} कॉलेजों में AI मॉड्यूल जोड़ें।\n2. सचिव के ब्रीफ़ में AI-प्रशिक्षित संख्या हर सप्ताह दें।\n3. ₹${REPORTED.aiLabLakhPerCollege} लाख की AI लैब का उपयोग व्यावहारिक घंटों के लिए करें।`,
    )
  },
  chart: () => {
    const s = aiPolicyStats()
    return {
      data: s.months.map((m, i) => ({ id: m.month, name: m.label, value: m.value, hl: i === s.months.length - 1 })),
      unit: bi('AI-trained per month', 'प्रति माह AI-प्रशिक्षित'),
      decimals: 0,
    }
  },
  actions: [
    bi('Add AI module to B.Tech AI colleges', 'B.Tech AI कॉलेजों में AI मॉड्यूल'),
    bi('Weekly AI-trained report', 'साप्ताहिक AI-प्रशिक्षित रिपोर्ट'),
    bi('Plan AI-lab hands-on hours', 'AI लैब के व्यावहारिक घंटे तय करें'),
  ],
  why: () => {
    const s = aiPolicyStats()
    return {
      filters: bi(
        `${s.first?.label.en ?? ''}–${s.last?.label.en ?? ''} 2026 · all institutions`,
        `${s.first?.label.hi ?? ''}–${s.last?.label.hi ?? ''} 2026 · सभी संस्थान`,
      ),
      n: s.done,
      nLabel: bi('AI-trained students', 'AI-प्रशिक्षित छात्र'),
      confidence: 0.9,
    }
  },
}

const Q_IMPROVED: AskQA = {
  id: 'improved',
  qLang: 'en',
  q: bi('Which 5 colleges improved most since the pilot?', 'पायलट के बाद किन 5 कॉलेजों में सबसे ज़्यादा सुधार हुआ?'),
  keywords: [
    { label: 'improved', aliases: ['improved', 'improve', 'improvement', 'most improved', 'सुधार', 'बेहतर'] },
    { label: 'colleges', aliases: ['colleges', 'college', 'कॉलेज', 'कॉलेजों', 'institutions', 'संस्थान'] },
    { label: 'pilot', aliases: ['pilot', 'पायलट', 'baseline', 'बेसलाइन'] },
  ],
  answer: () => {
    const top = topImprovers(5)
    const newer = top.filter((i) => i.newer).length
    const linesEn = top
      .map((i, k) => `${k + 1}. ${i.short} ${signed(priGain(i))} (now ${fmtNum(i.pri)}, ${districtName(i.districtId, 'en')})`)
      .join('\n')
    const linesHi = top
      .map((i, k) => `${k + 1}. ${i.short} ${signed(priGain(i))} (अब ${fmtNum(i.pri)}, ${districtName(i.districtId, 'hi')})`)
      .join('\n')
    const noteEn =
      newer === top.length
        ? `All ${top.length} are newer institutions: gains are not limited to the older colleges.`
        : `${newer} of ${top.length} are newer institutions.`
    const noteHi =
      newer === top.length
        ? `${HI_COUNT_WORD[top.length] ?? 'सभी'} नए संस्थान हैं: सुधार केवल पुराने कॉलेजों तक सीमित नहीं है।`
        : `${top.length} में से ${newer} नए संस्थान हैं।`
    return bi(
      `Most improved since baseline (simulated PRI; named because the change is positive):\n${linesEn}\n${noteEn}\nWhat to do:\n1. Send appreciation letters to these TPOs.\n2. Share their weekly practice routine statewide.\n3. Invite them to present at the monthly review.`,
      `बेसलाइन से सबसे ज़्यादा सुधार (सिम्युलेटेड PRI; सकारात्मक बदलाव होने के कारण नाम दिखाए गए):\n${linesHi}\n${noteHi}\nक्या करें:\n1. इन संस्थानों के TPO को प्रशंसा पत्र भेजें।\n2. इनकी साप्ताहिक अभ्यास पद्धति पूरे राज्य में साझा करें।\n3. मासिक समीक्षा में इन्हें प्रस्तुति के लिए बुलाएँ।`,
    )
  },
  chart: () => ({
    data: topImprovers(5).map((i, k) => ({ id: i.id, name: bi(i.short, i.short), value: Math.round(priGain(i) * 10) / 10, hl: k === 0 })),
    unit: bi('PRI gain since baseline', 'बेसलाइन से PRI वृद्धि'),
    decimals: 1,
  }),
  actions: [
    bi('Send appreciation letters', 'प्रशंसा पत्र भेजें'),
    bi('Share their practice routine', 'अभ्यास पद्धति साझा करें'),
    bi('Invite to monthly review', 'मासिक समीक्षा में बुलाएँ'),
  ],
  why: () => ({
    filters: bi(
      `All ${PREVIEW.institutions} institutions · PRI change since baseline`,
      `सभी ${PREVIEW.institutions} संस्थान · बेसलाइन से PRI बदलाव`,
    ),
    n: PREVIEW.institutions,
    nLabel: bi('institutions compared', 'संस्थानों की तुलना'),
    confidence: 0.86,
  }),
  focus: () => Array.from(new Set(topImprovers(5).map((i) => i.districtId))),
}

export const ASK_QA: AskQA[] = [Q_PURNIA, Q_BRANCH, Q_GIRLS, Q_DRIVES, Q_AI, Q_IMPROVED]

export const ASK_FALLBACK: AskQA = {
  id: 'fallback',
  qLang: 'en',
  q: bi('State snapshot', 'राज्य का सारांश'),
  keywords: [],
  answer: () =>
    bi(
      `I can answer questions about districts, divisions, branches, girls' readiness, upcoming drives and the AI-policy target.\nThis week's state snapshot (${WEEK_LABEL.en}): average PRI ${fmtNum(PREVIEW.avgPri)} (${signed(PREVIEW.weekDelta.avgPri)} this week), ${fmtIN(PREVIEW.interviewReady)} interview-ready and ${fmtIN(PREVIEW.atRisk)} at risk across ${PREVIEW.institutions} institutions.\nTry one of the suggested questions, or ask about a district by name.`,
      `मैं ज़िलों, प्रमंडलों, शाखाओं, लड़कियों की तैयारी, आने वाली ड्राइव और AI नीति लक्ष्य पर उत्तर दे सकता हूँ।\nइस सप्ताह का राज्य सारांश (${WEEK_LABEL.hi}): औसत PRI ${fmtNum(PREVIEW.avgPri)} (इस सप्ताह ${signed(PREVIEW.weekDelta.avgPri)}), ${PREVIEW.institutions} संस्थानों में ${fmtIN(PREVIEW.interviewReady)} छात्र इंटरव्यू के लिए तैयार और ${fmtIN(PREVIEW.atRisk)} जोखिम में।\nसुझाए गए प्रश्नों में से एक चुनें, या किसी ज़िले का नाम लेकर पूछें।`,
    ),
  chart: () => ({
    data: DIVISION_PRI_ROWS.map((r, i) => ({ ...r, hl: i === 0 })),
    unit: bi('Simulated PRI by division', 'प्रमंडलवार सिम्युलेटेड PRI'),
    ref: { value: PREVIEW.avgPri, label: bi('State avg', 'राज्य औसत') },
    decimals: 1,
  }),
  actions: [
    bi('Open the weekly brief', 'साप्ताहिक ब्रीफ़ खोलें'),
    bi('Show districts needing support', 'सहायता वाले ज़िले दिखाएँ'),
    bi('Export state aggregates', 'राज्य के कुल आँकड़े निर्यात करें'),
  ],
  why: () => ({
    filters: bi('Whole state · all institutions', 'पूरा राज्य · सभी संस्थान'),
    n: PREVIEW.onboarded,
    nLabel: bi('student records', 'छात्र रिकॉर्ड'),
    confidence: 0.7,
  }),
}

/** District asked about by name (free text), answered with the district recommendation. */
function districtQA(d: District): AskQA {
  return {
    id: `district-${d.id}`,
    qLang: 'en',
    q: bi(d.name, d.nameHi),
    keywords: [],
    answer: () => districtRec(d),
    chart: () => ({
      data: [
        { id: 'base', name: bi('Baseline', 'बेसलाइन'), value: d.priBaseline },
        { id: 'now', name: bi('Now', 'अभी'), value: d.pri, hl: true },
      ],
      unit: bi(`${d.name}: simulated PRI`, `${d.nameHi}: सिम्युलेटेड PRI`),
      ref: { value: PREVIEW.avgPri, label: bi('State avg', 'राज्य औसत') },
      decimals: 1,
    }),
    actions: [
      bi(`Start ${SKILL_LABEL[d.topGap].en} sprint`, `${SKILL_LABEL[d.topGap].hi} अभ्यास शुरू करें`),
      bi('Assign mentors to at-risk students', 'जोखिम वाले छात्रों को मेंटर'),
      bi('Schedule nodal-officer review', 'नोडल अधिकारी समीक्षा तय करें'),
    ],
    why: () => ({
      filters: bi(`${d.name} district · ${d.institutionIds.length} institutions`, `${d.nameHi} ज़िला · ${d.institutionIds.length} संस्थान`),
      n: d.studentsAssessed,
      nLabel: bi('student records', 'छात्र रिकॉर्ड'),
      confidence: 0.78,
    }),
    focus: () => [d.id],
  }
}

function findDistrictMention(input: string): District | null {
  const text = normalizeText(input)
  if (!text) return null
  for (const g of DISTRICT_GEO) {
    const hits = detectKeywords(text, [{ label: g.id, aliases: [g.name.toLowerCase(), g.nameHi] }])
    if (hits.length) return districtById(g.id) ?? null
  }
  return null
}

/** Resolve a typed or chip question to a canned answer (free text: matchCanned, then district name, then fallback). */
export function findAsk(input: string): { item: AskQA; lang: OfficerLang } {
  const raw = (input ?? '').trim()
  const lang: OfficerLang = isDevanagari(raw) ? 'hi' : 'en'
  const norm = normalizeText(raw)
  const exact = ASK_QA.find((q) => normalizeText(q.q.en) === norm || normalizeText(q.q.hi) === norm)
  if (exact) return { item: exact, lang }
  const hit = matchCanned<AskQA, null>(raw, ASK_QA, null)
  if (hit) return { item: hit, lang }
  const d = findDistrictMention(raw)
  if (d) return { item: districtQA(d), lang }
  return { item: ASK_FALLBACK, lang }
}

export function askSteps(answerLang: OfficerLang): Bi[] {
  return [
    bi(`Querying ${PREVIEW.institutions} institutions…`, `${PREVIEW.institutions} संस्थानों से डेटा ले रहे हैं…`),
    bi(`${fmtIN(PREVIEW.onboarded)} records…`, `${fmtIN(PREVIEW.onboarded)} रिकॉर्ड…`),
    bi('Ranking by PRI and gap…', 'PRI और कमी के आधार पर क्रम…'),
    answerLang === 'hi'
      ? bi('Drafting in Hindi…', 'हिंदी में उत्तर लिख रहे हैं…')
      : bi('Drafting in English…', 'अंग्रेज़ी में उत्तर लिख रहे हैं…'),
  ]
}

// ---------------------------------------------------------------------------
// Secretary's weekly brief (fix 38): en, hi and simpler hi
// ---------------------------------------------------------------------------

export type BriefVariant = 'en' | 'hi' | 'hi-simple'

export interface BriefHeadline {
  id: string
  label: string
  value: string
  delta: string
}

export interface BriefTableRow {
  id: string
  cells: string[]
}

export interface BriefDoc {
  lang: OfficerLang
  title: string
  subtitle: string
  meta: { to: string; from: string; period: string }
  sec: { headlines: string; wins: string; risks: string; decisions: string; table: string; top: string; bottom: string; chart: string }
  headlines: BriefHeadline[]
  wins: string[]
  risks: string[]
  decisions: string[]
  cols: string[]
  top: BriefTableRow[]
  bottom: BriefTableRow[]
  chart: { rows: { id: string; name: string; value: number; label: string }[]; ref: number; refLabel: string }
  footer: { sources: string; reported: string; note: string; drafted: string; reviewed: string }
}

function inactiveColleges(n: number): Institution[] {
  return [...INSTITUTIONS].sort((a, b) => a.tpoActivity - b.tpoActivity || a.id.localeCompare(b.id)).slice(0, n)
}

function districtRow(d: District, lang: OfficerLang): BriefTableRow {
  return {
    id: d.id,
    cells: [
      lang === 'hi' ? d.nameHi : d.name,
      lang === 'hi' ? d.divisionHi : d.division,
      fmtNum(d.pri),
      signed(priGain(d)),
      fmtIN(d.atRisk),
      tr(SKILL_LABEL[d.topGap], lang),
    ],
  }
}

export function buildBrief(variant: BriefVariant): BriefDoc {
  const lang: OfficerLang = variant === 'en' ? 'en' : 'hi'
  const simple = variant === 'hi-simple'
  const wd = PREVIEW.weekDelta
  const ranked = districtsRanked()
  const d0 = ranked[0]
  const d1 = ranked[1]
  const top5 = ranked.slice(-5).reverse()
  const bottom5 = ranked.slice(0, 5)
  const civil = PREVIEW.branchRisk.find((b) => b.branch === 'CE') ?? PREVIEW.branchRisk[0]
  const civilWeak = weakestSkillOf('CE')
  const d2 = driveById('d2')
  const d2Host = d2 ? institutionById(d2.hostInstitutionId) : undefined
  const d2Place = d2Host ? districtName(d2Host.districtId, lang) : ''
  const inactive = inactiveColleges(3)
  const inactiveMax = Math.max(...inactive.map((i) => i.tpoActivity))
  const codes = inactive.map((i) => i.code).join(', ')
  const placements = REPORTED.placements[REPORTED.placements.length - 1]
  const week = tr(WEEK_LABEL, lang)
  const period = `${fmtDate(isoDaysBefore(6), lang)} – ${fmtDate(DEMO_TODAY, lang, { year: true })}`
  const civilLabel = tr(civil.label, lang)
  const chartRows = DIVISION_PRI_ROWS.map((r) => ({ id: r.id, name: tr(r.name, lang), value: r.value, label: fmtNum(r.value) }))

  if (lang === 'en') {
    return {
      lang,
      title: 'Weekly Placement Readiness Brief',
      subtitle: `${week} · Illustrative data`,
      meta: {
        to: 'Secretary, DSTTE Bihar',
        from: 'Sarthi AI, ParthSarthi Placement OS (draft for review)',
        period,
      },
      sec: {
        headlines: 'This week in six numbers',
        wins: 'Wins',
        risks: 'Risks',
        decisions: 'Decisions requested',
        table: 'Districts by simulated PRI',
        top: 'Top 5',
        bottom: 'Need support first',
        chart: 'Average PRI by division (simulated)',
      },
      headlines: [
        { id: 'onboarded', label: 'Students onboarded', value: fmtIN(PREVIEW.onboarded), delta: `+${fmtIN(wd.onboarded)}` },
        { id: 'active', label: 'Weekly active', value: fmtPct(PREVIEW.weeklyActivePct), delta: `${signed(wd.weeklyActivePp)} pp` },
        { id: 'pri', label: 'Average PRI', value: fmtNum(PREVIEW.avgPri), delta: signed(wd.avgPri) },
        { id: 'ai', label: 'AI mock interviews', value: fmtIN(PREVIEW.aiInterviews), delta: `+${fmtIN(wd.aiInterviews)}` },
        { id: 'ready', label: 'Interview-ready', value: fmtIN(PREVIEW.interviewReady), delta: `+${fmtIN(wd.interviewReady)}` },
        { id: 'offers', label: 'Offers + internships', value: fmtIN(PREVIEW.offersAndInternships), delta: `+${fmtIN(wd.offers)}` },
      ],
      wins: [
        `Avg PRI ${signed(wd.avgPri)} this week (now ${fmtNum(PREVIEW.avgPri)}; baseline ${fmtNum(PREVIEW.baselinePri)}).`,
        `${fmtIN(wd.aiInterviews)} AI mock interviews this week; ${fmtIN(wd.interviewReady)} more students became interview-ready.`,
        'Purnea CE ECE communication +6 after the speaking sprint.',
      ],
      risks: [
        d0 && d1
          ? `${d0.name} (${fmtNum(d0.pri)}) and ${d1.name} (${fmtNum(d1.pri)}) need support first; top gaps ${SKILL_LABEL[d0.topGap].en} and ${SKILL_LABEL[d1.topGap].en}.`
          : '',
        `Girls are ${fmtPct(PREVIEW.girlsPct)} of students onboarded, below the ≥${PREVIEW.girlsTargetPct}% target.`,
        `${civilLabel}: ${fmtIN(civil.atRisk)} students at risk, ${civil.below50Pct}% below PRI 50.`,
      ].filter(Boolean),
      decisions: [
        d2
          ? `Approve the ${fmtDate(d2.date, 'en')} ${d2Place} auto-OEM-style pool drive (${fmtIN(d2.readyCount)} interview-ready across ${d2.institutionIds.length} institutions).`
          : 'Approve the next pool drive.',
        `Direct ${civilLabel} HoDs to run a 4-week sprint${civilWeak ? ` (${SKILL_LABEL[civilWeak.skill].en.toLowerCase()} + core)` : ''}.`,
        `Nominate nodal officers in 3 inactive colleges (${codes}; T&P activity at or below ${inactiveMax}%).`,
      ],
      cols: ['District', 'Division', 'PRI', 'Δ baseline', 'At risk', 'Top gap'],
      top: top5.map((d) => districtRow(d, 'en')),
      bottom: bottom5.map((d) => districtRow(d, 'en')),
      chart: { rows: chartRows, ref: PREVIEW.avgPri, refLabel: `State avg ${fmtNum(PREVIEW.avgPri)}` },
      footer: {
        sources: `Reported figures: ${SOURCES.pp.label}; ${SOURCES.im.label}; ${SOURCES.aipolicy.label}.`,
        reported: `As reported: placements ${placements.year} ${fmtIN(placements.value)}–${fmtIN(placements.high ?? placements.value)} (sources differ).`,
        note: 'All other figures are illustrative pilot data. District and college rankings are simulated, not an assessment of any institution. No student names.',
        drafted: 'Drafted by Sarthi AI',
        reviewed: 'Reviewed by: ________',
      },
    }
  }

  // Hindi (standard or simpler wording)
  return {
    lang,
    title: simple ? 'हर हफ़्ते की प्लेसमेंट तैयारी रिपोर्ट' : 'साप्ताहिक प्लेसमेंट तैयारी ब्रीफ़',
    subtitle: `${week} · सांकेतिक डेटा`,
    meta: {
      to: simple ? 'सचिव, DSTTE बिहार' : 'सचिव, DSTTE बिहार',
      from: simple ? 'सारथी AI (जाँच के लिए मसौदा)' : 'सारथी AI, ParthSarthi प्लेसमेंट OS (समीक्षा हेतु मसौदा)',
      period,
    },
    sec: simple
      ? {
          headlines: 'इस हफ़्ते के 6 मुख्य आँकड़े',
          wins: 'अच्छी ख़बर',
          risks: 'चिंता की बातें',
          decisions: 'आपसे फ़ैसले चाहिए',
          table: 'ज़िलों की तैयारी (सिम्युलेटेड)',
          top: 'सबसे आगे 5',
          bottom: 'पहले मदद चाहिए',
          chart: 'प्रमंडल के हिसाब से औसत तैयारी अंक',
        }
      : {
          headlines: 'इस सप्ताह छह आँकड़ों में',
          wins: 'उपलब्धियाँ',
          risks: 'जोखिम',
          decisions: 'अपेक्षित निर्णय',
          table: 'सिम्युलेटेड PRI के अनुसार ज़िले',
          top: 'शीर्ष 5',
          bottom: 'सबसे पहले सहायता',
          chart: 'प्रमंडलवार औसत PRI (सिम्युलेटेड)',
        },
    headlines: [
      { id: 'onboarded', label: simple ? 'जुड़े छात्र' : 'जुड़े छात्र', value: fmtIN(PREVIEW.onboarded), delta: `+${fmtIN(wd.onboarded)}` },
      { id: 'active', label: simple ? 'हर हफ़्ते सक्रिय' : 'साप्ताहिक सक्रिय', value: fmtPct(PREVIEW.weeklyActivePct), delta: `${signed(wd.weeklyActivePp)} pp` },
      { id: 'pri', label: simple ? 'औसत तैयारी अंक (PRI)' : 'औसत PRI', value: fmtNum(PREVIEW.avgPri), delta: signed(wd.avgPri) },
      { id: 'ai', label: 'AI मॉक इंटरव्यू', value: fmtIN(PREVIEW.aiInterviews), delta: `+${fmtIN(wd.aiInterviews)}` },
      { id: 'ready', label: simple ? 'इंटरव्यू के लिए तैयार' : 'इंटरव्यू के लिए तैयार', value: fmtIN(PREVIEW.interviewReady), delta: `+${fmtIN(wd.interviewReady)}` },
      { id: 'offers', label: 'ऑफ़र + इंटर्नशिप', value: fmtIN(PREVIEW.offersAndInternships), delta: `+${fmtIN(wd.offers)}` },
    ],
    wins: simple
      ? [
          `इस हफ़्ते औसत तैयारी अंक ${fmtNum(wd.avgPri)} बढ़ा (अब ${fmtNum(PREVIEW.avgPri)})।`,
          `इस हफ़्ते ${fmtIN(wd.aiInterviews)} AI मॉक इंटरव्यू हुए; ${fmtIN(wd.interviewReady)} और छात्र तैयार हुए।`,
          'पूर्णिया CE: ECE छात्रों का बोलचाल स्कोर 6 अंक बढ़ा।',
        ]
      : [
          `इस सप्ताह औसत PRI ${signed(wd.avgPri)} (अब ${fmtNum(PREVIEW.avgPri)}; बेसलाइन ${fmtNum(PREVIEW.baselinePri)})।`,
          `इस सप्ताह ${fmtIN(wd.aiInterviews)} AI मॉक इंटरव्यू; ${fmtIN(wd.interviewReady)} और छात्र इंटरव्यू के लिए तैयार हुए।`,
          'पूर्णिया CE: बोलचाल अभ्यास के बाद ECE संवाद स्कोर +6।',
        ],
    risks: (simple
      ? [
          d0 && d1 ? `${d0.nameHi} (${fmtNum(d0.pri)}) और ${d1.nameHi} (${fmtNum(d1.pri)}) को सबसे पहले मदद चाहिए।` : '',
          `लड़कियाँ ${fmtPct(PREVIEW.girlsPct)} हैं, लक्ष्य ${PREVIEW.girlsTargetPct}% है।`,
          `${civilLabel} ब्रांच के ${fmtIN(civil.atRisk)} छात्र पीछे चल रहे हैं।`,
        ]
      : [
          d0 && d1
            ? `${d0.nameHi} (${fmtNum(d0.pri)}) और ${d1.nameHi} (${fmtNum(d1.pri)}) को सबसे पहले सहायता चाहिए; मुख्य कमी: ${SKILL_LABEL[d0.topGap].hi} और ${SKILL_LABEL[d1.topGap].hi}।`
            : '',
          `छात्राओं की भागीदारी ${fmtPct(PREVIEW.girlsPct)}, जो ≥${PREVIEW.girlsTargetPct}% लक्ष्य से कम है।`,
          `${civilLabel}: ${fmtIN(civil.atRisk)} छात्र जोखिम में, ${civil.below50Pct}% का PRI 50 से कम।`,
        ]
    ).filter(Boolean),
    decisions: simple
      ? [
          d2 ? `${fmtDate(d2.date, 'hi')} की ${d2Place} पूल ड्राइव को मंज़ूरी दें (${fmtIN(d2.readyCount)} छात्र तैयार)।` : 'अगली पूल ड्राइव को मंज़ूरी दें।',
          `${civilLabel} के विभागाध्यक्ष 4 हफ़्ते का अभ्यास चलाएँ।`,
          `कम सक्रिय 3 कॉलेजों (${codes}) में नोडल अधिकारी तय करें।`,
        ]
      : [
          d2
            ? `${fmtDate(d2.date, 'hi')} की ${d2Place} ऑटो-OEM-शैली पूल ड्राइव को मंज़ूरी दें (${d2.institutionIds.length} संस्थानों के ${fmtIN(d2.readyCount)} छात्र इंटरव्यू के लिए तैयार)।`
            : 'अगली पूल ड्राइव को मंज़ूरी दें।',
          `${civilLabel} विभागाध्यक्षों को 4 सप्ताह का अभ्यास${civilWeak ? ` (${SKILL_LABEL[civilWeak.skill].hi} + कोर)` : ''} चलाने का निर्देश दें।`,
          `कम T&P गतिविधि वाले 3 कॉलेजों (${codes}; गतिविधि ${inactiveMax}% या कम) में नोडल अधिकारी नामित करें।`,
        ],
    cols: simple
      ? ['ज़िला', 'प्रमंडल', 'अंक', 'बढ़त', 'पीछे छात्र', 'मुख्य कमी']
      : ['ज़िला', 'प्रमंडल', 'PRI', 'बेसलाइन से Δ', 'जोखिम में', 'मुख्य कमी'],
    top: top5.map((d) => districtRow(d, 'hi')),
    bottom: bottom5.map((d) => districtRow(d, 'hi')),
    chart: { rows: chartRows, ref: PREVIEW.avgPri, refLabel: `राज्य औसत ${fmtNum(PREVIEW.avgPri)}` },
    footer: {
      sources: `रिपोर्ट किए गए आँकड़ों के स्रोत: ${SOURCES.pp.label}; ${SOURCES.im.label}; ${SOURCES.aipolicy.label}।`,
      reported: `रिपोर्ट के अनुसार: प्लेसमेंट ${placements.year} ${fmtIN(placements.value)}–${fmtIN(placements.high ?? placements.value)} (स्रोतों में अंतर)।`,
      note: simple
        ? 'बाक़ी सभी आँकड़े उदाहरण के लिए हैं। ज़िलों और कॉलेजों की रैंकिंग सिम्युलेटेड है, किसी संस्थान का आकलन नहीं। किसी छात्र का नाम नहीं।'
        : 'अन्य सभी आँकड़े सांकेतिक पायलट डेटा हैं। ज़िला और कॉलेज रैंकिंग सिम्युलेटेड है, किसी संस्थान का आकलन नहीं। किसी छात्र का नाम नहीं।',
      drafted: 'सारथी AI द्वारा तैयार',
      reviewed: 'समीक्षक: ________',
    },
  }
}

export const BRIEF = { build: buildBrief }

/** Reveal order on /state/brief: header, numbers, wins+risks, decisions, table+chart, footer. */
export const BRIEF_SECTIONS = 6
