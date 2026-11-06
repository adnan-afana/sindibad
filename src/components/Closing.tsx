import { closing } from '../data/scene'

export function Closing() {
  return (
    <section className="closing" id="contact">
      <h2 data-split>{closing.title}</h2>
      <button type="button" className="order-button">{closing.button}</button>
    </section>
  )
}
