import { Sparkline } from '../components/Sparkline';

export function TrafficChip({ traffic }: { traffic: number[] }) {
  return (
    <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>Trafik indeksi</span>
        <span className="row gap-1" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.02em' }}>
          64<span style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 700 }}>orta</span>
        </span>
      </div>
      <Sparkline data={traffic} color="#F97316" w={84} h={28} />
    </div>
  );
}
