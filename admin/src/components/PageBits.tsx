// Səhifə başlığı + axtarış sahəsi — 3 CRUD səhifəsində paylaşılır.
import type { ReactNode } from 'react';
import { Icon } from '../lib/icon';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <div className="col" style={{ gap: 3 }}>
        <h1 style={{ fontSize: 20 }}>{title}</h1>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</span>
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
      <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
      <input className="input" style={{ paddingLeft: 34 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
