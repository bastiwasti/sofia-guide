import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react'
import { welcomeContent } from '../data/welcomeContent'

interface WelcomeOverlayProps {
  onClose: () => void
  onDontShowAgain: () => void
}

export default function WelcomeOverlay({ onClose, onDontShowAgain }: WelcomeOverlayProps) {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [openTabIndex, setOpenTabIndex] = useState<number>(0)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  function handleClose() {
    if (dontShowAgain) {
      onDontShowAgain()
    }
    onClose()
  }

  function handleNextPage() {
    setCurrentPage(2)
  }

  function handlePreviousPage() {
    setCurrentPage(1)
  }

  function handleGetStarted() {
    setDontShowAgain(true)
    handleClose()
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  function toggleTab(index: number) {
    setOpenTabIndex(openTabIndex === index ? -1 : index)
  }

  return (
    <div className="welcome-overlay" onClick={handleOverlayClick}>
      <div className="welcome-overlay-card">
        <button className="welcome-close-button" onClick={handleClose} aria-label="Schließen">
          <X size={24} />
        </button>

        {currentPage === 1 && (
          <div className="welcome-page">
            <h2 className="welcome-title">{welcomeContent.page1.title}</h2>
            <p className="welcome-intro">{welcomeContent.page1.intro}</p>

            <div className="welcome-section">
              <h3 className="welcome-section-title">⚡ {welcomeContent.page1.setupSection.title}</h3>
              <ol className="welcome-steps">
                {welcomeContent.page1.setupSection.steps.map((step, index) => (
                  <li key={index} className="welcome-step">{step}</li>
                ))}
              </ol>
            </div>

            <div className="welcome-section">
              <h3 className="welcome-section-title">🔄 {welcomeContent.page1.roundSection.title}</h3>
              <ol className="welcome-steps">
                {welcomeContent.page1.roundSection.steps.map((step, index) => (
                  <li key={index} className="welcome-step">{step}</li>
                ))}
              </ol>
            </div>

            <p className="welcome-outro">{welcomeContent.page1.outro}</p>

            <div className="welcome-navigation">
              <span className="welcome-page-indicator">Seite 1/2</span>
              <button className="welcome-next-button" onClick={handleNextPage}>
                <span>Weiter</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {currentPage === 2 && (
          <div className="welcome-page">
            <h2 className="welcome-title">{welcomeContent.page2.title}</h2>

            <div className="welcome-tabs-list">
              {welcomeContent.page2.tabs.map((tab, index) => {
                const isOpen = openTabIndex === index
                return (
                  <div key={index} className={`welcome-tab-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="welcome-tab-header"
                      onClick={() => toggleTab(index)}
                      aria-expanded={isOpen}
                    >
                      <span className="welcome-tab-emoji">{tab.emoji}</span>
                      <span className="welcome-tab-label">{tab.label}</span>
                      <ChevronDown
                        size={18}
                        className={`welcome-tab-chevron ${isOpen ? 'rotated' : ''}`}
                      />
                    </button>
                    <div className={`welcome-tab-body ${isOpen ? 'open' : ''}`}>
                      <p className="welcome-tab-description">{tab.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <label className="welcome-checkbox-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="welcome-checkbox"
              />
              <span className="checkbox-text">{welcomeContent.page2.dontShowLabel}</span>
            </label>

            <button className="welcome-cta-button" onClick={handleGetStarted}>
              {welcomeContent.page2.ctaButton}
            </button>

            <div className="welcome-navigation">
              <button className="welcome-back-button" onClick={handlePreviousPage}>
                <ArrowLeft size={20} />
                <span>Zurück</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .welcome-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          box-sizing: border-box;
        }

        .welcome-overlay-card {
          background: white;
          border-radius: 16px;
          padding: 32px 24px;
          max-width: 420px;
          width: 100%;
          position: relative;
          animation: fadeInUp 0.3s ease-out;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .welcome-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .welcome-close-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #000;
        }

        .welcome-close-button:active {
          transform: scale(0.95);
        }

        .welcome-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .welcome-title {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
          text-align: center;
          background: linear-gradient(135deg, var(--color-plan) 0%, #00796B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-intro {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          text-align: center;
          margin: 0;
          white-space: pre-line;
          line-height: 1.5;
        }

        .welcome-section {
          background: rgba(0, 150, 136, 0.05);
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid var(--color-plan);
        }

        .welcome-section-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          color: var(--color-plan);
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .welcome-steps {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text);
          margin: 0;
          padding-left: 20px;
          line-height: 1.8;
        }

        .welcome-step {
          margin-bottom: 8px;
        }

        .welcome-step:last-child {
          margin-bottom: 0;
        }

        .welcome-outro {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-text);
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }

        /* Accordion */
        .welcome-tabs-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .welcome-tab-item {
          border: 1.5px solid rgba(0, 150, 136, 0.15);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .welcome-tab-item.open {
          border-color: rgba(0, 150, 136, 0.4);
        }

        .welcome-tab-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }

        .welcome-tab-header:hover {
          background: rgba(0, 150, 136, 0.05);
        }

        .welcome-tab-item.open .welcome-tab-header {
          background: rgba(0, 150, 136, 0.06);
        }

        .welcome-tab-emoji {
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
        }

        .welcome-tab-label {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          flex: 1;
        }

        .welcome-tab-chevron {
          color: var(--color-gray-dark);
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .welcome-tab-chevron.rotated {
          transform: rotate(180deg);
        }

        .welcome-tab-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .welcome-tab-body.open {
          max-height: 400px;
        }

        .welcome-tab-description {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-gray-dark);
          line-height: 1.6;
          margin: 0;
          padding: 0 14px 14px 48px;
          white-space: pre-line;
        }

        .welcome-checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .welcome-checkbox-label:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .welcome-checkbox {
          width: 24px;
          height: 24px;
          cursor: pointer;
          accent-color: var(--color-plan);
          flex-shrink: 0;
          appearance: auto;
          -webkit-appearance: checkbox;
        }

        .checkbox-text {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text);
        }

        .welcome-cta-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--color-plan) 0%, #00796B 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
        }

        .welcome-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 150, 136, 0.4);
        }

        .welcome-cta-button:active {
          transform: translateY(0);
        }

        .welcome-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
        }

        .welcome-page-indicator {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-gray-medium);
          font-weight: 500;
        }

        .welcome-next-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--color-plan);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .welcome-next-button:hover {
          background: #00796B;
          transform: translateX(2px);
        }

        .welcome-next-button:active {
          transform: translateX(0);
        }

        .welcome-back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          color: var(--color-gray-dark);
          border: 2px solid var(--color-gray-medium);
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .welcome-back-button:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: translateX(-2px);
        }

        .welcome-back-button:active {
          transform: translateX(0);
        }

        @media (max-width: 480px) {
          .welcome-overlay-card {
            padding: 24px 20px;
            max-height: 95vh;
          }

          .welcome-title {
            font-size: 24px;
          }

          .welcome-intro {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  )
}
