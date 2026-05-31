// Nümayəndə → Profil. Emerald başlıq (inisiallar) + menyu + çıxış.
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { FIELD_DARK, FIELD_LIGHT } from './parts';

const MENU: [string, string, string | null][] = [
  ['user-pen', 'Şəxsi məlumatlar', 'Ad, ID, telefon'],
  ['award', 'Performans göstəriciləri', null],
  ['shield', 'Təhlükəsizlik', null],
];

export function RepProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const name = user?.fullName ?? 'Elçin Hüseynov';
  const initials =
    user?.init ??
    name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>{initials}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{name}</Text>
          <Text style={{ fontSize: 12.5, color: FIELD_LIGHT }}>RİH nümayəndəsi · ID 4471</Text>
        </View>
        <View style={styles.pill}>
          <Text style={{ fontSize: 11.5, color: '#fff' }}>Sahə · Nərimanov rayonu</Text>
        </View>
      </View>

      <View style={{ padding: 18 }}>
        <View style={styles.card}>
          {MENU.map(([icon, label, hint], i) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.7}
              style={[styles.menuRow, i < MENU.length - 1 ? styles.menuDivider : null]}
            >
              <Icon name={icon} size={18} color={colors.slate500} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text }}>{label}</Text>
              {hint ? <Text style={{ fontSize: 11.5, color: colors.muted }}>{hint}</Text> : null}
              <Icon name="chevron-right" size={16} color={colors.slate300} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.8}>
          <Icon name="log-out" size={17} color={colors.danger} />
          <Text style={{ color: colors.danger, fontSize: 14.5, fontWeight: '700' }}>Çıxış</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: FIELD_DARK },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.slate100 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
