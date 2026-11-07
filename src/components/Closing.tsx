import { closing, halal } from '../data/scene'
import { hoursSummary } from '../lib/opening-hours'
import { InfoPills } from './InfoPills'

export function Closing() {
  return (
    <section className="closing" id="contact">
      <h2 data-split>{closing.title}</h2>
      <InfoPills />
      <p className="closing__hours">
        {hoursSummary().map((g, i) => (
          <span key={g.days}>{i > 0 && ' · '}<strong>{g.days}</strong> {g.text}</span>
        ))}
        <br />
        {halal.title}.
      </p>
      <button type="button" className="order-button">{closing.button}</button>
    </section>
  )
}
