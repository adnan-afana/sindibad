import { dishes, moreDishes } from '../data/scene'
import type { DishId } from '../data/types'
import type { SceneModel } from '../lib/scene-model'
import { PlateCard } from './GrillToPlateScene'

/** Extra rows of dishes under the scene (static: no flight).
 *  Phones: the half chicken stays on the grill there, so its plate opens these rows (already plated). */
export function MoreDishes({ model }: { model: SceneModel }) {
  const chicken = dishes.find((d) => d.id === 'chicken')
  return (
    <section className="plates plates--more" aria-label="More dishes">
      <div className="plates__grid">
        {chicken && (
          <div className="plates__mobile-only">
            <PlateCard model={model} dish={{ ...chicken, id: 'chicken-m', plate: 'chicken' as DishId }} live={false} />
          </div>
        )}
        {moreDishes.map((d) => <PlateCard key={d.id} model={model} dish={d} live={false} />)}
      </div>
      <div className="plates__cta"><a className="order-button" href="#menu">View full menu</a></div>
    </section>
  )
}
