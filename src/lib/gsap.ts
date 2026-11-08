/**
 * The single place GSAP plugins are registered. Import gsap / ScrollTrigger / SplitText
 * from here, never from 'gsap' directly, so registration happens exactly once.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin)

gsap.defaults({ ease: 'power2.out', duration: 0.8 })

// Mobile browsers resize the viewport when the address bar shows/hides; refreshing on that
// makes pinned scenes jump. Ignore those resizes.
ScrollTrigger.config({ ignoreMobileResize: true })

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'
export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

export { gsap, ScrollTrigger, SplitText, MotionPathPlugin }

/** One debounced ScrollTrigger.refresh for bursts of image loads (each refresh is a full layout pass).
 *  Skipped while the user is actively scrolling; runs once scrolling settles. */
let refreshTimer = 0
export function scheduleRefresh(delay = 250) {
  clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => {
    if (ScrollTrigger.isScrolling()) return scheduleRefresh(delay)
    ScrollTrigger.refresh()
  }, delay)
}
