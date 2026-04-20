# Testing — Sofia Guide

## Was getestet wird

Der Testsuite-Fokus liegt auf den Funktionen, die du am meisten nutzen wirst:
**Emoji-Identität, Notizen mit Emojis, Locations mit Emojis und das GPS-System.**
Keine UI-Snapshot-Tests, keine Framework-Internals — nur echtes Verhalten, das
bei einem Bug auffallen würde.

**Insgesamt: ~51 Tests in 5 Dateien.**

## Was der Suite nicht tut (absichtlich)

- **Die Dev-Datenbank wird nicht angefasst.** Jeder Test läuft gegen eine frische
  SQLite-Datei in einem Temp-Verzeichnis (`process.env.SQLITE_DB_PATH`). Die
  Datei unter [data/sofia-guide.db](data/sofia-guide.db) bleibt unberührt — Mtime
  wird nach dem Lauf verifiziert.
- **Kein Mocking eigener Module.** Kein `vi.mock('../db')`. Die Tests fahren
  echte SQL-Queries gegen eine echte SQLite.
- **Keine Timing-basierten Waits.** Kein `setTimeout` zur Synchronisation. Alle
  asynchronen Pfade warten event-basiert (`socket.once('event', resolve)`).

## Scenario-Katalog

### A. Emoji-Identität — erstellen / wechseln / wiederherstellen / aufgeben
[tests/server/emoji-identity.test.ts](tests/server/emoji-identity.test.ts)

- Frisches Emoji + Recovery-Code anlegen
- Bereits vergebenes Emoji → 409 mit Liste aller belegten Emojis
- Zwei User mit unterschiedlichen Emojis gleichzeitig
- Recovery-Code-Validierung: 3 Zeichen, 5 Zeichen, Sonderzeichen → 400
- Emoji-Validierung: leer, > 4 Zeichen → 400
- Wiederherstellen mit korrektem Code → gleiche `session_id`, `last_seen` updated
- Wiederherstellen mit falschem Code → 401, `last_seen` unverändert
- Wiederherstellen für unbekanntes Emoji → 404
- Emoji wechseln (PATCH) auf freies Emoji → ok, `session_id` gleich
- Emoji wechseln mit falschem Recovery-Code → 401
- Emoji wechseln auf fremdes Emoji → 409
- Emoji wechseln auf eigenes aktuelles Emoji (No-op) → 200
- Emoji aufgeben (DELETE) → frei für andere
- Session validieren (aktiv) → `{valid:true, emoji}`
- Session validieren (nach DELETE) → `{valid:false}`

### B. Notizen mit Emojis
[tests/server/notes.test.ts](tests/server/notes.test.ts)

- Notiz posten → `backup_emoji` = aktuelles Emoji zum Schreibzeitpunkt
- Notizinhalt mit Emojis (z.B. "🍺 Bier super!") — korrekt gespeichert
- Post ohne `content` → 400
- Post ohne `session_id` → 400
- Post mit erfundener `session_id` → 404
- GET `/api/notes` sortiert newest-first
- GET liefert max. 50 (LIMIT geprüft mit 55 Einträgen)
- **User wechselt Emoji nach dem Posten** → alte Notizen zeigen neues
  `author_emoji` (JOIN), `backup_emoji` bleibt eingefroren
- **User gibt Emoji auf** → Notizen bleiben bestehen, `author_emoji` = null,
  `is_active_user = 0`, aber `backup_emoji` zeigt noch das ursprüngliche Emoji
- Eigene Notiz löschen → 200
- Fremde Notiz löschen → 403
- Legacy-Notiz (`session_id IS NULL`) löschen → 200
- Nicht existierende Notiz löschen → 404

### C. Locations mit Emojis
[tests/server/locations.test.ts](tests/server/locations.test.ts)

