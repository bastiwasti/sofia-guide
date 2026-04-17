import { X } from 'lucide-react'
import { Location } from '../hooks/useLocations'
import { calculateDistance, formatDistance, HOTEL_COORDS } from '../lib/leaflet'

interface BottomSheetProps {
  location: Location | null
  onClose: () => void
  onDelete?: () => void
}

export default function BottomSheet({ location, onClose, onDelete }: BottomSheetProps) {
  if (!location) return null

  const distance = calculateDistance(HOTEL_COORDS[0], HOTEL_COORDS[1], location.lat, location.lng)

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
          
          {location.meta && <p className="meta">{location.meta}</p>}
          
          <div className="info-row">
            <span className="label">Entfernung:</span>
            <span className="value">{formatDistance(distance)} vom Hotel</span>
          </div>
          
          {location.rating && (
            <div className="info-row">
              <span className="label">Bewertung:</span>
              <span className="value">⭐ {location.rating}</span>
            </div>
          )}
          
          {location.price_range && (
            <div className="info-row">
              <span className="label">Preis:</span>
              <span className="value">{location.price_range}</span>
            </div>
          )}
          
          <div className="coordinates">
            <small>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</small>
          </div>

          {onDelete && (
            <button className="delete-button" onClick={onDelete}>
              Location löschen
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        .bottom-sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: flex;
          align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bottom-sheet {
          width: 100%;
          max-height: 70vh;
          background: var(--color-white);
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
          overflow-y: auto;
          position: relative;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .bottom-sheet-handle {
          width: 40px;
          height: 4px;
          background: var(--color-gray-light);
          border-radius: 2px;
          margin: 12px auto;
        }

        .close-button {
          position: absolute;
          top: 12px;
          right: 16px;
          background: transparent;
          color: var(--color-gray-medium);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .close-button:active {
          background: var(--color-gray-light);
        }

        .bottom-sheet-content {
          padding: 0 var(--spacing-md) calc(var(--spacing-lg) + 80px);
        }

        .category-badge {
          display: inline-block;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--spacing-sm);
        }

        .meta {
          color: var(--color-gray-dark);
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: var(--spacing-md);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--color-gray-light);
        }

        .info-row:last-of-type {
          border-bottom: none;
        }

        .label {
          font-size: 14px;
          color: var(--color-gray-medium);
          font-weight: 500;
        }

        .value {
          font-size: 14px;
          color: var(--color-text);
          font-weight: 600;
        }

        .coordinates {
          text-align: center;
          margin-top: var(--spacing-lg);
          color: var(--color-gray-medium);
          font-size: 12px;
        }

        .delete-button {
          width: 100%;
          padding: 12px;
          margin-top: var(--spacing-md);
          background: #ffebee;
          color: #c62828;
          border: none;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .delete-button:active {
          background: #ffcdd2;
        }
      `}</style>
    </div>
  )
}
