import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import { createCustomIcon, createCategoryIcon, HOTEL_COORDS, calculateDistance, formatDistance } from '../lib/leaflet'
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
  flyToTarget?: { lat: number; lng: number; token: number } | null
  userLocations: UserLocation[]
  currentSessionId: string | null
  showOwnMarker?: boolean
  onRefetchLocations?: () => void
  onMapReady?: (map: L.Map) => void
}

function MapController({ center, zoom, onMapReady }: { center: [number, number]; zoom: number; onMapReady?: (map: L.Map) => void }) {
  const map = useMap()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      map.setView(center, zoom)
      initialized.current = true
    }
    onMapReady?.(map)
  }, [center, zoom, map, onMapReady])

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

function FlyToLocationController({ target }: { target: { lat: number; lng: number; token: number } | null | undefined }) {
  const map = useMap()
  const prevToken = useRef<number | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (map && !mapReady) {
      setMapReady(true)
    }
  }, [map, mapReady])

  useEffect(() => {
    if (!target) return
    if (!mapReady) return
    if (prevToken.current === target.token) return
    prevToken.current = target.token
    map.flyTo([target.lat, target.lng], 17)
  }, [target, map, mapReady])
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

function GPSPositionController({ target }: { target: { lat: number; lng: number; token: number } | null }) {
  const map = useMap()
  const prevToken = useRef<number | null>(null)

  useEffect(() => {
    if (!target) return
    if (prevToken.current === target.token) return
    prevToken.current = target.token
    map.flyTo([target.lat, target.lng], 16)
  }, [target, map])

  return null
}

function UserLocationMarker({ isTracking, userEmoji, onPositionFound }: { isTracking: boolean; userEmoji: string | null; onPositionFound: (pos: { lat: number; lng: number; token: number }) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const positionRef = useRef<[number, number] | null>(null)

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
    if (!navigator.geolocation) {
      alert('Dein Browser unterstützt GPS nicht')
      return
    }

    let watchId: number | null = null

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords
        const newPos: [number, number] = [latitude, longitude]
        positionRef.current = newPos
        setPosition(newPos)
        setAccuracy(acc)
        onPositionFound({ lat: latitude, lng: longitude, token: Date.now() })
      },
      (error) => {
        alert('GPS nicht verfügbar: ' + error.message + '\nCode: ' + error.code)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy: acc } = pos.coords
          const newPos: [number, number] = [latitude, longitude]
          const prev = positionRef.current
          positionRef.current = newPos
          setPosition(newPos)
          setAccuracy(acc)
          if (prev) {
            const distance = calculateDistance(prev[0], prev[1], latitude, longitude)
            if (distance > 50) {
              onPositionFound({ lat: latitude, lng: longitude, token: Date.now() })
            }
          }
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isTracking, onPositionFound])

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

export default function MapComponent({ locations, onLocationSelect, showDistanceRings, showUserLocation, isTracking, onMapClick, editMode, hotelFlyTrigger = 0, flyToTarget, onRefetchLocations, userLocations = [], currentSessionId, showOwnMarker = false, onMapReady }: MapProps) {
  const [flyToGPS, setFlyToGPS] = useState<{ lat: number; lng: number; token: number } | null>(null)

  const handleGpsPositionFound = useCallback((pos: { lat: number; lng: number; token: number }) => {
    setFlyToGPS(pos)
  }, [])

  const currentUser = userLocations.find(user => user.session_id === currentSessionId)
  const currentUserEmoji = currentUser?.emoji || null

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

      <MapController center={HOTEL_COORDS} zoom={15} onMapReady={onMapReady} />
      <HotelFlyController trigger={hotelFlyTrigger} />
      <FlyToLocationController target={flyToTarget} />
      <GPSPositionController target={flyToGPS} />

      {showUserLocation && <UserLocationMarker isTracking={!!isTracking} userEmoji={currentUserEmoji} onPositionFound={handleGpsPositionFound} />}

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
          icon={location.category_id >= 1 && location.category_id <= 10
            ? createCategoryIcon(location.category_id, location.category_color)
            : createCustomIcon(
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
      `}</style>
    </MapContainer>
  )
}
