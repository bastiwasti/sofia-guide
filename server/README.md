# Server Documentation

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
- Reset all user sessions
- Administer other features (as implemented)

## Admin Operations

### Reset All User Sessions

Reset all user sessions and recreate the admin account with a new session ID.

**Endpoint:** `POST /api/admin/reset-sessions`

**Headers:**
```
Content-Type: application/json
X-Admin-Recovery-Code: 8688
```

**Example:**
```bash
curl -X POST http://localhost:3002/api/admin/reset-sessions \
  -H "Content-Type: application/json" \
  -H "X-Admin-Recovery-Code: 8688"
```

**Response:**
```json
{
  "success": true,
  "deleted": 5,
  "admin_session": {
    "session_id": "uuid-v4-here",
    "emoji": "🦧",
    "role": "admin",
    "created_at": "2026-04-24T21:30:00.000Z"
  },
  "message": "Deleted 5 sessions and recreated admin account"
}
```

**Error Responses:**
- `400` - Missing X-Admin-Recovery-Code header
- `401` - Invalid admin recovery code
- `500` - Server error

**Production Example:**
```bash
curl -X POST https://sofia.eventig.app/api/admin/reset-sessions \
  -H "Content-Type: application/json" \
  -H "X-Admin-Recovery-Code: 8688"
```

**Use Cases:**
- Clear all user sessions after development/testing
- Start fresh for a new event/trip
- Reset corrupted session data

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

### Admin
- `POST /api/admin/reset-sessions` - Reset all user sessions (requires admin recovery code in header)

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
export NODE_ENV=production
export PORT=3002

# Run container
docker run -p 3002:3002 -v sofia-guide-data:/app/data sofia-guide
```

### Reset User Sessions on Deployment
When deploying a fresh version and you want to reset all user sessions, use the admin API:

```bash
curl -X POST https://sofia.eventig.app/api/admin/reset-sessions \
  -H "Content-Type: application/json" \
  -H "X-Admin-Recovery-Code: 8688"
```

This is the recommended approach as it:
- Doesn't require manual access to the Docker host
- Works immediately without container restart
- Can be triggered at any time after deployment
- Uses admin authentication for security

## Troubleshooting

### Admin account not created
Check server logs for:
- "Admin account already exists: 🦧" - already exists
- "Admin account created: 🦧 (recovery code: 8688)" - created successfully
- Check for any SQL errors

### Reset sessions endpoint returns 401
- Verify the `X-Admin-Recovery-Code` header is set to `8688`
- Check for typos in the header name (case-sensitive: `X-Admin-Recovery-Code`)
- Ensure the header is being sent correctly by your curl command

### Old user sessions persisting after reset
- Verify the reset endpoint returned `success: true`
- Check the `deleted` count in the response
- Ensure you're using the correct admin recovery code
- Check server logs for "Admin reset" message

### Database locked errors
- SQLite uses WAL mode for better concurrency
- If issues persist, check for multiple processes accessing the DB
- Check file permissions on /app/data directory
