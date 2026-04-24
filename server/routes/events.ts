import { Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { getDatabase } from '../db/index'
import { expandMany, EventRow, EventOccurrence } from '../lib/event-recurrence'

interface EventWithLocation extends EventOccurrence {
  location_name?: string | null
  location_category_id?: number | null
  location_category_color?: string | null
  location_category_icon?: string | null
  location_lat?: number | null
  location_lng?: number | null
}

function isValidIsoDate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export function getEvents(req: Request, res: Response): void {
  try {
    const { from, to } = req.query
    if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
      res.status(400).json({ error: 'from and to must be YYYY-MM-DD' })
      return
    }

    const db = getDatabase()
    const rows = db.prepare(`
      SELECT
        e.*,
        l.name as location_name,
        l.category_id as location_category_id,
        l.lat as location_lat,
        l.lng as location_lng,
        c.color as location_category_color,
        c.icon as location_category_icon
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN categories c ON l.category_id = c.id
    `).all() as Array<EventRow & {
      location_name: string | null
      location_category_id: number | null
      location_category_color: string | null
      location_category_icon: string | null
      location_lat: number | null
      location_lng: number | null
    }>
    db.close()

    const eventRows: EventRow[] = rows
    const occurrences = expandMany(eventRows, from, to)

    const byId = new Map(rows.map(r => [r.id, r]))
    const enriched: EventWithLocation[] = occurrences.map(occ => {
      const row = byId.get(occ.id)
      return {
        ...occ,
        location_name: row?.location_name ?? null,
        location_category_id: row?.location_category_id ?? null,
        location_category_color: row?.location_category_color ?? null,
        location_category_icon: row?.location_category_icon ?? null,
        location_lat: row?.location_lat ?? null,
        location_lng: row?.location_lng ?? null,
      }
    })

    res.json(enriched)
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

const VALID_EVENT_TYPES = new Set(['concert', 'sport', 'festival', 'market', 'theater', 'opera'])

export function createEvent(io: SocketIOServer) {
  return function (req: Request, res: Response): void {
    try {
      const {
        title,
        event_type,
        location_id,
        venue_name,
        venue_address,
        venue_lat,
        venue_lng,
        start_date,
        end_date,
        start_time,
        end_time,
        recurrence,
        recurrence_until,
        price,
        external_url,
        description,
        emoji,
      } = req.body

      if (!title || !event_type) {
        res.status(400).json({ error: 'title and event_type are required' })
        return
      }

      if (!VALID_EVENT_TYPES.has(event_type)) {
        res.status(400).json({ error: 'invalid event_type' })
        return
      }

      if (!start_date && !recurrence) {
        res.status(400).json({ error: 'either start_date or recurrence is required' })
        return
      }

      const db = getDatabase()
      const result = db.prepare(`
        INSERT INTO events (
          title, event_type, location_id,
          venue_name, venue_address, venue_lat, venue_lng,
          start_date, end_date, start_time, end_time,
          recurrence, recurrence_until,
          price, external_url, description, emoji
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title,
        event_type,
        location_id ?? null,
        venue_name ?? null,
        venue_address ?? null,
        venue_lat ?? null,
        venue_lng ?? null,
        start_date ?? null,
        end_date ?? null,
        start_time ?? null,
        end_time ?? null,
        recurrence ?? null,
        recurrence_until ?? null,
        price ?? null,
        external_url ?? null,
        description ?? null,
        emoji ?? null,
      )

      const created = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid)
      db.close()

      io.to('sofia-guide').emit('event-created', created)
      res.status(201).json(created)
    } catch (error) {
      console.error('Error creating event:', error)
      res.status(500).json({ error: 'Failed to create event' })
    }
  }
}

export function deleteEvent(io: SocketIOServer) {
  return function (req: Request, res: Response): void {
    try {
      const { id } = req.params
      const db = getDatabase()
      const result = db.prepare('DELETE FROM events WHERE id = ?').run(id)
      db.close()

      if (result.changes === 0) {
        res.status(404).json({ error: 'Event not found' })
        return
      }

      io.to('sofia-guide').emit('event-deleted', { id: Number(id) })
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting event:', error)
      res.status(500).json({ error: 'Failed to delete event' })
    }
  }
}
