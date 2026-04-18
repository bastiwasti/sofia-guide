import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { createCustomIcon, HOTEL_COORDS, calculateDistance, formatDistance } from '../lib/leaflet'
import { Location } from '../hooks/useLocations'
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
  isLoggedIn: boolean
  onRefetchLocations?: () => void
  showAuthorEmojis?: boolean
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

function UserLocationMarker({ isTracking }: { isTracking: boolean }) {
  console.log('UserLocationMarker rendering, isTracking:', isTracking)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const map = useMap()

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
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          fillColor: '#4285F4',
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 1
        }}
      >
        <Popup>
          <div style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Deine Position</strong><br />
            <small>Genauigkeit: {Math.round(accuracy)}m</small>
          </div>
        </Popup>
      </CircleMarker>
    </>
  )
}

export default function MapComponent({ locations, onLocationSelect, showDistanceRings, showUserLocation, isTracking, onMapClick, editMode, hotelFlyTrigger = 0, isLoggedIn, onRefetchLocations }: MapProps) {
  console.log('MapComponent render, showUserLocation:', showUserLocation, 'isTracking:', isTracking)

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

      {showUserLocation && <UserLocationMarker isTracking={!!isTracking} />}

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
            (isLoggedIn || location.is_active_user === 0) && (location.author_emoji || location.backup_emoji) ? (location.author_emoji || location.backup_emoji || undefined) : undefined,
            location.is_active_user === 1,
            location.backup_emoji || undefined
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
    </MapContainer>
  )
}
