import { Map, Home, BookOpen, Info, MessageSquare, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserSession, useUserSessions } from '../hooks/useUserSessions'
import { ALL_EMOJIS } from '../data/emojis'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [session, setSession] = useState<UserSession | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [activeTabState, setActiveTabState] = useState<Tab>(activeTab)
  
  const [pickerMode, setPickerMode] = useState<'select-new' | 'recover-code' | 'recover-list' | 'switch' | 'none'>('none')
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [currentRecoveryCode, setCurrentRecoveryCode] = useState('')
  const [switchPassword, setSwitchPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { sessions, refetch, createSession, reclaimSession, deleteSession, updateSessionEmoji } = useUserSessions()

  useEffect(() => {
    const saved = localStorage.getItem('userSession')
    if (saved) {
      try {
        setSession(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved session:', e)
        localStorage.removeItem('userSession')
      }
    }
  }, [])

  useEffect(() => {
    setActiveTabState(activeTab)
  }, [activeTab])

  useEffect(() => {
    if (!showEmojiPicker) {
      setPickerMode('none')
      setSelectedEmoji(null)
      setRecoveryCode('')
      setCurrentRecoveryCode('')
      setSwitchPassword('')
      setError(null)
    }
  }, [showEmojiPicker])

  function handleSave(newSession: UserSession | null) {
    setSession(newSession)
    if (newSession) {
      localStorage.setItem('userSession', JSON.stringify(newSession))
    } else {
      localStorage.removeItem('userSession')
    }
  }

  const takenEmojis = sessions.map(s => s.emoji)
  const isLoggedIn = !!session

  const sessionsWithCode = validateCode(recoveryCode)
    ? sessions.filter(s => s.recovery_code.toUpperCase() === recoveryCode.toUpperCase())
    : []

  function validateCode(code: string): boolean {
    return /^[A-Za-z0-9]{4}$/.test(code)
  }

  async function handleCreateNew() {
    if (!selectedEmoji || !validateCode(recoveryCode)) return

    setIsSaving(true)
    setError(null)

    try {
      const newSession = await createSession(selectedEmoji, recoveryCode.toUpperCase())
      handleSave(newSession)
      setShowEmojiPicker(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && err.error === 'Emoji already taken') {
        setError('Emoji bereits vergeben')
        refetch()
      } else {
        setError('Fehler beim Erstellen')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRecoverFromCode() {
    if (!selectedEmoji || !validateCode(recoveryCode)) return

    setIsSaving(true)
    setError(null)

    try {
      const recoveredSession = await reclaimSession(selectedEmoji, recoveryCode.toUpperCase())
      handleSave(recoveredSession)
      setShowEmojiPicker(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && err.error === 'Invalid recovery code') {
        setError('Falscher Recovery-Code')
      } else {
        setError('Fehler beim Wiederherstellen')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRecoverFromList() {
    if (!selectedEmoji || !validateCode(recoveryCode)) return

    setIsSaving(true)
    setError(null)

    try {
      const recoveredSession = await reclaimSession(selectedEmoji, recoveryCode.toUpperCase())
      handleSave(recoveredSession)
      setShowEmojiPicker(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && err.error === 'Invalid recovery code') {
        setError('Falscher Recovery-Code')
      } else {
        setError('Fehler beim Wiederherstellen')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSwitch() {
    if (!selectedEmoji || !validateCode(currentRecoveryCode)) return

    setIsSaving(true)
    setError(null)

    try {
      if (currentRecoveryCode.toUpperCase() !== session?.recovery_code.toUpperCase()) {
        throw new Error('Falscher aktueller Recovery-Code')
      }

      if (switchPassword !== '24031986') {
        throw new Error('Falsches Passwort')
      }

      const updatedSession = await updateSessionEmoji(session.session_id, selectedEmoji, session.recovery_code)
      handleSave(updatedSession)
      setShowEmojiPicker(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Fehler beim Wechseln')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogout() {
    if (!session) return

    const password = prompt(
      `Smiley ${session.emoji} wirklich aufgeben?\n\n` +
      `Dein Recovery-Code wird gelöscht, der Smiley wird wieder frei und kann von jemand anderem gepickt werden. Das lässt sich nicht rückgängig machen.\n\n` +
      `Passwort zum Bestätigen (Bastis Geburtstag):`
    )
    if (password === null) return
    if (password !== '24031986') {
      alert('Falsches Passwort!')
      return
    }

    try {
      await deleteSession(session.session_id)
      handleSave(null)
      setShowEmojiPicker(false)
    } catch (err) {
      alert('Aufgeben fehlgeschlagen')
    }
  }

  const tabs = [
    { id: 'karte', label: 'Karte', icon: Map },
    { id: 'hotel', label: 'Hotel', icon: Home },
    { id: 'survival', label: 'Survival', icon: BookOpen },
    { id: 'sofia', label: 'Sofia', icon: Info },
    { id: 'notizen', label: 'Notizen', icon: MessageSquare }
  ]

  return (
    <nav className={`tab-navigation ${showEmojiPicker ? 'expanded' : ''}`}>
      {tabs.map(tab => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTabState === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id as Tab)}
            aria-label={tab.label}
          >
            <Icon size={24} strokeWidth={activeTabState === tab.id ? 2.5 : 2} />
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}

      {!showEmojiPicker && (
        <button
          className={`emoji-button ${session ? 'has-session' : ''}`}
          onClick={() => setShowEmojiPicker(true)}
          aria-label={session ? 'Dein Emoji' : 'Emoji wählen'}
        >
          <span className="emoji-icon">{session?.emoji || '👤'}</span>
          <span className="tab-label">Smiley</span>
        </button>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker-content">
          <button
            className="close-picker-button"
            onClick={() => setShowEmojiPicker(false)}
            aria-label="Schließen"
          >
            <X size={20} />
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!isLoggedIn ? (
            <div className="picker-content">
              <div className="picker-tabs">
                <button
                  className={`picker-tab ${pickerMode === 'select-new' ? 'active' : ''}`}
                  onClick={() => { setPickerMode('select-new'); setError(null) }}
                >
                  Neuen Smiley nehmen
                </button>
                <button
                  className={`picker-tab ${pickerMode === 'recover-code' ? 'active' : ''}`}
                  onClick={() => { setPickerMode('recover-code'); setError(null) }}
                >
                  Mit Code wiederherstellen
                </button>
                <button
                  className={`picker-tab ${pickerMode === 'recover-list' ? 'active' : ''}`}
                  onClick={() => { setPickerMode('recover-list'); setError(null) }}
                >
                  Aus Liste wiederherstellen
                </button>
              </div>

              {pickerMode === 'select-new' && (
                <div className="picker-mode">
                  <div className="instruction-text">
                    Wähle einen Smiley und definiere einen 4-stelligen Recovery-Code.
                  </div>
                  <div className="emoji-grid">
                    {ALL_EMOJIS.filter(emoji => !takenEmojis.includes(emoji)).map(emoji => (
                      <button
                        key={emoji}
                        className={`emoji-tile ${selectedEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => { setSelectedEmoji(emoji); setError(null) }}
                      >
                        <span className="emoji-char">{emoji}</span>
                      </button>
                    ))}
                  </div>
                  <div className="code-input-group">
                    <label>Recovery-Code</label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="A7X2"
                      maxLength={4}
                      className={validateCode(recoveryCode) ? 'valid' : ''}
                    />
                  </div>
                  <button
                    className="action-button"
                    onClick={handleCreateNew}
                    disabled={!selectedEmoji || !validateCode(recoveryCode) || isSaving}
                  >
                    {isSaving ? 'Speichere...' : `${selectedEmoji || ''} speichern`}
                  </button>
                </div>
              )}

              {pickerMode === 'recover-code' && (
                <div className="picker-mode">
                  <div className="instruction-text">
                    Gib deinen Recovery-Code ein, um deinen Smiley zu finden.
                  </div>
                  <div className="code-input-group">
                    <label>Recovery-Code</label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="A7X2"
                      maxLength={4}
                      className={validateCode(recoveryCode) ? 'valid' : ''}
                    />
                  </div>
                  {validateCode(recoveryCode) && sessionsWithCode.length > 0 ? (
                    <div className="matched-emojis">
                      <div className="instruction-text">
                        {sessionsWithCode.length === 1
                          ? 'Ein Smiley mit diesem Code gefunden:'
                          : `${sessionsWithCode.length} Smilies mit diesem Code gefunden. Wähle deinen:`}
                      </div>
                      <div className="emoji-grid compact">
                        {sessionsWithCode.map(s => (
                          <button
                            key={s.emoji}
                            className={`emoji-tile ${selectedEmoji === s.emoji ? 'selected' : ''}`}
                            onClick={() => { setSelectedEmoji(s.emoji); setError(null) }}
                          >
                            <span className="emoji-char">{s.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="instruction-text">
                      Gib einen 4-stelligen Code ein, um deinen Smiley zu finden.
                    </div>
                  )}
                  <button
                    className="action-button"
                    onClick={handleRecoverFromCode}
                    disabled={!selectedEmoji || !validateCode(recoveryCode) || isSaving}
                  >
                    {isSaving ? 'Wiederherstelle...' : 'Wiederherstellen'}
                  </button>
                </div>
              )}

              {pickerMode === 'recover-list' && (
                <div className="picker-mode">
                  <div className="instruction-text">
                    Wähle deinen Smiley aus der Liste und gib deinen Recovery-Code ein.
                  </div>
                  <div className="emoji-grid compact">
                    {sessions.map(s => (
                      <button
                        key={s.emoji}
                        className={`emoji-tile ${selectedEmoji === s.emoji ? 'selected' : ''}`}
                        onClick={() => { setSelectedEmoji(s.emoji); setError(null) }}
                      >
                        <span className="emoji-char">{s.emoji}</span>
                      </button>
                    ))}
                  </div>
                  <div className="code-input-group">
                    <label>Recovery-Code</label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="A7X2"
                      maxLength={4}
                      className={validateCode(recoveryCode) ? 'valid' : ''}
                    />
                  </div>
                  <button
                    className="action-button"
                    onClick={handleRecoverFromList}
                    disabled={!selectedEmoji || !validateCode(recoveryCode) || isSaving}
                  >
                    {isSaving ? 'Wiederherstelle...' : 'Wiederherstellen'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="picker-content">
              <div className="session-info">
                <div className="current-emoji-display">
                  <span className="emoji-char">{session?.emoji}</span>
                </div>
                <div className="session-details">
                  <p><strong>Dein Smiley:</strong> {session?.emoji}</p>
                  <p><strong>Recovery-Code:</strong> {session?.recovery_code}</p>
                  <p><strong>Erstellt am:</strong> {session?.created_at ? new Date(session.created_at).toLocaleDateString('de-DE') : ''}</p>
                </div>
              </div>

              <div className="picker-actions">
                <button
                  className="action-button secondary"
                  onClick={() => { setError(null); setPickerMode('switch') }}
                >
                  Smiley wechseln
                </button>
                <button
                  className="action-button danger"
                  onClick={handleLogout}
                >
                  Smiley aufgeben
                  <LogOut size={16} />
                </button>
              </div>

              {pickerMode === 'switch' && (
                <div className="picker-mode">
                  <div className="instruction-text">
                    Wähle einen neuen Smiley und bestätige mit deinem aktuellen Recovery-Code.
                  </div>
                  <div className="current-emoji-display">
                    Aktuell: <span className="emoji-char">{session?.emoji}</span>
                  </div>
                  <div className="emoji-grid">
                    {ALL_EMOJIS.filter(emoji => !takenEmojis.includes(emoji)).map(emoji => (
                      <button
                        key={emoji}
                        className={`emoji-tile ${selectedEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => { setSelectedEmoji(emoji); setError(null) }}
                      >
                        <span className="emoji-char">{emoji}</span>
                      </button>
                    ))}
                  </div>
                  <div className="code-input-group">
                    <label>Aktueller Recovery-Code</label>
                    <input
                      type="text"
                      value={currentRecoveryCode}
                      onChange={(e) => setCurrentRecoveryCode(e.target.value.toUpperCase())}
                      placeholder={session?.recovery_code || '••••'}
                      maxLength={4}
                      className={validateCode(currentRecoveryCode) && currentRecoveryCode.toUpperCase() === session?.recovery_code.toUpperCase() ? 'valid' : ''}
                    />
                  </div>
                  <div className="code-input-group">
                    <label>Passwort (Bastis Geburtstag)</label>
                    <input
                      type="password"
                      value={switchPassword}
                      onChange={(e) => setSwitchPassword(e.target.value)}
                      placeholder="ddmmyyyy"
                      className={switchPassword.length > 0 ? 'valid' : ''}
                    />
                  </div>
                  <button
                    className="action-button"
                    onClick={handleSwitch}
                    disabled={!selectedEmoji || !validateCode(currentRecoveryCode) || !switchPassword || isSaving}
                  >
                    {isSaving ? 'Wechsle...' : 'Wechseln'}
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => setPickerMode('none')}
                  >
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .tab-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: var(--color-white);
          border-top: 1px solid var(--color-gray-light);
          padding: var(--spacing-sm) 0;
          padding-bottom: max(var(--spacing-sm), env(safe-area-inset-bottom));
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
          z-index: 3000;
          transition: height 0.3s ease;
          height: 56px;
          flex-direction: column;
          overflow: hidden;
        }
        
        .tab-navigation.expanded {
          height: 60vh;
          justify-content: flex-start;
          padding: 0;
        }
        
        .tab-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: transparent;
          color: var(--color-gray-medium);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .tab-button:active {
          transform: scale(0.95);
        }
        
        .tab-button.active {
          color: var(--color-text);
        }
        
        .emoji-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: transparent;
          color: var(--color-gray-medium);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .emoji-button:active {
          transform: scale(0.95);
        }
        
        .emoji-button.has-session {
          color: #8B5CF6;
        }
        
        .emoji-icon {
          font-size: 24px;
          line-height: 1;
        }
        
        .tab-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .emoji-picker-content {
          flex: 1;
          width: 100%;
          height: 100%;
          background: var(--color-white);
          padding: var(--spacing-lg);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .close-picker-button {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--color-gray-light);
          border: none;
          color: var(--color-gray-dark);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .close-picker-button:hover {
          background: var(--color-gray-medium);
        }
        
        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          margin-bottom: var(--spacing-md);
          font-size: 14px;
          text-align: center;
        }
        
        .picker-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          height: 100%;
        }
        
        .picker-tabs {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-light);
          padding-bottom: var(--spacing-sm);
        }
        
        .picker-tab {
          flex: 1;
          padding: var(--spacing-sm);
          background: transparent;
          border: none;
          color: var(--color-gray-medium);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .picker-tab:hover {
          color: var(--color-text);
        }
        
        .picker-tab.active {
          color: #8B5CF6;
          border-bottom: 2px solid #8B5CF6;
        }
        
        .picker-mode {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          overflow-y: auto;
        }
        
        .instruction-text {
          font-size: 14px;
          color: var(--color-gray-dark);
          line-height: 1.5;
          text-align: center;
          padding: var(--spacing-sm);
          background: var(--color-gray-light);
          border-radius: var(--border-radius-sm);
        }
        
        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
          gap: 8px;
          padding: var(--spacing-sm);
          background: var(--color-gray-light);
          border-radius: var(--border-radius-md);
          max-height: 40vh;
          overflow-y: auto;
        }
        
        .emoji-grid.compact {
          max-height: 30vh;
        }
        
        .emoji-tile {
          position: relative;
          background: var(--color-white);
          border: 2px solid transparent;
          border-radius: var(--border-radius-sm);
          padding: 10px 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          aspect-ratio: 1;
        }
        
        .emoji-tile:hover {
          transform: scale(1.1);
          background: #f0f7ff;
        }
        
        .emoji-tile.selected {
          border-color: #8B5CF6;
          background: #ede9fe;
          transform: scale(1.05);
        }
        
        .emoji-tile .emoji-char {
          font-size: 28px;
          line-height: 1;
        }
        
        .code-input-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .code-input-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-gray-medium);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .code-input-group input {
          padding: var(--spacing-md);
          font-size: 24px;
          font-weight: 600;
          border: 2px solid var(--color-gray-light);
          border-radius: var(--border-radius-sm);
          text-align: center;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        
        .code-input-group input:focus {
          outline: 2px solid #8B5CF6;
          border-color: transparent;
        }
        
        .code-input-group input.valid {
          border-color: #4CAF50;
        }
        
        .action-button {
          padding: 14px var(--spacing-xl);
          background: #8B5CF6;
          color: white;
          border: none;
          border-radius: var(--border-radius-md);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: var(--spacing-sm);
        }
        
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .action-button:disabled:hover {
          transform: none;
        }
        
        .action-button:hover:not(:disabled) {
          background: #7C3AED;
          transform: translateY(-2px);
        }
        
        .action-button.secondary {
          background: transparent;
          color: var(--color-gray-dark);
          border: 2px solid var(--color-gray-light);
        }
        
        .action-button.secondary:hover {
          background: var(--color-gray-light);
          transform: none;
        }
        
        .action-button.danger {
          background: #c62828;
        }
        
        .action-button.danger:hover {
          background: #b71c1c;
        }
        
        .session-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--color-gray-light);
          border-radius: var(--border-radius-md);
        }
        
        .current-emoji-display {
          text-align: center;
          font-size: 80px;
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--border-radius-lg);
        }
        
        .session-details {
          background: var(--color-white);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-md);
        }
        
        .session-details p {
          margin: var(--spacing-sm) 0;
          font-size: 15px;
          color: var(--color-text);
          line-height: 1.6;
        }
        
        .session-details strong {
          color: var(--color-gray-medium);
          font-size: 13px;
          display: block;
          margin-bottom: 4px;
        }
        
        .picker-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
    </nav>
  )
}
