import type { DishId, GrillItem, Motion } from './types'

export const assets = {
  grill: 'assets/hero/grill-hero.webp',
  /** The grill with the fire baked in at its average glow. Shown while the scene moves, in place of the live fire. */
  grillLit: 'assets/hero/grill-hero-lit.webp',
  flames: 'assets/hero/flames.webp',
  logo: 'assets/brand/logo.webp',
} as const

/** Intrinsic image sizes, used for width/height attributes (prevents layout shift). */
export const imageSize = {
  grill: [1672, 941],
  logo: [1100, 553],
  plate: [1100, 956],
} as const

export const hero = {
  headline: 'FROM OUR GRILL TO YOUR PLATE.',
  logoAlt: 'Sindibad Grill & BBQ',
  nav: [
    { label: 'Menu', href: '#menu' },
    { label: 'Our Story', href: '#contact' },
    { label: 'Contact', href: '#contact' },
  ],
  order: { label: 'Order Now', href: '#menu' },
}

export const platesSection = { title: 'Our plates' }
export const closing = { title: 'Reserve your table', button: 'Book a table' }

export const dishes: { id: DishId; name: string; price?: string; description?: string }[] = [
  { id: 'chicken', name: 'Half Chicken' },
  { id: 'tawook', name: 'Shish Tawook' },
  { id: 'kebab', name: 'Kebab' },
]

/**
 * More plates, shown in rows under the three animated ones. Nothing flies onto these.
 * PLACEHOLDERS: every entry is the shish tawook plate until the real dishes arrive.
 * To add a dish: put a transparent plate photo in public/assets/plates/ and add a line here
 * (aspect = image width / height). Add or remove lines freely; rows fill three at a time.
 */
export const morePlates: { name: string; image: string; aspect: number; price?: string }[] = [
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
  { name: 'Shish Tawook', image: 'assets/plates/tawook-reference.webp', aspect: 1100 / 962 },
]

/** Back-to-front order of everything on the grill. */
export const grillItems: GrillItem[] = [
  { id: 'basket-base', kind: 'prop', image: 'assets/grill/basket-base.webp' },
  { id: 'chicken', kind: 'mover', alt: 'Half chicken' },
  { id: 'basket-lid', kind: 'lid', image: 'assets/grill/basket-lid.webp' },
  { id: 'tawook-1', kind: 'skewer', food: 'assets/food/tawook-1-food.webp', metal: 'assets/food/tawook-1-metal.webp' },
  { id: 'tawook-2', kind: 'mover' },
  { id: 'tawook-3', kind: 'mover' },
  { id: 'kebab-1', kind: 'skewer', food: 'assets/food/kebab-1-food.webp', metal: 'assets/food/kebab-1-metal.webp' },
  { id: 'kebab-2', kind: 'skewer', food: 'assets/food/kebab-2-food.webp', metal: 'assets/food/kebab-2-metal.webp' },
  { id: 'kebab-3', kind: 'mover' },
  { id: 'kebab-4', kind: 'mover' },
]

export const motion: Motion = {
  scrub: 0.6,
  scrollLength: { desktop: 2.6, mobile: 2.8 },
  lift: { y: -3, scale: 1.04 },
  curviness: 0.6,
  stagger: 0.008,
  lidAngle: 74,
  /** Scene progress at which the fire holds still (camera starts moving) and switches off (grill off screen). */
  fire: { pause: 0.01, off: 0.5 },
  timeline: {
    headline: [0, 0.1],
    open: [0, 0.1],
    lift: [0.04, 0.12],
    flight: [0.1, 0.62],
    settle: [0.62, 0.7],
    slide: [0.7, 0.8],
    spread: [0.74, 0.86],
    handoff: [0.9, 0.94],
  },
  eases: {
    lift: 'power2.out',
    flight: 'power1.inOut',
    settle: 'power2.out',
    slide: 'power1.inOut',
    spread: 'power2.inOut',
  },
}

/** Ambient fire: rising embers (x in %, seconds). */
export const embers = [
  { x: 18, delay: 0, dur: 3.4 }, { x: 27, delay: 1.6, dur: 4.1 }, { x: 35, delay: 0.7, dur: 3.1 },
  { x: 42, delay: 2.4, dur: 3.8 }, { x: 49, delay: 1.1, dur: 4.4 }, { x: 55, delay: 3, dur: 3.3 },
  { x: 61, delay: 0.3, dur: 3.9 }, { x: 68, delay: 2, dur: 3.5 }, { x: 74, delay: 1.3, dur: 4.2 },
  { x: 81, delay: 2.8, dur: 3.6 }, { x: 31, delay: 3.6, dur: 4 }, { x: 64, delay: 4.1, dur: 3.2 },
]

/** Ambient fire: 30 flame tongues, deterministic pseudo-random (x, h, w in %). */
export const flameTongues = Array.from({ length: 30 }, (_, t) => {
  const n = (k: number) => (((Math.sin((t + 1) * k) * 43758.5453) % 1) + 1) % 1
  return { x: 1 + t * 3.25 + n(1.7) * 2, h: 55 + n(2.3) * 45, w: 2.6 + n(3.1) * 2.2, delay: -n(4.7) * 2, dur: 0.8 + n(5.9) * 0.7 }
})
