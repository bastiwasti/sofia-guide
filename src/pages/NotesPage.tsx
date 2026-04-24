import { useState, useEffect } from 'react'
import { Plus, Send, Trash2 } from 'lucide-react'
import { useNotes } from '../hooks/useNotes'
import { UserSession } from '../hooks/useUserSessions'

export default function NotesPage() {
  const { notes, loading, createNote, deleteNote, refetch } = useNotes(true, 30000)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [userSession, setUserSession] = useState<UserSession | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('userSession')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        fetch(`/api/user-sessions/${parsed.session_id}/validate`)
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setUserSession(parsed)
            } else {
              localStorage.removeItem('userSession')
              setUserSession(null)
              console.log('Invalid session removed from localStorage in NotesPage')
            }
          })
          .catch(err => {
            console.error('Session validation failed in NotesPage:', err)
            localStorage.removeItem('userSession')
            setUserSession(null)
          })
      } catch (e) {
        console.error('Failed to parse saved session:', e)
        localStorage.removeItem('userSession')
      }
    }
  }, [])

  useEffect(() => {
    const handleEmojiChange = () => {
      console.log('Emoji changed, refreshing notes...')
      refetch()
    }

    window.addEventListener('emojiChanged', handleEmojiChange)
    return () => window.removeEventListener('emojiChanged', handleEmojiChange)
  }, [refetch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !userSession?.session_id) return

    try {
      await createNote({
        content: content.trim(),
        session_id: userSession.session_id
      })
      setContent('')
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  async function handleDelete(id: number) {
    if (!userSession?.session_id) {
      alert('Du bist nicht eingeloggt!')
      return
    }

    try {
      await deleteNote(id, userSession.session_id)
    } catch (error) {
      console.error('Failed to delete note:', error)
      alert('Löschen fehlgeschlagen')
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min`
    if (diffHours < 24) return `vor ${diffHours} Std`
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE')
  }

  if (loading) {
    return (
      <div className="notes-page">
        <div className="hero-section">
          <h1>Notizen</h1>
          <p className="subtitle">Lade Notizen...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <style>{`
          .notes-page {
            min-height: 100%;
            background: var(--color-cream);
          }
          .hero-section {
            background: linear-gradient(135deg, var(--color-notes) 0%, #5A1580 100%);
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
          .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-gray-light);
            border-top-color: var(--color-notes);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="notes-page">
      <div className="hero-section">
        <h1>Notizen</h1>
        <p className="subtitle">Teile deine Gedanken mit der Gruppe</p>
      </div>

      <div className="content-section">
        {showForm && !userSession?.session_id && (
          <div className="note-form">
            <p className="login-hint">Bitte logge dich ein, um Notizen zu erstellen.</p>
            <button className="submit-button" onClick={() => setShowForm(false)}>
              Schließen
            </button>
          </div>
        )}

        {showForm && userSession?.session_id && (
          <form className="note-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="Was möchtest du teilen?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={500}
            />

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>
                Abbrechen
              </button>
              <button type="submit" className="submit-button" disabled={!content.trim()}>
                <Send size={18} />
                <span>Senden</span>
              </button>
            </div>
          </form>
        )}

        <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>Noch keine Notizen</p>
            <p className="hint">Sei der Erste und teile etwas!</p>
          </div>
         ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <div className="author-info">
                  {(note.author_emoji || note.backup_emoji) && (
                    <span className={`emoji ${note.is_active_user === 0 ? 'deprecated' : ''}`}>
                      {note.author_emoji || note.backup_emoji}
                    </span>
                  )}
                </div>
                <span className="timestamp">{formatDate(note.created_at)}</span>
              </div>
              <p className="note-content">{note.content}</p>
              {note.session_id === userSession?.session_id && (
                <button
                  className="delete-button"
                  onClick={() => handleDelete(note.id)}
                  aria-label="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
         )}
       </div>
      </div>

      <button
        className="fab-button"
        onClick={() => setShowForm(!showForm)}
        aria-label="Neue Notiz"
      >
        <Plus size={24} />
      </button>

      <style>{`
        .notes-page {
          min-height: 100%;
          background: var(--color-cream);
        }

        .hero-section {
          background: linear-gradient(135deg, var(--color-notes) 0%, #5A1580 100%);
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

        .fab-button {
          position: fixed;
          bottom: 80px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--color-notes);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
          transition: transform 0.2s ease;
          z-index: 1000;
        }

        .fab-button:active {
          transform: scale(0.95);
        }

        .note-form {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          box-shadow: var(--shadow-sm);
        }

        .login-hint {
          text-align: center;
          color: var(--color-gray-medium);
          font-size: 14px;
          margin: 0;
        }

        .note-form textarea {
          width: 100%;
          border: 1px solid var(--color-gray-light);
          border-radius: var(--border-radius-sm);
          padding: var(--spacing-sm);
          font-family: var(--font-body);
          font-size: 14px;
          resize: none;
          margin-bottom: var(--spacing-sm);
        }

        .note-form textarea:focus {
          outline: 2px solid var(--color-notes);
          border-color: transparent;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .cancel-button {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--color-gray-light);
          background: var(--color-white);
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          color: var(--color-gray-dark);
        }

        .submit-button {
          flex: 2;
          padding: 10px;
          background: var(--color-notes);
          color: white;
          border: none;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-gray-medium);
        }

        .empty-state .hint {
          font-size: 13px;
          margin-top: var(--spacing-xs);
        }

        .note-card {
          background: var(--color-white);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .author-info .emoji {
          font-size: 18px;
        }

        .author-info .emoji.deprecated {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .timestamp {
          font-size: 11px;
          color: var(--color-gray-medium);
        }

        .note-content {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          color: var(--color-text);
        }

        .delete-button {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: transparent;
          color: var(--color-gray-medium);
          padding: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .note-card:hover .delete-button {
          opacity: 1;
        }

        .delete-button:active {
          color: #c62828;
        }
      `}</style>
    </div>
  )
}
