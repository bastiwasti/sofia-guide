import { Request, Response } from 'express'
import { getDatabase } from '../db/index'

export function getLocations(_req: Request, res: Response): void {
  try {
    const db = getDatabase()
    const locations = db.prepare(`
      SELECT
        l.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as has_author
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
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as has_author
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

export function createLocation(req: Request, res: Response): void {
  try {
    const { category_id, name, meta, rating, price_range, lat, lng, session_id } = req.body

    if (!category_id || !name || !lat || !lng) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const db = getDatabase()
    const result = db.prepare(`
      INSERT INTO locations (category_id, name, meta, rating, price_range, lat, lng, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(category_id, name, meta || null, rating || null, price_range || null, lat, lng, session_id || null)

    const location = db.prepare(`
      SELECT
        l.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as has_author
      FROM locations l
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN user_sessions us ON l.session_id = us.session_id
      WHERE l.id = ?
    `).get(result.lastInsertRowid)
    db.close()

    res.status(201).json(location)
  } catch (error) {
    console.error('Error creating location:', error)
    res.status(500).json({ error: 'Failed to create location' })
  }
}

export function deleteLocation(req: Request, res: Response): void {
  try {
    const { id } = req.params
    const db = getDatabase()
    const result = db.prepare('DELETE FROM locations WHERE id = ?').run(id)
    db.close()
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Location not found' })
      return
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    res.status(500).json({ error: 'Failed to delete location' })
  }
}
