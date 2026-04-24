# Events-Recherche Sofia-Wochenende 15.–17. Mai 2026

Quellen-Crawl Stand: April 2026. Daten verifiziert über Songkick, ticketstation.bg, operasofia.bg, nationaltheatre.bg, bulgarian-football.com.

---

## Songkick / Bandsintown / festteam.bg

- **Fr 15.05. · Tinariwen** · NDK Hall 3 · 19:00 · Tuareg Desert-Blues, Hoggar Tour · Tickets ticketstation.bg
- **Fr 15.05. · Sean Paul** · Vidas Art Arena (Velodrome Serdika, Borisova-Park) · 19:00–22:00 · Reggae/Dancehall, "Rise Jamaica"-Show · Tickets ab 50 € · viagogo, gigsberg, ticketstation.bg
- Do 14.05. · Skillet · Arena Armeec · 16:00 (außerhalb Trip-Fenster, nur als Hinweis)
- Mi 20.05. · Clutch · NDK Hall 3 · 19:00 (außerhalb)
- Do 21.05. · Dave Chappelle · NDK Hall 1 · 20:00 (außerhalb)

## Sofia Opera and Ballet (operasofia.bg)

Mai-Kalender, Hauptbühne ul. Vrabcha 1:

- **Fr 15.05.** — keine Vorstellung
- **Sa 16.05. · "Queen of the Opera"** · Maria Guleghina Recital · 19:00 · Main Hall
- **So 17.05. · "La Cenerentola" (Rossini)** · 16:00 · Main Hall · italienische Oper, sprachübergreifend zugänglich

## Ivan Vazov National Theatre (nationaltheatre.bg)

Alles auf Bulgarisch ohne Untertitel — für Sprach-Touristen wenig sinnvoll. Trotzdem dokumentiert:

- Fr 15.05. · "Pieces of a Woman" · Chamber Hall · 19:00
- Fr 15.05. · "Marilyn Monroe's Last Session" · Apostol Karamitev Stage · 19:30
- Sa 16.05. · "Easter Wine" · Chamber Hall · 19:00
- Sa 16.05. · "Convenience Store Woman" · Apostol Karamitev Stage · 19:30
- So 17.05. · "Someone is Going to Come" · Chamber Hall · 19:00
- So 17.05. · "Loot" · Apostol Karamitev Stage · 19:30

→ **Skip** für Seed (Sprachbarriere).

## Bulgarian First Professional League (efbet, Round 35)

- **Sa 16.05. · LEVSKI vs CSKA Sofia (Eternal Derby)** · Vasil Levski National Stadium · 16:00 · der Bulgarische Klassiker, das Highlight des Wochenendes
- Sa 16.05. · CSKA 1948 vs Ludogorets · Bistritsa Stadium · 16:00 (kleines Stadion am Stadtrand, Auswärtsspiel-Charakter)

## NDK Calendar (ndk.bg)

Im Trip-Fenster nur Tinariwen (Hall 3, oben gelistet). Andere NDK-Events erst ab 21.05.

## Recurring (wöchentlich, fällt aufs Wochenende)

- **Sa morgens · Farmers Market am Roman Wall** (Hrankoop) · St. Sofia Church Park · ~9:00–14:00 · regional & bio · sehr lokal
- Sofia Live Club hat fast jedes Wochenende Programm (Jazz/Indie), Mai-Kalender war nicht öffentlich abrufbar — nicht hartcoded, sondern Hinweis auf Venue.

## Nicht im Trip-Fenster (Kontext)

- Sofia Opera Wagner Festival 26.05.–14.06. (Ring des Nibelungen)
- Sofia Live Festival 27.–28.06.

---

## Final Seed-Entries

Direkt paste-bar in `server/db/events-seed.ts`. Venues, die per `venue_lookup_name` aufgelöst werden, müssen vorher in `seed-data.ts` als Location existieren — siehe nächste Sektion.

```ts
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
  description: 'Tuareg-Desert-Blues aus Mali, Grammy-Gewinner — sitzendes Konzert im NDK Saal 3, 5 Min vom Hotel.',
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
  description: 'Open-Air Reggae/Dancehall im Velodrom mitten im Borisova-Park. Karten teuer aber Stimmung garantiert.',
  emoji: '🎤',
},
{
  title: 'Levski Sofia vs CSKA Sofia — Ewiges Derby',
  event_type: 'sport',
  venue_lookup_name: 'Vasil Levski National Stadium',
  venue_name: 'Vasil Levski National Stadium',
  start_date: '2026-05-16',
  start_time: '16:00',
  price: '15-40 lv',
  external_url: 'https://en.bulgarian-football.com/season-2025-2026/parva-liga.html',
  description: 'Bulgariens Klassiker — größte Rivalität des Landes, 44.000 Plätze. Tickets im Voraus, niemals im CSKA-Block sitzen wenn ihr Levski-Sympathien zeigt.',
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
  description: 'Recital der ukrainisch-russischen Star-Sopranistin. Klassik-affine: Eintrittskarten geschossen.',
  emoji: '🎼',
},
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
  description: 'Rossinis Aschenputtel auf italienisch — sprachübergreifend, gut zugänglich. Sonntag-Matinée, Programm-Abschluss vor Abflug.',
  emoji: '🎭',
},
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
```

## Neue Venue-Locations für Karte

Damit Tap-to-Map funktioniert, müssen folgende Venues als Locations existieren (Cat 7 = Kultur & Bühne, Cat 8 = Sport & Stadion). NDK + Vasil Levski sind bereits in `seed-data.ts` (zwar fälschlich Cat 4 — nicht in Scope dieser Task, der venue_lookup_name greift trotzdem).

Hinzuzufügen:

- **Sofia Opera and Ballet** · Cat 7 · 42.6983, 23.3294 (ul. Vrabcha 1)
- **Vidas Art Arena** · Cat 7 · 42.6817, 23.3398 (Velodrome Serdika, Borisova-Park-Eingang)

NDK steht zwar in Cat 4 — falscher Cat, aber Map-Link funktioniert. Optional könnte man NDK auf Cat 7 umstellen — separat zu klären, nicht Teil des Events-Tasks.
