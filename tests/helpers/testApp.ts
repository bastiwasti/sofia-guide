import express, { Express } from 'express'
import type { Server as SocketIOServer } from 'socket.io'
import { getLocations, getLocationById, createLocation, deleteLocation } from '../../server/routes/locations'
import { getCategories, createCategory } from '../../server/routes/categories'
import { getNotes, createNote, deleteNote } from '../../server/routes/notes'
import { getEvents, createEvent, deleteEvent } from '../../server/routes/events'
import {
  getUserSessions,
  createUserSession,
  reclaimUserSession,
  updateUserSessionEmoji,
  deleteUserSession,
  validateSession,
} from '../../server/routes/user-sessions'

export function buildStubIo(): SocketIOServer {
  const room = { emit: () => undefined }
  return { to: () => room } as unknown as SocketIOServer
}

export function buildRestApp(io: SocketIOServer = buildStubIo()): Express {
  const app = express()
  app.use(express.json())

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

  return app
}
