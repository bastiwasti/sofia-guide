# Deployment Guide

## Pipeline Overview

Sofia Guide nutzt die standard Homelab-Pipeline:

```
git push → GitHub Actions (build + push) → ghcr.io/bastiwasti/sofia-guide → Watchtower → live
```

## Manuelles Deploy

Auf Docker-Host (192.168.178.160):

```bash
ssh sebastian@192.168.178.160 "cd /opt/apps/sofia-guide && docker compose pull && docker compose up -d --force-recreate"
```

## Logs Checken

```bash
# Watchtower logs
ssh sebastian@192.168.178.160 "docker logs watchtower --tail 50"

# Container logs
ssh sebastian@192.168.178.160 "docker logs sofia-guide --tail 50"

# Container status
ssh sebastian@192.168.178.160 "docker ps | grep sofia-guide"
```

## Docker Compose (auf Docker-Host)

```yaml
services:
  sofia-guide:
    image: ghcr.io/bastiwasti/sofia-guide:latest
    container_name: sofia-guide
    restart: unless-stopped
    volumes:
      - sofia-guide-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.sofia-guide.rule=Host(`sofia.eventig.app`)"
      - "traefik.http.routers.sofia-guide.entrypoints=web"
      - "traefik.http.services.sofia-guide.loadbalancer.server.port=3002"
    networks:
      - traefik-public

networks:
  traefik-public:
    external: true

volumes:
  sofia-guide-data:
```

## GitHub Actions

Build & Push automatisch auf `main` branch. Siehe `.github/workflows/ci-cd.yml`.

## Reseed (Events/DB)

Falls die Datenbank neu eingespielt werden muss:

```bash
ssh sebastian@192.168.178.160 "docker exec -it sofia-guide sqlite3 /app/data/sofia-guide.db 'DELETE FROM events;'"
ssh sebastian@192.168.178.160 "docker restart sofia-guide"
```

## User Sessions Reset

Um alle User-Sessions zu löschen und den Admin-Account neu zu erstellen:

```bash
curl -X POST https://sofia.eventig.app/api/admin/reset-sessions \
  -H "Content-Type: application/json" \
  -H "X-Admin-Recovery-Code: 8688"
```

**Admin-Details:**
- Emoji: 🦧
- Recovery Code: 8688

Siehe auch `server/README.md` für weitere Admin-Operations.
