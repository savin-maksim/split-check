import { Routes, Route, Navigate } from 'react-router-dom'
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import authService from './api/auth.service'

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          authService.isAuthenticated() 
            ? <Navigate to="/checks" replace /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={<LoginPage />} />
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