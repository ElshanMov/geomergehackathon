// NərimanovOps Admin API — fetch klienti. Bütün data mock API-dan gəlir (SQL yoxdur).
import type {
  AuthResponse,
  LdapUser,
  Nomenclature,
  PasswordPolicy,
  Role,
  RolePermission,
  Route,
  SystemUser,
  Worker,
} from '../types';

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:5131/api';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${r.statusText}`);
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
}

const get = <T>(p: string) => req<T>('GET', p);
const post = <T>(p: string, b: unknown) => req<T>('POST', p, b);
const put = <T>(p: string, b: unknown) => req<T>('PUT', p, b);
const del = (p: string) => req<void>('DELETE', p);

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  base: API_BASE,

  login: (body: { username: string; password: string; role?: string }) =>
    post<AuthResponse>('/auth/login', body),

  // İstifadəçilər (sistemə giriş hesabları)
  users: (f: { role?: string; status?: string } = {}) =>
    get<SystemUser[]>(`/users${qs(f as Record<string, string | undefined>)}`),
  createUser: (u: Partial<SystemUser>) => post<SystemUser>('/users', u),
  updateUser: (id: string, u: Partial<SystemUser>) => put<SystemUser>(`/users/${id}`, u),
  deleteUser: (id: string) => del(`/users/${id}`),

  // LDAP istifadəçiləri (kataloq hesabları)
  ldapUsers: () => get<LdapUser[]>('/ldap-users'),
  createLdapUser: (u: Partial<LdapUser>) => post<LdapUser>('/ldap-users', u),
  updateLdapUser: (id: string, u: Partial<LdapUser>) => put<LdapUser>(`/ldap-users/${id}`, u),
  deleteLdapUser: (id: string) => del(`/ldap-users/${id}`),
  syncLdap: () => post<LdapUser[]>('/ldap-users/sync', {}),

  // İşçilər (RİH əməkdaşları / sahə nümayəndələri)
  workers: (f: { status?: string; department?: string } = {}) =>
    get<Worker[]>(`/workers${qs(f as Record<string, string | undefined>)}`),
  createWorker: (w: Partial<Worker>) => post<Worker>('/workers', w),
  updateWorker: (id: string, w: Partial<Worker>) => put<Worker>(`/workers/${id}`, w),
  deleteWorker: (id: string) => del(`/workers/${id}`),

  // Nameklatur (təsnifat — hər birinin BİR marşrutu)
  nomenclatures: (f: { group?: string; active?: string } = {}) =>
    get<Nomenclature[]>(`/nomenclatures${qs(f as Record<string, string | undefined>)}`),
  createNomenclature: (n: Partial<Nomenclature>) => post<Nomenclature>('/nomenclatures', n),
  updateNomenclature: (id: string, n: Partial<Nomenclature>) => put<Nomenclature>(`/nomenclatures/${id}`, n),
  deleteNomenclature: (id: string) => del(`/nomenclatures/${id}`),

  // Marşrutlar (ox redaktoru — node + transition)
  routes: () => get<Route[]>('/routes'),
  route: (id: string) => get<Route>(`/routes/${id}`),
  createRoute: (r: Partial<Route>) => post<Route>('/routes', r),
  updateRoute: (id: string, r: Partial<Route>) => put<Route>(`/routes/${id}`, r),
  deleteRoute: (id: string) => del(`/routes/${id}`),

  // İmtiyazlar (rol × resurs matrisi)
  roles: () => get<Role[]>('/privileges/roles'),
  permissions: (roleId?: string) => get<RolePermission[]>(`/privileges/permissions${qs({ roleId })}`),
  updatePermission: (perm: RolePermission) => put<RolePermission>('/privileges/permissions', perm),

  // Şifrə sazlanmaları (tək konfiq)
  passwordPolicy: () => get<PasswordPolicy>('/password-policy'),
  updatePasswordPolicy: (p: PasswordPolicy) => put<PasswordPolicy>('/password-policy', p),
};