- Location mit Session anlegen → `backup_emoji` gesetzt
- Location-Name mit Emoji — korrekt gespeichert
- GET `/api/locations` mit Category-Join (`category_name`, `category_color`, `category_icon`)
- GET leer → `[]`
- Post ohne `name` / `lat` / `lng` → 400
- Post mit nicht existierender `category_id` → 500 (aktuelles Verhalten)
- **User wechselt Emoji** → Locations zeigen neues `author_emoji`, `backup_emoji` bleibt
- **User gibt Emoji auf** → Location bleibt, `author_emoji` = null, `backup_emoji` bleibt
- Eigene Location löschen → 200
- Fremde Location ohne Admin-Passwort löschen → 403
- Fremde Location mit Admin-Passwort `24031986` löschen → 200
- Legacy-Location (`session_id IS NULL`) löschen → 200
- Nicht existierende Location löschen → 404
- GET Location by id → ok
- GET mit unbekannter id → 404

### D. Categories (Fundament für Locations)
[tests/server/categories.test.ts](tests/server/categories.test.ts)

- GET sortiert alphabetisch
- Neue Kategorie mit name/color/icon anlegen
- Post ohne name/color/icon → 400
- Doppelter Name → UNIQUE-Fehler (500 aktuell)

### E. GPS — dein Emoji und die der anderen sichtbar (3 Smoke-Tests)
[tests/server/gps-socket.test.ts](tests/server/gps-socket.test.ts)

Echter Socket.IO-Server auf zufälligem Port, echte `socket.io-client`-Verbindungen.

- **E1:** User A sendet `user-location-update` → DB hat aufgeräumten Upsert-Row
  mit korrekter `session_id`
- **E2:** User B (im Raum `sofia-guide`) empfängt User As Broadcast
  → **"Andere sind sichtbar"** ✅
- **E3:** User A empfängt auch seinen eigenen Broadcast zurück
  → **"Dein eigenes Emoji ist sichtbar"** ✅

Randfälle (5-Minuten-Fenster, Duplicate-Prevention, `emoji ||` Fallback) sind
absichtlich weggelassen — die drei obigen decken deine gestellte Frage ab.

## Produktions-Änderungen (minimal, rückwärtskompatibel)

1. **[server/db/index.ts](server/db/index.ts)** — DB-Pfad ist konfigurierbar
   über `process.env.SQLITE_DB_PATH`. Default bleibt `data/sofia-guide.db` →
   Produktion ist nicht betroffen.
2. **[server/socket.ts](server/socket.ts)** (neu) — Socket.IO-Handler aus
   `server/index.ts` extrahiert in `registerSocketHandlers(io)`. Identisches
   Verhalten, nur importierbar.
3. **[package.json](package.json)** — `"test": "vitest run"`-Skript,
   Dev-Dependencies `vitest` + `supertest` + `@types/supertest`.

## Ausführen

```bash
npm install        # einmalig, nachdem dev-deps dazu kamen
npm test           # alle ~51 Tests
npx vitest         # Watch-Mode während Entwicklung
```

## Was die Tests nicht prüfen (Follow-ups)

- **Frontend-Hooks** (`useLocations`, `useNotes`, `EmojiPickerModal`) — separat
  möglich, wenn du willst; braucht `jsdom` + `@testing-library/react`.
- **Dokumentierte, aber nicht implementierte Features:**
  1. `EMOJI_SYSTEM.md` sagt Recovery-Codes wären case-insensitive — der Code
     vergleicht mit strengem `!==` ([user-sessions.ts:95](server/routes/user-sessions.ts#L95)).
  2. `EMOJI_SYSTEM.md` sagt "Emoji wechseln" braucht das Admin-Passwort — der
     Code prüft nur den Recovery-Code. Tests assertieren das aktuelle Code-Verhalten;
     ob Doc oder Code angepasst werden soll, ist deine Entscheidung.

## Regeln, nach denen die Tests geschrieben sind

- Mocks nur an Systemgrenzen (Socket.IO-Server in REST-Tests gestubbt, weil wir
  HTTP-Verhalten testen, nicht Broadcast-Internals). Nie eigene Module gemockt.
- Keine Timer-basierten Waits; alle Async-Pfade warten auf Events oder Promises.
- Jede Kategorie laut Skill-Regel 3 abgedeckt: Empty / Boundary / Invalid /
  Error / Auth.
- Destructive Sanity Check nach dem Grün-Lauf: eine Assertion absichtlich kippen
  um zu verifizieren, dass die Suite wirklich rot wird.
