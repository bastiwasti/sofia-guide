# Sofia Guide

## Mission
Mobiler Reiseführer für einen Sofia-Wochenendtrip (8 Freunde, Mai 2026). Interaktive Karte als Herzstück, kuratierte Inhalte, kollaboratives Notiz-Board, offline-fähig via PWA.

## Stack
- **Frontend:** Vite + React + TypeScript, Leaflet.js, vite-plugin-pwa
- **Backend:** Node.js 22 + Express + TypeScript
- **DB:** SQLite (better-sqlite3)
- **Design:** Mobile-first, cream (#faf7f2), Playfair Display (Headlines), DM Sans (Body)
- **Deploy:** Docker → ghcr.io/bastiwasti/sofia-guide → Watchtower → sofia.eventig.app

## Architecture
```
src/                    ← Vite + React Frontend
  components/           ← UI-Komponenten (Map, BottomSheet, FilterBar, NoteBoard...)
  pages/                ← Tab-Pages (MapPage, HotelPage, SurvivalPage, SofiaPage, NotesPage)
  data/                 ← Statische Seed-Daten (locations.ts, categories.ts, content.ts)
  hooks/                ← Custom Hooks (useLocations, useNotes, useMapTiles)
  lib/                  ← API-Client, Leaflet-Helpers
server/
  routes/               ← Express Routes (/api/locations, /api/categories, /api/notes)
  db/                   ← SQLite Setup, Migrations, Seed (seed-data.ts = alle 43 Locations)
public/
  icons/                ← PWA Icons
tests/                  ← API + Komponenten-Tests
```

**Tab-Navigation (5 Tabs):**
1. `Karte` — Leaflet Map, farbcodierte Pins, Kategorie-Filter, Tap-to-Popup/BottomSheet, Entfernungsringe
2. `Hotel` — Hotel Niky: Geschichte, Adresse, Anreise, Umgebung, Tipps
3. `Survival` — Bulgarische Phrasen, Kulturschock-Hints, Preise, Transport, Notfallnummern
4. `Sofia` — Fun Facts & Kulturschocks (unterhaltsam, locker geschrieben)
5. `Notizen` — Offenes kollaboratives Board, kein Login, Timestamp + opt. Name/Emoji

**Edit-Modus** (Button in der Karte, kein eigener Tab):
- Neue Locations hinzufügen: Name, Kategorie, Koordinaten per Karten-Klick oder Adresse (Nominatim)
- Neue Kategorien mit eigener Farbe anlegen
- Kein Auth, URL-Kenntnis = Zugang

## Seed-Daten
Alle 43 Locations (1 Hotel, 12 Sights, 12 Restaurants, 9 Bars, 6 Craft Beer, 3 Nightlife) sind bereits extrahiert in `server/db/seed-data.ts`. Kein Zugriff auf externe Dateien nötig.

Hotel Niky Koordinaten (Karten-Anker): **lat: 42.6953, lng: 23.3219**

## Farbschema (aus Original übernehmen)
- Sehenswürdigkeiten: `#C2185B`
- Restaurants: `#3B6D11`
- Kneipen & Bars: `#9B2915`
- Craft Beer: `#185FA5`
- Nightlife: `#2c2c2a`
- Hotel: `#E5A038`
- Hintergrund: `#faf7f2` (cream)
- Text: `#2c1810` (dunkelbraun)

## Implementation Tasks
Work through these in order:

1. [ ] **Projekt-Setup:** `package.json` (root mit workspaces oder monorepo), TypeScript-Config, Vite-Config mit vite-plugin-pwa, ESLint
2. [ ] **DB & Seed:** SQLite-Schema (categories, locations, notes), Migrations, Seed-Script aus `server/db/seed-data.ts`
3. [ ] **Backend API:** Express-Server, Routes: `GET/POST /api/locations`, `GET/POST /api/categories`, `GET/POST /api/notes`
4. [ ] **Karte (Kern-Feature):** Leaflet-Integration, Pins mit Farbkodierung aus Kategorie, Kategorie-Filter-Bar (Toggle-Buttons), Tap → Bottom-Sheet mit Details, Entfernungsringe 300m/600m/900m/1.2km/1.5km vom Hotel
5. [ ] **PWA Offline-Caching:** Workbox Service Worker, pre-cache OSM-Tiles für Sofia-Zentrum Zoom 14–17, Lade-Indikator beim ersten Öffnen
6. [ ] **Hotel Niky Page:** Recherchiere und schreibe Content — Geschichte des Hotels (gegründet wann, welche Gäste, Besonderheiten), Adresse (Neofit Rilski 16), Check-in/out, Anreise von Flughafen SOF (Metro M4 → Serdica → M2 → NDK, oder Bolt ~15€), Metro-Station NDK in 5 Min, praktische Tipps
7. [ ] **Survival Guide Page:** Phrasen-Tabelle (Hallo/Danke/Bitte/Prost/Bier bitte/Rechnung/Toilette/Entschuldigung + Phonetik), **PROMINENT: Kopfschütteln=JA, Nicken=NEIN**, Preistabelle (Bier 2-4€, Rakia 1-2€, Cocktail 4-7€, Essen 8-15€, Taxi 2-5€, Metro 1.60€), Transport-Karten (Bolt zuerst / Metro M2 / Taxi OK Supertrans +359 2 973 2121), Notruf 112/166/160/150. Ton: locker, ein Freund erklärt.
8. [ ] **Sofia Fun Facts Page:** Schreibe unterhaltsamen Content für Männer Ende 30. Muss enthalten: (a) Fun Facts: Sofia älteste Hauptstadt Europas gegründet ~7000 v.Chr., Mineralquellen direkt unter der Stadt (kostenlos nutzbar), streunende Hunde mit Ohrmarken (harmlos, stadtbekannt), Vitosha-Berg 2290m direkt hinter der Skyline, Bulgarien seit 1.1.2025 in der Eurozone, Sofia hat mehr Bars pro Kopf als München; (b) Kulturschocks: Kopf/Nicken vertauscht, Rakia-Etikette (immer mit Salat trinken!), Chalga-Musik (bulg. Turbo-Folk — wird man nicht entkommen), Mehana = traditionelles Wirtshaus (immer wählen!), keine echte Sperrstunde, Servicepersonal spricht fast immer Englisch; (c) Wie bestelle ich wie ein Einheimischer; (d) 2-3 Touristenfallen. Ton: witzig, direkt.
9. [ ] **Notiz-Board:** POST/GET `/api/notes`, Board-UI mit Cards, Einträge sortiert by created_at DESC, auto-refresh alle 30 Sek, opt. Name/Emoji-Feld
10. [ ] **Edit-Modus:** Toggle-Button in Karte, Location-Formular: Karten-Klick für Koordinaten + Adresssuche via Nominatim OSM API, Kategorie-Dropdown (bestehend) + "Neue Kategorie" mit Color-Picker
11. [ ] **Design & Mobile Polish:** Playfair Display + DM Sans via Google Fonts, Sofia-Fotos als Hero-Bilder (Unsplash API oder statisch in `public/images/`), responsive Bottom-Sheet für Karten-Popups, Touch-optimierte Karte (keine Doppeltap-Zoom-Probleme)
12. [ ] **Dockerfile + GitHub Actions:** Multi-stage Build (node:22-alpine), CI/CD Pipeline nach Standard-Pattern, Pre-push Hook
13. [ ] **Tests:** API-Endpoints (Vitest), kritische UI-Pfade

## Constraints & Conventions
- **Mobile-first:** Primär Handy 390px — alles muss dort gut aussehen
- **Kein Auth:** Offener Zugang, jeder mit URL kann lesen und editieren
- **Offline-Karte:** Tiles pre-cachen beim ersten App-Öffnen, Ladeindikator zeigen
- **Ton der Inhalte:** Locker, humorvoll, unter Freunden — nicht Wikipedia
- **Keine Features außerhalb der Task-Liste**
- Geocoding via Nominatim (OSM, kostenlos, kein API-Key nötig)

## Out of Scope
- User-Accounts / Auth / Login
- Tagesplanung / Itinerary / Kalender
- Kommentare an einzelnen Locations
- Multi-City-Support
- Push Notifications
- Echtzeit-Kollaboration (Notiz-Board reicht mit 30-Sek-Refresh)
