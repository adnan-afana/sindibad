import { closing } from '../data/scene'
import { InfoPills } from './InfoPills'

export function Closing() {
  return (
    <section className="closing" id="reserve">
      <h2 data-split>{closing.title}</h2>
      <InfoPills />
      <button type="button" className="order-button">{closing.button}</button>
    </section>
  )
}
