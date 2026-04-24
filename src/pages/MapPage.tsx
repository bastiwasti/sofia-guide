import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useLocations, Location } from '../hooks/useLocations'
import { useCategories, Category } from '../hooks/useCategories'
import { UserSession } from '../hooks/useUserSessions'
import { useUserLocations } from '../hooks/useUserLocations'
import MapComponent from '../components/Map'
import FilterBar from '../components/FilterBar'
import BottomSheet from '../components/BottomSheet'
import LocationForm from '../components/LocationForm'
import CategoryForm from '../components/CategoryForm'
import FloatingDock from '../components/FloatingDock'
import LocationPanel from '../components/LocationPanel'

export interface MapFocusRequest {
  locationId?: number | null
  lat?: number | null
  lng?: number | null
  token?: number
}

interface MapPageProps {
  session: UserSession | null
  focusRequest?: MapFocusRequest | null
  onFocusConsumed?: () => void
}

export default function MapPage({ session, focusRequest, onFocusConsumed }: MapPageProps) {
  const { locations, loading, createLocation, deleteLocation, refetch: refetchLocations } = useLocations()
  const { categories, createCategory, refetch: refetchCategories } = useCategories()
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showDistanceRings, setShowDistanceRings] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | undefined>()
  const [hotelFlyTrigger, setHotelFlyTrigger] = useState(0)
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; token: number } | null>(null)
  const [showLocationPanel, setShowLocationPanel] = useState(false)
  const [isPanelClosing, setIsPanelClosing] = useState(false)
  const [showPanelHeader, setShowPanelHeader] = useState(true)
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(() => {
    const saved = localStorage.getItem('sofia-map-header-minimized')
    return saved === 'true'
  })
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!focusRequest) return
    const token = focusRequest.token ?? Date.now()
    const match: Location | undefined = focusRequest.locationId != null
      ? locations.find(l => l.id === focusRequest.locationId)
      : undefined

    if (match) {
      setSelectedLocation(match)
      setFlyTo({ lat: match.lat, lng: match.lng, token })
      onFocusConsumed?.()
      return
    }

    if (focusRequest.lat != null && focusRequest.lng != null) {
      setFlyTo({ lat: focusRequest.lat, lng: focusRequest.lng, token })
      // BottomSheet braucht das volle Location-Objekt — wenn locations noch nicht geladen sind,
      // warten wir auf den nächsten Lauf des Effects, behalten den Request aber drin.
      if (focusRequest.locationId != null && locations.length === 0) return
      onFocusConsumed?.()
      return
    }

    // Kein lat/lng: nur weiterleben wenn locations noch laden, sonst aufgeben
    if (locations.length > 0) onFocusConsumed?.()
  }, [focusRequest, locations, onFocusConsumed])

  const { userLocations, toggleGpsMode: toggleLocationSharing, gpsMode: sharedGpsMode } = useUserLocations(
    session?.session_id || null,
    session?.emoji || null
  )

  useEffect(() => {
    localStorage.setItem('sofia-map-header-minimized', String(isHeaderMinimized))
  }, [isHeaderMinimized])

  useEffect(() => {
    if (selectedCategories.length > 0 && !showLocationPanel) {
      setShowLocationPanel(true)
      setIsPanelClosing(false)
      setShowPanelHeader(true)
    }
  }, [selectedCategories.length, showLocationPanel])

  const filteredLocations = useMemo(() => {
    if (selectedCategories.length === 0) return locations
    return locations.filter(loc =>
      selectedCategories.includes(loc.category_id) || loc.category_id === 5 || loc.category_id === 6
    )
  }, [locations, selectedCategories])

  function toggleCategory(categoryId: number) {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  function toggleGpsMode() {
    toggleLocationSharing()
  }

  function handleLocationPanelClick(location: Location) {
    setFlyTo({ lat: location.lat, lng: location.lng, token: Date.now() })
    setSelectedLocation(location)
  }

  function handleLocationPanelClose() {
    if (isPanelClosing) return
    setIsPanelClosing(true)
    setSelectedCategories([])
    setTimeout(() => {
      setShowLocationPanel(false)
      setIsPanelClosing(false)
    }, 300)
  }

  function handleZoomIn() {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  function handleZoomOut() {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  function handleMapReady(map: any) {
    mapRef.current = map
  }

  async function handleCreateLocation(location: any) {
    try {
      const locationWithSession = {
        ...location,
        session_id: session?.session_id || null
      }
      await createLocation(locationWithSession)
      await refetchLocations()
      setShowLocationForm(false)
      setNewLocationCoords(undefined)
    } catch (error) {
      console.error('Failed to create location:', error)
    }
  }

  async function handleDeleteLocation(id: number) {
    const location = locations.find(l => l.id === id)

    let password = undefined

    if (location) {
      if (session && location.session_id === session.session_id) {
        // User can delete their own locations
      } else if (location.category_id === 6 && (location.session_id === null || location.is_active_user === 0)) {
        password = prompt("Passwort zum Löschen eingeben (Basti's Geburtsdatum):")
        if (password !== '24031986') {
          alert('Falsches Passwort!')
          return
        }
      } else {
        password = prompt("Passwort zum Löschen eingeben (Basti's Geburtsdatum):")
        if (password !== '24031986') {
          alert('Falsches Passwort!')
          return
        }
      }
    }

    try {
      await deleteLocation(id, session?.session_id || null, password)
      await refetchLocations()
      setSelectedLocation(null)
    } catch (error) {
      console.error('Failed to delete location:', error)
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Fehler beim Löschen: ${error.message}`)
      } else {
        alert('Fehler beim Löschen der Location')
      }
    }
  }

  async function handleCreateCategory(category: any) {
    try {
      await createCategory(category)
      await refetchCategories()
      setShowCategoryForm(false)
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  function handleMapClick(e: any) {
    if (!editMode) return

    if (!session) {
      alert('Bitte logge dich zuerst ein, um Locations zu erstellen!')
      return
    }

    const { lat, lng } = e.latlng
    setNewLocationCoords({ lat, lng })
    setShowLocationForm(true)
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Karte</h1>
          <p>Lade Locations...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <style>{`
          .page {
            min-height: 100%;
            padding: var(--spacing-md);
          }
          .page-header {
            margin-bottom: var(--spacing-md);
          }
          .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-gray-light);
            border-top-color: var(--color-craft);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

   return (
    <div className="map-page">
      <div className={`hero-section ${isHeaderMinimized ? 'minimized' : ''}`}>
        <button className="header-toggle" onClick={() => setIsHeaderMinimized(!isHeaderMinimized)} aria-label="Header ausblenden">
          {isHeaderMinimized ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
        </button>
        <h1>Karte</h1>
        <p className="subtitle">Entdecke Sofias Locations ({filteredLocations.length} Locations)</p>
      </div>

      {editMode && (
        <div className="edit-mode-bar">
          <div className="edit-instructions">
            <span>📍 Tippe auf die Karte, um eine neue Location hinzuzufügen</span>
          </div>
        </div>
      )}

      <FilterBar
        categories={categories.filter(cat => cat.id !== 5)}
        selectedCategories={selectedCategories}
        onCategoryToggle={toggleCategory}
      />

      <div className="map-container">
        <MapComponent
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          showDistanceRings={showDistanceRings}
          showUserLocation={sharedGpsMode !== 'off'}
          isTracking={sharedGpsMode === 'tracking'}
          hotelFlyTrigger={hotelFlyTrigger}
          flyToTarget={flyTo}
          onMapClick={handleMapClick}
          editMode={editMode}
          onDeleteLocation={handleDeleteLocation}
          onRefetchLocations={refetchLocations}
          userLocations={userLocations}
          currentSessionId={session?.session_id || null}
          showOwnMarker={true}
          onMapReady={handleMapReady}
        />

        <FloatingDock
          showDistanceRings={showDistanceRings}
          onToggleRings={() => setShowDistanceRings(!showDistanceRings)}
          gpsMode={sharedGpsMode}
          onToggleGps={toggleGpsMode}
          editMode={editMode}
          onToggleEdit={() => setEditMode(!editMode)}
          onFlyToHotel={() => setHotelFlyTrigger(t => t + 1)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>

      <BottomSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onDelete={() => selectedLocation && handleDeleteLocation(selectedLocation.id)}
        currentSessionId={session?.session_id || null}
      />

      {showLocationForm && (
        <LocationForm
          initialCoords={newLocationCoords}
          onSave={handleCreateLocation}
          onCancel={() => {
            setShowLocationForm(false)
            setNewLocationCoords(undefined)
          }}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onSave={handleCreateCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {showLocationPanel && (
        <LocationPanel
          selectedCategories={selectedCategories}
          locations={locations}
          categories={categories}
          onLocationClick={handleLocationPanelClick}
          onClose={handleLocationPanelClose}
          isClosing={isPanelClosing}
          showHeader={showPanelHeader}
          onHideHeader={() => setShowPanelHeader(false)}
        />
      )}

      <style>{`
        .map-page {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-map) 0%, #2E550D 100%);
          color: white;
          padding: var(--spacing-xl) var(--spacing-md);
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .header-toggle {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .header-toggle:active {
          transform: scale(0.95);
        }

        .hero-section.minimized {
          padding: var(--spacing-sm) var(--spacing-md);
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-section.minimized h1 {
          font-size: 16px;
          margin: 0;
        }

        .hero-section.minimized .subtitle {
          display: none;
        }

        .hero-section.minimized .header-toggle {
          bottom: 4px;
          left: 4px;
          width: 28px;
          height: 28px;
        }

        .edit-mode-bar {
          background: #fff8e1;
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .edit-instructions {
          font-size: 12px;
          color: var(--color-gray-dark);
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--color-craft);
          color: white;
          border: none;
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .action-button:active {
          transform: scale(0.95);
        }

        .map-container {
          flex: 1;
          position: relative;
        }
      `}</style>
    </div>
  )
}
