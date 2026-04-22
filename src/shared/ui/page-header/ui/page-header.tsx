import type { ElementType, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import './page-header.scss'

type TPageHeaderProps = {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
  titleAs?: 'h1' | 'h2'
}

export const PageHeader = ({ icon, title, subtitle, action, className, titleAs = 'h1' }: TPageHeaderProps) => {
  const TitleTag: ElementType = titleAs
  const showSubtitle = subtitle != null && subtitle !== false && subtitle !== ''

  return (
    <header className={cn('page-header', className)}>
      <div className="page-header__title-block">
        {icon != null && (
          <span className="page-header__icon-wrap" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="page-header__text">
          <TitleTag className="page-header__title h2">{title}</TitleTag>
          {showSubtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {action != null && <div className="page-header__actions">{action}</div>}
    </header>
  )
}
