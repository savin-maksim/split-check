import { useRef } from 'react'

import { Outlet } from 'react-router-dom'

import { ScrollTopButton, Toast } from '@/shared/ui'

import { BottomNav } from './bottom-nav'

import './styles/index.scss'
import './layout.scss'

export const AppLayout = () => {
  const layoutScrollRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={layoutScrollRef} className="layout">
      <main className="layout__content">
        <Outlet />
      </main>
      <BottomNav />
      <ScrollTopButton scrollRootRef={layoutScrollRef} />
      <Toast />
    </div>
  )
}
