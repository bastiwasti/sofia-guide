import { Layers, Edit, MapPin, Navigation, Building2, Menu } from 'lucide-react'

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
    <>
      <div className="floating-dock">
        <button className="dock-toggle" onClick={() => {
          const dock = document.querySelector('.floating-dock') as HTMLElement
          if (dock) {
            dock.classList.toggle('menu-collapsed')
          }
        }} aria-label="Menü ein-/ausblenden">
          <Menu size={20} />
        </button>

        <button className={`dock-button ${gpsMode !== 'off' ? 'active' : ''}`} onClick={onToggleGps} aria-label="GPS umschalten" title={gpsMode === 'off' ? 'GPS aktivieren' : gpsMode === 'static' ? 'Live-Tracking starten' : 'Live-Tracking stoppen'}>
          {gpsMode === 'tracking' ? <Navigation size={20} className="animate-spin" /> : <MapPin size={20} />}
          <span className="dock-label">{gpsMode === 'off' ? 'GPS' : gpsMode === 'static' ? 'Follow' : 'Off'}</span>
        </button>

        <button className={`dock-button ${editMode ? 'active' : ''}`} onClick={onToggleEdit} aria-label="Edit-Modus umschalten">
          <Edit size={20} />
          <span className="dock-label">Neu</span>
        </button>

        <button className="dock-button" onClick={onFlyToHotel} aria-label="Zum Hotel">
          <Building2 size={20} />
          <span className="dock-label">Hotel</span>
        </button>

        <button className={`dock-button ${showDistanceRings ? 'active' : ''}`} onClick={onToggleRings} aria-label="Entfernungsringe umschalten">
          <Layers size={20} />
          <span className="dock-label">Ringe</span>
        </button>
      </div>
    </>
  )
}
