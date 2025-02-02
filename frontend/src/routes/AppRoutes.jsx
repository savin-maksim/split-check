import { Routes, Route, Navigate } from 'react-router-dom'
import ChecksPage from '../pages/ChecksPage'
import PeoplePage from '../pages/PeoplePage'
import CostsPage from '../pages/CostsPage'
import StatsPage from '../pages/StatsPage'
import SharedStatsPage from '../pages/SharedStatsPage'
import LoginPage from '../pages/LoginPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Маршрут для неавторизованных пользователей */}
      <Route path="/login" element={<LoginPage />} />

      {/* Маршруты для авторизованных пользователей */}
      <Route path="/" element={<Navigate to="/checks" replace />} />
      <Route path="/checks" element={<ChecksPage />} />
      <Route path="/checks/:checkId/people" element={<PeoplePage />} />
      <Route path="/checks/:checkId/costs" element={<CostsPage />} />
      <Route path="/checks/:checkId/stats" element={<StatsPage />} />

      {/* Маршрут для просмотра расшаренного чека */}
      <Route path="/share/:token" element={<SharedStatsPage />} />
    </Routes>
  )
}

export default AppRoutes 