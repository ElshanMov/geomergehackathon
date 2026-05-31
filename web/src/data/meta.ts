// ============================================================
// Presentation meta — API-dan gəlməyən sabitlər (rəng, etiket, layout).
// Data (incident, layer, kpi...) API-dan gəlir; bu fayl yalnız "görünüş".
// ============================================================
import type { LifecycleStep, Priority } from '../types';

// Nərimanov rayonu approx mərkəz — [lng, lat]
export const NRM_CENTER: [number, number] = [49.87094, 40.40985];

// Sadə geokod — ünvan mətnindəki küçə açar sözünə görə [lng, lat].
// Uyğunluq tapılmasa mərkəzə kiçik təsadüfi sürüşmə (nöqtələr üst-üstə düşməsin).
const STREET_COORDS: { key: string; lng: number; lat: number }[] = [
  { key: 'atatürk', lng: 49.858, lat: 40.4078 },
  { key: 'ziya bünyadov', lng: 49.864, lat: 40.4026 },
  { key: 'qara qarayev', lng: 49.868, lat: 40.3966 },
  { key: 'koroğlu', lng: 49.874, lat: 40.4172 },
  { key: 'təbriz', lng: 49.88, lat: 40.4275 },
  { key: 'zərdabi', lng: 49.862, lat: 40.4105 },
  { key: 'xoyski', lng: 49.876, lat: 40.4085 },
  { key: 'rəcəbli', lng: 49.87, lat: 40.415 },
];

export function geocodeAddr(addr: string): { lng: number; lat: number } {
  const a = (addr || '').toLowerCase();
  const hit = STREET_COORDS.find((s) => a.includes(s.key));
  if (hit) return { lng: hit.lng, lat: hit.lat };
  return {
    lng: NRM_CENTER[0] + (Math.random() - 0.5) * 0.02,
    lat: NRM_CENTER[1] + (Math.random() - 0.5) * 0.015,
  };
}

// Spotlight maskası üçün fallback sərhəd (geo API əlçatmazsa) — [lng, lat]
export const NRM_BOUNDARY: number[][] = [
  [49.819, 40.418], [49.824, 40.4255], [49.833, 40.43], [49.844, 40.4325],
  [49.854, 40.435], [49.864, 40.4335], [49.873, 40.429], [49.881, 40.422],
  [49.8855, 40.414], [49.889, 40.406], [49.885, 40.399], [49.876, 40.3945],
  [49.866, 40.3915], [49.856, 40.39], [49.846, 40.3915], [49.837, 40.395],
  [49.829, 40.3995], [49.823, 40.406], [49.8195, 40.412], [49.819, 40.418],
];

// 10 mərhələli status axını
export const LIFECYCLE: LifecycleStep[] = [
  { id: 'new', label: 'Yeni', color: '#64748B' },
  { id: 'registered', label: 'Qeydiyyata alındı', color: '#3B82F6' },
  { id: 'classified', label: 'Təsnif edildi', color: '#0EA5E9' },
  { id: 'assigned', label: 'İcraçıya təyin', color: '#8B5CF6' },
  { id: 'enroute', label: 'Marşrutda', color: '#A855F7' },
  { id: 'onsite', label: 'Sahədə baxış', color: '#F59E0B' },
  { id: 'inprogress', label: 'İcrada', color: '#F97316' },
  { id: 'review', label: 'Yoxlamada', color: '#EAB308' },
  { id: 'resolved', label: 'Həll edildi', color: '#10B981' },
  { id: 'archived', label: 'Arxivləşdirildi', color: '#94A3B8' },
];

export const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  urgent: { label: 'Təcili', cls: 'badge-urgent' },
  high: { label: 'Yüksək', cls: 'badge-high' },
  normal: { label: 'Normal', cls: 'badge-normal' },
  low: { label: 'Aşağı', cls: 'badge-low' },
};

// Status badge meta = lifecycle + əlavə hallar
export const STATUS_META: Record<string, { label: string; color: string }> = (() => {
  const m: Record<string, { label: string; color: string }> = {};
  LIFECYCLE.forEach((s) => (m[s.id] = { label: s.label, color: s.color }));
  m.cancelled = { label: 'Ləğv edildi', color: '#EF4444' };
  return m;
})();

