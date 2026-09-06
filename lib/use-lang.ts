'use client'

import { useSyncExternalStore } from 'react'
import { currentLang, onLangChange, type Lang } from '@/lib/lang'

const subscribe = (cb: () => void) => onLangChange(cb)
const getServerSnapshot = (): Lang => 'en'

/**
 * The current language, as React state. Renders 'en' on the server and
 * during hydration, then the stamped language the moment the store is
 * read, so the server and the first client paint never disagree.
 *
 * Its own file because lib/lang.ts is also read by the server layout (for
 * the boot script), and a React hook import there would drag the client
 * runtime into a server module.
 */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, currentLang, getServerSnapshot)
}
