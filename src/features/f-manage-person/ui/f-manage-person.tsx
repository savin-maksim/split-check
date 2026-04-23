import './f-manage-person.scss'
import { SingleInputModal } from '@/shared/ui/SingleInputModal'

type TFManagePersonProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialName?: string
  onSubmit: (name: string) => void
  title?: string
}

export const FManagePerson = ({
  isOpen,
  onClose,
  mode,
  initialName = '',
  onSubmit,
  title,
}: TFManagePersonProps) => {
  const modalTitle =
    title ?? (mode === 'add' ? 'Добавить участника' : 'Изменить имя')

  return (
    <SingleInputModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      label="Имя"
      initialValue={initialName}
      submitLabel={mode === 'add' ? 'Добавить' : 'Сохранить'}
      onSubmit={onSubmit}
    />
  )
}
