// Vətəndaş → Profil. Başlıq, faydalı kontaktlar (API), menyu, çıxış.
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../api/client';
import type { Contact } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import type { CitizenNav } from '../../navigation/types';

const CONTACT_COLORS = ['#1E40AF', '#DC2626', '#0284C7', '#7C3AED', '#B45309', '#047857'];

const MENU: [string, string, string | null][] = [
  ['user-pen', 'Şəxsi məlumatlar', 'Ad, telefon, ünvan'],
  ['message-circle', 'Mesajlarım', '1 yeni'],
  ['bell', 'Bildiriş tənzimləmələri', null],
  ['globe', 'Dil — Azərbaycan', 'AZ / RU / EN'],
  ['shield', 'Məxfilik', null],
];

export function ProfileScreen() {
  const nav = useNavigation<CitizenNav>();
  const { user, logout } = useAuth();
  const name = user?.fullName ?? 'Anar Səfərov';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const sub = user?.userId
    ? `İstifadəçi: ${user.userId} · Nərimanov`
    : '+994 50 xxx xx 24 · Nərimanov';
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    api.contacts().then(setContacts).catch(() => setContacts([]));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{initials}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{name}</Text>
          <Text style={{ fontSize: 12.5, color: colors.slate400 }}>{sub}</Text>
        </View>
      </View>

      {/* Faydalı kontaktlar */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
        <Text style={styles.sectionTitle}>Faydalı kontaktlar</Text>
        <View style={styles.contactGrid}>
          {contacts.map((c, i) => {
            const col = CONTACT_COLORS[i % CONTACT_COLORS.length];
            return (
              <Card key={c.number} style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: col + '1A' }]}>
                  <Icon name="phone" size={17} color={col} />
                </View>
                <View style={{ gap: 1, flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>
                    {c.number}
                  </Text>
                  <Text style={{ fontSize: 10.5, color: colors.muted }} numberOfLines={1}>
                    {c.name}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 }}>
        <Card style={{ overflow: 'hidden' }}>
          {MENU.map((m, i) => (
            <TouchableOpacity
              key={m[1]}
              activeOpacity={0.6}
              onPress={m[0] === 'message-circle' ? () => nav.navigate('Chat', { title: 'Nümayəndə' }) : undefined}
              style={[styles.menuRow, i < MENU.length - 1 ? styles.menuDivider : null]}
            >
              <Icon name={m[0]} size={18} color={colors.slate500} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text }}>{m[1]}</Text>
              {m[2] ? <Text style={{ fontSize: 11.5, color: colors.muted }}>{m[2]}</Text> : null}
              <Icon name="chevron-right" size={16} color={colors.slate300} />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon name="log-out" size={17} color={colors.danger} />
          <Text style={{ color: colors.danger, fontSize: 14.5, fontWeight: '700' }}>Çıxış</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    backgroundColor: colors.slate900,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  contactCard: {
    width: '48%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.slate100 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: 14,
  },
});
