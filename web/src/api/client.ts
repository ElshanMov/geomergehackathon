// NərimanovOps API — fetch klienti. Bütün data mock API-dan gəlir (SQL yoxdur).
import type {
  Actor,
  Conversation,
  DashboardSummary,
  IddaDocument,
  Incident,
  Layer,
  LayerFeature,
  LifecycleStep,
} from '../types';

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:5131/api';

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status} ${r.statusText}`);
  return (await r.json()) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status} ${r.statusText}`);
  return (await r.json()) as T;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status} ${r.statusText}`);
  return (await r.json()) as T;
}

export interface IncidentFilters {
  status?: string;
  assignee?: string;
  layer?: string;
  priority?: string;
  reporter?: string;
  q?: string;
}

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  base: API_BASE,
  geoUrl: `${API_BASE}/geo/narimanov`,

  actors: () => get<Actor[]>('/actors'),
  layers: () => get<Layer[]>('/layers'),
  layerFeatures: (layerId?: string) =>
    get<LayerFeature[]>(`/layers/features${layerId ? `?layerId=${layerId}` : ''}`),

  incidents: (f: IncidentFilters = {}) => get<Incident[]>(`/incidents${qs(f as Record<string, string | undefined>)}`),
  incident: (id: string) => get<Incident>(`/incidents/${id}`),
  createIncident: (body: {
    title: string;
    desc?: string;
    cat?: string;
    priority?: string;
    addr?: string;
    lng?: number;
    lat?: number;
    reporter?: string;
    assignee?: string;
    photos?: number;
  }) => post<Incident>('/incidents', body),
  // Operator qərarı (təsnif/təyin/ləğv) — accept|reject, Note məcburi.
  decideIncident: (
    id: string,
    body: { decision: 'accept' | 'reject'; cat?: string; priority?: string; assignee?: string | null; due?: string; note: string },
  ) => post<Incident>(`/incidents/${id}/decision`, body),
  // Sahə redaktəsi (drawer İdarəetmə) — statusu dəyişmədən yenilə.
  patchIncident: (
    id: string,
    body: { cat?: string; priority?: string; due?: string; assignee?: string | null; assigneeSet?: boolean },
  ) => patch<Incident>(`/incidents/${id}`, body),
  // Statusu birbaşa irəli apar.
  advanceStatus: (id: string, body: { status: string; actor?: string; note?: string }) =>
    post<Incident>(`/incidents/${id}/status`, body),

  dashboardSummary: () => get<DashboardSummary>('/dashboard/summary'),
  lifecycle: () => get<LifecycleStep[]>('/dashboard/lifecycle'),

  conversations: (f: { status?: string; assigneeId?: string } = {}) =>
    get<Conversation[]>(`/conversations${qs(f as Record<string, string | undefined>)}`),
  conversation: (id: string) => get<Conversation>(`/conversations/${id}`),
  sendMessage: (id: string, body: { text: string; sender?: string; channel?: string }) =>
    post<Conversation>(`/conversations/${id}/messages`, body),

  // İDDA Gateway — göndərilən (gedən) sənədlər
  idda: (f: { status?: string } = {}) =>
    get<IddaDocument[]>(`/idda${qs(f as Record<string, string | undefined>)}`),
  iddaDoc: (id: string) => get<IddaDocument>(`/idda/${id}`),
  createIdda: (body: {
    subject: string;
    content: string;
    recipientOrg: string;
    recipientType?: string;
    signatureType?: string;
    incidentId?: string;
  }) => post<IddaDocument>('/idda', body),

  geoBoundary: () => get<GeoJsonLike>('/geo/narimanov'),
};

// GeoJSON üçün minimal tip — maska üçün kifayətdir.
export interface GeoJsonLike {
  type: string;
  features?: { geometry: GeoGeometry }[];
  geometry?: GeoGeometry;
  coordinates?: number[][][] | number[][][][];
}
export interface GeoGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}
