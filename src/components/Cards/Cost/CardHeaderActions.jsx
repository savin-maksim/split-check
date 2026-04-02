import { Copy, Pencil, Trash2 } from 'lucide-react'
import IconButton from '@/components/Button/IconButton'
import './card-header-actions.scss'

const variantClass = {
  largeGap: 'card-header__actions--large-gap',
}

function CardHeaderActions({ onDuplicate, onEdit, onDelete, variant }) {
  return (
    <div className={['card-header__actions', variantClass[variant]].filter(Boolean).join(' ')}>
      {onDuplicate && <IconButton icon={<Copy />} onClick={onDuplicate} title="Дублировать" />}
      {onEdit && <IconButton icon={<Pencil />} onClick={onEdit} title="Редактировать" />}
      {onDelete && <IconButton icon={<Trash2 />} variant="danger" onClick={onDelete} title="Удалить" />}
    </div>
  )
}

export default CardHeaderActions
