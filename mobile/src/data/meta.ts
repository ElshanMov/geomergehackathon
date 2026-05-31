// Görünüş sabitləri — API-dan gəlməyən etiket/rəng. web/src/data/meta.ts ilə uyğun.
import type { Priority } from '../api/types';

// Nərimanov rayonu approx mərkəz — [lng, lat]
export const NRM_CENTER: [number, number] = [49.87094, 40.40985];

// Spotlight maskası üçün fallback sərhəd (geo API əlçatmazsa) — [lng, lat]
export const NRM_BOUNDARY: number[][] = [
  [49.819, 40.418], [49.824, 40.4255], [49.833, 40.43], [49.844, 40.4325],
  [49.854, 40.435], [49.864, 40.4335], [49.873, 40.429], [49.881, 40.422],
  [49.8855, 40.414], [49.889, 40.406], [49.885, 40.399], [49.876, 40.3945],
  [49.866, 40.3915], [49.856, 40.39], [49.846, 40.3915], [49.837, 40.395],
  [49.829, 40.3995], [49.823, 40.406], [49.8195, 40.412], [49.819, 40.418],
];

export interface LifecycleStep {
  id: string;
  label: string;
  color: string;
}

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

export const PRIORITY_META: Record<Priority, { label: string; bg: string; fg: string }> = {
  urgent: { label: 'Təcili', bg: '#FEE2E2', fg: '#B91C1C' },
  high: { label: 'Yüksək', bg: '#FEF3C7', fg: '#B45309' },
  normal: { label: 'Normal', bg: '#DBEAFE', fg: '#1D4ED8' },
  low: { label: 'Aşağı', bg: '#F1F5F9', fg: '#475569' },
};

export const PR_COLOR: Record<Priority, string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  normal: '#3B82F6',
  low: '#64748B',
};

// status kodu → {label, color} (lifecycle + əlavə hallar)
export const STATUS_META: Record<string, { label: string; color: string }> = (() => {
  const m: Record<string, { label: string; color: string }> = {};
  LIFECYCLE.forEach((s) => (m[s.id] = { label: s.label, color: s.color }));
  m.cancelled = { label: 'Ləğv edildi', color: '#EF4444' };
  return m;
})();

export function statusMeta(id: string): { label: string; color: string } {
  return STATUS_META[id] ?? { label: id, color: '#64748B' };
}
