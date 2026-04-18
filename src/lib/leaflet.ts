import L from 'leaflet'

export const HOTEL_COORDS: [number, number] = [42.690656, 23.316578]

export const SOFIA_CENTER: [number, number] = [42.6977, 23.3219]

export function createCustomIcon(color: string, authorEmoji?: string | null, isActiveUser?: boolean, backupEmoji?: string | null): L.DivIcon {
  let displayEmoji: string | null = authorEmoji || null
  let isDeprecated = false

  if (!isActiveUser && backupEmoji) {
    displayEmoji = backupEmoji
    isDeprecated = true
  }

  const emojiBadge = displayEmoji ? `
    <div style="
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 10;
      ${isDeprecated ? `
        opacity: 0.6;
        text-decoration: line-through;
        text-decoration-thickness: 3px;
        text-decoration-color: #c62828;
      ` : ''}
    ">${displayEmoji}</div>
  ` : ''

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
        ${emojiBadge}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}
