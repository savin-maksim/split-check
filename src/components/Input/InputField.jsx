import { forwardRef, useState, useRef, useCallback } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import './input-field.scss'

const InputField = forwardRef(
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
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [hasUncontrolledValue, setHasUncontrolledValue] = useState(
      () => defaultValue != null && String(defaultValue).length > 0,
    )
    const innerRef = useRef(null)
    const isPasswordType = type === 'password'
    const isControlled = value !== undefined
    const hasValue = isControlled ? String(value ?? '').length > 0 : hasUncontrolledValue
    const showClear = clearable && hasValue && !rest.readOnly && !rest.disabled

    const setRefs = useCallback(
      (el) => {
        innerRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const handleChange = (e) => {
      if (!isControlled) setHasUncontrolledValue(e.target.value.length > 0)
      onChange?.(e)
    }

    const handleClear = (e) => {
      e.preventDefault()
      const input = innerRef.current
      if (!input || rest.disabled || rest.readOnly) return

      if (isControlled) {
        onChange?.({ target: { value: '' }, currentTarget: input })
      } else {
        const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        setNative?.call(input, '')
        setHasUncontrolledValue(false)
        const ev = new Event('input', { bubbles: true })
        input.dispatchEvent(ev)
        onChange?.({ target: input, currentTarget: input })
      }
      input.blur()
    }

    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

    const rootClass = [
      'input-field',
      icon ? 'input-field--with-icon' : '',
      showClear ? 'input-field--with-clear' : '',
      isPasswordType ? 'input-field--with-password' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={rootClass}>
        {icon ? (
          <span className="input-field__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          ref={setRefs}
          className="input-field__input"
          type={inputType}
          placeholder={label}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...rest}
        />

        {!isLabelHidden && (
          <label className="input-field__label" htmlFor={rest.id}>
            {label}
          </label>
        )}

        {showClear ? (
          <button type="button" className="input-field__clear" onClick={handleClear} aria-label={clearAriaLabel}>
            <X size={18} strokeWidth={2} />
          </button>
        ) : null}

        {isPasswordType ? (
          <button type="button" className="input-field__password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}

        {error ? <div className="input-field__error">{error}</div> : null}
      </div>
    )
  },
)

InputField.displayName = 'InputField'

export default InputField
