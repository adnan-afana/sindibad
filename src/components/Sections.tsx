import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, REDUCED_MOTION } from '../lib/gsap'
import { assets, halal } from '../data/scene'
import { catering, contact, loyalty, testimonials } from '../data/sections'
import { hoursSummary } from '../lib/opening-hours'

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={i < n ? 'on' : ''}><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" /></svg>
      ))}
    </span>
  )
}

/** Embers drifting up (same look as the grill's sparks). */
const SPARKS = [8, 17, 26, 34, 43, 52, 61, 69, 78, 86, 93].map((x, i) => ({ x, delay: (i * 0.73) % 4, dur: 3.6 + ((i * 1.37) % 2.2) }))

export function Testimonials() {
  const items = testimonials.items
  return (
    <section className="section voices" aria-labelledby="voices-title" data-voices>
      {/* the grill's smoke and sparks continue behind the reviews */}
      <div className="voices__smoke" aria-hidden="true">
        <img src={assets.smoke} alt="" loading="lazy" decoding="async" />
        <img src={assets.smoke} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="voices__sparks" aria-hidden="true">
        {SPARKS.map((p, i) => <span key={i} style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />)}
      </div>
      <div className="voices__inner">
        <h2 id="voices-title" className="voices__kicker">
          <span className="pill"><Stars n={5} /> {testimonials.title}</span>
        </h2>
        <div className="voices__stage">
          {items.map((r, i) => (
            <figure key={i} className="voice" data-voice aria-hidden={i > 0 || undefined}>
              <span className="voice__mark" aria-hidden="true">“</span>
              <blockquote>{r.quote}</blockquote>
              <figcaption>{r.name} · {r.meta}</figcaption>
            </figure>
          ))}
        </div>
        <div className="voices__dots" role="tablist" aria-label="Reviews">
          {items.map((_, i) => (
            <button key={i} type="button" className="voices__dot" data-voice-dot={i} aria-label={`Review ${i + 1}`} />
          ))}
        </div>
        <p className="section__note">{testimonials.sampleNote}</p>
      </div>
    </section>
  )
}

