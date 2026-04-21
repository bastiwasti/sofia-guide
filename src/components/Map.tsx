import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { createCustomIcon, HOTEL_COORDS, calculateDistance, formatDistance } from '../lib/leaflet'
import { Location } from '../hooks/useLocations'
import { UserLocation } from '../hooks/useUserLocations'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  locations: Location[]
  selectedLocation: Location | null
  onLocationSelect: (location: Location | null) => void
  showDistanceRings: boolean
  showUserLocation?: boolean
  isTracking?: boolean
  onMapClick?: (e: any) => void
  editMode?: boolean
  onDeleteLocation?: (id: number) => void
  hotelFlyTrigger?: number
  userLocations: UserLocation[]
  currentSessionId: string | null
  showOwnMarker?: boolean
  onRefetchLocations?: () => void
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

function HotelFlyController({ trigger }: { trigger: number }) {
  const map = useMap()
  const prevTrigger = useRef(trigger)
  useEffect(() => {
    if (trigger !== prevTrigger.current) {
      prevTrigger.current = trigger
      map.flyTo(HOTEL_COORDS, 16)
    }
  }, [trigger, map])
  return null
}

function MapClickHandler({ onClick, enabled }: { onClick: (e: any) => void, enabled: boolean }) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onClick(e)
      }
    }
  })
  return null
}

