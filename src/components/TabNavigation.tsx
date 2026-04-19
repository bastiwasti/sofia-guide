import { useState, useEffect } from 'react'
import { Map, Home, BookOpen, MessageSquare, Info } from 'lucide-react'
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
        const parsed = JSON.parse(saved)

        fetch(`/api/user-sessions/${parsed.session_id}/validate`)
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setSession(parsed)
            } else {
              localStorage.removeItem('userSession')
              setSession(null)
              console.log('Invalid session removed from localStorage')
            }
          })
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
              <Icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
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
          width: 100%;
          z-index: 3000;
          background: var(--color-white);
          box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1));
          touch-action: none;
        }

        .tabs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: var(--spacing-sm) 0;
          gap: var(--spacing-xs);
        }

        .tab-button {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
          background: transparent;
          color: var(--color-gray-medium);
          padding: 0 var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          flex-shrink: 0;
          height: 100%;
        }

        .tab-button:active {
          color: var(--color-craft);
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button:active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        .tab-button active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button: active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab- button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }

        .tab-button.active {
          font-weight: 600;
        }
        .tab-button.active {
          font-weight: 600;
        }
        }
      `}</style>
    </nav>
  )
}
