import { SingleInputModal } from '@/shared/ui'

type TFManageCheckProps =
  | {
      mode: 'add'
      isOpen: boolean
      onClose: () => void
      onSubmit: (title: string) => void
    }
  | {
      mode: 'edit'
      initialTitle: string
      isOpen: boolean
      onClose: () => void
      onSubmit: (title: string) => void
    }

export const FManageCheck = (props: TFManageCheckProps) => {
  const { mode, isOpen, onClose, onSubmit } = props

  const title = mode === 'add' ? 'Новый чек' : 'Изменить название'
  const submitLabel = mode === 'add' ? 'Создать' : 'Сохранить'
  const initialValue = mode === 'edit' ? props.initialTitle : undefined

  return (
    <SingleInputModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      label="Название чека"
      initialValue={initialValue}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
    />
  )
}

FManageCheck.displayName = 'FManageCheck'
