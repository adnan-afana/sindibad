/**
 * Layout measurement that ignores CSS transforms: walks the offsetParent chain.
 * Used for animation anchors so that moving/parallax transforms never pollute the result.
 */
export interface Rect { left: number; top: number; w: number; h: number }

/** Position of `el` relative to `root` (an ancestor), plus its layout size. */
export function offsetRect(el: HTMLElement, root: HTMLElement): Rect {
  let left = 0
  let top = 0
  let node: HTMLElement | null = el
  while (node && node !== root) {
    left += node.offsetLeft
    top += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    // root is not an offsetParent of el (e.g. a static wrapper): subtract root's own offset.
    if (!parent || !root.contains(parent)) {
      if (parent !== root) {
        let r: HTMLElement | null = root
        while (r && r !== parent) {
          left -= r.offsetLeft
          top -= r.offsetTop
          r = r.offsetParent as HTMLElement | null
        }
      }
      break
    }
    node = parent
  }
  return { left, top, w: el.offsetWidth, h: el.offsetHeight }
}
