import Navigation from '../components/Navigation/Navigation'
import StatisticsShareModal from '../components/StatisticsShare/StatisticsShareModal'
import { useApp } from '../context/AppContext'
import './layout.scss'

function Layout({ children }) {
  const { statisticsShareModalOpen, setStatisticsShareModalOpen } = useApp()

  return (
    <div className="layout">
      <main className="layout__content">{children}</main>
      <Navigation />
      <StatisticsShareModal isOpen={statisticsShareModalOpen} onClose={() => setStatisticsShareModalOpen(false)} />
    </div>
  )
}

export default Layout
