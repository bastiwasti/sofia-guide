import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { io as ioClient, Socket } from 'socket.io-client'
import request from 'supertest'
import { createTestDbEnv, openTestDb, type TestDbEnv } from '../helpers/testDb'
import { buildRestApp } from '../helpers/testApp'
import { startGpsServer, type GpsServer } from '../helpers/gpsServer'
import { createSessionViaApi, type TestSession } from '../helpers/sessions'

function connect(url: string): Promise<Socket> {
  const s = ioClient(url, { transports: ['websocket'], forceNew: true })
  return new Promise((resolve, reject) => {
    s.once('connect', () => resolve(s))
    s.once('connect_error', reject)
  })
}

function joinRoom(socket: Socket, room: string): Promise<void> {
  return new Promise((resolve) => socket.emit('join', room, resolve))
}

describe('GPS live-location — own emoji visible, others visible', () => {
  let env: TestDbEnv
  let gps: GpsServer
  let clients: Socket[]
  let userA: TestSession
  let userB: TestSession

  beforeEach(async () => {
    env = createTestDbEnv()
    gps = await startGpsServer()
    clients = []

    // Seed two real sessions via the REST API (shares the same temp DB).
    const app = buildRestApp()
    userA = await createSessionViaApi(app, '🦊', 'A7X2')
    userB = await createSessionViaApi(app, '🐼', 'B3C4')
  })

  afterEach(async () => {
    for (const c of clients) c.disconnect()
    await gps.stop()
    env.cleanup()
  })

  it('E1 — a user-location-update from User A upserts a row in user_locations with their session_id', async () => {
    const a = await connect(gps.url)
    clients.push(a)

    const broadcastReceived = new Promise<void>((resolve) => {
      a.once('user-location-broadcast', () => resolve())
    })

    await joinRoom(a, 'sofia-guide')
    a.emit('user-location-update', {
      session_id: userA.session_id,
      emoji: '🦊',
      lat: 42.6953,
      lng: 23.3219,
      accuracy: 10,
      is_tracking: true,
    })

    // Wait for the server's broadcast as proof that the DB write completed.
    await broadcastReceived

    const db = openTestDb(env.dbPath)
    const rows = db.prepare(
      'SELECT session_id, lat, lng FROM user_locations WHERE session_id = ?'
    ).all(userA.session_id) as Array<{ session_id: string; lat: number; lng: number }>
    db.close()

    expect(rows).toHaveLength(1)
    expect(rows[0].lat).toBeCloseTo(42.6953)
    expect(rows[0].lng).toBeCloseTo(23.3219)
  })

  it('E2 — User B (in room sofia-guide) receives User A\'s user-location-broadcast with A\'s emoji 🦊', async () => {
    const a = await connect(gps.url)
    const b = await connect(gps.url)
    clients.push(a, b)

    await joinRoom(b, 'sofia-guide')
    await joinRoom(a, 'sofia-guide')

    const bReceives = new Promise<{ emoji: string; session_id: string; lat: number; lng: number }>(
      (resolve) => b.once('user-location-broadcast', resolve as (...args: unknown[]) => void)
    )

    a.emit('user-location-update', {
      session_id: userA.session_id,
      emoji: '🦊',
      lat: 42.7,
      lng: 23.3,
      accuracy: 5,
      is_tracking: true,
    })

    const msg = await bReceives
    expect(msg.session_id).toBe(userA.session_id)
    expect(msg.emoji).toBe('🦊')
    expect(msg.lat).toBeCloseTo(42.7)
    expect(msg.lng).toBeCloseTo(23.3)
  })

  it('E3 — User A receives their own broadcast back (their own emoji is visible on their own map)', async () => {
    const a = await connect(gps.url)
    clients.push(a)

    await joinRoom(a, 'sofia-guide')

    const ownReceives = new Promise<{ emoji: string; session_id: string }>(
      (resolve) => a.once('user-location-broadcast', resolve as (...args: unknown[]) => void)
    )

    a.emit('user-location-update', {
      session_id: userA.session_id,
      emoji: '🦊',
      lat: 42.7,
      lng: 23.3,
      accuracy: 5,
      is_tracking: true,
    })

    const msg = await ownReceives
    expect(msg.session_id).toBe(userA.session_id)
    expect(msg.emoji).toBe('🦊')
    // Suppress lint about unused userB: referencing it keeps setup symmetric.
    expect(userB.emoji).toBe('🐼')
  })
})
