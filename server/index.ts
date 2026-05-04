import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getLocations, getLocationById, createLocation, deleteLocation } from './routes/locations'
import { getCategories, createCategory } from './routes/categories'
import { getNotes, createNote, deleteNote } from './routes/notes'
import { getEvents, createEvent, deleteEvent } from './routes/events'
import { getUserSessions, createUserSession, reclaimUserSession, updateUserSessionEmoji, deleteUserSession, validateSession, resetUserSessions } from './routes/user-sessions'
import { initializeDatabase, getDatabase } from './db'
import { registerSocketHandlers } from './socket'
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
app.post('/api/locations', createLocation(io))
app.delete('/api/locations/:id', deleteLocation(io))

app.get('/api/categories', getCategories)
app.post('/api/categories', createCategory(io))

app.get('/api/notes', getNotes)
app.post('/api/notes', createNote)
app.delete('/api/notes/:id', deleteNote)

app.get('/api/events', getEvents)
app.post('/api/events', createEvent(io))
app.delete('/api/events/:id', deleteEvent(io))

app.get('/api/user-sessions', getUserSessions)
app.post('/api/user-sessions', createUserSession)
app.put('/api/user-sessions/reclaim', reclaimUserSession)
app.patch('/api/user-sessions/:sessionId/emoji', updateUserSessionEmoji)
app.delete('/api/user-sessions/:sessionId', deleteUserSession)
app.get('/api/user-sessions/:sessionId/validate', validateSession)

app.post('/api/admin/reset-sessions', resetUserSessions)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: process.env.npm_package_version ?? 'unknown' })
})

app.get('/api/stats', (_req, res) => {
  try {
    const db = getDatabase()
    const users = db.prepare('SELECT COUNT(*) as total FROM user_sessions').get() as { total: number }
    const activeTracking = db.prepare('SELECT COUNT(*) as total FROM user_locations WHERE is_tracking = 1').get() as { total: number }
    const locations = db.prepare('SELECT COUNT(*) as total FROM locations').get() as { total: number }
    const notes = db.prepare('SELECT COUNT(*) as total FROM notes').get() as { total: number }
    const events = db.prepare('SELECT COUNT(*) as total FROM events').get() as { total: number }
    db.close()

    res.json({
      timestamp: new Date().toISOString(),
      users: { total: users.total, active_tracking: activeTracking.total },
      locations: { total: locations.total },
      notes: { total: notes.total },
      events: { total: events.total },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

if (!isDev) {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))

  app.get('/*path', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

registerSocketHandlers(io)

initializeDatabase()

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${isDev ? 'development' : 'production'}`)
})
