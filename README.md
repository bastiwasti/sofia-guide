# Sofia Guide

Mobiler Reiseführer für einen Sofia-Wochenendtrip (8 Freunde, Mai 2026). Interaktive Karte als Herzstück, kuratierte Inhalte zu Hotel, Transport und Kultur, kollaboratives Notiz-Board — offline-fähig via PWA.

**Live:** [sofia.eventig.app](https://sofia.eventig.app)

---

## Features

| Tab | Inhalt |
|---|---|
| **Karte** | Leaflet-Karte mit 70+ Locations, Farbkodierung nach Kategorie, Kategorie-Filter, Tap → Bottom-Sheet, Entfernungsringe vom Hotel, GPS / Live-Tracking |
| **Hotel** | Hotel Niky: Adresse, Anreise vom Flughafen, Check-in/out, Tipps |
| **Survival** | Bulgarische Phrasen, Kulturschocks (Kopf = Ja!), Preistabelle, Transport, Notrufnummern |
| **Sofia** | Fun Facts, Kulturschocks, Bestelltipps, Touristenfallen |
| **Notizen** | Offenes kollaboratives Board, kein Login, auto-refresh alle 30 Sek |

**GPS-Button (Karte):** 1× klick → Position einmalig anzeigen · 2× klick → Live-Follow · 3× klick → aus

**Edit-Modus (Neu-Button):** Karten-Klick → neue Location per Formular hinzufügen (Nominatim-Geocoding). Löschen erfordert Passwort.

---

## Stack

- **Frontend:** Vite + React 18 + TypeScript, Leaflet.js / react-leaflet, PWA via vite-plugin-pwa
- **Backend:** Node.js 22 + Express 5 + TypeScript
- **DB:** SQLite (better-sqlite3)
- **Icons:** lucide-react
- **Fonts:** Playfair Display (Headlines) + DM Sans (Body)
- **Deploy:** Docker → ghcr.io → Watchtower → sofia.eventig.app

---

## Lokales Setup

### Voraussetzungen

- Node.js 22+
- npm

### Installation

```bash
npm install
```

### Datenbank initialisieren

```bash
npm run db:migrate       # Schema anlegen
npx tsx server/db/seed.ts  # 70+ Locations einspielen
```

### Entwicklung

Zwei Prozesse parallel starten:

```bash
# Terminal 1 – Backend (Port 3002)
npm run server:dev

# Terminal 2 – Frontend (Port 3000, HTTPS)
npm run dev
```

Vite proxied `/api/*` automatisch auf den Backend-Port.

**HTTPS für GPS:** Der Dev-Server läuft mit selbst-signiertem Zertifikat. Beim ersten Aufruf im Browser die Sicherheitswarnung manuell bestätigen. Für LAN-Zugriff (z.B. Handy) muss das Zertifikat die LAN-IP als SAN enthalten:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout /tmp/key.pem -out /tmp/cert.pem -days 365 \
  -subj "/CN=192.168.178.192" \
  -addext "subjectAltName=IP:192.168.178.192,IP:127.0.0.1,DNS:localhost"
```

### Build

```bash
npm run build
```

---

## Projektstruktur

```
src/
  components/
    Map.tsx             ← Leaflet-Karte, Pins, Ringe, GPS-Marker
    BottomSheet.tsx     ← Tap-to-Detail Overlay (mobil)
    FilterBar.tsx       ← Kategorie-Toggle-Buttons
    LocationForm.tsx    ← Neue Location hinzufügen (Edit-Modus)
    CategoryForm.tsx    ← Neue Kategorie anlegen
    TabNavigation.tsx   ← Bottom-Tab-Bar (5 Tabs)
  pages/
    MapPage.tsx         ← Hauptseite mit Karte + GPS + Edit-Modus
    HotelPage.tsx       ← Hotel Niky Content
    SurvivalPage.tsx    ← Phrasen, Preise, Transport, Notruf
    SofiaPage.tsx       ← Fun Facts & Kulturschocks
    NotesPage.tsx       ← Kollaboratives Notiz-Board
  hooks/
    useLocations.ts     ← GET/POST /api/locations
    useCategories.ts    ← GET/POST /api/categories
    useNotes.ts         ← GET/POST /api/notes + auto-refresh
  lib/
    api.ts              ← fetch-Wrapper für alle API-Calls
    leaflet.ts          ← Custom Icons, Koordinaten-Helpers
    geocoding.ts        ← Nominatim-Adresssuche (OSM, kein API-Key)

server/
  index.ts              ← Express-Server (Port 3002)
  routes/
    locations.ts        ← GET /api/locations, POST /api/locations/:id
    categories.ts       ← GET /api/categories, POST /api/categories
    notes.ts            ← GET /api/notes, POST /api/notes, DELETE /api/notes/:id
  db/
    index.ts            ← SQLite-Verbindung (better-sqlite3)
    schema.sql          ← Tabellen: categories, locations, notes
    migrate.ts          ← Schema anwenden
    seed-data.ts        ← Alle 70+ Locations als TypeScript-Objekte
    seed.ts             ← Seed-Script

public/
  icons/                ← PWA Icons (192×192, 512×512)
  images/               ← Hero-Bilder

tests/                  ← API + Komponenten-Tests (Vitest)
```

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

## Deployment

Läuft über die standard Homelab-Pipeline:

```
git push → GitHub Actions (build + push) → ghcr.io/bastiwasti/sofia-guide → Watchtower → live
```

Manuell deployen:

```bash
ssh sebastian@192.168.178.160 "cd /opt/apps/sofia-guide && docker compose pull && docker compose up -d --force-recreate"
```

Logs checken:

```bash
ssh sebastian@192.168.178.160 "docker logs sofia-guide --tail 50"
```

---

## Daten

Alle Locations sind in `server/db/seed-data.ts` gepflegt — kein Scraping, kein externes API. Karten-Anker ist **Hotel Niky** (lat: 42.6953, lng: 23.3219). Die Entfernungsringe zeigen 300m / 600m / 900m / 1,2km / 1,5km vom Hotel.

Geocoding (Adresssuche im Edit-Modus) läuft über [Nominatim](https://nominatim.openstreetmap.org) — kostenlos, kein API-Key nötig.
