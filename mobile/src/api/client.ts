// NərimanovOps API — RN fetch klienti. Bütün data mock API-dan gəlir (SQL yoxdur).
// Fiziki telefon host-a kompüterin Wi-Fi (LAN) IP-si ilə çıxır; Android emulyatoru üçün xüsusi alias 10.0.2.2.
import { Platform } from 'react-native';
import type {
  AuthUser,
  Contact,
  Conversation,
  GeoJsonLike,
  Incident,
  NearbyProblem,
} from './types';

const LAN_HOST = '172.25.97.53'; // kompüterin Wi-Fi IP-si — şəbəkə dəyişəndə bu sətri yenilə
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : LAN_HOST;
export const API_BASE = `http://${DEFAULT_HOST}:5131/api`;

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return (await r.json()) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let msg = `${r.status}`;
    try {
      const j = (await r.json()) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* gövdə yoxdur */
    }
    throw new Error(msg);
  }
  return (await r.json()) as T;
}

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export interface IncidentFilters {
  status?: string;
  reporter?: string;
  assignee?: string;
  priority?: string;
  q?: string;
}

export const api = {
  base: API_BASE,

  login: (body: { username: string; password: string; role: string }) =>
    post<AuthUser>('/auth/login', body),

  nearby: () => get<NearbyProblem[]>('/mobile/nearby'),
  contacts: () => get<Contact[]>('/mobile/contacts'),

  incidents: (f: IncidentFilters = {}) =>
    get<Incident[]>(`/incidents${qs(f as Record<string, string | undefined>)}`),
  incident: (id: string) => get<Incident>(`/incidents/${id}`),

  // Vətəndaş müraciəti → real API (web kokpit + mobil xəritə dərhal əks etdirir).
  createIncident: (body: {
    title: string;
    desc?: string;
    cat?: string;
    priority?: string;
    addr?: string;
    lat?: number;
    lng?: number;
    reporter?: string;
    photos?: number;
    photoUrls?: string[];
  }) => post<Incident>('/incidents', body),

  // Sahə nümayəndəsi əməliyyatları → real API (kokpit dərhal əks etdirir).
  advanceStatus: (id: string, body: { status: string; actor?: string; note?: string }) =>
    post<Incident>(`/incidents/${id}/status`, body),
  decide: (
    id: string,
    body: { decision: 'accept' | 'reject'; note: string; cat?: string; priority?: string; assignee?: string; due?: string },
  ) => post<Incident>(`/incidents/${id}/decision`, body),

  conversations: (f: { status?: string; assigneeId?: string } = {}) =>
    get<Conversation[]>(`/conversations${qs(f as Record<string, string | undefined>)}`),
  conversation: (id: string) => get<Conversation>(`/conversations/${id}`),
  sendMessage: (id: string, body: { text: string; sender?: string; channel?: string }) =>
    post<Conversation>(`/conversations/${id}/messages`, body),

  geoBoundary: () => get<GeoJsonLike>('/geo/narimanov'),
};
