import { Request, Response } from 'express'
import { getDatabase } from '../db/index'

export function getNotes(_req: Request, res: Response): void {
  try {
    const db = getDatabase()
    const notes = db.prepare(`
      SELECT
        n.id,
        n.content,
        n.session_id,
        n.backup_emoji,
        n.created_at,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as is_active_user
      FROM notes n
      LEFT JOIN user_sessions us ON n.session_id = us.session_id
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all()
    db.close()

    res.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
}

export function createNote(req: Request, res: Response): void {
  try {
    const { content, session_id } = req.body

    if (!content) {
      res.status(400).json({ error: 'Content is required' })
      return
    }

    if (!session_id) {
      res.status(400).json({ error: 'Session ID is required' })
      return
    }

    const db = getDatabase()

    const session = db.prepare('SELECT session_id, emoji FROM user_sessions WHERE session_id = ?').get(session_id)
    if (!session) {
      db.close()
      res.status(404).json({ error: 'Invalid session' })
      return
    }

    const userSession = session as { session_id: string; emoji: string }

    const result = db.prepare(`
      INSERT INTO notes (content, session_id, backup_emoji)
      VALUES (?, ?, ?)
    `).run(content, session_id, userSession.emoji)

    const note = db.prepare(`
      SELECT
        n.id,
        n.content,
        n.session_id,
        n.backup_emoji,
        n.created_at,
        us.emoji as author_emoji,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as is_active_user
      FROM notes n
      LEFT JOIN user_sessions us ON n.session_id = us.session_id
      WHERE n.id = ?
    `).get(result.lastInsertRowid)

    db.close()

    res.status(201).json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    res.status(500).json({ error: 'Failed to create note' })
  }
}

export function deleteNote(req: Request, res: Response): void {
  try {
    const { id } = req.params
    const { session_id } = req.body

    if (!session_id) {
      res.status(400).json({ error: 'Session ID is required' })
      return
    }

    const db = getDatabase()

    const note = db.prepare('SELECT session_id FROM notes WHERE id = ?').get(id)

    if (!note) {
      db.close()
      res.status(404).json({ error: 'Note not found' })
      return
    }

    const noteSession = (note as { session_id?: string }).session_id

    if (noteSession && noteSession !== session_id) {
      db.close()
      res.status(403).json({ error: 'Not authorized to delete this note' })
      return
    }

    const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id)
    db.close()

    if (result.changes === 0) {
      res.status(404).json({ error: 'Note not found' })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    res.status(500).json({ error: 'Failed to delete note' })
  }
}
