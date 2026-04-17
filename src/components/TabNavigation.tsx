import { Map, Home, BookOpen, Info, MessageSquare } from 'lucide-react'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
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
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id as Tab)}
            aria-label={tab.label}
          >
            <Icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
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
      `}</style>
    </nav>
  )
}
