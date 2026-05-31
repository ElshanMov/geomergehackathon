import { useEffect } from 'react';
import { Icon } from '../lib/icon';
import type { ToastItem } from '../context/AppContext';

export function Toast({ t, onClose }: { t: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const x = setTimeout(onClose, 5000);
    return () => clearTimeout(x);
  }, [onClose]);
  return (
    <div
      className="card fade-in"
      style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)', minWidth: 280 }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--success-50)',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={16} />
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.msg}</span>
      <button className="btn btn-ghost btn-xs" onClick={onClose} style={{ fontWeight: 600 }}>
        Geri al
      </button>
    </div>
  );
}
