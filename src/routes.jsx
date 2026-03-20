import { Routes, Route } from 'react-router-dom'

// Pages
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ChecksPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/costs" element={<CostsPage />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  )
}

export default AppRoutes 