import { useState, useMemo, useEffect } from 'react'
import { Layers, Edit, MapPin, Navigation, Building2 } from 'lucide-react'
import { useLocations } from '../hooks/useLocations'
import { useCategories } from '../hooks/useCategories'
import { UserSession } from '../hooks/useUserSessions'
import MapComponent from '../components/Map'
import FilterBar from '../components/FilterBar'
import BottomSheet from '../components/BottomSheet'
import LocationForm from '../components/LocationForm'
import CategoryForm from '../components/CategoryForm'

export default function MapPage() {
  const { locations, loading, createLocation, deleteLocation, refetch: refetchLocations } = useLocations()
  const { categories, createCategory, refetch: refetchCategories } = useCategories()
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showDistanceRings, setShowDistanceRings] = useState(true)
  const [gpsMode, setGpsMode] = useState<'off' | 'static' | 'tracking'>('off')
  const [editMode, setEditMode] = useState(false)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | undefined>()
  const [hotelFlyTrigger, setHotelFlyTrigger] = useState(0)
  const [userSession, setUserSession] = useState<UserSession | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('userSession')
    if (saved) {
      try {
        setUserSession(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved session:', e)
      }
    }
  }, [])

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
    setGpsMode(prev => {
      switch (prev) {
        case 'off':
          return 'static'
        case 'static':
          return 'tracking'
        case 'tracking':
          return 'off'
        default:
          return 'off'
      }
    })
  }

  async function handleCreateLocation(location: any) {
    try {
      const locationWithSession = {
        ...location,
        session_id: userSession?.session_id || null
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
    const password = prompt("Passwort zum Löschen eingeben ( Basti's Geburtstag ):")
    if (password !== '24031986') {
      alert('Falsches Passwort!')
      return
    }
    try {
      await deleteLocation(id)
      await refetchLocations()
      setSelectedLocation(null)
    } catch (error) {
      console.error('Failed to delete location:', error)
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

    if (!userSession) {
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
      <div className="map-header">
        <div>
          <h1>Karte</h1>
          <p>{filteredLocations.length} Locations</p>
        </div>
        <div className="header-actions">
          <button
            className="toggle-button"
            onClick={() => setHotelFlyTrigger(t => t + 1)}
            aria-label="Zum Hotel"
          >
            <Building2 size={16} />
            <span>Hotel</span>
          </button>
          <button
            className={`toggle-button ${showDistanceRings ? 'active' : ''}`}
            onClick={() => setShowDistanceRings(!showDistanceRings)}
            aria-label="Entfernungsringe umschalten"
          >
            <Layers size={16} />
            <span>Ringe</span>
          </button>
          <button
            className={`toggle-button ${gpsMode !== 'off' ? 'active' : ''}`}
            onClick={toggleGpsMode}
            aria-label="GPS umschalten"
            title={gpsMode === 'off' ? 'GPS aktivieren' : gpsMode === 'static' ? 'Live-Tracking starten' : 'Live-Tracking stoppen'}
          >
            {gpsMode === 'tracking' ? <Navigation size={16} className="animate-spin" /> : <MapPin size={16} />}
            <span>{gpsMode === 'off' ? 'GPS' : gpsMode === 'static' ? 'Follow' : 'Off'}</span>
          </button>
          <button
            className={`edit-button ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
            aria-label="Edit-Modus umschalten"
          >
            <Edit size={16} />
            <span>Neu</span>
          </button>
        </div>
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
          showUserLocation={gpsMode !== 'off'}
          isTracking={gpsMode === 'tracking'}
          hotelFlyTrigger={hotelFlyTrigger}
          onMapClick={handleMapClick}
          editMode={editMode}
          onDeleteLocation={handleDeleteLocation}
          isLoggedIn={!!userSession}
          onRefetchLocations={refetchLocations}
          showAuthorEmojis={true}
        />
      </div>

      <BottomSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onDelete={editMode ? () => selectedLocation && handleDeleteLocation(selectedLocation.id) : undefined}
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

      <style>{`
        .map-page {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-md);
          background: var(--color-white);
        }

        .map-header h1 {
          margin: 0;
          font-size: 24px;
        }

        .map-header p {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: var(--color-gray-medium);
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: var(--color-gray-light);
          border: none;
          border-radius: var(--border-radius-sm);
          font-size: 11px;
          font-weight: 600;
          color: var(--color-gray-dark);
          transition: all 0.2s ease;
        }

        .toggle-button.active {
          background: var(--color-craft);
          color: white;
        }

        .toggle-button:active {
          transform: scale(0.95);
        }

        .header-actions {
          display: flex;
          gap: 6px;
        }

        .edit-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: var(--color-gray-light);
          border: none;
          border-radius: var(--border-radius-sm);
          font-size: 11px;
          font-weight: 600;
          color: var(--color-gray-dark);
          transition: all 0.2s ease;
        }

        .edit-button.active {
          background: var(--color-sights);
          color: white;
        }

        .edit-button:active {
          transform: scale(0.95);
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
        .map-container .leaflet-bottom {
          bottom: 70px;
        }

        @media (max-width: 390px) {
          .toggle-button,
          .edit-button {
            padding: 5px 6px;
            font-size: 10px;
            gap: 3px;
          }

          .header-actions {
            gap: 4px;
          }

          .toggle-button span,
          .edit-button span {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