function UserLocationMarker({ isTracking, userEmoji }: { isTracking: boolean; userEmoji: string | null }) {
  console.log('UserLocationMarker rendering, isTracking:', isTracking, 'userEmoji:', userEmoji)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const map = useMap()

  const icon = L.divIcon({
    className: 'user-marker',
    html: `
      <div class="user-marker-content ${isTracking ? 'tracking' : ''}">
        <span class="user-emoji">${userEmoji || '📍'}</span>
        ${isTracking ? '<div class="pulse-ring"></div>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })

  useEffect(() => {
    console.log('UserLocationMarker mounted, starting geolocation...')

    if (!navigator.geolocation) {
      console.log('Geolocation nicht unterstützt')
      alert('Dein Browser unterstützt GPS nicht')
      return
    }

    let watchId: number | null = null

    const getCurrentPosition = () => {
      console.log('Requesting geolocation...')

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy: acc } = pos.coords
          console.log('Position gefunden:', { latitude, longitude, accuracy: acc })
          const newPos: [number, number] = [latitude, longitude]
          setPosition(newPos)
          setAccuracy(acc)
          map.setView(newPos, 16)
        },
        (error) => {
          console.log('Geolocation Fehler:', error.message, error.code)
          alert('GPS nicht verfügbar: ' + error.message + '\nCode: ' + error.code)
          map.setView(HOTEL_COORDS, 15)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

    const startWatching = () => {
      console.log('Starting live tracking...')
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy: acc } = pos.coords
          const newPos: [number, number] = [latitude, longitude]
          setPosition(newPos)
          setAccuracy(acc)
          if (position) {
            const distance = calculateDistance(position[0], position[1], latitude, longitude)
            if (distance > 50) {
              map.setView(newPos, 16)
            }
          }
        },
        (error) => {
          console.log('Live tracking Fehler:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

    getCurrentPosition()

    if (isTracking) {
      startWatching()
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        console.log('Stopped watching position')
      }
    }
  }, [map, isTracking])

  if (!position || !accuracy) return null

  return (
    <>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          color: '#4285F4',
          weight: 1
        }}
      />
      <Marker
        position={position}
        icon={icon}
      >
        <Popup>
          <div style={{ fontFamily: 'var(--font-body)', minWidth: '150px' }}>
            <strong style={{ fontSize: '18px' }}>{userEmoji || '📍'}</strong>
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
              Deine Position<br />
              Genauigkeit: {Math.round(accuracy)}m<br />
              {isTracking ? '🔴 Live-Tracking' : '📍 Statische Position'}
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  )
}

function OtherUserMarker({ user, currentSessionId }: { user: UserLocation; currentSessionId: string | null }) {
  const icon = L.divIcon({
    className: 'user-marker',
    html: `
      <div class="user-marker-content ${user.is_tracking ? 'tracking' : ''}">
        <span class="user-emoji">${user.emoji}</span>
        ${user.is_tracking ? '<div class="pulse-ring"></div>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })

  return (
    <Marker
      position={[user.lat, user.lng]}
      icon={icon}
    >
      <Popup>
        <div style={{ fontFamily: 'var(--font-body)', minWidth: '150px' }}>
          <strong style={{ fontSize: '18px' }}>{user.emoji}</strong>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
            Genauigkeit: {Math.round(user.accuracy)}m<br />
            {user.is_tracking ? '🔴 Live-Tracking' : '📍 Statische Position'}
          </div>
          {currentSessionId === user.session_id && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#999' }}>
              Das bist du!
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapComponent({ locations, onLocationSelect, showDistanceRings, showUserLocation, isTracking, onMapClick, editMode, hotelFlyTrigger = 0, onRefetchLocations, userLocations = [], currentSessionId, showOwnMarker = false }: MapProps) {
  console.log('MapComponent render, showUserLocation:', showUserLocation, 'isTracking:', isTracking)
  console.log('userLocations:', userLocations)
  console.log('currentSessionId:', currentSessionId)

  const currentUser = userLocations.find(user => user.session_id === currentSessionId)
  const currentUserEmoji = currentUser?.emoji || null

  console.log('currentUser:', currentUser)
  console.log('currentUserEmoji:', currentUserEmoji)

  useEffect(() => {
    const handleEmojiChange = () => {
      console.log('Emoji changed in Map, refreshing locations...')
      onRefetchLocations?.()
    }

    window.addEventListener('emojiChanged', handleEmojiChange)
    return () => window.removeEventListener('emojiChanged', handleEmojiChange)
  }, [onRefetchLocations])

  return (
    <MapContainer
      center={HOTEL_COORDS}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <MapController center={HOTEL_COORDS} zoom={15} />
      <HotelFlyController trigger={hotelFlyTrigger} />
      <ZoomControl position="bottomright" />

      {showUserLocation && <UserLocationMarker isTracking={!!isTracking} userEmoji={currentUserEmoji} />}

      {userLocations
        .filter(user => showOwnMarker || user.session_id !== currentSessionId)
        .map(user => (
          <OtherUserMarker key={user.session_id} user={user} currentSessionId={currentSessionId ?? null} />
        ))}

      {onMapClick && (
        <MapClickHandler onClick={onMapClick} enabled={!!editMode} />
      )}

      {showDistanceRings && (
        <>
          <Circle center={HOTEL_COORDS} radius={300} pathOptions={{ color: '#666', weight: 1, fillOpacity: 0.1 }} />
          <Circle center={HOTEL_COORDS} radius={600} pathOptions={{ color: '#666', weight: 1, fillOpacity: 0.1 }} />
          <Circle center={HOTEL_COORDS} radius={900} pathOptions={{ color: '#666', weight: 1, fillOpacity: 0.1 }} />
          <Circle center={HOTEL_COORDS} radius={1200} pathOptions={{ color: '#666', weight: 1, fillOpacity: 0.1 }} />
          <Circle center={HOTEL_COORDS} radius={1500} pathOptions={{ color: '#666', weight: 1, fillOpacity: 0.1 }} />
        </>
      )}

      {locations.map(location => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={createCustomIcon(
            location.category_color,
            location.author_emoji || location.backup_emoji || null,
            location.is_active_user === 1,
            location.backup_emoji || null
          )}
          eventHandlers={{
            click: () => onLocationSelect(location)
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-body)', minWidth: '200px' }}>
              <strong style={{ color: location.category_color }}>{location.name}</strong><br />
              {location.meta && <small>{location.meta}</small>}
              {location.rating && (
                <div style={{ marginTop: '4px' }}>
                  ⭐ {location.rating}
                  {location.price_range && ` · ${location.price_range}`}
                </div>
              )}
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                {location.name !== 'Hotel Niky' && formatDistance(calculateDistance(HOTEL_COORDS[0], HOTEL_COORDS[1], location.lat, location.lng)) + ' vom Hotel'}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      <style>{`
        .user-marker {
          background: transparent;
          border: none;
        }

        .user-marker-content {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .user-marker-content .user-emoji {
          z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .user-marker-content::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50%;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .user-marker-content.tracking .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.3);
          animation: pulse 2s ease-out infinite;
          z-index: 0;
        }

        .user-marker-content.tracking::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(66, 133, 244, 0.5);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite 1s;
          z-index: 0;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .leaflet-bottom {
          bottom: 85px !important;
        }
      `}</style>
    </MapContainer>
  )
}
