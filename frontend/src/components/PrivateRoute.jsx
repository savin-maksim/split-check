import { Navigate } from 'react-router-dom';
import authService from '../api/auth.service';

function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Если пользователь не авторизован, перенаправляем на главную страницу
    return <Navigate to="/" replace />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return children;
}

export default PrivateRoute; 