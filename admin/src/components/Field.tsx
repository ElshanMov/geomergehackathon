// Form sahə köməkçiləri — etiketli sahə + 2 sütunlu grid.
import type { ReactNode } from 'react';

export function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className="col" style={{ gap: 6, gridColumn: full ? '1 / -1' : undefined }}>
      <span className="label" style={{ marginBottom: 0 }}>{label}</span>
      {children}
    </label>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>;
}
