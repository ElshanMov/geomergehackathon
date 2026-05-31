export type Variant = 'A' | 'B' | 'C';

const OPTS: [Variant, string][] = [
  ['A', 'Klassik'],
  ['B', 'Fokus xəritə'],
  ['C', 'Bölünmüş'],
];

export function VariantSwitch({ variant, setVariant }: { variant: Variant; setVariant: (v: Variant) => void }) {
  return (
    <div className="row" style={{ gap: 0, background: 'var(--slate-100)', borderRadius: 8, padding: 3 }}>
      {OPTS.map(([id, lbl]) => (
        <button
          key={id}
          onClick={() => setVariant(id)}
          style={{
            border: 0,
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            background: variant === id ? 'var(--surface)' : 'transparent',
            color: variant === id ? 'var(--text)' : 'var(--muted)',
            boxShadow: variant === id ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}
