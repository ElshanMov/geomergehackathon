import { Icon } from '../lib/icon';
import type { Weather } from '../types';

export function WeatherChip({ weather }: { weather: Weather }) {
  return (
    <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <Icon name="cloud-sun" size={26} style={{ color: 'var(--warning)' }} />
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{weather.temp}°</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{weather.cond}</span>
      </div>
      <div className="col" style={{ gap: 3, paddingLeft: 10, marginLeft: 2, borderLeft: '1px solid var(--border)' }}>
        <span className="row gap-1" style={{ fontSize: 11, color: 'var(--info)' }}>
          <Icon name="droplet" size={11} />
          {weather.rain}%
        </span>
        <span className="row gap-1" style={{ fontSize: 11, color: 'var(--muted)' }}>
          <Icon name="wind" size={11} />
          {weather.wind} km/s
        </span>
      </div>
    </div>
  );
}
