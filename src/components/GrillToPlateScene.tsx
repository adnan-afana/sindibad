import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap, ScrollTrigger, REDUCED_MOTION } from '../lib/gsap'
import { getLenis } from '../lib/smooth-scroll'
import { offsetRect, type Rect } from '../lib/measure'
import { metalFadeEase, planFlight, poseAt, startProgress, type Plan, type Progress } from '../lib/journey-math'
import {
  baseTransform, dishes, food, foodTransform, grillItems, grillLayout, landedStyle, moversFor,
  pieceStyle, plateBase, scenePieces, slotStyle, type SceneModel,
} from '../lib/scene-model'
import { assets, hero, imageSize, motion, platesSection } from '../data/scene'
import type { DishId, Mover, Piece, Window } from '../data/types'
import { FireEffects } from './FireEffects'
import { SiteHeader } from './SiteHeader'

/* ------------------------------------------------------------------------------------------ */
/* Markup. React renders this once; GSAP owns every moving value afterwards.                  */
/* ------------------------------------------------------------------------------------------ */

function FoodImage({ model, mover, piece, eager }: { model: SceneModel; mover: Mover; piece: Piece; eager?: boolean }) {
  return (
    <img src={piece.src} alt="" draggable={false} decoding="async" loading={eager ? 'eager' : 'lazy'} data-fixed-size
      style={{ transform: foodTransform(model, mover.dish) }} />
  )
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="absolute inset-0">
        <div className="grill-stage">
          {/* the still, lit grill sits underneath the live one, ready for the swap while scrolling */}
          <img className="grill-stage__lit" src={assets.grillLit} alt="" width={imageSize.grill[0]} height={imageSize.grill[1]}
            draggable={false} decoding="async" data-fixed-size />
          <img className="grill-stage__image" src={assets.grill} alt="" width={imageSize.grill[0]} height={imageSize.grill[1]}
            draggable={false} decoding="async" fetchPriority="high" data-hero-image />
          <FireEffects />
          {grillItems.map((item) => {
            const style = slotStyle(item.id)
            if (!style) return null
            // movers and the lid live in the food layer; here they only leave an invisible start anchor
            if (item.kind === 'mover' || item.kind === 'lid') return <div key={item.id} className="grill-slot" data-slot={item.id} style={style} />
            const axis = grillLayout.items[item.id]?.axis
            return (
              <div key={item.id} className={`grill-item grill-item--${item.kind}`} style={axis ? { ...style, transform: `rotate(${axis}deg)` } : style}>
                {item.kind === 'skewer' && <img src={item.metal} alt="" draggable={false} decoding="async" />}
                <img src={item.kind === 'skewer' ? item.food : item.image} alt={item.alt ?? ''} draggable={false} decoding="async" />
              </div>
            )
          })}
        </div>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <h1 id="hero-title" className="hero__headline" data-headline data-split>{hero.headline}</h1>
    </section>
  )
}

function PlateCard({ model, dish }: { model: SceneModel; dish: (typeof dishes)[number] }) {
  const plate = food.plates[dish.id]
  const w = 1100
  const h = Math.round(w / plate.aspect)
  return (
    <article className="flex min-w-0 flex-col items-center text-center" aria-labelledby={`dish-${dish.id}`}>
      <div className="plate-card__plate" data-plate={dish.id} style={{ aspectRatio: `${plate.aspect}` }}>
        <div className="absolute inset-0 will-change-transform" data-plate-visual={dish.id}>
          <img className="absolute inset-0 size-full object-contain" src={plateBase(model, dish.id)} alt="" width={w} height={h} draggable={false} decoding="async" data-fixed-size
            style={{ transform: baseTransform(model, dish.id) }} />
          <div className="absolute inset-0 opacity-0" data-landed={dish.id}>
            {moversFor(dish.id).map(([id, mover]) =>
              scenePieces(model, mover).map((p, i) => (
                <div key={`${id}-${i}`} className="plate-card__piece" style={landedStyle(mover, p)}>
                  <FoodImage model={model} mover={mover} piece={p} eager />
                </div>
              )),
            )}
          </div>
          <div className="steam" data-steam={dish.id} aria-hidden="true"><span /><span /><span /><span /></div>
        </div>
        {/* invisible end anchors: where each travelling piece lands, placed with % */}
        {moversFor(dish.id).map(([id, mover]) =>
          scenePieces(model, mover).map((p, i) => (
            <span key={`${id}-${i}`} className="anchor" data-end={`${id}:${i}`} style={{ left: `${p.final.x}%`, top: `${p.final.y}%` }} />
          )),
        )}
        <span className="visually-hidden">{dish.name}, plated</span>
      </div>
      <div className="plate-card__body mt-[clamp(0.75rem,2vh,1.5rem)] flex flex-col items-center gap-[0.6rem]">
        <h3 id={`dish-${dish.id}`}>{dish.name}</h3>
        {dish.price && <p className="plate-card__price">{dish.price}</p>}
        {dish.description && <p className="plate-card__description">{dish.description}</p>}
        <a className="order-button order-button--small" href={hero.order.href}>{hero.order.label}</a>
      </div>
    </article>
  )
}

