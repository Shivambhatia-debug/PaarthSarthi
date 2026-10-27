'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GdPreview } from '@/components/placement/gd/gd-preview'
import { Tr } from '@/components/os/tr-text'

export default function GdPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/placement"
        className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <Tr b={{ en: 'Placement Day', hi: 'प्लेसमेंट डे', hinglish: 'Placement Day' }} />
      </Link>
      <GdPreview />
    </div>
  )
}
