import { Map, Home, BookOpen, Info, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserSession } from '../hooks/useUserSessions'
import EmojiPickerModal from './EmojiPickerModal'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [session, setSession] = useState<UserSession | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [activeTabState, setActiveTabState] = useState<Tab>(activeTab)

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

  function handleSave(newSession: UserSession | null) {
    setSession(newSession)
    if (newSession) {
      localStorage.setItem('userSession', JSON.stringify(newSession))
    } else {
      localStorage.removeItem('userSession')
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
      <button
        className={`emoji-button ${session ? 'has-session' : ''}`}
        onClick={() => setShowPicker(true)}
        aria-label={session ? 'Dein Emoji' : 'Emoji wählen'}
      >
        <span className="emoji-icon">{session?.emoji || '👤'}</span>
        <span className="tab-label">Smiley</span>
      </button>

      {showPicker && (
        <EmojiPickerModal
          existingSession={session}
          onClose={() => setShowPicker(false)}
          onSave={handleSave}
        />
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
      `}</style>
    </nav>
  )
}
