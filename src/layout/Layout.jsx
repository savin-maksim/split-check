import Navigation from '../components/Navigation/Navigation'
import './layout.scss'

function Layout({ children }) {
  return (
    <div className="layout">
      <main className="layout__content">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

export default Layout 