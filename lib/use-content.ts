'use client'

import { useMemo } from 'react'
import { localize, type Content } from '@/lib/content'
import { useLang } from '@/lib/use-lang'

/** The prose in the language that is on, re-derived when it flips. */
export function useContent(): Content {
  const lang = useLang()
  return useMemo(() => localize(lang), [lang])
}