// Prioritet rəngləri (xəritə markerləri, legend, axtarış nöqtəsi)
export const PR_COLOR: Record<Priority, string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  normal: '#3B82F6',
  low: '#64748B',
};

// Activity feed tonu → rəng
export const TONE_COLOR: Record<string, string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',
  normal: '#64748B',
};

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

export const NAV: NavItem[] = [
  { id: 'cockpit', path: '/cockpit', label: 'Nərimanov Rəqəmsal Xəritəsi', icon: 'layout-dashboard' },
  { id: 'requests', path: '/requests', label: 'Daxil olan müraciətlər', icon: 'inbox', badge: 142 },
  { id: 'outgoing', path: '/sened', label: 'Göndərilən sənədlər', icon: 'send', badge: 5 },
  { id: 'yazismalar', path: '/yazismalar', label: 'Yazışmalar', icon: 'messages-square', badge: 4 },
  { id: 'arxiv', path: '/arxiv', label: 'Arxiv', icon: 'archive' },
];

// ============================================================
// L5 — Trafik sıxlığı simulyasiyası (TomTom-suz). Legend ilə eyni rəng/ad.
// lvl: 0 sərbəst → 3 tıxac. coords: [lng, lat]
// ============================================================
export const TR_LVL_COLOR = ['#4CAF50', '#F6C544', '#E84B35', '#8E1B12'];
export const TR_LVL_NAME = ['Sərbəst', 'Orta', 'Sıx', 'Tıxac'];

export interface TrafficRoad {
  name: string;
  segs: { lvl: number; coords: number[][] }[];
}

