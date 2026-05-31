// Admin → Marşrutlar siyahısı. Kart → ox redaktoruna keçid (/routes/:id).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Nomenclature, Route } from '../types';
import { Icon } from '../lib/icon';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageBits';
import { useToast } from '../components/Toast';

const TYPE_LABEL: Record<string, string> = { sequential: 'Ardıcıl', parallel: 'Paralel' };

export function RoutesPage() {
  const toast = useToast();
  const nav = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [nomen, setNomen] = useState<Nomenclature[]>([]);
  const [deleting, setDeleting] = useState<Route | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    api.routes().then(setRoutes).catch((e) => console.warn('marşrutlar yüklənmədi:', e));
    api.nomenclatures().then(setNomen).catch((e) => console.warn('nameklatur yüklənmədi:', e));
  };
  useEffect(() => {
    reload();
  }, []);

  const usageCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const n of nomen) if (n.routeId) m[n.routeId] = (m[n.routeId] ?? 0) + 1;
    return m;
  }, [nomen]);

  const create = async () => {
    setBusy(true);
    try {
      const r = await api.createRoute({
        name: 'Yeni marşrut',
        description: '',
        type: 'sequential',
        steps: [{ id: 'n1', code: 'new', name: 'Yeni', type: 'start', role: 'operator', color: '#64748B', x: 80, y: 140 }],
        transitions: [],
      });
      toast.push('Marşrut yaradıldı');
      nav(`/routes/${r.id}`);
    } catch (e) {
      toast.push('Marşrut yaradılmadı', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteRoute(deleting.id);
      toast.push('Marşrut silindi');
      setDeleting(null);
      await reload();
    } catch (e) {
      toast.push('Silinmədi — marşrut nameklatura bağlı ola bilər', 'error');
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col gap-4">
      <PageHeader
        title="Marşrutlar"
        subtitle={`${routes.length} status axını · oxlarla çəkilən iş prosesi`}
        action={
          <button className="btn btn-accent" onClick={create} disabled={busy}>
            <Icon name="plus" size={16} />
            Yeni marşrut
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {routes.map((r) => {
          const used = usageCount[r.id] ?? 0;
          return (
            <div key={r.id} className="card card-interactive col" style={{ padding: 18, gap: 14 }} onClick={() => nav(`/routes/${r.id}`)}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div className="row gap-2" style={{ alignItems: 'center' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'var(--accent-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="workflow" size={18} color="var(--accent-600)" />
                  </div>
                  <span className={'badge ' + (r.type === 'parallel' ? 'badge-violet' : 'badge-accent')}>{TYPE_LABEL[r.type] ?? r.type}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.id}</span>
              </div>

              <div className="col" style={{ gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{r.description || 'Təsvir yoxdur.'}</span>
              </div>

              <div className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div className="row gap-3">
                  <span className="row gap-1" style={{ fontSize: 12, color: 'var(--muted)' }}>
                    <Icon name="circle-dot" size={13} />
                    {r.steps.length} status
                  </span>
                  <span className="row gap-1" style={{ fontSize: 12, color: 'var(--muted)' }}>
                    <Icon name="arrow-right" size={13} />
                    {r.transitions.length} keçid
                  </span>
                  <span className="row gap-1" style={{ fontSize: 12, color: 'var(--muted)' }}>
                    <Icon name="tags" size={13} />
                    {used} nameklatur
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  title="Sil"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleting(r);
                  }}
                >
                  <Icon name="trash-2" size={15} color="var(--danger)" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Marşrutu sil"
          message={`"${deleting.name}" marşrutunu silmək istədiyinizə əminsiniz? Təsnifata bağlı marşrutlar silinə bilməz.`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
