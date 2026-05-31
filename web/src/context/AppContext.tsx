// Tətbiq səviyyəsində paylaşılan state: aktorlar (Avatar üçün),
// seçilmiş incident (drawer), xəritə fly-to hədəfi və toast bildirişləri.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { Actor, Incident } from '../types';

export interface ToastItem {
  id: number;
  msg: string;
}

interface AppContextValue {
  actors: Record<string, Actor>;
  selected: Incident | null;
  flyToId: string | null;
  openIncident: (inc: Incident | 'new') => void;
  closeIncident: () => void;
  toasts: ToastItem[];
  pushToast: (msg: string) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<Record<string, Actor>>({});
  const [selected, setSelected] = useState<Incident | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let alive = true;
    api
      .actors()
      .then((list) => {
        if (!alive) return;
        const map: Record<string, Actor> = {};
        list.forEach((a) => (map[a.id] = a));
        setActors(map);
      })
      .catch((e) => console.warn('actors yüklənmədi:', e));
    return () => {
      alive = false;
    };
  }, []);

  const pushToast = useCallback((msg: string) => {
    setToasts((t) => [...t, { id: Date.now() + Math.random(), msg }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const openIncident = useCallback(
    (inc: Incident | 'new') => {
      if (inc === 'new') {
        pushToast('Yeni müraciət formu (demo)');
        return;
      }
      setSelected(inc);
      setFlyToId(inc.id);
    },
    [pushToast],
  );

  const closeIncident = useCallback(() => setSelected(null), []);

  const value = useMemo<AppContextValue>(
    () => ({ actors, selected, flyToId, openIncident, closeIncident, toasts, pushToast, dismissToast }),
    [actors, selected, flyToId, openIncident, closeIncident, toasts, pushToast, dismissToast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() AppProvider daxilində çağırılmalıdır');
  return ctx;
}

export function useActors(): Record<string, Actor> {
  return useApp().actors;
}
