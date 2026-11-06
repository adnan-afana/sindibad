/**
 * Pure geometry for the grill → plate flight. No DOM access: callers pass measured rects.
 * Units: a mover image is 1 unit wide and `canvasAspect` units tall.
 */
import { MotionPathPlugin } from './gsap'
import type { Rect } from './measure'
import type { Motion, Mover, Piece } from '../data/types'

export interface Progress { lift: number; flight: number; settle: number; slide: number; spread: number }
export const startProgress = (): Progress => ({ lift: 0, flight: 0, settle: 0, slide: 0, spread: 0 })
export const endProgress = (): Progress => ({ lift: 1, flight: 1, settle: 1, slide: 1, spread: 1 })

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const rad = (deg: number) => (deg * Math.PI) / 180
function rotate(x: number, y: number, deg: number) {
  const c = Math.cos(rad(deg))
  const s = Math.sin(rad(deg))
  return { x: x * c - y * s, y: x * s + y * c }
}

type Point = { x: number; y: number }
type RawPath = Parameters<typeof MotionPathPlugin.getPositionOnPath>[0]

export interface Plan {
  rest: Point
  restRotation: number
  lifted: Point
  hover: Point
  final: Point
  finalScale: number
  finalRotation: number
  raw: RawPath
  /** per-piece offset (px at grill scale) and rotation when the pieces spread onto the plate */
  pieces: { dx: number; dy: number; rotation: number }[]
}

/**
 * Build the flight plan for one mover.
 * @param slot     grill slot (start anchor), px, track coordinates
 * @param plate    plate box, px, track coordinates
 * @param ends     end anchors (centre of each piece on the plate), px, track coordinates
 * @param viewport viewport size, px
 */
export function planFlight(
  mover: Mover, pieces: Piece[], slot: Rect, restRotation: number,
  plate: Rect, ends: Point[], viewport: { w: number; h: number }, motion: Motion,
): Plan {
  const aspect = mover.canvasAspect
  const atGrill = slot.w // px per unit on the grill
  const atPlate = plate.w * (mover.canvasWidth / 100) * (mover.plateScale ?? 1) // px per unit on the plate
  const rotation = mover.rotation
  const centre = { x: 0.5, y: aspect / 2 }
  const pieceCentres = pieces.map((p) => ({
    x: (p.rect.x + p.rect.w / 2) / 100,
    y: ((p.rect.y + p.rect.h / 2) / 100) * aspect,
  }))

  let sx = 0
  let sy = 0
  pieces.forEach((_, i) => {
    const r = rotate((pieceCentres[i].x - centre.x) * atPlate, (pieceCentres[i].y - centre.y) * atPlate, rotation)
    sx += ends[i].x - r.x
    sy += ends[i].y - r.y
  })
  const final = { x: sx / pieces.length, y: sy / pieces.length }

  const spread = pieces.map((p, i) => {
    const r = rotate(ends[i].x - final.x, ends[i].y - final.y, -rotation)
    return {
      dx: (r.x / atPlate - (pieceCentres[i].x - centre.x)) * atGrill,
      dy: (r.y / atPlate - (pieceCentres[i].y - centre.y)) * atGrill,
      rotation: p.finalRotation - rotation,
    }
  })

  const rest = { x: slot.left + slot.w / 2, y: slot.top + slot.h / 2 }
  const lifted = { x: rest.x, y: rest.y + (motion.lift.y / 100) * viewport.h }
  const hover = { x: final.x, y: final.y - 0.08 * plate.w }
  const points = [
    lifted,
    { x: lerp(lifted.x, hover.x, 0.5), y: lerp(lifted.y, hover.y, 0.5) - 0.04 * viewport.h },
    hover,
  ]
  const raw = MotionPathPlugin.arrayToRawPath(points, { curviness: motion.curviness })

  return {
    rest, restRotation, lifted, hover, final,
    finalScale: atPlate / atGrill, finalRotation: rotation, raw, pieces: spread,
  }
}

