/* ============================================================
   Rəqəmsal Nərimanov — Mobile design tokens (RN üçün)
   tokens.css ilə eyni palitra. Citizen = accent (mavi), Rep = success (yaşıl).
   ============================================================ */

export const colors = {
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',

  accent: '#0EA5E9',
  accent600: '#0284C7',
  accent50: '#E0F2FE',
  success: '#10B981',
  success50: '#D1FAE5',
  warning: '#F59E0B',
  warning50: '#FEF3C7',
  danger: '#EF4444',
  danger50: '#FEE2E2',
  info: '#3B82F6',
  info50: '#DBEAFE',
  violet: '#8B5CF6',
  violet50: '#EDE9FE',

  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  text: '#0F172A',
  text2: '#475569',
  muted: '#6B7280',
  white: '#FFFFFF',
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xl2: 20,
  pill: 999,
};

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s6: 24,
  s8: 32,
  s12: 48,
  s16: 64,
};

export const font = {
  size: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, display: 32 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800' } as const,
};

export const shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
};

/* Prioritet badge rəngləri (data.js NRM_PRIORITY_META ilə uyğun) */
export const priorityMeta: Record<string, { label: string; bg: string; fg: string }> = {
  urgent: { label: 'Təcili', bg: colors.danger50, fg: '#B91C1C' },
  high: { label: 'Yüksək', bg: colors.warning50, fg: '#B45309' },
  normal: { label: 'Normal', bg: colors.info50, fg: '#1D4ED8' },
  low: { label: 'Aşağı', bg: colors.slate100, fg: colors.slate600 },
};

/* Rol əsaslı brend rəngi */
export const roleColor = {
  citizen: colors.accent,
  rih: colors.success,
};
