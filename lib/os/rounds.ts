// Placement-day rounds, routes and persona targets. Pure module.
import type { Bi } from '@/lib/os/i18n'
import type { PersonaRunId } from '@/lib/mock/types'
import { pillarToVersant } from '@/lib/os/scoring'

export type RoundId =
  | 'eligibility'
  | 'aptitude'
  | 'technical'
  | 'communication'
  | 'gd'
  | 'techInterview'
  | 'hrInterview'

export interface RoundDef {
  id: RoundId
  label: Bi
  /** Short rail label (Bi; Hindi short forms). */
  short: Bi
  route: string
  optional?: boolean
}

export const ROUNDS: RoundDef[] = [
  { id: 'eligibility', label: { en: 'Eligibility', hi: 'पात्रता' }, short: { en: 'Eligibility', hi: 'पात्रता' }, route: '/placement' },
  { id: 'aptitude', label: { en: 'Aptitude', hi: 'अभिरुचि' }, short: { en: 'Aptitude', hi: 'अभिरुचि' }, route: '/placement/drive/aptitude' },
  { id: 'technical', label: { en: 'Technical', hi: 'तकनीकी' }, short: { en: 'Technical', hi: 'तकनीकी' }, route: '/placement/drive/technical' },
  {
    id: 'communication',
    label: { en: 'Communication', hi: 'संवाद' },
    short: { en: 'Comm.', hi: 'संवाद' },
    route: '/placement/drive/communication',
  },
  {
    id: 'gd',
    label: { en: 'Group discussion', hi: 'समूह चर्चा' },
    short: { en: 'GD', hi: 'समूह चर्चा' },
    route: '/placement/drive/gd',
    optional: true,
  },
  {
    id: 'techInterview',
    label: { en: 'Technical interview', hi: 'तकनीकी इंटरव्यू' },
    short: { en: 'Tech interview', hi: 'टेक इंटरव्यू' },
    route: '/placement/drive/interview',
  },
  {
    id: 'hrInterview',
    label: { en: 'HR interview', hi: 'एचआर इंटरव्यू' },
    short: { en: 'HR', hi: 'एचआर' },
    route: '/placement/drive/hr',
  },
]

export function roundById(id: RoundId | string): RoundDef | undefined {
  return ROUNDS.find((r) => r.id === id)
}

export const REPORT_ROUTE = '/placement/report'

const ORDER: RoundId[] = ['eligibility', 'aptitude', 'technical', 'communication', 'gd', 'techInterview', 'hrInterview']

/** Route of the round after `current` (GD skipped unless includeGd); REPORT_ROUTE after HR. */
export function nextRoute(current: RoundId, includeGd = false): string {
  const seq = ORDER.filter((id) => id !== 'gd' || includeGd)
  let i = seq.indexOf(current)
  if (i < 0) {
    // e.g. current = 'gd' while includeGd is false: continue from the round after gd.
    i = ORDER.indexOf(current)
    const after = ORDER.slice(i + 1).find((id) => seq.includes(id))
    return after ? roundById(after)!.route : REPORT_ROUTE
  }
  const nxt = seq[i + 1]
  return nxt ? roundById(nxt)!.route : REPORT_ROUTE
}

/** Persona round scores, pillar scale (0-100). Communication pillar maps from VERSANT_TARGETS. */
export const ROUND_TARGETS: Record<PersonaRunId, Record<RoundId, number>> = {
  priya: {
    eligibility: 100,
    aptitude: 72,
    technical: 78,
    communication: 50,
    gd: 64,
    techInterview: 70,
    hrInterview: 66,
  },
  rahul: {
    eligibility: 100,
    aptitude: 64,
    technical: 81,
    communication: 42,
    gd: 60,
    techInterview: 72,
    hrInterview: 70,
  },
}

/** Versant-style (20-80) communication scores (fix 18). */
export const VERSANT_TARGETS: Record<PersonaRunId, number> = { priya: 50, rahul: 45 }

/** Tech-interview content / delivery split; interviewPillar(content, delivery) = techInterview target. */
export const INTERVIEW_SPLIT: Record<PersonaRunId, { content: number; delivery: number }> = {
  priya: { content: 78, delivery: 52 },
  rahul: { content: 80, delivery: 54 },
}

/** Structural subset of demo-store's RoundState (kept local to avoid an import cycle). */
type RoundScoreLike = {
  status?: string
  score?: number
  detail?: Record<string, number | string>
}

/** Communication shows 'x/80'; other rounds show the score; '—' when missing. */
export function formatRoundScore(id: RoundId, rs?: RoundScoreLike | null): string {
  if (!rs) return '—'
  if (id === 'communication') {
    const v = rs.detail?.versant
    if (v !== undefined && v !== null && v !== '') return `${v}/80`
    if (typeof rs.score === 'number' && Number.isFinite(rs.score)) return `${pillarToVersant(rs.score)}/80`
    return '—'
  }
  if (typeof rs.score === 'number' && Number.isFinite(rs.score)) return String(Math.round(rs.score))
  return '—'
}
