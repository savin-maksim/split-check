import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error details:', {
      error: error,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      // Вместо показа разметки с ошибкой, просто возвращаем null
      console.error('React error boundary caught an error:', this.state.error)
      return null
    }

    return this.props.children
  }
}

export default ErrorBoundary 