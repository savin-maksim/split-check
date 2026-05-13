import { forwardRef, memo, useState, useRef, useCallback, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, MouseEvent, MutableRefObject, ReactNode } from 'react'

import { Eye, EyeOff, X } from 'lucide-react'

import { cn } from '@shared/lib'
import { IconButton } from '@shared/ui/icon-button'

import './input.scss'

export type TInputProps = {
  label?: string
  isLabelHidden?: boolean
  error?: string
  icon?: ReactNode
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
      const hasAddons = suffix != null || showClear || isPasswordType

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
        <>
          {error ? <div className="input-field__error">{error}</div> : null}

          <div className={cn('input-field', className)}>
            <div className="input-field__control">
              {icon ? (
                <span className="input-field__icon" aria-hidden="true">
                  {icon}
                </span>
              ) : null}

              <div className="input-field__body">
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
              </div>

              {hasAddons ? (
                <div className="input-field__addons">
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
                    <IconButton
                      type="button"
                      className="input-field__password-toggle"
                      onClick={handleTogglePassword}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      icon={
                        showPassword ? (
                          <EyeOff size={'var(--button-icon-size)'} />
                        ) : (
                          <Eye size={'var(--button-icon-size)'} />
                        )
                      }
                    />
                  ) : null}

                  {suffix != null ? <div className="input-field__suffix">{suffix}</div> : null}
                </div>
              ) : null}
            </div>
          </div>
        </>
      )
    },
  ),
)

Input.displayName = 'Input'
