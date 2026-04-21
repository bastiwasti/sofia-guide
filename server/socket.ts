import { Server as SocketIOServer } from 'socket.io'
import { getDatabase } from './db'

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join', (room: string, ack?: () => void) => {
      socket.join(room)
      console.log(`Socket ${socket.id} joined room: ${room}`)
      ack?.()
    })

    socket.on('user-location-update', async (data) => {
      const { session_id, emoji, lat, lng, accuracy, is_tracking } = data
      console.log('user-location-update received:', { session_id, emoji, lat, lng, accuracy, is_tracking })

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
          emoji: emoji || userLocation.emoji,
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
}
