// Sessiya konteksti — AsyncStorage-da saxlanır, açılışda bərpa olunur.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import type { AuthUser } from '../api/types';

const SESSION_KEY = 'nrm_session_v1';

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (creds: { username: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const login = async (creds: { username: string; password: string; role: string }) => {
    const u = await api.login(creds);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    AsyncStorage.removeItem(SESSION_KEY).catch(() => undefined);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
