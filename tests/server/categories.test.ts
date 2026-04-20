import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestDbEnv, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'

describe('categories API', () => {
  let env: TestDbEnv
  let app: Express

  beforeEach(() => {
    env = createTestDbEnv()
    app = buildRestApp()
  })

  afterEach(() => {
    env.cleanup()
  })

  it('returns empty list when no categories exist', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('creates a category and lists it back sorted by name', async () => {
    await request(app)
      .post('/api/categories')
      .send({ name: 'Restaurants', color: '#3B6D11', icon: 'utensils' })
      .expect(201)
    await request(app)
      .post('/api/categories')
      .send({ name: 'Bars', color: '#9B2915', icon: 'beer' })
      .expect(201)

    const list = await request(app).get('/api/categories').expect(200)
    expect(list.body.map((c: { name: string }) => c.name)).toEqual(['Bars', 'Restaurants'])
  })

  it('rejects category creation when required fields are missing', async () => {
    const missingName = await request(app)
      .post('/api/categories')
      .send({ color: '#000', icon: 'x' })
    expect(missingName.status).toBe(400)

    const missingColor = await request(app)
      .post('/api/categories')
      .send({ name: 'X', icon: 'x' })
    expect(missingColor.status).toBe(400)

    const missingIcon = await request(app)
      .post('/api/categories')
      .send({ name: 'X', color: '#000' })
    expect(missingIcon.status).toBe(400)
  })

  it('rejects duplicate category name (UNIQUE constraint)', async () => {
    await request(app)
      .post('/api/categories')
      .send({ name: 'Sights', color: '#C2185B', icon: 'landmark' })
      .expect(201)

    const dup = await request(app)
      .post('/api/categories')
      .send({ name: 'Sights', color: '#000', icon: 'x' })
    expect(dup.status).toBe(500)
  })
})
