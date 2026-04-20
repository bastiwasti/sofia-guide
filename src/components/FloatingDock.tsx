import { Layers, Edit, MapPin, Navigation, Building2 } from 'lucide-react'

interface FloatingDockProps {
  showDistanceRings: boolean
  onToggleRings: () => void
  gpsMode: 'off' | 'static' | 'tracking'
  onToggleGps: () => void
  editMode: boolean
  onToggleEdit: () => void
  onFlyToHotel: () => void
}

export default function FloatingDock({
  showDistanceRings,
  onToggleRings,
  gpsMode,
  onToggleGps,
  editMode,
  onToggleEdit,
  onFlyToHotel
}: FloatingDockProps) {
  return (
    <div className="floating-dock">
      <button
        className={`dock-button ${gpsMode !== 'off' ? 'active' : ''}`}
        onClick={onToggleGps}
        aria-label="GPS umschalten"
        title={gpsMode === 'off' ? 'GPS aktivieren' : gpsMode === 'static' ? 'Live-Tracking starten' : 'Live-Tracking stoppen'}
      >
        {gpsMode === 'tracking' ? <Navigation size={20} className="animate-spin" /> : <MapPin size={20} />}
        <span className="dock-label">{gpsMode === 'off' ? 'GPS' : gpsMode === 'static' ? 'Follow' : 'Off'}</span>
      </button>

      <button
        className={`dock-button ${editMode ? 'active' : ''}`}
        onClick={onToggleEdit}
        aria-label="Edit-Modus umschalten"
      >
        <Edit size={20} />
        <span className="dock-label">Neu</span>
      </button>

      <button
        className="dock-button"
        onClick={onFlyToHotel}
        aria-label="Zum Hotel"
      >
        <Building2 size={20} />
        <span className="dock-label">Hotel</span>
      </button>

      <button
        className={`dock-button ${showDistanceRings ? 'active' : ''}`}
        onClick={onToggleRings}
        aria-label="Entfernungsringe umschalten"
      >
        <Layers size={20} />
        <span className="dock-label">Ringe</span>
      </button>

      <style>{`
        .floating-dock {
          position: fixed;
          bottom: 85px;
          left: 16px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .dock-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-gray-light);
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-gray-dark);
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
          min-width: 80px;
        }

        .dock-button:active {
          transform: scale(0.95);
        }

        .dock-button.active {
          background: var(--color-craft);
          color: white;
        }

        .dock-button.active:hover {
          background: #0d4a8a;
        }

        .dock-button:hover:not(.active) {
          background: #d4d4d4;
        }

        .dock-label {
          font-size: 11px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
