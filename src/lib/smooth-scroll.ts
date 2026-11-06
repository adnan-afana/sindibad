/**
 * Lenis smooth scrolling, driven by GSAP's ticker so Lenis and ScrollTrigger share one clock.
 * Skipped entirely when the user prefers reduced motion (native scrolling is used instead).
 */
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

export const getLenis = () => lenis

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}

  lenis = new Lenis({ autoRaf: false })
  const instance = lenis
  instance.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    instance.off('scroll', ScrollTrigger.update)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Scroll to a page offset or element: through Lenis when it runs, natively otherwise. */
export function scrollToTarget(target: number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target)
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top })
}
