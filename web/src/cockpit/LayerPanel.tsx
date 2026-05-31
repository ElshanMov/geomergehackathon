import { useMemo, useState } from 'react';
import { Icon } from '../lib/icon';
import type { Layer } from '../types';

function LayerRow({ layer, on, onToggle }: { layer: Layer; on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid transparent',
        background: on ? 'var(--surface)' : 'transparent',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        borderColor: on ? 'var(--border)' : 'transparent',
        transition: 'all .12s',
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: on ? layer.color + '1a' : 'var(--slate-100)',
          color: on ? layer.color : 'var(--slate-400)',
        }}
      >
        <Icon name={layer.icon} size={14} />
      </span>
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: on ? 'var(--text)' : 'var(--muted)' }}>{layer.name}</span>
      <span
        style={{
          width: 30,
          height: 18,
          borderRadius: 999,
          padding: 2,
          background: on ? 'var(--accent)' : 'var(--slate-200)',
          transition: 'all .15s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            transform: on ? 'translateX(12px)' : 'translateX(0)',
            transition: 'all .15s',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </span>
    </button>
  );
}

export interface LayerPanelProps {
  layers: Layer[];
  activeLayers: Set<string>;
  toggle: (id: string) => void;
  floating?: boolean;
}

export function LayerPanel({ layers, activeLayers, toggle, floating }: LayerPanelProps) {
  const [open, setOpen] = useState<{ operativ: boolean; elave: boolean }>({ operativ: true, elave: true });
  const operativ = useMemo(() => layers.filter((l) => l.group === 'operativ'), [layers]);
  const elave = useMemo(() => layers.filter((l) => l.group === 'elave'), [layers]);

  const Section = ({ id, title, items }: { id: 'operativ' | 'elave'; title: string; items: Layer[] }) => (
    <div>
      <button
        onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}
        className="row"
        style={{ width: '100%', justifyContent: 'space-between', padding: '6px 8px', background: 'none', border: 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{title}</span>
        <Icon name={open[id] ? 'chevron-down' : 'chevron-right'} size={14} style={{ color: 'var(--slate-400)' }} />
      </button>
      {open[id] && (
        <div className="col" style={{ gap: 2 }}>
          {items.map((l) => (
            <LayerRow key={l.id} layer={l} on={activeLayers.has(l.id)} onToggle={() => toggle(l.id)} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="col"
      style={{
        gap: 14,
        padding: floating ? 14 : '14px 12px',
        height: '100%',
        overflowY: 'auto',
        background: floating ? 'rgba(255,255,255,.92)' : 'var(--surface)',
        backdropFilter: floating ? 'blur(8px)' : 'none',
        borderRight: floating ? 'none' : '1px solid var(--border)',
        borderRadius: floating ? 14 : 0,
        boxShadow: floating ? 'var(--shadow-lg)' : 'none',
        border: floating ? '1px solid var(--border)' : undefined,
      }}
    >
      <div className="row gap-2" style={{ paddingLeft: 4 }}>
        <Icon name="layers" size={16} style={{ color: 'var(--accent-600)' }} />
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>Təbəqələr</span>
        <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
          {activeLayers.size}/{layers.length}
        </span>
      </div>
      <Section id="operativ" title="Operativ" items={operativ} />
      <Section id="elave" title="Əlavə təbəqələr" items={elave} />
    </div>
  );
}
