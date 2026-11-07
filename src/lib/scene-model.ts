/** Content + layout data assembled once (with optional owner overrides) and passed down. */
import { food } from '../data/food'
import { grillLayout } from '../data/grill'
import { dishes, grillItems } from '../data/scene'
import type { DishId, LocalOverrides, Mover, Piece } from '../data/types'
import { piecesFor } from './journey-math'
import { adjustTransform, baseKey, foodKey } from './owner-store'

export interface SceneModel {
  /** true when this browser's unpublished owner edits are being shown */
  browserEdits?: boolean
  local?: LocalOverrides
}

export const moversFor = (dish: DishId) => Object.entries(food.movers).filter(([, m]) => m.dish === dish)

export function scenePieces(model: SceneModel, mover: Mover): Piece[] {
  return piecesFor(mover, food.plates[mover.dish].aspect, model.local?.images[foodKey(mover.dish)])
}
export const foodTransform = (model: SceneModel, dish: DishId) => adjustTransform(model.local?.adjust[foodKey(dish)])
export const baseTransform = (model: SceneModel, dish: DishId) => adjustTransform(model.local?.adjust[baseKey(dish)])
export const plateBase = (model: SceneModel, dish: DishId) => model.local?.images[baseKey(dish)] ?? food.plates[dish].base

/** Grill slot box as inline % styles. */
export function slotStyle(id: string) {
  const item = grillLayout.items[id]
  if (!item) return undefined
  const b = item.box
  return { left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%`, height: `${b.height}%` }
}

/** Piece box inside its mover image, as % styles. */
export const pieceStyle = (p: Piece) => ({ left: `${p.rect.x}%`, top: `${p.rect.y}%`, width: `${p.rect.w}%`, height: `${p.rect.h}%` })

/** Piece box on the finished plate, as % styles. */
export function landedStyle(mover: Mover, p: Piece) {
  const plateAspect = food.plates[mover.dish].aspect
  const unit = (mover.canvasWidth / 100) * (mover.plateScale ?? 1) // plate widths per mover unit
  const w = (p.rect.w / 100) * unit * 100 // % of plate width
  const h = (p.rect.h / 100) * mover.canvasAspect * unit * plateAspect * 100 // % of plate height
  return { left: `${p.final.x - w / 2}%`, top: `${p.final.y - h / 2}%`, width: `${w}%`, height: `${h}%`, transform: `rotate(${p.finalRotation}deg)` }
}

export { dishes, grillItems, food, grillLayout }
