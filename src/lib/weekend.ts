export const WEEKEND_START = '2026-05-15'
export const WEEKEND_END = '2026-05-17'

export const WEEKEND_DAYS = [
  { date: '2026-05-15', label: 'Freitag', short: 'Fr · 15. Mai' },
  { date: '2026-05-16', label: 'Samstag', short: 'Sa · 16. Mai' },
  { date: '2026-05-17', label: 'Sonntag', short: 'So · 17. Mai' },
] as const

export type EventType = 'concert' | 'sport' | 'festival' | 'market' | 'theater' | 'opera'

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  concert: 'Konzert',
  sport: 'Sport',
  festival: 'Festival',
  market: 'Markt',
  theater: 'Theater',
  opera: 'Oper',
}

export const EVENT_TYPE_EMOJI: Record<EventType, string> = {
  concert: '🎵',
  sport: '⚽',
  festival: '🎪',
  market: '🛍️',
  theater: '🎭',
  opera: '🎼',
}
