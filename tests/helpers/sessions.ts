import type { Express } from 'express'
import request from 'supertest'

export interface TestSession {
  id: number
  session_id: string
  emoji: string
  recovery_code: string
  created_at: string
  last_seen: string
}

export async function createSessionViaApi(
  app: Express,
  emoji: string,
  recovery_code: string
): Promise<TestSession> {
  const res = await request(app)
    .post('/api/user-sessions')
    .send({ emoji, recovery_code })
  if (res.status !== 200) {
    throw new Error(`createSessionViaApi failed: ${res.status} ${JSON.stringify(res.body)}`)
  }
  return res.body as TestSession
}

export async function createCategoryViaApi(
  app: Express,
  name: string,
  color = '#C2185B',
  icon = 'map-pin'
): Promise<{ id: number; name: string; color: string; icon: string }> {
  const res = await request(app)
    .post('/api/categories')
    .send({ name, color, icon })
  if (res.status !== 201) {
    throw new Error(`createCategoryViaApi failed: ${res.status} ${JSON.stringify(res.body)}`)
  }
  return res.body
}
