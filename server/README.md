# Server Documentation

## Environment Variables

### CLEAR_USER_SESSIONS_ON_START
- **Default:** `false`
- **Values:** `true` or `false`
- **Purpose:** Controls whether all user sessions are deleted on server startup

**When to use:**
- Set to `true` during deployments when you want to reset all user sessions
- After deployment, set back to `false` to preserve user sessions
- Useful for ensuring only the admin account exists after fresh deployment

**Effect when `true`:**
- Deletes ALL entries from `user_sessions` table
- Creates admin account with:
  - Emoji: 🦧
  - Recovery Code: 8688
  - Role: admin

**Effect when `false` (default):**
- Preserves all existing user sessions
- Only creates admin account if it doesn't exist yet

## Database

### Schema
See `server/db/schema.sql` for complete database schema.

### Initialization
Database is automatically initialized on server startup via `initializeDatabase()`:
1. Creates tables from schema.sql
2. Runs migrations for new columns
3. Optionally clears user sessions (if env var set)
4. Ensures admin account exists
5. Seeds categories, locations, and events

### Seed Data
- Categories: 8 (including event venue types)
- Locations: 74 (Hotels, sights, restaurants, bars, craft beer, nightlife)
- Events: 6 (concerts, sport, theater)
- Source: `server/db/seed-data.ts`

## Admin Account

The admin account is automatically created with:
- **Emoji:** 🦧
- **Recovery Code:** 8688
- **Role:** admin

This account can:
- Delete locations
- Delete events
- Administer other features (as implemented)

## Scripts

```bash
# Start server in development mode
npm run server:dev

# Start server in production mode
npm run server

# Manual database migration
npm run db:migrate

# Force re-seed database (deletes and recreates all data)
tsx server/db/seed.ts true
```

## API Endpoints

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create new location
- `DELETE /api/locations/:id` - Delete location

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `DELETE /api/notes/:id` - Delete note

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `DELETE /api/events/:id` - Delete event

### User Sessions
- `GET /api/user-sessions` - Get all user sessions
- `POST /api/user-sessions` - Create new user session
- `PUT /api/user-sessions/reclaim` - Reclaim existing user session
- `PATCH /api/user-sessions/:sessionId/emoji` - Update user emoji
- `DELETE /api/user-sessions/:sessionId` - Delete user session
- `GET /api/user-sessions/:sessionId/validate` - Validate session

### Health (dev only)
- `GET /api/health` - Health check endpoint

## WebSocket

Server uses Socket.IO for real-time updates:
- Path: `/socket.io/`
- CORS: Enabled for all origins

## Deployment

### Docker Build
```bash
docker build -t sofia-guide .
```

### Production Run
```bash
# Set environment variables for deployment
export CLEAR_USER_SESSIONS_ON_START=true  # Only for fresh deployment
export NODE_ENV=production
export PORT=3002

# Run container
docker run -p 3002:3002 -v sofia-guide-data:/app/data sofia-guide
```

### Important: Reset User Sessions on Deployment
When deploying a fresh version and you want to reset all user sessions:

1. Set `CLEAR_USER_SESSIONS_ON_START=true` in your docker-compose.yml or environment
2. Deploy the new image
3. After successful deployment, remove the env var or set to `false`
4. Deploy again (or restart container) to preserve sessions going forward

**Example docker-compose.yml:**
```yaml
services:
  sofia-guide:
    image: ghcr.io/bastiwasti/sofia-guide:latest
    environment:
      - NODE_ENV=production
      - PORT=3002
      - CLEAR_USER_SESSIONS_ON_START=true  # REMOVE after first run!
    volumes:
      - sofia-guide-data:/app/data
    labels:
      - "traefik.enable=true"
      # ... traefik labels
```

## Troubleshooting

### Admin account not created
Check server logs for:
- "Admin account already exists: 🦧" - already exists
- "Admin account created: 🦧 (recovery code: 8688)" - created successfully
- Check for any SQL errors

### Old user sessions persisting after deployment
Ensure:
1. `CLEAR_USER_SESSIONS_ON_START=true` is set during deployment
2. Container is actually restarted with the new environment
3. Check Watchtower logs to confirm image pull and restart
4. Verify database file location (/app/data/sofia-guide.db) is correct

### Database locked errors
- SQLite uses WAL mode for better concurrency
- If issues persist, check for multiple processes accessing the DB
- Check file permissions on /app/data directory
