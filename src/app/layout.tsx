import { Outlet } from 'react-router-dom'

import { WBottomNav } from '@widgets/w-bottom-nav'
import { ScrollTopButton, Toast } from '@shared/ui'

import './styles/index.scss'
import './layout.scss'

export const AppLayout = () => {
  return (
    <div className="layout">
      <main className="layout__content">
        <Outlet />
      </main>
      <WBottomNav />
      <ScrollTopButton />
      <Toast />
    </div>
  )
}
