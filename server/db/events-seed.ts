// Seed-Events für den Sofia-Trip 15.-17. Mai 2026.
// Recherche dokumentiert in docs/events-research-2026-05-15.md.
// Venues mit `venue_lookup_name` werden zur Seed-Zeit per Name → location_id aufgelöst,
// damit Tap im Sofia-Reiter direkt aufs Map-Pin springt.

export type EventType = 'concert' | 'sport' | 'festival' | 'market' | 'theater' | 'opera'

export interface SeedEvent {
  title: string
  event_type: EventType
  venue_lookup_name?: string | null
  venue_name?: string | null
  venue_address?: string | null
  venue_lat?: number | null
  venue_lng?: number | null
  start_date?: string | null
  end_date?: string | null
  start_time?: string | null
  end_time?: string | null
  recurrence?: string | null
  recurrence_until?: string | null
  price?: string | null
  external_url?: string | null
  description?: string | null
  emoji?: string | null
}

export const events: SeedEvent[] = [
  // ── Freitag 15. Mai ──────────────────────────────────────────────────────
  {
    title: 'Tinariwen — Hoggar Tour',
    event_type: 'concert',
    venue_lookup_name: 'National Palace of Culture (NDK)',
    venue_name: 'NDK Hall 3',
    start_date: '2026-05-15',
    start_time: '19:00',
    end_time: '22:00',
    price: 'ab 30 lv',
    external_url: 'https://www.songkick.com/concerts/42859614-tinariwen-at-hall-3-ndk-sofia-bulgaria',
    description: 'Tuareg-Desert-Blues aus Mali, Grammy-Gewinner. Sitzendes Konzert im NDK Saal 3, 5 Min vom Hotel.',
    emoji: '🎸',
  },
  {
    title: 'Sean Paul — Rise Jamaica',
    event_type: 'concert',
    venue_lookup_name: 'Vidas Art Arena',
    venue_name: 'Vidas Art Arena (Velodrome Serdika)',
    venue_address: 'Borisova Gradina Park',
    start_date: '2026-05-15',
    start_time: '19:00',
    end_time: '22:00',
    price: 'ab 50 €',
    external_url: 'https://ticketstation.bg/en/p5673-sean-paul-2026',
    description: 'Open-Air-Reggae im Velodrom mitten im Borisova-Park. Karten teuer aber Stimmung garantiert.',
    emoji: '🎤',
  },

  // ── Samstag 16. Mai ─────────────────────────────────────────────────────
  {
    title: 'Levski Sofia vs CSKA Sofia — Ewiges Derby',
    event_type: 'sport',
    venue_lookup_name: 'Vasil Levski National Stadium',
    venue_name: 'Vasil Levski National Stadium',
    start_date: '2026-05-16',
    start_time: '16:00',
    price: '15-40 lv',
    external_url: 'https://en.bulgarian-football.com/season-2025-2026/parva-liga.html',
    description: 'Bulgariens Klassiker. Größte Rivalität des Landes, 44k Plätze. Karten im Voraus, neutrale Sektoren wählen.',
    emoji: '⚽',
  },
  {
    title: 'Queen of the Opera — Maria Guleghina',
    event_type: 'opera',
    venue_lookup_name: 'Sofia Opera and Ballet',
    venue_name: 'Sofia Opera Main Hall',
    venue_address: 'ul. Vrabcha 1',
    start_date: '2026-05-16',
    start_time: '19:00',
    price: '20-80 lv',
    external_url: 'https://www.operasofia.bg/en/calendar/2026-05',
    description: 'Recital der ukrainisch-russischen Star-Sopranistin. Wer Klassik mag: Pflicht.',
    emoji: '🎼',
  },

  // ── Sonntag 17. Mai ─────────────────────────────────────────────────────
  {
    title: 'La Cenerentola (Rossini)',
    event_type: 'opera',
    venue_lookup_name: 'Sofia Opera and Ballet',
    venue_name: 'Sofia Opera Main Hall',
    venue_address: 'ul. Vrabcha 1',
    start_date: '2026-05-17',
    start_time: '16:00',
    price: '15-60 lv',
    external_url: 'https://www.operasofia.bg/en/calendar/2026-05',
    description: 'Rossinis Aschenputtel auf italienisch — sprachübergreifend. Sonntag-Matinée vor Abflug.',
    emoji: '🎭',
  },

  // ── Wöchentlich (fällt aufs Wochenende) ─────────────────────────────────
  {
    title: 'Farmers Market am Roman Wall',
    event_type: 'market',
    venue_name: 'Roman Wall · St. Sofia Church Park',
    venue_address: 'Saborna 2',
    venue_lat: 42.6967,
    venue_lng: 23.3239,
    recurrence: 'weekly:6',
    start_time: '09:00',
    end_time: '14:00',
    price: 'frei',
    description: 'Hrankoop-Markt mit Bio-Bauern aus der Region. Bulgarische Milchprodukte, Honig, Wein. Lockerer Samstagvormittag.',
    emoji: '🥬',
  },
]
