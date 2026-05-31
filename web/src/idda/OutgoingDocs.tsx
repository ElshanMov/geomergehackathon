// ============================================================
// Göndərilən sənədlər — İDDA Gateway sənədləri (gedən sənəd axını).
// İki növ: (a) müstəqil şəkildə digər qurumlara göndərilən,
//          (b) müraciətə cavab olaraq əlaqəli şəxsə (vətəndaşa) göndərilən.
// Mənbə: GET /api/idda. Detal panelində status izləmə (timeline).
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../lib/icon';
import { api } from '../api/client';
import type { IddaDocument } from '../types';

// İDDA status → etiket + rəng (org-to-org və vətəndaş axını üçün ortaq)
const IDDA_STATUS: Record<string, { label: string; color: string }> = {
  SENT: { label: 'Göndərildi', color: '#3B82F6' },
  RECEIVED: { label: 'Qəbul edildi', color: '#0EA5E9' },
  IN_GENERAL_DEPT: { label: 'Ümumi şöbədə', color: '#8B5CF6' },
  ASSIGNED: { label: 'Təyin edildi', color: '#A855F7' },
  IN_PROGRESS: { label: 'İcrada', color: '#F97316' },
  RESOLVED: { label: 'Həll edildi', color: '#10B981' },
  ARCHIVED: { label: 'Arxivləşdirildi', color: '#94A3B8' },
};

// Alıcı növü → etiket + ikon + rəng
const RCPT: Record<string, { label: string; icon: string; color: string }> = {
  org: { label: 'Quruma', icon: 'building-2', color: '#3B82F6' },
  person: { label: 'Vətəndaşa', icon: 'user', color: '#10B981' },
};

function rcptOf(d: IddaDocument) {
  return RCPT[d.recipientType] ?? RCPT.org;
}

