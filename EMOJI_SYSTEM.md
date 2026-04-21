# Emoji-Identifikationssystem

## Überblick

Das Sofia Guide verwendet ein Emoji-basiertes Identifikationssystem statt klassischem Login/Passwort. Jeder Benutzer wählt ein Emoji aus einer Liste und definiert einen 4-stelligen Recovery-Code. Keine Registrierung, keine E-Mail, keine Passwörter — einfach und anonym.

## Warum Emojis?

- **Schnelligkeit:** Kein Formular ausfüllen, nur Emoji tippen
- **Spaß:** Persönliche Note statt technischer ID
- **Einfach:** Recovery-Code leicht zu merken
- **Anonym:** Keine persönlichen Daten nötig
- **Freundlich:** Für einen Wochenendtrip mit Freunden optimiert

---

## User Flows

### 1️⃣ Nicht eingeloggt

Wenn du noch kein Emoji hast, öffnet sich beim Klick auf das User-Icon ein Modal mit **2 Tabs**:

#### Tab 1: "Neu wählen" (Erstellung)
1. Gib einen Recovery-Code ein (4 Zeichen, Buchstaben + Zahlen)
   - Beispiele: `A7X2`, `K9ZM`, `B4P1`
2. Wähle ein Emoji aus der Liste
   - Verfügbare Emojis sind hell markiert
   - Belegte Emojis zeigen 🔒-Icon und sind deaktiviert
3. Klicke "speichern"
4. ✅ Dein Emoji wird gespeichert und steht überall zur Verfügung

#### Tab 2: "Wiederherstellen" (Reclaim)
1. Gib deinen Recovery-Code ein (4 Zeichen)
2. **Das passende Emoji wird automatisch angezeigt** (es wird in Großformat zentriert)
3. Wenn kein Emoji mit diesem Code gefunden wird: "Kein Emoji mit diesem Recovery-Code gefunden"
4. Klicke "Wiederherstellen"
5. ✅ Deine Session wird reaktiviert

**Warum Recovery-Code?**
- Falls du dein Handy verlierst, kannst du dich auf einem anderen Gerät mit deinem Code + Emoji wieder einloggen
- Keine E-Mail nötig
- Code ist nur 4 Zeichen → einfach zu merken

---

### 2️⃣ Eingeloggt

Wenn du bereits ein Emoji hast, zeigt das Modal dein Profil:

#### Profil-Ansicht
- **Großes Emoji** (animiert)
- **Dein Recovery-Code** (sichtbar)
- **Erstellt am:** Datum
- **Zwei Buttons:**
  1. 🟣 **"Emoji wechseln"** (lila)
  2. 🔴 **"Smiley aufgeben"** (rot)

---

### 3️⃣ Emoji wechseln

Klicke auf "Emoji wechseln" → öffnet sich der Wechsel-Modus:

#### Schritte
1. Wähle ein **neues** Emoji aus der Liste (nur freie Emojis)
2. Gib deinen **aktuellen** Recovery-Code ein (Bestätigung, dass du es bist)
3. Gib das **Passwort** ein (Bastis Geburtstag: 24031986)
4. Klicke "Wechseln"
5. ✅ Dein Emoji wird gewechselt, der Recovery-Code bleibt gleich

#### Validierung
Der "Wechseln"-Button ist deaktiviert bis:
- ✅ Neues Emoji ausgewählt
- ✅ Aktueller Recovery-Code korrekt
- ✅ Passwort eingegeben

#### Hinweise
- Dein Recovery-Code bleibt gleich (du musst dich keinen neuen merken!)
- Es werden **nur freie Emojis** angezeigt (belegte sind ausgeblendet)
- Deine bisherigen Notizen bleiben erhalten (session_id ändert sich nicht)

---

### 4️⃣ Smiley aufgeben (Logout)

Klicke auf "Smiley aufgeben" → deaktiviert deine Session:

#### Bestätigungsdialog
```
Smiley 😎 wirklich aufgeben?

Dein Recovery-Code wird gelöscht, der Smiley wird wieder frei und kann von jemand anderem gepickt werden. Das lässt sich nicht rückgängig machen.

Passwort zum Bestätigen (Bastis Geburtstag):
```

#### Ablauf
1. Passwort eingeben
2. Klicke "OK"
3. ✅ Session wird gelöscht, Emoji ist wieder frei

**⚠️ Warnung:** Nach dem Aufgeben kannst du dein Emoji **nicht zurückholen**! Der Recovery-Code wird gelöscht, das Emoji ist sofort für andere verfügbar.

---

