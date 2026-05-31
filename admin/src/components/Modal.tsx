// Ümumi modal dialoq — backdrop + mərkəzləşmiş panel, ESC ilə bağlanır.
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../lib/icon';

export function Modal({
  title,
  onClose,
  children,
  footer,
  width = 540,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card fade-in"
        style={{ width: `min(${width}px, 96vw)`, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Bağla">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
        {footer && (
          <div className="row" style={{ justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
