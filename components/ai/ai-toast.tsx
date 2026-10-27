'use client'

import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, type LucideIcon } from 'lucide-react'

type Tone = 'ai' | 'warn' | 'risk' | 'ok'

const TONES: Record<Tone, { stripe: string; tint: string; icon: string; Icon: LucideIcon }> = {
  ai: {
    stripe: 'linear-gradient(180deg, #60a5fa, #22d3ee 55%, #34d399)',
    tint: 'rgba(34, 211, 238, 0.10)',
    icon: '#67e8f9',
    Icon: Sparkles,
  },
  warn: { stripe: 'linear-gradient(180deg, #fbbf24, #f59e0b)', tint: 'rgba(251, 191, 36, 0.10)', icon: '#fbbf24', Icon: AlertTriangle },
  risk: { stripe: 'linear-gradient(180deg, #fb7185, #f43f5e)', tint: 'rgba(251, 113, 133, 0.12)', icon: '#fb7185', Icon: ShieldAlert },
  ok: { stripe: 'linear-gradient(180deg, #34d399, #10b981)', tint: 'rgba(52, 211, 153, 0.10)', icon: '#34d399', Icon: CheckCircle2 },
}

export interface AIToastOptions {
  description?: string
  tone?: Tone
  /** Optional (additive): ms before auto-dismiss. Default 4500. */
  duration?: number
  /** Optional (additive): reuse an id to update/replace a toast instead of stacking. */
  id?: string | number
}

/**
 * Sonner toast with a tone icon and a coloured left stripe.
 * Needs the <Toaster/> that OSChrome mounts; outside it the call is a harmless no-op.
 */
export function aiToast(title: string, opts: AIToastOptions = {}): string | number {
  const tone = TONES[opts.tone ?? 'ai'] ?? TONES.ai
  const Icon = tone.Icon
  try {
    return toast(title, {
      id: opts.id,
      description: opts.description,
      duration: opts.duration ?? 4500,
      icon: <Icon aria-hidden className="h-4 w-4 shrink-0" style={{ color: tone.icon }} />,
      descriptionClassName: '!text-gray-400 !text-[12.5px] !leading-snug',
      className: 'ps-ai-toast',
      style: {
        background: `${tone.stripe} left / 3px 100% no-repeat, linear-gradient(90deg, ${tone.tint}, rgba(15, 20, 28, 0) 55%), #0f141c`,
        border: '1px solid rgba(255, 255, 255, 0.10)',
        color: '#e5e7eb',
        boxShadow: '0 18px 40px -18px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.02)',
        paddingLeft: 18,
        fontSize: 13.5,
      },
    })
  } catch {
    return ''
  }
}
