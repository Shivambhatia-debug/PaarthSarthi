'use client'

import type { ElementType } from 'react'
import { useLang } from '@/lib/os/demo-store'
import { isDevanagari, tr, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export interface TrProps {
  b: Bi | string | null | undefined
  className?: string
  /** Element to render. Default 'span'. */
  as?: ElementType
  /** Optional (additive): title attribute. */
  title?: string
}

/**
 * Renders tr(b, useLang()). Adds lang='hi' + font-deva when the output is Devanagari,
 * else lang='en' (GIGW 3.0 / WCAG 2.1 AA: every Hindi string is marked).
 */
export function Tr({ b, className, as, title }: TrProps) {
  const lang = useLang()
  const text = tr(b ?? '', lang)
  const deva = isDevanagari(text)
  const Comp: ElementType = as ?? 'span'
  return (
    <Comp lang={deva ? 'hi' : 'en'} className={cn(deva && 'font-deva', className)} title={title}>
      {text}
    </Comp>
  )
}
