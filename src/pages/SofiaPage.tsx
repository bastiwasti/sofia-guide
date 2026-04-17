import { sofiaContent } from '../data/sofiaContent'

export default function SofiaPage() {
  return (
    <div className="sofia-page">
      <div className="hero-section">
        <h1>Sofia</h1>
        <p className="subtitle">Fun Facts & Kulturschocks</p>
      </div>

      <div className="content-section">
        <div className="content-block">
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

        <div className="content-block">
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

        <div className="content-block">
          <h2>🍺 Wie bestelle ich wie ein Einheimischer</h2>
          <div className="ordering-guide">
            {sofiaContent.orderingGuide.tips.map((tip, index) => (
              <div key={index} className="ordering-card">
                <div className="situation">{tip.situation}</div>
                <p className="instruction">{tip.instruction}</p>
                <p className="phonetic">"{tip.phonetic}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="content-block">
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

        .content-section {
          padding: var(--spacing-lg) var(--spacing-md);
          max-width: 600px;
          margin: 0 auto;
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

        .ordering-card .situation {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-gray-medium);
          margin-bottom: var(--spacing-xs);
          letter-spacing: 0.5px;
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
