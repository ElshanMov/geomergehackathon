// L5 — Trafik sıxlığı simulyasiya qatı (TomTom-suz, həmişə görünür).
import L from 'leaflet';
import { TRAFFIC_ROADS, TR_LVL_COLOR, TR_LVL_NAME } from '../data/meta';

const toLatLng = (c: number[]): [number, number] => [c[1], c[0]];

export function createSimTrafficLayer(): L.LayerGroup {
  const g = L.layerGroup();
  TRAFFIC_ROADS.forEach((road) => {
    road.segs.forEach((s) => {
      const pts = s.coords.map(toLatLng);
      // casing — alt tünd xətt
      L.polyline(pts, { color: '#0f172a', weight: 9, opacity: 0.22, lineCap: 'round', lineJoin: 'round' }).addTo(g);
      // sıxlıq rəngli xətt
      L.polyline(pts, {
        color: TR_LVL_COLOR[s.lvl] ?? TR_LVL_COLOR[0],
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      })
        .bindTooltip(`${road.name} — ${TR_LVL_NAME[s.lvl] ?? '—'}`, { sticky: true })
        .addTo(g);
    });
  });
  return g;
}
