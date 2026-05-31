// Vətəndaş → Müraciətlərim. İstifadəçinin öz müraciətləri (reporter ada görə filtr).
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api } from '../../api/client';
import type { Incident } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { Card, PriorityDot, StatusBadge } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { CitizenNav } from '../../navigation/types';

export function MyRequestsScreen() {
  const nav = useNavigation<CitizenNav>();
  const { user } = useAuth();
  const firstName = (user?.fullName ?? 'Anar Səfərov').split(' ')[0];
  const [rows, setRows] = useState<Incident[] | null>(null);

  // Ekrana hər qayıdışda yenilə (yeni müraciət dərhal siyahıya düşsün).
  useFocusEffect(
    useCallback(() => {
      api
        .incidents()
        .then((all) => setRows(all.filter((i) => i.reporter.includes(firstName))))
        .catch(() => setRows([]));
    }, [firstName]),
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
        <Text style={styles.h1}>Müraciətlərim</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 28, gap: 12 }}>
        {rows === null ? (
          <Text style={styles.muted}>Yüklənir…</Text>
        ) : rows.length === 0 ? (
          <Card style={{ padding: 24 }}>
            <Text style={styles.muted}>Hələ müraciətiniz yoxdur.</Text>
          </Card>
        ) : (
          rows.map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.7}
              onPress={() => nav.navigate('RequestDetail', { incidentId: r.id })}
            >
              <Card style={{ padding: 14, gap: 10 }}>
                <View style={styles.row}>
                  <Text style={styles.mono}>{r.id}</Text>
                  <StatusBadge status={r.status} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <PriorityDot priority={r.priority} />
                  <Text style={{ fontSize: 14.5, fontWeight: '600', color: colors.text, flex: 1 }}>
                    {r.title}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {r.cat} · {r.created}
                  </Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.accent600 }}>
                    {r.timeline.length} addım
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  muted: { fontSize: 13, color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mono: { fontSize: 11.5, color: colors.accent600, fontWeight: '600' },
});
