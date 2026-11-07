/**
 * Opening hours, in the restaurant's own time zone. Edit here; the "open now" badge in the hero
 * reads from this. Times are 24-hour "HH:MM". A day set to null is closed all day.
 * Source: sindibadbbqandgrill.ca (Nov 2026). Check before launch.
 */
export const timeZone = 'America/Toronto'

/** 0 = Sunday … 6 = Saturday */
export const hours: Record<number, [open: string, close: string] | null> = {
  0: null,
  1: ['11:30', '21:30'],
  2: ['11:30', '18:30'],
  3: ['11:30', '21:30'],
  4: ['11:30', '21:30'],
  5: ['11:30', '21:30'],
  6: ['11:30', '21:30'],
}

/** Shown as "closing soon" this many minutes before closing. */
export const closingSoonMinutes = 60

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const label = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const h12 = h % 12 || 12
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`
}

/** Day of week and minutes since midnight at the restaurant, whatever the visitor's time zone. */
function restaurantNow(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: DAY.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export type OpenState = { state: 'open' | 'closing' | 'closed'; text: string }

export function openState(date = new Date()): OpenState {
  const { day, minutes } = restaurantNow(date)
  const today = hours[day]
  if (today && minutes >= toMin(today[0]) && minutes < toMin(today[1])) {
    const left = toMin(today[1]) - minutes
    return left <= closingSoonMinutes
      ? { state: 'closing', text: `Closing soon · ${label(today[1])}` }
      : { state: 'open', text: `Open now · until ${label(today[1])}` }
  }
  if (today && minutes < toMin(today[0])) return { state: 'closed', text: `Closed · opens ${label(today[0])}` }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    const next = hours[d]
    if (next) return { state: 'closed', text: `Closed · opens ${i === 1 ? 'tomorrow' : DAY[d]} ${label(next[0])}` }
  }
  return { state: 'closed', text: 'Closed' }
}
