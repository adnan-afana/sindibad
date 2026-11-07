import type { DishId, GrillItem, Motion } from './types'

export const assets = {
  grill: 'assets/hero/grill-hero.webp',
  flames: 'assets/hero/flames.webp',
  /** smoke lifted out of the grill photo (top 22.5% of it), animated on its own */
  smoke: 'assets/hero/smoke.webp',
  logo: 'assets/brand/logo.webp',
  /** the flame from the logo, used on the price */
  logoFlame: 'assets/brand/logo-flame.webp',
} as const

/** Intrinsic image sizes, used for width/height attributes (prevents layout shift). */
export const imageSize = {
  grill: [1672, 941],
  logo: [514, 236],
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
  /** friendlier call-to-action on each dish card */
  cardCta: 'Enjoy it now',
}

export const platesSection = { title: 'Our plates' }
export const closing = { title: 'Reserve your table', button: 'Book a table' }

/** Prices and descriptions are PLACEHOLDERS — replace with the real menu. Descriptions: 5 words max. */
export const dishes: { id: DishId; name: string; price?: string; description?: string }[] = [
  { id: 'chicken', name: 'Half Chicken', price: '18.99', description: 'Charcoal-grilled with garlic toum' },
  { id: 'tawook', name: 'Shish Tawook', price: '17.99', description: 'Marinated chicken skewers, rice' },
  { id: 'kebab', name: 'Kebab', price: '18.99', description: 'Seasoned beef kafta, flame-grilled' },
]

/** Shown as a badge in the hero. */
export const halal = { label: '100% Halal', title: 'All our meat is halal' }

/**
 * Opening hours (24h clock, restaurant's local time). PLACEHOLDERS — replace with the real hours.
 * 0 = Sunday … 6 = Saturday. `close` past midnight is fine (e.g. '01:00').
 */
export const openingHours = {
  timeZone: 'America/Toronto',
  days: {
    0: { open: '12:00', close: '22:00' },
    1: { open: '11:00', close: '22:00' },
    2: { open: '11:00', close: '22:00' },
    3: { open: '11:00', close: '22:00' },
    4: { open: '11:00', close: '22:00' },
    5: { open: '11:00', close: '23:00' },
    6: { open: '11:00', close: '23:00' },
  } as Record<number, { open: string; close: string } | null>,
}

/** Smoke puffs drifting up from the grill (x in %, seconds). */
export const smoke = [
  { x: 6, delay: 0, dur: 7.5 }, { x: 20, delay: 2.4, dur: 8.5 }, { x: 34, delay: 1.1, dur: 7 },
  { x: 48, delay: 3.6, dur: 9 }, { x: 60, delay: 0.6, dur: 7.8 }, { x: 72, delay: 2.9, dur: 8.2 },
  { x: 84, delay: 4.4, dur: 7.2 },
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
