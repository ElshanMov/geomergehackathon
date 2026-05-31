import { useState } from 'react';
import { Icon } from '../lib/icon';
import { PR_COLOR } from '../data/meta';
import type { Incident } from '../types';

export interface SearchBoxProps {
  incidents: Incident[];
  onSelect: (inc: Incident) => void;
}

export function SearchBox({ incidents, onSelect }: SearchBoxProps) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const res = q.trim()
    ? incidents
        .filter((i) => (i.title + i.id + i.addr + i.cat + i.reg).toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6)
    : [];
  return (
    <div style={{ position: 'relative', minWidth: 280 }}>
      <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 9, color: 'var(--slate-400)', zIndex: 1 }} />
      <input
        className="input cockpit-search-input"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        placeholder="Ünvan, ID və ya açar söz axtar…"
        style={{ paddingLeft: 34, height: 34, fontSize: 12.5 }}
      />
      {open && q.trim() && (
        <div
          className="card"
          style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1200, boxShadow: 'var(--shadow-xl)', overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}
        >
          {res.length === 0 && <div style={{ padding: '14px 14px', fontSize: 12.5, color: 'var(--muted)' }}>Nəticə yoxdur.</div>}
          {res.map((r) => (
            <button
              key={r.id}
              onMouseDown={() => {
                onSelect(r);
                setQ('');
                setOpen(false);
              }}
              className="row"
              style={{ width: '100%', gap: 10, padding: '9px 12px', border: 0, borderBottom: '1px solid var(--slate-100)', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: PR_COLOR[r.priority] }} />
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.addr}</span>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent-600)' }}>
                {r.id}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
