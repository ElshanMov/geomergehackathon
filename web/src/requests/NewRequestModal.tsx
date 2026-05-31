// ============================================================
// Yeni müraciət modalı — operator tərəfindən qeydiyyat.
// requests.jsx-dəki NewRequestModal-ın birəbir portu. onCreate yalnız
// demo toast üçündür (API-yə yazmır — dizaynla eyni davranış).
// ============================================================
import { useState } from 'react';
import { Icon } from '../lib/icon';
import { PRIORITY_META } from '../data/meta';
import type { Priority } from '../types';

export interface NewRequestData {
  title: string;
  cat: string;
  prio: Priority;
  addr: string;
  desc: string;
}

const CATS = [
  'Kommunal / Su təchizatı',
  'Şəhərsalma / Qanunsuz tikinti',
  'Abadlıq / Yaşıllıq',
  'Nəqliyyat / Yol infrastrukturu',
  'Təmizlik / Tullantı',
  'Sanitar / Heyvanlar',
  'İşıqlandırma',
];

const SRC: [string, string, string][] = [
  ['phone', 'Telefon (155)', 'phone'],
  ['citizen', 'Vətəndaş tətbiqi', 'smartphone'],
  ['field', 'Sahə monitorinqi', 'user-round'],
  ['ai', 'AI aşkarlama', 'scan-line'],
];

export function NewRequestModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: NewRequestData) => void;
}) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('');
  const [prio, setPrio] = useState<Priority>('normal');
  const [addr, setAddr] = useState('');
  const [desc, setDesc] = useState('');
  const [src, setSrc] = useState('phone');
  const valid = title.trim() !== '' && addr.trim() !== '';

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .18s', padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 520, maxWidth: '96vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="row gap-2">
            <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-50)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={17} />
            </span>
            <div className="col" style={{ gap: 1 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700 }}>Yeni müraciət</span>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Operator tərəfindən qeydiyyat</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="col gap-3" style={{ padding: 20, overflowY: 'auto' }}>
          <div className="col gap-2">
            <label style={{ fontSize: 12, fontWeight: 600 }}>Mənbə</label>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {SRC.map(([id, l, ic]) => (
                <button
                  key={id}
                  onClick={() => setSrc(id)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    borderColor: src === id ? 'var(--accent)' : undefined,
                    color: src === id ? 'var(--accent-600)' : undefined,
                    background: src === id ? 'var(--accent-50)' : undefined,
                  }}
                >
                  <Icon name={ic} size={14} />
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="col gap-2">
            <label style={{ fontSize: 12, fontWeight: 600 }}>
              Başlıq <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Məs: Su sızması — magistral boru qəzası" />
          </div>

          <div className="row gap-3">
            <div className="col gap-2" style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Kateqoriya</label>
              <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">Təsnif edilməyib</option>
                {CATS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col gap-2" style={{ width: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Prioritet</label>
              <select className="select" value={prio} onChange={(e) => setPrio(e.target.value as Priority)}>
                {Object.entries(PRIORITY_META).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="col gap-2">
            <label style={{ fontSize: 12, fontWeight: 600 }}>
              Ünvan <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Küçə, bina — Nərimanov rayonu" />
          </div>

          <div className="col gap-2">
            <label style={{ fontSize: 12, fontWeight: 600 }}>Təsvir</label>
            <textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Problemin qısa təsviri…" style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Ləğv</button>
          <button className="btn btn-accent" disabled={!valid} onClick={() => onCreate({ title, cat, prio, addr, desc })} style={{ opacity: valid ? 1 : 0.5 }}>
            <Icon name="check" size={16} />
            Qeydiyyata al
          </button>
        </div>
      </div>
    </div>
  );
}
