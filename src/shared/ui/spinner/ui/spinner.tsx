import { cn } from '@/shared/lib'

import './spinner.scss'

type TSpinnerProps = {
  className?: string
}

export const Spinner = ({ className }: TSpinnerProps) => {
  return (
    <div className={cn('spinner', className)} role="status" aria-label="Загрузка">
      <div className="spinner__circle" />
    </div>
  )
}
