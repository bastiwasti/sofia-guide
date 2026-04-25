import { useState } from 'react'
import { X } from 'lucide-react'
import { Location } from '../hooks/useLocations'
import { calculateDistance, formatDistance, HOTEL_COORDS } from '../lib/leaflet'
import {
  hasBasicInfo,
  hasRestaurantFields,
  hasKneipenFields,
  hasCraftBeerFields,
  hasSightFields,
  hasNightlifeFields
} from './bottomSheet/CategoryHelpers'
import {
  BasicInfoRenderer,
  MetaInfoRenderer,
  RestaurantRenderer,
  KneipenRenderer,
  CraftBeerRenderer,
  SightRenderer,
  NightlifeRenderer
} from './bottomSheet/CategoryRenderers'
import { InfoRow } from './bottomSheet/sharedComponents'
import { bottomSheetStyles } from './bottomSheet/styles'

interface BottomSheetProps {
  location: Location | null
  onClose: () => void
  onDelete?: () => void
  currentSessionId?: string | null
}

export default function BottomSheet({ location, onClose, onDelete, currentSessionId }: BottomSheetProps) {
  if (!location) return null

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    beerMenu: false,
    cocktailsMenu: false,
    foodMenu: false,
    localSpecialties: false,
    vibe: false,
    sightPraktische: false,
    sightHighlights: false,
    nightlifeVibe: false
  })

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const distance = calculateDistance(HOTEL_COORDS[0], HOTEL_COORDS[1], location.lat, location.lng)

  const canDelete =
    (location.category_id === 6 && (location.session_id === null || location.is_active_user === 0)) ||
    (currentSessionId !== null && location.session_id === currentSessionId)

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <button className="close-button" onClick={onClose} aria-label="Schließen">
          <X size={24} />
        </button>

        <div className="bottom-sheet-content">
          <div 
            className="category-badge"
            style={{ backgroundColor: location.category_color }}
          >
            {location.category_name}
          </div>

          <h2 style={{ color: location.category_color }}>{location.name}</h2>

          {location.meta && <MetaInfoRenderer location={location} />}

          {location.description && (
            <p className="location-description">{location.description}</p>
          )}

          {hasBasicInfo(location) && (
            <BasicInfoRenderer 
              location={location} 
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {location.category_id === 1 && hasKneipenFields(location) && (
            <KneipenRenderer
              location={location}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {location.category_id === 2 && hasRestaurantFields(location) && (
            <RestaurantRenderer
              location={location}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {location.category_id === 3 && hasNightlifeFields(location) && (
            <NightlifeRenderer
              location={location}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {location.category_id === 4 && hasSightFields(location) && (
            <SightRenderer
              location={location}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              distance={distance}
            />
          )}

          {location.category_id === 5 && hasCraftBeerFields(location) && (
            <CraftBeerRenderer
              location={location}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {location.category_id !== 4 && (
            <>
              <InfoRow label="Entfernung:" value={formatDistance(distance) + ' vom Hotel'} />
              {location.rating && <InfoRow label="Bewertung:" value={'⭐ ' + location.rating} />}
              {location.price_range && <InfoRow label="Preis:" value={location.price_range} />}
            </>
          )}

          {onDelete && canDelete && (
            <button className="delete-button" onClick={onDelete}>
              Location löschen
            </button>
          )}
        </div>
      </div>
      
      <style>{bottomSheetStyles}</style>
    </div>
  )
}
