// Admin → Şifrə sazlanmaları. Tək parol siyasəti konfiqurasiyası (GET/PUT).
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import type { PasswordPolicy } from '../types';
import { Icon } from '../lib/icon';
import { PageHeader } from '../components/PageBits';
import { Field, FormGrid } from '../components/Field';
import { useToast } from '../components/Toast';

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="card col" style={{ padding: 20, gap: 16 }}>
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{hint}</span>
      </div>
      <FormGrid>{children}</FormGrid>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="col" style={{ gap: 6 }}>
      <span className="label" style={{ marginBottom: 0, visibility: 'hidden' }}>.</span>
      <label className="row gap-2" style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', height: 38 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16 }} />
        {label}
      </label>
    </div>
  );
}

export function PasswordPolicyPage() {
  const toast = useToast();
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.passwordPolicy().then(setPolicy).catch((e) => console.warn('parol siyasəti yüklənmədi:', e));
  }, []);

  const set = (patch: Partial<PasswordPolicy>) => setPolicy((p) => (p ? { ...p, ...patch } : p));
  const num = (v: string, min = 0) => Math.max(min, Number(v) || 0);

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const saved = await api.updatePasswordPolicy(policy);
      setPolicy(saved);
      toast.push('Şifrə siyasəti yadda saxlanıldı');
    } catch (e) {
      toast.push('Saxlanmadı', 'error');
      console.warn(e);
    } finally {
      setSaving(false);
    }
  };

  if (!policy) {
    return (
      <div className="col gap-4">
        <PageHeader title="Şifrə sazlanmaları" subtitle="Parol siyasəti və giriş təhlükəsizliyi" />
        <div className="card" style={{ padding: 28, color: 'var(--muted)' }}>Yüklənir…</div>
      </div>
    );
  }

  return (
    <div className="col gap-4" style={{ maxWidth: 760 }}>
      <PageHeader
        title="Şifrə sazlanmaları"
        subtitle="Parol siyasəti və giriş təhlükəsizliyi — bütün hesablara tətbiq olunur"
        action={
          <button className="btn btn-accent" onClick={save} disabled={saving}>
            <Icon name="save" size={15} />
            {saving ? 'Saxlanılır…' : 'Yadda saxla'}
          </button>
        }
      />

      <Section title="Parol tələbləri" hint="Yeni parol bu meyarlara cavab verməlidir.">
        <Field label="Minimal uzunluq (simvol)">
          <input className="input mono" type="number" min={4} value={policy.minLength} onChange={(e) => set({ minLength: num(e.target.value, 4) })} />
        </Field>
        <Field label="Tarixçə (təkrar olunmayan)">
          <input className="input mono" type="number" min={0} value={policy.historyCount} onChange={(e) => set({ historyCount: num(e.target.value) })} />
        </Field>
        <Check label="Böyük hərf tələb et (A-Z)" checked={policy.requireUppercase} onChange={(v) => set({ requireUppercase: v })} />
        <Check label="Kiçik hərf tələb et (a-z)" checked={policy.requireLowercase} onChange={(v) => set({ requireLowercase: v })} />
        <Check label="Rəqəm tələb et (0-9)" checked={policy.requireDigit} onChange={(v) => set({ requireDigit: v })} />
        <Check label="Xüsusi simvol tələb et (!@#…)" checked={policy.requireSpecial} onChange={(v) => set({ requireSpecial: v })} />
      </Section>

      <Section title="Etibarlılıq müddəti" hint="Parolun nə vaxt yenilənməli olduğunu müəyyən edir.">
        <Field label="Bitmə müddəti (gün)">
          <input className="input mono" type="number" min={0} value={policy.expiryDays} onChange={(e) => set({ expiryDays: num(e.target.value) })} />
        </Field>
        <Field label="Sessiya vaxtı (dəqiqə)">
          <input
            className="input mono"
            type="number"
            min={1}
            value={policy.sessionTimeoutMinutes}
            onChange={(e) => set({ sessionTimeoutMinutes: num(e.target.value, 1) })}
          />
        </Field>
      </Section>

      <Section title="Giriş təhlükəsizliyi" hint="Uğursuz cəhdlər və bloklama qaydaları.">
        <Field label="Maksimal uğursuz cəhd">
          <input
            className="input mono"
            type="number"
            min={1}
            value={policy.maxFailedAttempts}
            onChange={(e) => set({ maxFailedAttempts: num(e.target.value, 1) })}
          />
        </Field>
        <Field label="Bloklama müddəti (dəqiqə)">
          <input
            className="input mono"
            type="number"
            min={1}
            value={policy.lockoutMinutes}
            onChange={(e) => set({ lockoutMinutes: num(e.target.value, 1) })}
          />
        </Field>
        <Check label="İki faktorlu doğrulama (2FA) məcburi" checked={policy.twoFactorRequired} onChange={(v) => set({ twoFactorRequired: v })} />
      </Section>
    </div>
  );
}
