import { Request, Response } from 'express'
import { getDatabase } from '../db/index'
import { Server as SocketIOServer } from 'socket.io'

export function getLocations(_req: Request, res: Response): void {
  try {
    const db = getDatabase()
    const locations = db.prepare(`
      SELECT
        l.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        l.backup_emoji,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as is_active_user
      FROM locations l
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN user_sessions us ON l.session_id = us.session_id
      ORDER BY c.name, l.name
    `).all()
    db.close()

    res.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
}

export function getLocationById(req: Request, res: Response): void {
  try {
    const { id } = req.params
    const db = getDatabase()
    const location = db.prepare(`
      SELECT
        l.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        l.backup_emoji,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as is_active_user
      FROM locations l
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN user_sessions us ON l.session_id = us.session_id
      WHERE l.id = ?
    `).get(id)
    db.close()

    if (!location) {
      res.status(404).json({ error: 'Location not found' })
      return
    }

    res.json(location)
  } catch (error) {
    console.error('Error fetching location:', error)
    res.status(500).json({ error: 'Failed to fetch location' })
  }
}

  export function createLocation(io: SocketIOServer) {
  return function(req: Request, res: Response): void {
    try {
      const {
        category_id,
        name,
        meta,
        rating,
        price_range,
        lat,
        lng,
        session_id,
        website_url,
        address,
        opening_hours,
        payment_methods,
        phone,
        beer_menu,
        cocktails_menu,
        food_menu,
        local_specialties,
        music_type,
        crowd_type,
        pro_tips,
        fun_facts,
        seating_options,
        entry_fee,
        visit_duration,
        best_time_to_visit,
        photo_allowed,
        guided_tours,
        key_features,
        dress_code,
        service_times
      } = req.body

      if (!category_id || !name || !lat || !lng) {
        res.status(400).json({ error: 'Missing required fields' })
        return
      }

      const db = getDatabase()

      let backupEmoji: string | null = null
      if (session_id) {
        const session = db.prepare('SELECT emoji FROM user_sessions WHERE session_id = ?').get(session_id)
        if (session) {
          backupEmoji = (session as { emoji: string }).emoji
        }
      }

      const result = db.prepare(`
        INSERT INTO locations (
          category_id, name, meta, rating, price_range, lat, lng, session_id, backup_emoji,
          website_url, address, opening_hours, phone, payment_methods,
          beer_menu, cocktails_menu, food_menu, local_specialties,
          music_type, crowd_type, pro_tips, fun_facts, seating_options,
          entry_fee, visit_duration, best_time_to_visit, photo_allowed, guided_tours, key_features, dress_code, service_times
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        category_id,
        name,
        meta || null,
        rating || null,
        price_range || null,
        lat,
        lng,
        session_id || null,
        backupEmoji,
        website_url || null,
        address || null,
        opening_hours || null,
        phone || null,
        payment_methods || null,
        beer_menu || null,
        cocktails_menu || null,
        food_menu || null,
        local_specialties || null,
        music_type || null,
        crowd_type || null,
        pro_tips || null,
        fun_facts || null,
        seating_options || null,
        entry_fee || null,
        visit_duration || null,
        best_time_to_visit || null,
        photo_allowed || null,
        guided_tours || null,
        key_features || null,
        dress_code || null,
        service_times || null
      )

      const location = db.prepare(`
        SELECT
          l.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon,
          l.backup_emoji,
          us.emoji as author_emoji,
          CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as is_active_user
        FROM locations l
        JOIN categories c ON l.category_id = c.id
        LEFT JOIN user_sessions us ON l.session_id = us.session_id
        WHERE l.id = ?
      `).get(result.lastInsertRowid)
      db.close()

      io.to('sofia-guide').emit('location-created', location)

      res.status(201).json(location)
    } catch (error) {
      console.error('Error creating location:', error instanceof Error ? error.message : 'Unknown error')
      res.status(500).json({ error: 'Failed to create location' })
    }
  }
}

export function deleteLocation(io: SocketIOServer) {
  return function(req: Request, res: Response): void {
    try {
      const { id } = req.params
      const { session_id, admin_password } = req.body

      const db = getDatabase()

      const location = db.prepare('SELECT session_id, category_id FROM locations WHERE id = ?').get(id) as { session_id: string | null; category_id: number } | undefined

      if (!location) {
        db.close()
        res.status(404).json({ error: 'Location not found' })
        return
      }

      let canDelete = false

      if (admin_password === '24031986') {
        canDelete = true
      } else if (location.category_id === 6 && location.session_id === null) {
        canDelete = true
      } else if (location.category_id === 6 && location.session_id !== null) {
        const ownerExists = db
          .prepare('SELECT 1 FROM user_sessions WHERE session_id = ?')
          .get(location.session_id)
        if (!ownerExists) {
          canDelete = true
        } else if (session_id === location.session_id) {
          canDelete = true
        }
      } else if (session_id === location.session_id) {
        canDelete = true
      }

      if (!canDelete) {
        db.close()
        res.status(403).json({ error: 'You can only delete locations you own or legacy locations' })
        return
      }

      const result = db.prepare('DELETE FROM locations WHERE id = ?').run(id)
      db.close()

      if (result.changes === 0) {
        res.status(404).json({ error: 'Location not found' })
        return
      }

      io.to('sofia-guide').emit('location-deleted', { id })

      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting location:', error)
      res.status(500).json({ error: 'Failed to delete location' })
    }
  }
}
