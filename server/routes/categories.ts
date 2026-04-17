import { Request, Response } from 'express'
import { getDatabase } from '../db/index'

export function getCategories(_req: Request, res: Response): void {
  try {
    const db = getDatabase()
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all()
    db.close()
    
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

export function createCategory(req: Request, res: Response): void {
  try {
    const { name, color, icon } = req.body
    
    if (!name || !color || !icon) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    
    const db = getDatabase()
    const result = db.prepare(`
      INSERT INTO categories (name, color, icon)
      VALUES (?, ?, ?)
    `).run(name, color, icon)
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
    db.close()
    
    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}
