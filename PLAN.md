# Smiley-Login wiederherstellen (UserAvatar + EmojiPickerModal)

## Context
Nach dem Refactor ist das Smiley-Login-System kaputt. Drei gleichzeitige Ursachen:
1. **Backend ist abgeklemmt:** In [server/index.ts](server/index.ts) sind alle `/api/user-sessions*`-Routes entfernt und `initializeDatabase()` wird nicht mehr aufgerufen. `curl http://localhost:3002/api/user-sessions` → 404.
2. **Frontend-Architektur passt nicht mehr:** Der Refactor hat den Login inline in die TabNavigation gezogen. User möchte zurück zum alten Design: UserAvatar-Button unten rechts an der Navigationsleiste, der ein Modal öffnet.
3. **Dead Code ist eigentlich das Zielbild:** Die "verwaisten" Dateien [src/components/UserAvatar.tsx](src/components/UserAvatar.tsx) und [src/components/EmojiPickerModal.tsx](src/components/EmojiPickerModal.tsx) sollen wiederbelebt werden — mit einer Anpassung am Recover-Flow.

**Strategischer Kontext:** User hat klargestellt, dass das `session_id`-System als Fundament bleibt — in späteren Iterationen wird es an Notes, Karte und weitere Features angebunden. Diese Runde stabilisiert nur das Login/Switch/Recover selbst. Die `session_id` muss also stabil, persistent und im Frontend über `session.session_id` sauber verfügbar bleiben (bereits der Fall — keine Änderung am Hook oder Backend-Schema nötig).

