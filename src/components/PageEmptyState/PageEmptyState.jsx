import './page-empty-state.scss'

const PageEmptyState = ({ className, icon, title, titleAs = 'h2', muted = false, children, actions }) => {
  const rootClass = ['page-empty-state', muted && 'page-empty-state--muted', className].filter(Boolean).join(' ')
  const TitleTag = titleAs === 'h3' ? 'h3' : 'h2'

  return (
    <div className={rootClass}>
      {icon ? (
        <div className="page-empty-state__icon" aria-hidden>
          {icon}
        </div>
      ) : null}
      {title ? <TitleTag className="page-empty-state__title">{title}</TitleTag> : null}
      {children}
      {actions ? <div className="page-empty-state__actions">{actions}</div> : null}
    </div>
  )
}

export default PageEmptyState
