import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { getSocket } from './useSocket'
import { WEEKEND_START, WEEKEND_END, EventType } from '../lib/weekend'

export interface EventOccurrence {
  id: number
  title: string
  event_type: EventType
  location_id: number | null
  venue_name: string | null
  venue_address: string | null
  venue_lat: number | null
  venue_lng: number | null
  start_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  recurrence: string | null
  recurrence_until: string | null
  price: string | null
  external_url: string | null
  description: string | null
  emoji: string | null
  occurrence_date: string
  location_name: string | null
  location_category_id: number | null
  location_category_color: string | null
  location_category_icon: string | null
  location_lat: number | null
  location_lng: number | null
}

export function useEvents(from: string = WEEKEND_START, to: string = WEEKEND_END) {
  const [events, setEvents] = useState<EventOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchEvents() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<EventOccurrence[]>(`/events?from=${from}&to=${to}`)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()

    const socket = getSocket()
    if (socket) {
      socket.on('event-created', () => {
        fetchEvents()
      })
      socket.on('event-deleted', () => {
        fetchEvents()
      })
    }

    return () => {
      if (socket) {
        socket.off('event-created')
        socket.off('event-deleted')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

  return { events, loading, error, refetch: fetchEvents }
}
