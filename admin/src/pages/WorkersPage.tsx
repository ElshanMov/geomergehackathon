// Admin → İşçilər (CRUD). RİH əməkdaşları / sahə nümayəndələri.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Worker } from '../types';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, FormGrid } from '../components/Field';
import { PageHeader, SearchInput } from '../components/PageBits';
import { useToast } from '../components/Toast';

const STATUS: [string, string][] = [
  ['active', 'Aktiv'],
  ['leave', 'Məzuniyyət'],
  ['inactive', 'Qeyri-aktiv'],
];
const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS);
const STATUS_BADGE: Record<string, string> = { active: 'badge-success', leave: 'badge-high', inactive: 'badge-neutral' };

const PALETTE = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];
const colorFor = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

const EMPTY: Partial<Worker> = {
  fullName: '',
  position: '',
  department: '',
  phone: '',
  email: '',
  zone: '',
  status: 'active',
  openTasks: 0,
};

export function WorkersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Worker[]>([]);
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('');
  const [deptF, setDeptF] = useState('');
  const [editing, setEditing] = useState<Partial<Worker> | null>(null);
  const [deleting, setDeleting] = useState<Worker | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => api.workers().then(setRows).catch((e) => console.warn('işçilər yüklənmədi:', e));
  useEffect(() => {
    reload();
  }, []);

  const departments = useMemo(() => Array.from(new Set(rows.map((w) => w.department).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((w) => {
        if (statusF && w.status !== statusF) return false;
        if (deptF && w.department !== deptF) return false;
        if (q) {
          const s = q.toLowerCase();
          if (![w.fullName, w.position, w.department, w.email, w.zone, w.phone].some((x) => x.toLowerCase().includes(s))) return false;
        }
        return true;
      }),
    [rows, q, statusF, deptF],
  );

  const set = (patch: Partial<Worker>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  const save = async () => {
    if (!editing) return;
    if (!editing.fullName?.trim() || !editing.position?.trim()) {
      toast.push('Ad Soyad və vəzifə tələb olunur', 'error');
      return;
    }
    setBusy(true);
    try {
      if (editing.id) {
        await api.updateWorker(editing.id, editing);
        toast.push('İşçi yeniləndi');
      } else {
        await api.createWorker({ ...editing, color: colorFor(editing.fullName ?? '') });
        toast.push('İşçi əlavə olundu');
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
      await api.deleteWorker(deleting.id);
      toast.push('İşçi silindi');
      setDeleting(null);
      await reload();
    } catch (e) {
      toast.push('Silinmə alınmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Worker>[] = [
    {
      key: 'name',
      header: 'Əməkdaş',
      render: (w) => (
        <div className="row gap-2">
          <Avatar init={w.init} color={w.color} />
          <div className="col">
            <span style={{ fontWeight: 600, fontSize: 13 }}>{w.fullName}</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{w.position}</span>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Şöbə', render: (w) => <span style={{ fontSize: 12.5 }}>{w.department}</span> },
    { key: 'zone', header: 'Ərazi / Zona', render: (w) => <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{w.zone}</span> },
    { key: 'phone', header: 'Telefon', render: (w) => <span className="mono" style={{ fontSize: 12 }}>{w.phone}</span> },
    {
      key: 'openTasks',
      header: 'Açıq tapşırıq',
      align: 'center',
      render: (w) =>
        w.openTasks > 0 ? (
          <span className="badge badge-accent">{w.openTasks}</span>
        ) : (
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>0</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (w) => <span className={'badge ' + (STATUS_BADGE[w.status] ?? 'badge-neutral')}>{STATUS_LABEL[w.status] ?? w.status}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '92px',
      render: (w) => (
        <div className="row gap-1" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-icon" title="Redaktə et" onClick={() => setEditing(w)}>
            <Icon name="pencil" size={15} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Sil" onClick={() => setDeleting(w)}>
            <Icon name="trash-2" size={15} color="var(--danger)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="col gap-4">
      <PageHeader
        title="İşçilər"
        subtitle={`${rows.length} əməkdaş · sahə nümayəndələri və şöbə işçiləri`}
        action={
          <button className="btn btn-accent" onClick={() => setEditing({ ...EMPTY })}>
            <Icon name="plus" size={16} />
            Yeni işçi
          </button>
        }
      />

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <SearchInput value={q} onChange={setQ} placeholder="Ad, vəzifə, şöbə, ərazi…" />
        <select className="select" style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">Bütün statuslar</option>
          {STATUS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="select" style={{ width: 'auto' }} value={deptF} onChange={(e) => setDeptF(e.target.value)}>
          <option value="">Bütün şöbələr</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} empty="İşçi tapılmadı" />

      {editing && (
        <Modal
          title={editing.id ? 'İşçini redaktə et' : 'Yeni işçi'}
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
            <Field label="Ad Soyad">
              <input className="input" value={editing.fullName ?? ''} onChange={(e) => set({ fullName: e.target.value })} autoFocus />
            </Field>
            <Field label="Vəzifə">
              <input className="input" value={editing.position ?? ''} onChange={(e) => set({ position: e.target.value })} />
            </Field>
            <Field label="Şöbə">
              <input className="input" value={editing.department ?? ''} onChange={(e) => set({ department: e.target.value })} />
            </Field>
            <Field label="Ərazi / Zona">
              <input className="input" value={editing.zone ?? ''} onChange={(e) => set({ zone: e.target.value })} />
            </Field>
            <Field label="Telefon">
              <input className="input" value={editing.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="E-poçt">
              <input className="input" value={editing.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className="select" value={editing.status ?? 'active'} onChange={(e) => set({ status: e.target.value })}>
                {STATUS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Açıq tapşırıqlar">
              <input
                className="input mono"
                type="number"
                min={0}
                value={editing.openTasks ?? 0}
                onChange={(e) => set({ openTasks: Math.max(0, Number(e.target.value) || 0) })}
              />
            </Field>
          </FormGrid>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="İşçini sil"
          message={`"${deleting.fullName}" (${deleting.position}) əməkdaşını silmək istədiyinizə əminsiniz?`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
