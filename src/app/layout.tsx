import { Outlet } from 'react-router-dom'

import { ScrollTopButton, Toast } from '@/shared/ui'

import { BottomNav } from './bottom-nav'

import './styles/index.scss'
import './layout.scss'

export const AppLayout = () => {
  return (
    <div className="layout">
      <main className="layout__content">
        <Outlet />
      </main>
      <BottomNav />
      <ScrollTopButton />
      <Toast />
    </div>
  )
}
