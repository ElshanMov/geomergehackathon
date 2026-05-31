// ============================================================
// CockpitMap — raw Leaflet · Nərimanov spotlight maskası + təbəqələr +
// kliklənə bilən incident pin-ləri. Dizayndakı map.jsx-in birəbir portu.
// ============================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { iconSVG } from '../lib/icon';
import { api, type GeoJsonLike, type GeoGeometry } from '../api/client';
import { createSimTrafficLayer } from './traffic';
import { NRM_BOUNDARY, NRM_CENTER, PR_COLOR } from '../data/meta';
import type { Incident, LayerFeature } from '../types';

const LL = (c: number[]): [number, number] => [c[1], c[0]]; // [lng,lat] → [lat,lng]

function incidentMarkerHTML(inc: Incident, selected: boolean): string {
  const color = PR_COLOR[inc.priority];
  const isAI = inc.layer === 'L4';
  return `<div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
    ${inc.priority === 'urgent' ? `<span style="position:absolute;width:30px;height:30px;border-radius:50%;background:${color};animation:pulse-ring 1.8s ease-out infinite;"></span>` : ''}
    ${isAI ? `<span style="position:absolute;width:34px;height:34px;border-radius:50%;border:2px solid ${color};opacity:.5;"></span>` : ''}
    <span style="position:relative;width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.4);transform:scale(${selected ? 1.45 : 1});transition:transform .15s;"></span>
  </div>`;
}

