// Admin → Nameklatur (CRUD). Hər nameklaturun BİR marşrutu var (1:1 RouteId).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Nomenclature, Route } from '../types';
import { Icon } from '../lib/icon';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, FormGrid } from '../components/Field';
import { PageHeader, SearchInput } from '../components/PageBits';
import { useToast } from '../components/Toast';

const PRIORITIES: [string, string][] = [
  ['urgent', 'Təcili'],
  ['high', 'Yüksək'],
  ['normal', 'Normal'],
  ['low', 'Aşağı'],
];
const PRIORITY_LABEL: Record<string, string> = Object.fromEntries(PRIORITIES);
const PRIORITY_BADGE: Record<string, string> = { urgent: 'badge-urgent', high: 'badge-high', normal: 'badge-normal', low: 'badge-low' };

const EMPTY: Partial<Nomenclature> = {
  code: '',
  name: '',
  group: '',
  defaultPriority: 'normal',
  slaHours: 48,
  routeId: '',
  description: '',
  active: true,
};

export function NomenclaturesPage() {
  const toast = useToast();
  const nav = useNavigate();
  const [rows, setRows] = useState<Nomenclature[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [q, setQ] = useState('');
  const [groupF, setGroupF] = useState('');
  const [editing, setEditing] = useState<Partial<Nomenclature> | null>(null);
  const [deleting, setDeleting] = useState<Nomenclature | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    api.nomenclatures().then(setRows).catch((e) => console.warn('nameklatur yüklənmədi:', e));
    api.routes().then(setRoutes).catch((e) => console.warn('marşrutlar yüklənmədi:', e));
  };
  useEffect(() => {
    reload();
  }, []);

  const routeName = (id?: string | null) => routes.find((r) => r.id === id)?.name ?? null;
  const groups = useMemo(() => Array.from(new Set(rows.map((n) => n.group).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((n) => {
        if (groupF && n.group !== groupF) return false;
        if (q) {
          const s = q.toLowerCase();
          if (![n.code, n.name, n.group, n.description].some((x) => x.toLowerCase().includes(s))) return false;
        }
        return true;
      }),
    [rows, q, groupF],
  );

  const set = (patch: Partial<Nomenclature>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  const save = async () => {
    if (!editing) return;
    if (!editing.code?.trim() || !editing.name?.trim()) {
      toast.push('Kod və ad tələb olunur', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...editing, routeId: editing.routeId ? editing.routeId : null };
      if (editing.id) {
        await api.updateNomenclature(editing.id, payload);
        toast.push('Təsnifat yeniləndi');
      } else {
        await api.createNomenclature(payload);
        toast.push('Təsnifat yaradıldı');
      }
      setEditing(null);
      await reload();
    } catch (e) {
      toast.push('Əməliyyat alınmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteNomenclature(deleting.id);
      toast.push('Təsnifat silindi');
      setDeleting(null);
      await reload();
    } catch (e) {
      toast.push('Silinmə alınmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Nomenclature>[] = [
    {
      key: 'code',
      header: 'Kod',
      width: '108px',
      render: (n) => <span className="badge badge-neutral mono" style={{ fontSize: 11 }}>{n.code}</span>,
    },
    {
      key: 'name',
      header: 'Ad',
      render: (n) => (
        <div className="col">
          <span style={{ fontWeight: 600, fontSize: 13 }}>{n.name}</span>
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{n.group}</span>
        </div>
      ),
    },
    {
      key: 'defaultPriority',
      header: 'Prioritet',
      render: (n) => <span className={'badge ' + (PRIORITY_BADGE[n.defaultPriority] ?? 'badge-neutral')}>{PRIORITY_LABEL[n.defaultPriority] ?? n.defaultPriority}</span>,
    },
    { key: 'slaHours', header: 'SLA', align: 'center', render: (n) => <span className="mono" style={{ fontSize: 12 }}>{n.slaHours} saat</span> },
    {
      key: 'routeId',
      header: 'Marşrut',
      render: (n) =>
        n.routeId && routeName(n.routeId) ? (
          <button
            className="btn btn-ghost btn-sm row gap-1"
            style={{ padding: '4px 8px', color: 'var(--accent-600)' }}
            onClick={() => nav(`/routes/${n.routeId}`)}
            title="Marşrutu redaktə et"
          >
            <Icon name="workflow" size={13} />
            {routeName(n.routeId)}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
        ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (n) => <span className={'badge ' + (n.active ? 'badge-success' : 'badge-low')}>{n.active ? 'Aktiv' : 'Deaktiv'}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '92px',
      render: (n) => (
        <div className="row gap-1" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-icon" title="Redaktə et" onClick={() => setEditing(n)}>
            <Icon name="pencil" size={15} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Sil" onClick={() => setDeleting(n)}>
            <Icon name="trash-2" size={15} color="var(--danger)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="col gap-4">
      <PageHeader
        title="Təsnifat"
        subtitle={`${rows.length} təsnifat · hər biri bir marşruta bağlıdır`}
        action={
          <button className="btn btn-accent" onClick={() => setEditing({ ...EMPTY })}>
            <Icon name="plus" size={16} />
            Yeni nameklatur
          </button>
        }
      />

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <SearchInput value={q} onChange={setQ} placeholder="Kod, ad, qrup…" />
        <select className="select" style={{ width: 'auto' }} value={groupF} onChange={(e) => setGroupF(e.target.value)}>
          <option value="">Bütün qruplar</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} empty="Təsnifat tapılmadı" />

      {editing && (
        <Modal
          title={editing.id ? 'Təsnifatı redaktə et' : 'Yeni təsnifat'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>
                Ləğv et
              </button>
              <button className="btn btn-accent" onClick={save} disabled={busy}>
                {busy ? 'Saxlanılır…' : 'Saxla'}
              </button>
            </>
          }
        >
          <FormGrid>
            <Field label="Kod">
              <input className="input mono" value={editing.code ?? ''} onChange={(e) => set({ code: e.target.value })} placeholder="KOM-SU" autoFocus />
            </Field>
            <Field label="Qrup">
              <input className="input" value={editing.group ?? ''} onChange={(e) => set({ group: e.target.value })} placeholder="Kommunal" />
            </Field>
            <Field label="Ad" full>
              <input className="input" value={editing.name ?? ''} onChange={(e) => set({ name: e.target.value })} placeholder="Kommunal / Su təchizatı" />
            </Field>
            <Field label="Standart prioritet">
              <select className="select" value={editing.defaultPriority ?? 'normal'} onChange={(e) => set({ defaultPriority: e.target.value })}>
                {PRIORITIES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="SLA (saat)">
              <input
                className="input mono"
                type="number"
                min={1}
                value={editing.slaHours ?? 48}
                onChange={(e) => set({ slaHours: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Field>
            <Field label="Bağlı marşrut" full>
              <select className="select" value={editing.routeId ?? ''} onChange={(e) => set({ routeId: e.target.value })}>
                <option value="">— Marşrut seçilməyib —</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Təsvir" full>
              <textarea className="textarea" rows={2} value={editing.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <Field label="Vəziyyət">
              <label className="row gap-2" style={{ fontSize: 13, color: 'var(--text-2)', height: 38 }}>
                <input type="checkbox" checked={!!editing.active} onChange={(e) => set({ active: e.target.checked })} />
                Aktiv
              </label>
            </Field>
          </FormGrid>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Təsnifatı sil"
          message={`"${deleting.name}" (${deleting.code}) təsnifatını silmək istədiyinizə əminsiniz?`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
