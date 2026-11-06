import { useLayoutEffect, type RefObject } from 'react'
import { gsap, SplitText, FULL_MOTION } from '../lib/gsap'

/**
 * Scroll reveals driven by data attributes inside `scope`:
 *  - data-split  → headline split into masked lines that slide up once when entering the screen
 *  - data-reveal → element fades and rises once when entering the screen
 * Reduced motion: nothing is hidden or animated (final state).
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    let mm: gsap.MatchMedia | undefined
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()
      mm.add(FULL_MOTION, () => {
        root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 100,
                duration: 0.9,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                // drop the masks afterwards so nothing (e.g. text-shadow) stays clipped
                onComplete: () => self.revert(),
              })
            },
          })
        })
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })
      })
    }, root)
    return () => {
      mm?.revert()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
