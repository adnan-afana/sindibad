import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, REDUCED_MOTION } from '../lib/gsap'
import { assets, halal } from '../data/scene'
import { catering, contact, loyalty, testimonials } from '../data/sections'
import { hoursSummary } from '../lib/opening-hours'

/** Big ghost word that drifts sideways behind a section (two copies → seamless loop). */
function GhostMarquee({ text }: { text: string }) {
  return (
    <div className="ghost-marquee" aria-hidden="true">
      <div className="ghost-marquee__track" data-marquee>
        <span>{text}&nbsp;·&nbsp;</span><span>{text}&nbsp;·&nbsp;</span>
      </div>
    </div>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={i < n ? 'on' : ''}><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" /></svg>
      ))}
    </span>
  )
}

export function Testimonials() {
  const cards = testimonials.items
  return (
    <section className="section reviews" aria-labelledby="reviews-title">
      <GhostMarquee text="Loved in Kingston" />
      <h2 id="reviews-title" className="mega" data-split>{testimonials.title}</h2>
      <p className="section__note">{testimonials.sampleNote}</p>
      <div className="reviews__viewport" data-reviews>
        <div className="reviews__track" data-reviews-track>
          {[...cards, ...cards].map((r, i) => (
            <figure key={i} className={`review ${i % 2 ? 'review--dark' : ''}`} aria-hidden={i >= cards.length || undefined}>
              <Stars n={r.rating} />
              <blockquote>“{r.quote}”</blockquote>
              <figcaption><strong>{r.name}</strong><span>{r.meta}</span></figcaption>
            </figure>
          ))}
        </div>
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
        // reviews marquee; slows down while hovered
        root.querySelectorAll<HTMLElement>('[data-reviews]').forEach((vp) => {
          const track = vp.querySelector<HTMLElement>('[data-reviews-track]')
          if (!track) return
          const loop = gsap.to(track, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
          const slow = () => gsap.to(loop, { timeScale: 0.15, duration: 0.6 })
          const go = () => gsap.to(loop, { timeScale: 1, duration: 0.6 })
          vp.addEventListener('pointerenter', slow)
          vp.addEventListener('pointerleave', go)
          gsap.from(track.children, { y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: vp, start: 'top 85%', once: true } })
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
