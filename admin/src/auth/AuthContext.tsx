// Mock auth konteksti — token localStorage-da saxlanır, SQL/real token yoxdur.
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '../types';
import { api } from '../api/client';

const STORAGE_KEY = 'nrm_admin_auth';

interface AuthCtx {
  auth: AuthResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function load(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(load);

  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    setAuth(res);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  return <Ctx.Provider value={{ auth, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth AuthProvider daxilində istifadə olunmalıdır');
  return c;
}
