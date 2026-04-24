import { useState } from 'react'
import { survivalContent } from '../data/survivalContent'
import { X, Volume2, Play, Pause } from 'lucide-react'

export default function SurvivalPage() {
  const [selectedLetter, setSelectedLetter] = useState<{ cyrillic: string; latin?: string; pronunciation: string; example: string } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingText, setPlayingText] = useState<string | null>(null)

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

  const extractBulgarianWord = (example: string) => {
    if (!example) return ''
    const match = example.match(/^([А-Яа-яЪЬ\s]+)=/)
    return match ? match[1].trim() : example.split('=')[0].trim()
  }

  const tocItems = [
    { id: 'phrases', label: 'Bulg. Phrasen' },
    { id: 'alphabet', label: 'Kyr. Alphabet' },
    { id: 'prices', label: 'Preise' },
    { id: 'transport', label: 'Transport' },
    { id: 'emergency', label: 'Notfall' },
    { id: 'culture', label: 'Kultur' }
  ]

  return (
    <div className="survival-page">
      <div className="hero-section">
        <h1>Survival Guide</h1>
        <p className="subtitle">Alles was du wissen musst</p>
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
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="content-section">
        <div className="schafkopf-box">
          <h2>{survivalContent.schafkopfTracker.title}</h2>
          <p>{survivalContent.schafkopfTracker.description}</p>
          <a
            href={survivalContent.schafkopfTracker.link}
            target="_blank"
            rel="noopener noreferrer"
            className="schafkopf-link"
          >
            {survivalContent.schafkopfTracker.linkText}
          </a>
        </div>

        <div className="warning-box">
          <h2>{survivalContent.headShakeWarning.title}</h2>
          <p>{survivalContent.headShakeWarning.description}</p>
          <p className="tip">💡 {survivalContent.headShakeWarning.tip}</p>
        </div>

        <div className="content-block" id="phrases">
          <h2>🗣️ Bulgarische Phrasen</h2>
          <div className="phrases-table">
            <div className="table-header">
              <span>Bulgarisch</span>
              <span>Aussprache</span>
              <span>Deutsch</span>
              <span></span>
            </div>
            {survivalContent.phrases.map((phrase, index) => (
              <div key={index} className="table-row">
                <span className="bulgarian">{phrase.bulgarian}</span>
                <span className="phonetic">{phrase.phonetic}</span>
                <span className="german">{phrase.german}</span>
                <button
                  className="phrase-audio-button"
                  onClick={() => speakText(phrase.bulgarian)}
                  aria-label={`${phrase.bulgarian} anhören`}
                >
                  {isPlaying && playingText === phrase.bulgarian ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="content-block" id="alphabet">
          <h2>🔤 Kyrillisches Alphabet</h2>
          <p className="alphabet-description">{survivalContent.cyrillicAlphabet.description}</p>
          <div className="alphabet-grid">
            {survivalContent.cyrillicAlphabet.letters.map((letter, index) => (
              <button
                key={index}
                className="letter-button"
                onClick={() => setSelectedLetter(letter)}
                aria-label={`${letter.cyrillic} - ${letter.latin || 'keine Umschrift'}`}
              >
                <span className="cyrillic">{letter.cyrillic}</span>
                <span className="latin">{letter.latin || '–'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="content-block" id="prices">
          <h2>💰 Preisübersicht</h2>
          <div className="prices-grid">
            {survivalContent.prices.items.map((item, index) => (
              <div key={index} className="price-card">
                <span className="item">{item.item}</span>
                <span className="range">{item.range}</span>
                <span className="context">{item.context}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-block" id="transport">
          <h2>🚗 Fortbewegung</h2>
          <div className="transport-options">
            {survivalContent.transport.options.map((option, index) => (
              <div key={index} className="transport-card">
                <h3>{option.name}</h3>
                <p className="description">{option.description}</p>
                <div className="pros">
                  {option.pros.map((pro, i) => (
                    <span key={i} className="pro-tag">✓ {pro}</span>
                  ))}
                </div>
                {option.tip && <p className="tip">💡 {option.tip}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="content-block" id="emergency">
          <h2>🚨 Notfallnummern</h2>
          <div className="emergency-numbers">
            {survivalContent.emergencies.numbers.map((item, index) => (
              <div key={index} className="emergency-card">
                <span className="number">{item.number}</span>
                <span className="description">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-block" id="culture">
          <h2>🎭 Kulturtipps</h2>
          <ul className="tips-list">
            {survivalContent.culturalTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {selectedLetter && (
        <div className="letter-modal-overlay" onClick={() => setSelectedLetter(null)}>
          <div className="letter-modal" onClick={e => e.stopPropagation()}>
            <div className="letter-modal-header">
              <div className="letter-modal-letters">
                <span className="modal-cyrillic">{selectedLetter.cyrillic}</span>
                {selectedLetter.latin && (
                  <>
                    <span className="modal-separator">→</span>
                    <span className="modal-latin">{selectedLetter.latin}</span>
                  </>
                )}
              </div>
              <button className="modal-close" onClick={() => setSelectedLetter(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="letter-modal-body">
              <div className="pronunciation-section">
                <h3><Volume2 size={18} /> Aussprache</h3>
                <p>{selectedLetter.pronunciation}</p>
              </div>
              {selectedLetter.example && (
                <div className="example-section">
                  <div className="example-header">
                    <h3>Beispiel</h3>
                    <button
                      className="play-button"
                      onClick={() => speakText(extractBulgarianWord(selectedLetter.example))}
                      aria-label="Beispiel anhören"
                    >
                      {isPlaying && playingText === extractBulgarianWord(selectedLetter.example) ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                  <p className="example-text">{selectedLetter.example}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .survival-page {
          min-height: 100%;
          background: var(--color-cream);
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-craft) 0%, #145090 100%);
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

        .warning-box {
          background: #fff3e0;
          border-left: 4px solid #ff6b35;
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .warning-box h2 {
          font-size: 18px;
          color: #ff6b35;
          margin-bottom: var(--spacing-sm);
        }

        .warning-box p {
          font-size: 14px;
          margin-bottom: var(--spacing-sm);
        }

        .warning-box .tip {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .schafkopf-box {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border-left: 4px solid #2e7d32;
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }

        .schafkopf-box h2 {
          font-size: 20px;
          color: #2e7d32;
          margin-bottom: var(--spacing-sm);
        }

        .schafkopf-box p {
          font-size: 14px;
          color: var(--color-gray-dark);
          margin-bottom: var(--spacing-sm);
        }

        .schafkopf-link {
          display: inline-block;
          background: var(--color-craft);
          color: white;
          text-decoration: none;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .schafkopf-link:hover {
          background: #145090;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .schafkopf-link:active {
          transform: translateY(0);
        }

        .content-block {
          margin-bottom: var(--spacing-xl);
        }

        .content-block h2 {
          font-size: 22px;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid var(--color-craft);
        }

        .phrases-table {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .table-header {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 40px;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-gray-light);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 40px;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-light);
          font-size: 13px;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row .bulgarian {
          font-weight: 600;
          color: var(--color-craft);
        }

        .table-row .phonetic {
          color: var(--color-gray-dark);
          font-style: italic;
        }

        .prices-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
        }

        .price-card {
          background: var(--color-white);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius-sm);
          box-shadow: var(--shadow-sm);
        }

        .price-card .item {
          display: block;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .price-card .range {
          display: block;
          color: var(--color-craft);
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .price-card .context {
          display: block;
          font-size: 11px;
          color: var(--color-gray-medium);
        }

        .transport-options {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .transport-card {
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
        }

        .transport-card h3 {
          font-size: 16px;
          margin-bottom: var(--spacing-xs);
          color: var(--color-craft);
        }

        .transport-card .description {
          font-size: 14px;
          color: var(--color-gray-dark);
          margin-bottom: var(--spacing-sm);
        }

        .transport-card .pros {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: var(--spacing-sm);
        }

        .pro-tag {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }

        .transport-card .tip {
          background: #fff8e1;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          margin: 0;
          font-size: 12px !important;
        }

        .emergency-numbers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
        }

        .emergency-card {
          background: #ffebee;
          padding: var(--spacing-md);
          border-radius: var(--border-radius-sm);
          text-align: center;
        }

        .emergency-card .number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #c62828;
          margin-bottom: 4px;
        }

        .emergency-card .description {
          font-size: 12px;
          color: var(--color-gray-dark);
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
          border-left: 3px solid var(--color-craft);
          font-size: 14px;
          line-height: 1.5;
        }

        .alphabet-description {
          font-size: 13px;
          color: var(--color-gray-dark);
          margin-bottom: var(--spacing-md);
          font-style: italic;
        }

        .alphabet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 8px;
        }

        .letter-button {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: var(--border-radius-sm);
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .letter-button:hover {
          border-color: var(--color-craft);
          background: #f0f7ff;
          transform: scale(1.05);
        }

        .letter-button:active {
          transform: scale(0.95);
        }

        .letter-button .cyrillic {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-craft);
          line-height: 1;
        }

        .letter-button .latin {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-gray-medium);
        }

        .letter-modal-overlay {
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

        .letter-modal {
          background: var(--color-cream);
          border-radius: var(--border-radius-lg);
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .letter-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
          background: var(--color-white);
          border-bottom: 2px solid var(--color-gray-light);
        }

        .letter-modal-letters {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .letter-modal-letters .modal-cyrillic {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-craft);
          line-height: 1;
        }

        .letter-modal-letters .modal-separator {
          font-size: 24px;
          color: var(--color-gray-medium);
        }

        .letter-modal-letters .modal-latin {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-gray-medium);
        }

        .modal-close {
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

        .modal-close:hover {
          background: var(--color-gray-light);
          color: var(--color-text);
        }

        .letter-modal-body {
          padding: var(--spacing-lg);
          overflow-y: auto;
        }

        .letter-modal-body h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-gray-medium);
          margin-bottom: var(--spacing-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .letter-modal-body h3 svg {
          color: var(--color-craft);
        }

        .pronunciation-section {
          margin-bottom: var(--spacing-lg);
        }

        .pronunciation-section p {
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-text);
          margin: 0;
        }

        .example-section h3 {
          margin-bottom: var(--spacing-sm);
        }

        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .play-button {
          background: var(--color-craft);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .play-button:hover {
          background: #145090;
          transform: scale(1.05);
        }

        .play-button:active {
          transform: scale(0.95);
        }

        .play-button:disabled {
          background: var(--color-gray-medium);
          cursor: not-allowed;
        }

        .example-section .example-text {
          background: var(--color-gray-light);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          font-size: 15px;
          font-style: italic;
          color: var(--color-text);
          margin: 0;
        }

        .phrase-audio-button {
          background: var(--color-craft);
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
        }

        .phrase-audio-button:hover {
          background: #145090;
          transform: scale(1.05);
        }

        .phrase-audio-button:active {
          transform: scale(0.95);
        }

        .phrase-audio-button:disabled {
          background: var(--color-gray-medium);
          cursor: not-allowed;
        }

        .sticky-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--color-white);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: var(--spacing-sm) var(--spacing-md);
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: var(--color-craft);
          color: white;
        }

        .nav-item:active {
          transform: scale(0.95);
        }

        #phrases,
        #alphabet,
        #prices,
        #transport,
        #emergency,
        #culture {
          scroll-margin-top: 60px;
        }
      `}</style>
    </div>
  )
}
