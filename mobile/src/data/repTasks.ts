// Nümayəndə marşrutu/tarixçəsi API incident-lərindən qurulur.
// Yoxlama siyahısı / ETA entity-də yoxdur — burada görünüş metadatası kimi sintez olunur.
import type { Incident, Priority } from '../api/types';
import { statusMeta } from './meta';

export interface RepStop {
  id: string;
  title: string;
  cat: string;
  prio: Priority;
  addr: string;
  lat: number;
  lng: number;
  eta: string;
  type: 'standard' | 'ai';
  confidence: number | null;
  status: string;
  checklist: string[];
  photoUrls: string[]; // vətəndaşın/müraciətin yüklədiyi şəkillər
}

export interface RepHistoryItem {
  id: string;
  title: string;
  cat: string;
  addr: string;
  when: string;
  dur: string;
  ok: boolean;
  result: string;
  steps: [string, string][];
}

// Sahə nümayəndəsinin "marşrutu" = aktiv sahə statuslu müraciətlər.
export const ACTIVE_FIELD_STATUSES = ['assigned', 'enroute', 'onsite', 'inprogress'];
// Tarixçə = tamamlanmış / arxiv / ləğv.
export const TERMINAL_STATUSES = ['resolved', 'archived', 'cancelled'];

const CHECKLISTS: { match: string; items: string[] }[] = [
  { match: 'Su', items: ['Sızmanın mənbəyini təsdiqlə', 'Foto/video çək', '«Azərsu» briqadasını çağır', 'Ərazini təhlükəsizləşdir'] },
  { match: 'Drenaj', items: ['Drenaj tıxanmasını yoxla', 'Foto çək', 'Təmizlik briqadasını çağır'] },
  { match: 'Tikinti', items: ['AI nəticəsini sahədə yoxla', 'Mərtəbə sayını ölç', 'İcazə sənədini soruş', 'Qərar ver (təsdiq/rədd)'] },
  { match: 'Reklam', items: ['Reklam lövhəsini yoxla', 'Lisenziya sənədini soruş', 'Foto çək'] },
  { match: 'Yaşıllıq', items: ['Ağacı/yaşıllığı yoxla', 'Foto çək', 'Abadlıq briqadasını çağır'] },
  { match: 'İnfrastruktur', items: ['Zədəni qiymətləndir', 'Foto çək', 'Təmir briqadasını çağır'] },
  { match: 'Tullantı', items: ['Vəziyyəti qeyd et', 'Foto çək', 'Təmizlik briqadasını çağır'] },
  { match: 'Heyvan', items: ['Sayını qeyd et', 'BƏTV-yə məlumat ver'] },
  { match: 'Yol', items: ['Çuxuru/nasazlığı ölç', 'Foto çək', 'Yol xidmətini cəlb et'] },
];
const DEFAULT_CHECKLIST = ['Vəziyyəti sahədə yoxla', 'Foto çək', 'İcra qeydini yaz'];

export function checklistFor(cat: string): string[] {
  const hit = CHECKLISTS.find((c) => cat.includes(c.match));
  return hit ? hit.items : DEFAULT_CHECKLIST;
}

const ETAS = ['09:00', '10:15', '11:30', '13:00', '14:15', '15:30', '16:45'];

export function toStop(inc: Incident, i: number): RepStop {
  return {
    id: inc.id,
    title: inc.title,
    cat: inc.cat,
    prio: inc.priority,
    addr: inc.addr,
    lat: inc.lat,
    lng: inc.lng,
    eta: ETAS[i] ?? '—',
    type: inc.aiConfidence != null ? 'ai' : 'standard',
    confidence: inc.aiConfidence,
    status: inc.status,
    checklist: checklistFor(inc.cat),
    photoUrls: inc.photoUrls ?? [],
  };
}

const HHMM = /(\d{1,2}):(\d{2})/;
function toMinutes(t: string): number | null {
  const m = HHMM.exec(t);
  return m ? +m[1] * 60 + +m[2] : null;
}

// Timeline ilk→son vaxt fərqindən təxmini icra müddəti ("1s 05dəq").
export function durFromTimeline(tl: { t: string }[]): string {
  if (tl.length < 2) return '—';
  const a = toMinutes(tl[0].t);
  const b = toMinutes(tl[tl.length - 1].t);
  if (a == null || b == null) return '—';
  let d = b - a;
  if (d < 0) d += 24 * 60;
  const h = Math.floor(d / 60);
  const mm = d % 60;
  return h > 0 ? `${h}s ${String(mm).padStart(2, '0')}dəq` : `${mm} dəq`;
}

export function toHistory(inc: Incident): RepHistoryItem {
  const tl = inc.timeline ?? [];
  const last = tl[tl.length - 1];
  const ok = inc.status !== 'cancelled';
  return {
    id: inc.id,
    title: inc.title,
    cat: inc.cat,
    addr: inc.addr,
    when: last?.t ?? inc.created,
    dur: durFromTimeline(tl),
    ok,
    result: inc.cancelReason ?? last?.note ?? '—',
    steps: tl.map((s) => [statusMeta(s.step).label, s.t] as [string, string]),
  };
}
