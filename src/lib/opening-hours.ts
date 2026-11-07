/** Open/closed status from the opening-hours data, in the restaurant's own time zone. */
import { openingHours } from '../data/scene'

export interface OpenStatus { open: boolean; label: string; detail: string }

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const h12 = ((h + 11) % 12) + 1
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`
}
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Current weekday (0–6) and minutes since midnight in the restaurant's time zone. */
function localNow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: openingHours.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return { day: DAY.indexOf(get('weekday')), min: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function openStatus(now = new Date()): OpenStatus {
  const { day, min } = localNow(now)
  const days = openingHours.days
  // still open from yesterday's late shift?
  const y = days[(day + 6) % 7]
  if (y && toMin(y.close) < toMin(y.open) && min < toMin(y.close))
    return { open: true, label: 'Open now', detail: `until ${fmt(y.close)}` }
  const t = days[day]
  if (t) {
    const o = toMin(t.open)
    const c = toMin(t.close)
    const overnight = c < o
    if (min >= o && (overnight || min < c)) return { open: true, label: 'Open now', detail: `until ${fmt(t.close)}` }
    if (min < o) return { open: false, label: 'Closed', detail: `opens ${fmt(t.open)}` }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    const h = days[d]
    if (h) return { open: false, label: 'Closed', detail: `opens ${i === 1 ? 'tomorrow' : DAY[d]} ${fmt(h.open)}` }
  }
  return { open: false, label: 'Closed', detail: '' }
}

/** "Mon–Thu 11 AM – 10 PM · …" summary for the footer. */
export function hoursSummary() {
  const groups: { from: number; to: number; text: string }[] = []
  for (const d of [1, 2, 3, 4, 5, 6, 0]) {
    const h = openingHours.days[d]
    const text = h ? `${fmt(h.open)} – ${fmt(h.close)}` : 'Closed'
    const last = groups[groups.length - 1]
    if (last && last.text === text) last.to = d
    else groups.push({ from: d, to: d, text })
  }
  return groups.map((g) => ({ days: g.from === g.to ? DAY[g.from] : `${DAY[g.from]}–${DAY[g.to]}`, text: g.text }))
}
