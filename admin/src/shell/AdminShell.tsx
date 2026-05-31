// Admin shell — sidebar nav (slate-900), topbar, router Outlet.
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: 'İstifadəçi idarəetməsi',
    items: [
      { to: '/users', icon: 'users', label: 'İstifadəçilər' },
      { to: '/ldap', icon: 'network', label: 'LDAP istifadəçiləri' },
      { to: '/workers', icon: 'hard-hat', label: 'İşçilər' },
      { to: '/qanunsuz-tikinti', icon: 'building-2', label: 'Qanunsuz tikintilərin aşkarı' },
    ],
  },
  {
    title: 'İş axını',
    items: [
      { to: '/nomenclatures', icon: 'tags', label: 'Təsnifat' },
      { to: '/routes', icon: 'workflow', label: 'Marşrutlar' },
    ],
  },
  {
    title: 'Təhlükəsizlik',
    items: [
      { to: '/privileges', icon: 'shield', label: 'İmtiyazlar' },
      { to: '/password-policy', icon: 'key-round', label: 'Şifrə sazlanmaları' },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrator',
  operator: 'RİH operatoru',
  representative: 'RİH nümayəndəsi',
};

export function AdminShell() {
  const { auth, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const allItems = NAV.flatMap((g) => g.items);
  const current = allItems.find((n) => loc.pathname.startsWith(n.to));

  const doLogout = () => {
    logout();
    nav('/login', { replace: true });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '248px 1fr', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="col" style={{ background: 'var(--slate-900)', color: '#fff', padding: '16px 12px', gap: 18, overflow: 'hidden' }}>
        <div className="row gap-3" style={{ padding: '4px 8px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#0EA5E9,#0284C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(14,165,233,.4)',
            }}
          >
            <Icon name="shield-check" size={20} color="#fff" />
          </div>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: '-.02em' }}>Rəqəmsal Nərimanov</span>
            <span style={{ fontSize: 10.5, color: 'var(--slate-400)', fontWeight: 500 }}>Admin Paneli</span>
          </div>
        </div>

        <nav className="col" style={{ gap: 16, overflowY: 'auto', flex: 1 }}>
          {NAV.map((g) => (
            <div key={g.title} className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--slate-500)', padding: '4px 10px' }}>
                {g.title}
              </span>
              {g.items.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className="row"
                  style={({ isActive }) => ({
                    gap: 11,
                    padding: '9px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: isActive ? 'rgba(255,255,255,.10)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--slate-400)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13,
                    transition: 'all .12s',
                    position: 'relative',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 3, borderRadius: 999, background: 'var(--accent)' }} />}
                      <Icon name={n.icon} size={17} style={{ color: isActive ? 'var(--accent)' : 'inherit' }} />
                      <span style={{ flex: 1 }}>{n.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="row gap-3" style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,.05)' }}>
          <Avatar init={auth?.init ?? '?'} color="#0EA5E9" size={32} />
          <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth?.fullName ?? '—'}</span>
            <span style={{ fontSize: 10.5, color: 'var(--slate-400)' }}>{ROLE_LABEL[auth?.role ?? ''] ?? auth?.role}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={doLogout} title="Çıxış" style={{ color: 'var(--slate-400)' }}>
            <Icon name="log-out" size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="col" style={{ minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        <header className="row" style={{ justifyContent: 'space-between', padding: '0 24px', height: 56, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <div className="row gap-3">
            <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>{current?.label ?? 'Admin'}</h2>
            <span className="badge badge-success">
              <span className="dot" />
              Canlı
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }} className="mono">
            nerimanov.gov.az
          </span>
        </header>

        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: 'var(--bg)', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
