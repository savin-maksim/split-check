import { Routes, Route, Navigate } from 'react-router-dom'
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'
import PrivateRoute from './components/PrivateRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/checks" replace />} />
      <Route 
        path="/checks" 
        element={
          <PrivateRoute>
            <ChecksPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/checks/:checkId/people" 
        element={
          <PrivateRoute>
            <PeoplePage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/checks/:checkId/costs" 
        element={
          <PrivateRoute>
            <CostsPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/checks/:checkId/stats" 
        element={
          <PrivateRoute>
            <StatsPage />
          </PrivateRoute>
        } 
      />
    </Routes>
  )
}

export default AppRoutes 