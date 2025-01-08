import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './layout/Layout/Layout'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import Toast from './components/Toast/Toast'
import AppRoutes from './routes'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
          <Toast />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
