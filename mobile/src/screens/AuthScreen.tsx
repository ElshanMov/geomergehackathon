// AuthFlow — parolsuz/username-siz giriş. İki seçim: "Vətəndaş kimi daxil ol"
// və "Nümayəndə kimi daxil ol". API: POST /auth/login (demo hesablar).
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';

export function AuthScreen() {
  const { login } = useAuth();
  const [busy, setBusy] = useState<'citizen' | 'rih' | null>(null);
  const [err, setErr] = useState('');

  const enter = async (role: 'citizen' | 'rih') => {
    if (busy) return;
    setErr('');
    setBusy(role);
    try {
      // Vətəndaş → demo hesab (cit1 · Anar Səfərov); Nümayəndə → işçi ID 4471 (rep1).
      await login({ role: role === 'citizen' ? 'citizen' : '', username: role === 'rih' ? '4471' : '', password: '' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Giriş alınmadı');
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {/* brand */}
        <View style={{ alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <View style={styles.logo}>
            <Icon name="radar" size={32} color="#fff" />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.brand}>Rəqəmsal Nərimanov</Text>
            <Text style={styles.brandSub}>Daxil olmaq üçün seçim edin</Text>
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => enter('citizen')}
            disabled={!!busy}
            style={[styles.bigBtn, { backgroundColor: '#0EA5E9', shadowColor: '#0EA5E9', opacity: busy && busy !== 'citizen' ? 0.5 : 1 }]}
          >
            {busy === 'citizen' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="user" size={22} color="#fff" />
                <Text style={styles.bigBtnText}>Vətəndaş kimi daxil ol</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => enter('rih')}
            disabled={!!busy}
            style={[styles.bigBtn, { backgroundColor: '#10B981', shadowColor: '#10B981', opacity: busy && busy !== 'rih' ? 0.5 : 1 }]}
          >
            {busy === 'rih' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="shield" size={22} color="#fff" />
                <Text style={styles.bigBtnText}>Nümayəndə kimi daxil ol</Text>
              </>
            )}
          </TouchableOpacity>

          {err ? (
            <View style={styles.errRow}>
              <Icon name="circle-alert" size={14} color="#FCA5A5" />
              <Text style={{ color: '#FCA5A5', fontSize: 12, flex: 1 }}>{err}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Icon name="shield-check" size={12} color="#46566c" />
        <Text style={{ color: '#46566c', fontSize: 10.5 }}>
          Nərimanov RİH · Rəqəmsal geokoordinasiya platforması
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  brand: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  brandSub: { fontSize: 13, color: '#7A8AA0' },
  bigBtn: {
    height: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  bigBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
});