## Zielbild (vom User vorgegeben)
- **UserAvatar-Button** unten rechts an der Navigationsleiste (bereits korrekt als floating button gestylt in [UserAvatar.tsx:49-67](src/components/UserAvatar.tsx#L49-L67))
- **Nicht eingeloggt → Modal mit 2 Tabs:**
  - "Neu wählen": Emoji aus Liste (freie) + 4-Char-Recovery-Code → anlegen
  - "Wiederherstellen": Liste **aller belegten Emojis** anzeigen → Emoji klicken → Code-Feld → Recover-Button. Begründung vom User: "die codes werden mehrfach vergeben sein" — ein Code-First-Filter würde kollidieren.
- **Eingeloggt → Modal:**
  - Profil-View (aktuelles Emoji, Code, Erstellt-am)
  - Button "Emoji wechseln" → Liste der freien Smilies → neues Emoji wählen → **aktueller Recovery-Code + Birthday-Passwort eingeben** → "Wechseln". User-Vorgabe: "Code und Passwort beim Switch bleiben — nicht für Sicherheit, sondern als Friktion, damit das nicht leichtfertig gemacht wird."
  - Button "Smiley aufgeben" (Logout + Session delete, Birthday-Passwort-Prompt wie gehabt)

## Änderungen

### 1. Backend: Routes wieder registrieren — [server/index.ts](server/index.ts)
- Imports hinzufügen:
  - `import { getUserSessions, createUserSession, reclaimUserSession, updateUserSessionEmoji, deleteUserSession } from './routes/user-sessions'`
  - `import { initializeDatabase } from './db'`
- Vor `app.listen(…)`: `initializeDatabase()` aufrufen.
- Routes registrieren (Methoden passend zu den API-Aufrufen in [useUserSessions.ts](src/hooks/useUserSessions.ts)):
  - `app.get('/api/user-sessions', getUserSessions)`
  - `app.post('/api/user-sessions', createUserSession)`
  - `app.put('/api/user-sessions/reclaim', reclaimUserSession)` *(Hook nutzt `api.put` in [useUserSessions.ts:53](src/hooks/useUserSessions.ts#L53))*
  - `app.patch('/api/user-sessions/:sessionId/emoji', updateUserSessionEmoji)`
  - `app.delete('/api/user-sessions/:sessionId', deleteUserSession)`

### 2. Backend bleibt unverändert bei recovery_code
- [server/routes/user-sessions.ts:19](server/routes/user-sessions.ts#L19) bleibt wie es ist — GET liefert **kein** `recovery_code` zurück. Der Client-seitige Code-Match fällt mit dem neuen Recover-Flow (siehe 5.) weg, also ist das Feld nicht mehr nötig im GET.

### 3. Frontend: TabNavigation aufräumen — [src/components/TabNavigation.tsx](src/components/TabNavigation.tsx)
- Kompletter Rollback des Inline-Pickers: alle States, Handler und das gesamte `{showEmojiPicker && …}`-JSX entfernen.
- Zweite Tabs-Row mit Emoji-Button entfernen.
- Zugehörige CSS-Klassen entfernen.
- `tab-navigation`-CSS: `height: 56px` fest, `transition`/`overflow:hidden` raus.
- Imports bereinigen: `X`, `LogOut`, `useState`, `useEffect`, `UserSession`, `useUserSessions`, `ALL_EMOJIS` alle raus.

### 4. Frontend: UserAvatar einbinden — [src/App.tsx](src/App.tsx)
- `import UserAvatar from './components/UserAvatar'` hinzufügen.
- Im JSX: `<UserAvatar />` innerhalb des `.app`-Wrappers rendern. Position wird per `position: fixed` in der Komponente selbst gemacht, Render-Reihenfolge egal.

### 5. Frontend: Recover-Flow umstellen auf Emoji-first — [src/components/EmojiPickerModal.tsx](src/components/EmojiPickerModal.tsx)
Der aktuelle Flow filtert die anzuzeigenden Emojis anhand eines eingegebenen Codes. Das funktioniert nicht, wenn mehrere User denselben Code wählen. Umstellung:
- `sessionsWithCode`-Variable + die zugehörige Filter-Logik entfernen.
- Im `reclaim-mode` stattdessen:
  - **Zuerst** ein Grid mit **allen** `sessions` (alle vergebenen Smilies) rendern. Klickbar → setzt `reclaimEmoji`.
  - Darunter: Recovery-Code-Input. Instruktionstext: "Wähle deinen Smiley und gib deinen Recovery-Code ein."
- `handleRecover` bleibt logisch wie bisher (`reclaimSession(reclaimEmoji, reclaimCode)`) — Server prüft den Code.
- `canSave()` für `reclaim`-Mode: `!!reclaimEmoji && validateCode(reclaimCode)` — **unverändert**.
- `disabledReason()` für `reclaim`: Texte umkehren — erst "Dein Emoji aus der Liste auswählen", dann "4-stelligen Recovery-Code eingeben".

### 6. Frontend: Switch-Flow bleibt wie im Original
User-Vorgabe: Friktion behalten (Code + Passwort → damit nicht leichtfertig gewechselt wird).

### 7. Frontend: Logout-Flow bleibt wie im Original
- `handleLogout` unverändert (`prompt()` mit Birthday-Passwort + `deleteSession`).

### 8. Hygiene
- `npx tsc --noEmit` soll ohne Fehler durchlaufen.

## Verifikation
1. `npm run dev` starten (Vite + Backend parallel).
2. **Backend up:** `curl http://localhost:3002/api/user-sessions` → HTTP 200, Array.
3. **Create-Flow:** Inkognito → unten rechts 👤-Button → "Neu wählen" → Emoji + 4-Char-Code → Speichern → Avatar zeigt das Emoji, `localStorage.userSession` gesetzt, DB-Row vorhanden, `session_id` stabil (UUID).
4. **Recover-Flow (neu):** Anderes Inkognito → 👤-Button → "Wiederherstellen" → Alle belegten Smilies sichtbar → einen klicken → Code eingeben → "Wiederherstellen" → eingeloggt. Bei falschem Code: Fehler-Banner, keine DB-Änderung.
5. **Recover-Kollisionsfall:** Zwei User mit gleichem Recovery-Code → beide sehen im Grid alle Emojis → jeder wählt seines → erfolgreicher Recover.
6. **Switch-Flow:** Eingeloggt → UserAvatar → "Emoji wechseln" → neues freies Emoji + **aktueller Recovery-Code** + **Birthday-Passwort** → "Wechseln" → Avatar zeigt neues Emoji, DB updated, `session_id` bleibt identisch.
7. **Logout-Flow:** UserAvatar → "Smiley aufgeben" → Passwort-Prompt → Session aus DB weg, Avatar zeigt wieder 👤.
8. **Session-ID-Stabilität (für spätere Features):** Nach Reload der Seite ist die `session_id` in `localStorage.userSession` unverändert und matched den DB-Eintrag. Nach Switch bleibt `session_id` gleich, nur `emoji` ändert sich.

## Out of Scope dieser Runde (kommen später)
- Anbindung von `session_id` an `notes` (FK in Schema + in POST/GET aufgreifen)
- Anbindung an `locations` / Karten-Marker-Authorship
- Weitere Features, die an `session_id` hängen (z. B. "meine Notizen filtern", "von mir angelegte Orte")
- Kein Redesign des Modals
- Kein `last_seen`-Heartbeat
