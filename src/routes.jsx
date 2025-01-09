import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'

// Pages
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/people" replace />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/costs" element={<CostsPage />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  )
}

export default AppRoutes 