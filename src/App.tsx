import { useState } from 'react'
import { useSession } from './hooks/useSession'
import { useSocket } from './hooks/useSocket'
import TabNavigation from './components/TabNavigation'
import MapPage from './pages/MapPage'
import HotelPage from './pages/HotelPage'
import SurvivalPage from './pages/SurvivalPage'
import SofiaPage from './pages/SofiaPage'
import NotesPage from './pages/NotesPage'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('karte')
  const { session, setSession } = useSession()
  useSocket()

  const renderPage = () => {
    switch (activeTab) {
      case 'karte':
        return <MapPage session={session} />
      case 'hotel':
        return <HotelPage />
      case 'survival':
        return <SurvivalPage />
      case 'sofia':
        return <SofiaPage />
      case 'notizen':
        return <NotesPage />
      default:
        return <MapPage session={session} />
    }
  }

  return (
    <div className="app">
      <main className="page-content">
        {renderPage()}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} session={session} setSession={setSession} />
    </div>
  )
}

export default App
