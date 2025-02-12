import { Routes, Route, Navigate } from 'react-router-dom'
import ChecksPage from './pages/ChecksPage'
import PeoplePage from './pages/PeoplePage'
import CostsPage from './pages/CostsPage'
import StatsPage from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import authService from './api/auth.service'

function AppRoutes() {
  console.log('Current auth status:', {
    isAuthenticated: authService.isAuthenticated(),
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
  })

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Navigate to={authService.isAuthenticated() ? "/checks" : "/login"} replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          authService.isAuthenticated() ? <Navigate to="/checks" replace /> : <LoginPage />
        } 
      />
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