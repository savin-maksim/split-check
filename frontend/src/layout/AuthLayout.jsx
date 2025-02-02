import Navigation from '../components/Navigation/Navigation'
import Header from '../components/Header/Header'

function AuthLayout({ children }) {
  return (
    <div className='layout'>
      <Header />
      <main className="layout__content">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

export default AuthLayout 