// Nümayəndə → Tapşırıq tarixçəm. API-dən terminal statuslu müraciətlər → tamamlanmış işlər.
// Kart vurulduqda RN Modal bottom-sheet detalı (məlumat grid + icra addımları + nəticə).
import { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import { TERMINAL_STATUSES, toHistory } from '../../data/repTasks';
import type { RepHistoryItem } from '../../data/repTasks';
import { FIELD } from './parts';

const STATS: [string, string, string][] = [
  ['Tamamlanan', '127', FIELD],
  ['Bu həftə', '23', '#0EA5E9'],
  ['Orta vaxt', '38d', '#8B5CF6'],
];

const GRID_ICONS = ['map-pin', 'tag', 'calendar', 'timer'] as const;

export function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<RepHistoryItem[]>([]);
  const [sel, setSel] = useState<RepHistoryItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      api
        .incidents()
        .then((all) => {
          const done = all.filter((i) => TERMINAL_STATUSES.includes(i.status));
          setItems(done.map(toHistory));
        })
        .catch(() => setItems([]));
    }, []),
  );

  const gridVals = (h: RepHistoryItem) => [h.addr, h.cat, h.when, 'İcra: ' + h.dur];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Tapşırıq tarixçəm</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginBottom: 14 }}>
          {STATS.map(([label, value, color]) => (
            <View key={label} style={styles.stat}>
              <Text style={{ fontSize: 20, fontWeight: '800', color }}>{value}</Text>
              <Text style={{ fontSize: 10.5, color: colors.muted }}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 8, paddingHorizontal: 18 }}>
          {items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
              <Icon name="clock" size={28} color={colors.slate400} />
              <Text style={{ fontSize: 13, color: colors.muted }}>Tamamlanmış tapşırıq yoxdur</Text>
            </View>
          ) : (
            items.map((h) => (
              <TouchableOpacity key={h.id} onPress={() => setSel(h)} activeOpacity={0.7} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: (h.ok ? FIELD : colors.danger) + '1A' }]}>
                  <Icon name={h.ok ? 'check-check' : 'x'} size={17} color={h.ok ? FIELD : colors.danger} />
                </View>
                <View style={{ gap: 2, flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{h.title}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.muted }}>{h.addr} · {h.when}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.slate300} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={!!sel} transparent animationType="slide" onRequestClose={() => setSel(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setSel(null)}>
          <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]}>
            {sel ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.grabber} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <View style={[styles.sheetIcon, { backgroundColor: (sel.ok ? FIELD : colors.danger) + '1A' }]}>
                    <Icon name={sel.ok ? 'check-check' : 'x'} size={19} color={sel.ok ? FIELD : colors.danger} />
                  </View>
                  <View style={{ gap: 2, flex: 1 }}>
                    <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.text }}>{sel.title}</Text>
                    <Text style={{ fontSize: 11, color: FIELD }}>{sel.id}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: sel.ok ? '#ECFDF5' : colors.danger50 }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: sel.ok ? '#047857' : '#B91C1C' }}>
                      {sel.ok ? 'Həll edildi' : 'Rədd edildi'}
                    </Text>
                  </View>
                </View>

                <View style={styles.grid}>
                  {gridVals(sel).map((v, i) => (
                    <View key={i} style={styles.gridCell}>
                      <Icon name={GRID_ICONS[i]} size={14} color={colors.slate500} />
                      <Text numberOfLines={1} style={{ fontSize: 12, color: colors.text2, flex: 1 }}>{v}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.section}>İCRA ADDIMLARI</Text>
                <View style={{ marginTop: 12, marginBottom: 14 }}>
                  {sel.steps.map((s, i, arr) => {
                    const last = i === arr.length - 1;
                    return (
                      <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ alignItems: 'center', width: 18 }}>
                          <View style={[styles.dot, { backgroundColor: last ? (sel.ok ? FIELD : colors.danger) : colors.slate300 }]} />
                          {!last ? <View style={styles.line} /> : null}
                        </View>
                        <View style={{ gap: 1, paddingBottom: 14 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{s[0]}</Text>
                          <Text style={{ fontSize: 11, color: colors.muted }}>{s[1]}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.resultCard}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.muted }}>Nəticə qeydi</Text>
                  <Text style={{ fontSize: 13, color: colors.text2, lineHeight: 20, marginTop: 6 }}>{sel.result}</Text>
                </View>
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    maxHeight: '82%',
  },
  grabber: { width: 40, height: 4, borderRadius: 999, backgroundColor: colors.slate200, alignSelf: 'center', marginBottom: 14 },
  sheetIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  gridCell: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface2,
    borderRadius: 8,
  },
  section: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.4, color: colors.muted },
  dot: { width: 13, height: 13, borderRadius: 999, marginTop: 2 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, minHeight: 18 },
  resultCard: { padding: 12, backgroundColor: colors.surface2, borderRadius: 14 },
});