## API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---|---|---|
| `GET` | `/api/user-sessions` | Listet alle Sessions (ohne Recovery-Codes) |
| `POST` | `/api/user-sessions` | Erstellt neue Session |
| `PUT` | `/api/user-sessions/reclaim` | Reaktiviert Session mit Emoji + Code |
| `PATCH` | `/api/user-sessions/:sessionId/emoji` | Wechselt Emoji (neu!) |
| `DELETE` | `/api/user-sessions/:sessionId` | Löscht Session (gibt Emoji frei) |

---

## Frontend-Komponenten

### `EmojiPickerModal.tsx`

Hauptkomponente für alle Emoji-Aktionen:

**State:**
- `notLoggedInMode`: `'choose-new'` | `'recover'`
- `loggedInMode`: `'profile'` | `'switch'`
- `selectedEmoji`: Gewähltes Emoji
- `newRecoveryCode`: Neuer Recovery-Code
- `reclaimEmoji`: Zu reclamendes Emoji
- `currentRecoveryCode`: Aktueller Code (für Wechseln)
- `switchPassword`: Passwort für Wechseln
- `isSaving`: Lade-Indikator
- `error`: Fehler-Nachricht
- `success`: Erfolgsmeldung

**Funktionen:**
- `handleCreateNew()`: Neue Session erstellen
- `handleRecover()`: Session reaktivieren
- `handleSwitch()`: Emoji wechseln
- `handleLogout()`: Session aufgeben
- `canSave()`: Prüft, ob Save-Button aktiviert sein sollte
- `disabledReason()`: Zeigt, warum Save-Button deaktiviert ist
- `resetFormState()`: Setzt alle Formularfelder zurück

### `useUserSessions.ts`

Custom Hook für Emoji-Sessions:

**Funktionen:**
- `fetchSessions()`: Lädt alle Sessions
- `createSession()`: Erstellt neue Session
- `reclaimSession()`: Reaktiviert Session
- `updateSessionEmoji()`: Wechselt Emoji
- `deleteSession()`: Löscht Session

**State:**
- `sessions`: Array aller Sessions
- `loading`: Lade-Status
- `error`: Fehler-Status

---

## Datenbank-Schema

```sql
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL UNIQUE,
  recovery_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_user_sessions_emoji`: Schnelle Emoji-Suche
- `idx_user_sessions_last_seen`: Für Session-Cleanup (nicht implementiert)

---

## Sicherheit

### Aktuell implementiert

