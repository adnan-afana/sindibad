import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, FULL_MOTION } from './lib/gsap'
import { getLenis, initSmoothScroll, scrollToTarget } from './lib/smooth-scroll'
import { loadOwnerState, loadPublished } from './lib/owner-store'
import type { SceneModel } from './lib/scene-model'
import { useReveal } from './hooks/useReveal'
import { GrillToPlateScene } from './components/GrillToPlateScene'
import { MoreDishes } from './components/MoreDishes'
import { MoreSections, SiteFooter } from './components/Sections'

const OwnerEditor = lazy(() => import('./components/OwnerEditor'))
const EMPTY_MODEL: SceneModel = {}
const isOwnerMode = () => window.location.hash === '#owner'

/** Published image edits (public/assets/owner) for everyone; this browser's owner edits on top when switched on. */
// fetched right away, before the page's images queue up
const publishedEdits = isOwnerMode() ? null : loadPublished()
async function loadModel(): Promise<SceneModel> {
  const [pub, state] = await Promise.all([publishedEdits ?? loadPublished(), loadOwnerState()])
  const images = { ...pub.images }
  const adjust = { ...pub.adjust }
  if (state.active) {
    for (const [k, b] of Object.entries(state.images)) images[k] = URL.createObjectURL(b)
    Object.assign(adjust, state.adjust)
  }
  if (!Object.keys(images).length && !Object.keys(adjust).length) return {}
  return { local: { images, adjust }, browserEdits: state.active && (Object.keys(state.images).length > 0 || Object.keys(state.adjust).length > 0) }
}

function Site({ model }: { model: SceneModel }) {
  const root = useRef<HTMLElement>(null)
  useReveal(root, [model])

  // Smooth scrolling (skipped under reduced motion) + one refresh once fonts and images are ready.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(FULL_MOTION, () => initSmoothScroll())

    // Hold scrolling until the hero photo and fonts are ready, so measurements are final.
    getLenis()?.stop()
    const hero = document.querySelector<HTMLImageElement>('[data-hero-image]')
    // never hold scrolling for long: some mobile browsers are slow (or never answer) on fonts/decode
    const ready = Promise.race([
      Promise.all([document.fonts.ready, hero?.decode().catch(() => {})]),
      new Promise((r) => setTimeout(r, 1200)),
    ])
    let cancelled = false
    ready.then(() => {
      if (cancelled) return
      ScrollTrigger.refresh()
      getLenis()?.start()
    })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const pending = [...document.images].filter((img) => !img.complete)
    pending.forEach((img) => img.addEventListener('load', refresh, { once: true }))

    // Same-page anchors scroll smoothly through Lenis (#menu is handled by the scene).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]')
      const hash = a?.getAttribute('href')
      if (!a || !hash || hash === '#menu' || hash === '#owner' || hash === '#') return
      const target = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash)
      if (target === null) return
      e.preventDefault()
      scrollToTarget(target)
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelled = true
      window.removeEventListener('load', refresh)
      pending.forEach((img) => img.removeEventListener('load', refresh))
      document.removeEventListener('click', onClick)
      mm.revert()
    }
  }, [])

  return (
    <main ref={root}>
      <GrillToPlateScene model={model} />
      <MoreDishes model={model} />
      <MoreSections />
      <SiteFooter />
    </main>
  )
}

export default function App() {
  const [owner] = useState(isOwnerMode)
  // Render the site immediately; owner edits (if any) are applied once they load.
  const [model, setModel] = useState<SceneModel>(EMPTY_MODEL)

  // Switching between the site and owner mode reloads the page (as before).
  useEffect(() => {
    const onHash = () => isOwnerMode() !== owner && window.location.reload()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [owner])

  useEffect(() => {
    if (!owner) loadModel().then((m) => { if (m.local) setModel(m) }).catch(() => {})
  }, [owner])

  if (owner)
    return (
      <Suspense fallback={<div className="loading" aria-busy="true" />}>
        <OwnerEditor />
      </Suspense>
    )
  return (
    <>
      <Site model={model} />
      {model.browserEdits && (
        <p className="local-banner" role="status">
          Showing owner edits saved in this browser only. The published site is unchanged. <a href="#owner">Open owner mode</a>
        </p>
      )}
    </>
  )
}
