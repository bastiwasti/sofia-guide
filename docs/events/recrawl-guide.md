# Recrawl: Sofia-Wochenende 15.–17. Mai 2026

Zweck: kurz vor dem Trip (idealerweise Anfang Mai) nochmal die aktuellen Event-Listings abgreifen, neue Termine ergänzen, abgesagte/verschobene rauswerfen.

## So führst du das mit Claude aus

Schreib mir einfach: **"Lass uns den Sofia-Events-Recrawl machen"** — dann arbeite ich diese Datei Schritt für Schritt ab.

---

## Aktuell geseedete Events (Stand: 2026-04-28)

Quelle: [docs/events-research-2026-05-15.md](docs/events-research-2026-05-15.md), Code: [server/db/events-seed.ts](server/db/events-seed.ts)

| Tag | Zeit | Event | Venue |
|---|---|---|---|
| Fr 15.05. | 19:00 | Tinariwen — Hoggar Tour | NDK Hall 3 |
| Fr 15.05. | 18:00 | Sean Paul — Rise Jamaica | Vidas Art Arena |
| Sa 16.05. | 09:00 (weekly) | Farmers Market am Roman Wall | St. Sofia Church Park |
| Sa 16.05. | 16:00 | Levski vs CSKA — Ewiges Derby | Vasil Levski Stadium |
| Sa 16.05. | 19:00 | Queen of the Opera (Maria Guleghina) | Sofia Opera |
| Sa 16.05. | 19:30 | Convenience Store Woman | Ivan Vazov National Theatre |
| Sa 16.05. | — | Antistatic Festival (bis Di 19.05.) | TBA |
| So 17.05. | 16:00 | La Cenerentola (Rossini) | Sofia Opera |
| So 17.05. | 19:30 | Loot (Komödie, Joe Orton) | Ivan Vazov National Theatre |

## Quellen (parallel abfragen via WebSearch/WebFetch)

1. **operasofia.bg** — `https://www.operasofia.bg/en/calendar/2026-05` (vollständiger Mai-Spielplan)
2. **NDK** — `https://ndk.bg/Program/Events-37EN.html` und Songkick `https://www.songkick.com/venues/67158-national-palace-of-culture`
3. **Sofia 2026 Konzert-Aggregat** — `https://www.songkick.com/metro-areas/26892-bulgaria-sofia/2026-may`
4. **visitsofia.bg** — `https://www.visitsofia.bg/en/events-calendar`
5. **Bulgarian Football** — `https://en.bulgarian-football.com/season-2025-2026/parva-liga.html` (Round 35/36 Fixtures, Levski/CSKA/CSKA 1948/Ludogorets-Heimspiele in Sofia)
6. **Ivan Vazov Theater** — `https://nationaltheatre.bg/en/programme?day=&month=05&year=2026` (nur prüfen ob mal was visuelles dabei ist — Ballett, Tanz)
7. **AllEvents Sofia** — `https://allevents.in/sofia/all` und `/this-weekend`
8. **festteam.bg** — `https://festteam.bg/en/eventer-category/enconcerts/`
9. **ticketstation.bg** — checken ob neue Konzert-Ankündigungen für 15.-17.05. dazu kamen
10. **Vidas Art Arena Facebook** — Ergänzungen zu Sean Paul (manchmal Doppelpacks am Wochenende)

## Worauf achten

- **Status-Check** für jedes geseedete Event: noch aktuell? abgesagt/verschoben? Uhrzeit unverändert?
- **Neue Events** die zwischen Recherche-Datum und heute aufgeschaltet wurden — besonders Konzerte (oft kurzfristig)
- **Football**: Liga endet meist Ende Mai/Anfang Juni. Saison-Endspurt bringt manchmal Pokalfinals oder Aufstiegsspiele
- **Festivals/Märkte** die nur Anfang Mai bekannt gegeben werden (Frühsommer-Spezial-Events, Stadtfest)
- **Wetter-/Saison-Effekte**: Open-Air-Events könnten verschoben werden (Vidas Art Arena, Borisova-Park)

## Wie eintragen

Datei: [server/db/events-seed.ts](server/db/events-seed.ts)

- **Neuer Event mit existierendem Venue auf der Map**: `venue_lookup_name: 'Sofia Opera and Ballet'` (oder einer der Locations aus der DB)
- **Neuer Event mit neuem Venue**: zusätzliche Location idempotent in `ensureEventVenueExtras()` in [server/db/seed.ts](server/db/seed.ts) ergänzen (Pattern wie Sofia Opera + Vidas Art Arena)
- **Kein Map-Pin nötig**: nur `venue_name`, `venue_lat`, `venue_lng` setzen — Card zeigt dann Plain-Text statt Chip
- **Wöchentlich**: `recurrence: 'weekly:5'` (Mo=1 … So=7), `start_date: null`. Optional `recurrence_until: '2026-05-17'`
- **Mehrtags-Festival**: `start_date` + `end_date` setzen, beide ISO `YYYY-MM-DD`

## Reseed durchführen

```bash
# Lokale Dev-DB resetten
rm -rf data/sofia-guide.db data/sofia-guide.db-shm data/sofia-guide.db-wal
npx tsx server/db/init-admin.ts   # falls vorhanden, sonst Server-Start triggert seed

# Oder via reseed-Skript
npx tsx server/db/reseed.ts
```

## Verifikation

```bash
# Recurrence-Tests müssen grün bleiben
npx vitest run tests/server/event-recurrence.test.ts tests/server/events-api.test.ts

# API-Check
curl 'http://localhost:3002/api/events?from=2026-05-15&to=2026-05-17' | jq '.[] | {date: .occurrence_date, time: .start_time, title, venue: .location_name}'

# UI: Sofia-Reiter öffnen, prüfen dass alle Events in den richtigen Tages-Blöcken stehen und Venue-Chips aufs richtige Pin springen
```

## Production-Deploy

Nach erfolgreichem lokalem Reseed:
- Seed-Datei committen + pushen → GitHub Actions baut neues Image → Watchtower deployt automatisch
- **Achtung**: prod-DB hat bereits Events. Damit der neue Seed greift, vor Deploy via SSH die events-Tabelle leeren:
```bash
ssh sebastian@192.168.178.160 "docker exec -it sofia-guide sqlite3 /app/data/sofia-guide.db 'DELETE FROM events;'"
```
Danach Container restart (Watchtower oder manuell), Seed läuft beim Start gegen leere events-Tabelle und füllt nach.