/** Keep a rotated box inside the viewport (8px margin). */
function keepInView(x: number, y: number, w: number, h: number, deg: number, vp: { w: number; h: number }) {
  const c = Math.abs(Math.cos(rad(deg)))
  const s = Math.abs(Math.sin(rad(deg)))
  const hw = (w * c + h * s) / 2
  const hh = (w * s + h * c) / 2
  const fit = (v: number, half: number, size: number) =>
    half * 2 + 16 >= size ? size / 2 : Math.min(size - 8 - half, Math.max(8 + half, v))
  return { x: fit(x, hw, vp.w), y: fit(y, hh, vp.h) }
}

export interface Pose { x: number; y: number; scale: number; rotation: number }

/**
 * Where a mover is at a given progress. `offsetY` converts track coordinates into viewport
 * coordinates (minus the camera travel); clamping happens in viewport space.
 */
export function poseAt(p: Progress, slot: Rect, plan: Plan, motion: Motion, vp: { w: number; h: number }, offsetY: number): Pose {
  const flight = clamp01(p.flight)
  const pos = MotionPathPlugin.getPositionOnPath(plan.raw, flight)
  const back = (1 - p.lift) * (1 - flight)
  let x = pos.x + back * (plan.rest.x - plan.lifted.x)
  let y = pos.y + back * (plan.rest.y - plan.lifted.y)
  const settle = clamp01(p.settle)
  x += (plan.final.x - plan.hover.x) * settle
  y += (plan.final.y - plan.hover.y) * settle
  y += offsetY

  let scale = lerp(lerp(1, motion.lift.scale, p.lift), plan.finalScale * 1.03, smoothstep(0.15, 1, flight))
  scale = lerp(scale, plan.finalScale, settle)
  const rotation = lerp(plan.restRotation, plan.finalRotation, smoothstep(0.1, 0.9, flight)) + Math.sin(Math.PI * flight) * 3

  const inView = smoothstep(0, 0.3, p.lift) * (1 - smoothstep(0.4, 1, settle))
  if (inView > 0) {
    const k = keepInView(x, y, slot.w * scale, slot.h * scale, rotation, vp)
    x = lerp(x, k.x, inView)
    y = lerp(y, k.y, inView)
  }
  return { x, y, scale, rotation }
}

/** Ease used for the skewer fading out while it slides away: smoothstep(0.15, 0.65) of power1.inOut. */
export const metalFadeEase = (slideEase: (t: number) => number) => (t: number) => smoothstep(0.15, 0.65, slideEase(t))

/**
 * Owner-mode: when the owner replaces a dish's food photo, all pieces collapse into a single
 * piece spanning their bounding box (same maths as the original implementation, in % units).
 */
export function piecesFor(mover: Mover, plateAspect: number, override?: string): Piece[] {
  if (!override) return mover.pieces
  const aspect = mover.canvasAspect
  const xs = mover.pieces.flatMap((p) => [p.rect.x, p.rect.x + p.rect.w])
  const ys = mover.pieces.flatMap((p) => [p.rect.y, p.rect.y + p.rect.h])
  const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
  // Everything in plate-width units: 1 mover unit = canvasWidth% × plateScale of the plate width.
  const unit = (mover.canvasWidth / 100) * (mover.plateScale ?? 1)
  const offset = (r: { x: number; y: number; w: number; h: number }) =>
    rotate(((r.x + r.w / 2) / 100 - 0.5) * unit, (((r.y + r.h / 2) / 100) * aspect - aspect / 2) * unit, mover.rotation)
  let fx = 0
  let fy = 0
  for (const p of mover.pieces) {
    const r = offset(p.rect)
    fx += p.final.x / 100 - r.x
    fy += p.final.y / 100 / plateAspect - r.y
  }
  const n = mover.pieces.length
  const d = offset(box)
  return [{
    src: override,
    rect: box,
    final: { x: (fx / n + d.x) * 100, y: (fy / n + d.y) * plateAspect * 100 },
    finalRotation: mover.rotation,
  }]
}
