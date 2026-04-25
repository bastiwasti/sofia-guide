# Development Guide

## Voraussetzungen

- Node.js 22+
- npm

## Installation

```bash
npm install
```

## Datenbank initialisieren

```bash
npm run db:migrate       # Schema anlegen
npx tsx server/db/seed.ts  # 70+ Locations + Events einspielen
```

## Entwicklung

Zwei Prozesse parallel starten:

```bash
# Terminal 1 – Backend (Port 3002)
npm run server:dev

# Terminal 2 – Frontend (Port 3000, HTTPS)
npm run dev
```

## HTTPS für GPS (Dev)

Der Dev-Server läuft mit selbst-signiertem Zertifikat. Für LAN-Zugriff (z.B. Handy) muss das Zertifikat die LAN-IP als SAN enthalten:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout /tmp/key.pem -out /tmp/cert.pem -days 365 \
  -subj "/CN=192.168.178.192" \
  -addext "subjectAltName=IP:192.168.178.192,IP:127.0.0.1,DNS:localhost"
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test           # Alle Tests
npx vitest         # Watch-Mode
```

## Pre-push Hook

```bash
printf '#!/bin/sh\nnpm test\n' > .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

## Admin Testing

### User Sessions Reset

Lokal testen:

```bash
# Alle User-Sessions löschen und Admin neu erstellen
curl -X POST http://localhost:3002/api/admin/reset-sessions \
  -H "Content-Type: application/json" \
  -H "X-Admin-Recovery-Code: 8688"
```

**Admin-Details:**
- Emoji: 🦧
- Recovery Code: 8688

### Prüfen aller Sessions

```bash
curl http://localhost:3002/api/user-sessions
```

Siehe auch `server/README.md` für vollständige API-Dokumentation.

## Lint & Typecheck

```bash
npm run lint
npm run typecheck
```
