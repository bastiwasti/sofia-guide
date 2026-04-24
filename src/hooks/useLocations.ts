import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { getSocket } from './useSocket'

export interface BeerMenuItem {
  name: string
  brewery?: string
  price: string
  style?: string
}

export interface CocktailMenuItem {
  name: string
  price: string
  ingredients?: string
}

export interface FoodMenuItem {
  name: string
  price: string
  description?: string
}

export interface LocalSpecialty {
  name: string
  description: string
  price?: string
}

export type SeatingOption = "indoor" | "terrace" | "garden" | "rooftop"
export type PaymentMethod = "cash" | "card" | "revolut"

export interface Location {
  id: number
  category_id: number
  name: string
  meta: string | null
  rating: number | null
  price_range: string | null
  lat: number
  lng: number
  session_id: string | null
  created_at: string
  category_name: string
  category_color: string
  category_icon: string
  backup_emoji: string | null
  author_emoji: string | null
  is_active_user: number
  
  website_url?: string | null
  address?: string | null
  opening_hours?: string | null
  phone?: string | null
  payment_methods?: string | null
  beer_menu?: string | null
  cocktails_menu?: string | null
  food_menu?: string | null
  local_specialties?: string | null
  music_type?: string | null
  crowd_type?: string | null
  pro_tips?: string | null
  fun_facts?: string | null
  seating_options?: string | null
  entry_fee?: string | null
  visit_duration?: string | null
  best_time_to_visit?: string | null
  photo_allowed?: string | null
  guided_tours?: string | null
  key_features?: string | null
  dress_code?: string | null
  service_times?: string | null
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()

    const socket = getSocket()

    if (socket) {
      socket.on('location-created', (newLocation: Location) => {
        setLocations(prev => {
          if (prev.some(l => l.id === newLocation.id)) {
            return prev
          }
          return [...prev, newLocation]
        })
      })

      socket.on('location-deleted', ({ id }: { id: number }) => {
        setLocations(prev => prev.filter(l => l.id !== id))
      })
    }

    return () => {
      if (socket) {
        socket.off('location-created')
        socket.off('location-deleted')
      }
    }
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

  async function deleteLocation(id: number, sessionId?: string | null, adminPassword?: string) {
    try {
      await api.delete(`/locations/${id}`, { session_id: sessionId || null, admin_password: adminPassword })
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
