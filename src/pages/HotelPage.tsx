import { useState } from 'react'
import { hotelContent } from '../data/hotelContent'
import { Search, X, AlertCircle } from 'lucide-react'

export default function HotelPage() {
  const [showInsignificanceModal, setShowInsignificanceModal] = useState(false)

  return (
    <div className="hotel-page">
      <div className="hero-section">
        <h1>Hotel Niky</h1>
        <p className="subtitle">Dein Zuhause in Sofia</p>
      </div>

      <div className="content-section">
        <div className="info-card">
          <h3>📍 Adresse</h3>
          <p>{hotelContent.address}</p>
          <p className="phone">📞 {hotelContent.phone}</p>
        </div>

        <div className="info-card">
          <h3>🕐 Check-in / Check-out</h3>
          <p><strong>Ein:</strong> {hotelContent.checkIn}</p>
          <p><strong>Aus:</strong> {hotelContent.checkOut}</p>
        </div>

        <div className="content-block">
          <h2>Über das Hotel</h2>
          <div className="text-content" dangerouslySetInnerHTML={{ __html: hotelContent.history }} />
        </div>

        <div className="insignificance-box" onClick={() => setShowInsignificanceModal(true)}>
          <div className="insignificance-header">
            <AlertCircle size={24} className="icon" />
            <div>
              <h3>{hotelContent.insignificanceResearch.title}</h3>
              <p className="summary">{hotelContent.insignificanceResearch.summary}</p>
            </div>
            <Search size={20} className="arrow" />
          </div>
          <p className="tap-hint">👆 Tippe hier für die vollständige Recherche</p>
        </div>

        <div className="content-block">
          <h2>Anreise</h2>
          
          <div className="arrival-option">
            <h3>{hotelContent.arrival.fromAirport.title}</h3>
            <p><strong>Metro:</strong> {hotelContent.arrival.fromAirport.metro}</p>
            <p><strong>Bolt:</strong> {hotelContent.arrival.fromAirport.bolt}</p>
            <p className="tip">💡 {hotelContent.arrival.fromAirport.tip}</p>
          </div>

          <div className="arrival-option">
            <h3>{hotelContent.arrival.metro.title}</h3>
            <p><strong>Station:</strong> {hotelContent.arrival.metro.station}</p>
            <p><strong>Fußweg:</strong> {hotelContent.arrival.metro.walkingTime}</p>
            <p className="directions">{hotelContent.arrival.metro.directions}</p>
          </div>
        </div>

        <div className="content-block">
          <h2>In der Umgebung</h2>
          <div className="surroundings-list">
            {hotelContent.surroundings.items.map((item, index) => (
              <div key={index} className="surrounding-item">
                <span className="name">{item.name}</span>
                <span className="distance">{item.distance}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-block">
          <h2>Tipps von den Locals</h2>
          <ul className="tips-list">
            {hotelContent.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {showInsignificanceModal && (
        <div className="modal-overlay" onClick={() => setShowInsignificanceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-left">
                <Search size={28} />
                <h2>{hotelContent.insignificanceResearch.title}</h2>
              </div>
              <button className="close-button" onClick={() => setShowInsignificanceModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="research-content" dangerouslySetInnerHTML={{ __html: hotelContent.insignificanceResearch.fullInvestigation }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hotel-page {
          min-height: 100%;
          background: var(--color-cream);
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-hotel) 0%, #d49930 100%);
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

        .content-section {
          padding: var(--spacing-lg) var(--spacing-md);
          max-width: 600px;
          margin: 0 auto;
        }

        .info-card {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          box-shadow: var(--shadow-sm);
        }

        .info-card h3 {
          font-size: 14px;
          color: var(--color-gray-medium);
          margin-bottom: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-card p {
          margin: 4px 0;
          font-size: 15px;
        }

        .phone {
          color: var(--color-craft);
          font-weight: 600;
        }

        .content-block {
          margin-bottom: var(--spacing-xl);
        }

        .content-block h2 {
          font-size: 22px;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid var(--color-hotel);
        }

        .text-content {
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text);
        }

        .text-content :global(strong) {
          color: var(--color-hotel);
          font-weight: 600;
        }

        .arrival-option {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          box-shadow: var(--shadow-sm);
        }

        .arrival-option h3 {
          font-size: 16px;
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
        }

        .arrival-option p {
          font-size: 14px;
          margin: 6px 0;
        }

        .tip {
          background: #fff8e1;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          margin-top: var(--spacing-sm);
          font-size: 13px !important;
        }

        .directions {
          color: var(--color-gray-dark);
          font-style: italic;
          font-size: 13px !important;
        }

        .surroundings-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .surrounding-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-white);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius-sm);
        }

        .surrounding-item .name {
          font-weight: 500;
        }

        .surrounding-item .distance {
          font-size: 13px;
          color: var(--color-gray-medium);
          background: var(--color-gray-light);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
        }

        .tips-list li {
          background: var(--color-white);
          padding: var(--spacing-sm) var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          border-left: 3px solid var(--color-hotel);
          font-size: 14px;
          line-height: 1.5;
        }

        .insignificance-box {
          background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
          border: 2px dashed var(--color-gray-medium);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin: var(--spacing-xl) 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .insignificance-box:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
        }

        .insignificance-box:active {
          transform: translateY(0);
        }

        .insignificance-header {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .insignificance-header .icon {
          color: var(--color-gray-dark);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .insignificance-header h3 {
          font-size: 16px;
          margin: 0 0 4px 0;
          color: var(--color-text);
        }

        .insignificance-header .summary {
          font-size: 13px;
          color: var(--color-gray-dark);
          margin: 0;
          font-style: italic;
        }

        .insignificance-header .arrow {
          color: var(--color-craft);
          flex-shrink: 0;
        }

        .tap-hint {
          font-size: 12px;
          color: var(--color-gray-medium);
          text-align: center;
          margin: 0;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--color-cream);
          border-radius: var(--border-radius-lg);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--color-white);
          border-bottom: 2px solid var(--color-gray-light);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .header-left svg {
          color: var(--color-craft);
        }

        .modal-header h2 {
          font-size: 18px;
          margin: 0;
          color: var(--color-text);
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--color-gray-medium);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: var(--color-gray-light);
          color: var(--color-text);
        }

        .close-button:active {
          transform: scale(0.95);
        }

        .modal-body {
          padding: var(--spacing-lg);
          overflow-y: auto;
        }

        .research-content {
          font-size: 14px;
          line-height: 1.8;
          color: var(--color-text);
        }

        .research-content h2 {
          font-size: 18px;
          margin-top: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          color: var(--color-hotel);
        }

        .research-content h3 {
          font-size: 16px;
          margin-top: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
        }

        .research-content ul {
          padding-left: var(--spacing-lg);
          margin: var(--spacing-sm) 0;
        }

        .research-content li {
          margin-bottom: var(--spacing-xs);
        }

        .research-content strong {
          color: var(--color-hotel);
          font-weight: 600;
        }

        .research-content em {
          font-style: italic;
          color: var(--color-gray-dark);
        }

        .research-content :global(blockquote) {
          border-left: 4px solid var(--color-craft);
          padding-left: var(--spacing-md);
          margin: var(--spacing-md) 0;
          font-style: italic;
          color: var(--color-gray-dark);
          background: var(--color-gray-light);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius-sm);
        }
      `}</style>
    </div>
  )
}
