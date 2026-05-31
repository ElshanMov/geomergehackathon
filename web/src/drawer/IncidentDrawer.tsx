// ============================================================
// Modul B — İncident Detail Drawer (sağdan açılan, 620px).
// 10 mərhələli status pill-ləri, foto-lent, idarəetmə əməliyyatları,
// status jurnalı (timeline) və şərhlər. drawer.jsx-in birəbir portu.
// ============================================================
import { useEffect, useState } from 'react';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { PriorityBadge } from '../components/Badges';
import { LIFECYCLE, PR_COLOR, PRIORITY_META } from '../data/meta';
import { useActors } from '../context/AppContext';
import { api } from '../api/client';
import type { Incident, Priority } from '../types';

export function LifecyclePills({ status }: { status: string }) {
  const curIdx = LIFECYCLE.findIndex((s) => s.id === status);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {LIFECYCLE.map((s, i) => {
        const done = i < curIdx;
        const cur = i === curIdx;
        return (
          <div
            key={s.id}
            title={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 9px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              background: cur ? s.color : done ? s.color + '18' : 'var(--slate-100)',
              color: cur ? '#fff' : done ? s.color : 'var(--slate-400)',
              border: '1px solid ' + (cur ? s.color : done ? s.color + '33' : 'var(--border)'),
            }}
          >
            {done && <Icon name="check" size={11} />}
            {cur && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

function PhotoSlot({ idx, label, src }: { idx: number; label?: string; src?: string }) {
  return (
    <div
      style={{
        position: 'relative',
        flex: '0 0 auto',
        width: 150,
        height: 110,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: src
          ? '#0F172A'
          : 'repeating-linear-gradient(45deg, #F1F5F9, #F1F5F9 8px, #E9EEF4 8px, #E9EEF4 16px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }}
    >
      {src ? (
        <img src={src} alt={label || 'foto'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : null}
      <span className="mono" style={{ position: 'relative', fontSize: 9.5, color: 'var(--slate-500)', background: 'rgba(255,255,255,.85)', padding: '3px 6px', margin: 6, borderRadius: 5 }}>
        {label || 'foto ' + idx}
      </span>
    </div>
  );
}

function MgmtAction({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button className="btn btn-secondary btn-sm" onClick={onClick} style={{ justifyContent: 'flex-start', color: danger ? 'var(--danger)' : undefined }}>
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

const IDDA_INSTITUTIONS = [
  'Dövlət Şəhərsalma və Arxitektura Komitəsi',
  '«Azərsu» ASC',
  '«Azərişıq» ASC',
  'Ekologiya və Təbii Sərvətlər Nazirliyi',
  'Bakı Nəqliyyat Agentliyi',
  '«Azəriqaz» İB',
];

function RouteToOrgModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (orgs: string[]) => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const toggle = (o: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(o)) n.delete(o);
      else n.add(o);
      return n;
    });
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .18s' }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 420, maxWidth: '94vw', padding: 20, boxShadow: 'var(--shadow-xl)' }}>
        <div className="row gap-2" style={{ marginBottom: 6 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-50)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="building-2" size={17} />
          </span>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Quruma yönləndir</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>İDDA Gateway servisləri ilə avtomatik çatdırılır</span>
          </div>
        </div>
        <div className="col gap-1" style={{ margin: '12px 0', maxHeight: 240, overflowY: 'auto' }}>
          {IDDA_INSTITUTIONS.map((o) => (
            <label key={o} className="row gap-2" style={{ padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: sel.has(o) ? 'var(--accent-50)' : 'transparent', border: '1px solid ' + (sel.has(o) ? 'var(--accent)' : 'var(--border)') }}>
              <input type="checkbox" checked={sel.has(o)} onChange={() => toggle(o)} />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{o}</span>
            </label>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Ləğv
          </button>
          <button className="btn btn-accent btn-sm" disabled={sel.size === 0} onClick={() => onConfirm([...sel])} style={{ opacity: sel.size ? 1 : 0.5 }}>
            <Icon name="send" size={14} />
            Göndər ({sel.size})
          </button>
        </div>
      </div>
    </div>
  );
}

// Müraciətə cavab sənədi yaradıb əlaqəli şəxsə (vətəndaşa) göndərmək — gedən sənəd (İDDA, person).
function CitizenReplyModal({
  incident,
  onClose,
  onSent,
}: {
  incident: Incident;
  onClose: () => void;
  onSent: (msg: string) => void;
}) {
  const citizen = (incident.reporter.includes('·') ? incident.reporter.split('·').pop() || incident.reporter : incident.reporter).trim();
  const [text, setText] = useState(`Hörmətli ${citizen}, ${incident.id} saylı müraciətiniz üzrə `);
  const [sig, setSig] = useState<'SIMA' | 'ASAN'>('SIMA');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await api.createIdda({
        subject: `Müraciətə cavab — ${incident.title}`,
        content: text.trim(),
        recipientOrg: citizen,
        recipientType: 'person',
        signatureType: sig,
        incidentId: incident.id,
      });
      onSent(`Cavab sənədi ${citizen} adına ${sig} ilə göndərildi`);
    } catch {
      onSent('Cavab sənədi göndərilə bilmədi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .18s' }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 460, maxWidth: '94vw', padding: 20, boxShadow: 'var(--shadow-xl)' }}>
        <div className="row gap-2" style={{ marginBottom: 12 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--success-50)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="reply" size={17} />
          </span>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Cavab sənədi göndər</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{citizen} · əlaqəli müraciət {incident.id}</span>
          </div>
        </div>
        <textarea
          className="input"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cavab mətnini yazın…"
          style={{ resize: 'vertical', marginBottom: 12 }}
        />
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div className="row gap-2">
            {(['SIMA', 'ASAN'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSig(s)}
                className="btn btn-sm"
                style={{
                  background: sig === s ? 'var(--accent-50)' : 'transparent',
                  color: sig === s ? 'var(--accent-600)' : 'var(--text-2)',
                  border: '1px solid ' + (sig === s ? 'var(--accent)' : 'var(--border)'),
                  fontWeight: 600,
                }}
              >
                <Icon name="shield-check" size={13} />
                {s}
              </button>
            ))}
          </div>
          <div className="row gap-2">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Ləğv</button>
            <button className="btn btn-accent btn-sm" disabled={!text.trim() || busy} onClick={send} style={{ opacity: !text.trim() || busy ? 0.5 : 1 }}>
              <Icon name="send" size={14} />
              {busy ? 'Göndərilir…' : 'Göndər'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const NRM_CATS = [
  'Kommunal / Su təchizatı',
  'Kommunal / Drenaj',
  'Şəhərsalma / Qanunsuz tikinti',
  'Şəhərsalma / Reklam',
  'Abadlıq / Yaşıllıq',
  'Abadlıq / İnfrastruktur',
  'Nəqliyyat / Yol infrastrukturu',
  'Təmizlik / Tullantı',
  'Sanitar / Heyvanlar',
  'İşıqlandırma',
];
const NRM_DUE_OPTS = ['Bu gün, 18:00', 'Bu gün, 20:00', 'Sabah, 12:00', 'Sabah, 17:00', '3 gün ərzində', '1 həftə ərzində'];

type PickerType = 'cat' | 'assignee' | 'priority' | 'deadline';

function PickerModal({ type, draft, onClose, onPick }: { type: PickerType; draft: Incident; onClose: () => void; onPick: (val: string | null) => void }) {
  const actors = useActors();
  const title = { cat: 'Yenidən təsnif et', assignee: 'İcraçı təyin et', priority: 'Prioritet dəyiş', deadline: 'Deadline dəyiş' }[type];
  const sub = {
    cat: 'Müraciətin kateqoriyasını dəyiş — yönləndirmə buna görə təyin olunur',
    assignee: 'Sahə icraçısı seç',
    priority: 'Təcillik səviyyəsini seç',
    deadline: 'İcra üçün son tarix',
  }[type];
  const icon = { cat: 'tag', assignee: 'user-plus', priority: 'flag', deadline: 'calendar-clock' }[type];
  // İcraçı siyahısı cockpit aktorlarından (RİH nümayəndələri) dinamik qurulur —
  // Admin Panel-də əlavə edilən təyinatçı da burada görünür.
  const reps = Object.values(actors)
    .filter((x) => x.role === 'RİH nümayəndəsi')
    .map((x) => x.id);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .18s' }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 400, maxWidth: '94vw', padding: 20, boxShadow: 'var(--shadow-xl)' }}>
        <div className="row gap-2" style={{ marginBottom: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-50)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={17} />
          </span>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</span>
          </div>
        </div>
        <div className="col gap-1" style={{ maxHeight: 280, overflowY: 'auto' }}>
          {type === 'cat' &&
            NRM_CATS.map((c) => (
              <button
                key={c}
                onClick={() => onPick(c)}
                className="row gap-2"
                style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid ' + (draft.cat === c ? 'var(--accent)' : 'var(--border)'), background: draft.cat === c ? 'var(--accent-50)' : '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}
              >
                <span style={{ flex: 1 }}>{c}</span>
                {draft.cat === c && <Icon name="check" size={14} style={{ color: 'var(--accent-600)' }} />}
              </button>
            ))}
          {type === 'assignee' &&
            [...reps, null].map((r) => {
              const act = r ? actors[r] : null;
              const active = draft.assignee === r;
              return (
                <button
                  key={r || 'none'}
                  onClick={() => onPick(r)}
                  className="row gap-2"
                  style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), background: active ? 'var(--accent-50)' : '#fff', textAlign: 'left', cursor: 'pointer' }}
                >
                  {act && r ? (
                    <Avatar actor={r} size={26} />
                  ) : (
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
                      <Icon name="user-x" size={14} />
                    </span>
                  )}
                  <div className="col" style={{ flex: 1, gap: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{act ? act.name : 'Təyinatı sil'}</span>
                    {act && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{act.role}</span>}
                  </div>
                  {active && <Icon name="check" size={14} style={{ color: 'var(--accent-600)' }} />}
                </button>
              );
            })}
          {type === 'priority' &&
            (Object.entries(PRIORITY_META) as [Priority, { label: string; cls: string }][]).map(([k, m]) => {
              const c = PR_COLOR[k];
              const active = draft.priority === k;
              return (
                <button
                  key={k}
                  onClick={() => onPick(k)}
                  className="row gap-2"
                  style={{ padding: '10px 11px', borderRadius: 8, border: '1px solid ' + (active ? c : 'var(--border)'), background: active ? c + '12' : '#fff', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                  {active && <Icon name="check" size={14} style={{ color: c }} />}
                </button>
              );
            })}
          {type === 'deadline' &&
            NRM_DUE_OPTS.map((d) => (
              <button
                key={d}
                onClick={() => onPick(d)}
                className="row gap-2"
                style={{ padding: '10px 11px', borderRadius: 8, border: '1px solid ' + (draft.due === d ? 'var(--accent)' : 'var(--border)'), background: draft.due === d ? 'var(--accent-50)' : '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                <Icon name="clock" size={14} style={{ color: 'var(--muted)' }} />
                <span style={{ flex: 1 }}>{d}</span>
                {draft.due === d && <Icon name="check" size={14} style={{ color: 'var(--accent-600)' }} />}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export interface IncidentDrawerProps {
  incident: Incident;
  onClose: () => void;
  onAction: (msg: string) => void;
}

export function IncidentDrawer({ incident, onClose, onAction }: IncidentDrawerProps) {
  const actors = useActors();
  const [tab, setTab] = useState<'internal' | 'public'>('internal');
  const [comment, setComment] = useState('');
  const [routeOpen, setRouteOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [picker, setPicker] = useState<PickerType | null>(null);
  const [draft, setDraft] = useState<Incident>(incident);
  useEffect(() => {
    setDraft(incident);
  }, [incident]);

  const a = draft.assignee ? actors[draft.assignee] : undefined;

  // Drawer İdarəetmə əməliyyatları API-yə yazılır (PATCH) — dəyişiklik həqiqi
  // qalır və polling vasitəsilə bütün siyahı/xəritələrdə əks olunur.
  const applyPick = async (val: string | null) => {
    const p = picker;
    setPicker(null);
    try {
      if (p === 'cat') {
        const u = await api.patchIncident(draft.id, { cat: val as string });
        setDraft(u);
        onAction('Yenidən təsnif edildi: ' + val);
      } else if (p === 'assignee') {
        const u = await api.patchIncident(draft.id, { assignee: val, assigneeSet: true });
        setDraft(u);
        onAction(val ? 'İcraçı təyin edildi: ' + (actors[val]?.name ?? val) : 'İcraçı təyinatı silindi');
      } else if (p === 'priority') {
        const u = await api.patchIncident(draft.id, { priority: val as string });
        setDraft(u);
        onAction('Prioritet dəyişdirildi: ' + (PRIORITY_META[val as Priority]?.label ?? val));
      } else if (p === 'deadline') {
        const u = await api.patchIncident(draft.id, { due: val as string });
        setDraft(u);
        onAction('Deadline yeniləndi: ' + val);
      }
    } catch (e) {
      console.warn('dəyişiklik saxlanılmadı:', e);
      onAction('Dəyişiklik saxlanıla bilmədi');
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.28)', zIndex: 1400, animation: 'fadeIn .2s ease' }} />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(620px, 96vw)',
          background: 'var(--surface)',
          zIndex: 1401,
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerIn .3s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
            <div className="col" style={{ gap: 4, minWidth: 0 }}>
              <div className="row gap-2">
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent-600)', fontWeight: 600 }}>
                  {incident.id}
                </span>
                <span className="mono muted" style={{ fontSize: 11.5 }}>
                  · reyestr {incident.reg}
                </span>
              </div>
              <h3 style={{ fontSize: 17, lineHeight: 1.25 }}>{incident.title}</h3>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <Icon name="x" size={18} />
            </button>
          </div>
          <LifecyclePills status={incident.status} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Meta row */}
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <PriorityBadge p={draft.priority} />
            <span className="badge badge-neutral">{draft.cat}</span>
            {incident.aiConfidence && (
              <span className="badge badge-high">
                <Icon name="scan-line" size={11} />
                AI {incident.aiConfidence}%
              </span>
            )}
            {incident.sla === 'risk' && (
              <span className="badge badge-urgent">
                <Icon name="clock" size={11} />
                SLA riski
              </span>
            )}
          </div>

          {/* Photos */}
          <div>
            <div className="row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {(incident.photoUrls && incident.photoUrls.length > 0
                ? incident.photoUrls
                : Array.from({ length: incident.photos || 1 }, () => undefined)
              ).map((src, i) => (
                <PhotoSlot key={i} idx={i + 1} label={`sahə foto ${i + 1}`} src={src} />
              ))}
              <div style={{ flex: '0 0 auto', width: 150, height: 110, borderRadius: 10, border: '1px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--muted)' }}>
                <Icon name="map" size={18} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>Xəritə thumbnail</span>
              </div>
            </div>
          </div>

          {/* Address + desc */}
          <div className="col gap-3">
            <div className="row gap-2" style={{ color: 'var(--text-2)', fontSize: 13 }}>
              <Icon name="map-pin" size={15} style={{ color: 'var(--accent-600)', flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{incident.addr}</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{incident.desc}</p>
            <div className="row gap-4" style={{ fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span className="row gap-1">
                <Icon name="user" size={13} />
                {incident.reporter}
              </span>
              <span className="row gap-1">
                <Icon name="calendar" size={13} />
                Yaradılıb {incident.created}
              </span>
              <span className="row gap-1" style={{ color: draft.sla === 'risk' ? 'var(--danger)' : 'var(--muted)' }}>
                <Icon name="flag" size={13} />
                Deadline {draft.due}
              </span>
            </div>
          </div>

          {/* Management actions */}
          <div className="card" style={{ padding: 14, background: 'var(--surface-2)' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>İdarəetmə</span>
              {a && draft.assignee && (
                <div className="row gap-2">
                  <Avatar actor={draft.assignee} size={22} />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a.name}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <MgmtAction icon="tag" label="Yenidən təsnif" onClick={() => setPicker('cat')} />
              <MgmtAction icon="user-plus" label="İcraçı təyin et" onClick={() => setPicker('assignee')} />
              <MgmtAction icon="calendar-clock" label="Deadline dəyiş" onClick={() => setPicker('deadline')} />
              <MgmtAction icon="flag" label="Prioritetləşdir" onClick={() => setPicker('priority')} />
              <MgmtAction icon="building-2" label="Quruma yönləndir" onClick={() => setRouteOpen(true)} />
              <MgmtAction icon="reply" label="Cavab sənədi" onClick={() => setReplyOpen(true)} />
              <MgmtAction
                icon="printer"
                label="Çap et"
                onClick={() => {
                  onAction('Çap pəncərəsi açıldı');
                  setTimeout(() => window.print(), 200);
                }}
              />
            </div>
          </div>

          {/* Status log timeline */}
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>Status jurnalı</span>
              <span className="badge badge-neutral">{draft.timeline.length} addım</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[...draft.timeline].reverse().map((ev, i, arr) => {
                const st = LIFECYCLE.find((s) => s.id === ev.step) ?? { label: ev.step, color: '#64748B' };
                return (
                  <div key={i} className="row" style={{ gap: 12, alignItems: 'stretch' }}>
                    <div className="col" style={{ alignItems: 'center', width: 28, flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: st.color, marginTop: 4, boxShadow: '0 0 0 3px ' + st.color + '22' }} />
                      {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '2px 0' }} />}
                    </div>
                    <div className="col" style={{ gap: 3, paddingBottom: 16, minWidth: 0 }}>
                      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{st.label}</span>
                        <span className="mono muted" style={{ fontSize: 11 }}>
                          {ev.t}
                        </span>
                      </div>
                      <div className="row gap-2">
                        <Avatar actor={ev.actor} size={18} />
                        <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{actors[ev.actor]?.name ?? ev.actor}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{ev.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="row gap-2" style={{ marginBottom: 10 }}>
              {([['internal', 'Daxili', 'lock'], ['public', 'Vətəndaşa', 'globe']] as const).map(([id, lbl, ic]) => (
                <button key={id} className={'btn btn-sm ' + (tab === id ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(id)}>
                  <Icon name={ic} size={13} />
                  {lbl}
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <Avatar actor="op1" size={28} />
              <div className="col gap-2" style={{ flex: 1 }}>
                <textarea
                  className="input"
                  rows={2}
                  placeholder={tab === 'internal' ? 'Daxili qeyd əlavə et…' : 'Vətəndaşa cavab yaz…'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <button className="btn btn-ghost btn-sm">
                    <Icon name="paperclip" size={14} />
                    Fayl
                  </button>
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => {
                      if (comment.trim()) {
                        onAction('Şərh əlavə olundu');
                        setComment('');
                      }
                    }}
                  >
                    <Icon name="send" size={14} />
                    Göndər
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {routeOpen && (
        <RouteToOrgModal
          onClose={() => setRouteOpen(false)}
          onConfirm={(orgs) => {
            setRouteOpen(false);
            Promise.all(
              orgs.map((org) =>
                api.createIdda({
                  subject: incident.title,
                  content: `${incident.addr} ünvanında qeydə alınan müraciət (${incident.id}) aidiyyəti üzrə araşdırılması və müvafiq tədbirlərin görülməsi üçün göndərilir.`,
                  recipientOrg: org,
                  recipientType: 'org',
                  signatureType: 'SIMA',
                  incidentId: incident.id,
                }),
              ),
            )
              .then(() => onAction(orgs.length + ' quruma İDDA Gateway vasitəsilə göndərildi'))
              .catch(() => onAction('Quruma göndərmə alınmadı'));
          }}
        />
      )}
      {replyOpen && (
        <CitizenReplyModal
          incident={incident}
          onClose={() => setReplyOpen(false)}
          onSent={(msg) => {
            setReplyOpen(false);
            onAction(msg);
          }}
        />
      )}
      {picker && <PickerModal type={picker} draft={draft} onClose={() => setPicker(null)} onPick={applyPick} />}
    </>
  );
}
