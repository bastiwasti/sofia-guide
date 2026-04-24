import { useState } from 'react'
import { Map, Home, BookOpen, MessageSquare, Info, Dice5 } from 'lucide-react'
import { UserSession } from '../hooks/useUserSessions'
import EmojiPickerModal from './EmojiPickerModal'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen' | 'plan'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  session: UserSession | null
  setSession: (session: UserSession | null) => void
}

export default function TabNavigation({ activeTab, onTabChange, session, setSession }: TabNavigationProps) {
  const [showPicker, setShowPicker] = useState(false)

  function handleSave(newSession: UserSession | null) {
    setSession(newSession)
  }

  const tabs = [
    { id: 'karte', label: 'Karte', icon: Map },
    { id: 'hotel', label: 'Hotel', icon: Home },
    { id: 'survival', label: 'Survival', icon: BookOpen },
    { id: 'sofia', label: 'Sofia', icon: Info },
    { id: 'notizen', label: 'Notizen', icon: MessageSquare },
    { id: 'plan', label: 'Der Plan', icon: Dice5 }
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
          box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1);
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
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 4px;
          background: transparent;
          color: var(--color-gray-medium);
          padding: 0 var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          flex-shrink: 0;
          height: 100%;
        }

        .tab-label {
          font-size: 11px;
          font-weight: 500;
        }

        .tab-button.active {
          color: var(--color-craft);
          font-weight: 600;
        }

        .tab-button.active .tab-label {
          font-weight: 600;
        }

        .tab-button:active {
          color: var(--color-craft);
          font-weight: 600;
        }

        .profile-button {
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
          padding: 0 var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
          position: relative;
        }

        .profile-emoji {
          font-size: 26px !important;
          line-height: 1 !important;
          display: block !important;
        }
      `}</style>
    </nav>
  )
}
