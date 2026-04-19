import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getLocations, getLocationById, createLocation, deleteLocation } from './routes/locations'
import { getCategories, createCategory } from './routes/categories'
import { getNotes, createNote, deleteNote } from './routes/notes'
import { getUserSessions, createUserSession, reclaimUserSession, updateUserSessionEmoji, deleteUserSession, validateSession } from './routes/user-sessions'
import { getDatabase } from './db'
import { initializeDatabase } from './db'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3002
const isDev = process.env.NODE_ENV !== 'production'

const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
  path: '/socket.io/'
})

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.get('/api/locations', getLocations)
app.get('/api/locations/:id', getLocationById)
app.post('/api/locations', createLocation)
app.delete('/api/locations/:id', deleteLocation)

app.get('/api/categories', getCategories)
app.post('/api/categories', createCategory)

app.get('/api/notes', getNotes)
app.post('/api/notes', createNote)
app.delete('/api/notes/:id', deleteNote)

app.get('/api/user-sessions', getUserSessions)
app.post('/api/user-sessions', createUserSession)
app.put('/api/user-sessions/reclaim', reclaimUserSession)
app.patch('/api/user-sessions/:sessionId/emoji', updateUserSessionEmoji)
app.delete('/api/user-sessions/:sessionId', deleteUserSession)
app.get('/api/user-sessions/:sessionId/validate', validateSession)

if (isDev) {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}

if (!isDev) {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))

  app.get('/*path', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.join('sofia-guide')

  socket.on('user-location-update', async (data) => {
    const { session_id, lat, lng, accuracy, is_tracking } = data

    try {
      const db = getDatabase()
      db.prepare(`
        INSERT INTO user_locations (session_id, lat, lng, accuracy, is_tracking, last_seen)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
          lat = excluded.lat,
          lng = excluded.lng,
          accuracy = excluded.accuracy,
          is_tracking = excluded.is_tracking,
          last_seen = excluded.last_seen
      `).run(session_id, lat, lng, accuracy, is_tracking ? 1 : 0, new Date().toISOString())

      const userLocation = db.prepare(`
        SELECT ul.session_id, ul.lat, ul.lng, ul.accuracy, ul.is_tracking, ul.last_seen, us.emoji
        FROM user_locations ul
        JOIN user_sessions us ON ul.session_id = us.session_id
        WHERE ul.session_id = ?
      `).get(session_id) as any

      db.close()

      io.to('sofia-guide').emit('user-location-broadcast', {
        session_id: userLocation.session_id,
        emoji: userLocation.emoji,
        lat: userLocation.lat,
        lng: userLocation.lng,
        accuracy: userLocation.accuracy,
        is_tracking: userLocation.is_tracking === 1,
        last_seen: userLocation.last_seen
      })
    } catch (error) {
      console.error('Error updating user location:', error)
    }
  })

  socket.on('request-user-locations', async () => {
    try {
      const db = getDatabase()
      const locations = db.prepare(`
        SELECT ul.session_id, ul.lat, ul.lng, ul.accuracy, ul.is_tracking, ul.last_seen, us.emoji
        FROM user_locations ul
        JOIN user_sessions us ON ul.session_id = us.session_id
        WHERE ul.last_seen > datetime('now', '-5 minutes')
      `).all() as Array<any>
      db.close()

      socket.emit('user-locations-current', locations.map(loc => ({
        session_id: loc.session_id,
        emoji: loc.emoji,
        lat: loc.lat,
        lng: loc.lng,
        accuracy: loc.accuracy,
        is_tracking: loc.is_tracking === 1,
        last_seen: loc.last_seen
      })))
    } catch (error) {
      console.error('Error fetching user locations:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

initializeDatabase()

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${isDev ? 'development' : 'production'}`)
})
