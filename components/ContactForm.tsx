'use client'

import { useActionState, useEffect, useState } from 'react'
import { sendContact, type ContactState } from '@/app/actions/contact'
import Emote, { type EmoteName } from '@/components/duck/Emote'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

// the duck's face for each reply
const FACE: Record<'invalid' | 'tooFast' | 'tooMany' | 'failed', EmoteName> = {
  invalid: 'question',
  tooFast: 'sweat',
  tooMany: 'angry',
  failed: 'crying',
}

/**
 * Name, email, message, send. Two hidden fields feed the server action's
 * defences: `website` (the honeypot) and `t` (when the form mounted).
 * Rendered only when the page says the mail key exists; otherwise the
 * footer keeps its plain mailto link.
 */
export default function ContactForm() {
  const lang = useLang()
  const t = ui[lang]
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, null)
  // set after mount so the stamp is the reader's clock, not the build's
  const [started, setStarted] = useState(0)
  useEffect(() => setStarted(Date.now()), [])

  const field =
    'w-full rounded-md border border-fg/18 bg-panel/90 px-3 py-2.5 font-mono text-[12px] text-fg placeholder:text-fg/40 outline-hidden transition-colors focus:border-fg/50'

  if (state?.ok) {
    return (
      <p role="status" className="flex items-center gap-3 font-mono text-[12px] text-fg">
        <Emote name="hearts" size={44} />
        {t.form.sent}
      </p>
    )
  }

  return (
    <form action={action} className="flex w-full max-w-xl flex-col gap-2.5" data-cursor="text">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input name="name" required maxLength={120} autoComplete="name" placeholder={t.form.name} className={field} />
        <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={t.form.email} className={field} />
      </div>
      <textarea name="message" required minLength={2} maxLength={5000} rows={4} placeholder={t.form.message} className={field} />
      {/* honeypot: off screen, out of the tab order, ignored by readers */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="t" value={started} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-fg px-5 font-mono text-[11px] uppercase tracking-[0.15em] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t.form.sending : t.form.send} →
        </button>
        {state && !state.ok && (
          <p role="alert" className="flex items-center gap-2 font-mono text-[11px] text-red-400">
            <Emote name={FACE[state.code]} size={36} />
            {t.form[state.code]}
          </p>
        )}
      </div>
    </form>
  )
}
