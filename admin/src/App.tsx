// Admin app — provider zənciri + router. Login → qorunan layout (shell) → CRUD səhifələri.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { ToastProvider } from './components/Toast';
import { LoginPage } from './auth/LoginPage';
import { AdminShell } from './shell/AdminShell';
import { UsersPage } from './pages/UsersPage';
import { LdapUsersPage } from './pages/LdapUsersPage';
import { WorkersPage } from './pages/WorkersPage';
import { IllegalConstructionPage } from './pages/IllegalConstructionPage';
import { NomenclaturesPage } from './pages/NomenclaturesPage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteEditorPage } from './pages/RouteEditorPage';
import { PrivilegesPage } from './pages/PrivilegesPage';
import { PasswordPolicyPage } from './pages/PasswordPolicyPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AdminShell />}>
                <Route index element={<Navigate to="/users" replace />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/ldap" element={<LdapUsersPage />} />
                <Route path="/workers" element={<WorkersPage />} />
                <Route path="/qanunsuz-tikinti" element={<IllegalConstructionPage />} />
                <Route path="/nomenclatures" element={<NomenclaturesPage />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/routes/:id" element={<RouteEditorPage />} />
                <Route path="/privileges" element={<PrivilegesPage />} />
                <Route path="/password-policy" element={<PasswordPolicyPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
