'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { FileCode2, Loader2, Play, RotateCcw, Send, ShieldCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tr } from '@/components/os/tr-text'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { CODE_LANGS, type CodeLang } from '@/components/placement/technical/problems'

// -----------------------------------------------------------------------------
// Syntax highlighting (tiny regex tokenizer; no dependency)
// -----------------------------------------------------------------------------

type Kind = 'kw' | 'str' | 'num' | 'com' | 'fn' | 'bi' | 'punct' | 'plain' | 'ws'
interface Token {
  text: string
  kind: Kind
}

const KW: Record<CodeLang, Set<string>> = {
  python: new Set(
    'def for while if elif else return in not and or pass import from class None True False break continue lambda with as is int'.split(' '),
  ),
  cpp: new Set(
    'include using namespace std int void for while if else return vector auto const string bool long char true false public class struct static new break continue size_t'.split(
      ' ',
    ),
  ),
  java: new Set(
    'import public class static void int for while if else return new String boolean long char true false final private null break continue'.split(' '),
  ),
  c: new Set('include int void for while if else return char long const static sizeof unsigned struct break continue'.split(' ')),
}

const BUILTINS: Record<CodeLang, Set<string>> = {
  python: new Set('range len print input map list enumerate min max sum split'.split(' ')),
  cpp: new Set('cin cout endl getline'.split(' ')),
  java: new Set('System Scanner StringBuilder Math'.split(' ')),
  c: new Set('printf scanf fgets strcspn'.split(' ')),
}

const RE_PY = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d])/g
// Built from a string: the #include <header> lookbehind is ES2018 syntax and tsconfig targets ES6.
const RE_C = new RegExp(
  String.raw`(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|(?<=#include\s{0,4})<[^>\n]*>)|(#\s*[A-Za-z]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d])`,
  'g',
)

