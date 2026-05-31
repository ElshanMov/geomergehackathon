// Paylaşılan UI primitivləri — kart, badge, prioritet nöqtəsi, avatar.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme/tokens';
import { PR_COLOR, PRIORITY_META, statusMeta } from '../data/meta';
import type { Priority } from '../api/types';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  bg,
  fg,
  dot,
  children,
}: {
  bg: string;
  fg: string;
  dot?: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot ? <View style={[styles.badgeDot, { backgroundColor: dot }]} /> : null}
      <Text style={[styles.badgeText, { color: fg }]}>{children}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <Badge bg={m.color + '1A'} fg={m.color} dot={m.color}>
      {m.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <Badge bg={m.bg} fg={m.fg}>
      {m.label}
    </Badge>
  );
}

export function NeutralBadge({ children }: { children: ReactNode }) {
  return (
    <Badge bg={colors.slate100} fg={colors.slate600}>
      {children}
    </Badge>
  );
}

export function PriorityDot({ priority }: { priority: Priority }) {
  return <View style={[styles.prioDot, { backgroundColor: PR_COLOR[priority] }]} />;
}

export function Avatar({
  init,
  size = 40,
  bg = colors.accent,
}: {
  init: string;
  size?: number;
  bg?: string;
}) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{init}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  prioDot: { width: 8, height: 8, borderRadius: 4 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
});