function FoodLayer({ model }: { model: SceneModel }) {
  return (
    <div className="food-layer" aria-hidden="true" data-food-layer>
      {grillItems.map((item) => {
        if (item.kind === 'lid')
          return (
            <div key={item.id} className="food-layer__lid" data-lid={item.id}>
              <div className="food-layer__lid-hinge" data-lid-hinge>
                <img src={item.image} alt="" draggable={false} decoding="async" />
              </div>
            </div>
          )
        const mover = food.movers[item.id]
        if (item.kind !== 'mover' || !mover) return null
        return (
          <div key={item.id} className="food" data-mover={item.id}>
            {mover.metal && <img className="food__metal" data-metal src={mover.metal} alt="" draggable={false} decoding="async" />}
            {scenePieces(model, mover).map((p, i) => (
              <div key={i} className="food__piece" data-piece={i} style={pieceStyle(p)}>
                <FoodImage model={model} mover={mover} piece={p} eager />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Animation.                                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** Add a tween over a [start, end] window of a 0–1 timeline (same clamping as the original). */
function at(tl: gsap.core.Timeline, target: gsap.TweenTarget, vars: gsap.TweenVars, w: Window, offset = 0) {
  const start = Math.min(0.999, Math.max(0, w[0] + offset))
  const end = Math.min(1, Math.max(start + 0.001, w[1] + offset))
  tl.to(target, { ...vars, duration: end - start }, start)
}

/** Time inside window `w` at which `ease` first reaches `value`. */
function timeAtEase(ease: string, value: number, w: Window) {
  const fn = gsap.parseEase(ease)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (fn(mid) < value) lo = mid
    else hi = mid
  }
  return w[0] + hi * (w[1] - w[0])
}

interface MoverRefs {
  id: string
  mover: Mover
  pieces: Piece[]
  el: HTMLElement
  metal: HTMLElement | null
  pieceEls: HTMLElement[]
  slotEl: HTMLElement
  plateEl: HTMLElement
  endEls: HTMLElement[]
  restRotation: number
  /** measured on refresh */
  slot: Rect
  plan: Plan | null
  set: Record<'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY', (v: number) => void>
}

function setupScene(model: SceneModel, scope: HTMLElement, foodLayer: HTMLElement, headerLayer: HTMLElement) {
  const overlay = foodLayer
  const journey = scope.querySelector<HTMLElement>('[data-journey]')!
  const track = scope.querySelector<HTMLElement>('[data-track]')!
  const headline = scope.querySelector<HTMLElement>('[data-headline]')
  const tl = motion.timeline

  const movers: MoverRefs[] = Object.entries(food.movers).flatMap(([id, mover]) => {
    const el = overlay.querySelector<HTMLElement>(`[data-mover="${id}"]`)
    const slotEl = scope.querySelector<HTMLElement>(`[data-slot="${id}"]`)
    const plateEl = scope.querySelector<HTMLElement>(`[data-plate="${mover.dish}"]`)
    if (!el || !slotEl || !plateEl) return []
    const pieceEls = [...el.querySelectorAll<HTMLElement>('[data-piece]')]
    const endEls = pieceEls.map((_, i) => plateEl.querySelector<HTMLElement>(`[data-end="${id}:${i}"]`)!)
    const q = (prop: string, unit?: string) => gsap.quickSetter(el, prop, unit) as (v: number) => void
    return [{
      id, mover, pieces: scenePieces(model, mover), el,
      set: { x: q('x', 'px'), y: q('y', 'px'), rotation: q('rotation', 'deg'), scaleX: q('scaleX'), scaleY: q('scaleY') }, metal: el.querySelector<HTMLElement>('[data-metal]'), pieceEls, slotEl, plateEl, endEls,
      restRotation: grillLayout.items[id]?.axis ?? 0, slot: { left: 0, top: 0, w: 0, h: 0 }, plan: null,
    }]
  })
  const lids = grillItems.filter((i) => i.kind === 'lid').flatMap((item) => {
    const el = overlay.querySelector<HTMLElement>(`[data-lid="${item.id}"]`)
    const slotEl = scope.querySelector<HTMLElement>(`[data-slot="${item.id}"]`)
    return el && slotEl ? [{ el, hinge: el.querySelector<HTMLElement>('[data-lid-hinge]')!, slotEl, slot: { left: 0, top: 0, w: 0, h: 0 } as Rect }] : []
  })
  const plates = dishes.map((d) => ({
    id: d.id as DishId,
    visual: scope.querySelector<HTMLElement>(`[data-plate-visual="${d.id}"]`),
    landed: scope.querySelector<HTMLElement>(`[data-landed="${d.id}"]`),
    steam: scope.querySelector<HTMLElement>(`[data-steam="${d.id}"]`),
  }))

  // ---- measurement (on refresh only; offsetLeft/offsetTop so transforms never leak in) ----
  const vp = { w: window.innerWidth, h: window.innerHeight }
  let travel = 0 // how far the camera moves the track up, px
  // The animated plates sit centred in a full-screen section, which leaves empty space under them.
  // The rows of more plates that follow are pulled up into that space (--plates-tail), so the
  // gap under the animated row matches the gap between the other rows.
  const platesSection = scope.querySelector<HTMLElement>('.plates')
  const platesGrid = platesSection?.querySelector<HTMLElement>('.plates__grid')
  const measureTail = () => {
    const more = document.querySelector<HTMLElement>('.more-plates .plates__grid')
    if (!platesSection || !platesGrid || !more) return
    const tail = platesSection.offsetHeight - (platesGrid.offsetTop + platesGrid.offsetHeight)
    const gap = parseFloat(getComputedStyle(more).rowGap) || 0
    document.documentElement.style.setProperty('--plates-tail', `${Math.max(0, Math.round(tail - gap))}px`)
  }

  const measure = () => {
    vp.w = window.innerWidth
    vp.h = window.innerHeight
    measureTail()
    travel = Math.max(0, track.offsetHeight - vp.h)
    for (const m of movers) {
      m.slot = offsetRect(m.slotEl, journey)
      const plate = offsetRect(m.plateEl, journey)
      const ends = m.endEls.map((e) => { const r = offsetRect(e, journey); return { x: r.left, y: r.top } })
      m.plan = planFlight(m.mover, m.pieces, m.slot, m.restRotation, plate, ends, vp, motion)
      gsap.set(m.el, { width: m.slot.w, height: m.slot.h, xPercent: -50, yPercent: -50 })
    }
    for (const l of lids) {
      l.slot = offsetRect(l.slotEl, journey)
      gsap.set(l.el, { width: l.slot.w, height: l.slot.h, xPercent: -50, yPercent: -50, x: l.slot.left + l.slot.w / 2 })
      gsap.set(l.hinge, { transformPerspective: l.slot.h * 1.6 })
    }
  }
  let pin: ScrollTrigger | null = null

  // ---- rendering of a mover pose (transform only) ----
  const renderMover = (m: MoverRefs, p: Progress) => {
    if (!m.plan) return
    // after the pin ends, the scene scrolls away: follow it while the scrub catches up
    let journeyTop = 0
    if (pin && p.flight >= 1) {
      const scrolled = getLenis()?.animatedScroll ?? window.scrollY
      journeyTop = -Math.max(0, scrolled - pin.end)
    }
    const pose = poseAt(p, m.slot, m.plan, motion, vp, journeyTop - p.flight * travel)
    m.set.x(pose.x)
    m.set.y(pose.y)
    m.set.rotation(pose.rotation)
    m.set.scaleX(pose.scale)
    m.set.scaleY(pose.scale)
  }

  let mm: gsap.MatchMedia | undefined
  const ctx = gsap.context(() => {
  mm = gsap.matchMedia()
  mm.add({ isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767px)', reduceMotion: REDUCED_MOTION }, (context) => {
    const { isDesktop, reduceMotion } = context.conditions as { isDesktop: boolean; reduceMotion: boolean }

    if (reduceMotion) {
      // Still image of the final state: plates filled, grill food gone, lid closed.
      journey.dataset.mode = overlay.dataset.mode = headerLayer.dataset.mode = 'static'
      measure()
      for (const m of movers) gsap.set(m.el, { visibility: 'hidden' })
      for (const l of lids) gsap.set(l.el, { y: l.slot.top + l.slot.h / 2, zIndex: 2 })
      for (const pl of plates) {
        gsap.set(pl.landed, { opacity: 1 })
        gsap.set(pl.steam, { opacity: 1 })
      }
      return () => {
        delete journey.dataset.mode
      }
    }

    journey.dataset.mode = overlay.dataset.mode = headerLayer.dataset.mode = 'cinematic'
    const length = isDesktop ? motion.scrollLength.desktop : motion.scrollLength.mobile
    const end = () => `+=${window.innerHeight * length}`
    // Every timeline follows the pin's own scroll range (function-based, recomputed on refresh).
    const trigger = (extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({
      trigger: journey, start: () => pin?.start ?? 0, end: () => pin?.end ?? 0, scrub: motion.scrub, invalidateOnRefresh: true, ...extra,
    })

    ScrollTrigger.addEventListener('refreshInit', measure)
    measure()

    // Pin (no animation of its own). It also rests the fire: the live flame layers are the most
    // expensive thing on the page to draw, so once the scene starts moving they are swapped for a
    // still photo of the lit grill (assets.grillLit), and switched off entirely when the grill has
    // left the screen. Scrolling back to the top brings the live fire back.
    const fireState = (progress: number) => {
      const next = progress >= motion.fire.off ? 'off' : progress >= motion.fire.pause ? 'paused' : ''
      if ((journey.dataset.fire ?? '') === next) return
      if (next) journey.dataset.fire = next
      else delete journey.dataset.fire
    }
    pin = ScrollTrigger.create({
      id: 'journey', trigger: journey, start: 'top top', end, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => fireState(self.progress),
      onRefresh: (self) => fireState(self.progress),
    })

    const seal = (t: gsap.core.Timeline) => t.set({}, {}, 1) // every timeline spans exactly 0–1

    // Camera: the track (hero + plates) slides up during the flight. The fixed header rides along.
    for (const el of [track, headerLayer]) {
      const t = gsap.timeline({ scrollTrigger: trigger() })
      at(t, el, { y: () => -travel, ease: motion.eases.flight }, tl.flight)
      seal(t)
    }

    // Headline fades as the lid opens.
    if (headline) {
      const t = gsap.timeline({ scrollTrigger: trigger() })
      at(t, headline, { opacity: 0, ease: 'power1.out' }, tl.headline)
      seal(t)
    }

    // Basket lid: hinges open, then rides up with the camera.
    for (const l of lids) {
      const t = gsap.timeline({ scrollTrigger: trigger() })
      t.fromTo(l.el, { y: () => l.slot.top + l.slot.h / 2 }, { y: () => l.slot.top + l.slot.h / 2 - travel, ease: motion.eases.flight, duration: tl.flight[1] - tl.flight[0] }, tl.flight[0])
      t.fromTo(l.hinge, { rotationX: 0 }, { rotationX: motion.lidAngle, ease: 'power2.inOut', duration: tl.open[1] - tl.open[0] }, tl.open[0])
      t.fromTo(l.el, { zIndex: 2 }, { zIndex: 0, duration: 0, immediateRender: false }, timeAtEase('power2.inOut', 0.45, tl.open))
      seal(t)
    }

    // One timeline per travelling food item.
    movers.forEach((m, index) => {
      const p = startProgress()
      const t = gsap.timeline({
        scrollTrigger: trigger({ onRefresh: () => renderMover(m, p) }),
        onUpdate: () => renderMover(m, p),
      })
      const liftOffset = m.mover.dish === 'chicken' ? tl.open[1] - tl.lift[0] - 0.02 : index * motion.stagger
      at(t, p, { lift: 1, ease: motion.eases.lift }, tl.lift, Math.max(0, liftOffset))
      at(t, p, { flight: 1, ease: motion.eases.flight }, tl.flight)
      at(t, p, { settle: 1, ease: motion.eases.settle }, tl.settle)
      if (m.metal) {
        const slideEase = gsap.parseEase(motion.eases.slide)
        at(t, m.metal, { y: () => m.slot.h * 0.6, ease: motion.eases.slide }, tl.slide)
        at(t, m.metal, { autoAlpha: 0, ease: metalFadeEase(slideEase) }, tl.slide)
      }
      if (m.pieceEls.length > 1) {
        m.pieceEls.forEach((el, i) => {
          at(t, el, {
            x: () => m.plan?.pieces[i].dx ?? 0,
            y: () => m.plan?.pieces[i].dy ?? 0,
            rotation: () => m.plan?.pieces[i].rotation ?? 0,
            ease: motion.eases.spread,
          }, tl.spread)
        })
      }
      // hand over to the plated photo, then hide the traveller
      t.fromTo(m.el, { visibility: 'visible' }, { visibility: 'hidden', duration: 0, immediateRender: false }, tl.handoff[1])
      seal(t)
      renderMover(m, p)
    })

    // Plates: a soft "landing" squash, steam, and the cross-fade to the plated photo.
    const settleEase = gsap.parseEase(motion.eases.settle)
    for (const pl of plates) {
      const t = gsap.timeline({ scrollTrigger: trigger() })
      at(t, pl.visual, { scale: 0.988, ease: (x: number) => Math.sin(Math.PI * settleEase(x)) }, tl.settle)
      at(t, pl.steam, { opacity: 1, ease: motion.eases.settle }, tl.settle)
      at(t, pl.landed, { opacity: 1, ease: 'none' }, tl.handoff)
      seal(t)
    }

    // "Menu" / "Order now" jump to the end of the scene, where the plates are full.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="#menu"]')
      if (!a || !pin) return
      e.preventDefault()
      e.stopPropagation()
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(pin.end)
      else window.scrollTo({ top: pin.end })
    }
    document.addEventListener('click', onClick)

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure)
      document.removeEventListener('click', onClick)
      pin = null
      delete journey.dataset.mode
      delete journey.dataset.fire
    }
  })
  }, scope)

  return () => {
    mm?.revert()
    ctx.revert()
    document.documentElement.style.removeProperty('--plates-tail')
  }
}

/* ------------------------------------------------------------------------------------------ */

export function GrillToPlateScene({ model }: { model: SceneModel }) {
  const scope = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!scope.current || !overlay.current || !header.current) return
    const foodLayer = overlay.current.querySelector<HTMLElement>('[data-food-layer]')!
    const revert = setupScene(model, scope.current, foodLayer, header.current)
    ScrollTrigger.refresh()
    return revert
  }, [model])

  return (
    <div ref={scope} className="contents">
      <div className="journey relative" data-journey>
        <div className="journey__track" data-track>
          <Hero />
          <section className="plates" id="menu" aria-labelledby="plates-title">
            <h2 id="plates-title" className="visually-hidden">{platesSection.title}</h2>
            <div className="plates__grid">
              {dishes.map((d) => <PlateCard key={d.id} model={model} dish={d} />)}
            </div>
          </section>
        </div>
      </div>
      {createPortal(
        <>
          <div ref={overlay} className="contents"><FoodLayer model={model} /></div>
          <div ref={header} className="header-layer"><SiteHeader /></div>
        </>,
        document.body,
      )}
    </div>
  )
}
