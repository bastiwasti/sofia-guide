import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestDbEnv, openTestDb, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'
import { createSessionViaApi } from '../helpers/sessions'

describe('notes API — posting with emoji, emoji-change propagation, session give-up fallback', () => {
  let env: TestDbEnv
  let app: Express

  beforeEach(() => {
    env = createTestDbEnv()
    app = buildRestApp()
  })

  afterEach(() => {
    env.cleanup()
  })

  describe('posting', () => {
    it('creates a note and populates backup_emoji from the session at write time', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')

      const res = await request(app)
        .post('/api/notes')
        .send({ content: 'Hallo Sofia!', session_id: session.session_id })
      expect(res.status).toBe(201)
      expect(res.body.content).toBe('Hallo Sofia!')
      expect(res.body.session_id).toBe(session.session_id)
      expect(res.body.backup_emoji).toBe('🦊')
      expect(res.body.author_emoji).toBe('🦊')
      expect(res.body.is_active_user).toBe(1)
    })

    it('round-trips note content containing emojis unchanged', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const content = '🍺 Bier bei Halbite war super 🔥'
      const res = await request(app)
        .post('/api/notes')
        .send({ content, session_id: session.session_id })
      expect(res.status).toBe(201)
      expect(res.body.content).toBe(content)
    })

    it('rejects notes without content (400)', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .post('/api/notes')
        .send({ session_id: session.session_id })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/content/i)
    })

    it('rejects notes without session_id (400)', async () => {
      const res = await request(app).post('/api/notes').send({ content: 'hi' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/session/i)
    })

    it('rejects notes with a made-up session_id (404)', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ content: 'hi', session_id: 'not-a-real-uuid' })
      expect(res.status).toBe(404)
      expect(res.body.error).toMatch(/invalid session/i)
    })
  })

  describe('listing', () => {
    it('returns notes newest first', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')

      const db = openTestDb(env.dbPath)
      const insert = db.prepare(
        'INSERT INTO notes (content, session_id, backup_emoji, created_at) VALUES (?, ?, ?, ?)'
      )
      insert.run('first', session.session_id, '🦊', '2020-01-01T00:00:00Z')
      insert.run('second', session.session_id, '🦊', '2021-01-01T00:00:00Z')
      insert.run('third', session.session_id, '🦊', '2022-01-01T00:00:00Z')
      db.close()

      const list = await request(app).get('/api/notes').expect(200)
      const contents = list.body.map((n: { content: string }) => n.content)
      expect(contents).toEqual(['third', 'second', 'first'])
    })

    it('caps the response at 50 notes', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const db = openTestDb(env.dbPath)
      const insert = db.prepare(
        'INSERT INTO notes (content, session_id, backup_emoji) VALUES (?, ?, ?)'
      )
      for (let i = 0; i < 55; i++) {
        insert.run(`note-${i}`, session.session_id, '🦊')
      }
      db.close()

      const list = await request(app).get('/api/notes').expect(200)
      expect(list.body).toHaveLength(50)
    })
  })

  describe('emoji propagation', () => {
    it('when the author switches their emoji, their old notes show the NEW author_emoji but backup_emoji stays frozen', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const post = await request(app)
        .post('/api/notes')
        .send({ content: 'mit Fuchs gepostet', session_id: session.session_id })
        .expect(201)
      expect(post.body.backup_emoji).toBe('🦊')
      expect(post.body.author_emoji).toBe('🦊')

      await request(app)
        .patch(`/api/user-sessions/${session.session_id}/emoji`)
        .send({ emoji: '🐼', recovery_code: 'A7X2' })
        .expect(200)

      const list = await request(app).get('/api/notes').expect(200)
      const mine = list.body.find((n: { id: number }) => n.id === post.body.id)
      expect(mine.author_emoji).toBe('🐼')
      expect(mine.backup_emoji).toBe('🦊')
      expect(mine.is_active_user).toBe(1)
    })

    it('backup_emoji fallback — given a note whose session is missing, author_emoji is null and backup_emoji stands in', async () => {
      // Background: better-sqlite3 enforces foreign keys by default, and
      // notes.session_id has FOREIGN KEY REFERENCES user_sessions without
      // ON DELETE — so deleting a session that owns notes currently fails
      // with 500. That blocks the documented "Smiley aufgeben" flow when
      // the user has posted anything. See TESTING.md → "Known gaps".
      //
      // This test exercises the fallback mechanism directly at the DB
      // layer to prove the GET /api/notes projection behaves correctly
      // once the owning session is gone (however that may happen).
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const post = await request(app)
        .post('/api/notes')
        .send({ content: 'sollte Fuchs-Fallback haben', session_id: session.session_id })
        .expect(201)
      expect(post.body.backup_emoji).toBe('🦊')

      const db = openTestDb(env.dbPath)
      db.pragma('foreign_keys = OFF')
      db.prepare('DELETE FROM user_sessions WHERE session_id = ?').run(session.session_id)
      db.close()

      const list = await request(app).get('/api/notes').expect(200)
      const mine = list.body.find((n: { id: number }) => n.id === post.body.id)
      expect(mine).toBeDefined()
      expect(mine.author_emoji).toBeNull()
      expect(mine.backup_emoji).toBe('🦊')
      expect(mine.is_active_user).toBe(0)
    })

    it('DELETE /api/user-sessions currently fails with 500 when the user has notes (documents known gap)', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      await request(app)
        .post('/api/notes')
        .send({ content: 'blocks give-up', session_id: session.session_id })
        .expect(201)

      const res = await request(app).delete(`/api/user-sessions/${session.session_id}`)
      expect(res.status).toBe(500)
    })
  })

  describe('deletion', () => {
    it('lets the author delete their own note', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const note = await request(app)
        .post('/api/notes')
        .send({ content: 'gleich weg', session_id: session.session_id })
        .expect(201)

      await request(app)
        .delete(`/api/notes/${note.body.id}`)
        .send({ session_id: session.session_id })
        .expect(200)

      const list = await request(app).get('/api/notes').expect(200)
      expect(list.body.find((n: { id: number }) => n.id === note.body.id)).toBeUndefined()
    })

    it("rejects attempts to delete somebody else's note (403)", async () => {
      const a = await createSessionViaApi(app, '🦊', 'A7X2')
      const b = await createSessionViaApi(app, '🐼', 'B3C4')
      const note = await request(app)
        .post('/api/notes')
        .send({ content: 'a hat geschrieben', session_id: a.session_id })
        .expect(201)

      const res = await request(app)
        .delete(`/api/notes/${note.body.id}`)
        .send({ session_id: b.session_id })
      expect(res.status).toBe(403)
    })

    it('lets anyone delete a legacy note (session_id IS NULL)', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const db = openTestDb(env.dbPath)
      const info = db.prepare(
        'INSERT INTO notes (content, session_id, backup_emoji) VALUES (?, NULL, NULL)'
      ).run('legacy note')
      db.close()

      const res = await request(app)
        .delete(`/api/notes/${info.lastInsertRowid}`)
        .send({ session_id: session.session_id })
      expect(res.status).toBe(200)
    })

    it('returns 404 when deleting a non-existent note', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .delete('/api/notes/99999')
        .send({ session_id: session.session_id })
      expect(res.status).toBe(404)
    })
  })
})
