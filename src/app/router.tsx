import { createBrowserRouter } from 'react-router-dom'

import { PChecksList } from '@pages/checks-list'
import { PItems } from '@pages/items'
import { PPeople } from '@pages/people'
import { PStats } from '@pages/stats'

import { AppLayout } from './layout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        Component: PChecksList,
      },
      {
        path: 'check/:checkId/people',
        Component: PPeople,
      },
      {
        path: 'check/:checkId/items',
        Component: PItems,
      },
      {
        path: 'check/:checkId/stats',
        Component: PStats,
      },
    ],
  },
])
