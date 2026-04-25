# Architecture

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript, Leaflet.js / react-leaflet, PWA via vite-plugin-pwa
- **Backend:** Node.js 22 + Express 5 + TypeScript
- **DB:** SQLite (better-sqlite3)
- **Icons:** lucide-react
- **Fonts:** Playfair Display (Headlines) + DM Sans (Body)
- **Deploy:** Docker → ghcr.io → Watchtower → sofia.eventig.app

## Projektstruktur

```
src/                    ← Vite + React Frontend
  components/           ← UI-Komponenten (Map, BottomSheet, FilterBar, NoteBoard...)
  pages/                ← Tab-Pages (MapPage, HotelPage, SurvivalPage, SofiaPage, NotesPage)
  hooks/                ← Custom Hooks (useLocations, useNotes, useMapTiles)
  lib/                  ← API-Client, Leaflet-Helpers

server/
  index.ts              ← Express-Server (Port 3002)
  routes/               ← Express Routes (/api/locations, /api/categories, /api/notes, /api/events)
  db/                   ← SQLite-Verbindung (better-sqlite3)
  socket.ts             ← Socket.IO GPS-Broadcast

tests/                  ← API + Komponenten-Tests (Vitest)
```

## Features

| Tab | Inhalt |
|---|---|
| **Karte** | Leaflet-Karte mit 70+ Locations, Farbkodierung nach Kategorie, GPS / Live-Tracking |
| **Hotel** | Hotel Niky: Adresse, Anreise vom Flughafen, Check-in/out, Tipps |
| **Survival** | Bulgarische Phrasen, Kulturschocks (Kopf = Ja!), Preise, Transport, Notruf |
| **Sofia** | Fun Facts, Kulturschocks, Events, Bestelltipps |
| **Notizen** | Offenes kollaboratives Board, kein Login, auto-refresh alle 30 Sek |

## Datenbank-Schema

- **categories** - Kategorien (Sehenswürdigkeiten, Restaurants, etc.)
- **locations** - 70+ Locations mit Details (website, address, hours, menus)
- **notes** - Kollaborative Notizen mit Emoji-Auth
- **user_sessions** - Emoji-basierte Identifikation
- **events** - Events (Konzerte, Oper, Sport, Märkte)
- **gps_locations** - Live-GPS der User (Socket.IO Broadcast)

## API-Endpunkte

- `GET/POST /api/locations` - Locations CRUD
- `GET/POST /api/categories` - Kategorien CRUD
- `GET/POST /api/notes` - Notizen CRUD
- `GET/POST /api/events` - Events mit Recurrence
- `GET/POST /api/user-sessions` - Emoji-Login
- `PATCH /api/user-sessions/:id/emoji` - Emoji wechseln
- `DELETE /api/user-sessions/:id` - Logout

## PWA

Offline-Caching via vite-plugin-pwa:
- Pre-cache OSM-Tiles für Sofia-Zentrum
- Service Worker für Offline-Nutzung

## GPS / Socket.IO

- User-Location Broadcast via Socket.IO
- Live-Tracking (1×, 2×, 3× Click = On/Follow/Off)
- 5-Minuten-Fenster für Upsert
