import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Location } from '../hooks/useLocations'
import { Category } from '../hooks/useCategories'
import { calculateDistance } from '../lib/leaflet'

interface LocationPanelProps {
  selectedCategories: number[]
  locations: Location[]
  categories: Category[]
  onLocationClick: (location: Location) => void
  onClose: () => void
  isClosing?: boolean
  showHeader?: boolean
}

const HOTEL_COORDS = { lat: 42.6953, lng: 23.3219 }

export default function LocationPanel({
  selectedCategories,
  locations,
  categories,
  onLocationClick,
  onClose,
  isClosing = false,
  showHeader = true
}: LocationPanelProps) {
  const groupedLocations = useMemo(() => {
    const groups: Record<string, { category: Category; locations: Location[] }> = {}

    selectedCategories.forEach(catId => {
      const category = categories.find(c => c.id === catId)
      if (!category) return

      const catLocations = locations
        .filter(loc => loc.category_id === catId)
        .sort((a, b) => {
          const distA = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, a.lat, a.lng)
          const distB = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, b.lat, b.lng)
          return distA - distB
        })

      if (catLocations.length > 0) {
        groups[category.name] = {
          category,
          locations: catLocations
        }
      }
    })

    return groups
  }, [selectedCategories, locations, categories])

  const totalLocations = Object.values(groupedLocations).reduce((sum, group) => sum + group.locations.length, 0)

  return (
    <div className={`location-panel ${isClosing ? 'closing' : ''}`}>
      {showHeader && (
        <div className="panel-header">
          <div className="panel-title">
            <h3>{Object.keys(groupedLocations).length} Kategorien</h3>
            <p className="total-count">{totalLocations} Locations</p>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="panel-content">
        {Object.entries(groupedLocations).length > 0 ? (
          Object.entries(groupedLocations).map(([categoryName, group]: [string, { category: Category; locations: Location[] }]) => (
            <div key={categoryName} className="category-group">
              <div className="category-header" style={{ color: group.category.color }}>
                <span className="category-name">{categoryName}</span>
                <span className="category-count">{group.locations.length}</span>
              </div>

              <div className="category-locations">
                {group.locations.map(location => {
                  const distance = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, location.lat, location.lng)
                  return (
                    <div
                      key={location.id}
                      className="location-card"
                      onClick={() => onLocationClick(location)}
                      style={{ borderLeft: `3px solid ${location.category_color}` }}
                    >
                      <div className="location-name">{location.name}</div>
                      <div className="location-meta">{location.meta || 'Keine Beschreibung'}</div>
                      <div className="location-distance">{distance.toFixed(1)} km vom Hotel</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Keine Locations in den ausgewählten Kategorien</p>
          </div>
        )}
      </div>

      <style>{`
        .location-panel {
          position: fixed;
          bottom: 100px;
          right: 16px;
          width: 300px;
          max-height: 500px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideInRight 0.3s ease;
          max-height: calc(100vh - 180px);
        }

        .location-panel.closing {
          animation: slideOutRight 0.3s ease forwards;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-gray-light);
          background: var(--color-white);
          flex-shrink: 0;
        }

        .panel-title h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }

        .total-count {
          font-size: 12px;
          color: var(--color-gray-medium);
          margin: 2px 0 0 0;
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--color-gray-medium);
          padding: 6px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: var(--color-gray-light);
          color: var(--color-text);
        }

        .close-button:active {
          transform: scale(0.95);
        }

        .panel-content {
          overflow-y: auto;
          padding: 8px;
          flex: 1;
          -webkit-overflow-scrolling: touch;
        }

        .panel-content::-webkit-scrollbar {
          width: 4px;
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: var(--color-gray-light);
          border-radius: 2px;
        }

        .category-group {
          margin-bottom: 12px;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--color-gray-light);
          border-radius: 6px;
          margin-bottom: 6px;
          font-weight: 600;
          font-size: 13px;
        }

        .category-name {
          text-transform: capitalize;
        }

        .category-count {
          background: var(--color-white);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .category-locations {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .location-card {
          padding: 10px 12px;
          background: var(--color-white);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .location-card:hover {
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .location-card:active {
          transform: scale(0.98);
        }

        .location-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 4px;
        }

        .location-meta {
          font-size: 12px;
          color: var(--color-gray-dark);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .location-distance {
          font-size: 11px;
          color: var(--color-gray-medium);
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--color-gray-medium);
        }

        .empty-state p {
          font-size: 13px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .location-panel {
            position: fixed;
            top: 60px;
            bottom: 80px;
            right: 0;
            left: auto;
            width: 42%;
            max-width: 280px;
            max-height: calc(100vh - 140px);
            border-radius: 16px 0 0 16px;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          }

          .location-panel.closing {
            animation: slideOutRight 0.3s ease forwards;
          }

          .panel-content {
            padding: 12px;
          }

          .location-card {
            padding: 10px 12px;
          }

          .location-name {
            font-size: 14px;
          }

          .location-meta {
            font-size: 12px;
          }

          .location-distance {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}
