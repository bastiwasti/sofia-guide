import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestDbEnv, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'

describe('events API', () => {
  let env: TestDbEnv
  let app: Express

  beforeEach(() => {
    env = createTestDbEnv()
    app = buildRestApp()
  })

  afterEach(() => {
    env.cleanup()
  })

  it('rejects GET without valid from/to query params', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toBe(400)
  })

  it('returns empty array when no events exist', async () => {
    const res = await request(app).get('/api/events?from=2026-05-15&to=2026-05-17')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('creates a one-off event and returns it in the window', async () => {
    const create = await request(app).post('/api/events').send({
      title: 'Test Concert',
      event_type: 'concert',
      start_date: '2026-05-16',
      start_time: '20:00',
      venue_name: 'Sofia Live Club',
    })
    expect(create.status).toBe(201)
    expect(create.body.title).toBe('Test Concert')

    const list = await request(app).get('/api/events?from=2026-05-15&to=2026-05-17')
    expect(list.status).toBe(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0].occurrence_date).toBe('2026-05-16')
    expect(list.body[0].venue_name).toBe('Sofia Live Club')
  })

  it('expands a weekly recurring event on the matching weekday', async () => {
    await request(app).post('/api/events').send({
      title: 'Friday Jazz',
      event_type: 'concert',
      recurrence: 'weekly:5',
      start_time: '21:00',
    })

    const res = await request(app).get('/api/events?from=2026-05-15&to=2026-05-17')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].occurrence_date).toBe('2026-05-15')
  })

  it('rejects POST with invalid event_type', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Bad',
      event_type: 'brunch',
      start_date: '2026-05-16',
    })
    expect(res.status).toBe(400)
  })

  it('rejects POST without start_date or recurrence', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Bad',
      event_type: 'concert',
    })
    expect(res.status).toBe(400)
  })

  it('deletes an event by id', async () => {
    const created = await request(app).post('/api/events').send({
      title: 'Ephemeral',
      event_type: 'festival',
      start_date: '2026-05-16',
    })

    const del = await request(app).delete(`/api/events/${created.body.id}`)
    expect(del.status).toBe(200)

    const list = await request(app).get('/api/events?from=2026-05-15&to=2026-05-17')
    expect(list.body).toHaveLength(0)
  })
})
