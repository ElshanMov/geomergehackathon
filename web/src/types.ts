// API model-lərinin TS qarşılığı (camelCase — API belə qaytarır).

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export interface Actor {
  id: string;
  name: string;
  role: string;
  init: string;
  color: string;
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

export type LayerGroup = 'operativ' | 'elave';

export interface Layer {
  id: string;
  name: string;
  icon: string;
  on: boolean;
  color: string;
  group: LayerGroup;
}

export type FeatureKind = 'marker' | 'radius' | 'line' | 'polygon' | 'heat';

export interface LayerFeature {
  layerId: string;
  kind: FeatureKind;
  lng: number | null;
  lat: number | null;
  color: string;
  meters: number | null;
  icon: string | null;
  halo: boolean;
  label: string | null;
  sub: string | null;
  coords: number[][] | null;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  delta: number;
  unit: string;
  tone: string;
  spark: number[];
}

export interface FeedItem {
  t: string;
  actor: string;
  text: string;
  tone: string;
  id: string;
}

export interface Weather {
  temp: number;
  cond: string;
  rain: number;
  wind: number;
  flood: string;
}

export interface DashboardSummary {
  kpis: Kpi[];
  feed: FeedItem[];
  weather: Weather;
  traffic: number[];
  open: number;
  urgent: number;
  resolvedToday: number;
  slaRisk: number;
}

export interface LifecycleStep {
  id: string;
  label: string;
  color: string;
}

// Vətəndaş ↔ RİH yazışması (Konversasiyalar inbox)
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
  status: string; // 'new' | 'needsReply' | 'waiting'
  updated: string;
  incidentId: string | null;
  messages: Message[];
  messageCount: number;
}

// İDDA Gateway — RİH-in göndərdiyi (gedən) sənədlər
export interface IddaStep {
  status: string;
  t: string;
  actor: string;
  note: string;
}

export interface IddaDocument {
  id: string;
  subject: string;
  content: string;
  recipientOrg: string;
  recipientType: string; // 'org' | 'person'
  sender: string;
  signatureType: string; // 'SIMA' | 'ASAN'
  status: string;
  createdAt: string;
  incidentId: string | null;
  timeline: IddaStep[];
}
