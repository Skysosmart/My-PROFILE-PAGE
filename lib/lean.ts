'use client'

/**
 * One "lean" for everything that leans with the reader: the ducks, the orb's
 * drift, the torus's tilt. -1..1 on each axis. On a mouse it is where the
 * pointer is on the screen. On a touch screen it is how the device is
 * tilted (the gyroscope; iOS asks once, on the first tap) and, until the
 * gyroscope speaks, where the finger is. The tilt is measured against a
 * slowly following rest position, so a held tilt settles back and the
 * effect is always about the movement, not how the phone happens to be
 * held.
 */
export type Lean = { x: number; y: number }

const subs = new Set<(l: Lean) => void>()
let started = false

const clamp = (v: number) => Math.max(-1, Math.min(1, v))
const emit = (x: number, y: number) => {
  const l = { x: clamp(x), y: clamp(y) }
  subs.forEach((cb) => cb(l))
}

/** subscribe; the unsubscribe is returned */
export function onLean(cb: (l: Lean) => void) {
  subs.add(cb)
  start()
  return () => {
    subs.delete(cb)
  }
}

const TILT = 22 // degrees of tilt for a full lean
const SETTLE = 0.012 // how fast the rest position follows (per sample, ~60/s)

function start() {
  if (started || typeof window === 'undefined') return
  started = true

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (e) => emit((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2),
      { passive: true },
    )
    return
  }

  // a touch screen: the finger, until the gyroscope takes over
  let gyro = false
  window.addEventListener(
    'touchmove',
    (e) => {
      if (gyro) return
      const t = e.touches[0]
      if (t) emit((t.clientX / window.innerWidth - 0.5) * 2, (t.clientY / window.innerHeight - 0.5) * 2)
    },
    { passive: true },
  )

  let rest: { b: number; g: number } | null = null
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return
    gyro = true
    if (!rest) rest = { b: e.beta, g: e.gamma }
    rest.b += (e.beta - rest.b) * SETTLE
    rest.g += (e.gamma - rest.g) * SETTLE
    // beta: front-back, gamma: left-right, in portrait; turned, they swap
    const db = (e.beta - rest.b) / TILT
    const dg = (e.gamma - rest.g) / TILT
    const angle = (window.screen.orientation?.angle ?? 0) % 360
    if (angle === 90) emit(db, -dg)
    else if (angle === 270) emit(-db, dg)
    else if (angle === 180) emit(-dg, -db)
    else emit(dg, db)
  }
  const listen = () => window.addEventListener('deviceorientation', onOrient)

  // iOS hands out motion data only after a permission asked from a tap
  const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
  if (typeof D?.requestPermission === 'function') {
    const ask = () => {
      window.removeEventListener('touchend', ask)
      window.removeEventListener('click', ask)
      D.requestPermission!()
        .then((r) => {
          if (r === 'granted') listen()
        })
        .catch(() => {})
    }
    window.addEventListener('touchend', ask, { passive: true })
    window.addEventListener('click', ask)
  } else if (typeof window.DeviceOrientationEvent !== 'undefined') {
    listen()
  }
}
