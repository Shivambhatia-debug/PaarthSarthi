/* Media contract for the home-page showcase (files produced by the MEDIA unit in public/os/media/).
 * Every consumer must degrade gracefully: video -> poster (Ken Burns) -> animated mock. */

import { PRIYA, latestAttempt } from '@/lib/mock/personas'

export const MEDIA_BASE = '/os/media/'
export const SITE_HOST = 'paarthsarthi.netlify.app'
/** Fallback clock per scene when a clip cannot play (spec: 7.2 s). */
export const SCENE_MS = 7200

export const mediaUrl = (name: string, ext: 'webm' | 'mp4' | 'jpg') => `${MEDIA_BASE}${name}.${ext}`
/** Each scene also ships a tighter punch-in cut (`scene-N-…-m.{webm,mp4,jpg}`) for screens under 640px. */
export const MOBILE_CUT_SUFFIX = '-m'

export type ShotId =
  | 'lobby'
  | 'aptitude'
  | 'coding'
  | 'communication'
  | 'interview'
  | 'hr'
  | 'report'
  | 'tpo'
  | 'state'
  | 'brief'
  | 'schools'
  | 'pilot'
export const shotUrl = (id: ShotId) => `${MEDIA_BASE}shot-${id}.jpg`

export const DEMO_REEL = 'demo-reel'

const [firstAttempt, secondAttempt] = PRIYA.attempts
const today = latestAttempt(PRIYA)

/** Numbers the footage shows, taken from the persona so copy and film never disagree. */
export const STORY = {
  name: PRIYA.name,
  branch: PRIYA.branchLabel,
  priStart: firstAttempt?.pri ?? 0,
  priMid: secondAttempt?.pri ?? 0,
  priNow: today.pri,
  content: today.content ?? 0,
  delivery: today.delivery ?? 0,
  versant: today.versant ?? 0,
}

export interface FilmScene {
  id: string
  /** file stem in MEDIA_BASE */
  file: string
  label: string
  route: string
  lead: string
  caption: string
  metric: string
}

export const SCENES: FilmScene[] = [
  {
    id: 'hallticket',
    file: 'scene-1-hallticket',
    label: 'Hall ticket',
    route: '/placement/',
    lead: 'Start',
    caption: `Sarthi reads your profile, sets your readiness at PRI ${STORY.priMid} and issues the hall ticket`,
    metric: `PRI ${STORY.priMid} · Eligible`,
  },
  {
    id: 'aptitude',
    file: 'scene-2-aptitude',
    label: 'Aptitude',
    route: '/placement/drive/aptitude/',
    lead: 'Round 1',
    caption: 'Proctored aptitude: a tab switch is flagged right in the browser, integrity holds at 96',
    metric: 'Integrity 96',
  },
  {
    id: 'coding',
    file: 'scene-3-coding',
    label: 'DSA',
    route: '/placement/drive/technical/',
    lead: 'Round 2',
    caption: 'Sarthi reviews your code, spots O(n²) and walks you to an O(n) fix: 10/10 tests',
    metric: 'O(n²) → O(n)',
  },
  {
    id: 'interview',
    file: 'scene-4-interview',
    label: 'AI Interview',
    route: '/placement/drive/interview/',
    lead: 'Round 4',
    caption: 'Sarthi listens in Hinglish and asks a follow-up on your own project',
    metric: 'Because you said: ESP32',
  },
  {
    id: 'report',
    file: 'scene-5-report',
    label: 'Report',
    route: '/placement/report/',
    lead: 'Report',
    caption: `Readiness climbs ${STORY.priStart} → ${STORY.priMid} → ${STORY.priNow}, and new drives open up`,
    metric: `PRI ${STORY.priStart} → ${STORY.priNow}`,
  },
  {
    id: 'state',
    file: 'scene-6-state',
    label: 'State',
    route: '/state/',
    lead: 'DSTTE',
    caption: 'Ask Sarthi in Hindi: Bihar’s districts light up with live readiness',
    metric: 'Ask Sarthi in Hindi',
  },
]
