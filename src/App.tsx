import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, FULL_MOTION } from './lib/gsap'
import { getLenis, initSmoothScroll, scrollToTarget } from './lib/smooth-scroll'
import { loadOwnerState } from './lib/owner-store'
import type { SceneModel } from './lib/scene-model'
import { useReveal } from './hooks/useReveal'
import { GrillToPlateScene } from './components/GrillToPlateScene'
import { Closing } from './components/Closing'

const OwnerEditor = lazy(() => import('./components/OwnerEditor'))
const isOwnerMode = () => window.location.hash === '#owner'

/** Owner edits (this browser only) are shown on the site when switched on in owner mode. */
async function loadModel(): Promise<SceneModel> {
  const state = await loadOwnerState()
  if (!state.active) return {}
  const images = Object.fromEntries(Object.entries(state.images).map(([k, b]) => [k, URL.createObjectURL(b)]))
  return { local: { images, adjust: state.adjust } }
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
    const ready = Promise.all([document.fonts.ready, hero?.decode().catch(() => {})])
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
      <Closing />
    </main>
  )
}

export default function App() {
  const [owner] = useState(isOwnerMode)
  const [model, setModel] = useState<SceneModel | null>(null)

  // Switching between the site and owner mode reloads the page (as before).
  useEffect(() => {
    const onHash = () => isOwnerMode() !== owner && window.location.reload()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [owner])

  useEffect(() => {
    if (!owner) loadModel().then(setModel)
  }, [owner])

  if (owner)
    return (
      <Suspense fallback={<div className="loading" aria-busy="true" />}>
        <OwnerEditor />
      </Suspense>
    )
  if (!model) return <div className="loading" aria-busy="true" />
  return (
    <>
      <Site model={model} />
      {model.local && (
        <p className="local-banner" role="status">
          Showing owner edits saved in this browser only. The published site is unchanged. <a href="#owner">Open owner mode</a>
        </p>
      )}
    </>
  )
}
