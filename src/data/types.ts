export type DishId = 'chicken' | 'tawook' | 'kebab'

/** A box in % of its container. */
export interface PctBox { left: number; top: number; width: number; height: number }

export interface GrillLayout {
  aspect: number
  items: Record<string, { box: PctBox; axis?: number }>
}

export interface Piece {
  src: string
  /** % of the mover image */
  rect: { x: number; y: number; w: number; h: number }
  /** piece centre on the finished plate, % of the plate image */
  final: { x: number; y: number }
  finalRotation: number
}

export interface Mover {
  dish: DishId
  canvasWidth: number
  canvasAspect: number
  metal: string | null
  rotation: number
  plateScale?: number
  pieces: Piece[]
}

export interface Plate { aspect: number; base: string; reference: string }

export interface FoodLayout {
  plates: Record<DishId, Plate>
  movers: Record<string, Mover>
}

export type GrillItem =
  | { id: string; kind: 'prop' | 'lid'; image: string; alt?: string }
  | { id: string; kind: 'skewer'; food: string; metal: string; alt?: string }
  | { id: string; kind: 'mover'; alt?: string }

/** [start, end] as a fraction (0–1) of the pinned scroll distance. */
export type Window = [number, number]

export interface Motion {
  scrub: number
  /** pinned scroll length in viewport heights */
  scrollLength: { desktop: number; mobile: number }
  /** lift: y in % of viewport height, scale multiplier */
  lift: { y: number; scale: number }
  curviness: number
  stagger: number
  lidAngle: number
  fire: { pause: number; off: number }
  timeline: Record<'headline' | 'open' | 'lift' | 'flight' | 'settle' | 'slide' | 'spread' | 'handoff', Window>
  eases: Record<'lift' | 'flight' | 'settle' | 'slide' | 'spread', string>
}

/** Owner-mode overrides (stored in this browser only). */
export interface Adjust { scale: number; x: number; y: number; rotation: number }
export interface LocalOverrides { images: Record<string, string>; adjust: Record<string, Adjust> }
