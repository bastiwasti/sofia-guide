import { useState, useEffect } from 'react'
import { useUserSessions, UserSession } from '../hooks/useUserSessions'
import EmojiPickerModal from './EmojiPickerModal'

export default function UserAvatar() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const { refetch } = useUserSessions()

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

  function handleSave(newSession: UserSession | null) {
    if (newSession) {
      setSession(newSession)
      localStorage.setItem('userSession', JSON.stringify(newSession))
      refetch()
    }
  }

  return (
    <>
      <button
        className="user-avatar"
        onClick={() => setShowPicker(true)}
        aria-label={session ? `Your emoji: ${session.emoji}` : 'Choose your emoji'}
        title={session ? `Your emoji: ${session.emoji}` : 'Choose your emoji'}
      >
        {session?.emoji || '👤'}
      </button>

      {showPicker && (
        <EmojiPickerModal
          existingSession={session}
          onClose={() => setShowPicker(false)}
          onSave={handleSave}
        />
      )}

      <style>{`
        .user-avatar {
          position: fixed;
          bottom: 80px;
          right: 16px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${session ? '#8B5CF6' : 'var(--color-gray-light)'};
          color: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          z-index: 9999;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .user-avatar:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  )
}
