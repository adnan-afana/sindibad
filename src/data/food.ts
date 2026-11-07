/**
 * Plates and the food that travels to them.
 * All positions are percentages so images can be swapped without touching animation code:
 * - plate.aspect: plate image width / height
 * - mover.canvasWidth: the mover image's width as % of its plate's width (at plateScale 1)
 * - mover.canvasAspect: mover image height / width
 * - piece.rect: % of the mover image (x, y, w, h); piece.final: piece centre as % of the plate image
 */
import type { FoodLayout } from './types'

export const food: FoodLayout = {
  plates: {
    kebab: { aspect: 1100 / 956, base: 'assets/plates/kebab-base.webp', reference: 'assets/plates/kebab-reference.webp' },
    tawook: { aspect: 1100 / 962, base: 'assets/plates/tawook-base.webp', reference: 'assets/plates/tawook-reference.webp' },
    chicken: { aspect: 1100 / 956, base: 'assets/plates/chicken-base.webp', reference: 'assets/plates/chicken-reference.webp' },
  },
  movers: {
    'kebab-3': {
      dish: 'kebab',
      canvasWidth: 19.3636,
      canvasAspect: 1084 / 213,
      metal: "assets/food/kebab-3-metal.webp",
      rotation: -47.51,
      pieces: [
        { src: 'assets/food/kebab-3-piece-1.webp', rect: { x: -0.784, y: 13.3118, w: 103.7559, h: 71.8635 }, final: { x: 30.7327, y: 67.4456 }, finalRotation: -47.51 },
      ],
    },
    'kebab-4': {
      dish: 'kebab',
      canvasWidth: 16.2727,
      canvasAspect: 1013 / 179,
      metal: "assets/food/kebab-4-metal.webp",
      rotation: -45.58,
      pieces: [
        { src: 'assets/food/kebab-4-piece-1.webp', rect: { x: -1.0559, y: 13.2251, w: 104.4693, h: 72.0632 }, final: { x: 42.2836, y: 56.863 }, finalRotation: -45.58 },
      ],
    },
    'tawook-2': {
      dish: 'tawook',
      canvasWidth: 19.7273,
      canvasAspect: 1060 / 217,
      metal: "assets/food/tawook-2-metal.webp",
      rotation: -50.27,
      pieces: [
        { src: 'assets/food/tawook-2-piece-1.webp', rect: { x: 1.3502, y: 12.7906, w: 76.4977, h: 19.8113 }, final: { x: 11.4655, y: 45.1892 }, finalRotation: -50.27 },
        { src: 'assets/food/tawook-2-piece-2.webp', rect: { x: -5.7926, y: 27.5566, w: 90.7834, h: 16.7925 }, final: { x: 21.7091, y: 57.1902 }, finalRotation: -50.27 },
        { src: 'assets/food/tawook-2-piece-3.webp', rect: { x: -1.8756, y: 39.7264, w: 82.9493, h: 15.8491 }, final: { x: 29.46, y: 67.6715 }, finalRotation: -50.27 },
        { src: 'assets/food/tawook-2-piece-4.webp', rect: { x: -8.0968, y: 51.0849, w: 95.3917, h: 20.4717 }, final: { x: 40.5009, y: 77.0686 }, finalRotation: -50.27 },
        { src: 'assets/food/tawook-2-piece-5.webp', rect: { x: -12.2442, y: 66.4189, w: 103.6866, h: 16.0377 }, final: { x: 53.4582, y: 84.9917 }, finalRotation: -50.27 },
      ],
    },
    'tawook-3': {
      dish: 'tawook',
      canvasWidth: 17.7273,
      canvasAspect: 1049 / 195,
      metal: "assets/food/tawook-3-metal.webp",
      rotation: -47.64,
      pieces: [
        { src: 'assets/food/tawook-3-piece-1.webp', rect: { x: -7.8564, y: 12.7827, w: 92.8205, h: 15.6339 }, final: { x: 21.9327, y: 35.8347 }, finalRotation: -47.64 },
        { src: 'assets/food/tawook-3-piece-2.webp', rect: { x: -3.7538, y: 23.9323, w: 84.6154, h: 17.1592 }, final: { x: 30.7755, y: 42.9459 }, finalRotation: -47.64 },
        { src: 'assets/food/tawook-3-piece-3.webp', rect: { x: -7.0872, y: 36.3937, w: 91.2821, h: 20.9724 }, final: { x: 36.9255, y: 53.4168 }, finalRotation: -47.64 },
        { src: 'assets/food/tawook-3-piece-4.webp', rect: { x: -10.4205, y: 52.1344, w: 97.9487, h: 15.4433 }, final: { x: 49.1327, y: 62.4792 }, finalRotation: -47.64 },
        { src: 'assets/food/tawook-3-piece-5.webp', rect: { x: -10.9333, y: 63.1201, w: 98.9744, h: 19.9237 }, final: { x: 60.5891, y: 72.0936 }, finalRotation: -47.64 },
      ],
    },
    'chicken': {
      dish: 'chicken',
      canvasWidth: 109.5455,
      canvasAspect: 1024 / 1205,
      metal: null,
      rotation: 5,
      plateScale: 0.6, // sized to the rice, sitting on top of it
      pieces: [
        { src: 'assets/food/chicken-piece-1.webp', rect: { x: 0.0, y: 0.0, w: 100.0, h: 100.0 }, final: { x: 40, y: 61 }, finalRotation: 5 },
      ],
    },
  },
}
