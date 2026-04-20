import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestDbEnv, openTestDb, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'
import { createSessionViaApi } from '../helpers/sessions'

describe('emoji identity — create / switch / recover / give up', () => {
  let env: TestDbEnv
  let app: Express

  beforeEach(() => {
    env = createTestDbEnv()
    app = buildRestApp()
  })

  afterEach(() => {
    env.cleanup()
  })

  describe('create', () => {
    it('picks a fresh emoji + recovery code', async () => {
      const res = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🦊', recovery_code: 'A7X2' })
      expect(res.status).toBe(200)
      expect(res.body.emoji).toBe('🦊')
      expect(res.body.recovery_code).toBe('A7X2')
      expect(typeof res.body.session_id).toBe('string')
      expect(res.body.session_id.length).toBeGreaterThan(0)
    })

    it('rejects an emoji somebody else already holds (409 + taken_emojis list)', async () => {
      await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🦊', recovery_code: 'B3C4' })
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/already taken/i)
      expect(res.body.taken_emojis).toContain('🦊')
    })

    it('allows two users to hold different emojis simultaneously', async () => {
      await createSessionViaApi(app, '🦊', 'A7X2')
      await createSessionViaApi(app, '🐼', 'B3C4')
      const list = await request(app).get('/api/user-sessions').expect(200)
      const emojis = list.body.map((s: { emoji: string }) => s.emoji)
      expect(emojis).toEqual(expect.arrayContaining(['🦊', '🐼']))
    })

    it('rejects malformed recovery codes', async () => {
      const tooShort = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🦊', recovery_code: 'ABC' })
      expect(tooShort.status).toBe(400)

      const tooLong = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🐼', recovery_code: 'ABCDE' })
      expect(tooLong.status).toBe(400)

      const withSymbol = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🐻', recovery_code: 'AB@1' })
      expect(withSymbol.status).toBe(400)
    })

    it('rejects malformed emojis (empty or too long)', async () => {
      const empty = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '', recovery_code: 'A7X2' })
      expect(empty.status).toBe(400)

      const tooLong = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: 'abcde', recovery_code: 'A7X2' })
      expect(tooLong.status).toBe(400)
    })
  })

  describe('recover', () => {
    it('recovers an existing session by emoji + correct code, preserves session_id, updates last_seen', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')

      const db = openTestDb(env.dbPath)
      db.prepare('UPDATE user_sessions SET last_seen = ? WHERE session_id = ?').run(
        '2020-01-01T00:00:00.000Z',
        created.session_id
      )
      db.close()

      const res = await request(app)
        .put('/api/user-sessions/reclaim')
        .send({ emoji: '🦊', recovery_code: 'A7X2' })
      expect(res.status).toBe(200)
      expect(res.body.session_id).toBe(created.session_id)
      expect(res.body.last_seen).not.toBe('2020-01-01T00:00:00.000Z')
    })

    it('rejects recover with wrong recovery code (401) and does not update last_seen', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      const db = openTestDb(env.dbPath)
      db.prepare('UPDATE user_sessions SET last_seen = ? WHERE session_id = ?').run(
        '2020-01-01T00:00:00.000Z',
        created.session_id
      )
      db.close()

      const res = await request(app)
        .put('/api/user-sessions/reclaim')
        .send({ emoji: '🦊', recovery_code: 'WRNG' })
      expect(res.status).toBe(401)

      const after = openTestDb(env.dbPath)
      const row = after.prepare('SELECT last_seen FROM user_sessions WHERE session_id = ?').get(created.session_id) as { last_seen: string }
      after.close()
      expect(row.last_seen).toBe('2020-01-01T00:00:00.000Z')
    })

    it('returns 404 when recovering an emoji nobody has', async () => {
      const res = await request(app)
        .put('/api/user-sessions/reclaim')
        .send({ emoji: '🦄', recovery_code: 'A7X2' })
      expect(res.status).toBe(404)
    })
  })

  describe('switch', () => {
    it('switches emoji to a free one (PATCH) with correct recovery code — session_id unchanged, old emoji freed', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')

      const res = await request(app)
        .patch(`/api/user-sessions/${created.session_id}/emoji`)
        .send({ emoji: '🐼', recovery_code: 'A7X2' })
      expect(res.status).toBe(200)
      expect(res.body.session_id).toBe(created.session_id)
      expect(res.body.emoji).toBe('🐼')

      const newOwner = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🦊', recovery_code: 'Z9Z9' })
      expect(newOwner.status).toBe(200)
    })

    it('rejects switch with wrong recovery code (401), emoji unchanged', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .patch(`/api/user-sessions/${created.session_id}/emoji`)
        .send({ emoji: '🐼', recovery_code: 'WRNG' })
      expect(res.status).toBe(401)

      const db = openTestDb(env.dbPath)
      const row = db.prepare('SELECT emoji FROM user_sessions WHERE session_id = ?').get(created.session_id) as { emoji: string }
      db.close()
      expect(row.emoji).toBe('🦊')
    })

    it('rejects switch to an emoji somebody else owns (409 + taken_emojis)', async () => {
      const a = await createSessionViaApi(app, '🦊', 'A7X2')
      await createSessionViaApi(app, '🐼', 'B3C4')

      const res = await request(app)
        .patch(`/api/user-sessions/${a.session_id}/emoji`)
        .send({ emoji: '🐼', recovery_code: 'A7X2' })
      expect(res.status).toBe(409)
      expect(res.body.taken_emojis).toEqual(expect.arrayContaining(['🦊', '🐼']))

      const db = openTestDb(env.dbPath)
      const row = db.prepare('SELECT emoji FROM user_sessions WHERE session_id = ?').get(a.session_id) as { emoji: string }
      db.close()
      expect(row.emoji).toBe('🦊')
    })

    it('allows PATCH with your own current emoji (no-op, 200)', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .patch(`/api/user-sessions/${created.session_id}/emoji`)
        .send({ emoji: '🦊', recovery_code: 'A7X2' })
      expect(res.status).toBe(200)
      expect(res.body.emoji).toBe('🦊')
    })
  })

  describe('give up (DELETE) and validate', () => {
    it('deletes a session so the emoji is immediately free for someone else', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      await request(app).delete(`/api/user-sessions/${created.session_id}`).expect(200)

      const newOwner = await request(app)
        .post('/api/user-sessions')
        .send({ emoji: '🦊', recovery_code: 'Z9Z9' })
      expect(newOwner.status).toBe(200)
    })

    it('validates an active session as {valid:true, emoji}', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .get(`/api/user-sessions/${created.session_id}/validate`)
        .expect(200)
      expect(res.body).toEqual({ valid: true, emoji: '🦊' })
    })

    it('validates a given-up session as {valid:false}', async () => {
      const created = await createSessionViaApi(app, '🦊', 'A7X2')
      await request(app).delete(`/api/user-sessions/${created.session_id}`).expect(200)
      const res = await request(app)
        .get(`/api/user-sessions/${created.session_id}/validate`)
        .expect(200)
      expect(res.body).toEqual({ valid: false })
    })
  })
})
