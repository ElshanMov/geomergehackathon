// Vətəndaş → Ana səhifə. Başlıq + "Problem bildir" CTA, yaxınlıqdakı problemlər, aktiv müraciət.
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../api/client';
import type { Incident, NearbyProblem } from '../../api/types';
import { LIFECYCLE } from '../../data/meta';
import { useAuth } from '../../auth/AuthContext';
import { Icon } from '../../components/Icon';
import { Card, NeutralBadge, StatusBadge } from '../../components/ui';
import { colors, radius } from '../../theme/tokens';
import type { CitizenNav } from '../../navigation/types';

function progressPct(status: string): number {
  const i = LIFECYCLE.findIndex((s) => s.id === status);
  if (i < 0) return status === 'resolved' || status === 'archived' ? 100 : 30;
  return Math.round(((i + 1) / LIFECYCLE.length) * 100);
}

export function HomeScreen() {
  const nav = useNavigation<CitizenNav>();
  const { user } = useAuth();
  const firstName = (user?.fullName ?? 'Anar Səfərov').split(' ')[0];
  const [nearby, setNearby] = useState<NearbyProblem[]>([]);
  const [active, setActive] = useState<Incident | null>(null);

  useEffect(() => {
    api.nearby().then(setNearby).catch(() => undefined);
    api
      .incidents()
      .then((all) => {
        const mine = all.filter((i) => i.reporter.includes(firstName));
        const open = mine.find(
          (i) => !['resolved', 'archived', 'cancelled'].includes(i.status),
        );
        setActive(open ?? mine[0] ?? null);
      })
      .catch(() => undefined);
  }, [firstName]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 13, color: colors.slate400 }}>Salam, {firstName} 👋</Text>
            <Text style={styles.headerTitle}>Nərimanov rayonu</Text>
          </View>
          <View style={styles.bell}>
            <Icon name="bell" size={18} color="#fff" />
            <View style={styles.bellDot} />
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => nav.navigate('RequestCreator')}>
          <View style={styles.ctaIcon}>
            <Icon name="camera" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 15.5, fontWeight: '700', color: '#fff' }}>Problem bildir</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              Şəkil çək — ünvan avtomatik təyin olunur
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nearby */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Yaxınlıqdakı problemlər</Text>
          <TouchableOpacity onPress={() => nav.navigate('Map')}>
            <Text style={styles.link}>Xəritədə</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 8 }}>
          {nearby.map((n) => (
            <Card key={n.id} style={styles.nearbyCard}>
              <View style={[styles.nearbyIcon, { backgroundColor: n.color + '1A' }]}>
                <Icon name={n.icon} size={19} color={n.color} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{n.title}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {n.distanceM} m · {n.addr}
                </Text>
              </View>
              <NeutralBadge>Açıq</NeutralBadge>
            </Card>
          ))}
        </View>
      </View>

      {/* Active request */}
      {active ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}>
          <Text style={styles.sectionTitle}>Aktiv müraciətim</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => nav.navigate('RequestDetail', { incidentId: active.id })}
          >
            <Card style={{ padding: 14, marginTop: 12, gap: 10 }}>
              <View style={styles.sectionRow}>
                <Text style={styles.mono}>{active.id}</Text>
                <StatusBadge status={active.status} />
              </View>
              <Text style={{ fontSize: 14.5, fontWeight: '600', color: colors.text }}>
                {active.title}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct(active.status)}%` }]} />
              </View>
              <Text style={{ fontSize: 11.5, color: colors.muted }}>
                {active.cat} · {active.addr}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: colors.slate900,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  cta: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  link: { color: colors.accent600, fontSize: 12.5, fontWeight: '600' },
  nearbyCard: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nearbyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mono: { fontSize: 11.5, color: colors.accent600, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.slate100,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 999 },
});
