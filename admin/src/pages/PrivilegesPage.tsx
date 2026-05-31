// Admin → İmtiyazlar. Rol seç → resurs×əməliyyat icazə matrisi (checkbox toggle → PUT).
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Role, RolePermission } from '../types';
import { Icon } from '../lib/icon';
import { PageHeader } from '../components/PageBits';
import { useToast } from '../components/Toast';

type PermField = 'view' | 'create' | 'edit' | 'delete';
const FIELDS: [PermField, string][] = [
  ['view', 'Baxış'],
  ['create', 'Yaratma'],
  ['edit', 'Redaktə'],
  ['delete', 'Silmə'],
];

export function PrivilegesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<RolePermission[]>([]);
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    api
      .roles()
      .then((rs) => {
        setRoles(rs);
        setRoleId((cur) => cur || rs[0]?.id || '');
      })
      .catch((e) => console.warn('rollar yüklənmədi:', e));
    api.permissions().then(setPerms).catch((e) => console.warn('icazələr yüklənmədi:', e));
  }, []);

  const rolePerms = useMemo(() => perms.filter((p) => p.roleId === roleId), [perms, roleId]);
  const activeRole = roles.find((r) => r.id === roleId);

  const toggle = async (perm: RolePermission, field: PermField) => {
    const next: RolePermission = { ...perm, [field]: !perm[field] };
    setPerms((ps) => ps.map((p) => (p.roleId === perm.roleId && p.resource === perm.resource ? next : p)));
    try {
      await api.updatePermission(next);
    } catch (e) {
      setPerms((ps) => ps.map((p) => (p.roleId === perm.roleId && p.resource === perm.resource ? perm : p)));
      toast.push('İcazə yenilənmədi', 'error');
      console.warn(e);
    }
  };

  return (
    <div className="col gap-4">
      <PageHeader title="İmtiyazlar" subtitle={`${roles.length} rol · resurs üzrə icazə matrisi`} />

      {/* Rol seçimi */}
      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        {roles.map((r) => {
          const active = r.id === roleId;
          return (
            <button
              key={r.id}
              onClick={() => setRoleId(r.id)}
              className="card col"
              style={{
                padding: '12px 16px',
                gap: 4,
                minWidth: 200,
                textAlign: 'left',
                cursor: 'pointer',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: active ? '0 0 0 3px rgba(14,165,233,.15)' : 'var(--shadow-sm)',
                background: active ? 'var(--accent-50)' : 'var(--surface)',
              }}
            >
              <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</span>
                <span className="badge badge-neutral">{r.userCount} istifadəçi</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{r.description}</span>
            </button>
          );
        })}
      </div>

      {/* İcazə matrisi */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Resurs</th>
                {FIELDS.map(([f, l]) => (
                  <th key={f} style={{ textAlign: 'center', width: '110px' }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolePerms.length === 0 ? (
                <tr>
                  <td colSpan={FIELDS.length + 1} style={{ textAlign: 'center', padding: 44, color: 'var(--muted)' }}>
                    İcazə tapılmadı
                  </td>
                </tr>
              ) : (
                rolePerms.map((p) => (
                  <tr key={p.resource}>
                    <td>
                      <div className="col">
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.resourceLabel}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{p.resource}</span>
                      </div>
                    </td>
                    {FIELDS.map(([f]) => (
                      <td key={f} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={p[f]}
                          onChange={() => toggle(p, f)}
                          disabled={activeRole?.id === 'admin'}
                          style={{ width: 17, height: 17, cursor: activeRole?.id === 'admin' ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeRole?.id === 'admin' && (
        <div className="row gap-2" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          <Icon name="shield-check" size={15} color="var(--violet)" />
          Administrator rolu bütün resurslara tam icazəyə malikdir və dəyişdirilə bilməz.
        </div>
      )}
    </div>
  );
}
