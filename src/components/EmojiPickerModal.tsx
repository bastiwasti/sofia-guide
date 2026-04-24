import { useState, useEffect } from 'react'
import { X, Lock } from 'lucide-react'
import { useUserSessions, UserSession } from '../hooks/useUserSessions'
import { ALL_EMOJIS } from '../data/emojis'

interface EmojiPickerModalProps {
  existingSession: UserSession | null
  onClose: () => void
  onSave: (session: UserSession | null) => void
}

export default function EmojiPickerModal({ existingSession, onClose, onSave }: EmojiPickerModalProps) {
  console.log('EmojiPickerModal mounted')
  const { sessions, loading, refetch, createSession, reclaimSession, deleteSession, updateSessionEmoji } = useUserSessions()
  const [notLoggedInMode, setNotLoggedInMode] = useState<'choose-new' | 'recover'>('choose-new')
  const [loggedInMode, setLoggedInMode] = useState<'profile' | 'switch'>('profile')
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [newRecoveryCode, setNewRecoveryCode] = useState('')
  const [reclaimEmoji, setReclaimEmoji] = useState<string | null>(null)
  const [reclaimCode, setReclaimCode] = useState('')
  const [currentRecoveryCode, setCurrentRecoveryCode] = useState('')
  const [switchPassword, setSwitchPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function resetFormState() {
    setSelectedEmoji(null)
    setNewRecoveryCode('')
    setReclaimEmoji(null)
    setReclaimCode('')
    setCurrentRecoveryCode('')
    setSwitchPassword('')
    setError(null)
  }

  useEffect(() => {
    if (!existingSession) {
      setNotLoggedInMode('choose-new')
    } else {
      setLoggedInMode('profile')
    }
  }, [existingSession])

  const takenEmojis = sessions.map(s => s.emoji)
  const isLoggedIn = !!existingSession

  async function handleLogout() {
    if (!existingSession) return

    const password = prompt(
      `Smiley ${existingSession.emoji} wirklich aufgeben?\n\n` +
      `Dein Recovery-Code wird gelöscht, der Smiley wird wieder frei und kann von jemand anderem gepickt werden. Das lässt sich nicht rückgängig machen.\n\n` +
      `Passwort zum Bestätigen (Bastis Geburtsdatum):`
    )
    if (password === null) return
    if (password !== '24031986') {
      alert('Falsches Passwort!')
      return
    }

    try {
      await deleteSession(existingSession.session_id)

      localStorage.removeItem('userSession')
      onSave(null)

      window.dispatchEvent(new CustomEvent('emojiChanged', { detail: { emoji: existingSession.emoji } }))

      onClose()
    } catch (err) {
      alert('Aufgeben fehlgeschlagen')
    }
  }

  async function handleSwitch() {
    if (!existingSession || !selectedEmoji) return

    setIsSaving(true)
    setError(null)

    try {
      if (currentRecoveryCode.toUpperCase() !== existingSession.recovery_code.toUpperCase()) {
        throw new Error('Falscher aktueller Recovery Code')
      }

      if (switchPassword !== '24031986') {
        throw new Error('Falsches Passwort')
      }

      const updatedSession = await updateSessionEmoji(
        existingSession.session_id,
        selectedEmoji,
        existingSession.recovery_code
      )

      setSuccess(true)
      setTimeout(() => {
        localStorage.setItem('userSession', JSON.stringify(updatedSession))
        onSave(updatedSession)
        window.dispatchEvent(new CustomEvent('emojiChanged', { detail: { emoji: selectedEmoji } }))
        onClose()
      }, 500)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (err && typeof err === 'object' && 'error' in err && err.error === 'Emoji already taken') {
        setError('Dieses Emoji ist inzwischen belegt')
        refetch()
      } else {
        setError('Wechseln fehlgeschlagen')
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleEmojiSelect(emoji: string) {
    if (takenEmojis.includes(emoji)) return
    setSelectedEmoji(emoji)
    setError(null)
  }

  function validateCode(code: string): boolean {
    return /^[A-Za-z0-9]{4}$/.test(code)
  }

  async function handleCreateNew() {
    if (!selectedEmoji || !validateCode(newRecoveryCode)) return

    setIsSaving(true)
    setError(null)

    try {
      const session = await createSession(selectedEmoji, newRecoveryCode.toUpperCase())
      setSuccess(true)
      setTimeout(() => {
        onSave(session)
        window.dispatchEvent(new CustomEvent('emojiChanged', { detail: { emoji: selectedEmoji } }))
        onClose()
      }, 500)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && err.error === 'Emoji already taken') {
        setError('Emoji already taken')
        refetch()
      } else {
        setError('Failed to create session')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRecover() {
    if (!reclaimEmoji || !validateCode(reclaimCode)) return

    setIsSaving(true)
    setError(null)

    try {
      const session = await reclaimSession(reclaimEmoji, reclaimCode.toUpperCase())
      setSuccess(true)
      setTimeout(() => {
        onSave(session)
        window.dispatchEvent(new CustomEvent('emojiChanged', { detail: { emoji: reclaimEmoji } }))
        onClose()
      }, 500)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && err.error === 'Invalid recovery code') {
        setError('Falscher Recovery-Code')
      } else {
        setError('Wiederherstellen fehlgeschlagen')
      }
    } finally {
      setIsSaving(false)
    }
  }

  function canSave(): boolean {
    if (loggedInMode === 'switch') {
      return !!selectedEmoji
        && validateCode(currentRecoveryCode)
        && switchPassword.length > 0
    }
    if (notLoggedInMode === 'recover') {
      return !!reclaimEmoji && validateCode(reclaimCode)
    }
    return !!selectedEmoji && !takenEmojis.includes(selectedEmoji) && validateCode(newRecoveryCode)
  }

  function disabledReason(): string | null {
    if (isSaving || success) return null
    if (loggedInMode === 'switch') {
      if (!selectedEmoji) return 'Neues Emoji auswählen'
      if (!validateCode(currentRecoveryCode)) return 'Aktuellen Recovery-Code eingeben'
      if (switchPassword.length === 0) return 'Passwort eingeben'
      return null
    }
    if (notLoggedInMode === 'recover') {
      if (!reclaimEmoji) return 'Dein Emoji aus der Liste auswählen'
      if (!validateCode(reclaimCode)) return '4-stelligen Recovery-Code eingeben'
      return null
    }
    if (!selectedEmoji) return 'Emoji auswählen'
    if (!validateCode(newRecoveryCode)) return '4-stelligen Recovery-Code eingeben'
    return null
  }

  return (
    <div className="emoji-picker-overlay" onClick={onClose}>
      <div className="emoji-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2>
              {isLoggedIn
                ? (loggedInMode === 'switch' ? 'Switch your emoji' : 'Your Profile')
                : (notLoggedInMode === 'choose-new' ? 'Choose your emoji' : 'Recover your emoji')
              }
            </h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {isLoggedIn ? (
            loggedInMode === 'switch' ? (
              <div className="switch-mode">
                {error && (
                  <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>✕</button>
                  </div>
                )}

                {success && (
                  <div className="success-banner">
                    ✓ Erfolgreich gewechselt!
                  </div>
                )}

                <div className="instructions">
                  Wähle ein neues Emoji und bestätige mit deinem aktuellen Recovery-Code + Passwort. Dein Recovery-Code bleibt gleich.
                </div>

                <div className="current-emoji-display">
                  Aktuell: <span className="current-emoji-char">{existingSession?.emoji}</span>
                </div>

                <div className="emoji-selection">
                  <label>Neues Emoji wählen (nur freie)</label>
                  <div className="emoji-grid">
                    {ALL_EMOJIS.filter(emoji => !takenEmojis.includes(emoji)).map(emoji => (
                      <button
                        key={emoji}
                        className={`emoji-tile ${selectedEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        <span className="emoji-char">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-fields">
                  <div className="recovery-code-input">
                    <label>Dein aktueller Recovery-Code</label>
                    <input
                      type="text"
                      value={currentRecoveryCode}
                      onChange={e => setCurrentRecoveryCode(e.target.value.toUpperCase())}
                      placeholder={existingSession?.recovery_code ? '••••' : 'A7X2'}
                      maxLength={4}
                      className={validateCode(currentRecoveryCode) ? 'valid' : ''}
                    />
                  </div>

                  <div className="recovery-code-input">
                    <label>Passwort (Bastis Geburtsdatum)</label>
                    <input
                      type="password"
                      value={switchPassword}
                      onChange={e => setSwitchPassword(e.target.value)}
                      placeholder="ddmmyyyy"
                      className={`password-input ${switchPassword.length > 0 ? 'valid' : ''}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="logged-in-view">
                <div className="emoji-display">
                  <span className="your-emoji">{existingSession?.emoji}</span>
                </div>
                <div className="profile-info">
                  <p><strong>Dein Emoji:</strong> {existingSession?.emoji}</p>
                  <p><strong>Recovery Code:</strong> {existingSession?.recovery_code}</p>
                  <p><strong>Erstellt am:</strong> {new Date(existingSession?.created_at || '').toLocaleDateString('de-DE')}</p>
                </div>
                <div className="profile-actions">
                  <button className="switch-button" onClick={() => { resetFormState(); setLoggedInMode('switch') }}>
                    Emoji wechseln
                  </button>
                  <button className="logout-button" onClick={handleLogout}>
                    Smiley aufgeben
                  </button>
                </div>
              </div>
            )
          ) : loading ? (
            <div className="loading">Lade Emojis...</div>
          ) : (
            <>
              {error && (
                <div className="error-banner">
                  {error}
                  <button onClick={() => setError(null)}>✕</button>
                </div>
              )}

              {success && (
                <div className="success-banner">
                  ✓ Erfolgreich gespeichert!
                </div>
              )}

              <div className="mode-tabs">
                <button
                  className={`mode-tab ${notLoggedInMode === 'choose-new' ? 'active' : ''}`}
                  onClick={() => { resetFormState(); setNotLoggedInMode('choose-new') }}
                >
                  Neu wählen
                </button>
                <button
                  className={`mode-tab ${notLoggedInMode === 'recover' ? 'active' : ''}`}
                  onClick={() => { resetFormState(); setNotLoggedInMode('recover') }}
                >
                  Wiederherstellen
                </button>
              </div>

              {notLoggedInMode === 'recover' ? (
                <div className="reclaim-mode">
                  <div className="instructions">
                    Wähle deinen Smiley und gib deinen Recovery-Code ein.
                  </div>

                  {sessions.length === 0 ? (
                    <div className="placeholder-hint">
                      Noch keine Smilies vergeben. Wechsle zum Tab "Neu wählen".
                    </div>
                  ) : (
                    <div className="emoji-selection">
                      <label>Dein Smiley</label>
                      <div className="emoji-grid">
                        {sessions.map(session => (
                          <button
                            key={session.emoji}
                            className={`emoji-tile ${reclaimEmoji === session.emoji ? 'selected' : ''}`}
                            onClick={() => setReclaimEmoji(session.emoji)}
                          >
                            <span className="emoji-char">{session.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="recovery-code-input">
                    <label>Recovery-Code</label>
                    <input
                      type="text"
                      value={reclaimCode}
                      onChange={e => setReclaimCode(e.target.value.toUpperCase())}
                      placeholder="A7X2"
                      maxLength={4}
                      className={validateCode(reclaimCode) ? 'valid' : ''}
                    />
                  </div>
                </div>
              ) : (
                <div className="setup-mode">
                  <div className="instructions">
                    Vergib einen Recovery-Code (4 Zeichen) und wähle ein Emoji. Den Code brauchst du, um dich später wiederherzustellen.
                  </div>

                  <div className="recovery-code-input">
                    <label>Recovery-Code (4 Zeichen, Buchstaben & Zahlen)</label>
                    <input
                      type="text"
                      value={newRecoveryCode}
                      onChange={e => setNewRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="A7X2"
                      maxLength={4}
                      className={validateCode(newRecoveryCode) ? 'valid' : ''}
                    />
                  </div>

                  <div className="emoji-selection">
                    <label>Emoji wählen</label>
                    <div className="emoji-grid">
                      {ALL_EMOJIS.map(emoji => {
                        const isTaken = takenEmojis.includes(emoji)
                        return (
                          <button
                            key={emoji}
                            className={`emoji-tile ${isTaken ? 'taken' : ''} ${selectedEmoji === emoji ? 'selected' : ''}`}
                            onClick={() => handleEmojiSelect(emoji)}
                            disabled={isTaken}
                          >
                            <span className="emoji-char">{emoji}</span>
                            {isTaken && <Lock size={12} className="lock-icon" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {(!isLoggedIn || loggedInMode === 'switch') && (
          <div className="modal-footer">
            <div className="footer-actions">
              <button
                className="cancel-button"
                onClick={loggedInMode === 'switch' ? () => { setLoggedInMode('profile'); resetFormState() } : onClose}
              >
                {loggedInMode === 'switch' ? 'Abbrechen' : 'Schließen'}
              </button>
              <button
                className="save-button"
                onClick={notLoggedInMode === 'recover' ? handleRecover : (loggedInMode === 'switch' ? handleSwitch : handleCreateNew)}
                disabled={!canSave() || isSaving || success}
              >
                {isSaving ? 'Speichere...' : success ? '✓ Gespeichert' : (
                  notLoggedInMode === 'recover' ? 'Wiederherstellen' :
                  (loggedInMode === 'switch' ? 'Wechseln' : `${selectedEmoji || ''} speichern`)
                )}
              </button>
            </div>
            {disabledReason() && (
              <div className="disabled-hint">{disabledReason()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
