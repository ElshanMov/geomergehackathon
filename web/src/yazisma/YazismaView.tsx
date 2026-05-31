// ============================================================
// Yazışmalar — Vətəndaş ↔ RİH inbox (İDDA Gateway kanalları:
// in-app / SMS / push). yazisma.jsx-in API-yə bağlı portu:
// konversasiyalar /conversations-dan gəlir, mesaj göndərmək
// POST /conversations/{id}/messages ilə real round-trip edir.
// ============================================================
import { useEffect, useState } from 'react';
import { Icon } from '../lib/icon';
import { api } from '../api/client';
import type { Conversation } from '../types';

const CONV_FILTERS: [string, string][] = [
  ['all', 'Hamısı'],
  ['new', 'Yeni'],
  ['needsReply', 'Cavab gözləyir'],
  ['waiting', 'Gözləmədə'],
];

// status → [rəng, etiket]
const CONV_STATUS_META: Record<string, [string, string]> = {
  new: ['#0EA5E9', 'Yeni'],
  needsReply: ['#F59E0B', 'Cavab gözləyir'],
  waiting: ['#64748B', 'Gözləmədə'],
};

const CHANNELS: [string, string][] = [
  ['inapp', 'In-app'],
  ['sms', 'SMS'],
  ['push', 'Push'],
];

// Avatar rəngi — id-dən deterministik (API-də rəng saxlanmır).
const AVATAR_PALETTE = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];
const colorFor = (s: string) =>
  AVATAR_PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length];

export function YazismaView() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState('');
  const [chan, setChan] = useState('inapp');
  const [txt, setTxt] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .conversations()
      .then((list) => {
        if (!alive) return;
        setConvs(list);
        setActive((cur) => cur || list[0]?.id || '');
      })
      .catch((e) => console.warn('yazışmalar yüklənmədi:', e));
    return () => { alive = false; };
  }, []);

  const list = convs.filter((c) => filter === 'all' || c.status === filter);
  const conv = convs.find((c) => c.id === active);
  const msgs = conv ? conv.messages : [];

  const send = async () => {
    if (!txt.trim() || !conv || sending) return;
    const body = { text: txt.trim(), sender: 'rih', channel: chan };
    setTxt('');
    setSending(true);
    try {
      const updated = await api.sendMessage(conv.id, body);
      setConvs((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) {
      console.warn('mesaj göndərilmədi:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 320px 1fr', height: '100%', minHeight: 0 }}>
      {/* Filters */}
      <div className="col" style={{ gap: 4, padding: 14, borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', padding: '4px 8px' }}>Filtr</span>
        {CONV_FILTERS.map(([id, lbl]) => {
          const c = id === 'all' ? convs.length : convs.filter((x) => x.status === id).length;
          const isActive = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="row"
              style={{ gap: 8, padding: '8px 10px', borderRadius: 8, border: 0, width: '100%', textAlign: 'left', cursor: 'pointer', background: isActive ? 'var(--accent-50)' : 'none', color: isActive ? 'var(--accent-600)' : 'var(--text-2)', fontWeight: isActive ? 600 : 500, fontSize: 12.5 }}
            >
              <span style={{ flex: 1 }}>{lbl}</span>
              <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{c}</span>
            </button>
          );
        })}
      </div>

      {/* Conversation list */}
      <div className="col" style={{ minWidth: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Yazışmalar</span>
          <span className="badge badge-urgent">{convs.filter((c) => c.status !== 'waiting').length} aktiv</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.map((c) => {
            const meta = CONV_STATUS_META[c.status] ?? ['#64748B', c.status];
            const sel = active === c.id;
            const last = c.messages[c.messages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className="row"
                style={{ gap: 11, padding: '11px 14px', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid var(--slate-100)', borderLeft: '3px solid ' + (sel ? 'var(--accent)' : 'transparent'), background: sel ? 'var(--accent-50)' : 'none', cursor: 'pointer', alignItems: 'flex-start' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: colorFor(c.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{c.constituentInit}</div>
                <div className="col" style={{ gap: 3, flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{c.constituent}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--slate-400)' }}>{c.updated}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{last?.text ?? ''}</span>
                  <div className="row gap-2">
                    <span className="badge" style={{ background: meta[0] + '1a', color: meta[0], fontSize: 10, padding: '2px 6px' }}>{meta[1]}</span>
                    {c.incidentId && <span className="mono" style={{ fontSize: 10, color: 'var(--accent-600)' }}>{c.incidentId}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
        {conv && (
          <>
            <div className="row" style={{ justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div className="row gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: colorFor(conv.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{conv.constituentInit}</div>
                <div className="col" style={{ gap: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{conv.constituent}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{conv.subject}{conv.incidentId ? ' · ' + conv.incidentId : ''}</span>
                </div>
              </div>
              <div className="row gap-2" style={{ background: 'var(--slate-100)', borderRadius: 8, padding: 3 }}>
                {CHANNELS.map(([id, l]) => (
                  <button key={id} onClick={() => setChan(id)} style={{ border: 0, padding: '5px 11px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: chan === id ? '#fff' : 'transparent', color: chan === id ? 'var(--text)' : 'var(--muted)', boxShadow: chan === id ? 'var(--shadow-sm)' : 'none' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--surface-2)' }}>
              {msgs.map((m, i) => {
                const me = m.sender === 'rih';
                return (
                  <div key={m.id || i} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '68%' }}>
                    <div style={{ padding: '9px 13px', borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: me ? 'var(--accent)' : '#fff', color: me ? '#fff' : 'var(--text)', fontSize: 13, lineHeight: 1.45, boxShadow: 'var(--shadow-sm)', border: me ? 0 : '1px solid var(--border)' }}>{m.text}</div>
                    <span style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 3, display: 'block', textAlign: me ? 'right' : 'left' }}>{me ? 'RİH · ' : ''}{m.t}</span>
                  </div>
                );
              })}
            </div>
            <div className="row gap-2" style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="input" placeholder={'Cavab yaz (' + chan + ')…'} />
              <button onClick={send} className="btn btn-accent" disabled={sending}><Icon name="send" size={16} />Göndər</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
