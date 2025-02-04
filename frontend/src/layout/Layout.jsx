import { useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation/Navigation'
import './layout.scss'
import Header from '../components/Header/Header'

function Layout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isSharedPage = location.pathname.startsWith('/share/')

  return (
    <div className="layout">
      <Header />
      <main className="layout__content">
        {children}
      </main>
      {!isLoginPage && !isSharedPage && <Navigation />}
    </div>
  )
}

export default Layout 