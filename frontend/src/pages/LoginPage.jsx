import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../api/auth.service'
import { useApp } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import './login-page.scss'

function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLoginMode) {
        await authService.login(formData.email, formData.password)
      } else {
        await authService.register(formData.email, formData.password, formData.name)
      }
      
      // После успешного входа/регистрации получаем пользователя из localStorage
      const user = authService.getCurrentUser()
      setUser(user)
      
      toast.success(isLoginMode ? 'Вход выполнен успешно' : 'Регистрация выполнена успешно')
      navigate('/checks')
    } catch (error) {
      toast.error(error.message || `Ошибка при ${isLoginMode ? 'входе' : 'регистрации'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsLoginMode(prev => !prev)
    setFormData({
      email: '',
      password: '',
      name: ''
    })
  }

  return (
    <div className="login-page">
      <div className="login-page__container">
        <h1>{isLoginMode ? 'Вход в SplitCheck' : 'Регистрация'}</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLoginMode}
                placeholder="Введите ваше имя"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Введите email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Введите пароль"
            />
          </div>
          <button 
            type="submit" 
            className="button button--primary"
            disabled={isLoading}
          >
            {isLoading 
              ? (isLoginMode ? 'Вход...' : 'Регистрация...') 
              : (isLoginMode ? 'Войти' : 'Зарегистрироваться')
            }
          </button>
        </form>
        <button 
          onClick={switchMode} 
          className="button button--text"
        >
          {isLoginMode 
            ? 'Нет аккаунта? Зарегистрироваться' 
            : 'Уже есть аккаунт? Войти'
          }
        </button>
      </div>
    </div>
  )
}

export default LoginPage 