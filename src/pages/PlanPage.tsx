import { useState, useEffect } from 'react'
import { Dice5, Play, User, RotateCcw } from 'lucide-react'

interface Player {
  emoji: string
  sessionId: string
  hasBeenChosen: boolean
  timesChosen: number
  isAdmin: boolean
}

interface PlanState {
  players: Player[]
  currentPlayerEmoji: string | null
  nextPlayerEmoji: string | null
  roundNumber: number
  gameStarted: boolean
}

interface PlanPageProps {
  sessions: Array<{ emoji: string; session_id: string; role: 'user' | 'admin' }>
}

export default function PlanPage({ sessions }: PlanPageProps) {
  const [planState, setPlanState] = useState<PlanState>(() => {
    const saved = localStorage.getItem('sofia-plan-state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.gameStarted && (!parsed.currentPlayerEmoji || !parsed.players || parsed.players.length === 0)) {
          console.log('Invalid plan state detected, resetting...')
          localStorage.removeItem('sofia-plan-state')
          return {
            players: [],
            currentPlayerEmoji: null,
            nextPlayerEmoji: null,
            roundNumber: 0,
            gameStarted: false
          }
        }
        return parsed
      } catch (e) {
        console.error('Failed to parse saved plan state:', e)
      }
    }
    return {
      players: [],
      currentPlayerEmoji: null,
      nextPlayerEmoji: null,
      roundNumber: 0,
      gameStarted: false
    }
  })

  const [rulesCollapsed, setRulesCollapsed] = useState(() => {
    const saved = localStorage.getItem('sofia-rules-collapsed')
    return saved === 'true'
  })

  function toggleRules() {
    const newState = !rulesCollapsed
    setRulesCollapsed(newState)
    localStorage.setItem('sofia-rules-collapsed', String(newState))
  }

  const mySession = useState<{ emoji: string; session_id: string; role: 'user' | 'admin' } | null>(() => {
    const saved = localStorage.getItem('userSession')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { emoji: parsed.emoji, session_id: parsed.session_id, role: parsed.role || 'user' }
      } catch (e) {
        return null
      }
    }
    return null
  })[0]

  useEffect(() => {
    const players: Player[] = sessions.map(s => ({
      emoji: s.emoji,
      sessionId: s.session_id,
      hasBeenChosen: planState.players.find(p => p.emoji === s.emoji)?.hasBeenChosen || false,
      timesChosen: planState.players.find(p => p.emoji === s.emoji)?.timesChosen || 0,
      isAdmin: s.role === 'admin'
    }))
    setPlanState(prev => ({ ...prev, players }))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('sofia-plan-state', JSON.stringify(planState))
  }, [planState])

  function chooseRandomPlayer() {
    const availablePlayers = planState.players.filter(p => !p.hasBeenChosen)
    
    if (availablePlayers.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * availablePlayers.length)
    const chosenPlayer = availablePlayers[randomIndex]

    const remainingPlayers = availablePlayers.filter(p => p.emoji !== chosenPlayer.emoji)
    const nextPlayer = remainingPlayers.length > 0 
      ? remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)].emoji
      : null

    setPlanState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.emoji === chosenPlayer.emoji 
          ? { ...p, hasBeenChosen: true, timesChosen: p.timesChosen + 1 }
          : p
      ),
      currentPlayerEmoji: chosenPlayer.emoji,
      nextPlayerEmoji: nextPlayer,
      gameStarted: true,
      roundNumber: Math.floor(prev.players.filter(p => p.timesChosen > 0).length / planState.players.length) + 1
    }))
  }

  function advanceToNext() {
    const currentPlayer = planState.players.find(p => p.emoji === planState.currentPlayerEmoji)
    const isAdmin = mySession?.role === 'admin'
    
    if (!currentPlayer || (currentPlayer.emoji !== mySession?.emoji && !isAdmin)) {
      return
    }

    const availablePlayers = planState.players.filter(p => !p.hasBeenChosen)
    
    if (availablePlayers.length === 0) {
      resetRound()
      return
    }

    const randomIndex = Math.floor(Math.random() * availablePlayers.length)
    const chosenPlayer = availablePlayers[randomIndex]

    const remainingPlayers = availablePlayers.filter(p => p.emoji !== chosenPlayer.emoji)
    const nextPlayer = remainingPlayers.length > 0 
      ? remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)].emoji
      : null

    setPlanState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.emoji === chosenPlayer.emoji 
          ? { ...p, hasBeenChosen: true, timesChosen: p.timesChosen + 1 }
          : p
      ),
      currentPlayerEmoji: chosenPlayer.emoji,
      nextPlayerEmoji: nextPlayer,
      roundNumber: Math.floor(prev.players.filter(p => p.timesChosen > 0).length / planState.players.length) + 1
    }))
  }

  function resetRound() {
    setPlanState(prev => ({
      ...prev,
      players: prev.players.map(p => ({ ...p, hasBeenChosen: false })),
      currentPlayerEmoji: null,
      nextPlayerEmoji: null,
      roundNumber: prev.roundNumber + 1
    }))
  }

  function resetGame() {
    setPlanState({
      players: planState.players.map(p => ({ ...p, hasBeenChosen: false, timesChosen: 0 })),
      currentPlayerEmoji: null,
      nextPlayerEmoji: null,
      roundNumber: 1,
      gameStarted: false
    })
  }

  const allPlayed = planState.players.every(p => p.hasBeenChosen)

  if (sessions.length === 0) {
    return (
      <div className="plan-page">
        <div className="hero-section">
          <h1>Der Plan 🎲</h1>
          <p className="subtitle">Wer bestimmt die nächste Location?</p>
        </div>

        <div className="content-section">
          <div className="plan-container">
            <div className="plan-empty">
              <User size={64} />
              <p>Noch keine Emojis erstellt!</p>
              <p>Bitte zuerst rechts unten im Profil ein Emoji wählen.</p>
            </div>
          </div>
        </div>

        <style>{`
          .plan-page {
            min-height: 100%;
            background: var(--color-cream);
          }

          .hero-section {
            background: linear-gradient(135deg, var(--color-plan) 0%, #00796B 100%);
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
            padding: var(--spacing-lg) var(--spacing-md) 100px var(--spacing-md);
            max-width: 600px;
            margin: 0 auto;
          }

          .plan-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .plan-empty {
            text-align: center;
            padding: var(--spacing-xl);
            color: var(--color-text);
          }

          .plan-empty p {
            font-family: var(--font-body);
            font-size: 1.1rem;
            margin: var(--spacing-sm) 0;
            line-height: 1.6;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="plan-page">
      <div className="hero-section">
        <h1>Der Plan 🎲</h1>
        <p className="subtitle">Wer bestimmt die nächste Location?</p>
      </div>

      <div className="content-section">
        <div className="plan-container">
          <div className="plan-rules">
          <div className="rules-header" onClick={toggleRules}>
            <h2>Die Spielregeln 📋</h2>
            <span className="rules-toggle">{rulesCollapsed ? '▼' : '▲'}</span>
          </div>
          {!rulesCollapsed && (
            <>
              <p className="rules-intro">
                Alle Mitreisenden haben einen Emoji gepickt. Dann geht es los: Immer der Nächste an der Reihe bestimmt die folgende Aktivität oder Location. Dafür kann die App mit Infos genutzt oder selbst recherchiert werden.
              </p>
              <ol>
                <li><strong>Spiel starten:</strong> Nur der Admin (🦧) kann auf "Spiel starten" klicken</li>
                <li><strong>Jeder 1x dran:</strong> Alle kommen einmal drankommen, bevor jemand zweimal dran ist</li>
                <li><strong>Der Aktive entscheidet:</strong> Wer dran ist, bestimmt die nächste Location (mit App-Hilfe oder selbst recherchiert)</li>
                <li><strong>Nächster wählen:</strong> Nur der Aktive darf auf "Nächster wählen" klicken – ausgenommen der Admin</li>
                <li><strong>Vorschau nutzen:</strong> Der nächste Spieler ist schon sichtbar und kann direkt mitdenken!</li>
                <li><strong>Gesunder Menschenverstand:</strong> Nicht mitten in der Nacht 5km laufen, nicht 200€ pro Person ausgeben, wenn alle kaputt sind → Hotel, nicht noch Club</li>
              </ol>
              <p className="rules-outro">
                Das Ziel: Spontanität, Überraschungen, niemand weiß, was als Nächstes kommt. Perfekt für ein Wochenende! 🎉
              </p>
            </>
          )}
        </div>

        {!planState.gameStarted && (
          <button 
            className="plan-big-button" 
            onClick={chooseRandomPlayer}
            disabled={mySession?.role !== 'admin'}
          >
            <Dice5 size={48} />
            <span>Spiel starten</span>
          </button>
        )}

        {planState.gameStarted && planState.currentPlayerEmoji && (
          <div className="plan-current-player">
            <div className="player-emoji-large">{planState.currentPlayerEmoji}</div>
            <h3>Du bist dran! 🎉</h3>
            <p>Bestimme die nächste Location!</p>
            
            {((planState.currentPlayerEmoji === mySession?.emoji) || mySession?.role === 'admin') && !allPlayed && (
              <button className="plan-advance-button" onClick={advanceToNext}>
                <Play size={24} />
                <span>Nächster wählen</span>
              </button>
            )}

            {allPlayed && mySession?.role === 'admin' && (
              <button className="plan-reset-button" onClick={resetRound}>
                <RotateCcw size={24} />
                <span>Neue Runde starten</span>
              </button>
            )}

            {planState.currentPlayerEmoji !== mySession?.emoji && mySession?.role !== 'admin' && !allPlayed && (
              <p className="plan-waiting">Warte bis {planState.currentPlayerEmoji} entschieden hat...</p>
            )}
          </div>
        )}

        {planState.nextPlayerEmoji && !allPlayed && (
          <div className="plan-next-player">
            <h4>Nächster:</h4>
            <div className="next-player-emoji">{planState.nextPlayerEmoji}</div>
            <p>bereite dich vor! 🧠</p>
          </div>
        )}

        {planState.gameStarted && mySession?.role === 'admin' && (
          <button className="plan-reset-game-button" onClick={resetGame}>
            <RotateCcw size={16} />
            <span>Alles zurücksetzen</span>
          </button>
        )}

        <div className="plan-players-grid">
          {planState.players.map(player => (
            <div key={player.sessionId} className={`plan-player-card ${player.emoji === planState.currentPlayerEmoji ? 'current' : ''} ${player.hasBeenChosen ? 'done' : ''} ${player.isAdmin ? 'admin' : ''}`}>
              <span className="player-card-emoji">{player.emoji}</span>
              <span className="player-card-count">{player.timesChosen}x</span>
              {player.emoji === planState.currentPlayerEmoji && <div className="player-card-badge">DRAN</div>}
            </div>
          ))}
        </div>

        {allPlayed && (
          <div className="plan-all-done">
            <h3>🎊 Runde {planState.roundNumber} komplett! 🎊</h3>
            <p>Alle haben einmal dran gehabt.</p>
          </div>
        )}
      </div>
    </div>

      <style>{`
        .plan-page {
          min-height: 100%;
          background: var(--color-cream);
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-plan) 0%, #00796B 100%);
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
          padding: var(--spacing-lg) var(--spacing-md) 100px var(--spacing-md);
          max-width: 600px;
          margin: 0 auto;
        }

        .plan-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .plan-rules {
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          margin-bottom: var(--spacing-lg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rules-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .rules-toggle {
          font-size: 1rem;
          color: var(--color-gray-medium);
          transition: transform 0.2s ease;
        }

        .plan-rules h2 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: var(--color-text);
          margin: 0;
        }

        .plan-rules ol {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-text);
          margin: 0;
          padding-left: var(--spacing-md);
          line-height: 1.6;
        }

        .plan-rules li {
          margin-bottom: var(--spacing-xs);
        }

        .plan-rules li strong {
          color: var(--color-craft);
        }

        .rules-intro {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-text);
          margin: 0 0 var(--spacing-md) 0;
          line-height: 1.6;
        }

        .rules-outro {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-text);
          margin: var(--spacing-md) 0 0 0;
          line-height: 1.6;
          font-weight: 600;
        }

        .plan-big-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          width: 100%;
          padding: var(--spacing-xl);
          background: var(--color-plan);
          color: white;
          border: none;
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 1.3rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 8px rgba(0, 150, 136, 0.3);
        }

        .plan-big-button:disabled {
          background: var(--color-gray-medium);
          cursor: not-allowed;
          opacity: 0.5;
          box-shadow: none;
        }

        .plan-big-button:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: 0 2px 4px rgba(0, 150, 136, 0.2);
        }

        .plan-current-player {
          background: var(--color-white);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-lg);
          margin-bottom: var(--spacing-lg);
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .player-emoji-large {
          font-size: 5rem;
          line-height: 1;
          margin-bottom: var(--spacing-md);
        }

        .plan-current-player h3 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--color-text);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .plan-current-player p {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--color-text);
          margin: 0 0 var(--spacing-md) 0;
        }

        .plan-advance-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          width: 100%;
          padding: var(--spacing-md);
          background: #dc2626;
          color: white;
          border: none;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
        }

        .plan-advance-button:active {
          transform: scale(0.98);
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
        }

        .plan-reset-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          width: 100%;
          padding: var(--spacing-md);
          background: var(--color-sights);
          color: white;
          border: none;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .plan-reset-button:active {
          transform: scale(0.98);
        }

        .plan-waiting {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--color-gray-dark);
          margin: var(--spacing-md) 0 0 0;
          font-style: italic;
        }

        .plan-next-player {
          background: rgba(0, 150, 136, 0.1);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }

        .plan-next-player h4 {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--color-text);
          margin: 0 0 var(--spacing-xs) 0;
          font-weight: 600;
        }

        .next-player-emoji {
          font-size: 3rem;
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .plan-next-player p {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--color-text);
          margin: 0;
        }

        .plan-players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: var(--spacing-sm);
        }

        .plan-player-card {
          position: relative;
          background: var(--color-white);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          text-align: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .plan-player-card.admin {
          border: 3px solid #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .plan-player-card.current {
          border: 3px solid var(--color-plan);
          box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
        }

        .plan-player-card.admin.current {
          border: 3px solid var(--color-plan);
          box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
        }

        .plan-player-card.done {
          opacity: 0.6;
        }

        .player-card-emoji {
          font-size: 2rem;
          line-height: 1;
          display: block;
        }

        .player-card-count {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--color-gray-dark);
          display: block;
          margin-top: var(--spacing-xs);
        }

        .player-card-badge {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-plan);
          color: white;
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .plan-reset-game-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          width: 100%;
          padding: var(--spacing-sm);
          background: transparent;
          color: var(--color-gray-dark);
          border: 2px solid var(--color-gray-medium);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
          margin-bottom: var(--spacing-md);
        }

        .plan-reset-game-button:active {
          transform: scale(0.98);
          background: rgba(0, 0, 0, 0.05);
        }

        .plan-all-done {
          background: var(--color-restaurant);
          color: white;
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-lg);
          text-align: center;
          margin-top: var(--spacing-lg);
        }

        .plan-all-done h3 {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          margin: 0 0 var(--spacing-xs) 0;
        }

        .plan-all-done p {
          font-family: var(--font-body);
          font-size: 1rem;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
