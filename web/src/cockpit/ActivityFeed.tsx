import { Avatar } from '../components/Avatar';
import { TONE_COLOR } from '../data/meta';
import type { FeedItem } from '../types';

export interface ActivityFeedProps {
  feed: FeedItem[];
  onSelect: (id: string) => void;
  compact?: boolean;
}

export function ActivityFeed({ feed, onSelect, compact }: ActivityFeedProps) {
  return (
    <div className="col" style={{ height: '100%' }}>
      <div
        className="row"
        style={{ justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <div className="row gap-2">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 0 3px var(--success-50)' }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Bu gün diqqət tələb edənlər</span>
        </div>
        <span className="badge badge-neutral">{feed.length} hadisə</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: compact ? '8px' : '8px 12px' }}>
        {feed.map((f, i) => (
          <button
            key={i}
            onClick={() => onSelect(f.id)}
            className="row"
            style={{ width: '100%', gap: 10, padding: '8px 10px', borderRadius: 8, border: 0, background: 'none', textAlign: 'left', transition: 'background .12s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', width: 38, flexShrink: 0 }}>
              {f.t}
            </span>
            <Avatar actor={f.actor} size={22} />
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{f.text}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: TONE_COLOR[f.tone] ?? '#64748B', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}
