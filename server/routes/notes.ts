import { Request, Response } from 'express'
import { getDatabase } from '../db/index'

export function getNotes(_req: Request, res: Response): void {
  try {
    const db = getDatabase()
    const notes = db.prepare(`
      SELECT * FROM notes 
      ORDER BY created_at DESC 
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
    const { content, author_name, author_emoji } = req.body
    
    if (!content) {
      res.status(400).json({ error: 'Content is required' })
      return
    }
    
    const db = getDatabase()
    const result = db.prepare(`
      INSERT INTO notes (content, author_name, author_emoji)
      VALUES (?, ?, ?)
    `).run(content, author_name || null, author_emoji || null)
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)
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
    const db = getDatabase()
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
