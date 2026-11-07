import { useEffect, useId, useState } from 'react'
import { assets, hero, imageSize } from '../data/scene'

/** Logo, nav and Order button. Its only state is the mobile menu (changes on click, never on scroll). */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header" data-open={open || undefined}>
      <a className="site-header__logo" href="#top">
        <img src={assets.logo} alt={hero.logoAlt} width={imageSize.logo[0]} height={imageSize.logo[1]} draggable={false} decoding="async" fetchPriority="high" />
        {/* hover fire, masked by the logo so it never leaves the letters */}
        <span className="logo-fire" aria-hidden="true" style={{ maskImage: `url("${assets.logo}")`, WebkitMaskImage: `url("${assets.logo}")` }}>
          <span />
        </span>
      </a>
      <nav className="site-nav" aria-label="Main">
        <ul id={listId} className="site-nav__list">
          {hero.nav.map((item) => (
            <li key={item.label}>
              <a href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="order-button" href={hero.order.href}>{hero.order.label}</a>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
    </header>
  )
}
