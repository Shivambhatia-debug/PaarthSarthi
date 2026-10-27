// District aggregates over INSTITUTIONS (onboarded-weighted). Illustrative data.
import { DISTRICT_GEO } from '@/lib/mock/geo'
import { INSTITUTIONS } from '@/lib/mock/institutions'
import { round1 } from '@/lib/mock/seed'
import type { District, DistrictId, Institution, SkillKey } from '@/lib/mock/types'

function weighted(list: Institution[], get: (i: Institution) => number): number {
  let s = 0
  let w = 0
  for (const i of list) {
    s += i.onboarded * get(i)
    w += i.onboarded
  }
  return w > 0 ? s / w : 0
}

function weightedMode(list: Institution[]): SkillKey {
  const acc = new Map<SkillKey, number>()
  for (const i of list) acc.set(i.topGap, (acc.get(i.topGap) ?? 0) + i.onboarded)
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

export const DISTRICTS: District[] = DISTRICT_GEO.map((g) => {
  const list = INSTITUTIONS.filter((i) => i.districtId === g.id)
  const trendLen = list.reduce((m, i) => Math.max(m, i.priTrend.length), 0)
  const priTrend: number[] = []
  for (let k = 0; k < trendLen; k++) {
    priTrend.push(round1(weighted(list, (i) => i.priTrend[k] ?? i.pri)))
  }
  return {
    ...g,
    pri: round1(weighted(list, (i) => i.pri)),
    priBaseline: round1(weighted(list, (i) => i.priBaseline)),
    priTrend,
    studentsAssessed: list.reduce((s, i) => s + i.onboarded, 0),
    weeklyActive: list.reduce((s, i) => s + i.weeklyActive, 0),
    interviewReady: list.reduce((s, i) => s + i.interviewReady, 0),
    atRisk: list.reduce((s, i) => s + i.atRisk, 0),
    girlsPct: round1(weighted(list, (i) => i.girlsPct)),
    topGap: weightedMode(list),
    institutionIds: list.map((i) => i.id),
  }
})

const BY_ID = new Map(DISTRICTS.map((d) => [d.id, d]))

export function districtById(id: DistrictId | null | undefined): District | undefined {
  return id ? BY_ID.get(id) : undefined
}

/**
 * Onboarded-weighted mean PRI per district over institutions matching `filter` (round1);
 * null when no institution matches (fix 31). Only the unfiltered map is guaranteed to hit
 * FIXED_DISTRICT_PRI.
 */
export function districtPriMap(filter?: (i: Institution) => boolean): Record<DistrictId, number | null> {
  const out: Record<DistrictId, number | null> = {}
  for (const g of DISTRICT_GEO) {
    const list = INSTITUTIONS.filter((i) => i.districtId === g.id && (!filter || filter(i)))
    const w = list.reduce((s, i) => s + i.onboarded, 0)
    out[g.id] = list.length > 0 && w > 0 ? round1(weighted(list, (i) => i.pri)) : null
  }
  return out
}

/** Districts ascending by (filtered) PRI; districts with no matching institution are excluded. */
export function districtsRanked(filter?: (i: Institution) => boolean): District[] {
  const map = districtPriMap(filter)
  return DISTRICTS.filter((d) => map[d.id] != null)
    .map((d) => (filter ? { ...d, pri: map[d.id] as number } : d))
    .sort((a, b) => a.pri - b.pri || a.name.localeCompare(b.name))
}
