// Route mühafizəçisi — autentifikasiya yoxdursa /login-ə yönləndirir.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth() {
  const { auth } = useAuth();
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
}
