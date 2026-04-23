import { forwardRef, memo, useState, useRef, useCallback, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, MouseEvent, MutableRefObject, ReactNode } from 'react'

import { Eye, EyeOff, X } from 'lucide-react'

import { cn } from '@/shared/lib'

import './input.scss'

export type TInputProps = {
  label?: string
  isLabelHidden?: boolean
  error?: string
  icon?: ReactNode
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

        if (isControlled) {
          const syntheticEvent = {
            target: { value: '' },
            currentTarget: input,
          } as unknown as ChangeEvent<HTMLInputElement>
          onChange?.(syntheticEvent)
        } else {
          const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          setNative?.call(input, '')
          setHasUncontrolledValue(false)
          const ev = new Event('input', { bubbles: true })
          input.dispatchEvent(ev)
          const syntheticEvent = {
            target: input,
            currentTarget: input,
          } as unknown as ChangeEvent<HTMLInputElement>
          onChange?.(syntheticEvent)
        }
        input.blur()
      }

      const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

      return (
        <div
          className={cn(
            'input-field',
            icon ? 'input-field--with-icon' : null,
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

          {showClear ? (
            <button type="button" className="input-field__clear" onClick={handleClear} aria-label={clearAriaLabel}>
              <X size={'var(--button-icon-size)'} strokeWidth={2} />
            </button>
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
