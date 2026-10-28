/* Media contract for the home-page showcase (files produced by the MEDIA unit in public/os/media/).
 * Scene clips are full-frame (whole 1024x640 app screen recorded at 1.25x, no punch-in), 7.0 s, 1280x800,
 * WebM + MP4 + poster.
 * Every consumer must degrade gracefully: video -> poster -> animated mock. */

import { PRIYA, latestAttempt } from '@/lib/mock/personas'
import { blueprintById } from '@/lib/mock/blueprints'
import { daysBetween } from '@/lib/mock/state'
import { INTERVIEW_SPLIT, ROUND_TARGETS } from '@/lib/os/rounds'
import { TAB_SWITCH_PENALTY } from '@/lib/os/scoring'
import { DRIVE_COUNTS } from '@/lib/mock/drives'

export const MEDIA_BASE = '/os/media/'
/** Host shown in the browser chrome. Only a real custom domain belongs here; the staging host is never
 * shown (null = path only). */
export const SITE_HOST: string | null = null
/** Fallback clock per scene when a clip cannot play (clips are 7.0 s). */
export const SCENE_MS = 7000

export const mediaUrl = (name: string, ext: 'webm' | 'mp4' | 'jpg') => `${MEDIA_BASE}${name}.${ext}`

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
  /** Days from the diagnostic to today (42 → 71). */
  days: firstAttempt ? daysBetween(firstAttempt.date, today.date) : 0,
  aptitude: ROUND_TARGETS.priya.aptitude,
  technical: ROUND_TARGETS.priya.technical,
  interviewContent: INTERVIEW_SPLIT.priya.content,
  interviewDelivery: INTERVIEW_SPLIT.priya.delivery,
  blueprint: blueprintById(PRIYA.defaultBlueprintId).label,
  /** What the proctoring panel shows after one tab switch in the recorded run (same rule as the app). */
  integrity: 100 - TAB_SWITCH_PENALTY,
  /** Eligible drives on the diagnostic date vs today (the report shows "9 drives · 6 Oct ko 2 thi"). */
  drivesBefore: DRIVE_COUNTS.priya.before ?? 0,
  drivesNow: DRIVE_COUNTS.priya.now,
}

/** Where a floating callout sits on the product stage: over the frame's top-right, bottom-left or
 * bottom-right corner. */
export type CueSlot = 'tr' | 'bl' | 'br'
export interface FilmCue {
  /** Seconds into the 7 s clip when the callout animates in (the moment the footage shows it). */
  at: number
  slot: CueSlot
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
  /** Callout cues, in order; content lives in film-callouts.tsx (keyed by scene id + cue index). */
  cues: [FilmCue, FilmCue]
  /** Seconds to rest on the clip's last frame before the next scene, so a late callout can be read. */
  hold?: number
}

/** How long a scene is on screen: the 7 s clip plus its hold. */
export const sceneMs = (s: FilmScene) => SCENE_MS + (s.hold ?? 0) * 1000

export const SCENES: FilmScene[] = [
  {
    id: 'hallticket',
    file: 'scene-1-hallticket',
    label: 'Hall ticket',
    route: '/placement/',
    lead: 'Start',
    caption: `Sarthi reads your profile, sets PRI ${STORY.priMid} and issues your hall ticket`,
    metric: `PRI ${STORY.priMid} · Eligible`,
    cues: [{ at: 0.5, slot: 'tr' }, { at: 2.6, slot: 'bl' }],
  },
  {
    id: 'aptitude',
    file: 'scene-2-aptitude',
    label: 'Aptitude',
    route: '/placement/drive/aptitude/',
    lead: 'Round 1',
    caption: `A tab switch is flagged in the browser; integrity holds at ${STORY.integrity}`,
    metric: `Integrity ${STORY.integrity}`,
    cues: [{ at: 2.95, slot: 'bl' }, { at: 3.6, slot: 'tr' }],
  },
  {
    id: 'coding',
    file: 'scene-3-coding',
    label: 'DSA',
    route: '/placement/drive/technical/',
    lead: 'Round 2',
    caption: 'Sarthi spots O(n²) in your code and walks you to an O(n) fix: 10/10 tests',
    metric: 'O(n²) → O(n)',
    cues: [{ at: 1.3, slot: 'bl' }, { at: 5.0, slot: 'tr' }],
    hold: 1.5,
  },
  {
    id: 'interview',
    file: 'scene-4-interview',
    label: 'AI Interview',
    route: '/placement/drive/interview/',
    lead: 'Round 4',
    caption: 'Sarthi listens in Hinglish and asks a follow-up on your own project',
    metric: 'Because you said: ESP32',
    cues: [{ at: 3.6, slot: 'bl' }, { at: 5.3, slot: 'tr' }],
    hold: 1.0,
  },
  {
    id: 'report',
    file: 'scene-5-report',
    label: 'Report',
    route: '/placement/report/',
    lead: 'Report',
    caption: `Readiness climbs ${STORY.priStart} → ${STORY.priMid} → ${STORY.priNow}, and new drives open up`,
    metric: `PRI ${STORY.priStart} → ${STORY.priNow}`,
    cues: [{ at: 0.6, slot: 'tr' }, { at: 3.2, slot: 'br' }],
  },
  {
    id: 'state',
    file: 'scene-6-state',
    label: 'State',
    route: '/state/',
    lead: 'DSTTE',
    caption: 'Ask Sarthi in Hindi: Bihar’s districts light up with live readiness',
    metric: 'Ask Sarthi in Hindi',
    cues: [{ at: 0.6, slot: 'tr' }, { at: 2.3, slot: 'bl' }],
  },
]
