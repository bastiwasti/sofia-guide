export interface EventRow {
  id: number
  title: string
  event_type: string
  location_id: number | null
  venue_name: string | null
  venue_address: string | null
  venue_lat: number | null
  venue_lng: number | null
  start_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  recurrence: string | null
  recurrence_until: string | null
  price: string | null
  external_url: string | null
  description: string | null
  emoji: string | null
  created_at?: string
}

export interface EventOccurrence extends EventRow {
  occurrence_date: string
}

function parseIsoDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null
  }
  return date
}

function formatIsoDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoWeekday(d: Date): number {
  // Mon=1 … Sun=7
  const wd = d.getUTCDay()
  return wd === 0 ? 7 : wd
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000)
}

function parseWeeklyRecurrence(s: string): number | null {
  const m = s.match(/^weekly:([1-7])$/)
  if (!m) return null
  return parseInt(m[1], 10)
}

export function expandRecurrence(
  event: EventRow,
  from: string,
  to: string,
): EventOccurrence[] {
  const fromDate = parseIsoDate(from)
  const toDate = parseIsoDate(to)
  if (!fromDate || !toDate || fromDate.getTime() > toDate.getTime()) return []

  // One-off / multi-day: any calendar day where event overlaps window.
  if (event.start_date && !event.recurrence) {
    const startDate = parseIsoDate(event.start_date)
    if (!startDate) return []
    const endDate = event.end_date ? parseIsoDate(event.end_date) : startDate
    if (!endDate) return []

    const overlapStart = startDate.getTime() > fromDate.getTime() ? startDate : fromDate
    const overlapEnd = endDate.getTime() < toDate.getTime() ? endDate : toDate
    if (overlapStart.getTime() > overlapEnd.getTime()) return []

    const occurrences: EventOccurrence[] = []
    for (
      let cursor = overlapStart;
      cursor.getTime() <= overlapEnd.getTime();
      cursor = addDays(cursor, 1)
    ) {
      occurrences.push({ ...event, occurrence_date: formatIsoDate(cursor) })
    }
    return occurrences
  }

  // Recurring weekly event.
  if (event.recurrence) {
    const targetWeekday = parseWeeklyRecurrence(event.recurrence)
    if (targetWeekday === null) return []

    const until = event.recurrence_until ? parseIsoDate(event.recurrence_until) : null
    if (until && until.getTime() < fromDate.getTime()) return []

    const effectiveEnd = until && until.getTime() < toDate.getTime() ? until : toDate

    const occurrences: EventOccurrence[] = []
    for (
      let cursor = fromDate;
      cursor.getTime() <= effectiveEnd.getTime();
      cursor = addDays(cursor, 1)
    ) {
      if (isoWeekday(cursor) === targetWeekday) {
        occurrences.push({ ...event, occurrence_date: formatIsoDate(cursor) })
      }
    }
    return occurrences
  }

  return []
}

export function expandMany(
  events: EventRow[],
  from: string,
  to: string,
): EventOccurrence[] {
  const out: EventOccurrence[] = []
  for (const e of events) {
    out.push(...expandRecurrence(e, from, to))
  }
  out.sort((a, b) => {
    if (a.occurrence_date !== b.occurrence_date) {
      return a.occurrence_date < b.occurrence_date ? -1 : 1
    }
    const aTime = a.start_time ?? '99:99'
    const bTime = b.start_time ?? '99:99'
    if (aTime !== bTime) return aTime < bTime ? -1 : 1
    return a.id - b.id
  })
  return out
}
