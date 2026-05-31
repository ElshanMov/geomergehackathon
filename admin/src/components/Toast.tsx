// Sadə toast bildiriş sistemi — CRUD əməliyyatlarından sonra geri-əlaqə.
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../lib/icon';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  text: string;
  tone: Tone;
}
interface ToastCtx {
  push: (text: string, tone?: Tone) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, text, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1700, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((t) => {
          const color = t.tone === 'error' ? 'var(--danger)' : t.tone === 'info' ? 'var(--accent)' : 'var(--success)';
          const icon = t.tone === 'error' ? 'circle-alert' : t.tone === 'info' ? 'info' : 'circle-check';
          return (
            <div key={t.id} className="card fade-in row gap-2" style={{ padding: '12px 16px', borderLeft: `3px solid ${color}`, minWidth: 260, boxShadow: 'var(--shadow-lg)' }}>
              <Icon name={icon} size={18} color={color} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.text}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast ToastProvider daxilində istifadə olunmalıdır');
  return c;
}
