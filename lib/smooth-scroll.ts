import Lenis from 'lenis'

/**
 * The page's weight. Lenis eases the window toward where a gesture asked for
 * instead of jumping there, and coasts to a stop when the gesture ends.
 *
 * It drives the REAL window scroll rather than a transform, which is the
 * reason it can live here at all: the film's pinned stage is `position:
 * sticky`, its progress comes from motion's useScroll, and both the snap and
 * the nav read getBoundingClientRect. None of that knows this exists.
 *
 * Touch is left alone (`syncTouch` off): a phone already has momentum, and
 * smoothing it a second time fights the platform.
 *
 * The film keeps the wheel. While its stage is pinned it turns one gesture
 * into one project and swallows the inertia tail, which is the exact
 * opposite of what this does, so it claims the wheel through `claimWheel`
 * and Lenis stands down for as long as it holds it. Standing down is
 * `virtualScroll` returning false - NOT `stop()`, which preventDefaults the
 * event and would lock the reader inside the film; the film deliberately
 * leaves both its edges open to a native scroll out.
 */
let lenis: Lenis | null = null
let owner: (() => boolean) | null = null
let owned = false

/** Take the wheel while `held()` is true. Returns the release. */
export function claimWheel(held: () => boolean) {
  owner = held
  return () => {
    if (owner === held) owner = null
  }
}

export const getLenis = () => lenis

export function startSmoothScroll() {
  if (lenis) return () => {}
  const l = new Lenis({
    lerp: 0.06, // well below the 0.1 default: the page takes its time
    smoothWheel: true,
    syncTouch: false,
    // evaluated on a gesture, never per frame - `held` measures the stage,
    // and a layout read every frame is not worth the hand-off
    virtualScroll: () => {
      const now = owner?.() ?? false
      if (now !== owned) {
        owned = now
        // drop any ease still in flight, so the film does not inherit a
        // target from the scroll that carried the reader into it. An
        // immediate scrollTo to where the page already is IS the cancel;
        // reset() is private, and stop() would lock the wheel.
        if (now) lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
      }
      return !now
    },
  })
  lenis = l
  let frame = requestAnimationFrame(function raf(t: number) {
    l.raf(t)
    frame = requestAnimationFrame(raf)
  })
  return () => {
    cancelAnimationFrame(frame)
    l.destroy()
    lenis = null
    owned = false
  }
}
