import { useRef } from 'react'
import { SingleInputModal } from '@/shared/ui/SingleInputModal'
import './f-edit-check.scss'

type TFEditCheckProps = {
  isOpen: boolean
  onClose: () => void
  initialTitle: string
  onSubmit: (title: string) => void
}

export const FEditCheck = ({ isOpen, onClose, initialTitle, onSubmit }: TFEditCheckProps) => {
  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  return (
    <SingleInputModal
      isOpen={isOpen}
      onClose={onClose}
      title="Изменить название"
      label="Название чека"
      initialValue={initialTitle}
      submitLabel="Сохранить"
      onSubmit={callbacksRef.current.onSubmit}
    />
  )
}
