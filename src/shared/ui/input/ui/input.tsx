import { forwardRef, memo, useState, useRef, useCallback, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, MouseEvent, MutableRefObject, ReactNode } from 'react'

import { Eye, EyeOff, X } from 'lucide-react'

import { cn } from '@/shared/lib'

import './input.scss'
import { IconButton } from '@shared/ui'

export type TInputProps = {
  label?: string
  isLabelHidden?: boolean
  error?: string
  icon?: ReactNode
  /** Контент справа внутри поля (до кнопки очистки, если есть) */
  suffix?: ReactNode
  clearable?: boolean
  clearAriaLabel?: string
} & InputHTMLAttributes<HTMLInputElement>

export const Input = memo(
  forwardRef<HTMLInputElement, TInputProps>(
    (
      {
        className,
        type = 'text',
        label,
        isLabelHidden = false,
        error,
        icon,
        suffix,
        clearable = false,
        clearAriaLabel = 'Очистить',
        value,
        defaultValue,
        onChange,
        name,
        id,
        ...rest
      },
      ref,
    ) => {
      const generatedId = useId()
      const inputId = id ?? generatedId

      const [showPassword, setShowPassword] = useState(false)
      const [hasUncontrolledValue, setHasUncontrolledValue] = useState(
        () => defaultValue != null && String(defaultValue).length > 0,
      )
      const innerRef = useRef<HTMLInputElement | null>(null)
      const isPasswordType = type === 'password'
      const isControlled = value !== undefined
      const hasValue = isControlled ? String(value ?? '').length > 0 : hasUncontrolledValue
      const showClear = clearable && hasValue && !rest.readOnly && !rest.disabled

      const setRefs = useCallback(
        (el: HTMLInputElement | null) => {
          innerRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as MutableRefObject<HTMLInputElement | null>).current = el
        },
        [ref],
      )

      const handleTogglePassword = () => {
        setShowPassword((prev) => !prev)
      }

      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setHasUncontrolledValue(e.target.value.length > 0)
        onChange?.(e)
      }

      const handleClear = (e: MouseEvent) => {
        e.preventDefault()
        const input = innerRef.current
        if (!input || rest.disabled || rest.readOnly) return

        const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        setNativeValue?.call(input, '')
        if (!isControlled) setHasUncontrolledValue(false)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.focus()
      }

      const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

      return (
        <div
          className={cn(
            'input-field',
            icon ? 'input-field--with-icon' : null,
            suffix != null ? 'input-field--with-suffix' : null,
            showClear && 'input-field--with-clear',
            isPasswordType && 'input-field--with-password',
            className,
          )}
        >
          {icon ? (
            <span className="input-field__icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}

          <input
            ref={setRefs}
            id={inputId}
            className="input-field__input"
            type={inputType}
            placeholder={label}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...rest}
          />

          {!isLabelHidden && (
            <label className="input-field__label" htmlFor={inputId} title={label}>
              {label}
            </label>
          )}

          {suffix != null ? <div className="input-field__suffix">{suffix}</div> : null}

          {showClear ? (
            <IconButton
              type="button"
              className="input-field__clear"
              onClick={handleClear}
              aria-label={clearAriaLabel}
              icon={<X size={'var(--button-icon-size)'} strokeWidth={2} />}
            />
          ) : null}

          {isPasswordType ? (
            <button
              type="button"
              className="input-field__password-toggle"
              onClick={handleTogglePassword}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff size={'var(--button-icon-size)'} /> : <Eye size={'var(--button-icon-size)'} />}
            </button>
          ) : null}

          {error ? <div className="input-field__error">{error}</div> : null}
        </div>
      )
    },
  ),
)

Input.displayName = 'Input'
