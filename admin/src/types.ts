// API model-lərinin TS qarşılığı (camelCase — API belə qaytarır). Admin tərəfi.

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string; // operator | representative | admin
  department: string;
  status: string; // active | blocked
  init: string;
  color: string;
  twoFactor: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface LdapUser {
  id: string;
  dn: string;
  cn: string;
  uid: string;
  email: string;
  ou: string;
  groups: string[];
  enabled: boolean;
  lastSync: string;
}

export interface Worker {
  id: string;
  fullName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  zone: string;
  status: string; // active | leave | inactive
  init: string;
  color: string;
  openTasks: number;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
  fullName: string;
  init: string;
  department?: string | null;
  email?: string | null;
}

// İş axını — Nameklatur (1:1 marşrut) və Marşrut (node + transition).
export interface Nomenclature {
  id: string;
  code: string;
  name: string;
  group: string;
  defaultPriority: string; // urgent | high | normal | low
  slaHours: number;
  routeId?: string | null;
  description: string;
  active: boolean;
}

export interface RouteStep {
  id: string;
  code: string;
  name: string;
  type: string; // start | normal | external | end
  role: string;
  color: string;
  x: number;
  y: number;
}

export interface RouteTransition {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: string; // internal | external
}

export interface Route {
  id: string;
  name: string;
  description: string;
  type: string; // sequential | parallel
  steps: RouteStep[];
  transitions: RouteTransition[];
}

// İmtiyazlar — rol + rol×resurs icazə matrisi.
export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface RolePermission {
  roleId: string;
  resource: string;
  resourceLabel: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// Şifrə sazlanmaları (tək konfiq).
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  expiryDays: number;
  historyCount: number;
  maxFailedAttempts: number;
  lockoutMinutes: number;
  sessionTimeoutMinutes: number;
  twoFactorRequired: boolean;
}
