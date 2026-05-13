import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './layout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: () => import('@pages/checks-list').then((m) => ({ Component: m.PChecksList })),
      },
      {
        path: 'check/:checkId/people',
        lazy: () => import('@pages/people').then((m) => ({ Component: m.PPeople })),
      },
      {
        path: 'check/:checkId/items',
        lazy: () => import('@pages/items').then((m) => ({ Component: m.PItems })),
      },
      {
        path: 'check/:checkId/stats',
        lazy: () => import('@pages/stats').then((m) => ({ Component: m.PStats })),
      },
    ],
  },
])
