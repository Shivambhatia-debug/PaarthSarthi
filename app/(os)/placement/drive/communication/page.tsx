'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { DriveShell } from '@/components/os/drive-shell'
import { AudioGate } from '@/components/os/audio-gate'
import { Tr } from '@/components/os/tr-text'
import { CommRound } from '@/components/placement/communication/comm-round'
import { useDemo } from '@/lib/os/demo-store'
import { ROUNDS, VERSANT_TARGETS, nextRoute } from '@/lib/os/rounds'
import type { Bi } from '@/lib/os/i18n'

const TITLE: Bi = { en: 'Communication · Versant/SVAR-style', hi: 'संवाद · Versant/SVAR-शैली', hinglish: 'Communication · Versant/SVAR-style' }
const SUBTITLE: Bi = {
  en: 'Round 3 · Read aloud, listen & repeat, open answer · about 2 minutes',
  hi: 'राउंड 3 · पढ़कर बोलें, सुनकर दोहराएँ, खुला उत्तर · लगभग 2 मिनट',
  hinglish: 'Round 3 · Read aloud, listen & repeat, open answer · lagbhag 2 minute',
}
const GATE_TITLE: Bi = { en: 'Communication round', hi: 'संवाद राउंड', hinglish: 'Communication round' }
const GATE_BODY: Bi = {
  en: 'Three short English speaking tasks, scored on a 20-80 Versant-style scale. Sarthi listens through your microphone (en-IN).',
  hi: 'अंग्रेज़ी बोलने के तीन छोटे काम, 20-80 Versant-शैली स्केल पर स्कोर। सारथी आपके माइक्रोफ़ोन से सुनेगा (en-IN)।',
  hinglish: 'Teen chhote English speaking tasks, 20-80 Versant-style scale par score. Sarthi aapke microphone se sunega (en-IN).',
}
const START: Bi = { en: 'Start', hi: 'शुरू करें', hinglish: 'Start' }

export default function CommunicationPage() {
  const router = useRouter()
  const { rounds, setRound, includeGd, personaId, t } = useDemo()
  const [done, setDone] = useState(false)
  const status = rounds?.communication?.status ?? 'locked'

  // Entering the round marks it live (never downgrades a cleared round).
  useEffect(() => {
    if (status === 'locked') setRound('communication', { status: 'live' })
  }, [status, setRound])

  const href = nextRoute('communication', includeGd)
  const nextDef = ROUNDS.find((r) => r.route === href)
  const nextLabel: Bi = nextDef
    ? { en: `Next: ${nextDef.label.en}`, hi: `अगला: ${nextDef.label.hi}`, hinglish: `Next: ${nextDef.label.en}` }
    : { en: 'View my report', hi: 'मेरी रिपोर्ट देखें', hinglish: 'Meri report dekhiye' }
  const versant = VERSANT_TARGETS[personaId] ?? 50

  const footer = done ? (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-gray-300">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
        <Tr
          b={{
            en: `Round 3 cleared · ${versant}/80`,
            hi: `राउंड 3 पूरा · ${versant}/80`,
            hinglish: `Round 3 cleared · ${versant}/80`,
          }}
          className="truncate"
        />
      </div>
      <button
        type="button"
        onClick={() => router.push(href)}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-5 text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(34,211,238,0.85)] transition-[filter,transform] hover:-translate-y-px hover:brightness-110 sm:flex-none"
        aria-label={t(nextLabel)}
      >
        <Tr b={nextLabel} />
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  ) : undefined

  return (
    <DriveShell round="communication" title={TITLE} subtitle={SUBTITLE} footer={footer}>
      <AudioGate title={GATE_TITLE} body={GATE_BODY} startLabel={START}>
        <CommRound key={personaId} onDone={setDone} />
      </AudioGate>
    </DriveShell>
  )
}
