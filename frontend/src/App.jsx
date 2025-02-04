import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import { useLocation } from 'react-router-dom'
import AuthLayout from './layout/AuthLayout'
import SharedLayout from './layout/SharedLayout'
import Toast from './components/Toast/Toast'
import ScrollTopButton from './components/Button/ScrollTopButton'
import AppRoutes from './routes/AppRoutes'

function AppContent() {
  const location = useLocation()
  const isSharedPage = location.pathname.startsWith('/share/')

  return (
    <>
      {isSharedPage ? (
        <SharedLayout>
          <AppRoutes />
        </SharedLayout>
      ) : (
        <AuthLayout>
          <AppRoutes />
        </AuthLayout>
      )}
      <Toast />
      <ScrollTopButton />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
