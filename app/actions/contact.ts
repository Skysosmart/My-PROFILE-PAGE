'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { contact, player } from '@/data/portfolio'

/**
 * The contact form's server action. Sends through Resend to the EMAIL channel
 * in data/portfolio.ts, with the sender as reply-to, so answering is one
 * click. Three cheap defences before any mail goes out:
 *
 *   honeypot   a hidden `website` field a person never sees and a bot fills
 *   timing     the form stamps when it mounted; under 3 s is not a person
 *   window     3 messages per 10 minutes per address
 *
 * The window is a Map in module scope: on Vercel that is per serverless
 * instance, so it is a nuisance to a bot rather than a wall. The honeypot
 * and the timing carry the load.
 */

export type ContactState =
  | null
  | { ok: true }
  | { ok: false; code: 'invalid' | 'tooFast' | 'tooMany' | 'failed' }

const WINDOW_MS = 10 * 60 * 1000
const WINDOW_MAX = 3
const MIN_FILL_MS = 3000
const hits = new Map<string, number[]>()

function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.set(ip, recent)
  if (recent.length >= WINDOW_MAX) return true
  recent.push(now)
  return false
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get('name') ?? '').trim().slice(0, 120)
  const email = String(form.get('email') ?? '').trim().slice(0, 200)
  const message = String(form.get('message') ?? '').trim().slice(0, 5000)
  const website = String(form.get('website') ?? '')
  const started = Number(form.get('t') ?? 0)

  // a bot filled the field a person cannot see: say yes and send nothing
  if (website) return { ok: true }
  if (!name || !EMAIL.test(email) || message.length < 2) return { ok: false, code: 'invalid' }
  if (!started || Date.now() - started < MIN_FILL_MS) return { ok: false, code: 'tooFast' }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (limited(ip)) return { ok: false, code: 'tooMany' }

  const key = process.env.RESEND_API_KEY
  const to = contact.channels.find((c) => c.key === 'EMAIL')?.value
  if (!key || !to) return { ok: false, code: 'failed' }

  try {
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM || `${player.handle} <onboarding@resend.dev>`,
      to,
      replyTo: email,
      subject: `[${player.handle}] ${name}`,
      text: `${message}\n\n--\n${name} <${email}>\nvia ${player.handle} contact form`,
    })
    if (error) return { ok: false, code: 'failed' }
    return { ok: true }
  } catch {
    return { ok: false, code: 'failed' }
  }
}
