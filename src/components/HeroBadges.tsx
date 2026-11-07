import { useEffect, useState } from 'react'
import { openState } from '../data/hours'

/** Open/closed status (live, in the restaurant's time zone) and the halal badge, above the hero title. */
export function HeroBadges() {
  const [status, setStatus] = useState(() => openState())
  useEffect(() => {
    const id = setInterval(() => setStatus(openState()), 30_000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="hero__badges">
      <span className="hero-badge hero-badge--status" data-state={status.state}>
        <span className="hero-badge__dot" aria-hidden="true" />
        {status.text}
      </span>
      <span className="hero-badge hero-badge--halal">
        <svg viewBox="0 0 20 20" aria-hidden="true" width="16" height="16">
          <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.2 10.3l2.5 2.5 5.1-5.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span lang="ar" className="hero-badge__ar">حلال</span>
        100% Halal
      </span>
    </div>
  )
}
