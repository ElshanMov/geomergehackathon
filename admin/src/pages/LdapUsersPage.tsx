// Admin → LDAP istifadəçiləri (CRUD). Kataloq hesabları + sinxronizasiya.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { LdapUser } from '../types';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, FormGrid } from '../components/Field';
import { PageHeader, SearchInput } from '../components/PageBits';
import { useToast } from '../components/Toast';

const PALETTE = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];
const colorFor = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const initials = (name: string) => {
  const p = name.split(' ').filter(Boolean);
  return p.length === 0 ? '?' : p.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
};

const EMPTY: Partial<LdapUser> = { dn: '', cn: '', uid: '', email: '', ou: '', groups: [], enabled: true };

export function LdapUsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<LdapUser[]>([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Partial<LdapUser> | null>(null);
  const [deleting, setDeleting] = useState<LdapUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const reload = () => api.ldapUsers().then(setRows).catch((e) => console.warn('LDAP yüklənmədi:', e));
  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((u) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return [u.cn, u.uid, u.email, u.ou, ...u.groups].some((x) => x.toLowerCase().includes(s));
      }),
    [rows, q],
  );

  const set = (patch: Partial<LdapUser>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  const sync = async () => {
    setSyncing(true);
    try {
      const list = await api.syncLdap();
      setRows(list);
      toast.push('Kataloq sinxronizasiya olundu');
    } catch (e) {
      toast.push('Sinxronizasiya alınmadı', 'error');
      console.warn(e);
    } finally {
      setSyncing(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.cn?.trim() || !editing.uid?.trim()) {
      toast.push('CN və UID tələb olunur', 'error');
      return;
    }
    setBusy(true);
    try {
      if (editing.id) {
        await api.updateLdapUser(editing.id, editing);
        toast.push('LDAP hesabı yeniləndi');
      } else {
        await api.createLdapUser(editing);
        toast.push('LDAP hesabı yaradıldı');
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
      await api.deleteLdapUser(deleting.id);
      toast.push('LDAP hesabı silindi');
      setDeleting(null);
      await reload();
    } catch (e) {
      toast.push('Silinmə alınmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<LdapUser>[] = [
    {
      key: 'cn',
      header: 'Hesab',
      render: (u) => (
        <div className="row gap-2">
          <Avatar init={initials(u.cn)} color={colorFor(u.uid)} />
          <div className="col">
            <span style={{ fontWeight: 600, fontSize: 13 }}>{u.cn}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
              {u.uid}
            </span>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'E-poçt', render: (u) => <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{u.email}</span> },
    { key: 'ou', header: 'Şöbə (OU)', render: (u) => <span style={{ fontSize: 12.5 }}>{u.ou}</span> },
    {
      key: 'groups',
      header: 'Qruplar',
      render: (u) => (
        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
          {u.groups.map((g) => (
            <span key={g} className="badge badge-neutral mono" style={{ fontSize: 10, padding: '2px 7px' }}>
              {g}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (u) => <span className={'badge ' + (u.enabled ? 'badge-success' : 'badge-low')}>{u.enabled ? 'Aktiv' : 'Deaktiv'}</span>,
    },
    { key: 'lastSync', header: 'Son sinxron', render: (u) => <span className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{u.lastSync}</span> },
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
        title="LDAP istifadəçiləri"
        subtitle={`${rows.length} kataloq hesabı · dc=nerimanov,dc=gov,dc=az`}
        action={
          <div className="row gap-2">
            <button className="btn btn-secondary" onClick={sync} disabled={syncing}>
              <Icon name="refresh-cw" size={15} />
              {syncing ? 'Sinxron…' : 'Sinxronizasiya'}
            </button>
            <button className="btn btn-accent" onClick={() => setEditing({ ...EMPTY, groups: [] })}>
              <Icon name="plus" size={16} />
              Yeni hesab
            </button>
          </div>
        }
      />

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <SearchInput value={q} onChange={setQ} placeholder="CN, UID, e-poçt, qrup…" />
      </div>

      <DataTable columns={columns} rows={filtered} empty="LDAP hesabı tapılmadı" />

      {editing && (
        <Modal
          title={editing.id ? 'LDAP hesabını redaktə et' : 'Yeni LDAP hesabı'}
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
            <Field label="Common Name (CN)">
              <input className="input" value={editing.cn ?? ''} onChange={(e) => set({ cn: e.target.value })} autoFocus />
            </Field>
            <Field label="UID">
              <input className="input mono" value={editing.uid ?? ''} onChange={(e) => set({ uid: e.target.value })} />
            </Field>
            <Field label="Distinguished Name (DN)" full>
              <input className="input mono" value={editing.dn ?? ''} onChange={(e) => set({ dn: e.target.value })} placeholder="cn=…,ou=…,dc=nerimanov,dc=gov,dc=az" />
            </Field>
            <Field label="E-poçt">
              <input className="input" value={editing.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Şöbə (OU)">
              <input className="input" value={editing.ou ?? ''} onChange={(e) => set({ ou: e.target.value })} />
            </Field>
            <Field label="Qruplar (vergüllə)" full>
              <input
                className="input"
                value={(editing.groups ?? []).join(', ')}
                onChange={(e) => set({ groups: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                placeholder="operators, staff"
              />
            </Field>
            <Field label="Vəziyyət">
              <label className="row gap-2" style={{ fontSize: 13, color: 'var(--text-2)', height: 38 }}>
                <input type="checkbox" checked={!!editing.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
                Aktiv (enabled)
              </label>
            </Field>
          </FormGrid>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="LDAP hesabını sil"
          message={`"${deleting.cn}" (${deleting.uid}) kataloq hesabını silmək istədiyinizə əminsiniz?`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
