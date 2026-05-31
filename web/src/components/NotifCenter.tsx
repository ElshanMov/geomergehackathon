import { Icon } from '../lib/icon';

const ITEMS = [
  { ic: 'droplet', c: '#EF4444', t: 'Su sızması SLA riski', s: 'NRM-24817 · 18:00 deadline', tm: '5 dəq' },
  { ic: 'scan-line', c: '#F59E0B', t: 'AI yeni qanunsuz tikinti', s: 'Fətəli Xan Xoyski 145 · 94%', tm: '23 dəq' },
  { ic: 'check', c: '#10B981', t: 'Zibil yığılması həll edildi', s: 'NRM-24813 · Elçin H.', tm: '1 saat' },
  { ic: 'send', c: '#3B82F6', t: 'İDDA: sənəd «RECEIVED»', s: 'Dövlət Şəhərsalma Komitəsi', tm: '2 saat' },
];

export function NotifCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1300 }} />
      <div
        className="card"
        style={{ position: 'absolute', top: 52, right: 110, width: 340, zIndex: 1301, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}
      >
        <div className="row" style={{ justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Bildirişlər</span>
          <span className="badge badge-urgent">4 yeni</span>
        </div>
        <div className="col">
          {ITEMS.map((n, i) => (
            <div
              key={i}
              className="row"
              style={{
                gap: 11,
                padding: '11px 14px',
                borderBottom: i < ITEMS.length - 1 ? '1px solid var(--slate-100)' : 0,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: n.c + '1a',
                  color: n.c,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={n.ic} size={15} />
              </span>
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n.t}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{n.s}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{n.tm}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
