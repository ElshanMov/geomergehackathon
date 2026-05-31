// ============================================================
// App Shell — sidebar nav (slate-900), topbar, router Outlet, toasts.
// app.jsx-dəki App komponentinin react-router portu.
// ============================================================
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../lib/icon';
import { Avatar } from '../components/Avatar';
import { NotifCenter } from '../components/NotifCenter';
import { Toast } from '../components/Toast';
import { IncidentDrawer } from '../drawer/IncidentDrawer';
import { NAV } from '../data/meta';
import { useApp } from '../context/AppContext';

export function AppShell() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { toasts, dismissToast, selected, closeIncident, pushToast } = useApp();
  const loc = useLocation();
  const current = NAV.find((n) => loc.pathname.startsWith(n.path)) ?? NAV[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gridTemplateRows: 'minmax(0,1fr)', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="col" style={{ background: 'var(--slate-900)', color: '#fff', padding: '16px 12px', gap: 18, overflow: 'hidden' }}>
        <div className="row gap-3" style={{ padding: '4px 8px' }}>
          <div
            style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,.4)' }}
          >
            <Icon name="radar" size={20} style={{ color: '#fff' }} />
          </div>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: '-.02em' }}>Rəqəmsal Nərimanov</span>
            <span style={{ fontSize: 10.5, color: 'var(--slate-400)', fontWeight: 500 }}>RİH · Operativ idarəetmə</span>
          </div>
        </div>

        <nav className="col" style={{ gap: 16, overflowY: 'auto', flex: 1 }}>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--slate-500)', padding: '4px 10px' }}>Operativ</span>
            {NAV.map((n) => (
              <NavLink
                key={n.id}
                to={n.path}
                className="row"
                style={({ isActive }) => ({
                  gap: 11,
                  padding: '9px 10px',
                  borderRadius: 8,
                  border: 0,
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
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
                    {n.badge && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: isActive ? 'var(--accent)' : 'rgba(255,255,255,.1)', color: '#fff' }}>{n.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="row gap-3" style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,.05)', marginBottom: 56 }}>
          <Avatar actor="op1" size={32} />
          <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Leyla Məmmədova</span>
            <span style={{ fontSize: 10.5, color: 'var(--slate-400)' }}>RİH operatoru</span>
          </div>
          <Icon name="chevrons-up-down" size={15} style={{ color: 'var(--slate-500)' }} />
        </div>
      </aside>

      {/* Main */}
      <div className="col" style={{ minWidth: 0, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        {/* Topbar */}
        <header className="row" style={{ justifyContent: 'space-between', padding: '0 18px', height: 56, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <div className="row gap-3">
            <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>{current.label}</h2>
            <span className="badge badge-success">
              <span className="dot" />
              Canlı
            </span>
          </div>
          <div className="row gap-2">
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--muted)' }}
              onClick={() => (document.querySelector('.cockpit-search-input') as HTMLInputElement | null)?.focus()}
            >
              <Icon name="search" size={15} />
              Axtar
              <kbd className="mono" style={{ fontSize: 10.5, padding: '2px 5px', borderRadius: 4, background: 'var(--slate-100)', border: '1px solid var(--border)' }}>
                ⌘K
              </kbd>
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => setNotifOpen((o) => !o)} style={{ position: 'relative' }} title="Bildirişlər">
              <Icon name="bell" size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid #fff' }} />
            </button>
          </div>
        </header>

        {/* View */}
        <main style={{ flex: 1, minHeight: 0, position: 'relative', background: 'var(--bg)' }}>
          <Outlet />
        </main>

        <NotifCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* Modul B drawer — seçilmiş incident context-dən oxunur */}
      {selected && <IncidentDrawer incident={selected} onClose={closeIncident} onAction={pushToast} />}

      {/* Toasts */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1600, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t) => (
          <Toast key={t.id} t={t} onClose={() => dismissToast(t.id)} />
        ))}
      </div>
    </div>
  );
}