✅ **Emoji-Eindeutigkeit:** Kein Emoji kann doppelt vergeben werden  
✅ **Recovery-Code-Validierung:** Muss 4 alphanumerische Zeichen sein  
✅ **Passwort-Schutz:** Wechseln + Aufgeben erfordert Passwort (nur Frontend, siehe Known gaps)  
✅ **Session-ID:** Zufällige UUID pro Session  
✅ **Code-Normalisierung bei Erstellung:** Der Recovery-Code wird beim Anlegen automatisch in Großbuchstaben gespeichert ([EmojiPickerModal.tsx:135](src/components/EmojiPickerModal.tsx#L135)). Beim Wiederherstellen und Wechseln vergleicht der Server strikt ([user-sessions.ts:95](server/routes/user-sessions.ts#L95)), also muss der Code so eingegeben werden wie er gespeichert wurde.  

### Verbesserungsmöglichkeiten

⚠️ **Rate Limiting:** Kein Schutz gegen Brute-Force auf Recovery-Codes  
⚠️ **Session-Timeout:** Sessions laufen nie ab (kein Inactivity-Logout)  
⚠️ **Code-Masking:** Recovery-Code wird im Profil im Klartext angezeigt  
⚠️ **Session-Cleanup:** Alte Sessions werden nicht automatisch gelöscht  

---

## Best Practices

### Für Benutzer

1. **Recovery-Code notieren:**
   - Screenshot machen oder aufschreiben
   - Nicht im Browser speichern (wird beim Clearen gelöscht)

2. **Passwort sichern:**
   - Nur Bastis Geburtstag kennen
   - Nicht teilen!

3. **Emoji wechseln:**
   - Vorher aktuellen Recovery-Code prüfen
   - Neuen Emoji gut auswählen (ändert nicht viel)

4. **Aufgeben:**
   - Nur wenn du wirklich damit fertig bist
   - Nicht mehr benutzt → lieber wechseln

### Für Entwickler

1. **Session-ID nutzen:**
   - Für Fremdschlüssel in anderen Tabellen (z.B. `notes.session_id`)
   - Ändert sich beim Wechseln nicht → Notizen bleiben!

2. **Fehlerbehandlung:**
   - Klare Fehlermeldungen auf Deutsch
   - `ApiError`-Klasse für strukturierte Fehler

3. **Formular-Validierung:**
   - Eingaben in Echtzeit validieren
   - Button deaktivieren bis alle Felder korrekt
   - **Auto-Select:** Beim Wiederherstellen automatisch das passende Emoji auswählen, wenn der Recovery-Code stimmt

4. **UX-Verbesserungen:**
   - Disabled-Reason-Hints zeigen ("Neues Emoji auswählen" / "Kein Emoji mit diesem Code gefunden")
   - Lade-Indikatoren während Speichern
   - Erfolgsmeldungen mit Timeout
   - **Großes Emoji:** Beim Wiederherstellen das gefundene Emoji in Großformat zentriert anzeigen

---

## Troubleshooting

### "Emoji already taken"
**Ursache:** Jemand anderes hat dieses Emoji gerade gewählt

**Lösung:**
- Wähle ein anderes Emoji
- Oder warte kurz (vielleicht wird es wieder frei)

### "Invalid recovery code"
**Ursache:** Recovery-Code stimmt nicht überein

**Lösung:**
- Groß-/Kleinschreibung zählt — bei der Erstellung wurde dein Code in Großbuchstaben gespeichert, gib ihn so ein
- Code aufschreiben? Screenshot checken?
- Nach Eingabe eines gültigen Codes wird das passende Emoji **automatisch** angezeigt und ausgewählt

### "Session not found"
**Ursache:** Session wurde gelöscht

**Lösung:**
- Neu anfangen → "Neu wählen"

### "Falsches Passwort"
**Ursache:** Passwort beim Wechseln/Aufgeben nicht korrekt

**Lösung:**
- Bastis Geburtstag: 24031986
- Format: ddmmyyyy

---

## Known gaps

Stand 2026-04-21, durch die Test-Suite aufgedeckt.

### Admin-Passwort beim Emoji-Wechsel: nur Frontend-Gate
Das Frontend blockt den "Wechseln"-Button, bis Bastis Geburtstag eingegeben ist
([EmojiPickerModal.tsx:87](src/components/EmojiPickerModal.tsx#L87)). Der
Server-Endpoint ([user-sessions.ts:115-168](server/routes/user-sessions.ts#L115-L168))
prüft das Admin-Passwort **nicht** — nur den Recovery-Code. Ein direkter
API-Call (curl, Postman) umgeht den Passwort-Check. Risiko niedrig, da der
URL-Zugang ohnehin offen ist, aber Doku und Code sind inkonsistent.

### "Smiley aufgeben" schlägt fehl, sobald der User Notizen hat
`notes.session_id` hat `FOREIGN KEY REFERENCES user_sessions(session_id)` ohne
`ON DELETE`-Klausel, und `better-sqlite3` erzwingt Foreign Keys. Folge:
`DELETE /api/user-sessions/:id` returniert 500, sobald der User mindestens
eine Notiz geschrieben hat. Fix wäre `ON DELETE SET NULL` auf
`notes.session_id` + Migration; der `backup_emoji`-Fallback im GET ist bereits
vorbereitet und funktioniert für Locations (dort existiert der FK nicht).
Der Integrationstest `DELETE /api/user-sessions currently fails with 500
when the user has notes` dokumentiert das aktuelle Verhalten.

---

## Future Enhancements

### Phase 1: Sicherheit
- [ ] Rate Limiting (max 5 Versuche/Minute für Recovery)
- [ ] Session Timeout (auto-logout nach 30 Tagen Inaktivität)
- [ ] Session Cleanup-Job (alte Sessions automatisch löschen)
- [ ] Recovery-Code masking in Profil-Ansicht (••••)

### Phase 2: UX
- [ ] "Gleiches Emoji, neuer Code" Option
- [ ] Emoji-Favoriten für schnelle Auswahl
- [ ] Letzte Aktivität im Profil anzeigen
- [ ] Multi-Device-Support (gleiche Session auf mehreren Geräten)

### Phase 3: Admin
- [ ] Admin-Dashboard für Session-Verwaltung
- [ ] Statistiken: Meistgenutzte Emojis
- [ ] Session-Historie für Passwort-Besitzer
- [ ] Manuelle Session-Löschung

---

## Dateien

- `src/components/EmojiPickerModal.tsx` — Hauptkomponente
- `src/hooks/useUserSessions.ts` — Hook für API-Calls
- `src/lib/api.ts` — API-Wrapper + ApiError-Klasse
- `server/routes/user-sessions.ts` — Express-Endpunkte
- `server/db/schema.sql` — Datenbank-Tabelle
- `src/App.tsx` — Session-Management im Root

---

## Kontakt

Bei Problemen oder Fragen zum Emoji-System:
- Issue auf GitHub erstellen
- Oder direkt mit Basti besprechen

**Status:** ✅ Production-ready (2026-04-18)
