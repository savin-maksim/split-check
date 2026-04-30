import { useRef } from 'react'
import { SingleInputModal } from '@/shared/ui/SingleInputModal'
import './f-create-check.scss'

type TFCreateCheckProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string) => void
}

export const FCreateCheck = ({ isOpen, onClose, onSubmit }: TFCreateCheckProps) => {
  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  return (
    <SingleInputModal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый чек"
      label="Название чека"
      submitLabel="Создать"
      onSubmit={callbacksRef.current.onSubmit}
    />
  )
}
