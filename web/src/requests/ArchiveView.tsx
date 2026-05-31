// ============================================================
// Arxiv — Rəqəmsal hesabatlılıq: BÜTÜN müraciətlər (hər status,
// arxivləşmiş və ləğv edilmiş daxil). archive.jsx-in birəbir portu.
// ============================================================
import { useEffect, useState } from 'react';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { LIFECYCLE, STATUS_META } from '../data/meta';
import { useApp, useActors } from '../context/AppContext';
import { api } from '../api/client';
import type { Incident } from '../types';

export function ArchiveView() {
  const { openIncident } = useApp();
  const actors = useActors();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .incidents()
      .then((list) => { if (alive) setIncidents(list); })
      .catch((e) => console.warn('arxiv yüklənmədi:', e));
    return () => { alive = false; };
  }, []);

  const all = incidents;
  const statusList = [...LIFECYCLE.map((s) => s.id), 'cancelled'];
  const cnt = (st: string) => all.filter((i) => i.status === st).length;

  let rows = all;
  if (fStatus) rows = rows.filter((i) => i.status === fStatus);
  if (q.trim()) {
    const s = q.toLowerCase();
    rows = rows.filter((i) => (i.title + i.id + i.addr + i.reg + i.cat).toLowerCase().includes(s));
  }

  const kpis = [
    { label: 'Ümumi müraciət', val: all.length, c: '#0EA5E9', ic: 'database' },
    { label: 'Aktiv', val: all.filter((i) => !['archived', 'cancelled', 'resolved'].includes(i.status)).length, c: '#F59E0B', ic: 'activity' },
    { label: 'Həll / Arxiv', val: all.filter((i) => ['archived', 'resolved'].includes(i.status)).length, c: '#10B981', ic: 'circle-check' },
    { label: 'Ləğv edilmiş', val: cnt('cancelled'), c: '#EF4444', ic: 'circle-x' },
  ];

  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      {/* Header + KPIs */}
      <div className="col" style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="col" style={{ gap: 3 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Arxiv — Rəqəmsal hesabatlılıq</h2>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Bütün müraciətlər hər statusda burada toplanır və dəyişməz qeyd kimi saxlanır.</span>
          </div>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={14} />Hesabat (CSV)</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
          {kpis.map((k) => (
            <div key={k.label} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: k.c + '1a', color: k.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={k.ic} size={17} /></span>
              <div className="col" style={{ gap: 1 }}>
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>{k.val}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{k.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="row" style={{ gap: 8, padding: '0 20px 12px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 9, color: 'var(--slate-400)' }} />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Arxivdə axtar (ID, ünvan, kateqoriya)…" style={{ paddingLeft: 34, height: 34, fontSize: 12.5 }} />
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button onClick={() => setFStatus(null)} className="badge" style={{ cursor: 'pointer', background: !fStatus ? 'var(--slate-900)' : 'var(--slate-100)', color: !fStatus ? '#fff' : 'var(--slate-600)' }}>Hamısı</button>
          {statusList.map((st) => {
            const meta = STATUS_META[st];
            const c = cnt(st);
            if (!c) return null;
            const active = fStatus === st;
            return (
              <button key={st} onClick={() => setFStatus(active ? null : st)} className="badge" style={{ cursor: 'pointer', background: active ? meta.color : meta.color + '1a', color: active ? '#fff' : meta.color }}>
                <span className="dot" style={{ background: active ? '#fff' : meta.color }} />
                {meta.label} {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0, borderTop: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              {['ID', 'Reyestr', 'Status', 'Müraciət', 'Kateqoriya', 'İcraçı', 'Tarix'].map((h, i) => (
                <th key={i} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => openIncident(r)}
                style={{ cursor: 'pointer', borderBottom: '1px solid var(--slate-100)', opacity: ['archived', 'cancelled'].includes(r.status) ? 0.78 : 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '10px 16px' }}><span className="mono" style={{ fontSize: 11.5, color: 'var(--accent-600)', fontWeight: 600 }}>{r.id}</span></td>
                <td style={{ padding: '10px 16px' }}><span className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.reg}</span></td>
                <td style={{ padding: '10px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '10px 16px', maxWidth: 300 }}>
                  <div className="row gap-2">
                    <PriorityBadge p={r.priority} />
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', color: 'var(--text-2)', fontSize: 12 }}>{r.cat}</td>
                <td style={{ padding: '10px 16px' }}>
                  {r.assignee && actors[r.assignee] ? (
                    <div className="row gap-2">
                      <Avatar actor={r.assignee} size={20} />
                      <span style={{ fontSize: 12 }}>{actors[r.assignee].name.split(' ')[0]}</span>
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={{ padding: '10px 16px', whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: 12 }}>{r.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="col" style={{ alignItems: 'center', padding: 50, gap: 8, color: 'var(--muted)' }}>
            <Icon name="archive-x" size={26} />
            <span style={{ fontSize: 13 }}>Bu filtrə uyğun qeyd yoxdur.</span>
          </div>
        )}
      </div>
      <div className="row" style={{ padding: '9px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{rows.length} qeyd · dəyişməz audit jurnalı</div>
    </div>
  );
}
