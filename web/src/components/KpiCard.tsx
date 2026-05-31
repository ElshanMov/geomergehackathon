import { Icon } from '../lib/icon';
import { Sparkline } from './Sparkline';
import type { Kpi } from '../types';

const TONE: Record<string, string> = {
  info: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  accent: '#0EA5E9',
  danger: '#EF4444',
};

export function KpiCard({ kpi, compact }: { kpi: Kpi; compact?: boolean }) {
  const c = TONE[kpi.tone] ?? '#0EA5E9';
  const up = kpi.delta >= 0;
  const goodUp = kpi.id !== 'sla'; // SLA breach üçün artım = pis
  const deltaColor = up === goodUp ? '#10B981' : '#EF4444';
  return (
    <div
      className="card"
      style={{
        padding: compact ? '12px 14px' : '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {kpi.label}
        </span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: deltaColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} size={13} />
          {Math.abs(kpi.delta)}
          {kpi.unit === '%' ? 'pp' : ''}
        </span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ fontSize: compact ? 26 : 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {kpi.value}
          {kpi.unit}
        </span>
        <Sparkline data={kpi.spark} color={c} w={compact ? 70 : 88} h={compact ? 26 : 30} />
      </div>
    </div>
  );
}
