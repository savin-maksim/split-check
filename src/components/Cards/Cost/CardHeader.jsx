import MarqueeTitle from '../../MarqueeTitle/MarqueeTitle'
import CardHeaderActions from './CardHeaderActions'
import './card-header.scss'

export default function CardHeader({
  title,
  as,
  classNameTitle,
  classNameText,
  onDuplicate,
  onEdit,
  onDelete,
  variantActions,
  ...rest
}) {
  const hasActions = onDuplicate || onEdit || onDelete
  return (
    <div className="card-header">
      <MarqueeTitle
        as={as}
        className={classNameTitle}
        textClassName={classNameText}
        {...rest}
      >
        {title}
      </MarqueeTitle>
      {hasActions && (
        <CardHeaderActions
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onDelete={onDelete}
          variant={variantActions}
        />
      )}
    </div>
  )
}
