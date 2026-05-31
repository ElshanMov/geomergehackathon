// Nümayəndə → Dayanacaq detalı. Yoxlama siyahısı + foto/səs + məcburi qeyd.
// "Tamamla" real API-yə yazır (status=resolved) → kokpit bunu dərhal əks etdirir.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { api } from '../../api/client';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useRepToast } from '../../navigation/repToast';
import type { RepNav, RepStackParamList } from '../../navigation/types';
import { FIELD, PrioTag } from './parts';

export function StopDetailScreen() {
  const nav = useNavigation<RepNav>();
  const { stop } = useRoute<RouteProp<RepStackParamList, 'StopDetail'>>().params;
  const { user } = useAuth();
  const toast = useRepToast();

  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(false);
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [noteBusy, setNoteBusy] = useState(false);

  const toggle = (i: number) => setChecks((s) => ({ ...s, [i]: !s[i] }));

  const complete = async () => {
    if (!note.trim() || busy) return;
    setBusy(true);
    try {
      await api.advanceStatus(stop.id, { status: 'resolved', actor: user?.userId, note: note.trim() });
      toast('Dayanacaq tamamlandı və operatora bildirildi');
      nav.goBack();
    } catch (e) {
      toast('Xəta: ' + (e as Error).message);
      setBusy(false);
    }
  };

  // Statusu dəyişmədən qeyd əlavə et — web drawer timeline-ında dərhal görünür.
  const sendNote = async () => {
    if (!note.trim() || noteBusy) return;
    setNoteBusy(true);
    try {
      await api.advanceStatus(stop.id, { status: stop.status, actor: user?.userId, note: note.trim() });
      toast('Qeyd operatora göndərildi');
      setNote('');
    } catch (e) {
      toast('Xəta: ' + (e as Error).message);
    } finally {
      setNoteBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ gap: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Dayanacaq detalı</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>{stop.id}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <PrioTag p={stop.prio} />
            <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.text, flex: 1 }}>{stop.title}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="map-pin" size={14} color={colors.muted} />
            <Text style={{ fontSize: 12.5, color: colors.muted }}>{stop.addr}</Text>
          </View>
        </View>

        <Text style={styles.section}>
          YOXLAMA SİYAHISI
        </Text>
        <View style={{ gap: 8, marginTop: 10, marginBottom: 16 }}>
          {stop.checklist.map((c, i) => {
            const on = !!checks[i];
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggle(i)}
                activeOpacity={0.7}
                style={[styles.check, { backgroundColor: on ? '#ECFDF5' : colors.surface }]}
              >
                <View style={[styles.box, { borderColor: on ? FIELD : colors.borderStrong, backgroundColor: on ? FIELD : '#fff' }]}>
                  {on ? <Icon name="check" size={12} color="#fff" /> : null}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '500', color: on ? '#065F46' : colors.text, flex: 1 }}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => setPhoto(true)}
            activeOpacity={0.7}
            style={[styles.media, { borderColor: photo ? FIELD : colors.border, backgroundColor: photo ? '#ECFDF5' : colors.surface }]}
          >
            <Icon name="camera" size={20} color={photo ? FIELD : colors.slate500} />
            <Text style={styles.mediaText}>{photo ? 'Foto əlavə olundu' : 'Foto çək'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRec((r) => !r)}
            activeOpacity={0.7}
            style={[styles.media, { borderColor: rec ? FIELD : colors.border, backgroundColor: rec ? '#ECFDF5' : colors.surface }]}
          >
            <Icon name={rec ? 'square' : 'mic'} size={20} color={rec ? colors.danger : colors.slate500} />
            <Text style={styles.mediaText}>{rec ? 'Yazılır… 0:08' : 'Səsli qeyd'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>
          QEYD <Text style={{ color: colors.danger }}>*</Text> (məcburi)
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          placeholder="İcra qeydini yazın…"
          placeholderTextColor={colors.slate400}
          style={styles.textarea}
        />
        <TouchableOpacity
          onPress={sendNote}
          disabled={!note.trim() || noteBusy}
          activeOpacity={0.8}
          style={[styles.noteSend, { opacity: note.trim() && !noteBusy ? 1 : 0.5 }]}
        >
          <Icon name="send" size={15} color={FIELD} />
          <Text style={styles.noteSendText}>{noteBusy ? 'Göndərilir…' : 'Qeydi operatora göndər'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {!note.trim() ? <Text style={styles.warn}>Tamamlamaq üçün qeyd məcburidir</Text> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => nav.goBack()} style={[styles.btn, styles.skip]} activeOpacity={0.8}>
            <Icon name="skip-forward" size={17} color={colors.text2} />
            <Text style={[styles.btnText, { color: colors.text2 }]}>Atla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={complete}
            disabled={!note.trim() || busy}
            style={[styles.btn, { flex: 2, backgroundColor: FIELD, opacity: note.trim() && !busy ? 1 : 0.5 }]}
            activeOpacity={0.9}
          >
            <Icon name="check-check" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Tamamla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  card: {
    padding: 13,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: colors.muted },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  box: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  media: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  mediaText: { fontSize: 11.5, fontWeight: '600', color: colors.text },
  textarea: {
    minHeight: 84,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    fontSize: 13.5,
    color: colors.text,
    textAlignVertical: 'top',
  },
  noteSend: {
    marginTop: 10,
    height: 42,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: FIELD,
  },
  noteSendText: { fontSize: 13, fontWeight: '700', color: FIELD },
  footer: { padding: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
  warn: { fontSize: 11, color: '#B45309', textAlign: 'center' },
  btn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skip: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 14.5, fontWeight: '700' },
});
