// Vətəndaş → Müraciət detalı. Şaquli mərhələ tarixçəsi (API timeline + qalan lifecycle addımları).
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { api } from '../../api/client';
import type { Incident } from '../../api/types';
import { statusMeta } from '../../data/meta';
import { Icon } from '../../components/Icon';
import { Card, PriorityDot } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { CitizenNav, CitizenStackParamList } from '../../navigation/types';

interface Step {
  label: string;
  sub: string;
  time: string;
  done: boolean;
  cur: boolean;
}

// Yalnız real baş vermiş əməliyyatlar (timeline) göstərilir — gələcək/gözlənilən
// lifecycle addımları siyahıya əlavə edilmir. Yeni status əlavə olunduqca davamlı uzanır.
function buildSteps(inc: Incident): Step[] {
  return inc.timeline.map((e, i) => ({
    label: statusMeta(e.step).label,
    sub: e.note || '—',
    time: e.t,
    done: true,
    cur: i === inc.timeline.length - 1 && inc.status !== 'archived',
  }));
}

export function RequestDetailScreen() {
  const nav = useNavigation<CitizenNav>();
  const route = useRoute<RouteProp<CitizenStackParamList, 'RequestDetail'>>();
  const { incidentId } = route.params;
  const [inc, setInc] = useState<Incident | null>(null);

  useEffect(() => {
    api.incident(incidentId).then(setInc).catch(() => undefined);
  }, [incidentId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ gap: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Müraciət detalı</Text>
          {inc ? (
            <Text style={styles.mono}>
              {inc.id} · reyestr {inc.reg}
            </Text>
          ) : null}
        </View>
      </View>

      {!inc ? (
        <Text style={[styles.muted, { padding: 20 }]}>Yüklənir…</Text>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Card style={{ padding: 14, marginBottom: 16, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PriorityDot priority={inc.priority} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 }}>
                  {inc.title}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="map-pin" size={14} color={colors.muted} />
                <Text style={styles.muted}>{inc.addr}</Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="tag" size={14} color={colors.muted} />
                <Text style={styles.muted}>{inc.cat}</Text>
              </View>
            </Card>

            {inc.photoUrls && inc.photoUrls.length > 0 ? (
              <View style={{ marginBottom: 16, gap: 8 }}>
                <Text style={styles.sectionLabel}>ƏLAVƏ EDİLƏN ŞƏKİLLƏR</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {inc.photoUrls.map((src, i) => (
                    <Image key={i} source={{ uri: src }} style={styles.photo} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>GEDİŞ TARİXÇƏSİ</Text>
            <View style={{ marginTop: 14 }}>
              {buildSteps(inc).map((st, i, arr) => {
                const dotColor = st.done ? (st.cur ? '#F97316' : '#10B981') : '#fff';
                const borderColor = st.done
                  ? st.cur
                    ? '#F97316'
                    : '#10B981'
                  : colors.borderStrong;
                return (
                  <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
                    <View style={{ alignItems: 'center', width: 22 }}>
                      <View
                        style={[styles.dot, { backgroundColor: dotColor, borderColor }]}
                      >
                        {st.done && !st.cur ? (
                          <Icon name="check" size={9} color="#fff" />
                        ) : st.cur ? (
                          <View style={styles.dotInner} />
                        ) : null}
                      </View>
                      {i < arr.length - 1 ? (
                        <View
                          style={[
                            styles.connector,
                            { backgroundColor: st.done ? '#10B981' : colors.border },
                          ]}
                        />
                      ) : null}
                    </View>
                    <View style={{ gap: 2, paddingBottom: 18, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13.5,
                          fontWeight: '600',
                          color: st.done ? colors.text : colors.slate400,
                        }}
                      >
                        {st.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>{st.sub}</Text>
                      <Text style={styles.monoSmall}>{st.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => nav.navigate('Chat', { incidentId: inc.id, title: 'Nümayəndə' })}
            >
              <Icon name="message-circle" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '700' }}>
                Nümayəndə ilə yazış
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  mono: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  monoSmall: { fontSize: 10.5, color: colors.slate400 },
  muted: { fontSize: 12.5, color: colors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photo: { width: 150, height: 110, borderRadius: 10, backgroundColor: colors.slate100 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.muted,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  connector: { width: 2, flex: 1, marginVertical: 2, minHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  chatBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
