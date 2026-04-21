import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import { getDatabase } from '../db'

interface UserSession {
  id: number
  session_id: string
  emoji: string
  recovery_code: string
  created_at: string
  last_seen: string
}

export async function getUserSessions(_req: Request, res: Response) {
  try {
    const db = getDatabase()

    const sessions = db
      .prepare('SELECT id, session_id, emoji, created_at, last_seen FROM user_sessions ORDER BY created_at DESC')
      .all() as UserSession[]

    db.close()
    res.json(sessions)
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    res.status(500).json({ error: 'Failed to fetch user sessions' })
  }
}

export async function createUserSession(req: Request, res: Response) {
  try {
    const { emoji, recovery_code } = req.body

    if (!emoji || !recovery_code) {
      return res.status(400).json({ error: 'Emoji and recovery code are required' })
    }

    if (typeof emoji !== 'string' || emoji.length === 0 || emoji.length > 32) {
      return res.status(400).json({ error: 'Invalid emoji' })
    }

    if (typeof recovery_code !== 'string' || !/^[A-Za-z0-9]{4}$/.test(recovery_code)) {
      return res.status(400).json({ error: 'Recovery code must be 4 alphanumeric characters' })
    }

    const db = getDatabase()

    const existing = db.prepare('SELECT emoji FROM user_sessions WHERE emoji = ?').get(emoji) as { emoji: string } | undefined

    if (existing) {
      const allSessions = db.prepare('SELECT emoji FROM user_sessions').all() as { emoji: string }[]
      const takenEmojis = allSessions.map(s => s.emoji)
      db.close()
      return res.status(409).json({ error: 'Emoji already taken', taken_emojis: takenEmojis })
    }

    const sessionId = randomUUID()
    const now = new Date().toISOString()

    const result = db
      .prepare('INSERT INTO user_sessions (session_id, emoji, recovery_code, created_at, last_seen) VALUES (?, ?, ?, ?, ?)')
      .run(sessionId, emoji, recovery_code, now, now)

    const newSession = db
      .prepare('SELECT id, session_id, emoji, recovery_code, created_at, last_seen FROM user_sessions WHERE id = ?')
      .get(result.lastInsertRowid) as UserSession

    db.close()
    res.json(newSession)
  } catch (error) {
    console.error('Error creating user session:', error)
    res.status(500).json({ error: 'Failed to create user session' })
  }
}

export async function reclaimUserSession(req: Request, res: Response) {
  try {
    const { emoji, recovery_code } = req.body

    if (!emoji || !recovery_code) {
      return res.status(400).json({ error: 'Emoji and recovery code are required' })
    }

    const db = getDatabase()

    const session = db
      .prepare('SELECT id, session_id, emoji, recovery_code, created_at, last_seen FROM user_sessions WHERE emoji = ?')
      .get(emoji) as UserSession | undefined

    if (!session) {
      db.close()
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.recovery_code !== recovery_code) {
      db.close()
      return res.status(401).json({ error: 'Invalid recovery code' })
    }

    const now = new Date().toISOString()
    db.prepare('UPDATE user_sessions SET last_seen = ? WHERE id = ?').run(now, session.id)

    const updatedSession = db
      .prepare('SELECT id, session_id, emoji, recovery_code, created_at, last_seen FROM user_sessions WHERE id = ?')
      .get(session.id) as UserSession

    db.close()
    res.json(updatedSession)
  } catch (error) {
    console.error('Error reclaiming user session:', error)
    res.status(500).json({ error: 'Failed to reclaim user session' })
  }
}

export async function updateUserSessionEmoji(req: Request, res: Response) {
  try {
    const { sessionId } = req.params
    const { emoji, recovery_code } = req.body

    if (!sessionId || !emoji || !recovery_code) {
      return res.status(400).json({ error: 'sessionId, emoji and recovery_code are required' })
    }

    if (typeof emoji !== 'string' || emoji.length === 0 || emoji.length > 32) {
      return res.status(400).json({ error: 'Invalid emoji' })
    }

    const db = getDatabase()

    const session = db
      .prepare('SELECT id, session_id, emoji, recovery_code FROM user_sessions WHERE session_id = ?')
      .get(sessionId) as UserSession | undefined

    if (!session) {
      db.close()
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.recovery_code !== recovery_code) {
      db.close()
      return res.status(401).json({ error: 'Invalid recovery code' })
    }

    if (session.emoji !== emoji) {
      const existing = db
        .prepare('SELECT session_id FROM user_sessions WHERE emoji = ? AND session_id != ?')
        .get(emoji, sessionId) as { session_id: string } | undefined
      if (existing) {
        const allSessions = db.prepare('SELECT emoji FROM user_sessions').all() as { emoji: string }[]
        db.close()
        return res.status(409).json({ error: 'Emoji already taken', taken_emojis: allSessions.map(s => s.emoji) })
      }
    }

    const now = new Date().toISOString()
    db.prepare('UPDATE user_sessions SET emoji = ?, last_seen = ? WHERE session_id = ?').run(emoji, now, sessionId)

    const updated = db
      .prepare('SELECT id, session_id, emoji, recovery_code, created_at, last_seen FROM user_sessions WHERE session_id = ?')
      .get(sessionId) as UserSession

    db.close()
    res.json(updated)
  } catch (error) {
    console.error('Error updating user session emoji:', error)
    res.status(500).json({ error: 'Failed to update emoji' })
  }
}

export async function deleteUserSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' })
      return
    }

    const db = getDatabase()

    const result = db.prepare('DELETE FROM user_sessions WHERE session_id = ?').run(sessionId)

    db.close()

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting user session:', error)
    res.status(500).json({ error: 'Failed to delete user session' })
  }
}

export async function validateSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' })
      return
    }

    const db = getDatabase()

    const session = db.prepare('SELECT session_id, emoji FROM user_sessions WHERE session_id = ?').get(sessionId)

    db.close()

    if (session) {
      res.json({ valid: true, emoji: (session as { emoji: string }).emoji })
    } else {
      res.json({ valid: false })
    }
  } catch (error) {
    console.error('Error validating session:', error)
    res.status(500).json({ error: 'Failed to validate session' })
  }
}