import { Icon } from '../lib/icon';

export function Placeholder({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--muted)' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={32} />
      </div>
      <div className="col" style={{ alignItems: 'center', gap: 6 }}>
        <h3 style={{ fontSize: 18, color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 13.5, maxWidth: 380, textAlign: 'center', lineHeight: 1.5 }}>{sub}</p>
      </div>
    </div>
  );
}
