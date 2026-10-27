'use client'

// Bilingual drive notice for WhatsApp groups: streams English, then हिंदी, with "Copy for WhatsApp".

import { useMemo, useState } from 'react'
import { Copy, MessageCircle, RotateCcw } from 'lucide-react'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import type { Drive, Institution } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { btnAi, btnSmall } from '@/components/tpo/tpo-header'
import { copyText, driveNoticeFor } from '@/components/tpo/tpo-data'

const UI = {
  title: { en: 'Drive notice · English + Hindi', hi: 'ड्राइव सूचना · अंग्रेज़ी + हिंदी' },
  meta: { en: 'Drafted by Sarthi AI from the drive blueprint', hi: 'ड्राइव ब्लूप्रिंट से सारथी AI द्वारा तैयार' },
  copy: { en: 'Copy for WhatsApp', hi: 'WhatsApp के लिए कॉपी करें' },
  redo: { en: 'Redraft', hi: 'दोबारा लिखें' },
  empty: { en: 'Pick a drive to draft its notice.', hi: 'सूचना बनाने के लिए एक ड्राइव चुनें।' },
  copied: { en: 'Notice copied: paste it into the batch WhatsApp group', hi: 'सूचना कॉपी हुई: बैच के WhatsApp ग्रुप में पेस्ट करें' },
  copyFail: { en: 'Copy blocked by the browser: select the text and copy it', hi: 'ब्राउज़र ने कॉपी रोकी: टेक्स्ट चुनकर कॉपी करें' },
} satisfies Record<string, Bi>

export interface DriveNoticeProps {
  drive: Drive | undefined
  inst: Institution
  className?: string
}

export function DriveNotice({ drive, inst, className }: DriveNoticeProps) {
  const { t } = useDemo()
  const [nonce, setNonce] = useState(0)
  const [enDone, setEnDone] = useState<string | null>(null)
  const notice = useMemo(() => (drive ? driveNoticeFor(drive, inst) : null), [drive, inst])
  const runKey = `${drive?.id ?? 'none'}-${nonce}`
  const showHi = enDone === runKey

  const copy = async () => {
    if (!notice) return
    const ok = await copyText(`${notice.en}\n\n${notice.hi}`)
    aiToast(t(ok ? UI.copied : UI.copyFail), { tone: ok ? 'ok' : 'warn' })
  }

  return (
    <AISurface
      title={t(UI.title)}
      meta={t(UI.meta)}
      className={cn('h-full', className)}
      actions={
        notice ? (
          <button type="button" onClick={() => setNonce((n) => n + 1)} className={btnSmall} aria-label={t(UI.redo)}>
            <RotateCcw aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              <Tr b={UI.redo} />
            </span>
          </button>
        ) : undefined
      }
    >
      {!notice ? (
        <Tr as="p" b={UI.empty} className="text-[13px] text-gray-400" />
      ) : (
        <div key={runKey} className="space-y-3">
          <div className="rounded-lg border border-white/[0.08] bg-[#0b0f16]/70 p-3">
            <StreamingText
              text={notice.en}
              cps={160}
              as="div"
              onDone={() => setEnDone(runKey)}
              className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-gray-200"
            />
          </div>
          {showHi && (
            <div className="rounded-lg border border-white/[0.08] bg-[#0b0f16]/70 p-3 animate-in fade-in-0 duration-300">
              <StreamingText
                text={notice.hi}
                cps={160}
                as="div"
                lang="hi"
                className="whitespace-pre-wrap break-words font-deva text-[13px] leading-relaxed text-gray-200"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button type="button" onClick={copy} className={btnAi}>
              <Copy aria-hidden className="h-4 w-4" />
              <Tr b={UI.copy} />
            </button>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
              <MessageCircle aria-hidden className="h-3.5 w-3.5" />
              <Tr
                b={{
                  en: `${notice.en.length + notice.hi.length} characters · one message`,
                  hi: `${notice.en.length + notice.hi.length} अक्षर · एक संदेश`,
                }}
              />
            </span>
          </div>
        </div>
      )}
    </AISurface>
  )
}
