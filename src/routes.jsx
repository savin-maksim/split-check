import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'

// Pages
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'

function AppRoutes() {
  const { 
    people, 
    costs, 
    showCostSection, 
    showTransferSection 
  } = useApp()

  return (
    <Routes>
      <Route path="/" element={<PeoplePage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route 
        path="/costs" 
        element={showCostSection && <CostsPage />} 
      />
      <Route 
        path="/stats" 
        element={showTransferSection && <StatsPage />} 
      />
    </Routes>
  )
}

export default AppRoutes 