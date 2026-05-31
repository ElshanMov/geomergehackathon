// ============================================================
// Modul C — Müraciətlər (List View). requests.jsx-in birəbir portu.
// window.NRM_* qlobalları API fetch + meta + context ilə əvəzlənib.
// onSelect → useApp().openIncident (drawer + xəritə fly-to).
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { LIFECYCLE, PRIORITY_META, PR_COLOR, geocodeAddr } from '../data/meta';
import { useApp, useActors } from '../context/AppContext';
import { api } from '../api/client';
import { NewRequestModal } from './NewRequestModal';
import type { Incident, Priority } from '../types';

interface FilterItem {
  key: string;
  label: string;
  color?: string;
  count: number;
}

function FilterGroup({
  title,
  items,
  val,
  set,
}: {
  title: string;
  items: FilterItem[];
  val: string | null;
  set: (v: string | null) => void;
}) {
  return (
    <div className="col" style={{ gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', padding: '4px 8px' }}>{title}</span>
      {items.map((it) => {
        const active = val === it.key;
        return (
          <button
            key={it.key}
            onClick={() => set(active ? null : it.key)}
            className="row"
            style={{
              gap: 8,
              padding: '7px 8px',
              borderRadius: 7,
              border: 0,
              textAlign: 'left',
              width: '100%',
              background: active ? 'var(--accent-50)' : 'none',
              color: active ? 'var(--accent-600)' : 'var(--text-2)',
              fontWeight: active ? 600 : 500,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.color || 'var(--slate-300)' }} />
            <span style={{ flex: 1 }}>{it.label}</span>
            <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{it.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RequestsList() {
  const { openIncident } = useApp();
  const actors = useActors();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState<string | null>(null);
  const [fPrio, setFPrio] = useState<string | null>(null);
  const [fCat, setFCat] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [createdToast, setCreatedToast] = useState('');

  const reload = useCallback(async () => {
    try {
      const list = await api.incidents();
      setIncidents(list);
    } catch (e) {
      console.warn('müraciətlər yüklənmədi:', e);
    }
  }, []);

  // İlk yüklə + canlı sinxron: hər 7 saniyədə bir refetch (web/mobil/admin
  // dəyişiklikləri data grid-də öz əksini tapsın).
  useEffect(() => {
    reload();
    const t = setInterval(reload, 7000);
    return () => clearInterval(t);
  }, [reload]);

  const cats = [...new Set(incidents.map((i) => i.cat))];
  const statuses = LIFECYCLE.filter((s) => s.id !== 'archived');

  let rows = incidents.filter((i) => i.status !== 'archived' && i.status !== 'cancelled');
  if (fStatus) rows = rows.filter((i) => i.status === fStatus);
  if (fPrio) rows = rows.filter((i) => i.priority === fPrio);
  if (fCat) rows = rows.filter((i) => i.cat === fCat);
  if (q.trim()) {
    const s = q.toLowerCase();
    rows = rows.filter((i) => (i.title + i.id + i.addr + i.reg).toLowerCase().includes(s));
  }

  const cnt = (pred: (i: Incident) => boolean) =>
    incidents.filter((i) => i.status !== 'archived' && i.status !== 'cancelled' && pred(i)).length;

  const pills: [string, string, () => void][] = [];
  if (fStatus) pills.push(['status', statuses.find((s) => s.id === fStatus)?.label ?? '', () => setFStatus(null)]);
  if (fPrio) pills.push(['prio', PRIORITY_META[fPrio as Priority]?.label ?? '', () => setFPrio(null)]);
  if (fCat) pills.push(['cat', fCat, () => setFCat(null)]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', height: '100%', minHeight: 0 }}>
      {/* Quick filter sidebar */}
      <div className="col" style={{ gap: 14, padding: '16px 12px', borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto' }}>
        <FilterGroup
          title="Flow status"
          val={fStatus}
          set={setFStatus}
          items={statuses.map((s) => ({ key: s.id, label: s.label, color: s.color, count: cnt((i) => i.status === s.id) }))}
        />
        <hr className="divider" />
        <FilterGroup
          title="Prioritet"
          val={fPrio}
          set={setFPrio}
          items={Object.entries(PRIORITY_META).map(([k, m]) => ({ key: k, label: m.label, color: PR_COLOR[k as Priority], count: cnt((i) => i.priority === k) }))}
        />
        <hr className="divider" />
        <FilterGroup
          title="Kateqoriya"
          val={fCat}
          set={setFCat}
          items={cats.map((c) => ({ key: c, label: c.split(' / ')[1] || c, count: cnt((i) => i.cat === c) }))}
        />
      </div>

      {/* Table area */}
      <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 9, color: 'var(--slate-400)' }} />
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Müraciətlərdə axtar…" style={{ paddingLeft: 34, height: 34, fontSize: 12.5 }} />
            </div>
            {pills.map(([k, lbl, clear]) => (
              <span key={k} className="badge badge-accent" style={{ paddingRight: 4 }}>
                {lbl}
                <button onClick={clear} style={{ border: 0, background: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: 'inherit' }}>
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{rows.length} müraciət</span>
        </div>

        {/* Batch toolbar */}
        {sel.size > 0 && (
          <div className="row gap-3" style={{ padding: '10px 18px', background: 'var(--slate-900)', color: '#fff' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{sel.size} seçildi</span>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Icon name="user-plus" size={14} />Təyin et</button>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Icon name="flag" size={14} />Prioritet</button>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Icon name="send" size={14} />Gateway</button>
            <button className="btn btn-ghost btn-sm" style={{ color: '#fff', marginLeft: 'auto' }} onClick={() => setSel(new Set())}>Ləğv</button>
          </div>
        )}

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                {['', 'ID', 'Status', 'Müraciət', 'İcraçı', 'Yaradılıb', 'Deadline', 'Media'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => openIncident(r)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--slate-100)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td
                    style={{ padding: '10px 14px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSel((s) => {
                        const n = new Set(s);
                        if (n.has(r.id)) n.delete(r.id); else n.add(r.id);
                        return n;
                      });
                    }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid ' + (sel.has(r.id) ? 'var(--accent)' : 'var(--border-strong)'), background: sel.has(r.id) ? 'var(--accent)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {sel.has(r.id) && <Icon name="check" size={11} />}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}><span className="mono" style={{ fontSize: 11.5, color: 'var(--accent-600)', fontWeight: 600 }}>{r.id}</span></td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '10px 14px', maxWidth: 320 }}>
                    <div className="col" style={{ gap: 3 }}>
                      <div className="row gap-2">
                        <PriorityBadge p={r.priority} />
                        <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.addr}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {r.assignee ? (
                      <div className="row gap-2">
                        <Avatar actor={r.assignee} size={22} />
                        <span style={{ fontSize: 12 }}>{actors[r.assignee]?.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="badge badge-low">Təyin edilməyib</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: 12 }}>{r.created}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 12, color: r.sla === 'risk' ? 'var(--danger)' : 'var(--muted)', fontWeight: r.sla === 'risk' ? 600 : 400 }}>{r.due}</td>
                  <td style={{ padding: '10px 14px' }}><span className="row gap-1" style={{ color: 'var(--muted)', fontSize: 12 }}><Icon name="image" size={14} />{r.photos}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="col" style={{ alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--muted)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="search-x" size={24} /></div>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Nəticə tapılmadı</span>
              <span style={{ fontSize: 13 }}>Filtrləri dəyişin və ya axtarışı təmizləyin.</span>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="row" style={{ justifyContent: 'space-between', padding: '10px 18px', borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--muted)' }}>
          <span>{rows.length} / {incidents.length} müraciət</span>
          <div className="row gap-2">
            <button className="btn btn-secondary btn-xs" disabled><Icon name="chevron-left" size={14} />Əvvəl</button>
            <span className="row gap-1">
              {[1, 2, 3].map((p) => (
                <span key={p} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: p === 1 ? 'var(--slate-900)' : 'transparent', color: p === 1 ? '#fff' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer' }}>{p}</span>
              ))}
            </span>
            <button className="btn btn-secondary btn-xs">Sonra<Icon name="chevron-right" size={14} /></button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="btn btn-accent" style={{ position: 'absolute', right: 28, bottom: 70, borderRadius: 999, padding: '13px 20px', boxShadow: 'var(--shadow-lg)', zIndex: 20 }} onClick={() => setNewOpen(true)}>
        <Icon name="plus" size={18} />Yeni müraciət
      </button>

      {newOpen && (
        <NewRequestModal
          onClose={() => setNewOpen(false)}
          onCreate={async (d) => {
            setNewOpen(false);
            try {
              const { lng, lat } = geocodeAddr(d.addr);
              const inc = await api.createIncident({
                title: d.title,
                desc: d.desc,
                cat: d.cat || undefined,
                priority: d.prio,
                addr: d.addr,
                lng,
                lat,
                reporter: 'Operator',
              });
              await reload();
              setCreatedToast(inc.id + ' qeydiyyata alındı');
            } catch (e) {
              console.warn('müraciət yaradıla bilmədi:', e);
              setCreatedToast('Müraciət yaradıla bilmədi');
            }
            setTimeout(() => setCreatedToast(''), 3500);
          }}
        />
      )}
      {createdToast && (
        <div className="card fade-in" style={{ position: 'absolute', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 30, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-xl)' }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--success-50)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} /></span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{createdToast}</span>
        </div>
      )}
    </div>
  );
}
