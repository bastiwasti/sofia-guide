import { useState } from 'react'
import TabNavigation from './components/TabNavigation'
import UserAvatar from './components/UserAvatar'
import MapPage from './pages/MapPage'
import HotelPage from './pages/HotelPage'
import SurvivalPage from './pages/SurvivalPage'
import SofiaPage from './pages/SofiaPage'
import NotesPage from './pages/NotesPage'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('karte')

  const renderPage = () => {
    switch (activeTab) {
      case 'karte':
        return <MapPage />
      case 'hotel':
        return <HotelPage />
      case 'survival':
        return <SurvivalPage />
      case 'sofia':
        return <SofiaPage />
      case 'notizen':
        return <NotesPage />
      default:
        return <MapPage />
    }
  }

  return (
    <div className="app">
      <main className="page-content">
        {renderPage()}
      </main>
      <UserAvatar />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
