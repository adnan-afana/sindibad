import { useEffect, useState } from 'react'
import { halal } from '../data/scene'
import { openStatus } from '../lib/opening-hours'

/** Halal badge + live open/closed status. Re-checks once a minute (never on scroll). */
export function InfoPills() {
  const [status, setStatus] = useState(openStatus)
  useEffect(() => {
    const id = window.setInterval(() => setStatus(openStatus()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="info-pills">
      <span className="pill pill--halal" title={halal.title}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        {halal.label}
      </span>
      <span className={`pill ${status.open ? 'pill--open' : 'pill--closed'}`} role="status">
        <span className="pill__dot" aria-hidden="true" />
        {status.label}
        {status.detail && <span className="pill__muted">· {status.detail}</span>}
      </span>
    </div>
  )
}
