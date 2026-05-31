// ============================================================
// Modul A — Operativ İdarəetmə Cockpit.
// 3 layout variantı: A Klassik · B Fokus-xəritə · C Bölünmüş.
// Bütün data API-dan (mock) gəlir; xəritə bir yerdə qalır, panellər
// onun ətrafında offset/overlay olur. cockpit.jsx-in birəbir portu.
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Icon } from '../lib/icon';
import { KpiCard } from '../components/KpiCard';
import { CockpitMap } from './CockpitMap';
import { LayerPanel } from './LayerPanel';
import { ActivityFeed } from './ActivityFeed';
import { WeatherChip } from './WeatherChip';
import { TrafficChip } from './TrafficChip';
import { SearchBox } from './SearchBox';
import { VariantSwitch, type Variant } from './VariantSwitch';
import type { DashboardSummary, Incident, Layer, LayerFeature } from '../types';

const LEGEND_PR: [string, string][] = [
  ['#EF4444', 'Təcili'],
  ['#F59E0B', 'Yüksək'],
  ['#3B82F6', 'Normal'],
  ['#64748B', 'Aşağı'],
];
const LEGEND_TR: [string, string][] = [
  ['#4CAF50', 'Sərbəst'],
  ['#F6C544', 'Orta'],
  ['#E84B35', 'Sıx'],
  ['#8E1B12', 'Tıxac'],
];

export function Cockpit() {
  const { openIncident, selected, flyToId } = useApp();

  const [layers, setLayers] = useState<Layer[]>([]);
  const [features, setFeatures] = useState<LayerFeature[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => new Set(['L1', 'L2', 'L3', 'L4', 'L6']));
  const [variant, setVariant] = useState<Variant>('A');
  const [feedOpen, setFeedOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([api.layers(), api.layerFeatures(), api.incidents(), api.dashboardSummary()])
      .then(([l, f, inc, s]) => {
        if (!alive) return;
        setLayers(l);
        setFeatures(f);
        setIncidents(inc);
        setSummary(s);
      })
      .catch((e) => console.warn('cockpit data yüklənmədi:', e));

    // Canlı sinxron: müraciətlər + xülasə hər 7 saniyədə bir yenilənir ki,
    // web/mobil/admin-də yaradılan yeni müraciətlər xəritədə dərhal görünsün.
    const poll = setInterval(() => {
      Promise.all([api.incidents(), api.dashboardSummary()])
        .then(([inc, s]) => {
          if (!alive) return;
          setIncidents(inc);
          setSummary(s);
        })
        .catch(() => {});
    }, 7000);

    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  const toggle = (id: string) =>
    setActiveLayers((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Xəritə + axtarış yalnız aktiv hadisələri göstərir (arxiv/ləğv kənarda).
  const liveIncidents = useMemo(
    () => incidents.filter((i) => i.status !== 'archived' && i.status !== 'cancelled'),
    [incidents],
  );

  const selectById = (id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (inc) openIncident(inc);
  };

  const mapEl = (
    <CockpitMap
      activeLayers={activeLayers}
      incidents={liveIncidents}
      features={features}
      onSelect={openIncident}
      selectedId={selected?.id ?? null}
      flyToId={flyToId}
      variant={`${variant}${feedOpen}${panelOpen}`}
    />
  );

  const panelW = variant !== 'B' && panelOpen ? 264 : 0;
  const feedH = variant === 'A' && feedOpen ? 188 : 0;
  const feedW = variant === 'C' ? 320 : 0;

  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      {/* KPI Bar */}
      <div
        className="row"
        style={{ gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, overflowX: 'auto' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px,1fr))', gap: 12, flex: 1, minWidth: 620 }}>
          {(summary?.kpis ?? []).map((k) => (
            <KpiCard key={k.id} kpi={k} compact />
          ))}
        </div>
        {summary && <WeatherChip weather={summary.weather} />}
        {summary && <TrafficChip traffic={summary.traffic} />}
      </div>

      {/* Toolbar */}
      <div
        className="row"
        style={{ justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', flexShrink: 0, gap: 12 }}
      >
        <div className="row gap-3">
          <button className="btn btn-ghost btn-sm" onClick={() => setPanelOpen((p) => !p)}>
            <Icon name="panel-left" size={15} />
            Təbəqələr
          </button>
          <SearchBox incidents={liveIncidents} onSelect={openIncident} />
        </div>
        <div className="row gap-3">
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Layout</span>
          <VariantSwitch variant={variant} setVariant={setVariant} />
        </div>
      </div>

      {/* Stage — xəritə daimi qalır; panellər ətrafında offset/overlay olur */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Xəritə (daimi) */}
        <div style={{ position: 'absolute', top: 0, bottom: feedH, left: panelW, right: feedW, overflow: 'hidden', transition: 'all .2s' }}>
          {mapEl}
          <div
            className="card"
            style={{ position: 'absolute', left: 14, bottom: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, zIndex: 5 }}
          >
            <div style={{ display: 'flex', gap: 14 }}>
              {LEGEND_PR.map(([c, l]) => (
                <span key={l} className="row gap-1">
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                  {l}
                </span>
              ))}
            </div>
            {activeLayers.has('L5') && (
              <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, color: 'var(--muted)' }}>Trafik</span>
                {LEGEND_TR.map(([c, l]) => (
                  <span key={l} className="row gap-1">
                    <span style={{ width: 14, height: 4, borderRadius: 2, background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dock edilmiş təbəqə paneli (A / C) */}
        {variant !== 'B' && panelOpen && (
          <div
            style={{ position: 'absolute', top: 0, bottom: feedH, left: 0, width: 264, overflow: 'hidden', borderRight: '1px solid var(--border)', background: 'var(--surface)', transition: 'all .2s' }}
          >
            <LayerPanel layers={layers} activeLayers={activeLayers} toggle={toggle} />
          </div>
        )}

        {/* Feed — A aşağıda */}
        {variant === 'A' && feedOpen && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 188, borderTop: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
            <ActivityFeed feed={summary?.feed ?? []} onSelect={selectById} />
          </div>
        )}

        {/* Feed — C sağda */}
        {variant === 'C' && (
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 320, borderLeft: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
            <ActivityFeed feed={summary?.feed ?? []} onSelect={selectById} compact />
          </div>
        )}

        {/* Üzən panel + feed — B */}
        {variant === 'B' && (
          <div style={{ position: 'absolute', top: 14, left: 14, width: 260, maxHeight: 'calc(100% - 28px)', zIndex: 6 }}>
            <LayerPanel layers={layers} activeLayers={activeLayers} toggle={toggle} floating />
          </div>
        )}
        {variant === 'B' && (
          <div
            className="card"
            style={{ position: 'absolute', top: 14, right: 14, width: 300, maxHeight: 'calc(100% - 28px)', display: 'flex', flexDirection: 'column', zIndex: 6, overflow: 'hidden' }}
          >
            <ActivityFeed feed={summary?.feed ?? []} onSelect={selectById} compact />
          </div>
        )}
      </div>

      {/* Feed toggle — yalnız A */}
      {variant === 'A' && (
        <button
          onClick={() => setFeedOpen((f) => !f)}
          className="btn btn-secondary btn-sm"
          style={{ position: 'absolute', right: 24, bottom: feedOpen ? 200 : 24, zIndex: 8, boxShadow: 'var(--shadow-md)' }}
        >
          <Icon name={feedOpen ? 'chevron-down' : 'chevron-up'} size={14} />
          Feed
        </button>
      )}
    </div>
  );
}