function tokenize(code: string, lang: CodeLang): Token[] {
  const out: Token[] = []
  const py = lang === 'python'
  const re = new RegExp(py ? RE_PY : RE_C)
  let m: RegExpExecArray | null
  let last = 0
  while ((m = re.exec(code))) {
    if (m.index > last) out.push({ text: code.slice(last, m.index), kind: 'plain' })
    const text = m[0]
    if (!text) {
      re.lastIndex++
      continue
    }
    let kind: Kind = 'plain'
    if (py) {
      if (m[1]) kind = 'com'
      else if (m[2]) kind = 'str'
      else if (m[3]) kind = 'num'
      else if (m[4]) kind = KW.python.has(text) ? 'kw' : BUILTINS.python.has(text) ? 'bi' : /^\s*\(/.test(code.slice(re.lastIndex, re.lastIndex + 4)) ? 'fn' : 'plain'
      else if (m[5]) kind = 'ws'
      else kind = 'punct'
    } else {
      if (m[1]) kind = 'com'
      else if (m[2]) kind = 'str'
      else if (m[3]) kind = 'kw'
      else if (m[4]) kind = 'num'
      else if (m[5]) kind = KW[lang].has(text) ? 'kw' : BUILTINS[lang].has(text) ? 'bi' : /^\s*\(/.test(code.slice(re.lastIndex, re.lastIndex + 4)) ? 'fn' : 'plain'
      else if (m[6]) kind = 'ws'
      else kind = 'punct'
    }
    out.push({ text, kind })
    last = re.lastIndex
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: 'plain' })
  return out
}

// Literal class strings so Tailwind generates them. Spec: keywords violet, strings emerald, numbers amber, comments grey.
const KIND_CLASS: Record<Kind, string> = {
  kw: 'text-violet-300',
  str: 'text-emerald-300',
  num: 'text-amber-300',
  com: 'text-gray-500 italic',
  fn: 'text-sky-300',
  bi: 'text-cyan-200',
  punct: 'text-gray-400',
  plain: 'text-gray-200',
  ws: '',
}

function GhostCaret() {
  return (
    <span aria-hidden className="relative inline-block w-0 align-top">
      <span className="caret-blink absolute -left-px top-[3px] h-[18px] w-[2px] rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
    </span>
  )
}

function renderHighlighted(tokens: Token[], caretAt: number | null): ReactNode[] {
  const nodes: ReactNode[] = []
  let offset = 0
  let caretDone = caretAt === null
  tokens.forEach((tk, i) => {
    const end = offset + tk.text.length
    const cls = KIND_CLASS[tk.kind]
    if (!caretDone && caretAt !== null && caretAt >= offset && caretAt < end) {
      const cut = caretAt - offset
      const a = tk.text.slice(0, cut)
      const b = tk.text.slice(cut)
      if (a) nodes.push(<span key={`${i}a`} className={cls}>{a}</span>)
      nodes.push(<GhostCaret key={`${i}c`} />)
      nodes.push(<span key={`${i}b`} className={cls}>{b}</span>)
      caretDone = true
    } else {
      nodes.push(
        cls ? (
          <span key={i} className={cls}>
            {tk.text}
          </span>
        ) : (
          tk.text
        ),
      )
    }
    offset = end
  })
  if (!caretDone) nodes.push(<GhostCaret key="caret-end" />)
  return nodes
}

// -----------------------------------------------------------------------------
// Editor
// -----------------------------------------------------------------------------

const FILE_NAME: Record<CodeLang, string> = { python: 'main.py', cpp: 'main.cpp', java: 'Main.java', c: 'main.c' }
const LINE_H = 24 // px, matches leading-6
const PAD_Y = 12 // px, matches py-3

const T = {
  run: { en: 'Run', hi: 'चलाएँ', hinglish: 'Run' },
  submit: { en: 'Submit', hi: 'सबमिट', hinglish: 'Submit' },
  reset: { en: 'Reset code', hi: 'कोड रीसेट', hinglish: 'Reset code' },
  confirm: { en: 'Reset? click again', hi: 'रीसेट? फिर क्लिक करें', hinglish: 'Reset? phir click karo' },
  ln: { en: 'Ln', hi: 'पंक्ति', hinglish: 'Ln' },
  col: { en: 'Col', hi: 'कॉलम', hinglish: 'Col' },
  spaces: { en: 'Spaces: 2', hi: 'स्पेस: 2', hinglish: 'Spaces: 2' },
  ctrlEnter: { en: 'Ctrl+Enter runs', hi: 'Ctrl+Enter से चलाएँ', hinglish: 'Ctrl+Enter se run' },
  proctored: { en: 'Paste disabled · proctored', hi: 'पेस्ट बंद · प्रॉक्टर्ड', hinglish: 'Paste band · proctored' },
  typing: { en: 'Sarthi is typing…', hi: 'सारथी टाइप कर रहा है…', hinglish: 'Sarthi type kar raha hai…' },
  editorLabel: { en: 'Code editor', hi: 'कोड एडिटर', hinglish: 'Code editor' },
} satisfies Record<string, Bi>

export interface CodeEditorProps {
  value: string
  onChange: (v: string) => void
  lang: CodeLang
  onLangChange: (l: CodeLang) => void
  onRun: () => void
  onSubmit: () => void
  onReset: () => void
  readOnly?: boolean
  /** Character offset of a simulated caret while code is typed for the candidate (autopilot / Apply fix). */
  ghostCaret?: number | null
  running?: boolean
  submitting?: boolean
  /** Disables Run / Submit / Reset / language (e.g. while a sequence is playing). */
  locked?: boolean
  /** Small label next to the file tab, e.g. "Priya's first attempt". */
  draftLabel?: Bi | string | null
  /** Increment to play a short success glow (after Apply fix). */
  flash?: number
  className?: string
}

/**
 * Lightweight code editor: a transparent-text textarea over a highlighted <pre>, a synced line-number
 * gutter, Tab = 2 spaces, auto-indent, Ctrl+Enter = Run. The wrapper is [data-proctored], so the
 * foundation's useProctor blocks paste / copy / right-click here with a toast. data-hotkeys-off keeps
 * presenter hotkeys from firing while typing.
 */
export function CodeEditor({
  value,
  onChange,
  lang,
  onLangChange,
  onRun,
  onSubmit,
  onReset,
  readOnly = false,
  ghostCaret = null,
  running = false,
  submitting = false,
  locked = false,
  draftLabel,
  flash = 0,
  className,
}: CodeEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const pendingSel = useRef<number | null>(null)
  const [caret, setCaret] = useState({ line: 1, col: 1 })
  const [focused, setFocused] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [glow, setGlow] = useState(false)

  const code = typeof value === 'string' ? value : ''
  const tokens = useMemo(() => tokenize(code, lang), [code, lang])
  const lineCount = useMemo(() => code.split('\n').length, [code])
  const caretAt = ghostCaret === null || ghostCaret === undefined ? null : Math.max(0, Math.min(code.length, ghostCaret))
  const highlighted = useMemo(() => renderHighlighted(tokens, caretAt), [tokens, caretAt])
  const busy = running || submitting

  // Keep the overlay and gutter aligned with the textarea's scroll position.
  const syncScroll = useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop
      preRef.current.scrollLeft = ta.scrollLeft
    }
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-ta.scrollTop}px)`
  }, [])

  // Apply a pending selection after a programmatic edit (fallback path).
  useLayoutEffect(() => {
    const ta = taRef.current
    if (ta && pendingSel.current !== null) {
      const p = pendingSel.current
      pendingSel.current = null
      try {
        ta.setSelectionRange(p, p)
      } catch {
        /* ignore */
      }
    }
    syncScroll()
  }, [code, syncScroll])

  // While code is typed for the candidate, keep the ghost caret in view.
  useEffect(() => {
    const ta = taRef.current
    if (!ta || caretAt === null) return
    const line = code.slice(0, caretAt).split('\n').length
    const top = PAD_Y + (line - 1) * LINE_H
    const view = ta.clientHeight
    if (top < ta.scrollTop + LINE_H) ta.scrollTop = Math.max(0, top - LINE_H * 2)
    else if (top > ta.scrollTop + view - LINE_H * 3) ta.scrollTop = top - view + LINE_H * 4
    syncScroll()
  }, [caretAt, code, syncScroll])

  useEffect(() => {
    if (!flash) return
    setGlow(true)
    const id = setTimeout(() => setGlow(false), 1400)
    return () => clearTimeout(id)
  }, [flash])

  useEffect(() => {
    if (!confirmReset) return
    const id = setTimeout(() => setConfirmReset(false), 2500)
    return () => clearTimeout(id)
  }, [confirmReset])

  const updateCaret = useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    const before = ta.value.slice(0, ta.selectionStart ?? 0)
    const lines = before.split('\n')
    setCaret((c) => {
      const next = { line: lines.length, col: (lines[lines.length - 1]?.length ?? 0) + 1 }
      return c.line === next.line && c.col === next.col ? c : next
    })
  }, [])

  /** Insert text at the selection, keeping native undo when the browser supports it. */
  const insertText = useCallback(
    (text: string) => {
      const ta = taRef.current
      if (!ta) return
      let ok = false
      try {
        ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, text)
      } catch {
        ok = false
      }
      if (!ok) {
        const s = ta.selectionStart ?? 0
        const e = ta.selectionEnd ?? s
        const next = ta.value.slice(0, s) + text + ta.value.slice(e)
        pendingSel.current = s + text.length
        onChange(next)
      }
    },
    [onChange],
  )

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!busy && !locked) onRun()
      return
    }
    if (e.key === 'Escape') {
      taRef.current?.blur()
      return
    }
    if (readOnly) return
    const ta = e.currentTarget
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      if (e.shiftKey) {
        // Outdent the current line by up to 2 spaces.
        const s = ta.selectionStart ?? 0
        const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1
        const lead = /^ {1,2}/.exec(ta.value.slice(lineStart))?.[0].length ?? 0
        if (lead > 0) {
          const next = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + lead)
          pendingSel.current = Math.max(lineStart, s - lead)
          onChange(next)
        }
        return
      }
      insertText('  ')
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      const s = ta.selectionStart ?? 0
      const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1
      const current = ta.value.slice(lineStart, s)
      let indent = /^\s*/.exec(current)?.[0] ?? ''
      const trimmed = current.trimEnd()
      if (trimmed.endsWith(':') || trimmed.endsWith('{')) indent += '    '
      insertText('\n' + indent)
    }
  }

  const doReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    setConfirmReset(false)
    onReset()
  }

  const gutterLines = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount])

  return (
    <div
      data-proctored=""
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-[#0a0e14] transition-[border-color,box-shadow] duration-500',
        glow
          ? 'border-emerald-400/50 shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_0_40px_-8px_rgba(52,211,153,0.45)]'
          : 'border-white/10',
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-2.5 py-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 font-mono text-[12px] text-gray-300">
          <FileCode2 className="h-3.5 w-3.5 text-cyan-300/80" aria-hidden />
          {FILE_NAME[lang]}
        </span>
        <Select value={lang} onValueChange={(v) => onLangChange(v as CodeLang)} disabled={locked || readOnly}>
          <SelectTrigger
            aria-label="Language"
            className="h-8 w-[118px] border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] text-gray-100 focus:ring-1 focus:ring-cyan-400/50 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#11161f] text-gray-100">
            {CODE_LANGS.map((l) => (
              <SelectItem key={l.id} value={l.id} className="text-[13px] focus:bg-white/10 focus:text-white">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {draftLabel && !readOnly && (
          <span className="hidden min-w-0 truncate text-[12px] text-gray-500 xl:inline">
            <Tr b={draftLabel} />
          </span>
        )}
        {readOnly && caretAt !== null && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-violet-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            <Tr b={T.typing} />
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={doReset}
            disabled={locked || busy || readOnly}
            title="Reset code"
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
              confirmReset ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30' : 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            <span className={cn(!confirmReset && 'hidden sm:inline')}>
              <Tr b={confirmReset ? T.confirm : T.reset} />
            </span>
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={locked || busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.04] px-3 text-[13px] font-semibold text-gray-100 transition-colors hover:border-white/30 hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-50"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Play className="h-3.5 w-3.5 text-emerald-300" aria-hidden />}
            <Tr b={T.run} />
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={locked || busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3.5 text-[13px] font-semibold text-white shadow-[0_6px_20px_-8px_rgba(34,211,238,0.8)] transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Send className="h-3.5 w-3.5" aria-hidden />}
            <Tr b={T.submit} />
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="relative flex min-h-0 flex-1">
        <div className="relative w-11 shrink-0 select-none overflow-hidden border-r border-white/[0.05] bg-white/[0.015]" aria-hidden>
          <div ref={gutterRef} className="py-3 pr-2.5 text-right font-mono text-[12px] leading-6 tabular-nums will-change-transform">
            {gutterLines.map((n) => (
              <div key={n} className={cn(focused && n === caret.line ? 'text-gray-300' : 'text-gray-600')}>
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <pre
            ref={preRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre px-3.5 py-3 font-mono text-sm leading-6 [font-variant-ligatures:none] [tab-size:2]"
          >
            {focused && !readOnly && (
              <span
                className="absolute left-0 right-0 block h-6 bg-white/[0.035]"
                style={{ top: PAD_Y + (caret.line - 1) * LINE_H }}
              />
            )}
            <code className="relative block min-w-full pb-8">
              {highlighted}
              {'\n'}
            </code>
          </pre>
          <textarea
            ref={taRef}
            data-hotkeys-off=""
            aria-label="Code editor"
            value={code}
            readOnly={readOnly}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onChange={(e) => {
              onChange(e.target.value)
              requestAnimationFrame(updateCaret)
            }}
            onKeyDown={onKeyDown}
            onKeyUp={updateCaret}
            onClick={updateCaret}
            onSelect={updateCaret}
            onScroll={syncScroll}
            onFocus={() => {
              setFocused(true)
              updateCaret()
            }}
            onBlur={() => setFocused(false)}
            className={cn(
              'absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-3.5 py-3 font-mono text-sm leading-6 text-transparent outline-none [font-variant-ligatures:none] [tab-size:2]',
              'caret-cyan-300 selection:bg-cyan-400/25 selection:text-transparent',
              readOnly && 'cursor-default',
            )}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center gap-3 overflow-hidden border-t border-white/[0.06] bg-white/[0.015] px-3 py-1.5 text-[12px] text-gray-500">
        <span className="shrink-0 font-medium text-gray-400">{CODE_LANGS.find((l) => l.id === lang)?.label}</span>
        <span className="shrink-0 tabular-nums">
          <Tr b={T.ln} /> {caret.line}, <Tr b={T.col} /> {caret.col}
        </span>
        <span className="hidden shrink-0 sm:inline">
          <Tr b={T.spaces} />
        </span>
        <span className="hidden shrink-0 md:inline">
          <Tr b={T.ctrlEnter} />
        </span>
        <span className="ml-auto inline-flex min-w-0 items-center gap-1 truncate text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" aria-hidden />
          <span className="truncate">
            <Tr b={T.proctored} />
          </span>
        </span>
      </div>
    </div>
  )
}
