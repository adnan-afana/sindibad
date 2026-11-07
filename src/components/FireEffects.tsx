import { assets, embers, flameTongues, imageSize, smoke } from '../data/scene'

/**
 * Ambient fire on the grill photo (CSS keyframe loops, compositor-only: transform + opacity).
 * Each flame layer = flames photo (pre-flattened onto black) × a moving light/dark sweep,
 * screen-blended onto the grill. This is mathematically the same as the old animated
 * mask-position, but the sweep moves with transform, so nothing is repainted per frame.
 */
const FLAME_LAYERS = ['', 'grill-stage__flames--lick', 'grill-stage__flames--dance'] as const

export function FireEffects() {
  return (
    <>
      {FLAME_LAYERS.map((mod) => (
        <div key={mod || 'base'} className={`grill-stage__flames ${mod}`} aria-hidden="true">
          <img src={assets.flames} alt="" width={imageSize.grill[0]} height={imageSize.grill[1]} draggable={false} decoding="async" />
          <span className="flame-sweep" />
        </div>
      ))}
      <div className="flame-tongues" aria-hidden="true">
        {flameTongues.map((t, i) => (
          <span key={i} style={{ left: `${t.x}%`, height: `${t.h}%`, width: `${t.w}%`, animationDelay: `${t.delay}s`, animationDuration: `${t.dur}s` }} />
        ))}
      </div>
      <div className="smoke" aria-hidden="true">
        {smoke.map((p, i) => (
          <span key={i} style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
        ))}
      </div>
      <div className="embers" aria-hidden="true">
        {embers.map((e, i) => (
          <span key={i} style={{ left: `${e.x}%`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }} />
        ))}
      </div>
    </>
  )
}
