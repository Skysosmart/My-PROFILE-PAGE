'use client'

import { contact } from '@/data/portfolio'

/**
 * Site footer - the contact section, compacted, at the end of the page.
 * Carries id="contact" so the header nav's CONTACT link scrolls here.
 */
export default function Footer() {
  return (
    <footer id="contact" className="scroll-mt-28 px-4 pb-6 pt-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl border-t border-white/10 pt-4">
        {/* contact channels */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 font-mono text-xs">
          {contact.channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="group text-white/60 transition-colors hover:text-white"
            >
              <span className="mr-2 uppercase tracking-wider text-white/35">{c.key}</span>
              <span className="underline-offset-2 group-hover:underline">{c.value}</span>
            </a>
          ))}
        </div>

        <p className="mt-2.5 text-center font-mono text-[10px] text-white/30">
          NONTHANAPHONG.EXE · rendered in ASCII · © 2025
        </p>
      </div>
    </footer>
  )
}
