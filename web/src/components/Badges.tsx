import { PRIORITY_META, STATUS_META } from '../data/meta';
import type { Priority } from '../types';

export function PriorityBadge({ p }: { p: Priority }) {
  const m = PRIORITY_META[p] ?? PRIORITY_META.normal;
  return (
    <span className={'badge ' + m.cls}>
      <span className="dot" />
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: '#64748B' };
  return (
    <span className="badge" style={{ background: meta.color + '1a', color: meta.color }}>
      <span className="dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}