export const TRAFFIC_ROADS: TrafficRoad[] = [
  {
    name: 'Atatürk pr.',
    segs: [
      { lvl: 3, coords: [[49.8385, 40.4045], [49.83972, 40.40474], [49.84139, 40.40507], [49.84337, 40.40546], [49.84554, 40.40589], [49.84779, 40.40634], [49.84998, 40.40679], [49.852, 40.4072], [49.85388, 40.40759], [49.85575, 40.40799]] },
      { lvl: 2, coords: [[49.85575, 40.40799], [49.85761, 40.40839], [49.85945, 40.40879], [49.8613, 40.4092], [49.86315, 40.4096], [49.865, 40.41], [49.86687, 40.4104], [49.86876, 40.41079], [49.87065, 40.41119], [49.87253, 40.41159]] },
      { lvl: 1, coords: [[49.87253, 40.41159], [49.8744, 40.41199], [49.87622, 40.41239], [49.878, 40.4128], [49.87974, 40.41322], [49.88145, 40.41364], [49.88314, 40.41407], [49.88479, 40.4145], [49.8864, 40.41494], [49.88798, 40.41537]] },
      { lvl: 3, coords: [[49.88798, 40.41537], [49.8895, 40.4158], [49.89105, 40.41625], [49.89264, 40.41674], [49.89421, 40.41724], [49.8957, 40.41772], [49.89704, 40.41816], [49.89816, 40.41853], [49.899, 40.4188]] },
    ],
  },
  {
    name: 'Ziya Bünyadov pr.',
    segs: [
      { lvl: 0, coords: [[49.845, 40.3985], [49.84622, 40.39874], [49.84787, 40.39907], [49.84984, 40.39946], [49.85201, 40.39989], [49.85425, 40.40034], [49.85645, 40.40079], [49.8585, 40.4012]] },
      { lvl: 2, coords: [[49.8585, 40.4012], [49.86043, 40.40159], [49.86236, 40.40199], [49.86429, 40.40239], [49.86621, 40.40279], [49.86814, 40.4032], [49.87007, 40.4036], [49.872, 40.404]] },
      { lvl: 1, coords: [[49.872, 40.404], [49.87395, 40.4044], [49.87593, 40.40479], [49.87792, 40.40519], [49.87989, 40.40559], [49.88183, 40.40599], [49.8837, 40.40639], [49.8855, 40.4068]] },
      { lvl: 0, coords: [[49.8855, 40.4068], [49.8873, 40.40724], [49.88915, 40.40773], [49.88847, 40.40856], [49.8876, 40.40923], [49.88765, 40.40967], [49.88745, 40.41001], [49.88812, 40.4102]] },
    ],
  },
  {
    name: 'Qara Qarayev pr.',
    segs: [
      { lvl: 1, coords: [[49.852, 40.3935], [49.85327, 40.39374], [49.85498, 40.39407], [49.85702, 40.39446], [49.85927, 40.39489], [49.86159, 40.39534]] },
      { lvl: 0, coords: [[49.86159, 40.39534], [49.86388, 40.39579], [49.866, 40.3962], [49.86802, 40.39659], [49.87006, 40.39699], [49.8721, 40.39738]] },
      { lvl: 2, coords: [[49.8721, 40.39738], [49.87414, 40.39778], [49.87615, 40.39818], [49.8781, 40.39859], [49.88, 40.399], [49.88192, 40.39944]] },
      { lvl: 1, coords: [[49.88192, 40.39944], [49.88392, 40.39993], [49.88082, 40.40373], [49.88136, 40.40449], [49.88247, 40.40477], [49.88256, 40.40538]] },
      { lvl: 0, coords: [[49.88256, 40.40538], [49.88321, 40.40555]] },
    ],
  },
  {
    name: 'Koroğlu Rəhimov',
    segs: [
      { lvl: 2, coords: [[49.86492, 40.41713], [49.86522, 40.41731], [49.86579, 40.41741], [49.86644, 40.41785], [49.86719, 40.41918], [49.86885, 40.4186]] },
      { lvl: 1, coords: [[49.86885, 40.4186], [49.87048, 40.41803], [49.872, 40.4175], [49.87345, 40.41699], [49.87493, 40.41648], [49.87642, 40.41596]] },
      { lvl: 0, coords: [[49.87642, 40.41596], [49.87789, 40.41545], [49.87933, 40.41495], [49.8807, 40.41446], [49.882, 40.414], [49.88327, 40.41354]] },
      { lvl: 2, coords: [[49.88327, 40.41354], [49.88454, 40.41307], [49.88578, 40.4126], [49.88694, 40.41217], [49.88798, 40.41178], [49.88884, 40.41145]] },
      { lvl: 1, coords: [[49.88884, 40.41145], [49.8895, 40.4112]] },
    ],
  },
  {
    name: 'Təbriz küç.',
    segs: [
      { lvl: 0, coords: [[49.87, 40.4255], [49.8709, 40.42577], [49.87213, 40.42618], [49.87359, 40.42666], [49.87519, 40.42715], [49.87685, 40.42758]] },
      { lvl: 2, coords: [[49.87685, 40.42758], [49.87848, 40.42788], [49.88, 40.428], [49.88145, 40.42791], [49.88292, 40.42766], [49.88439, 40.4273]] },
      { lvl: 1, coords: [[49.88439, 40.4273], [49.88585, 40.42687], [49.88729, 40.4264], [49.88868, 40.42593], [49.89, 40.4255], [49.89132, 40.42507]] },
      { lvl: 0, coords: [[49.89132, 40.42507], [49.89266, 40.42459], [49.89399, 40.42409], [49.89524, 40.4236], [49.89636, 40.42315], [49.89729, 40.42278]] },
      { lvl: 2, coords: [[49.89729, 40.42278], [49.898, 40.4225]] },
    ],
  },
  {
    name: 'NE magistral',
    segs: [
      { lvl: 1, coords: [[49.895, 40.4185], [49.89592, 40.41877], [49.89719, 40.41913], [49.89869, 40.41956]] },
      { lvl: 1, coords: [[49.89869, 40.41956], [49.90033, 40.42004], [49.902, 40.42053], [49.90359, 40.42103]] },
      { lvl: 2, coords: [[49.90359, 40.42103], [49.905, 40.4215], [49.90632, 40.42198], [49.90766, 40.42252]] },
      { lvl: 1, coords: [[49.90766, 40.42252], [49.90899, 40.42307], [49.91024, 40.4236], [49.91136, 40.42409]] },
      { lvl: 1, coords: [[49.91136, 40.42409], [49.91229, 40.4245], [49.913, 40.4248]] },
    ],
  },
];
