import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useSession } from './hooks/useSession'
import { useSocket } from './hooks/useSocket'
import { useUserSessions } from './hooks/useUserSessions'
import TabNavigation from './components/TabNavigation'
import MapPage, { MapFocusRequest } from './pages/MapPage'
import HotelPage from './pages/HotelPage'
import SurvivalPage from './pages/SurvivalPage'
import SofiaPage from './pages/SofiaPage'
import NotesPage from './pages/NotesPage'
import PlanPage from './pages/PlanPage'

type Tab = 'karte' | 'hotel' | 'survival' | 'sofia' | 'notizen' | 'plan'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('karte')
  const [mapFocusRequest, setMapFocusRequest] = useState<MapFocusRequest | null>(null)
  const { session, setSession } = useSession()
  const { sessions } = useUserSessions()
  useSocket()

  function focusOnMap(req: MapFocusRequest) {
    flushSync(() => {
      setMapFocusRequest({ ...req, token: Date.now() })
      setActiveTab('karte')
    })
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'karte':
        return (
          <MapPage
            session={session}
            focusRequest={mapFocusRequest}
            onFocusConsumed={() => setMapFocusRequest(null)}
          />
        )
      case 'hotel':
        return <HotelPage />
      case 'survival':
        return <SurvivalPage />
      case 'sofia':
        return <SofiaPage onFocusOnMap={focusOnMap} />
      case 'notizen':
        return <NotesPage />
      case 'plan':
        return <PlanPage sessions={sessions} />
      default:
        return (
          <MapPage
            session={session}
            focusRequest={mapFocusRequest}
            onFocusConsumed={() => setMapFocusRequest(null)}
          />
        )
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
