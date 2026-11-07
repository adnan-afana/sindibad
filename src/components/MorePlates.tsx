import { hero, morePlates } from '../data/scene'

/**
 * Rows of plates below the three animated ones. Same card as the animated plates, but static:
 * the photo is the finished plate and nothing flies onto it. Content lives in `morePlates`.
 */
export function MorePlates() {
  if (!morePlates.length) return null
  return (
    <section className="more-plates" aria-label="More plates">
      <div className="plates__grid">
        {morePlates.map((dish, i) => (
          <article key={i} className="flex min-w-0 flex-col items-center text-center" aria-labelledby={`more-dish-${i}`}>
            <div className="plate-card__plate plate-card__plate--static" data-reveal style={{ aspectRatio: `${dish.aspect}` }}>
              <img src={dish.image} alt="" width={1100} height={Math.round(1100 / dish.aspect)} loading="lazy" decoding="async" draggable={false} data-fixed-size />
            </div>
            <div className="plate-card__body mt-[clamp(0.75rem,2vh,1.5rem)] flex flex-col items-center gap-[0.6rem]">
              <h3 id={`more-dish-${i}`}>{dish.name}</h3>
              {dish.description && <p className="plate-card__description">{dish.description}</p>}
              {dish.price && <p className="plate-card__price">{dish.price}</p>}
              <a className="order-button order-button--small" href={hero.order.href}>{hero.order.label}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
