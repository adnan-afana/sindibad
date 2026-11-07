import { moreDishes } from '../data/scene'
import type { SceneModel } from '../lib/scene-model'
import { PlateCard } from './GrillToPlateScene'

/** Extra rows of dishes under the grill scene (static: no flight). */
export function MoreDishes({ model }: { model: SceneModel }) {
  if (!moreDishes.length) return null
  return (
    <section className="plates plates--more" aria-label="More dishes">
      <div className="plates__grid">
        {moreDishes.map((d) => <PlateCard key={d.id} model={model} dish={d} live={false} />)}
      </div>
    </section>
  )
}
