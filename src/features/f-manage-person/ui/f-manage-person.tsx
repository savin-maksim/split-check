import { SingleInputModal } from '@shared/ui'
import type { TSingleInputModalSubmitResult } from '@shared/ui'

type TFManagePersonProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialName?: string
  onSubmit: (name: string) => TSingleInputModalSubmitResult
  title?: string
}

export const FManagePerson = ({ isOpen, onClose, mode, initialName = '', onSubmit, title }: TFManagePersonProps) => {
  const modalTitle = title ?? (mode === 'add' ? 'Добавить участника' : 'Изменить имя')

  return (
    <SingleInputModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      label="Имя"
      initialValue={initialName}
      emptyError="Введите имя участника"
      submitLabel={mode === 'add' ? 'Добавить' : 'Сохранить'}
      onSubmit={onSubmit}
    />
  )
}
