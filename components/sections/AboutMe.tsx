'use client'

import { useEffect, useRef, useState } from 'react'
import GlassSection from '@/components/ui/GlassSection'
import TerminalLog, { type Line } from '@/components/ui/TerminalLog'
import Ascii3D from '@/components/effects/Ascii3D'
import { about, assets, player, sop, inspiration, contact } from '@/data/portfolio'

/**
 * ABOUT ME - an INTERACTIVE hacker-terminal (cowsay bubble, rainbow eyes,
 * "sky" figlet, [SYSTEM] boot lines) on the left, portrait window on the
 * right, with an ASCII-rendered 3D torus knot behind the screen.
 *
 * After the boot sequence, the terminal takes commands - type them or tap the
 * chips: `sop` prints the Statement of Purpose, `inspiration` the principles,
 * plus `help`, `whoami`, `clear`.
 */

// cowsay-style speech bubble (static, printed instantly like real cowsay)
const COWSAY = ` _____
< sky >
 -----
    \\
     \\`

// the classic \`cowsay -f eyes\` art, rainbow-colored per line (lolcat style)
const EYES: string[] = [
  '                                   .::!!!!!!!:.',
  '  .!!!!!:.                        .:!!!!!!!!!!!!',
  '  ~~~~!!!!!!.                 .:!!!!!!!!!UWWW$$$',
  '      :$$NWX!!:           .:!!!!!!XUWW$$$$$$$$$P',
  '      $$$$$##WX!:      .<!!!!UW$$$$"  $$$$$$$$#',
  '      $$$$$  $$$UX   :!!UW$$$$$$$$$   4$$$$$*',
  '      ^$$$B  $$$$\\     $$$$$$$$$$$$   d$$R"',
  '        "*$bd$$$$      \'*$$$$$$$$$$$o+#"',
  '             """"          """""""',
]
const EYES_COLORS = [
  'text-sky-400',
  'text-pink-500',
  'text-red-400',
  'text-fuchsia-400',
  'text-violet-400',
  'text-blue-400',
  'text-teal-300',
  'text-green-400',
  'text-emerald-300',
]

const COMMANDS = ['sop', 'inspiration', 'contact', 'help', 'clear'] as const

type Out = { prefix?: { text: string; className?: string }; text: string; className?: string }

