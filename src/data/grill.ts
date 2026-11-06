/** Grill scene layout. Boxes are % of the grill photo (left/top/width/height); axis is the skewer's resting angle in degrees. */
import type { GrillLayout } from './types'

export const grillLayout: GrillLayout = {
  /** Grill photo aspect ratio (width / height). */
  aspect: 1672 / 941,
  items: {
    'basket-lid': { box: { left: 8.5526, top: 25.3985, width: 27.3923, height: 40.5951 } },
    'basket-base': { box: { left: 8.5526, top: 25.3985, width: 27.3923, height: 51.5409 } },
    'kebab-3': { box: { left: 70.5066, top: 26.8852, width: 5.1591, height: 46.6546 }, axis: -13.43 },
    'kebab-4': { box: { left: 77.6591, top: 26.1849, width: 4.7895, height: 48.1615 }, axis: -19.19 },
    'kebab-1': { box: { left: 57.003, top: 25.5537, width: 4.7141, height: 47.4049 }, axis: -3.98 },
    'kebab-2': { box: { left: 63.6717, top: 27.1137, width: 5.073, height: 45.8789 }, axis: -9.33 },
    'tawook-2': { box: { left: 44.683, top: 26.899, width: 5.311, height: 46.0956 }, axis: 5.16 },
    'tawook-3': { box: { left: 51.0126, top: 27.0946, width: 4.7931, height: 45.8108 }, axis: 1.06 },
    'tawook-1': { box: { left: 37.68, top: 27.6408, width: 5.262, height: 45.6748 }, axis: 13.45 },
    'chicken': { box: { left: 12.0215, top: 30.1052, width: 20.933, height: 31.6068 }, axis: -4 },
  },
}
