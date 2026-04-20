import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestDbEnv, openTestDb, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'
import { createSessionViaApi, createCategoryViaApi } from '../helpers/sessions'

const ADMIN_PASSWORD = '24031986'

describe('locations API — create/list/delete with emoji propagation', () => {
  let env: TestDbEnv
  let app: Express
  let categoryId: number

  beforeEach(async () => {
    env = createTestDbEnv()
    app = buildRestApp()
    const cat = await createCategoryViaApi(app, 'Sights', '#C2185B', 'landmark')
    categoryId = cat.id
  })

  afterEach(() => {
    env.cleanup()
  })

  describe('create', () => {
    it('creates a location and populates backup_emoji from the session', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')

      const res = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'Halbite Craft Beer',
        lat: 42.6953,
        lng: 23.3219,
        session_id: session.session_id,
      })
      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Halbite Craft Beer')
      expect(res.body.backup_emoji).toBe('🦊')
      expect(res.body.author_emoji).toBe('🦊')
      expect(res.body.is_active_user).toBe(1)
      expect(res.body.category_name).toBe('Sights')
      expect(res.body.category_color).toBe('#C2185B')
      expect(res.body.category_icon).toBe('landmark')
    })

    it('round-trips an emoji in the location name unchanged', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const name = '🍺 Halbite'
      const res = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name,
        lat: 42.7,
        lng: 23.3,
        session_id: session.session_id,
      })
      expect(res.status).toBe(201)
      expect(res.body.name).toBe(name)
    })

    it('rejects POST without name (400)', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app).post('/api/locations').send({
        category_id: categoryId,
        lat: 42.7,
        lng: 23.3,
        session_id: session.session_id,
      })
      expect(res.status).toBe(400)
    })

    it('rejects POST without lat (400)', async () => {
      const res = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'X',
        lng: 23.3,
      })
      expect(res.status).toBe(400)
    })

    it('rejects POST without lng (400)', async () => {
      const res = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'X',
        lat: 42.7,
      })
      expect(res.status).toBe(400)
    })

    it('returns 500 for POST with a non-existent category_id (FK violation)', async () => {
      const res = await request(app).post('/api/locations').send({
        category_id: 99999,
        name: 'X',
        lat: 42.7,
        lng: 23.3,
      })
      expect(res.status).toBe(500)
    })
  })

  describe('list and read', () => {
    it('returns an empty list when no locations exist', async () => {
      const res = await request(app).get('/api/locations')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns a location by id with joined category fields', async () => {
      const created = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'NDK',
        lat: 42.68,
        lng: 23.32,
      })
      const res = await request(app).get(`/api/locations/${created.body.id}`)
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('NDK')
      expect(res.body.category_name).toBe('Sights')
    })

    it('returns 404 for an unknown location id', async () => {
      const res = await request(app).get('/api/locations/99999')
      expect(res.status).toBe(404)
    })
  })

  describe('emoji propagation', () => {
    it('when the author switches their emoji, the location shows the NEW author_emoji but backup_emoji stays frozen', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const loc = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'Halbite',
        lat: 42.7,
        lng: 23.3,
        session_id: session.session_id,
      })
      expect(loc.body.author_emoji).toBe('🦊')
      expect(loc.body.backup_emoji).toBe('🦊')

      await request(app)
        .patch(`/api/user-sessions/${session.session_id}/emoji`)
        .send({ emoji: '🐼', recovery_code: 'A7X2' })
        .expect(200)

      const list = await request(app).get('/api/locations').expect(200)
      const mine = list.body.find((l: { id: number }) => l.id === loc.body.id)
      expect(mine.author_emoji).toBe('🐼')
      expect(mine.backup_emoji).toBe('🦊')
      expect(mine.is_active_user).toBe(1)
    })

    it('when the author gives up their emoji, their location remains with author_emoji=null and backup_emoji as fallback', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const loc = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'Halbite',
        lat: 42.7,
        lng: 23.3,
        session_id: session.session_id,
      })

      // locations has no FK on session_id (it was added via migration, no FK),
      // so this DELETE succeeds and leaves a dangling session_id pointer.
      await request(app).delete(`/api/user-sessions/${session.session_id}`).expect(200)

      const list = await request(app).get('/api/locations').expect(200)
      const mine = list.body.find((l: { id: number }) => l.id === loc.body.id)
      expect(mine).toBeDefined()
      expect(mine.author_emoji).toBeNull()
      expect(mine.backup_emoji).toBe('🦊')
      expect(mine.is_active_user).toBe(0)
    })
  })

  describe('delete authorization', () => {
    it('lets the owner delete their own location', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const loc = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'MyLoc',
        lat: 42.7,
        lng: 23.3,
        session_id: session.session_id,
      })

      await request(app)
        .delete(`/api/locations/${loc.body.id}`)
        .send({ session_id: session.session_id })
        .expect(200)

      const list = await request(app).get('/api/locations').expect(200)
      expect(list.body.find((l: { id: number }) => l.id === loc.body.id)).toBeUndefined()
    })

    it("rejects deletion of somebody else's location without admin password (403)", async () => {
      const a = await createSessionViaApi(app, '🦊', 'A7X2')
      const b = await createSessionViaApi(app, '🐼', 'B3C4')
      const loc = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'A.loc',
        lat: 42.7,
        lng: 23.3,
        session_id: a.session_id,
      })

      const res = await request(app)
        .delete(`/api/locations/${loc.body.id}`)
        .send({ session_id: b.session_id })
      expect(res.status).toBe(403)
    })

    it("allows deletion of somebody else's location with admin password", async () => {
      const a = await createSessionViaApi(app, '🦊', 'A7X2')
      const b = await createSessionViaApi(app, '🐼', 'B3C4')
      const loc = await request(app).post('/api/locations').send({
        category_id: categoryId,
        name: 'A.loc',
        lat: 42.7,
        lng: 23.3,
        session_id: a.session_id,
      })

      const res = await request(app)
        .delete(`/api/locations/${loc.body.id}`)
        .send({ session_id: b.session_id, admin_password: ADMIN_PASSWORD })
      expect(res.status).toBe(200)
    })

    it('lets anyone delete a legacy location (session_id IS NULL) without a password', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const db = openTestDb(env.dbPath)
      const info = db.prepare(
        'INSERT INTO locations (category_id, name, lat, lng, session_id) VALUES (?, ?, ?, ?, NULL)'
      ).run(categoryId, 'legacy', 42.7, 23.3)
      db.close()

      const res = await request(app)
        .delete(`/api/locations/${info.lastInsertRowid}`)
        .send({ session_id: session.session_id })
      expect(res.status).toBe(200)
    })

    it('returns 404 when deleting a non-existent location', async () => {
      const session = await createSessionViaApi(app, '🦊', 'A7X2')
      const res = await request(app)
        .delete('/api/locations/99999')
        .send({ session_id: session.session_id })
      expect(res.status).toBe(404)
    })
  })
})
