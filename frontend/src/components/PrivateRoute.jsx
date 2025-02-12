import { Navigate, useLocation } from 'react-router-dom';
import authService from '../api/auth.service';

function PrivateRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('PrivateRoute check:', {
    path: location.pathname,
    isAuthenticated: isAuthenticated,
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
  });

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
}

export default PrivateRoute; 