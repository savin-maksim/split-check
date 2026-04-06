import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './input-field.scss'

const InputField = forwardRef(({ className, type = 'text', label, isLabelHidden = false, error, placeholder, ...rest }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={['input-field', className].filter(Boolean).join(' ')}>
      <input
        ref={ref}
        className="input-field__input"
        type={inputType}
        placeholder={placeholder || label}
        {...rest}
      />

      {!isLabelHidden && (
        <label className="input-field__label" htmlFor={rest.id}>
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
})

InputField.displayName = 'InputField'

export default InputField
