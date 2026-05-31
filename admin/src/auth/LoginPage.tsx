// Admin giriş ekranı — mock login (parol yoxlanmır, username sistem hesabı ilə uyğunlaşır).
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '../lib/icon';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { auth, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('kamran.n');
  const [password, setPassword] = useState('demo');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth) return <Navigate to="/users" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      nav('/users', { replace: true });
    } catch {
      setErr('Giriş alınmadı. İstifadəçi adını yoxlayın (məs. kamran.n).');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'radial-gradient(1200px 600px at 50% -10%, #1E293B, #0F172A)',
      }}
    >
      <div className="card fade-in" style={{ width: 'min(420px, 96vw)', padding: 32, boxShadow: 'var(--shadow-xl)' }}>
        <div className="row gap-3" style={{ marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#0EA5E9,#0284C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14,165,233,.4)',
            }}
          >
            <Icon name="shield-check" size={24} color="#fff" />
          </div>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>Rəqəmsal Nərimanov</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>Admin İdarəetmə Paneli</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '14px 0 22px', lineHeight: 1.5 }}>
          Sistemə giriş üçün hesab məlumatlarınızı daxil edin.
        </p>

        <form className="col gap-4" onSubmit={submit}>
          <label className="col" style={{ gap: 6 }}>
            <span className="label" style={{ marginBottom: 0 }}>İstifadəçi adı və ya e-poçt</span>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus placeholder="kamran.n" />
          </label>
          <label className="col" style={{ gap: 6 }}>
            <span className="label" style={{ marginBottom: 0 }}>Şifrə</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {err && (
            <div className="row gap-2" style={{ fontSize: 12.5, color: '#B91C1C', background: 'var(--danger-50)', padding: '9px 12px', borderRadius: 8 }}>
              <Icon name="circle-alert" size={15} />
              {err}
            </div>
          )}

          <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={busy}>
            {busy ? 'Yoxlanılır…' : 'Daxil ol'}
            {!busy && <Icon name="arrow-right" size={16} />}
          </button>
        </form>

        <div className="row gap-2" style={{ marginTop: 18, fontSize: 11.5, color: 'var(--muted)', justifyContent: 'center' }}>
          <Icon name="info" size={13} />
          Demo: <span className="mono" style={{ color: 'var(--text-2)' }}>kamran.n</span> (admin) · şifrə istənilən
        </div>
      </div>
    </div>
  );
}