function StatusChip({ status }: { status: string }) {
  const m = IDDA_STATUS[status] ?? { label: status, color: '#64748B' };
  return (
    <span className="row gap-1" style={{ fontSize: 11.5, fontWeight: 600, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
      {m.label}
    </span>
  );
}

function SignatureBadge({ type }: { type: string }) {
  const asan = type === 'ASAN';
  return (
    <span
      className="badge"
      style={{
        gap: 4,
        background: asan ? 'var(--accent-50)' : 'var(--success-50)',
        color: asan ? 'var(--accent-600)' : 'var(--success)',
        fontWeight: 600,
      }}
    >
      <Icon name="shield-check" size={11} />
      {type}
    </span>
  );
}

interface FilterItem {
  key: string;
  label: string;
  color?: string;
  icon?: string;
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
            {it.icon ? (
              <Icon name={it.icon} size={14} style={{ color: it.color || 'var(--slate-400)' }} />
            ) : (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.color || 'var(--slate-300)' }} />
            )}
            <span style={{ flex: 1 }}>{it.label}</span>
            <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{it.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Detal paneli (sağdan açılan) — sənəd + status jurnalı ──
function IddaDetailDrawer({ doc, onClose }: { doc: IddaDocument; onClose: () => void }) {
  const r = rcptOf(doc);
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.28)', zIndex: 1400, animation: 'fadeIn .2s ease' }} />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(540px, 96vw)',
          background: 'var(--surface)',
          zIndex: 1401,
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerIn .3s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
            <div className="col" style={{ gap: 5, minWidth: 0 }}>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent-600)', fontWeight: 600 }}>{doc.id}</span>
                <span className="badge" style={{ gap: 4, background: r.color + '14', color: r.color, fontWeight: 600 }}>
                  <Icon name={r.icon} size={11} />
                  {r.label}
                </span>
                <StatusChip status={doc.status} />
              </div>
              <h3 style={{ fontSize: 16, lineHeight: 1.3 }}>{doc.subject}</h3>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Meta */}
          <div className="card" style={{ padding: 14, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="row gap-2" style={{ fontSize: 13 }}>
              <Icon name={r.icon} size={15} style={{ color: r.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--muted)' }}>Alıcı:</span>
              <span style={{ fontWeight: 600 }}>{doc.recipientOrg}</span>
            </div>
            <div className="row gap-2" style={{ fontSize: 13 }}>
              <Icon name="user-check" size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span style={{ color: 'var(--muted)' }}>Göndərən:</span>
              <span style={{ fontWeight: 600 }}>{doc.sender}</span>
            </div>
            <div className="row gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <SignatureBadge type={doc.signatureType} />
              <span className="row gap-1" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                <Icon name="calendar" size={13} />
                {doc.createdAt}
              </span>
              {doc.incidentId && (
                <span className="row gap-1" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  <Icon name="link" size={13} />
                  Əlaqəli müraciət <span className="mono" style={{ color: 'var(--accent-600)', fontWeight: 600 }}>{doc.incidentId}</span>
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="col gap-2">
            <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>Sənəd mətni</span>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{doc.content}</p>
          </div>

          {/* Timeline */}
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>Status jurnalı</span>
              <span className="badge badge-neutral">{doc.timeline.length} addım</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[...doc.timeline].reverse().map((ev, i, arr) => {
                const st = IDDA_STATUS[ev.status] ?? { label: ev.status, color: '#64748B' };
                return (
                  <div key={i} className="row" style={{ gap: 12, alignItems: 'stretch' }}>
                    <div className="col" style={{ alignItems: 'center', width: 28, flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: st.color, marginTop: 4, boxShadow: '0 0 0 3px ' + st.color + '22' }} />
                      {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '2px 0' }} />}
                    </div>
                    <div className="col" style={{ gap: 3, paddingBottom: 16, minWidth: 0 }}>
                      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{st.label}</span>
                        <span className="mono muted" style={{ fontSize: 11 }}>{ev.t}</span>
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{ev.actor}</span>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{ev.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function OutgoingDocs() {
  const [docs, setDocs] = useState<IddaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [fType, setFType] = useState<string | null>(null);
  const [fStatus, setFStatus] = useState<string | null>(null);
  const [open, setOpen] = useState<IddaDocument | null>(null);

  const load = () => {
    setLoading(true);
    api
      .idda()
      .then((list) => setDocs(list))
      .catch((e) => console.warn('İDDA sənədləri yüklənmədi:', e))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const statuses = useMemo(() => [...new Set(docs.map((d) => d.status))], [docs]);

  let rows = docs;
  if (fType) rows = rows.filter((d) => (d.recipientType || 'org') === fType);
  if (fStatus) rows = rows.filter((d) => d.status === fStatus);
  if (q.trim()) {
    const s = q.toLowerCase();
    rows = rows.filter((d) => (d.subject + d.id + d.recipientOrg + (d.incidentId ?? '')).toLowerCase().includes(s));
  }

  const cntType = (t: string) => docs.filter((d) => (d.recipientType || 'org') === t).length;
  const cntStatus = (s: string) => docs.filter((d) => d.status === s).length;

  const pills: [string, string, () => void][] = [];
  if (fType) pills.push(['type', RCPT[fType]?.label ?? fType, () => setFType(null)]);
  if (fStatus) pills.push(['status', IDDA_STATUS[fStatus]?.label ?? fStatus, () => setFStatus(null)]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', height: '100%', minHeight: 0 }}>
      {/* Filter sidebar */}
      <div className="col" style={{ gap: 14, padding: '16px 12px', borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto' }}>
        <FilterGroup
          title="Alıcı növü"
          val={fType}
          set={setFType}
          items={[
            { key: 'org', label: RCPT.org.label, icon: RCPT.org.icon, color: RCPT.org.color, count: cntType('org') },
            { key: 'person', label: RCPT.person.label, icon: RCPT.person.icon, color: RCPT.person.color, count: cntType('person') },
          ]}
        />
        <hr className="divider" />
        <FilterGroup
          title="Status"
          val={fStatus}
          set={setFStatus}
          items={statuses.map((s) => ({ key: s, label: IDDA_STATUS[s]?.label ?? s, color: IDDA_STATUS[s]?.color, count: cntStatus(s) }))}
        />
      </div>

      {/* Table area */}
      <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 9, color: 'var(--slate-400)' }} />
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sənədlərdə axtar…" style={{ paddingLeft: 34, height: 34, fontSize: 12.5 }} />
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
          <div className="row gap-3">
            <button className="btn btn-secondary btn-sm" onClick={load} title="Yenilə"><Icon name="refresh-cw" size={14} />Yenilə</button>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{rows.length} sənəd</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                {['ID', 'Status', 'Mövzu', 'Alıcı', 'İmza', 'Tarix', 'Əlaqəli'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const r = rcptOf(d);
                return (
                  <tr
                    key={d.id}
                    onClick={() => setOpen(d)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--slate-100)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '10px 14px' }}><span className="mono" style={{ fontSize: 11.5, color: 'var(--accent-600)', fontWeight: 600 }}>{d.id}</span></td>
                    <td style={{ padding: '10px 14px' }}><StatusChip status={d.status} /></td>
                    <td style={{ padding: '10px 14px', maxWidth: 360 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.subject}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div className="row gap-2">
                        <span style={{ width: 24, height: 24, borderRadius: 7, background: r.color + '18', color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={r.icon} size={13} />
                        </span>
                        <div className="col" style={{ gap: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{d.recipientOrg}</span>
                          <span style={{ fontSize: 10.5, color: r.color, fontWeight: 600 }}>{r.label}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}><SignatureBadge type={d.signatureType} /></td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: 12 }}>{d.createdAt}</td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {d.incidentId ? (
                        <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{d.incidentId}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && rows.length === 0 && (
            <div className="col" style={{ alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--muted)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={24} /></div>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Sənəd tapılmadı</span>
              <span style={{ fontSize: 13 }}>Filtrləri dəyişin və ya axtarışı təmizləyin.</span>
            </div>
          )}
        </div>
      </div>

      {open && <IddaDetailDrawer doc={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
