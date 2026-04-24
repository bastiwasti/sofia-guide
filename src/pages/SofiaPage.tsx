import { useMemo, useState, useEffect } from 'react'
import { sofiaContent } from '../data/sofiaContent'
import { Play, Pause } from 'lucide-react'
import { useEvents, EventOccurrence } from '../hooks/useEvents'
import { WEEKEND_DAYS } from '../lib/weekend'
import EventCard from '../components/EventCard'
import { MapFocusRequest } from './MapPage'

interface SofiaPageProps {
  onFocusOnMap?: (req: MapFocusRequest) => void
}

export default function SofiaPage({ onFocusOnMap }: SofiaPageProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingText, setPlayingText] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const { events, loading: eventsLoading } = useEvents()

  const tocItems = [
    { id: 'weekend', label: 'Dieses Wochenende' },
    { id: 'fun-facts', label: 'Fun Facts' },
    { id: 'culture-shocks', label: 'Kulturschocks' },
    { id: 'ordering', label: 'Wie bestelle ich' },
    { id: 'tourist-traps', label: 'Touristenfallen' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eventsByDay = useMemo(() => {
    const byDay: Record<string, EventOccurrence[]> = {}
    for (const day of WEEKEND_DAYS) byDay[day.date] = []
    for (const evt of events) {
      if (byDay[evt.occurrence_date]) byDay[evt.occurrence_date].push(evt)
    }
    return byDay
  }, [events])

  function handleVenueTap(evt: EventOccurrence) {
    if (evt.location_id == null) return
    onFocusOnMap?.({
      locationId: evt.location_id,
      lat: evt.location_lat,
      lng: evt.location_lng,
    })
  }

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      alert('Dein Browser unterstützt keine Sprachausgabe.')
      return
    }

    if (isPlaying && playingText === text) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setPlayingText(null)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'bg-BG'
    utterance.rate = 0.8
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsPlaying(true)
      setPlayingText(text)
    }
    utterance.onend = () => {
      setIsPlaying(false)
      setPlayingText(null)
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      setPlayingText(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="sofia-page">
      <div className="hero-section">
        <h1>Sofia</h1>
      </div>

      <nav className="sticky-nav">
        <div className="nav-items">
          {tocItems.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="nav-item"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(item.id)
                if (element) {
                  const offset = 60
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                  window.scrollTo({
                    top: elementPosition - offset,
                    behavior: 'smooth'
                  })
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="weekend" className="weekend-section">
        <div className="weekend-header">
          <h2>Dieses Wochenende</h2>
          <p className="weekend-sub">15.–17. Mai 2026 in Sofia</p>
        </div>

        {eventsLoading ? (
          <p className="weekend-empty">Lade Events…</p>
        ) : events.length === 0 ? (
          <p className="weekend-empty">Noch keine Events eingetragen.</p>
        ) : (
          <div className="weekend-days">
            {WEEKEND_DAYS.map(day => {
              const dayEvents = eventsByDay[day.date]
              return (
                <div key={day.date} className="day-block">
                  <h3>{day.short}</h3>
                  {dayEvents.length === 0 ? (
                    <p className="day-empty">Nichts eingetragen.</p>
                  ) : (
                    <div className="day-events">
                      {dayEvents.map(evt => (
                        <EventCard
                          key={`${evt.id}-${evt.occurrence_date}`}
                          event={evt}
                          onVenueTap={handleVenueTap}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="content-section">
        <div id="fun-facts" className="content-block">
          <h2>🎉 Fun Facts</h2>
          <div className="facts-list">
            {sofiaContent.funFacts.map((fact, index) => (
              <div key={index} className="fact-card">
                <h3>{fact.title}</h3>
                <p>{fact.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="culture-shocks" className="content-block">
          <h2>🤯 Kulturschocks</h2>
          <div className="shocks-list">
            {sofiaContent.cultureShocks.map((shock, index) => (
              <div key={index} className="shock-card">
                <h3>{shock.title}</h3>
                <p>{shock.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="ordering" className="content-block">
          <h2>🍺 Wie bestelle ich wie ein Einheimischer</h2>
          <div className="ordering-guide">
            {sofiaContent.orderingGuide.tips.map((tip, index) => (
              <div key={index} className="ordering-card">
                <div className="ordering-card-header">
                  <div className="situation">{tip.situation}</div>
                  <button
                    className="audio-button"
                    onClick={() => speakText(tip.phonetic)}
                    aria-label={`${tip.phonetic} anhören`}
                  >
                    {isPlaying && playingText === tip.phonetic ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
                <p className="instruction">{tip.instruction}</p>
                <p className="phonetic">"{tip.phonetic}"</p>
              </div>
            ))}
          </div>
        </div>

        <div id="tourist-traps" className="content-block">
          <h2>⚠️ Touristenfallen</h2>
          <div className="traps-list">
            {sofiaContent.touristTraps.map((trap, index) => (
              <div key={index} className="trap-card">
                <h3>{trap.name}</h3>
                <p>{trap.description}</p>
                <p className="tip">💡 {trap.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .sofia-page {
          min-height: 100%;
          background: var(--color-cream);
        }

        .weekend-section {
          padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
          max-width: 600px;
          margin: 0 auto;
          padding-top: 80px;
        }

        .weekend-header {
          margin-bottom: var(--spacing-md);
        }

        .weekend-section h2 {
          font-size: 22px;
          margin: 0 0 4px 0;
          color: var(--color-text);
          border-bottom: 2px solid #6A4C93;
          padding-bottom: var(--spacing-sm);
        }

        .weekend-sub {
          font-size: 13px;
          color: var(--color-gray-medium);
          margin: 6px 0 0 0;
        }

        .weekend-empty {
          font-size: 14px;
          color: var(--color-gray-medium);
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          text-align: center;
        }

        .weekend-days {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .day-block h3 {
          font-size: 15px;
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-gray-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .day-empty {
          font-size: 12px;
          color: var(--color-gray-medium);
          margin: 0;
          font-style: italic;
        }

        .day-events {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-sights) 0%, #a01245 100%);
          color: white;
          padding: var(--spacing-xl) var(--spacing-md);
          text-align: center;
        }

        .hero-section h1 {
          font-size: 32px;
          margin-bottom: var(--spacing-xs);
          color: white;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.95;
          margin: 0;
        }

        .sticky-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--color-white);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: var(--spacing-sm) var(--spacing-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
        }

        .nav-items {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          max-width: 600px;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .nav-items::-webkit-scrollbar {
          display: none;
        }

        .nav-items {
          scrollbar-width: none;
        }

        .nav-item {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text);
          text-decoration: none;
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .nav-item:hover {
          background: var(--color-sights);
          color: white;
        }

        .nav-item:active {
          transform: scale(0.95);
        }
          opacity: 0.95;
          margin: 0;
        }

        .content-section {
          padding: var(--spacing-lg) var(--spacing-md);
          max-width: 600px;
          margin: 0 auto;
          padding-top: 80px;
        }

        .content-block {
          margin-bottom: var(--spacing-xl);
        }

        .content-block h2 {
          font-size: 22px;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid var(--color-sights);
        }

        .facts-list,
        .shocks-list,
        .traps-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .fact-card,
        .shock-card,
        .trap-card {
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
        }

        .fact-card h3,
        .shock-card h3,
        .trap-card h3 {
          font-size: 16px;
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
        }

        .fact-card h3 {
          color: var(--color-craft);
        }

        .shock-card h3 {
          color: #ff6b35;
        }

        .trap-card h3 {
          color: #c62828;
        }

        .fact-card p,
        .shock-card p,
        .trap-card p {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: var(--spacing-sm);
        }

        .trap-card .tip {
          background: #ffebee;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          margin: 0;
          font-size: 13px !important;
          font-weight: 500;
        }

        .ordering-guide {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .ordering-card {
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          border-left: 4px solid var(--color-sights);
        }

        .ordering-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
        }

        .ordering-card .situation {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-gray-medium);
          letter-spacing: 0.5px;
        }

        .audio-button {
          background: var(--color-sights);
          color: white;
          border: none;
          padding: 6px 8px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .audio-button:hover {
          background: #a01245;
          transform: scale(1.05);
        }

        .audio-button:active {
          transform: scale(0.95);
        }

        .audio-button:disabled {
          background: var(--color-gray-medium);
          cursor: not-allowed;
        }

        .ordering-card .instruction {
          font-size: 14px;
          margin-bottom: var(--spacing-sm);
        }

        .ordering-card .phonetic {
          font-size: 13px;
          color: var(--color-craft);
          font-style: italic;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
