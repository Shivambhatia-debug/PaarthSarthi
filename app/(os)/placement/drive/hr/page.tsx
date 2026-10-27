import { InterviewStage } from '@/components/placement/interview/interview-stage'

/** Round 6 · AI HR interview. Mounts the HR phase directly (no query param, no tech flash). */
export default function HrInterviewPage() {
  return <InterviewStage phase="hr" />
}
