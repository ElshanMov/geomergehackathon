// Admin → İstifadəçilər (CRUD). Sistemə giriş hesabları.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { SystemUser } from '../types';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, FormGrid } from '../components/Field';
import { PageHeader, SearchInput } from '../components/PageBits';
import { useToast } from '../components/Toast';

const ROLES: [string, string][] = [
  ['operator', 'RİH operatoru'],
  ['representative', 'RİH nümayəndəsi'],
  ['admin', 'Administrator'],
];
const ROLE_LABEL: Record<string, string> = Object.fromEntries(ROLES);
const ROLE_BADGE: Record<string, string> = { operator: 'badge-accent', representative: 'badge-success', admin: 'badge-violet' };

const PALETTE = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];
const colorFor = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

const EMPTY: Partial<SystemUser> = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  role: 'operator',
  department: '',
  status: 'active',
  twoFactor: false,
};

export function UsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<SystemUser[]>([]);
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [editing, setEditing] = useState<Partial<SystemUser> | null>(null);
  const [deleting, setDeleting] = useState<SystemUser | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => api.users().then(setRows).catch((e) => console.warn('istifadəçilər yüklənmədi:', e));
  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((u) => {
        if (roleF && u.role !== roleF) return false;
        if (statusF && u.status !== statusF) return false;
        if (q) {
          const s = q.toLowerCase();
          if (![u.fullName, u.username, u.email, u.department].some((x) => x.toLowerCase().includes(s))) return false;
        }
        return true;
      }),
    [rows, q, roleF, statusF],
  );

  const set = (patch: Partial<SystemUser>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  const save = async () => {
    if (!editing) return;
    if (!editing.fullName?.trim() || !editing.username?.trim()) {
      toast.push('Ad Soyad və istifadəçi adı tələb olunur', 'error');
      return;
    }
    setBusy(true);
    try {
      if (editing.id) {
        await api.updateUser(editing.id, editing);
        toast.push('İstifadəçi yeniləndi');
      } else {
        await api.createUser({ ...editing, color: colorFor(editing.fullName ?? '') });
        toast.push('İstifadəçi yaradıldı');
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
      await api.deleteUser(deleting.id);
      toast.push('İstifadəçi silindi');
      setDeleting(null);
      await reload();
    } catch (e) {
      toast.push('Silinmə alınmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<SystemUser>[] = [
    {
      key: 'name',
      header: 'Ad Soyad',
      render: (u) => (
        <div className="row gap-2">
          <Avatar init={u.init} color={u.color} />
          <div className="col">
            <span style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
              {u.username}
            </span>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'E-poçt', render: (u) => <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{u.email}</span> },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => <span className={'badge ' + (ROLE_BADGE[u.role] ?? 'badge-neutral')}>{ROLE_LABEL[u.role] ?? u.role}</span>,
    },
    { key: 'department', header: 'Şöbə', render: (u) => <span style={{ fontSize: 12.5 }}>{u.department}</span> },
    {
      key: 'twoFactor',
      header: '2FA',
      align: 'center',
      render: (u) =>
        u.twoFactor ? <Icon name="shield-check" size={16} color="var(--success)" /> : <Icon name="shield-off" size={16} color="var(--slate-400)" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <span className={'badge ' + (u.status === 'active' ? 'badge-success' : 'badge-urgent')}>{u.status === 'active' ? 'Aktiv' : 'Bloklanıb'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '92px',
      render: (u) => (
        <div className="row gap-1" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-icon" title="Redaktə et" onClick={() => setEditing(u)}>
            <Icon name="pencil" size={15} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Sil" onClick={() => setDeleting(u)}>
            <Icon name="trash-2" size={15} color="var(--danger)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="col gap-4">
      <PageHeader
        title="İstifadəçilər"
        subtitle={`${rows.length} hesab · sistemə giriş və rol icazələri`}
        action={
          <button className="btn btn-accent" onClick={() => setEditing({ ...EMPTY })}>
            <Icon name="plus" size={16} />
            Yeni istifadəçi
          </button>
        }
      />

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <SearchInput value={q} onChange={setQ} placeholder="Ad, istifadəçi adı, e-poçt…" />
        <select className="select" style={{ width: 'auto' }} value={roleF} onChange={(e) => setRoleF(e.target.value)}>
          <option value="">Bütün rollar</option>
          {ROLES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="select" style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">Bütün statuslar</option>
          <option value="active">Aktiv</option>
          <option value="blocked">Bloklanıb</option>
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} empty="İstifadəçi tapılmadı" />

      {editing && (
        <Modal
          title={editing.id ? 'İstifadəçini redaktə et' : 'Yeni istifadəçi'}
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
            <Field label="İstifadəçi adı">
              <input className="input" value={editing.username ?? ''} onChange={(e) => set({ username: e.target.value })} />
            </Field>
            <Field label="E-poçt">
              <input className="input" value={editing.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Telefon">
              <input className="input" value={editing.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="Rol">
              <select className="select" value={editing.role ?? 'operator'} onChange={(e) => set({ role: e.target.value })}>
                {ROLES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Şöbə">
              <input className="input" value={editing.department ?? ''} onChange={(e) => set({ department: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className="select" value={editing.status ?? 'active'} onChange={(e) => set({ status: e.target.value })}>
                <option value="active">Aktiv</option>
                <option value="blocked">Bloklanıb</option>
              </select>
            </Field>
            <Field label="İki faktorlu (2FA)">
              <label className="row gap-2" style={{ fontSize: 13, color: 'var(--text-2)', height: 38 }}>
                <input type="checkbox" checked={!!editing.twoFactor} onChange={(e) => set({ twoFactor: e.target.checked })} />
                Aktiv et
              </label>
            </Field>
          </FormGrid>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="İstifadəçini sil"
          message={`"${deleting.fullName}" hesabını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
