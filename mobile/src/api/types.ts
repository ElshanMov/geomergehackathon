// API model-lərinin TS qarşılığı (camelCase — API belə qaytarır). web/src/types.ts ilə uyğun.

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export interface AuthUser {
  token: string;
  role: string; // 'citizen' | operator | representative | admin
  userId: string;
  fullName: string;
  init: string;
  department?: string | null;
  email?: string | null;
}

export interface NearbyProblem {
  id: string;
  title: string;
  icon: string;
  color: string;
  distanceM: number;
  addr: string;
  lng: number;
  lat: number;
}

export interface Contact {
  number: string;
  name: string;
  icon: string;
}

export interface TimelineEntry {
  step: string;
  actor: string;
  t: string;
  note: string;
}

export interface Incident {
  id: string;
  reg: string;
  title: string;
  cat: string;
  priority: Priority;
  status: string;
  layer: string;
  lng: number;
  lat: number;
  addr: string;
  created: string;
  due: string;
  reporter: string;
  assignee: string | null;
  sla: string;
  desc: string;
  photos: number;
  photoUrls?: string[];
  aiConfidence: number | null;
  cancelReason: string | null;
  timeline: TimelineEntry[];
}

export interface Message {
  id: string;
  sender: string; // 'citizen' | 'rih'
  text: string;
  t: string;
  channel: string;
}

export interface Conversation {
  id: string;
  subject: string;
  constituent: string;
  constituentInit: string;
  assigneeId: string | null;
  channel: string;
  status: string;
  updated: string;
  incidentId: string | null;
  messages: Message[];
  messageCount: number;
}

export interface GeoJsonLike {
  type: string;
  features?: { geometry: GeoGeometry }[];
  geometry?: GeoGeometry;
}
export interface GeoGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}
