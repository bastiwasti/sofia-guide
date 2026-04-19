import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export interface UserLocation {
  session_id: string
  emoji: string
  lat: number
  lng: number
  accuracy: number
  is_tracking: boolean
  last_seen: string
}

export function useUserLocations(sessionId: string | null, userEmoji: string | null) {
  const [userLocations, setUserLocations] = useState<UserLocation[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [gpsMode, setGpsMode] = useState<'off' | 'static' | 'tracking'>('off')
  const socketRef = useRef<Socket | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!sessionId || !userEmoji) return

    const wsUrl = (import.meta as any).env.PROD ? window.location.origin : 'http://localhost:3002'
    const newSocket = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket')
      newSocket.emit('request-user-locations')
    })

    newSocket.on('user-locations-current', (locations: UserLocation[]) => {
      setUserLocations(locations)
    })

    newSocket.on('user-location-broadcast', (location: UserLocation) => {
      setUserLocations(prev => {
        const exists = prev.findIndex(l => l.session_id === location.session_id)
        if (exists >= 0) {
          const updated = [...prev]
          updated[exists] = location
          return updated
        }
        return [...prev, location]
      })
    })

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      newSocket.disconnect()
    }
  }, [sessionId, userEmoji])

  const startSharing = (mode: 'static' | 'tracking') => {
    if (!socketRef.current || !sessionId || !userEmoji || !navigator.geolocation) return

    setGpsMode(mode)
    setIsSharing(true)

    const options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }

    if (mode === 'static') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords
          socketRef.current?.emit('user-location-update', {
            session_id: sessionId,
            emoji: userEmoji,
            lat: latitude,
            lng: longitude,
            accuracy,
            is_tracking: false
          })
        },
        (err) => console.error('Geolocation error:', err),
        options
      )
    } else {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords
          socketRef.current?.emit('user-location-update', {
            session_id: sessionId,
            emoji: userEmoji,
            lat: latitude,
            lng: longitude,
            accuracy,
            is_tracking: true
          })
        },
        (err) => console.error('Geolocation error:', err),
        options
      )
    }
  }

  const stopSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsMode('off')
    setIsSharing(false)
  }

  const toggleGpsMode = () => {
    if (gpsMode === 'off') {
      startSharing('static')
    } else if (gpsMode === 'static') {
      stopSharing()
      startSharing('tracking')
    } else {
      stopSharing()
    }
  }

  return {
    userLocations,
    isSharing,
    gpsMode,
    startSharing,
    stopSharing,
    toggleGpsMode
  }
}
