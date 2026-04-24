import { describe, it, expect } from 'vitest'
import { expandRecurrence, expandMany, EventRow } from '../../server/lib/event-recurrence'

function makeEvent(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: 1,
    title: 'Test',
    event_type: 'concert',
    location_id: null,
    venue_name: null,
    venue_address: null,
    venue_lat: null,
    venue_lng: null,
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null,
    recurrence: null,
    recurrence_until: null,
    price: null,
    external_url: null,
    description: null,
    emoji: null,
    ...overrides,
  }
}

describe('expandRecurrence', () => {
  describe('one-off events', () => {
    it('expands a single-date event inside the window to one occurrence', () => {
      const evt = makeEvent({ start_date: '2026-05-16' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(1)
      expect(out[0].occurrence_date).toBe('2026-05-16')
    })

    it('returns empty for a one-off event before the window', () => {
      const evt = makeEvent({ start_date: '2026-04-01' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(0)
    })

    it('returns empty for a one-off event after the window', () => {
      const evt = makeEvent({ start_date: '2026-06-01' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(0)
    })

    it('emits one occurrence per in-window day for a multi-day event', () => {
      const evt = makeEvent({ start_date: '2026-05-14', end_date: '2026-05-17' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out.map(o => o.occurrence_date)).toEqual([
        '2026-05-15',
        '2026-05-16',
        '2026-05-17',
      ])
    })

    it('returns empty when a multi-day event ends before the window starts', () => {
      const evt = makeEvent({ start_date: '2026-05-10', end_date: '2026-05-14' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(0)
    })
  })

  describe('weekly recurrence', () => {
    it('emits exactly one Friday occurrence for a weekly:5 event over a Fri–Sun window', () => {
      const evt = makeEvent({ recurrence: 'weekly:5', start_time: '21:00' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(1)
      expect(out[0].occurrence_date).toBe('2026-05-15')
    })

    it('emits zero occurrences for a weekly:5 when window contains no Friday', () => {
      // 2026-05-16 (Sat) → 2026-05-17 (Sun) — no Friday
      const evt = makeEvent({ recurrence: 'weekly:5' })
      const out = expandRecurrence(evt, '2026-05-16', '2026-05-17')
      expect(out).toHaveLength(0)
    })

    it('emits multiple Sundays across a two-week window', () => {
      const evt = makeEvent({ recurrence: 'weekly:7' })
      const out = expandRecurrence(evt, '2026-05-04', '2026-05-17')
      expect(out.map(o => o.occurrence_date)).toEqual([
        '2026-05-10',
        '2026-05-17',
      ])
    })

    it('respects recurrence_until before the window → zero occurrences', () => {
      const evt = makeEvent({
        recurrence: 'weekly:5',
        recurrence_until: '2026-05-01',
      })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(0)
    })

    it('respects recurrence_until inside the window — clips later occurrences', () => {
      const evt = makeEvent({
        recurrence: 'weekly:5',
        recurrence_until: '2026-05-15',
      })
      const out = expandRecurrence(evt, '2026-05-08', '2026-05-22')
      expect(out.map(o => o.occurrence_date)).toEqual([
        '2026-05-08',
        '2026-05-15',
      ])
    })

    it('returns empty array for malformed recurrence strings', () => {
      const cases = ['weekly:8', 'weekly:0', 'weekly:', 'monthly:5', 'garbage']
      for (const bad of cases) {
        const evt = makeEvent({ recurrence: bad })
        expect(expandRecurrence(evt, '2026-05-15', '2026-05-17')).toEqual([])
      }
    })
  })

  describe('edge cases', () => {
    it('returns empty for malformed date inputs', () => {
      const evt = makeEvent({ start_date: '2026-05-16' })
      expect(expandRecurrence(evt, 'bogus', '2026-05-17')).toEqual([])
      expect(expandRecurrence(evt, '2026-05-15', 'bogus')).toEqual([])
      expect(expandRecurrence(evt, '2026-13-01', '2026-05-17')).toEqual([])
    })

    it('returns empty when from > to', () => {
      const evt = makeEvent({ start_date: '2026-05-16' })
      expect(expandRecurrence(evt, '2026-05-20', '2026-05-10')).toEqual([])
    })

    it('returns empty for an event with neither start_date nor recurrence', () => {
      const evt = makeEvent()
      expect(expandRecurrence(evt, '2026-05-15', '2026-05-17')).toEqual([])
    })

    it('handles window ending on the event date (inclusive)', () => {
      const evt = makeEvent({ start_date: '2026-05-17' })
      const out = expandRecurrence(evt, '2026-05-15', '2026-05-17')
      expect(out).toHaveLength(1)
    })
  })
})

describe('expandMany', () => {
  it('sorts occurrences by date, then start_time, then id', () => {
    const a = makeEvent({ id: 10, start_date: '2026-05-16', start_time: '21:00' })
    const b = makeEvent({ id: 11, start_date: '2026-05-16', start_time: '20:00' })
    const c = makeEvent({ id: 12, start_date: '2026-05-15', start_time: '19:00' })
    const d = makeEvent({ id: 13, start_date: '2026-05-15', start_time: '19:00' })
    const out = expandMany([a, b, c, d], '2026-05-15', '2026-05-17')
    expect(out.map(o => o.id)).toEqual([12, 13, 11, 10])
  })

  it('produces nothing from an empty input', () => {
    expect(expandMany([], '2026-05-15', '2026-05-17')).toEqual([])
  })
})
