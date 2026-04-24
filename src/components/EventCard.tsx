import { ExternalLink, MapPin } from 'lucide-react'
import { EventOccurrence } from '../hooks/useEvents'
import { EVENT_TYPE_LABEL, EVENT_TYPE_EMOJI, EventType } from '../lib/weekend'

interface EventCardProps {
  event: EventOccurrence
  onVenueTap?: (event: EventOccurrence) => void
}

export default function EventCard({ event, onVenueTap }: EventCardProps) {
  const type = event.event_type as EventType
  const emoji = event.emoji || EVENT_TYPE_EMOJI[type]
  const label = EVENT_TYPE_LABEL[type]
  const color = event.location_category_color || '#6A4C93'
  const hasVenueOnMap = event.location_id != null && event.location_name

  const timeText = formatTime(event.start_time, event.end_time)

  function handleVenueClick() {
    if (event.location_id != null && onVenueTap) {
      onVenueTap(event)
    }
  }

  return (
    <div
      className={`event-card ${hasVenueOnMap ? 'has-venue' : 'no-venue'}`}
      style={hasVenueOnMap ? { borderLeftColor: color } : undefined}
    >
      <div className="event-head">
        <span className="event-pill" style={hasVenueOnMap ? { background: color } : undefined}>
          <span className="event-emoji">{emoji}</span>
          <span className="event-type">{label}</span>
        </span>
        {timeText && <span className="event-time">{timeText}</span>}
      </div>

      <div className="event-title">{event.title}</div>

      {event.description && <div className="event-description">{event.description}</div>}

      <div className="event-footer">
        {hasVenueOnMap ? (
          <button
            type="button"
            className="venue-chip"
            onClick={handleVenueClick}
            style={{ color, borderColor: color }}
          >
            <span className="venue-dot" style={{ background: color }} />
            <MapPin size={12} />
            <span className="venue-name">{event.location_name}</span>
          </button>
        ) : event.venue_name ? (
          <span className="venue-text">
            <MapPin size={12} />
            {event.venue_name}
          </span>
        ) : null}

        {event.price && <span className="event-price">{event.price}</span>}

        {event.external_url && (
          <a
            href={event.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="event-link"
            aria-label="Externe Seite öffnen"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <style>{`
        .event-card {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          padding: 12px 14px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-left: 4px solid transparent;
        }
        .event-card.no-venue {
          border-left-color: transparent;
          opacity: 0.92;
        }
        .event-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .event-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #6A4C93;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .event-emoji {
          font-size: 13px;
        }
        .event-time {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .event-title {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
          color: var(--color-text);
        }
        .event-description {
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-gray-dark);
        }
        .event-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }
        .venue-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid;
          border-radius: 999px;
          padding: 4px 10px 4px 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .venue-chip:active {
          transform: scale(0.97);
        }
        .venue-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .venue-name {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .venue-text {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--color-gray-dark);
        }
        .event-price {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-gray-medium);
          margin-left: auto;
        }
        .event-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-gray-medium);
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}

function formatTime(start: string | null, end: string | null): string {
  if (!start) return ''
  if (!end) return start
  return `${start}–${end}`
}
