import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './input-field.scss'

const InputField = (props) => {
  const {
    className,
    type = 'text',
    id,
    name,
    value,
    onChange,
    placeholder,
    label,
    isLabelHidden = false,
    required = false,
    autoComplete,
    error,
    extraAttrs,
  } = props

  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={['input-field', className].filter(Boolean).join(' ')}>
      <input
        className="input-field__input"
        type={inputType}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        autoComplete={autoComplete}
        required={required}
        {...extraAttrs}
      />

      {!isLabelHidden && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}

      {isPasswordType && (
        <button type="button" className="input-field__password-toggle" onClick={togglePasswordVisibility}>
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {error && <div className="input-field__error">{error}</div>}
    </div>
  )
}

export default InputField
