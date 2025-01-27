import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './layout/Layout'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import Toast from './components/Toast/Toast'
import ScrollTopButton from './components/Button/ScrollTopButton'
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
          <ScrollTopButton />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