export function Loyalty() {
  return (
    <section className="section loyalty" id="loyalty" aria-labelledby="loyalty-title">
      <h2 id="loyalty-title" className="mega" data-split>{loyalty.title}</h2>
      <div className="loyalty__card" data-loyalty-card>
        <div className="loyalty__ghost" aria-hidden="true">{loyalty.ghost}</div>
        <div className="loyalty__copy">
          <p className="loyalty__headline">{loyalty.headline}</p>
          <p className="loyalty__text">{loyalty.copy}</p>
          <ul className="loyalty__perks">
            {loyalty.perks.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <a className="order-button loyalty__cta" href={loyalty.cta.href}>{loyalty.cta.label}</a>
        </div>
        <div className="loyalty__stamps" aria-label={`Stamp card: ${loyalty.filled} of ${loyalty.stamps}`}>
          {Array.from({ length: loyalty.stamps }, (_, i) => {
            const last = i === loyalty.stamps - 1
            const filled = i < loyalty.filled
            return (
              <span key={i} className={`stamp ${filled ? 'stamp--on' : ''} ${last ? 'stamp--free' : ''}`} data-stamp>
                {last ? 'Free' : filled ? <img src={assets.logoFlame} alt="" width={100} height={71} loading="lazy" decoding="async" /> : i + 1}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Catering() {
  return (
    <section className="section catering" id="catering" aria-labelledby="catering-title">
      <div className="catering__bg" aria-hidden="true">
        <img src={assets.grill} alt="" width={1672} height={941} loading="lazy" decoding="async" data-parallax />
      </div>
      <div className="catering__content">
        <h2 id="catering-title" className="mega" data-split>{catering.title}</h2>
        <p className="catering__copy" data-reveal>{catering.copy}</p>
        <ul className="catering__tags" data-reveal>
          {catering.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <div className="catering__actions" data-reveal>
          <a className="order-button" href={catering.cta.href}>{catering.cta.label}</a>
          <a className="pill-link" href={catering.secondary.href}>{catering.secondary.label}</a>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__grid">
        <div>
          <h3>Visit</h3>
          <a href={contact.mapsHref} target="_blank" rel="noreferrer">{contact.address}</a>
        </div>
        <div>
          <h3>Call</h3>
          <a href={contact.phoneHref}>{contact.phone}</a>
        </div>
        <div>
          <h3>Hours</h3>
          <p>{hoursSummary().map((g, i) => <span key={g.days}>{i > 0 && <br />}{g.days} {g.text}</span>)}</p>
        </div>
        <div>
          <h3>Follow</h3>
          <p>{contact.social.map((s, i) => <span key={s.label}>{i > 0 && ' · '}<a href={s.href}>{s.label}</a></span>)}</p>
        </div>
      </div>
      <div className="site-footer__bar">
        <span>© {new Date().getFullYear()} Sindibad BBQ &amp; Grill</span>
        <span>{halal.title}</span>
      </div>
    </footer>
  )
}

/** All motion for these sections (GSAP only, transform/opacity, reverted on unmount). */
export function useSectionMotion(scope: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    let mm: gsap.MatchMedia | undefined
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()
      mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: REDUCED_MOTION }, (c) => {
        if (c.conditions?.reduce) return
        // ghost words drifting
        root.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
          gsap.to(el, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
        })
        // reviews: one quote at a time. Lines of the old quote slide up out of their masks while
        // the new quote's lines rise in, overlapping, so the change reads as one continuous motion.
        root.querySelectorAll<HTMLElement>('[data-voices]').forEach((sec) => {
          const quotes = [...sec.querySelectorAll<HTMLElement>('[data-voice]')]
          const dots = [...sec.querySelectorAll<HTMLElement>('[data-voice-dot]')]
          if (!quotes.length) return
          const lines = new Map<HTMLElement, Element[]>()
          let current = 0
          let shown = false
          quotes.forEach((q) => {
            const bq = q.querySelector('blockquote')
            if (!bq) return
            SplitText.create(bq, {
              type: 'lines',
              mask: 'lines',
              autoSplit: true,
              onSplit(self) {
                lines.set(q, self.lines)
                gsap.set(self.lines, { yPercent: q === quotes[current] && shown ? 0 : 110 })
              },
            })
          })
          let busy: gsap.core.Timeline | null = null
          let timer: gsap.core.Tween | null = null
          gsap.set(quotes, { autoAlpha: 0 })
          const show = (n: number) => {
            const next = (n + quotes.length) % quotes.length
            const prevQ = shown ? quotes[current] : null
            if (prevQ === quotes[next]) return
            busy?.progress(1)
            const nextQ = quotes[next]
            current = next
            shown = true
            dots.forEach((d, k) => d.classList.toggle('is-on', k === next))
            quotes.forEach((q, k) => q.setAttribute('aria-hidden', String(k !== next)))
            const tl = gsap.timeline()
            if (prevQ) {
              tl.to(lines.get(prevQ) ?? [], { yPercent: -110, duration: 0.9, stagger: 0.06, ease: 'power3.inOut' }, 0)
              tl.to(prevQ.querySelectorAll('.voice__mark, figcaption'), { autoAlpha: 0, y: -10, duration: 0.6, ease: 'power2.inOut' }, 0)
              tl.set(prevQ, { autoAlpha: 0 })
            }
            tl.set(nextQ, { autoAlpha: 1 }, prevQ ? 0.35 : 0)
            tl.fromTo(lines.get(nextQ) ?? [], { yPercent: 110 }, { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'power4.out' }, prevQ ? 0.4 : 0)
            tl.fromTo(nextQ.querySelectorAll('.voice__mark, figcaption'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, prevQ ? 0.55 : 0.15)
            busy = tl
            timer?.kill()
            timer = gsap.delayedCall(7, () => show(current + 1))
          }
          dots.forEach((d, k) => d.addEventListener('click', () => show(k)))
          ScrollTrigger.create({ trigger: sec, start: 'top 75%', once: true, onEnter: () => show(0) })
        })
        // loyalty card straightens as it scrolls in, stamps pop in
        const card = root.querySelector<HTMLElement>('[data-loyalty-card]')
        if (card) {
          gsap.fromTo(card, { rotation: -7, y: 60 }, { rotation: -2, y: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'center center', scrub: 0.6 } })
          gsap.from(card.querySelectorAll('[data-stamp]'), { scale: 0, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: card, start: 'top 70%', once: true } })
        }
        // catering background parallax
        root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
          gsap.fromTo(img, { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
        })
      })
    }, root)
    const onLoad = () => ScrollTrigger.refresh()
    root.querySelectorAll('img').forEach((img) => img.addEventListener('load', onLoad, { once: true }))
    return () => {
      mm?.revert()
      ctx.revert()
    }
  }, [scope])
}

export function MoreSections() {
  const ref = useRef<HTMLDivElement>(null)
  useSectionMotion(ref)
  return (
    <div ref={ref}>
      <Testimonials />
      <Loyalty />
      <Catering />
    </div>
  )
}
