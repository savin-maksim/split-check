import { cn } from '@shared/lib'
import type { ReactNode } from 'react'

import './toggle-group.scss'

type TToggleGroupOption<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

type TToggleGroupProps<T extends string> = {
  options: TToggleGroupOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  label?: string
}

export const ToggleGroup = <T extends string>({ options, value, onChange, className, label }: TToggleGroupProps<T>) => {
  return (
    <div className={cn('toggle-group', className)}>
      {label && <h2 className="toggle-group__label">{label}</h2>}
      <div className="toggle-group__options" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={cn('toggle-group__option', value === option.value && 'toggle-group__option--active')}
            onClick={() => onChange(option.value)}
          >
            <span className="toggle-group__option-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="toggle-group__option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