function badgeIcon(f: LayerFeature): L.DivIcon {
  const svg = iconSVG(f.icon || 'circle', '#fff', 14);
  const halo = f.halo
    ? `<span style="position:absolute;width:36px;height:36px;border-radius:50%;border:2px solid ${f.color};opacity:.45;"></span>`
    : '';
  return L.divIcon({
    className: 'nrm-divicon',
    html: `<div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
      ${halo}
      <span style="width:26px;height:26px;border-radius:50%;background:${f.color};border:2px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;">${svg}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function buildFeature(f: LayerFeature): L.Layer | undefined {
  const pop = `<div style="font-family:Inter,sans-serif"><b style="font-size:12.5px">${f.label || ''}</b>${
    f.sub ? `<br><span style="font-size:11px;color:#64748B">${f.sub}</span>` : ''
  }</div>`;
  let layer: L.Layer | undefined;
  if (f.kind === 'marker' && f.lat != null && f.lng != null) {
    layer = L.marker([f.lat, f.lng], { icon: badgeIcon(f) });
  } else if (f.kind === 'radius' && f.lat != null && f.lng != null) {
    const g = L.layerGroup();
    L.circle([f.lat, f.lng], { radius: f.meters || 100, color: f.color, weight: 2, fillColor: f.color, fillOpacity: 0.12 }).addTo(g);
    L.circleMarker([f.lat, f.lng], { radius: 5, color: '#fff', weight: 2, fillColor: f.color, fillOpacity: 1 }).addTo(g);
    layer = g;
  } else if (f.kind === 'line' && f.coords) {
    layer = L.polyline(f.coords.map(LL), { color: f.color, weight: 6, opacity: 0.85, lineCap: 'round' });
  } else if (f.kind === 'polygon' && f.coords) {
    layer = L.polygon(f.coords.map(LL), { color: f.color, weight: 2, fillColor: f.color, fillOpacity: 0.18, dashArray: '5 3' });
  } else if (f.kind === 'heat' && f.lat != null && f.lng != null) {
    layer = L.circle([f.lat, f.lng], { radius: f.meters || 100, stroke: false, fillColor: f.color, fillOpacity: 0.16 });
  }
  if (layer && f.label) (layer as L.Layer & { bindPopup: (s: string) => void }).bindPopup(pop);
  return layer;
}

function extractRing(gj: GeoJsonLike): number[][] {
  const geom: GeoGeometry | undefined =
    gj.type === 'FeatureCollection' ? gj.features?.[0].geometry : gj.type === 'Feature' ? gj.geometry : (gj as unknown as GeoGeometry);
  if (!geom) throw new Error('geometry tapılmadı');
  if (geom.type === 'Polygon') return geom.coordinates[0] as number[][];
  if (geom.type === 'MultiPolygon') return (geom.coordinates as number[][][][])[0][0];
  throw new Error('Naməlum geometry tipi: ' + geom.type);
}

export interface CockpitMapProps {
  activeLayers: Set<string>;
  incidents: Incident[];
  features: LayerFeature[];
  onSelect: (inc: Incident) => void;
  selectedId: string | null;
  flyToId: string | null;
  variant: string;
}

export function CockpitMap({ activeLayers, incidents, features, onSelect, selectedId, flyToId, variant }: CockpitMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const decoRef = useRef<Record<string, L.LayerGroup>>({});
  const trafficRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const featuresByLayer = useMemo(() => {
    const m: Record<string, LayerFeature[]> = {};
    features.forEach((f) => {
      (m[f.layerId] ??= []).push(f);
    });
    return m;
  }, [features]);

  // ---- init (bir dəfə) ----
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      center: [NRM_CENTER[1], NRM_CENTER[0]],
      zoom: 13.2,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      detectRetina: true,
      attribution: '© OpenStreetMap, © CARTO',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
    mapRef.current = map;

    const drawMask = (ring: number[][]) => {
      // StrictMode/remount qoruyucusu: bu xəritə artıq cari deyilsə (silinibsə) çəkmə.
      if (mapRef.current !== map) return;
      const hole = ring.map(LL);
      const world: [number, number][] = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
      ];
      L.polygon([world, hole], { fillColor: '#F1F5F9', fillOpacity: 0.82, stroke: false, interactive: false }).addTo(map);
      L.polygon(hole, { fill: false, color: '#0EA5E9', weight: 8, opacity: 0.12, interactive: false }).addTo(map);
      L.polygon(hole, { fill: false, color: '#0EA5E9', weight: 2.4, opacity: 0.9, dashArray: '6 5', interactive: false }).addTo(map);
      try {
        map.fitBounds(L.polygon(hole).getBounds(), { padding: [40, 40] });
      } catch {
        /* boş */
      }
    };

    api
      .geoBoundary()
      .then((gj) => drawMask(extractRing(gj)))
      .catch((err) => {
        console.warn('geo sərhədi yüklənmədi, fallback istifadə olunur:', err);
        drawMask(NRM_BOUNDARY);
      });

    const ro = new ResizeObserver(() => {
      try {
        map.invalidateSize();
      } catch {
        /* boş */
      }
    });
    ro.observe(ref.current);
    const t = setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 80);

    return () => {
      ro.disconnect();
      clearTimeout(t);
      trafficRef.current = null;
      markersRef.current = {};
      decoRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- dekorativ təbəqələr (L2..L15) ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    Object.keys(featuresByLayer).forEach((lid) => {
      if (!decoRef.current[lid]) {
        const g = L.layerGroup();
        featuresByLayer[lid].forEach((f) => {
          const lay = buildFeature(f);
          if (lay) lay.addTo(g);
        });
        decoRef.current[lid] = g;
      }
      const on = activeLayers.has(lid);
      const g = decoRef.current[lid];
      if (on && !map.hasLayer(g)) g.addTo(map);
      if (!on && map.hasLayer(g)) map.removeLayer(g);
    });
  }, [ready, activeLayers, featuresByLayer]);

  // ---- trafik (L5) ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const on = activeLayers.has('L5');
    if (on && !trafficRef.current) {
      trafficRef.current = createSimTrafficLayer();
      trafficRef.current.addTo(map);
    }
    if (!on && trafficRef.current) {
      map.removeLayer(trafficRef.current);
      trafficRef.current = null;
    }
  }, [ready, activeLayers]);

  // ---- incident markerləri (kliklənən) ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    incidents.forEach((inc) => {
      let m = markersRef.current[inc.id];
      const visible = activeLayers.has(inc.layer);
      const selected = selectedId === inc.id;
      if (!m) {
        m = L.marker([inc.lat, inc.lng], {
          icon: L.divIcon({ html: incidentMarkerHTML(inc, selected), className: 'nrm-divicon', iconSize: [30, 30], iconAnchor: [15, 15] }),
          zIndexOffset: 1000,
        });
        m.on('click', () => onSelect(inc));
        markersRef.current[inc.id] = m;
      } else {
        m.setIcon(L.divIcon({ html: incidentMarkerHTML(inc, selected), className: 'nrm-divicon', iconSize: [30, 30], iconAnchor: [15, 15] }));
      }
      if (visible && !map.hasLayer(m)) m.addTo(map);
      if (!visible && map.hasLayer(m)) map.removeLayer(m);
      const el = m.getElement();
      if (el) el.style.opacity = !selectedId || selected ? '1' : '0.55';
    });
  }, [ready, activeLayers, incidents, selectedId, onSelect]);

  // ---- flyTo ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !flyToId) return;
    const inc = incidents.find((i) => i.id === flyToId);
    if (inc) map.flyTo([inc.lat, inc.lng], 15.4, { duration: 0.9 });
  }, [flyToId, ready, incidents]);

  // ---- variant dəyişəndə ölçünü yenilə ----
  useEffect(() => {
    const map = mapRef.current;
    if (map && ready) {
      const t = setTimeout(() => map.invalidateSize(), 80);
      return () => clearTimeout(t);
    }
  }, [variant, ready]);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, background: '#EAEFF3' }} />;
}
