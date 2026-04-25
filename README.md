# Sofia Guide

Mobiler Reiseführer für einen Sofia-Wochenendtrip (8 Freunde, Mai 2026). Interaktive Karte als Herzstück, kuratierte Inhalte zu Hotel, Transport und Kultur, kollaboratives Notiz-Board — offline-fähig via PWA.

**Live:** [sofia.eventig.app](https://sofia.eventig.app)

---

## Features

| Tab | Inhalt |
|---|---|
| **Karte** | Leaflet-Karte mit 70+ Locations, Farbkodierung nach Kategorie, GPS / Live-Tracking |
| **Hotel** | Hotel Niky: Adresse, Anreise vom Flughafen, Check-in/out, Tipps |
| **Survival** | Bulgarische Phrasen, Kulturschocks (Kopf = Ja!), Preise, Transport, Notruf |
| **Sofia** | Fun Facts, Kulturschocks, Events, Bestelltipps |
| **Notizen** | Offenes kollaboratives Board, kein Login, auto-refresh alle 30 Sek |

**GPS-Button:** 1× klick → Position einmalig anzeigen · 2× klick → Live-Follow · 3× klick → aus

**Edit-Modus:** Karten-Klick → neue Location per Formular hinzufügen (Nominatim-Geocoding)

---

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript, Leaflet.js, PWA
- **Backend:** Node.js 22 + Express 5 + TypeScript
- **DB:** SQLite (better-sqlite3)
- **Deploy:** Docker → ghcr.io → Watchtower

---

## Quick Start

```bash
# Installation
npm install

# DB initialisieren
npm run db:migrate
npx tsx server/db/seed.ts

# Entwicklung (2 Terminals)
npm run server:dev  # Terminal 1 - Backend (Port 3002)
npm run dev         # Terminal 2 - Frontend (Port 3000, HTTPS)
```

---

## Dokumentation

- **[Development Guide](docs/development.md)** - Lokales Setup, Dev-Server, Tests
- **[Deployment Guide](docs/deployment.md)** - Docker, CI/CD, Prod-Deploy
- **[Architecture](docs/architecture.md)** - Tech Stack, Projektstruktur, API
- **[Testing](TESTING.md)** - Test-Suite, Verifikation
- **[Emoji System](EMOJI_SYSTEM.md)** - Emoji-basierte Identifikation

---

## Farbschema

| Kategorie | Farbe |
|---|---|
| Sehenswürdigkeiten | `#C2185B` |
| Restaurants | `#3B6D11` |
| Kneipen & Bars | `#9B2915` |
| Craft Beer | `#185FA5` |
| Nightlife | `#2c2c2a` |
| Hotel | `#E5A038` |
| Hintergrund | `#faf7f2` (cream) |
| Text | `#2c1810` (dunkelbraun) |

---

## Historische Dokumentation

Alte Recherchen, Pläne und Forschungsergebnisse sind archiviert in `docs/research-archive/`:
- Bar-Recherche (RESEARCH_*.md)
- OSM-Adressen (OSM_*.md)
- Restaurant-Recherche (restaurant-*.md)
- Events (events/)

---

## License

Privat — für den Sofia-Wochenendtrip Mai 2026.
