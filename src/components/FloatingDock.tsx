import { Layers, Edit, MapPin, Navigation, Building2, Menu, Plus, Minus } from 'lucide-react'

interface FloatingDockProps {
  showDistanceRings: boolean
  onToggleRings: () => void
  gpsMode: 'off' | 'static' | 'tracking'
  onToggleGps: () => void
  editMode: boolean
  onToggleEdit: () => void
  onFlyToHotel: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export default function FloatingDock({
  showDistanceRings,
  onToggleRings,
  gpsMode,
  onToggleGps,
  editMode,
  onToggleEdit,
  onFlyToHotel,
  onZoomIn,
  onZoomOut
}: FloatingDockProps) {
  return (
    <>
      <div className="floating-dock">
        <button className="dock-toggle" onClick={() => {
          const dock = document.querySelector('.floating-dock') as HTMLElement
          if (dock) {
            dock.classList.toggle('menu-collapsed')
          }
        }} aria-label="Menü ein-/ausblenden">
          <Menu size={16} />
        </button>

        <button className="dock-button zoom-button" onClick={onZoomIn} aria-label="Vergrößern">
          <Plus size={16} />
          <span className="dock-label">Zoom +</span>
        </button>

        <button className="dock-button zoom-button" onClick={onZoomOut} aria-label="Verkleinern">
          <Minus size={16} />
          <span className="dock-label">Zoom -</span>
        </button>

        <button className={`dock-button ${gpsMode !== 'off' ? 'active' : ''}`} onClick={onToggleGps} aria-label="GPS umschalten" title={gpsMode === 'off' ? 'GPS aktivieren' : gpsMode === 'static' ? 'Live-Tracking starten' : 'Live-Tracking stoppen'}>
          {gpsMode === 'tracking' ? <Navigation size={16} className="animate-spin" /> : <MapPin size={16} />}
          <span className="dock-label">{gpsMode === 'off' ? 'GPS' : gpsMode === 'static' ? 'Follow' : 'Off'}</span>
        </button>

        <button className={`dock-button ${editMode ? 'active' : ''}`} onClick={onToggleEdit} aria-label="Edit-Modus umschalten">
          <Edit size={16} />
          <span className="dock-label">Neu</span>
        </button>

        <button className="dock-button" onClick={onFlyToHotel} aria-label="Zum Hotel">
          <Building2 size={16} />
          <span className="dock-label">Hotel</span>
        </button>

        <button className={`dock-button ${showDistanceRings ? 'active' : ''}`} onClick={onToggleRings} aria-label="Entfernungsringe umschalten">
          <Layers size={16} />
          <span className="dock-label">Ringe</span>
        </button>
      </div>
    </>
  )
}
