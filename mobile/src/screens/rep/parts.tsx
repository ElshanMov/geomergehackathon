// Nümayəndə ekranları üçün ortaq kiçik UI parçaları + emerald rəng sabitləri.
import { StyleSheet, Text, View } from 'react-native';
import type { Priority } from '../../api/types';

export const FIELD = '#059669';
export const FIELD_DARK = '#047857';
export const FIELD_LIGHT = '#A7F3D0';

const P: Record<Priority, [string, string]> = {
  urgent: ['#EF4444', 'Təcili'],
  high: ['#F59E0B', 'Yüksək'],
  normal: ['#3B82F6', 'Normal'],
  low: ['#64748B', 'Aşağı'],
};

export function PrioTag({ p }: { p: Priority }) {
  const [c, label] = P[p];
  return (
    <View style={[styles.tag, { backgroundColor: c + '1A' }]}>
      <Text style={[styles.tagText, { color: c }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10.5, fontWeight: '700' },
});
