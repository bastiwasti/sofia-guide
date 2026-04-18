import { useState, useEffect } from 'react'
import { Map, Home, BookOpen, Info, MessageSquare } from 'lucide-react'
import { useUserSessions, UserSession } from '../hooks/useUserSessions'
import EmojiPickerModal from './EmojiPickerModal'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
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

  const tabs = [
    { id: 'karte', label: 'Karte', icon: Map },
    { id: 'hotel', label: 'Hotel', icon: Home },
    { id: 'survival', label: 'Survival', icon: BookOpen },
    { id: 'sofia', label: 'Sofia', icon: Info },
    { id: 'notizen', label: 'Notizen', icon: MessageSquare }
  ]

  return (
    <nav className="tab-navigation">
      <div className="tabs-row">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id as Tab)}
              aria-label={tab.label}
            >
              <Icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}

        <button
          className="profile-button"
          onClick={() => {
            console.log('Profile button clicked')
            setShowPicker(true)
          }}
          aria-label={session ? `Profil: ${session.emoji}` : 'Profil wählen'}
        >
          <span className="profile-emoji">{session?.emoji || '👤'}</span>
          <span className="tab-label">Profil</span>
        </button>
      </div>

      {showPicker && (
        <>
          {console.log('Rendering EmojiPickerModal')}
          <EmojiPickerModal
            existingSession={session}
            onClose={() => setShowPicker(false)}
            onSave={handleSave}
          />
        </>
      )}

      <style>{`
        .tab-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          background: var(--color-white);
          border-top: 1px solid var(--color-gray-light);
          padding: 0;
          padding-bottom: max(0px, env(safe-area-inset-bottom));
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
          z-index: 3000;
          height: 56px;
        }

        .tabs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          gap: var(--spacing-xs);
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

        .tab-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .profile-button {
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
          border: none;
          cursor: pointer;
        }

        .profile-button:active {
          transform: scale(0.95);
        }

        .profile-emoji {
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${session ? '#8B5CF6' : 'var(--color-gray-light)'};
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .profile-button:hover .profile-emoji {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </nav>
  )
}
