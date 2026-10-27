import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { OSChrome } from '@/components/os/os-chrome'

export const metadata: Metadata = {
  title: { default: 'ParthSarthi Placement OS', template: '%s · ParthSarthi Placement OS' },
  description: 'AI placement-readiness layer for Bihar technical education. Concept preview with illustrative data.',
}

export default function OSLayout({ children }: { children: ReactNode }) {
  return <OSChrome>{children}</OSChrome>
}