export default function AboutMe() {
  const [figlet, setFiglet] = useState('')
  const [ready, setReady] = useState(false) // boot sequence finished
  const [showBoot, setShowBoot] = useState(true) // banner+boot visible (cleared by `clear`)
  const [log, setLog] = useState<Out[]>([])
  const [value, setValue] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const history = useRef<string[]>([])
  const histIdx = useRef(-1)

  // Load the "Sky" figlet logo for the boot banner.
  useEffect(() => {
    let alive = true
    fetch(assets.skyLogoText)
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => alive && setFiglet(t.replace(/\r/g, '')))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Keep the newest output in view (after commands)…
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, ready])

  // …and follow the boot typing inside the fixed window.
  useEffect(() => {
    if (ready) return
    const id = window.setInterval(() => {
      const el = bodyRef.current
      if (el) el.scrollTop = el.scrollHeight
    }, 150)
    return () => clearInterval(id)
  }, [ready])

  // Boot script: [SYSTEM] lines → whoami → profile → command hint.
  const bootLines: Line[] = [
    {
      prefix: { text: '[SYSTEM]', className: 'text-red-500' },
      text: ` Welcome user! We are glad to see you.`,
      className: 'text-green-400',
    },
    {
      prefix: { text: '[SYSTEM]', className: 'text-red-500' },
      text: ` You are viewing ${player.handle} - the portfolio of ${player.name}.`,
      className: 'text-green-400',
    },
    { text: '' },
    { prompt: '$', text: 'whoami' },
    ...about.paragraphs.map((p) => ({ text: p })),
    { text: '' },
    {
      prefix: { text: '[SYSTEM]', className: 'text-red-500' },
      text: ` To read my story, type the command: `,
      className: 'text-green-400',
    },
  ]

  /** Run a terminal command and append its output to the scrollback. */
  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return
    history.current.push(cmd)
    histIdx.current = -1
    const echo: Out = { prefix: { text: '→ ~ ', className: 'text-green-400' }, text: cmd, className: 'text-white' }

    if (cmd === 'clear') {
      // wipe the whole screen, banner included - like a real terminal
      setShowBoot(false)
      setLog([])
      return
    }
    const out: Out[] = [echo]
    if (cmd === 'sop') {
      out.push({ prefix: { text: '[SOP]', className: 'text-sky-400' }, text: ' Statement of Purpose - my story:', className: 'text-white/80' })
      sop.paragraphs.forEach((p) => out.push({ text: p, className: 'text-white/85' }))
    } else if (cmd === 'inspiration') {
      out.push({ prefix: { text: '[INSPIRATION]', className: 'text-fuchsia-400' }, text: ' What drives me:', className: 'text-white/80' })
      inspiration.forEach((i) =>
        out.push(
          { text: `◆ ${i.title}`, className: 'text-yellow-300' },
          { text: `  ${i.description}`, className: 'text-white/75' },
        ),
      )
    } else if (cmd === 'contact') {
      out.push({ prefix: { text: '[CONTACT]', className: 'text-orange-400' }, text: ' reach me at:', className: 'text-white/80' })
      contact.channels.forEach((c) =>
        out.push({ text: `  ${c.key.padEnd(9)} : ${c.value}`, className: 'text-sky-300/90' }),
      )
    } else if (cmd === 'ls') {
      out.push({ text: 'sop.md  inspiration.md  contact.txt  portrait.jpg  certificates/', className: 'text-sky-300/90' })
    } else if (cmd === 'whoami') {
      out.push({ text: `${player.name} - ${player.role}`, className: 'text-green-400' })
    } else if (cmd === 'banner') {
      setShowBoot(true)
    } else if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
      out.push({ text: `${player.firstName.toLowerCase()} is not in the sudoers file. This incident will be reported.`, className: 'text-red-400' })
    } else if (cmd === 'help') {
      out.push(
        { text: 'available commands:', className: 'text-white/60' },
        { text: '  sop          read my Statement of Purpose', className: 'text-sky-300/90' },
        { text: '  inspiration  what drives me', className: 'text-sky-300/90' },
        { text: '  contact      how to reach me', className: 'text-sky-300/90' },
        { text: '  whoami · ls · banner · clear', className: 'text-sky-300/90' },
      )
    } else {
      out.push({ text: `command not found: ${cmd} - try 'help'`, className: 'text-red-400' })
    }
    setLog((l) => [...l, ...out])
  }

  const submit = () => {
    run(value)
    setValue('')
  }

  /** ArrowUp / ArrowDown → walk the command history, like a real shell. */
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = history.current
      if (!h.length) return
      histIdx.current = histIdx.current === -1 ? h.length - 1 : Math.max(0, histIdx.current - 1)
      setValue(h[histIdx.current])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      if (histIdx.current === -1) return
      histIdx.current += 1
      if (histIdx.current >= h.length) {
        histIdx.current = -1
        setValue('')
      } else setValue(h[histIdx.current])
    }
  }

  return (
    <GlassSection
      id="about"
      index="01"
      title="About Me"
      variant="blur"
      background={<Ascii3D />}
      fullScreen
      tone="light"
      panel={false}
    >
      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        {/* interactive terminal (left) */}
        <div
          className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/12 bg-black/35"
          onClick={() => ready && inputRef.current?.focus()}
        >
          {/* terminal title bar */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full border border-white/25" />
            <span className="h-2.5 w-2.5 rounded-full border border-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
            <span className="ml-2 font-mono text-[11px] text-white/40">~/about - interactive</span>
          </div>

          {/* FIXED-SIZE terminal screen - output scrolls inside, the window
              never stretches the section as lines print */}
          <div ref={bodyRef} className="h-[48vh] overflow-y-auto p-4 sm:h-[54vh] sm:p-6">
            {/* banner + boot (hidden by `clear`, restored by `banner`) */}
            <div className={showBoot ? '' : 'hidden'}>
              {/* cowsay bubble */}
              <pre className="m-0 font-mono text-sm leading-snug text-orange-400 sm:text-[15px]">
                {COWSAY}
              </pre>

              {/* the eyes (cowsay -f eyes), rainbow like lolcat */}
              <pre className="m-0 font-mono text-[10px] leading-snug sm:text-xs">
                {EYES.map((line, i) => (
                  <div key={i} className={EYES_COLORS[i % EYES_COLORS.length]}>
                    {line}
                  </div>
                ))}
              </pre>

              {/* "Sky" figlet logo */}
              {figlet && (
                <pre className="m-0 mt-2 font-mono text-xs leading-snug text-violet-400 sm:text-sm">
                  {figlet}
                </pre>
              )}

              <TerminalLog
                lines={bootLines}
                speed={8}
                linePause={130}
                endCaret={false}
                onDone={() => setReady(true)}
                className="mt-3 text-sm sm:text-[15px]"
              />
            </div>

            {/* command output log */}
            <div className="font-mono text-sm sm:text-[15px]">
              {log.map((o, i) => (
                <div key={i} className="whitespace-pre-wrap leading-relaxed">
                  {o.prefix && <span className={o.prefix.className}>{o.prefix.text}</span>}
                  <span className={o.className ?? 'text-white/85'}>{o.text}</span>
                </div>
              ))}
            </div>

            {/* prompt + input (appears when boot completes) */}
            {ready && (
              <div className="mt-1 flex items-center gap-2 font-mono text-sm sm:text-[15px]">
                <span className="text-green-400">→</span>
                <span className="text-teal-300">~</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKey}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal command input"
                  placeholder="type a command… (help)"
                  className="min-w-0 flex-1 border-none bg-transparent font-mono text-white caret-white outline-none placeholder:text-white/25"
                />
              </div>
            )}
          </div>

          {/* selectable command chips */}
          {ready && (
            <div className="flex flex-wrap gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3">
              {COMMANDS.map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation()
                    run(c)
                  }}
                  className="rounded border border-white/20 bg-black/40 px-3 py-1 font-mono text-xs text-green-400 transition-colors hover:border-green-400/60 hover:bg-green-400/10"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* portrait (right) - same window chrome as the terminal */}
        <figure className="group flex flex-col overflow-hidden rounded-xl border border-white/12 bg-black/40 md:w-[320px] lg:w-[360px]">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full border border-white/25" />
            <span className="h-2.5 w-2.5 rounded-full border border-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
            <span className="ml-2 font-mono text-[11px] text-white/40">~/portrait - me.jpg</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.portrait}
            alt={player.name}
            className="h-64 w-full flex-1 object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0 md:h-auto"
          />
          <figcaption className="border-t border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
            {player.name} · {player.role}
          </figcaption>
        </figure>
      </div>
    </GlassSection>
  )
}
