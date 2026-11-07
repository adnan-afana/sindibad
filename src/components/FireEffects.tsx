import { assets, embers, flameTongues, imageSize } from '../data/scene'

/**
 * Ambient fire on the grill photo (CSS keyframe loops, compositor-only: transform + opacity).
 * Each flame layer = flames photo (pre-flattened onto black) × a moving light/dark sweep,
 * screen-blended onto the grill. This is mathematically the same as the old animated
 * mask-position, but the sweep moves with transform, so nothing is repainted per frame.
 */
const FLAME_LAYERS = ['', 'grill-stage__flames--lick', 'grill-stage__flames--dance'] as const

/** Smoke wisps rising off the grill: start position (% across), delay and loop length in seconds. */
const SMOKE = [
  { x: 6, delay: 0, dur: 7.5 },
  { x: 20, delay: 2.6, dur: 8.5 },
  { x: 34, delay: 1.1, dur: 7 },
  { x: 48, delay: 3.8, dur: 9 },
  { x: 62, delay: 0.6, dur: 8 },
  { x: 76, delay: 2.2, dur: 7.5 },
]

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
      <div className="grill-smoke" aria-hidden="true">
        {SMOKE.map((w, i) => (
          <span key={i} style={{ left: `${w.x}%`, animationDelay: `${w.delay}s`, animationDuration: `${w.dur}s` }} />
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
