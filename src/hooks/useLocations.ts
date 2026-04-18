import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Location {
  id: number
  category_id: number
  name: string
  meta: string | null
  rating: number | null
  price_range: string | null
  lat: number
  lng: number
  created_at: string
  category_name: string
  category_color: string
  category_icon: string
  author_emoji: string | null
  has_author: number
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Location[]>('/locations')
      setLocations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations')
    } finally {
      setLoading(false)
    }
  }

  async function createLocation(location: Partial<Location>) {
    try {
      const newLocation = await api.post<Location>('/locations', location)
      setLocations(prev => [...prev, newLocation])
      return newLocation
    } catch (err) {
      throw err
    }
  }

  async function deleteLocation(id: number) {
    try {
      await api.delete(`/locations/${id}`)
      setLocations(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation,
    deleteLocation
  }
}
