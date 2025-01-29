import { useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation/Navigation'
import './layout.scss'

function Layout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="layout">
      <main className="layout__content">
        {children}
      </main>
      {!isLoginPage && <Navigation />}
    </div>
  )
}

export default Layout 