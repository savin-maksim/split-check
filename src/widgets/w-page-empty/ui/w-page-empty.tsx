import type { ReactNode } from 'react'

import { PageHeader, EmptyState } from '@/shared/ui'

type TWPageEmptyProps = {
  pageTitle: string
  pageIcon: ReactNode
  emptyIcon: ReactNode
  emptyTitle: string
  children: ReactNode
  actions?: ReactNode
}

export const WPageEmpty = ({ pageTitle, pageIcon, emptyIcon, emptyTitle, children, actions }: TWPageEmptyProps) => (
  <>
    <PageHeader icon={pageIcon} title={pageTitle} />
    <EmptyState icon={emptyIcon} title={emptyTitle} actions={actions}>
      {children}
    </EmptyState>
  </>
)
