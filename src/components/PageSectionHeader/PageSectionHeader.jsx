import './page-section-header.scss'

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon] — обычно иконка Lucide (наследует currentColor от обёртки)
 * @param {import('react').ReactNode} props.title
 * @param {import('react').ReactNode} [props.subtitle]
 * @param {import('react').ReactNode} [props.action] — кнопка или группа элементов справа
 * @param {string} [props.className] — на корневой header
 * @param {boolean} [props.sticky=true]
 * @param {'h1' | 'h2'} [props.titleAs='h1']
 */
function PageSectionHeader({
  icon,
  title,
  subtitle,
  action,
  className = '',
  sticky = true,
  titleAs: TitleTag = 'h1',
}) {
  const rootClass = [
    'page-section-header',
    sticky && 'page-section-header--sticky',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const showSubtitle =
    subtitle != null && subtitle !== false && subtitle !== ''

  return (
    <header className={rootClass}>
      <div className="page-section-header__title-block">
        {icon != null && (
          <span className="page-section-header__icon-wrap">{icon}</span>
        )}
        <div className="page-section-header__text">
          <TitleTag className="page-section-header__title">{title}</TitleTag>
          {showSubtitle && (
            <p className="page-section-header__subtitle">{subtitle}</p>
          )}
        </div>
      </div>
      {action != null && (
        <div className="page-section-header__actions">{action}</div>
      )}
    </header>
  )
}

export default PageSectionHeader
